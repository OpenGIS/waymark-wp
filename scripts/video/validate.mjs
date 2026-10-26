#!/usr/bin/env node
// Validate the committed video deliverables against the manifest and the docs.
//
// Usage:
//   node scripts/video/validate.mjs
//
// The check is read-only and offline. It validates every manifest entry that
// exists, so the legacy videos without an entry do not fail the build. The docs
// side is checked independently: every `/assets/video/...` reference in the
// content must resolve to a file under `docs/public/`.
"use strict";

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { runTool } from "./lib/audio.mjs";
import { probeMedia, sha256 } from "./lib/manifest.mjs";

const VIDEO_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(VIDEO_DIR, "..", "..");
const PUBLIC_DIR = path.join(REPO_ROOT, "docs", "public");
const CONTENT_DIR = path.join(REPO_ROOT, "docs", "content");
const MANIFEST_PATH = path.join(PUBLIC_DIR, "assets", "video", "manifest.json");
const DURATION_TOLERANCE = 0.2;
const POSTER_WIDTH = 1280;
const POSTER_HEIGHT = 720;

/**
 * VTT cue timestamp in milliseconds, or null when it is malformed. Only the
 * `HH:MM:SS.mmm` form the build emits is accepted.
 *
 * @param {string} value
 * @returns {number | null}
 */
function parseCueTimestamp(value) {
  const match = /^(\d{2,}):([0-5]\d):([0-5]\d)\.(\d{3})$/.exec(value);
  if (!match) {
    return null;
  }

  return (
    Number(match[1]) * 3_600_000 +
    Number(match[2]) * 60_000 +
    Number(match[3]) * 1000 +
    Number(match[4])
  );
}

function main() {
  const failures = [];
  const manifest = readManifest(failures);
  const entries = manifest ? Object.keys(manifest).length : 0;

  if (manifest) {
    for (const [id, entry] of Object.entries(manifest)) {
      validateEntry(id, entry, failures);
    }
  }

  const references = validateDocsReferences(failures);

  printSummary(failures, entries, references);

  if (failures.length) {
    process.exitCode = 1;
  }
}

/**
 * Read and parse the delivery manifest, recording a failure when it is absent
 * or malformed.
 *
 * @param {string[]} failures
 * @returns {object | null}
 */
function readManifest(failures) {
  let source;
  try {
    source = fs.readFileSync(MANIFEST_PATH, "utf8");
  } catch {
    fail(failures, "manifest", `cannot read ${displayPath(MANIFEST_PATH)}.`);
    return null;
  }

  let parsed;
  try {
    parsed = JSON.parse(source);
  } catch (error) {
    fail(
      failures,
      "manifest",
      `${displayPath(MANIFEST_PATH)} is not valid JSON: ${error.message}`,
    );
    return null;
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    fail(
      failures,
      "manifest",
      `${displayPath(MANIFEST_PATH)} is not an object keyed by video id.`,
    );
    return null;
  }

  return parsed;
}

/**
 * Validate one manifest entry. Independent checks keep running so a single run
 * reports everything that is wrong with the entry.
 *
 * @param {string} id
 * @param {object} entry
 * @param {string[]} failures
 */
function validateEntry(id, entry, failures) {
  if (!entry || typeof entry !== "object") {
    fail(failures, id, "the manifest entry is not an object.");
    return;
  }

  const video = assetFor(entry, "file", id, failures);
  if (video) {
    validateVideo(video, entry, id, failures);
  }

  const poster = assetFor(entry, "poster", id, failures);
  if (poster) {
    validatePoster(poster, id, failures);
  }

  const captions = assetFor(entry, "captions", id, failures);
  if (captions) {
    validateCaptions(captions, id, failures);
  }

  const transcript = assetFor(entry, "transcript", id, failures);
  if (transcript) {
    validateTranscript(transcript, id, failures);
  }
}

/**
 * Resolve an asset path from a manifest entry, recording a failure when the
 * field is missing.
 *
 * @param {object} entry
 * @param {string} field
 * @param {string} id
 * @param {string[]} failures
 * @returns {string | null}
 */
function assetFor(entry, field, id, failures) {
  const reference = entry[field];

  if (typeof reference !== "string" || reference.trim() === "") {
    fail(failures, id, `the manifest entry has no "${field}" path.`);
    return null;
  }

  return path.join(PUBLIC_DIR, reference.replace(/^\/+/, ""));
}

/**
 * @param {string} filePath
 * @param {object} entry
 * @param {string} id
 * @param {string[]} failures
 */
