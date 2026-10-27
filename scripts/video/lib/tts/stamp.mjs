// Narration stamp shared by the TTS step and the recorder.
//
// The stamp is written only after a run has produced valid audio and timings.
// The recorder reads it before a take and refuses to record when the narration,
// lexicon, provider/voice or timing data no longer match the generated audio.
"use strict";

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { availability, resolveCandidates, resolveVoice } from "./index.mjs";
import { DEFAULT_LEXICON_PATH } from "./pronounce.mjs";
import { PRONUNCIATION_VERSION } from "./pronunciation-plan.mjs";

export const STAMP_VERSION = 1;
export const STAMP_FILENAME = "stamp.json";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, "..", "..", "..", "..");

/**
 * @param {Buffer | string} value
 * @returns {string}
 */
export function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

/**
 * @param {string} filePath
 * @returns {string}
 */
export function hashFile(filePath) {
  return sha256(fs.readFileSync(filePath));
}

/**
 * @param {unknown} value
 * @returns {string}
 */
export function hashJson(value) {
  return sha256(JSON.stringify(value));
}

/**
 * Canonical hash of the spoken text, independent of narration-file formatting.
 *
 * @param {Array<{ id: string, narration: string }>} narrated
 * @returns {string}
 */
export function narrationTextHash(narrated) {
  return hashJson(narrated.map(({ id, narration }) => [id, narration]));
}

/**
 * Resolve the lexicon path with the same precedence as `tts.mjs`.
 *
 * @param {{ flag?: string | null, env?: object }} [options]
 * @returns {string}
 */
export function resolveLexiconPath({ flag = null, env = process.env } = {}) {
  const override = (flag ?? env.VIDEO_TTS_LEXICON ?? "").trim();
  return override
    ? path.resolve(process.cwd(), override)
    : DEFAULT_LEXICON_PATH;
}

/**
 * Resolve the provider and voice a fresh TTS run would use now.
 *
 * @param {{ env?: object }} [options]
 * @returns {{ providerId: string, voice: string }}
 */
export function resolveNarrationIdentity({ env = process.env } = {}) {
  const { candidates } = resolveCandidates({ flag: null, env });
  const available = candidates.find(
    (provider) => availability(provider, env).available,
  );

  if (!available) {
    const provider = candidates[0];
    const envVoice = (env.VIDEO_TTS_VOICE ?? "").trim();
    return {
      providerId: provider.id,
      voice: envVoice || provider.defaultVoice,
    };
  }

  const { voice } = resolveVoice(available, { flagVoice: null, env });
  return { providerId: available.id, voice };
}

/**
 * Build the stamp for a successful run.
 *
 * @param {{ scenarioId: string, provider: object, voice: string, rate: number, pace: object, mode: string, narrationPath: string | null, narrated: object[], lexiconPath: string, lexiconHash: string, timings: object }} options
 * @returns {object}
 */
export function buildStamp({
  scenarioId,
  provider,
  voice,
  rate,
  pace,
  mode,
  narrationPath,
  narrated,
  lexiconPath,
  lexiconHash,
  timings,
}) {
  const speed =
    typeof provider.speedForRate === "function"
      ? provider.speedForRate(rate)
      : null;

  return {
    version: STAMP_VERSION,
    scenarioId,
    generatedAt: new Date().toISOString(),
    provider: provider.id,
    voice,
    rate,
    speed,
    pace,
    mode,
    pronunciationPlanVersion: PRONUNCIATION_VERSION,
    narration: {
      file: narrationPath ? displayPath(narrationPath) : null,
      fileHash: narrationPath ? hashFile(narrationPath) : null,
      textHash: narrationTextHash(narrated),
    },
    lexicon: {
      path: displayPath(lexiconPath),
      hash: lexiconHash,
    },
    scenes: (timings.scenes ?? []).map(({ id, duration }) => ({
      id,
      duration,
    })),
    timingsHash: hashJson(timings),
  };
}

/**
 * Write a value as JSON through a temporary file and rename.
 *
 * @param {string} filePath
 * @param {unknown} value
 */
