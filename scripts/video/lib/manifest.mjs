// Delivery manifest helpers: ffprobe facts, checksums and safe merging.
//
// The manifest is keyed by video id so adding another video never rewrites the
// existing entries. A broken manifest is a hard error rather than something to
// clobber.
"use strict";

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { createRequire } from "node:module";

import { runTool } from "./audio.mjs";

const require = createRequire(import.meta.url);

/**
 * Read the stream and format facts used by the manifest.
 *
 * @param {string} filePath
 * @returns {{
 *   duration: number,
 *   size: number,
 *   width: number,
 *   height: number,
 *   videoCodec: string,
 *   audioCodec: string,
 *   videoBitrate: number | null,
 *   audioBitrate: number | null,
 *   frameRate: string | null
 * }}
 */
export function probeMedia(filePath) {
  const { stdout } = runTool("ffprobe", [
    "-v",
    "error",
    "-show_entries",
    "stream=codec_type,codec_name,width,height,bit_rate,r_frame_rate:format=duration,size,bit_rate",
    "-of",
    "json",
    filePath,
  ]);

  const parsed = JSON.parse(stdout);
  const streams = parsed.streams ?? [];
  const video = streams.find((stream) => stream.codec_type === "video");
  const audio = streams.find((stream) => stream.codec_type === "audio");
  const duration = Number(parsed.format?.duration);
  const size = Number(parsed.format?.size);

  if (!video || !audio) {
    throw new Error(
      `ffprobe found no ${video ? "audio" : "video"} stream in ${filePath}.`,
    );
  }

  if (!Number.isFinite(duration) || !Number.isFinite(size)) {
    throw new Error(`ffprobe could not read the format of ${filePath}.`);
  }

  return {
    duration,
    size,
    width: Number(video.width),
    height: Number(video.height),
    videoCodec: video.codec_name,
    audioCodec: audio.codec_name,
    videoBitrate: toNumberOrNull(video.bit_rate),
    audioBitrate: toNumberOrNull(audio.bit_rate),
    frameRate: video.r_frame_rate ?? null,
  };
}

/**
 * SHA-256 of a file, as lowercase hex.
 *
 * @param {string} filePath
 * @returns {string}
 */
export function sha256(filePath) {
  return crypto
    .createHash("sha256")
    .update(fs.readFileSync(filePath))
    .digest("hex");
}

/**
 * Read the installed Playwright and Chromium versions, or null when they are
 * not available. Chromium's version comes from Playwright's own browser
 * manifest, which is the build Playwright will actually launch.
 *
 * @returns {{ playwright: string | null, chromium: string | null }}
 */
export function toolchainVersions() {
  let playwright = null;
  let chromium = null;

  try {
    const packagePath = require.resolve("@playwright/test/package.json");
    const packageJSON = JSON.parse(fs.readFileSync(packagePath, "utf8"));
    playwright = packageJSON.version ?? null;
  } catch {
    playwright = null;
  }

  try {
    const corePath = require.resolve("playwright-core/package.json");
    const browsersPath = path.join(path.dirname(corePath), "browsers.json");
    const browsers = JSON.parse(fs.readFileSync(browsersPath, "utf8"));
    const entry = browsers.browsers?.find(
      (browser) => browser.name === "chromium",
    );
    chromium = entry?.browserVersion ?? entry?.revision ?? null;
  } catch {
    chromium = null;
  }

  return { playwright, chromium };
}

/**
 * Merge one entry into the manifest, preserving every other video id.
 *
 * @param {string} manifestPath
 * @param {string} id
 * @param {object} entry
 * @returns {object} the merged manifest
 */
export function mergeManifest(manifestPath, id, entry) {
  let manifest = {};

  if (fs.existsSync(manifestPath)) {
    let parsed;
    try {
      parsed = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    } catch (error) {
      throw new Error(
        `The existing manifest is not valid JSON: ${manifestPath}\n` +
          `${error.message}`,
      );
    }

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error(
        `The existing manifest at ${manifestPath} is not an object keyed by video id.`,
      );
    }

    manifest = parsed;
  }

  manifest[id] = entry;

  fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
  fs.writeFileSync(
    manifestPath,
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8",
  );

  return manifest;
}

/**
 * @param {string | undefined} value
 * @returns {number | null}
 */
function toNumberOrNull(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}
