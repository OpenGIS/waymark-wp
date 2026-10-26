// Pace guard for narration takes.
//
// Providers do not guarantee a consistent speaking pace. Deepgram in particular
// can return noticeably different deliveries for the same text and voice. The
// guard measures the audible speech after normalisation and, when a take falls
// outside the acceptable band, asks the provider for another take.
//
// The defaults live here so the guard, the cache key and the documentation all
// share one source of truth. They can be overridden per run with environment
// variables, which keeps a different delivery possible without editing code.
"use strict";

import { measureSpeechDuration } from "./shared.mjs";

export const PACE_DEFAULTS = Object.freeze({
  targetWpm: 165,
  bandWpm: 20,
  maxAttempts: 3,
});

// Bumped whenever the retry strategy changes, so cached takes made by an older
// guard are regenerated rather than reused.
export const PACE_GUARD_VERSION = 1;

const MIN_REQUEST_RATE = 80;
const MAX_REQUEST_RATE = 300;

const ENV_TARGET = "VIDEO_TTS_TARGET_WPM";
const ENV_BAND = "VIDEO_TTS_PACE_BAND_WPM";
const ENV_ATTEMPTS = "VIDEO_TTS_MAX_ATTEMPTS";

/**
 * Read a positive numeric environment override.
 *
 * @param {object} env
 * @param {string} name
 * @param {number} fallback
 * @returns {number}
 */
function numberFromEnv(env, name, fallback) {
  const raw = (env[name] ?? "").trim();
  if (raw === "") {
    return fallback;
  }

  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${name} must be a positive number, got "${raw}".`);
  }

  return value;
}

/**
 * Resolve the guard settings from the environment.
 *
 * @param {object} [env]
 * @returns {{ targetWpm: number, bandWpm: number, maxAttempts: number }}
 */
export function resolvePaceOptions(env = process.env) {
  const targetWpm = numberFromEnv(env, ENV_TARGET, PACE_DEFAULTS.targetWpm);
  const bandWpm = numberFromEnv(env, ENV_BAND, PACE_DEFAULTS.bandWpm);
  const rawAttempts = numberFromEnv(
    env,
    ENV_ATTEMPTS,
    PACE_DEFAULTS.maxAttempts,
  );

  if (!Number.isInteger(rawAttempts) || rawAttempts < 1) {
    throw new Error(
      `${ENV_ATTEMPTS} must be a whole number of at least 1, got ` +
        `"${env[ENV_ATTEMPTS].trim()}".`,
    );
  }

  return { targetWpm, bandWpm, maxAttempts: rawAttempts };
}

/**
 * The lowest and highest acceptable pace for a set of guard settings.
 *
 * @param {{ targetWpm: number, bandWpm: number }} pace
 * @returns {{ minWpm: number, maxWpm: number }}
 */
export function paceBand({ targetWpm, bandWpm }) {
  return { minWpm: targetWpm - bandWpm, maxWpm: targetWpm + bandWpm };
}

/**
 * Count the words in a narration line. Punctuation stays attached, so a
 * contraction or a hyphenated compound counts once, matching how it is spoken.
 *
 * @param {string} text
 * @returns {number}
 */
export function countWords(text) {
  return (text.match(/\S+/g) ?? []).length;
}

/**
 * Measure a normalised WAV's speech duration and pace. The deliberate lead and
 * tail pads are silent, so the audible bounds exclude them.
 *
 * @param {string} filePath
 * @param {string} text
 * @returns {{ speechSeconds: number, wordCount: number, wpm: number }}
 */
export function measurePace(filePath, text) {
  const speechSeconds = measureSpeechDuration(filePath);
  const wordCount = countWords(text);

  if (!(speechSeconds > 0) || wordCount === 0) {
    throw new Error(
      `Cannot measure a pace from ${filePath}: no audible speech.`,
    );
  }

  return {
    speechSeconds,
    wordCount,
    wpm: (wordCount / speechSeconds) * 60,
  };
}

/**
 * True when a take's pace sits inside the acceptable band, inclusive.
 *
 * @param {number} wpm
 * @param {{ targetWpm: number, bandWpm: number }} pace
 * @returns {boolean}
 */
export function isInPaceBand(wpm, pace) {
  const { minWpm, maxWpm } = paceBand(pace);
  return wpm >= minWpm && wpm <= maxWpm;
}

/**
 * Pick the take whose pace is closest to the target. Ties keep the earlier
 * attempt, which avoids replacing a take for no measurable gain.
 *
 * @template T
 * @param {T[]} takes
 * @param {(take: T) => number} paceOf
 * @param {number} targetWpm
 * @returns {T}
 */
export function closestPace(takes, paceOf, targetWpm) {
  return takes.reduce((best, take) => {
    const distance = Math.abs(paceOf(take) - targetWpm);
    const bestDistance = Math.abs(paceOf(best) - targetWpm);
    return distance < bestDistance ? take : best;
  });
}

/**
 * Round a pace for logs and the timings file.
 *
 * @param {number} wpm
 * @returns {number}
 */
export function roundWpm(wpm) {
  return Math.round(wpm);
}

/**
 * Estimate the provider request rate that would land on the target pace. The
 * next attempt asks the provider to speak natively at that rate; the audio is
 * never resampled or time-stretched.
 *
 * The adjustment uses the square root of the ratio rather than the full ratio.
 * Provider speed quantisation and natural delivery vary, so a full correction
 * can overshoot by a wide margin on a short line. Damping keeps each retry
 * closer to the previous take while still moving in the right direction.
 *
 * @param {number} currentRate
 * @param {number} measuredWpm
 * @param {number} targetWpm
 * @returns {number}
 */
export function nextRequestRate(currentRate, measuredWpm, targetWpm) {
  if (!(measuredWpm > 0)) {
    return currentRate;
  }

  const estimate = currentRate * Math.sqrt(targetWpm / measuredWpm);
  return Math.min(
    MAX_REQUEST_RATE,
    Math.max(MIN_REQUEST_RATE, Math.round(estimate)),
  );
}

/**
 * Format the acceptable band for a warning line.
 *
 * @param {{ targetWpm: number, bandWpm: number }} pace
 * @returns {string}
 */
export function describeBand(pace) {
  const { minWpm, maxWpm } = paceBand(pace);
  return `${roundWpm(minWpm)}–${roundWpm(maxWpm)} wpm`;
}
