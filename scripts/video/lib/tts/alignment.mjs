// Align a known narration script to the word timestamps from speech-to-text.
//
// Continuous synthesis produces one performance for the whole film. To recover
// scene boundaries, the script is walked forward against the transcript: each
// script word is matched to the next STT word that equals it, with a small
// look-ahead for insertions and deletions. The match is deliberately strict;
// when a scene has no confident match, the run stops rather than guessing a cut
// point.
//
// STT output is not a perfect copy of the script. It may split a compound
// ("basemap" -> "base map"), join a name ("Open Street Map" ->
// "OpenStreetMap"), or mishear a word ("Waymark" -> "Weymark"). The matcher
// therefore compares short concatenations of tokens as well as single tokens,
// and allows a conservative edit-distance match for longer words.
"use strict";

// Bumped when the alignment rules change, so a cached performance is realigned
// rather than reused with an older cut plan.
export const ALIGNMENT_VERSION = 1;

const MAX_MERGE_TOKENS = 3;
const DEFAULT_LOOK_AHEAD = 3;
const DEFAULT_MIN_CONFIDENCE = 0.5;

/**
 * Lowercase, strip punctuation, collapse whitespace and drop a spaced em dash.
 * The result is the comparison form used on both the script and the transcript.
 *
 * @param {string} value
 * @returns {string}
 */
