// Pace guard for narration takes.
//
// Providers do not guarantee a consistent speaking pace. Deepgram in particular
// can return noticeably different deliveries for the same text and voice. The
// guard measures the audible speech after normalisation and, when a take falls
// outside the acceptable band, asks the provider for another take.
//
// The retry ladder deliberately re-rolls at the same rate before it nudges the
// rate. A fresh generation is nondeterministic, so it can land in band without
// any change in voice register. Rate changes are a last resort because they
// alter the delivery: the film should sound like one narrator throughout.
//
// The defaults live here so the guard, the cache key and the documentation all
// share one source of truth. They can be overridden per run with environment
// variables, which keeps a different delivery possible without editing code.
"use strict";

import { measureSpeechDuration } from "./shared.mjs";

export const PACE_DEFAULTS = Object.freeze({
  targetWpm: 165,
  bandWpm: 10,
  maxAttempts: 4,
});

// Bumped whenever the retry strategy changes, so cached takes made by an older
// guard are regenerated rather than reused.
export const PACE_GUARD_VERSION = 2;

// Continuous performances are one take for the whole film, so there is no
// per-scene re-roll. Retries estimate the provider's measured response instead
// of stepping a fixed ladder: the first retry is proportional, later retries
// use a secant through the samples that bracket the target. Four whole takes is
// the ceiling.
export const CONTINUOUS_PACE_VERSION = 2;
export const CONTINUOUS_MAX_ATTEMPTS = 4;

// A secant whose two samples differ by less than this is flat enough that the
// slope is noise; step the last requested rate by 5% instead.
const SECANT_MIN_DELTA_WPM = 0.5;
const SECANT_FALLBACK_STEP = 0.05;

// Fixed ladder relative to the provider's default rate R. The first two
// attempts are identical on purpose (a re-roll), then the rate moves 10% and
// finally 15% in one direction. Repeating the last rung keeps a larger
// configured attempt count well-defined.
const SLOWER_MULTIPLIERS = [1, 1, 0.9, 0.85];
const FASTER_MULTIPLIERS = [1, 1, 1.1, 1.15];

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
 * Which way the first rate nudge should move. A take that is too fast needs a
 * slower request; a take that is too slow needs a faster one.
 *
 * @param {number} measuredWpm
 * @param {number} targetWpm
 * @returns {"slower" | "faster"}
 */
export function paceDirection(measuredWpm, targetWpm) {
  return measuredWpm > targetWpm ? "slower" : "faster";
}

/**
 * The requested rate for an attempt, relative to the run's default rate.
 * Attempts 1 and 2 both use the default rate so the provider can re-roll
 * without a register change. Attempts 3 and 4 step 10% then 15% in the chosen
 * direction. Attempts beyond the ladder repeat its last rung.
 *
 * @param {number} baseRate The provider's default rate for this run (R).
 * @param {number} attempt 1-based attempt number.
 * @param {"slower" | "faster" | null} direction Only required from attempt 3.
 * @returns {number}
 */
export function ladderRate(baseRate, attempt, direction = null) {
  const multipliers =
    direction === "faster" ? FASTER_MULTIPLIERS : SLOWER_MULTIPLIERS;
  const index = Math.min(Math.max(attempt, 1), multipliers.length) - 1;
  return baseRate * multipliers[index];
}

/**
 * The next requested rate for a whole-performance take, estimated from the
 * takes already sampled. An empty history returns the run rate R; one sample
 * gives the first-order estimate `rate × target / measured`; two or more
 * samples give a secant through the pair that brackets the target, or through
 * the two nearest samples when the target lies outside the sampled range. A
 * nearly flat pair or a repeated rate falls back to a 5% step in the needed
 * direction. The result is unclamped; the caller runs it through the
 * provider's clamp before requesting and recording it.
 *
 * @param {{ baseRate: number, targetWpm: number, samples: Array<{ rate: number, wpm: number }> }} options
 * @returns {number}
 */
export function continuousEstimateRate({ baseRate, targetWpm, samples }) {
  const usable = (samples ?? []).filter(
    (sample) =>
      Number.isFinite(sample.rate) &&
      sample.rate > 0 &&
      Number.isFinite(sample.wpm) &&
      sample.wpm > 0,
  );

  if (usable.length === 0) {
    return baseRate;
  }

  if (usable.length === 1) {
    const [sample] = usable;
    return sample.rate * (targetWpm / sample.wpm);
  }

  const sorted = [...usable].sort(
    (left, right) => left.wpm - right.wpm || left.rate - right.rate,
  );
  const [lower, upper] = secantPair(sorted, targetWpm);
  const denominator = upper.wpm - lower.wpm;

  if (Math.abs(denominator) < SECANT_MIN_DELTA_WPM) {
    return stepFromLatest(usable, targetWpm);
  }

  const estimate =
    lower.rate +
    ((targetWpm - lower.wpm) * (upper.rate - lower.rate)) / denominator;

  if (
    !Number.isFinite(estimate) ||
    estimate <= 0 ||
    usable.some((sample) => Math.abs(sample.rate - estimate) < 0.5)
  ) {
    return stepFromLatest(usable, targetWpm);
  }

  return estimate;
}

/**
 * The two samples used for the secant: the adjacent pair that brackets the
 * target pace, otherwise the two nearest samples on the target's side of the
 * sampled range.
 *
 * @param {Array<{ rate: number, wpm: number }>} sorted Samples sorted by wpm.
 * @param {number} targetWpm
 * @returns {[{ rate: number, wpm: number }, { rate: number, wpm: number }]}
 */
function secantPair(sorted, targetWpm) {
  if (sorted.length <= 2) {
    return [sorted[0], sorted[1]];
  }

  for (let index = 0; index < sorted.length - 1; index += 1) {
    if (sorted[index].wpm <= targetWpm && sorted[index + 1].wpm >= targetWpm) {
      return [sorted[index], sorted[index + 1]];
    }
  }

  return targetWpm < sorted[0].wpm
    ? [sorted[0], sorted[1]]
    : [sorted[sorted.length - 2], sorted[sorted.length - 1]];
}

/**
 * A small step from the most recent requested rate, in the direction the last
 * take needs to move.
 *
 * @param {Array<{ rate: number, wpm: number }>} samples Chronological samples.
 * @param {number} targetWpm
 * @returns {number}
 */
function stepFromLatest(samples, targetWpm) {
  const latest = samples[samples.length - 1];
  const factor =
    latest.wpm > targetWpm
      ? 1 - SECANT_FALLBACK_STEP
      : 1 + SECANT_FALLBACK_STEP;
  return latest.rate * factor;
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
