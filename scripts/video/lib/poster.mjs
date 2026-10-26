// High-resolution poster capture.
//
// The poster is a still taken from a replay of the scenario in a second,
// unrecorded browser context at twice the device scale. It is cropped to the
// map (or another configured element) before it is written, so the build can
// downscale a clean, sharp image instead of lifting a frame from the encoded
// video.
"use strict";

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const VIDEO_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

export const POSTER_WORK_DIR = path.join(VIDEO_DIR, "work", "poster");
export const POSTER_SCALE = 2;
export const POSTER_DEFAULTS = Object.freeze({
  selector: "#waymark-map",
  aspect: "16:9",
  pad: 0,
});

// Keep the highlighted element's border away from the crop edge so rounding
// and antialiasing cannot clip it.
const POSTER_EDGE_MARGIN = 2;

const POSTER_KEYS = new Set(["selector", "aspect", "pad"]);

/**
 * Parse a `width:height` aspect ratio into a number.
 *
 * @param {string} aspect
 * @param {string} sceneId
 * @returns {number}
 */
export function parseAspectRatio(aspect, sceneId) {
  if (typeof aspect !== "string") {
    throw new Error(
      `Scene "${sceneId}": "poster.aspect" must be a string such as "16:9".`,
    );
  }

  const match = /^\s*(\d+(?:\.\d+)?)\s*:\s*(\d+(?:\.\d+)?)\s*$/.exec(aspect);
  if (!match) {
    throw new Error(
      `Scene "${sceneId}": "poster.aspect" must be a ratio such as "16:9", ` +
        `received "${aspect}".`,
    );
  }

  const width = Number(match[1]);
  const height = Number(match[2]);

  if (!(width > 0) || !(height > 0)) {
    throw new Error(
      `Scene "${sceneId}": "poster.aspect" must have a positive width and height.`,
    );
  }

  return width / height;
}

/**
 * Normalise a scene's `poster` field. Boolean `true` uses the defaults, an
 * object overrides them, and `false`, `null` or an absent field means no
 * capture. Unknown keys are rejected so a misspelling cannot be ignored.
 *
 * @param {boolean | object | undefined | null} value
 * @param {string} sceneId
 * @returns {{ selector: string, aspect: string, pad: number } | null}
 */
export function parsePosterConfig(value, sceneId) {
  if (value === undefined || value === null || value === false) {
    return null;
  }

  if (value === true) {
    return { ...POSTER_DEFAULTS };
  }

  if (typeof value !== "object" || Array.isArray(value)) {
    throw new Error(
      `Scene "${sceneId}": "poster" must be a boolean or an object.`,
    );
  }

  const unknown = Object.keys(value)
    .filter((key) => !POSTER_KEYS.has(key))
    .sort();

  if (unknown.length) {
    throw new Error(
      `Scene "${sceneId}": "poster" has unknown key(s): ${unknown.join(", ")}.`,
    );
  }

  const selector = value.selector ?? POSTER_DEFAULTS.selector;
  if (typeof selector !== "string" || selector.trim() === "") {
    throw new Error(
      `Scene "${sceneId}": "poster.selector" must be a non-empty CSS selector.`,
    );
  }

  const aspect = value.aspect ?? POSTER_DEFAULTS.aspect;
  parseAspectRatio(aspect, sceneId);

  const pad = value.pad ?? POSTER_DEFAULTS.pad;
  if (typeof pad !== "number" || !Number.isFinite(pad) || pad < 0) {
    throw new Error(
      `Scene "${sceneId}": "poster.pad" must be a non-negative number of CSS pixels.`,
    );
  }

  return { selector, aspect, pad };
}

/**
 * Compute the poster crop. The crop is the largest box of the configured
 * aspect ratio that fits inside the padded element box. When an active
 * highlight is present, the crop is shifted within the element so the whole
 * outline is visible, with a small margin. If the outline is larger than the
 * fitted crop, or reaches outside the element, the box grows as needed. An
 * extension beyond the element is reported to the caller.
 *
 * @param {{ x: number, y: number, width: number, height: number }} rect
 * @param {{ aspect: string, pad: number }} config
 * @param {string} sceneId
 * @param {{ width: number, height: number }} viewport
 * @param {{ highlightRect?: { x: number, y: number, width: number, height: number } | null }} [options]
 * @returns {{ x: number, y: number, width: number, height: number, extended: boolean }}
 */