export function writeJsonAtomic(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const temporaryPath = `${filePath}.tmp-${process.pid}-${Date.now()}`;

  try {
    fs.writeFileSync(
      temporaryPath,
      `${JSON.stringify(value, null, 2)}\n`,
      "utf8",
    );
    fs.renameSync(temporaryPath, filePath);
  } catch (error) {
    fs.rmSync(temporaryPath, { force: true });
    throw error;
  }
}

/**
 * @param {string} audioDir
 * @param {object} stamp
 */
export function writeStamp(audioDir, stamp) {
  writeJsonAtomic(path.join(audioDir, STAMP_FILENAME), stamp);
}

/**
 * Refuse a take whose narration audio no longer matches its inputs.
 *
 * @param {{ audioDir: string, scenarioId: string, narrated: object[], narrationPath: string | null, lexiconPath: string, identity: { providerId: string, voice: string }, timings: object | null }} options
 * @returns {object} the validated stamp
 */
export function assertFreshStamp({
  audioDir,
  scenarioId,
  narrated,
  narrationPath,
  lexiconPath,
  identity,
  timings,
}) {
  const stampPath = path.join(audioDir, STAMP_FILENAME);
  const where = displayPath(stampPath);
  let stamp;

  try {
    stamp = JSON.parse(fs.readFileSync(stampPath, "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT") {
      throw staleError(scenarioId, `there is no narration stamp at ${where}`);
    }
    throw staleError(
      scenarioId,
      `the narration stamp at ${where} is not valid JSON`,
    );
  }

  if (!stamp || typeof stamp !== "object" || Array.isArray(stamp)) {
    throw staleError(
      scenarioId,
      `the narration stamp at ${where} is malformed`,
    );
  }

  if (stamp.version !== STAMP_VERSION) {
    throw staleError(
      scenarioId,
      "the narration stamp was written by an older pipeline",
    );
  }

  if (stamp.scenarioId !== scenarioId) {
    throw staleError(
      scenarioId,
      `the narration stamp belongs to "${stamp.scenarioId}"`,
    );
  }

  if (stamp.narration?.textHash !== narrationTextHash(narrated)) {
    throw staleError(
      scenarioId,
      "the narration text changed since it was generated",
    );
  }

  const narrationFileHash = narrationPath ? hashFile(narrationPath) : null;

  if ((stamp.narration?.fileHash ?? null) !== narrationFileHash) {
    throw staleError(
      scenarioId,
      "the narration file changed since it was generated",
    );
  }

  let lexiconHash;
  try {
    lexiconHash = hashFile(lexiconPath);
  } catch {
    throw staleError(
      scenarioId,
      `the lexicon is missing at ${displayPath(lexiconPath)}`,
    );
  }

  if (stamp.lexicon?.hash !== lexiconHash) {
    throw staleError(scenarioId, "the lexicon changed since it was generated");
  }

  if (
    stamp.provider !== identity.providerId ||
    stamp.voice !== identity.voice
  ) {
    throw staleError(
      scenarioId,
      "the provider/voice changed since it was generated " +
        `(stamp ${stamp.provider}/${stamp.voice}, current ` +
        `${identity.providerId}/${identity.voice})`,
    );
  }

  if (!timings) {
    throw staleError(scenarioId, "the timing data is missing");
  }

  if (stamp.timingsHash !== hashJson(timings)) {
    throw staleError(scenarioId, "the timing data no longer matches the stamp");
  }

  return stamp;
}

/**
 * @param {string} scenarioId
 * @param {string} detail
 * @returns {Error}
 */
function staleError(scenarioId, detail) {
  const error = new Error(
    `Narration audio is stale: ${detail}. ` +
      `Run "npm run video:tts -- ${scenarioId}" first.`,
  );
  error.isStaleAudio = true;
  return error;
}

/**
 * @param {string} filePath
 * @returns {string}
 */
function displayPath(filePath) {
  return path.relative(REPO_ROOT, filePath).split(path.sep).join("/");
}
