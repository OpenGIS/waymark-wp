// Provider registry and resolution for narration.
//
// Adding a provider is deliberately two small steps: create a module under
// `providers/` that matches the contract below, then add one import and one
// registry entry. Resolution and fallback stay in this file.
//
// Provider contract:
//   {
//     id, label, defaultVoice, supportsContinuous,
//     isAvailable(env),
//     unavailableReason?(env),
//     hasVoice?(voice),
//     describeVoice?(voice),
//     describeInvalidVoice?(voice),
//     speedForRate?(rate),
//     clampRate?(rate),
//     pronunciationRate?(number),  // words-per-minute rate that maps to speed 1.0
//     timingMetadata?({ voice, rate }),
//     synthesise({ text, voice, rate, outPath, env, sceneId, verbose, log, expectedPronunciations }),
//     transcribeWav?({ wavPath, env, verbose, log })
//   }
//
// `supportsContinuous` is true only when the provider can both synthesise one
// whole-script performance and return word timestamps for it. Providers
// without it keep the per-line path.
"use strict";

import deepgram from "./providers/deepgram.mjs";
import say from "./providers/say.mjs";

// Registry. The say provider is always the final fallback.
export const PROVIDERS = [deepgram, say];

const PROVIDERS_BY_ID = new Map(
  PROVIDERS.map((provider) => [provider.id, provider]),
);

/**
 * @returns {string[]}
 */
export function providerIds() {
  return PROVIDERS.map((provider) => provider.id);
}

/**
 * Resolve the requested provider id without consulting availability.
 *
 * Order: explicit flag, VIDEO_TTS_PROVIDER, then Deepgram when a key exists,
 * otherwise say.
 *
 * @param {{ flag?: string | null, env: object }} options
 * @returns {string}
 */
export function resolveRequestedId({ flag, env }) {
  const fromFlag = (flag ?? "").trim();
  if (fromFlag) {
    return fromFlag;
  }

  const fromEnv = (env.VIDEO_TTS_PROVIDER ?? "").trim();
  if (fromEnv) {
    return fromEnv;
  }

  return (env.DEEPGRAM_API_KEY ?? "").trim() ? "deepgram" : "say";
}

/**
 * Build the ordered candidate list. The requested provider comes first, the
 * remaining providers follow in registry order, and say is always last.
 *
 * @param {{ flag?: string | null, env: object }} options
 * @returns {{ requestedId: string, candidates: object[] }}
 */
export function resolveCandidates({ flag, env }) {
  const requestedId = resolveRequestedId({ flag, env });
  const requested = PROVIDERS_BY_ID.get(requestedId);

  if (!requested) {
    throw new Error(
      `Unknown TTS provider "${requestedId}". ` +
        `Known providers: ${providerIds().join(", ")}.`,
    );
  }

  if (requested.id === "say") {
    return { requestedId, candidates: [requested] };
  }

  const candidates = [requested];

  for (const provider of PROVIDERS) {
    if (provider.id === requested.id || provider.id === "say") {
      continue;
    }
    candidates.push(provider);
  }

  candidates.push(PROVIDERS_BY_ID.get("say"));

  return { requestedId, candidates };
}

/**
 * True when a provider recognises a voice. Providers that cannot check voices
 * locally (such as a hosted API) omit `hasVoice` and accept every value.
 *
 * @param {object} provider
 * @param {string} voice
 * @returns {boolean}
 */
function providerHasVoice(provider, voice) {
  if (typeof provider.hasVoice !== "function") {
    return true;
  }

  return provider.hasVoice(voice);
}

/**
 * Build the readable error for an explicit voice a provider rejects.
 *
 * @param {object} provider
 * @param {string} voice
 * @returns {string}
 */
function invalidVoiceMessage(provider, voice) {
  if (typeof provider.describeInvalidVoice === "function") {
    return provider.describeInvalidVoice(voice);
  }

  const alternatives = provider.defaultVoice
    ? ` Use "${provider.defaultVoice}" instead.`
    : "";

  return `Voice "${voice}" is not available for ${provider.id}.${alternatives}`;
}

/**
 * Resolve the voice for one provider and record where it came from.
 *
 * Order: --voice, VIDEO_TTS_VOICE, then the provider default.
 *
 * A voice from the environment that the provider does not recognise is
 * replaced with that provider's default, which is what lets a Deepgram voice
 * such as `flux-kit-en` fall through to `say`. An explicit `--voice` is never
 * swapped silently: an unrecognised value fails with a readable suggestion.
 *
 * @param {object} provider
 * @param {{ flagVoice?: string | null, env: object }} options
 * @returns {{ voice: string, source: "flag" | "env" | "default" }}
 */
export function resolveVoice(provider, { flagVoice, env }) {
  const fromFlag = (flagVoice ?? "").trim();
  if (fromFlag) {
    if (!providerHasVoice(provider, fromFlag)) {
      throw new Error(invalidVoiceMessage(provider, fromFlag));
    }

    return { voice: fromFlag, source: "flag" };
  }

  const fromEnv = (env.VIDEO_TTS_VOICE ?? "").trim();
  if (fromEnv && providerHasVoice(provider, fromEnv)) {
    return { voice: fromEnv, source: "env" };
  }

  return { voice: provider.defaultVoice, source: "default" };
}

/**
 * @param {object} provider
 * @param {object} env
 * @returns {{ available: boolean, reason: string | null }}
 */
export function availability(provider, env) {
  if (provider.isAvailable(env)) {
    return { available: true, reason: null };
  }

  const reason =
    typeof provider.unavailableReason === "function"
      ? provider.unavailableReason(env)
      : null;

  return { available: false, reason: reason ?? "not available" };
}

/**
 * Format a provider and resolved voice for a fallback notice.
 *
 * @param {object} provider
 * @param {string} voice
 * @returns {string}
 */
export function describeProvider(provider, voice) {
  const label =
    typeof provider.describeVoice === "function"
      ? provider.describeVoice(voice)
      : voice;

  return `${provider.id} (${label})`;
}

/**
 * Return the candidate after `currentId`, or null when it is the last one.
 *
 * @param {object[]} candidates
 * @param {string} currentId
 * @returns {object | null}
 */
export function nextCandidate(candidates, currentId) {
  const index = candidates.findIndex((provider) => provider.id === currentId);
  return index >= 0 ? (candidates[index + 1] ?? null) : null;
}