export function computePosterCrop(
  rect,
  config,
  sceneId,
  viewport,
  options = {},
) {
  if (!(rect.width > 0) || !(rect.height > 0)) {
    throw new Error(
      `Scene "${sceneId}": the poster target has no measurable size.`,
    );
  }

  const ratio = parseAspectRatio(config.aspect, sceneId);
  const paddedWidth = rect.width + config.pad * 2;
  const paddedHeight = rect.height + config.pad * 2;
  const padded = {
    x: rect.x - config.pad,
    y: rect.y - config.pad,
    width: paddedWidth,
    height: paddedHeight,
  };

  let width = paddedWidth;
  let height = width / ratio;

  if (height > paddedHeight) {
    height = paddedHeight;
    width = height * ratio;
  }

  const highlight = options.highlightRect
    ? {
        x: options.highlightRect.x - config.pad,
        y: options.highlightRect.y - config.pad,
        width: options.highlightRect.width + config.pad * 2,
        height: options.highlightRect.height + config.pad * 2,
      }
    : null;

  let extended = false;

  if (highlight && (highlight.width > width || highlight.height > height)) {
    // The outline is larger than the fitted element crop, so the box has to
    // grow. Preserve the aspect ratio while containing the outline.
    width = Math.max(width, highlight.width);
    height = width / ratio;

    if (height < highlight.height) {
      height = highlight.height;
      width = height * ratio;
    }
  }

  if (!highlight) {
    const crop = {
      x: Math.round(padded.x + (paddedWidth - width) / 2),
      y: Math.round(padded.y + (paddedHeight - height) / 2),
      width: Math.round(width),
      height: Math.round(height),
      extended: false,
    };

    return assertCropInsideViewport(crop, sceneId, viewport);
  }

  const fitsInside =
    width <= paddedWidth &&
    height <= paddedHeight &&
    highlight.x >= padded.x &&
    highlight.x + highlight.width <= padded.x + paddedWidth &&
    highlight.y >= padded.y &&
    highlight.y + highlight.height <= padded.y + paddedHeight;

  extended = !fitsInside;

  const x = positionAxis({
    start: padded.x,
    size: paddedWidth,
    length: width,
    includeStart: highlight.x,
    includeLength: highlight.width,
    constrain: fitsInside,
  });
  const y = positionAxis({
    start: padded.y,
    size: paddedHeight,
    length: height,
    includeStart: highlight.y,
    includeLength: highlight.height,
    constrain: fitsInside,
  });

  const crop = {
    x: Math.round(x),
    y: Math.round(y),
    width: Math.round(width),
    height: Math.round(height),
    extended,
  };

  return assertCropInsideViewport(crop, sceneId, viewport);
}

/**
 * Place one crop axis so it contains the highlighted span. The crop starts
 * centred and shifts only as far as needed. When the crop stays inside the
 * element it also keeps a small margin around the outline if there is slack.
 *
 * @param {{ start: number, size: number, length: number, includeStart: number, includeLength: number, constrain: boolean }} options
 * @returns {number}
 */
function positionAxis({
  start,
  size,
  length,
  includeStart,
  includeLength,
  constrain,
}) {
  const minimum = start;
  const maximum = start + size - length;
  const includeEnd = includeStart + includeLength;
  const centre = start + (size - length) / 2;

  let position = centre;

  if (position > includeStart) {
    position = includeStart;
  }

  if (position + length < includeEnd) {
    position = includeEnd - length;
  }

  if (!constrain) {
    return position;
  }

  position = Math.min(Math.max(position, minimum), maximum);

  const marginStart = Math.max(
    minimum,
    includeEnd + POSTER_EDGE_MARGIN - length,
  );
  const marginEnd = Math.min(maximum, includeStart - POSTER_EDGE_MARGIN);

  if (marginStart <= marginEnd) {
    position = Math.min(Math.max(position, marginStart), marginEnd);
  }

  return position;
}

/**
 * Reject a crop that falls outside the viewport, where the screenshot API
 * cannot reach.
 *
 * @param {{ x: number, y: number, width: number, height: number, extended: boolean }} crop
 * @param {string} sceneId
 * @param {{ width: number, height: number }} viewport
 * @returns {{ x: number, y: number, width: number, height: number, extended: boolean }}
 */
function assertCropInsideViewport(crop, sceneId, viewport) {
  if (
    crop.width <= 0 ||
    crop.height <= 0 ||
    crop.x < 0 ||
    crop.y < 0 ||
    crop.x + crop.width > viewport.width ||
    crop.y + crop.height > viewport.height
  ) {
    throw new Error(
      `Scene "${sceneId}": the poster crop ` +
        `(${crop.x},${crop.y} ${crop.width}x${crop.height}) is outside the ` +
        `${viewport.width}x${viewport.height} viewport.`,
    );
  }

  return crop;
}

/**
 * Screenshot the clip at the context's device scale factor.
 *
 * @param {import("@playwright/test").Page} page
 * @param {{ x: number, y: number, width: number, height: number }} crop
 * @param {string} id
 * @returns {Promise<{ path: string, width: number, height: number }>}
 */
export async function capturePosterPng(page, crop, id) {
  fs.mkdirSync(POSTER_WORK_DIR, { recursive: true });

  const outputPath = path.join(POSTER_WORK_DIR, `${id}.png`);

  await page.screenshot({
    path: outputPath,
    clip: crop,
    animations: "disabled",
  });

  const size = readPngSize(outputPath);

  return { path: outputPath, width: size.width, height: size.height };
}

/**
 * Read the pixel dimensions from a PNG IHDR chunk.
 *
 * @param {string} filePath
 * @returns {{ width: number, height: number }}
 */
export function readPngSize(filePath) {
  const header = fs.readFileSync(filePath).subarray(0, 24);

  if (header.length < 24 || header.toString("ascii", 1, 4) !== "PNG") {
    throw new Error(`Not a PNG file: ${filePath}`);
  }

  return {
    width: header.readUInt32BE(16),
    height: header.readUInt32BE(20),
  };
}