function validateVideo(filePath, entry, id, failures) {
  const display = displayPath(filePath);
  const stat = statFile(filePath, id, failures);

  if (!stat) {
    return;
  }

  if (stat.size === 0) {
    fail(failures, id, `${display} is empty.`);
  }

  if (stat.size !== Number(entry.size)) {
    fail(
      failures,
      id,
      `${display} is ${stat.size} bytes, but the manifest says ${entry.size}.`,
    );
  }

  let media = null;
  try {
    media = probeMedia(filePath);
  } catch (error) {
    fail(failures, id, `ffprobe could not read ${display}: ${error.message}`);
  }

  if (media) {
    const duration = Number(entry.duration);
    if (
      !Number.isFinite(duration) ||
      Math.abs(media.duration - duration) > DURATION_TOLERANCE
    ) {
      fail(
        failures,
        id,
        `${display} is ${media.duration.toFixed(3)}s, but the manifest says ` +
          `${entry.duration}s.`,
      );
    }

    if (media.width !== Number(entry.width)) {
      fail(
        failures,
        id,
        `${display} is ${media.width}px wide, but the manifest says ` +
          `${entry.width}px.`,
      );
    }

    if (media.height !== Number(entry.height)) {
      fail(
        failures,
        id,
        `${display} is ${media.height}px high, but the manifest says ` +
          `${entry.height}px.`,
      );
    }

    if (media.videoCodec !== entry.videoCodec) {
      fail(
        failures,
        id,
        `${display} uses the "${media.videoCodec}" video codec, but the ` +
          `manifest says "${entry.videoCodec}".`,
      );
    }

    if (media.audioCodec !== entry.audioCodec) {
      fail(
        failures,
        id,
        `${display} uses the "${media.audioCodec}" audio codec, but the ` +
          `manifest says "${entry.audioCodec}".`,
      );
    }
  }

  let digest;
  try {
    digest = sha256(filePath);
  } catch (error) {
    fail(failures, id, `cannot hash ${display}: ${error.message}`);
  }

  if (digest !== undefined && digest !== entry.sha256) {
    fail(
      failures,
      id,
      `${display} hashes to ${digest}, but the manifest says ${entry.sha256}.`,
    );
  }
}

/**
 * @param {string} filePath
 * @param {string} id
 * @param {string[]} failures
 */
function validatePoster(filePath, id, failures) {
  const display = displayPath(filePath);
  const stat = statFile(filePath, id, failures);

  if (!stat) {
    return;
  }

  if (stat.size === 0) {
    fail(failures, id, `${display} is empty.`);
  }

  if (!isJpeg(filePath)) {
    fail(failures, id, `${display} is not a JPEG.`);
  }

  let image = null;
  try {
    image = probeImage(filePath);
  } catch (error) {
    fail(failures, id, `ffprobe could not read ${display}: ${error.message}`);
  }

  if (image) {
    if (image.width !== POSTER_WIDTH || image.height !== POSTER_HEIGHT) {
      fail(
        failures,
        id,
        `${display} is ${image.width}x${image.height}, but posters must be ` +
          `${POSTER_WIDTH}x${POSTER_HEIGHT}.`,
      );
    }
  }
}

/**
 * @param {string} filePath
 * @param {string} id
 * @param {string[]} failures
 */
function validateCaptions(filePath, id, failures) {
  const display = displayPath(filePath);
  const stat = statFile(filePath, id, failures);

  if (!stat) {
    return;
  }

  let source;
  try {
    source = fs.readFileSync(filePath, "utf8");
  } catch (error) {
    fail(failures, id, `cannot read ${display}: ${error.message}`);
    return;
  }

  if (source.trim() === "") {
    fail(failures, id, `${display} is empty.`);
    return;
  }

  const cues = validateVtt(source, id, display, failures);
  if (cues === 0) {
    fail(failures, id, `${display} contains no cues.`);
  }
}

/**
 * Check the WebVTT header, cue timestamps and their order.
 *
 * @param {string} source
 * @param {string} id
 * @param {string} display
 * @param {string[]} failures
 * @returns {number} the number of cue timing lines found
 */
function validateVtt(source, id, display, failures) {
  const document = source
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n")
    .trim();

  if (!document.startsWith("WEBVTT")) {
    fail(failures, id, `${display} does not start with WEBVTT.`);
    return 0;
  }

  const blocks = document.split(/\n{2,}/);
  let cues = 0;
  let previousStart = null;

  for (const block of blocks.slice(1)) {
    const lines = block.split("\n").map((line) => line.trimEnd());
    if (/^(NOTE|STYLE|REGION)\b/.test(lines[0] ?? "")) {
      continue;
    }

    const timingIndex = lines.findIndex((line) => line.includes("-->"));
    if (timingIndex === -1) {
      continue;
    }

    cues += 1;
    const [rawStart, rawEnd] = lines[timingIndex].split(/\s+-->\s+/);
    const startToken = (rawStart ?? "").trim();
    const endToken = (rawEnd ?? "").trim().split(/\s+/)[0];
    const start = parseCueTimestamp(startToken);
    const end = parseCueTimestamp(endToken);
    const cue = `cue ${cues} in ${display}`;

    if (start === null) {
      fail(failures, id, `${cue} has a malformed start "${startToken}".`);
    }

    if (end === null) {
      fail(failures, id, `${cue} has a malformed end "${endToken}".`);
    }

    if (start !== null && end !== null) {
      if (end <= start) {
        fail(
          failures,
          id,
          `${cue} ends at ${endToken}, at or before its start ${startToken}.`,
        );
      }

      if (previousStart !== null && start < previousStart) {
        fail(
          failures,
          id,
          `${cue} starts at ${startToken}, before the previous cue.`,
        );
      }

      previousStart = start;
    }
  }

  return cues;
}

