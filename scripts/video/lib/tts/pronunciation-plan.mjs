// Provider-aware pronunciation plan for one narration run.
//
// The authored narration is never rewritten. This module applies the shared
// lexicon to every narrated scene once per provider and returns both the
// provider-ready synthesis text and the counts the run needs to audit the
// response. The plan also owns the speed lock: Flux rejects pronunciation
// overrides when `speed` is not 1.0, so a provider that advertises a
// `pronunciationRate` is pinned to that rate for the whole run.
"use strict";

import { applyPronunciations } from "./pronounce.mjs";

// Bumped when the plan or the provider form selection changes, so cached takes
// made by older logic are regenerated rather than reused.
export const PRONUNCIATION_VERSION = 1;

/**
 * Apply the lexicon to every narrated scene and resolve the run rate.
 *
 * @param {{ provider: object, narrated: object[], lexicon: object, lexiconHash: string, rate: number }} options
 * @returns {{
 *   version: number,
 *   count: number,
 *   words: string[],
 *   texts: Map<string, string>,
 *   sceneCounts: Map<string, number>,
 *   lexiconHash: string,
 *   locked: boolean,
 *   clamped: boolean,
 *   requestedRate: number,
 *   requestedSpeed: number | null,
 *   rate: number
 * }}
 */
export function planPronunciations({
  provider,
  narrated,
  lexicon,
  lexiconHash,
  rate,
}) {
  const texts = new Map();
  const sceneCounts = new Map();
  const words = [];
  const seen = new Set();
  let count = 0;

  for (const scene of narrated) {
    const result = applyPronunciations(scene.narration, {
      provider: provider.id,
      lexicon,
    });

    texts.set(scene.id, result.synthesisText);
    sceneCounts.set(scene.id, result.replacements.length);
    count += result.replacements.length;

    for (const replacement of result.replacements) {
      const key = replacement.matched.toLowerCase();

      if (!seen.has(key)) {
        seen.add(key);
        words.push(replacement.matched);
      }
    }
  }

  const speedBased = typeof provider.speedForRate === "function";
  const lockRate =
    typeof provider.pronunciationRate === "number"
      ? provider.pronunciationRate
      : null;
  const locked = count > 0 && speedBased && lockRate !== null;
  const requestedSpeed = speedBased ? provider.speedForRate(rate) : null;
  const clamped =
    locked && Number.isFinite(requestedSpeed) && requestedSpeed !== 1;

  return {
    version: PRONUNCIATION_VERSION,
    count,
    words,
    texts,
    sceneCounts,
    lexiconHash,
    locked,
    clamped,
    requestedRate: rate,
    requestedSpeed,
    rate: locked ? lockRate : rate,
  };
}
