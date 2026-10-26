// Deepgram Flux TTS narration provider.
//
// One batch request per scene on /v2/speak returns a complete 48 kHz mono
// 16-bit PCM WAV. The response is written straight to a temporary file and
// then passed through the same loudnorm step as the say provider.
"use strict";

import fs from "node:fs";
import path from "node:path";

import {
  characterCount,
  isRiffWave,
  missingExecutables,
  normaliseWav,
  oneLine,
  probeDuration,
} from "../shared.mjs";

const MAX_TEXT_LENGTH = 2000;
const REQUEST_TIMEOUT_MS = 30_000;
const MAX_ATTEMPTS = 3;
const BASE_DELAY_MS = 500;
const MAX_RETRY_AFTER_MS = 60_000;
const SAMPLE_RATE = 48_000;
const BASELINE_WPM = 175;
const MIN_SPEED = 0.5;
const MAX_SPEED = 1.5;
const SPEED_STEP = 0.05;

const REGION_URLS = {
  eu: "https://api.eu.deepgram.com",
  au: "https://api.au.deepgram.com",
  in: "https://api.in.deepgram.com",
};

const RETRYABLE_STATUSES = new Set([408, 429, 500, 502, 503, 504]);
const FATAL_STATUSES = new Set([400, 401, 402, 403, 413, 415]);
const REQUIRED_TOOLS = ["ffmpeg", "ffprobe"];

/**
 * Resolve the API base URL from the full override or the regional one.
 *
 * @param {object} env
 * @returns {string}
 */
function apiBaseUrl(env) {
  const override = (env.DEEPGRAM_BASE_URL ?? "").trim();
  if (override) {
    return override.replace(/\/+$/, "");
  }

  const region = (env.DEEPGRAM_REGION ?? "").trim().toLowerCase();
  if (region === "") {
    return "https://api.deepgram.com";
  }

  const baseUrl = REGION_URLS[region];
  if (!baseUrl) {
    throw new Error(
      `Unsupported DEEPGRAM_REGION "${region}"; expected eu, au, in or unset.`,
    );
  }

  return baseUrl;
}

/**
 * Convert the shared words-per-minute rate to Deepgram's speed multiplier.
 *
 * The mapping is linear around the 175 wpm narration baseline:
 * `speed = rate / 175`, clamped to 0.5-1.5 and rounded to the nearest 0.05
 * because Deepgram accepts that granularity. 175 wpm therefore maps to 1.0.
 *
 * @param {number} rate
 * @returns {number}
 */
export function rateToSpeed(rate) {
  const raw = Number(rate) / BASELINE_WPM;
  const clamped = Math.min(MAX_SPEED, Math.max(MIN_SPEED, raw));
  const stepped = Math.round(clamped / SPEED_STEP) * SPEED_STEP;
  return Number(stepped.toFixed(2));
}

/**
 * @param {object} env
 * @returns {string | null}
 */
function unavailableReason(env) {
  if (!(env.DEEPGRAM_API_KEY ?? "").trim()) {
    return "DEEPGRAM_API_KEY is not set";
  }

  try {
    apiBaseUrl(env);
  } catch (error) {
    return oneLine(error.message);
  }

  const missing = missingExecutables(REQUIRED_TOOLS);
  if (missing.length) {
    return `missing required executable(s): ${missing.join(", ")}`;
  }

  return null;
}

/**
 * @param {number} attempt 1-based attempt number
 * @returns {number}
 */
function backoffMs(attempt) {
  const base = BASE_DELAY_MS * 2 ** (attempt - 1);
  return Math.round(base * (0.75 + Math.random() * 0.5));
}

/**
 * Parse a Retry-After header in seconds or HTTP-date form.
 *
 * @param {string | null} value
 * @returns {number | null}
 */
function retryAfterMs(value) {
  if (!value) {
    return null;
  }

  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) {
    return Math.min(seconds * 1000, MAX_RETRY_AFTER_MS);
  }

  const date = Date.parse(value);
  if (Number.isFinite(date)) {
    return Math.min(Math.max(0, date - Date.now()), MAX_RETRY_AFTER_MS);
  }

  return null;
}

/**
 * @param {number} ms
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * Describe a network-level failure without dumping a stack.
 *
 * @param {unknown} error
 * @returns {string}
 */
function networkError(error) {
  const name = error?.name;
  if (name === "TimeoutError" || name === "AbortError") {
    return `request timed out after ${REQUEST_TIMEOUT_MS / 1000} seconds`;
  }

  const cause = error?.cause?.code ?? error?.cause?.message;
  const message = oneLine(error?.message ?? error);
  return cause ? `${message} (${oneLine(cause)})` : message;
}

/**
 * Turn any error body shape into one readable line.
 *
 * Known shapes: legacy `{ err_code, err_msg, request_id }`, modern
 * `{ category, message, details, request_id }`, or plain text.
 *
 * @param {Response} response
 * @returns {Promise<string>}
 */
async function describeResponseError(response) {
  const raw = await response.text().catch(() => "");
  let payload = null;

  try {
    payload = raw ? JSON.parse(raw) : null;
  } catch {
    payload = null;
  }

  const parts = [];
  const seen = new Set();
  const add = (value) => {
    const text = oneLine(value);
    if (text && !seen.has(text)) {
      seen.add(text);
      parts.push(text);
    }
  };

  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    add(payload.err_code);
    add(payload.err_msg);
    add(payload.category);
    add(payload.message);
    if (payload.details !== undefined) {
      add(
        typeof payload.details === "string"
          ? payload.details
          : JSON.stringify(payload.details),
      );
    }
    if (payload.error !== undefined && typeof payload.error !== "object") {
      add(payload.error);
    }
    if (payload.request_id !== undefined) {
      add(`(request_id ${payload.request_id})`);
    }
  } else {
    add(raw);
  }

  if (!parts.length) {
    add(response.statusText || "request failed");
  }

  const hint =
    response.status === 402
      ? " — add credits at https://console.deepgram.com"
      : "";

  return `HTTP ${response.status}: ${parts.join(": ")}${hint}`;
}