/**
 * @param {string} filePath
 * @param {string} id
 * @param {string[]} failures
 */
function validateTranscript(filePath, id, failures) {
  const display = displayPath(filePath);
  const stat = statFile(filePath, id, failures);

  if (!stat) {
    return;
  }

  if (stat.size === 0) {
    fail(failures, id, `${display} is empty.`);
  }
}

/**
 * Resolve every video attribute in the docs content and confirm the target
 * exists under `docs/public/`.
 *
 * @param {string[]} failures
 * @returns {number} the number of references checked
 */
function validateDocsReferences(failures) {
  const pattern = /\b(src|poster|captions)="(\/assets\/video\/[^"]+)"/g;
  let references = 0;

  for (const filePath of findMarkdownFiles(CONTENT_DIR)) {
    const source = fs.readFileSync(filePath, "utf8");

    for (const match of source.matchAll(pattern)) {
      references += 1;
      const attribute = match[1];
      const reference = match[2];
      const asset = path.join(PUBLIC_DIR, reference.replace(/^\/+/, ""));

      if (!isFile(asset)) {
        fail(
          failures,
          displayPath(filePath),
          `${attribute}="${reference}" does not resolve to a file under ` +
            `docs/public.`,
        );
      }
    }
  }

  return references;
}

/**
 * @param {string} directory
 * @returns {string[]}
 */
function findMarkdownFiles(directory) {
  const files = [];

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...findMarkdownFiles(entryPath));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(entryPath);
    }
  }

  return files;
}

/**
 * Read an image's dimensions with ffprobe.
 *
 * @param {string} filePath
 * @returns {{ width: number, height: number }}
 */
function probeImage(filePath) {
  const { stdout } = runTool("ffprobe", [
    "-v",
    "error",
    "-select_streams",
    "v:0",
    "-show_entries",
    "stream=width,height",
    "-of",
    "json",
    filePath,
  ]);

  const parsed = JSON.parse(stdout);
  const stream = parsed.streams?.[0];

  if (!stream) {
    throw new Error("ffprobe found no image stream.");
  }

  return { width: Number(stream.width), height: Number(stream.height) };
}

/**
 * @param {string} filePath
 * @returns {boolean}
 */
function isJpeg(filePath) {
  const header = fs.readFileSync(filePath).subarray(0, 3);
  return header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff;
}

/**
 * @param {string} filePath
 * @returns {boolean}
 */
function isFile(filePath) {
  try {
    return fs.statSync(filePath).isFile();
  } catch {
    return false;
  }
}

/**
 * Stat a file, recording a failure when it is missing or not a regular file.
 *
 * @param {string} filePath
 * @param {string} label
 * @param {string[]} failures
 * @returns {fs.Stats | null}
 */
function statFile(filePath, label, failures) {
  try {
    const stat = fs.statSync(filePath);

    if (!stat.isFile()) {
      fail(failures, label, `${displayPath(filePath)} is not a file.`);
      return null;
    }

    return stat;
  } catch {
    fail(failures, label, `${displayPath(filePath)} is missing.`);
    return null;
  }
}

/**
 * @param {string[]} failures
 * @param {string} label
 * @param {string} message
 */
function fail(failures, label, message) {
  failures.push(`${label}: ${message}`);
}

/**
 * @param {string[]} failures
 * @param {number} entries
 * @param {number} references
 */
function printSummary(failures, entries, references) {
  const context = `${entries} manifest entry(s), ${references} docs reference(s)`;

  if (!failures.length) {
    console.log(`[video] Validation passed: ${context}.`);
    return;
  }

  console.log("");
  console.log("[video] Validation failed:");
  for (const failure of failures) {
    console.log(`[video]   - ${failure}`);
  }
  console.log("");
  console.log(`[video] ${failures.length} failure(s) in ${context}.`);
}

/**
 * @param {string} filePath
 * @returns {string}
 */
function displayPath(filePath) {
  return path.relative(REPO_ROOT, filePath).split(path.sep).join("/");
}

try {
  main();
} catch (error) {
  console.error(`[video] ${error.stack ?? error.message}`);
  process.exitCode = 1;
}
