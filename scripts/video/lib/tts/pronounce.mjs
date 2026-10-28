// Narration pronunciation rewriting.
//
// Authored narration keeps its natural spelling. Before synthesis the text is
// passed through a small lexicon so tricky words can be replaced with either
// inline IPA objects (Deepgram) or plain-text respellings. The function returns
// both forms: the authored `displayText` and the provider-ready
// `synthesisText`, plus a record of every replacement for auditing.
"use strict";

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const DEFAULT_LEXICON_PATH = path.resolve(
  HERE,
  "../../narration/pronunciations.json",
);

const WORD_CHARACTER = "\\p{L}\\p{N}_";

/**
 * Read and validate the shared lexicon.
 *
 * @param {string} [lexiconPath]
 * @returns {{ version?: number, notes?: string[], entries: Array<object> }}
 */
export function loadLexicon(lexiconPath = DEFAULT_LEXICON_PATH) {
  const raw = fs.readFileSync(lexiconPath, "utf8");
  let parsed;

  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new Error(`Invalid pronunciation lexicon JSON: ${error.message}`);
  }

  if (!parsed || !Array.isArray(parsed.entries)) {
    throw new Error(
      `Pronunciation lexicon must contain an "entries" array: ${lexiconPath}`,
    );
  }

  for (const entry of parsed.entries) {
    if (!entry || typeof entry !== "object") {
      throw new Error(`Invalid pronunciation entry in ${lexiconPath}.`);
    }
    if (!Array.isArray(entry.match) || entry.match.length === 0) {
      throw new Error(
        `Pronunciation entry "${entry.display ?? "unknown"}" needs a non-empty "match" array.`,
      );
    }
    for (const variant of entry.match) {
      if (typeof variant !== "string" || variant === "") {
        throw new Error(
          `Pronunciation entry "${entry.display ?? "unknown"}" has an empty match variant.`,
        );
      }
    }
  }

  return parsed;
}

/**
 * Flatten the lexicon into match variants ordered longest first, so a longer
 * phrase such as `OpenTopoMap` wins over a shorter one such as `topo`.
 *
 * @param {Array<object>} entries
 * @returns {Array<{ variant: string, entry: object }>}
 */
function orderedVariants(entries) {
  const variants = [];

  for (const entry of entries) {
    for (const variant of entry.match) {
      variants.push({ variant, entry });
    }
  }

  return variants.sort((a, b) => b.variant.length - a.variant.length);
}

/**
 * @param {string} value
 * @returns {string}
 */
function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Choose the synthesis form for an entry.
 *
 * Deepgram uses inline IPA objects. The macOS `say` provider gets plain-text
 * respellings because `[[inpt PHON]]` blocks are read literally by at least
 * the default Daniel voice; `say` phonemes are opt-in via `form: "say"`.
 *
 * @param {object} entry
 * @param {{ provider?: string, form?: string }} options
 * @returns {"ipa" | "spoken" | "say"}
 */
function chooseForm(entry, { provider = "deepgram", form }) {
  if (form === "ipa" || form === "spoken" || form === "say") {
    return form;
  }

  if (provider === "deepgram") {
    return entry.ipa ? "ipa" : "spoken";
  }

  return "spoken";
}

/**
 * Render one matched variant in the requested synthesis form.
 *
 * @param {object} entry
 * @param {string} matched
 * @param {"ipa" | "spoken" | "say"} form
 * @returns {string}
 */
function render(entry, matched, form) {
  if (form === "ipa" && entry.ipa) {
    // The backslash before each brace is part of the text payload; JSON
    // encoding adds the escaping needed on the wire.
    return `\\{"word": "${matched}", "pronounce": "${entry.ipa}"\\}`;
  }

  if (form === "say" && entry.say) {
    return `[[inpt PHON]]${entry.say}[[inpt TEXT]]`;
  }

  if (entry.spoken && matched[0] === matched[0].toUpperCase()) {
    return entry.spoken[0].toUpperCase() + entry.spoken.slice(1);
  }

  return entry.spoken ?? matched;
}

/**
 * Replace recognised terms with provider-ready pronunciation forms.
 *
 * Matching is whole-word, case-insensitive, and longest-first. A term is never
 * substituted inside a longer word, so `topo` does not match `topography`.
 *
 * @param {string} text
 * @param {{ provider?: string, form?: "ipa" | "spoken" | "say", lexicon?: object, lexiconPath?: string }} [options]
 * @returns {{ displayText: string, synthesisText: string, replacements: Array<{ display: string, matched: string, index: number, form: string }> }}
 */
export function applyPronunciations(text, options = {}) {
  if (typeof text !== "string") {
    throw new TypeError("applyPronunciations expects a string.");
  }

  const lexicon = options.lexicon ?? loadLexicon(options.lexiconPath);
  const variants = orderedVariants(lexicon.entries);

  if (variants.length === 0) {
    return { displayText: text, synthesisText: text, replacements: [] };
  }

  const byVariant = new Map();
  for (const { variant, entry } of variants) {
    const key = variant.toLowerCase();
    if (!byVariant.has(key)) {
      byVariant.set(key, { entry, variant });
    }
  }

  const pattern = new RegExp(
    `(?<![${WORD_CHARACTER}])(?:${variants
      .map(({ variant }) => escapeRegExp(variant))
      .join("|")})(?![${WORD_CHARACTER}])`,
    "giu",
  );

  const replacements = [];
  const synthesisText = text.replace(pattern, (matched, offset) => {
    const hit = byVariant.get(matched.toLowerCase());
    if (!hit) {
      return matched;
    }

    const form = chooseForm(hit.entry, options);
    replacements.push({
      display: hit.entry.display ?? matched,
      matched,
      index: offset,
      form,
    });

    return render(hit.entry, matched, form);
  });

  return { displayText: text, synthesisText, replacements };
}
