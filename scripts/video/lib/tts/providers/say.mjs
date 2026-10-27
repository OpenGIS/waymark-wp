// macOS `say` narration provider.
//
// `say` writes an AIFF take at the requested words per minute. `afconvert`
// downsamples it to 48 kHz mono, then the shared normaliser applies loudnorm.
// It has no aligned transcript, so it is a per-line provider only.
"use strict";

import fs from "node:fs";
import path from "node:path";

import {
  missingExecutables,
  normaliseWav,
  oneLine,
  probeDuration,
  run,
} from "../shared.mjs";

const DEFAULT_VOICE = "Daniel";
const MAX_SUGGESTIONS = 4;
const REQUIRED_TOOLS = ["say", "afconvert", "ffmpeg", "ffprobe"];
const VOICE_PATTERN = /^(.+?)\s+[a-z]{2}[_-][A-Za-z0-9]+\s+#/;

let voiceCache = null;

/**
 * Read the installed say voices and their locales.
 *
 * @returns {Map<string, string>}
 */
function listVoices() {
  if (voiceCache) {
    return voiceCache;
  }

  const output = run("say", ["-v", "?"]);
  const voices = new Map();

  for (const line of output.split(/\r?\n/)) {
    const match = VOICE_PATTERN.exec(line);
    if (!match) {
      continue;
    }

    const localeMatch = /\s([a-z]{2}[_-][A-Za-z0-9]+)\s+#/.exec(line);
    voices.set(match[1].trim(), localeMatch?.[1] ?? null);
  }

  voiceCache = voices;
  return voices;
}

/**
 * Build a compact, actionable message for a voice that is not installed.
 * It names the missing voice, the default and a handful of English voices
 * rather than dumping the entire macOS catalogue.
 *
 * @param {string} voice
 * @returns {string}
 */
function describeInvalidVoice(voice) {
  const name = oneLine(voice);
  let voices;

  try {
    voices = listVoices();
  } catch {
    voices = new Map();
  }

  const candidates = [];
  const add = (candidate) => {
    if (
      !candidate ||
      candidate === name ||
      candidates.some((entry) => entry.name === candidate)
    ) {
      return;
    }

    candidates.push({ name: candidate, locale: voices.get(candidate) ?? null });
  };

  if (voices.size === 0 || voices.has(DEFAULT_VOICE)) {
    add(DEFAULT_VOICE);
  }

  const english = [...voices.entries()]
    .filter(([, locale]) => /^en[_-](GB|US)$/i.test(locale ?? ""))
    .map(([candidate, locale]) => ({
      name: candidate,
      gb: /^en[_-]GB$/i.test(locale ?? ""),
    }))
    .sort((left, right) => Number(right.gb) - Number(left.gb));

  for (const entry of english) {
    if (candidates.length >= MAX_SUGGESTIONS) {
      break;
    }
    add(entry.name);
  }

  const options = candidates
    .slice(0, MAX_SUGGESTIONS)
    .map(({ name: candidate, locale }) =>
      locale
        ? `"${candidate}" (${locale.replace("_", "-")})`
        : `"${candidate}"`,
    )
    .join(", ");

  return (
    `Voice "${name}" is not installed for say. ` +
    (options ? `Use ${options}.` : "Use an installed English voice.")
  );
}

/**
 * @param {object} env
 * @returns {string | null}
 */
function unavailableReason(env) {
  if (process.platform !== "darwin") {
    return "macOS say is only available on macOS";
  }

  const missing = missingExecutables(REQUIRED_TOOLS);
  if (missing.length) {
    return `missing required executable(s): ${missing.join(", ")}`;
  }

  return null;
}

export default {
  id: "say",
  label: "macOS say",
  defaultVoice: DEFAULT_VOICE,
  supportsContinuous: false,

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
   * @returns {boolean}
   */
  hasVoice(voice) {
    try {
      return listVoices().has(voice);
    } catch {
      // The catalogue could not be read; let synthesis report the real error.
      return true;
    }
  },

  /**
   * @param {string} voice
   * @returns {string}
   */
  describeInvalidVoice,

  /**
   * @param {string} voice
   * @returns {string}
   */
  describeVoice(voice) {
    try {
      const locale = listVoices().get(voice);
      return locale ? `${voice}, ${locale.replace("_", "-")}` : voice;
    } catch {
      return voice;
    }
  },

  /**
   * `say` takes whole words per minute, so a ladder rate is rounded before it
   * is requested or recorded.
   *
   * @param {number} rate
   * @returns {number}
   */
  clampRate(rate) {
    return Math.round(rate);
  },

  /**
   * Synthesise one line with the macOS voice and keep the raw AIFF take.
   *
   * An explicit `--voice` is strict. Any other source may retry once with the
   * default if the named voice disappears, and says so in one line.
   *
   * @param {{ text: string, voice: string, rate: number, outPath: string, sceneId?: string, verbose?: boolean, allowVoiceSubstitution?: boolean, log?: (message: string) => void }} options
   * @returns {{ voice: string, rate: number, duration: number }}
   */
  synthesise({
    text,
    voice,
    rate,
    outPath,
    sceneId,
    verbose = false,
    allowVoiceSubstitution = true,
    log = () => {},
  }) {
    if (typeof text !== "string" || text.trim() === "") {
      throw new Error("say synthesis requires non-empty text.");
    }

    const voices = listVoices();
    let usedVoice = voice;

    if (!voices.has(usedVoice)) {
      if (!allowVoiceSubstitution) {
        throw new Error(describeInvalidVoice(voice));
      }

      if (!voices.has(DEFAULT_VOICE)) {
        throw new Error(
          `${describeInvalidVoice(voice)} The default ` +
            `"${DEFAULT_VOICE}" is not installed either.`,
        );
      }

      log(
        `[video] TTS say: voice "${oneLine(voice)}" is not installed; ` +
          `using "${DEFAULT_VOICE}" instead.`,
      );
      usedVoice = DEFAULT_VOICE;
    }

    const parsed = path.parse(outPath);
    const aiffPath = path.join(parsed.dir, `${parsed.name}.aiff`);
    const sourcePath = path.join(parsed.dir, `${parsed.name}.source.wav`);

    fs.mkdirSync(parsed.dir, { recursive: true });

    run("say", [
      "-v",
      usedVoice,
      "-r",
      String(rate),
      "-o",
      aiffPath,
      "--",
      text,
    ]);
    run("afconvert", [
      "-f",
      "WAVE",
      "-d",
      "LEI16@48000",
      "-c",
      "1",
      aiffPath,
      sourcePath,
    ]);

    try {
      normaliseWav(sourcePath, outPath, { verbose, log, sceneId });
    } finally {
      fs.rmSync(sourcePath, { force: true });
    }

    return { voice: usedVoice, rate, duration: probeDuration(outPath) };
  },
};