/**
 * Log the Deepgram model and request identifiers at verbose level.
 *
 * @param {Response} response
 * @param {boolean} verbose
 * @param {(message: string) => void} log
 */
function logHeaders(response, verbose, log) {
  if (!verbose) {
    return;
  }

  const model = response.headers.get("dg-model-name");
  const requestId = response.headers.get("dg-request-id");

  if (model || requestId) {
    log(
      `[video] TTS deepgram: model=${model ?? "unknown"} ` +
        `request-id=${requestId ?? "unknown"}.`,
    );
  }
}

export default {
  id: "deepgram",
  label: "Deepgram",
  defaultVoice: "flux-kit-en",

  /**
   * @param {object} env
   * @returns {boolean}
   */
  isAvailable(env) {
    return unavailableReason(env) === null;
  },

  unavailableReason,

  /**
   * @param {string} voice
   * @returns {string}
   */
  describeVoice(voice) {
    return voice;
  },

  /**
   * @param {number} rate
   * @returns {number}
   */
  speedForRate(rate) {
    return rateToSpeed(rate);
  },

  /**
   * Provider-specific metadata recorded beside the take.
   *
   * @param {{ voice: string, rate: number }} options
   * @returns {{ model: string, speed: number }}
   */
  timingMetadata({ voice, rate }) {
    return { model: voice, speed: rateToSpeed(rate) };
  },

  /**
   * Request one scene from Deepgram and return the normalised WAV duration.
   *
   * @param {{ text: string, voice: string, rate: number, outPath: string, env: object, sceneId?: string, verbose?: boolean, log?: (message: string) => void }} options
   * @returns {Promise<{ voice: string, model: string, speed: number, duration: number }>}
   */
  async synthesise({
    text,
    voice,
    rate,
    outPath,
    env,
    sceneId,
    verbose = false,
    log = () => {},
  }) {
    if (typeof text !== "string" || text.trim() === "") {
      throw new Error("Deepgram synthesis requires non-empty text.");
    }

    const characters = characterCount(text);
    if (characters > MAX_TEXT_LENGTH) {
      throw new Error(
        `Scene "${sceneId ?? "unknown"}": narration is ${characters} ` +
          `characters; Deepgram accepts at most 2,000.`,
      );
    }

    const apiKey = (env.DEEPGRAM_API_KEY ?? "").trim();
    if (!apiKey) {
      throw new Error("Deepgram cannot synthesise without DEEPGRAM_API_KEY.");
    }

    const baseUrl = apiBaseUrl(env);
    const speed = rateToSpeed(rate);
    const url = new URL(`${baseUrl}/v2/speak`);
    url.searchParams.set("model", voice);
    url.searchParams.set("encoding", "linear16");
    url.searchParams.set("sample_rate", String(SAMPLE_RATE));
    url.searchParams.set("container", "wav");
    url.searchParams.set("speed", String(speed));

    let lastError = null;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
      let response;

      try {
        response = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Token ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text }),
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        });
      } catch (error) {
        lastError = new Error(
          `Deepgram request failed: ${networkError(error)}.`,
        );
        if (attempt < MAX_ATTEMPTS) {
          const delay = backoffMs(attempt);
          if (verbose) {
            log(
              `[video] TTS deepgram: ${oneLine(lastError.message)} ` +
                `Retrying in ${delay} ms (attempt ${attempt + 1}/${MAX_ATTEMPTS}).`,
            );
          }
          await sleep(delay);
          continue;
        }
        throw lastError;
      }

      logHeaders(response, verbose, log);

      if (response.ok) {
        const buffer = Buffer.from(await response.arrayBuffer());

        if (!isRiffWave(buffer)) {
          throw new Error(
            `Deepgram returned ${buffer.length} bytes without a RIFF/WAVE header.`,
          );
        }

        const parsed = path.parse(outPath);
        const sourcePath = path.join(
          parsed.dir,
          `${parsed.name}.deepgram.source.wav`,
        );
        fs.mkdirSync(parsed.dir, { recursive: true });
        fs.writeFileSync(sourcePath, buffer);

        try {
          normaliseWav(sourcePath, outPath, { verbose, log, sceneId });
        } finally {
          fs.rmSync(sourcePath, { force: true });
        }

        return {
          voice,
          model: voice,
          speed,
          duration: probeDuration(outPath),
        };
      }

      const detail = await describeResponseError(response);
      const retryable =
        RETRYABLE_STATUSES.has(response.status) &&
        !FATAL_STATUSES.has(response.status);

      if (retryable && attempt < MAX_ATTEMPTS) {
        const delay =
          retryAfterMs(response.headers.get("retry-after")) ??
          backoffMs(attempt);
        if (verbose) {
          log(
            `[video] TTS deepgram: ${detail}. Retrying in ${delay} ms ` +
              `(attempt ${attempt + 1}/${MAX_ATTEMPTS}).`,
          );
        }
        await sleep(delay);
        continue;
      }

      throw new Error(detail);
    }

    throw lastError ?? new Error("Deepgram request failed.");
  },
};