export function normaliseWord(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[\u2014\u2013]/g, " ")
    .replace(/[^\p{L}\p{N}\s]+/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Split a piece of narration into comparison tokens. Punctuation-only tokens
 * such as a standalone em dash disappear.
 *
 * @param {string} text
 * @returns {string[]}
 */
export function tokeniseNarration(text) {
  const normalised = normaliseWord(text);
  return normalised ? normalised.split(" ") : [];
}

/**
 * Levenshtein distance for short words.
 *
 * @param {string} left
 * @param {string} right
 * @returns {number}
 */
function editDistance(left, right) {
  if (left === right) {
    return 0;
  }

  const previous = Array.from(
    { length: right.length + 1 },
    (_, index) => index,
  );

  for (let i = 1; i <= left.length; i += 1) {
    let diagonal = previous[0];
    previous[0] = i;

    for (let j = 1; j <= right.length; j += 1) {
      const above = previous[j];
      previous[j] = Math.min(
        previous[j] + 1,
        previous[j - 1] + 1,
        diagonal + (left[i - 1] === right[j - 1] ? 0 : 1),
      );
      diagonal = above;
    }
  }

  return previous[right.length];
}

/**
 * Allow a small spelling difference for a long word. Short words must match
 * exactly so the matcher cannot drift onto an unrelated token.
 *
 * @param {string} left
 * @param {string} right
 * @returns {boolean}
 */
function fuzzyEqual(left, right) {
  if (left === right) {
    return true;
  }

  const shortest = Math.min(left.length, right.length);
  if (shortest < 5) {
    return false;
  }

  const allowed = shortest >= 8 ? 2 : 1;
  return editDistance(left, right) <= allowed;
}

/**
 * True when a candidate match should replace the current best. The earliest
 * STT position wins, then an exact match over a fuzzy one, then the smallest
 * number of tokens consumed on both sides.
 *
 * @param {{ index: number, fuzzy: boolean, scriptCount: number, sttCount: number }} candidate
 * @param {{ index: number, fuzzy: boolean, scriptCount: number, sttCount: number }} best
 * @returns {boolean}
 */
function isBetterMatch(candidate, best) {
  if (candidate.index !== best.index) {
    return candidate.index < best.index;
  }

  if (candidate.fuzzy !== best.fuzzy) {
    return !candidate.fuzzy;
  }

  const candidateSize = candidate.scriptCount + candidate.sttCount;
  const bestSize = best.scriptCount + best.sttCount;

  if (candidateSize !== bestSize) {
    return candidateSize < bestSize;
  }

  return candidate.scriptCount < best.scriptCount;
}

/**
 * Find the next STT match for one script token. The search only moves forward
 * and looks at most `lookAhead` transcript tokens beyond the cursor.
 *
 * @param {Array<{ sceneId: string, normal: string }>} scriptTokens
 * @param {number} scriptIndex
 * @param {Array<{ normal: string }>} sttWords
 * @param {number} cursor
 * @param {number} lookAhead
 * @returns {{ index: number, scriptCount: number, sttCount: number, fuzzy: boolean } | null}
 */
function findMatch(scriptTokens, scriptIndex, sttWords, cursor, lookAhead) {
  const sceneId = scriptTokens[scriptIndex].sceneId;
  let maxScriptTokens = 1;

  while (
    maxScriptTokens < MAX_MERGE_TOKENS &&
    scriptTokens[scriptIndex + maxScriptTokens]?.sceneId === sceneId
  ) {
    maxScriptTokens += 1;
  }

  const lastIndex = Math.min(sttWords.length - 1, cursor + lookAhead);
  let best = null;

  for (let index = cursor; index <= lastIndex; index += 1) {
    for (
      let scriptCount = 1;
      scriptCount <= maxScriptTokens;
      scriptCount += 1
    ) {
      const scriptText = scriptTokens
        .slice(scriptIndex, scriptIndex + scriptCount)
        .map((token) => token.normal)
        .join("");

      if (!scriptText) {
        continue;
      }

      for (
        let sttCount = 1;
        sttCount <= MAX_MERGE_TOKENS && index + sttCount <= sttWords.length;
        sttCount += 1
      ) {
        const sttText = sttWords
          .slice(index, index + sttCount)
          .map((word) => word.normal)
          .join("");

        if (!sttText) {
          continue;
        }

        let fuzzy = false;

        if (scriptText === sttText) {
          // Exact concatenation match.
        } else if (
          scriptCount === 1 &&
          sttCount === 1 &&
          fuzzyEqual(scriptText, sttText)
        ) {
          fuzzy = true;
        } else {
          continue;
        }

        const candidate = {
          index,
          scriptCount,
          sttCount,
          fuzzy,
        };

        if (!best || isBetterMatch(candidate, best)) {
          best = candidate;
        }
      }
    }
  }

  return best;
}

/**
 * Align scenes to STT words. Each scene gets a cut span that starts at its
 * first matched word and ends at its last, extended to cover an unmatched
 * boundary word that the transcript heard differently. Inter-scene transcript
 * tokens are assigned to the scene whose boundary is nearest, and a boundary
 * with unmatched words on both sides is an error rather than a guess.
 *
 * @param {{ scenes: Array<{ id: string, narration: string }>, words: Array<{ word?: string, punctuated_word?: string, start: number, end: number }>, lookAhead?: number, minConfidence?: number }} options
 * @returns {{ scenes: Array<object>, sttWordCount: number, scriptWordCount: number, matchedCount: number, unmatchedCount: number, confidence: number }}
 */
export function alignScriptToWords({
  scenes,
  words,
  lookAhead = DEFAULT_LOOK_AHEAD,
  minConfidence = DEFAULT_MIN_CONFIDENCE,
}) {
  if (!Array.isArray(scenes) || scenes.length === 0) {
    throw new Error("Alignment requires at least one narrated scene.");
  }

  if (!Array.isArray(words) || words.length === 0) {
    throw new Error("STT returned no words; cannot align the narration.");
  }

  const sttWords = words
    .map((word, index) => {
      const normal = normaliseWord(word.punctuated_word ?? word.word);
      const start = Number(word.start);
      const end = Number(word.end);

      return {
        index,
        normal,
        start,
        end,
      };
    })
    .filter(
      (word) =>
        word.normal &&
        Number.isFinite(word.start) &&
        Number.isFinite(word.end) &&
        word.end > word.start,
    );

  if (sttWords.length === 0) {
    throw new Error("STT returned no usable word timestamps.");
  }

  const scriptTokens = [];

  for (const scene of scenes) {
    for (const normal of tokeniseNarration(scene.narration)) {
      scriptTokens.push({ sceneId: scene.id, normal });
    }
  }

  if (scriptTokens.length === 0) {
    throw new Error("The narration has no words to align.");
  }

  const stateById = new Map();

  for (const scene of scenes) {
    stateById.set(scene.id, {
      id: scene.id,
      tokens: [],
      matched: 0,
      unmatched: [],
      firstMatchedIndex: null,
      lastMatchedIndex: null,
      firstMatchedTokenIndex: null,
      lastMatchedTokenIndex: null,
      leadingUnmatched: 0,
      trailingUnmatched: 0,
    });
  }

  for (let index = 0; index < scriptTokens.length; index += 1) {
    stateById.get(scriptTokens[index].sceneId).tokens.push(index);
  }

  const matches = new Array(scriptTokens.length).fill(null);
  let cursor = 0;
  let scriptIndex = 0;

  while (scriptIndex < scriptTokens.length) {
    const match = findMatch(
      scriptTokens,
      scriptIndex,
      sttWords,
      cursor,
      lookAhead,
    );

    if (!match) {
      const token = scriptTokens[scriptIndex];
      stateById.get(token.sceneId).unmatched.push(token.normal);
      scriptIndex += 1;
      continue;
    }

    for (let offset = 0; offset < match.scriptCount; offset += 1) {
      const token = scriptTokens[scriptIndex + offset];
      const state = stateById.get(token.sceneId);

      state.matched += 1;

      if (state.firstMatchedIndex === null) {
        state.firstMatchedIndex = match.index;
        state.firstMatchedTokenIndex = scriptIndex + offset;
      }

      state.lastMatchedIndex = match.index + match.sttCount - 1;
      state.lastMatchedTokenIndex = scriptIndex + offset;
      matches[scriptIndex + offset] = {
        sttStartIndex: match.index,
        sttEndIndex: match.index + match.sttCount - 1,
        fuzzy: match.fuzzy,
      };
    }

    scriptIndex += match.scriptCount;
    cursor = match.index + match.sttCount;
  }

  let matchedCount = 0;
  let unmatchedCount = 0;

  for (const state of stateById.values()) {
    state.scriptWords = state.tokens.length;

    let leading = 0;
    for (const tokenIndex of state.tokens) {
      if (matches[tokenIndex]) {
        break;
      }
      leading += 1;
    }

    let trailing = 0;
    for (let index = state.tokens.length - 1; index >= 0; index -= 1) {
      if (matches[state.tokens[index]]) {
        break;
      }
      trailing += 1;
    }

    state.leadingUnmatched = leading;
    state.trailingUnmatched = trailing;
    state.confidence = state.scriptWords
      ? state.matched / state.scriptWords
      : 0;

    matchedCount += state.matched;
    unmatchedCount += state.unmatched.length;

    if (state.matched === 0) {
      const words = state.unmatched.slice(0, 6).join(" ");
      throw new Error(
        `Scene "${state.id}": no confident STT match for its narration` +
          `${words ? ` (first words: "${words}")` : ""}.`,
      );
    }

    if (state.confidence < minConfidence) {
      throw new Error(
        `Scene "${state.id}": only ${state.matched} of ${state.scriptWords} ` +
          `words matched (${Math.round(state.confidence * 100)}%); ` +
          `unmatched: ${state.unmatched.join(", ")}.`,
      );
    }
  }

  let previous = null;

  for (const scene of scenes) {
    const state = stateById.get(scene.id);

    if (previous) {
      const start = sttWords[state.firstMatchedIndex].start;
      const previousEnd = sttWords[previous.lastMatchedIndex].end;

      if (state.firstMatchedIndex <= previous.lastMatchedIndex) {
        throw new Error(
          `Scene "${state.id}": first matched word starts before scene ` +
            `"${previous.id}" has finished in the transcript.`,
        );
      }

      if (!(start > previousEnd)) {
        throw new Error(
          `Scene "${state.id}": first matched word starts at ` +
            `${start.toFixed(3)}s, not after scene "${previous.id}" ends at ` +
            `${previousEnd.toFixed(3)}s.`,
        );
      }
    }

    previous = state;
  }

  const alignedScenes = [];
  let spanStart = 0;

  for (let index = 0; index < scenes.length; index += 1) {
    const scene = scenes[index];
    const state = stateById.get(scene.id);
    const next =
      index + 1 < scenes.length ? stateById.get(scenes[index + 1].id) : null;

    if (state.trailingUnmatched > 0 && next && next.leadingUnmatched > 0) {
      throw new Error(
        `Scenes "${state.id}" and "${next.id}" both have unmatched boundary ` +
          `words; cannot assign the STT words between them.`,
      );
    }

    let endIndex;

    if (index === scenes.length - 1) {
      endIndex = sttWords.length - 1;
    } else if (state.trailingUnmatched > 0) {
      endIndex = next.firstMatchedIndex - 1;
    } else {
      endIndex = state.lastMatchedIndex;
    }

    if (
      spanStart > state.firstMatchedIndex ||
      endIndex < state.lastMatchedIndex
    ) {
      throw new Error(
        `Scene "${state.id}": aligned transcript span is not consistent with ` +
          `its matched words.`,
      );
    }

    const cutStartWord = sttWords[spanStart];
    const cutEndWord = sttWords[endIndex];
    const firstMatchedWord = sttWords[state.firstMatchedIndex];
    const lastMatchedWord = sttWords[state.lastMatchedIndex];

    alignedScenes.push({
      id: scene.id,
      scriptWords: state.scriptWords,
      matchedWords: state.matched,
      unmatchedWords: state.unmatched,
      confidence: state.confidence,
      firstMatchedWord: {
        word: firstMatchedWord.normal,
        scriptWord: scriptTokens[state.firstMatchedTokenIndex]?.normal ?? null,
        start: firstMatchedWord.start,
        end: firstMatchedWord.end,
      },
      lastMatchedWord: {
        word: lastMatchedWord.normal,
        scriptWord: scriptTokens[state.lastMatchedTokenIndex]?.normal ?? null,
        start: lastMatchedWord.start,
        end: lastMatchedWord.end,
      },
      cutStartWord: {
        word: cutStartWord.normal,
        start: cutStartWord.start,
        end: cutStartWord.end,
      },
      cutEndWord: {
        word: cutEndWord.normal,
        start: cutEndWord.start,
        end: cutEndWord.end,
      },
      start: cutStartWord.start,
      end: cutEndWord.end,
      sttStartIndex: spanStart,
      sttEndIndex: endIndex,
    });

    spanStart = endIndex + 1;
  }

  return {
    scenes: alignedScenes,
    sttWordCount: sttWords.length,
    scriptWordCount: scriptTokens.length,
    matchedCount,
    unmatchedCount,
    confidence: scriptTokens.length ? matchedCount / scriptTokens.length : 0,
  };
}
