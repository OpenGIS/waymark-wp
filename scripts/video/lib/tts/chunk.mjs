// Scene-aligned chunk planning for continuous narration.
//
// A continuous performance is normally one synthesis request for the whole
// script. Deepgram's batch TTS accepts at most 2,000 characters of input text,
// and pronunciation overrides inflate the spoken text, so a long script can
// exceed that limit. This module splits the script into the fewest chunks that
// fit under a configurable character limit, cutting only at scene boundaries so
// no sentence is ever split between requests.
"use strict";

import { characterCount } from "./shared.mjs";

export const CHUNK_DEFAULT_CHARS = 1800;
export const CHUNK_MAX_CHARS = 1900;
export const CHUNK_ENV = "VIDEO_TTS_CHUNK_CHARS";

const SCENE_SEPARATOR = "\n\n";

/**
 * Resolve the chunk limit from the flag, environment or default. The flag wins
 * over the environment. A value must be a whole number in the accepted range;
 * zero, fractions, non-numeric input and values too close to Deepgram's 2,000
 * character ceiling are rejected before any synthesis starts.
 *
 * @param {{ flag?: string | null, env?: object }} [options]
 * @returns {number}
 */
export function resolveChunkChars({ flag = null, env = process.env } = {}) {
  if (flag !== null && flag !== undefined) {
    return parseChunkChars(String(flag).trim(), "--chunk-chars");
  }

  const fromEnv = (env[CHUNK_ENV] ?? "").trim();

  if (fromEnv !== "") {
    return parseChunkChars(fromEnv, CHUNK_ENV);
  }

  return CHUNK_DEFAULT_CHARS;
}

/**
 * @param {string} raw
 * @param {string} name
 * @returns {number}
 */
function parseChunkChars(raw, name) {
  const value = Number(raw);

  if (
    !/^\d+$/.test(raw) ||
    !Number.isInteger(value) ||
    value < 1 ||
    value > CHUNK_MAX_CHARS
  ) {
    throw new Error(
      `${name} must be a whole number between 1 and ${CHUNK_MAX_CHARS}, ` +
        `got "${raw}".`,
    );
  }

  return value;
}

/**
 * Split narrated scenes into the fewest contiguous chunks whose synthesis text
 * stays within `limit` characters. Scenes are never divided, so a single scene
 * longer than the limit becomes an oversized chunk of its own; the provider
 * still enforces its hard request limit. Each chunk's text is built exactly as
 * the single-request path builds the whole performance (scene texts trimmed and
 * joined with a blank line).
 *
 * @param {{ narrated: object[], texts: Map<string, string>, limit?: number }} options
 * @returns {{ limit: number, chunks: Array<{ scenes: string[], texts: string[], text: string, chars: number, after: string | null }>, boundaries: string[] }}
 */
export function planChunks({ narrated, texts, limit = CHUNK_DEFAULT_CHARS }) {
  if (!Array.isArray(narrated) || narrated.length === 0) {
    throw new Error("Cannot plan TTS chunks for an empty script.");
  }

  if (!Number.isInteger(limit) || limit < 1) {
    throw new Error(`TTS chunk limit must be a positive whole number.`);
  }

  const parts = [];

  for (const scene of narrated) {
    const text = String(texts?.get(scene.id) ?? scene.narration ?? "").trim();

    if (text === "") {
      continue;
    }

    parts.push({ id: scene.id, text, chars: characterCount(text) });
  }

  if (parts.length === 0) {
    throw new Error("Cannot plan TTS chunks for an empty script.");
  }

  const chunks = [];
  let current = null;

  for (const part of parts) {
    const separatorChars =
      current && current.parts.length ? characterCount(SCENE_SEPARATOR) : 0;

    if (
      current &&
      current.parts.length > 0 &&
      current.chars + separatorChars + part.chars > limit
    ) {
      chunks.push(finishChunk(current));
      current = null;
    }

    if (!current) {
      current = { parts: [], chars: 0 };
    }

    current.parts.push(part);
    current.chars +=
      (current.parts.length > 1 ? characterCount(SCENE_SEPARATOR) : 0) +
      part.chars;
  }

  if (current) {
    chunks.push(finishChunk(current));
  }

  const planned = chunks.map((chunk, index) => ({
    ...chunk,
    after:
      index < chunks.length - 1 ? chunk.scenes[chunk.scenes.length - 1] : null,
  }));

  return {
    limit,
    chunks: planned,
    boundaries: planned
      .slice(0, -1)
      .map((chunk) => chunk.after)
      .filter(Boolean),
  };
}

/**
 * @param {{ parts: Array<{ id: string, text: string }>, chars: number }} current
 * @returns {{ scenes: string[], texts: string[], text: string, chars: number }}
 */
function finishChunk(current) {
  const text = current.parts.map((part) => part.text).join(SCENE_SEPARATOR);

  return {
    scenes: current.parts.map((part) => part.id),
    texts: current.parts.map((part) => part.text),
    text,
    chars: characterCount(text),
  };
}

/**
 * Canonical description of a chunk plan for the cache key. Boundary ids and the
 * exact per-chunk text are both included, so changing the limit in a way that
 * moves a boundary invalidates the cached performance.
 *
 * @param {{ chunks: Array<{ after: string | null, scenes: string[], text: string, chars: number }> }} plan
 * @returns {Array<{ after: string | null, scenes: string[], chars: number, text: string }>}
 */
export function chunkPlanSignature(plan) {
  return plan.chunks.map((chunk) => ({
    after: chunk.after,
    scenes: [...chunk.scenes],
    chars: chunk.chars,
    text: chunk.text,
  }));
}
