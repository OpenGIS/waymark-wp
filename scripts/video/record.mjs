#!/usr/bin/env node
// Scenario-driven screen recorder.
//
// Usage:
//   node scripts/video/record.mjs [scenario.json]
//
// The scenario defaults to changing-basemaps. Run from the repository root.
// The target instance is read from WP_BASE_URL and defaults to the dedicated
// video instance on http://localhost:11000.
"use strict";

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

import { isCardPage, showCard } from "./lib/card.mjs";
import { ensureVisible } from "./lib/framing.mjs";
import { loadNarration } from "./lib/narration.mjs";
import {
  POSTER_DEFAULTS,
  POSTER_SCALE,
  POSTER_WORK_DIR,
  capturePosterPng,
  computePosterCrop,
  parsePosterConfig,
} from "./lib/poster.mjs";

const require = createRequire(import.meta.url);
const VIDEO_DIR = path.dirname(fileURLToPath(import.meta.url));

// A neutral point in the blank centre of the WordPress admin bar. No admin bar
// item sits there at 1280x720, so parking the real pointer clears hover-only
// affordances without opening a menu or tooltip.
const PARK_MOUSE_POINT = { x: 640, y: 8 };

const DEFAULT_SCENARIO = path.join(
  VIDEO_DIR,
  "scenarios",
  "changing-basemaps.json",
);

const SCENARIO_KEYS = new Set([
  "id",
  "title",
  "output",
  "viewport",
  "storageState",
  "mapSlug",
  "posterAt",
  "pad",
  "audioAfterAction",
  "audioAfterActionMax",
  "hideSelectors",
  "scenes",
  "version",
]);

const SCENE_KEYS = new Set([
  "id",
  "action",
  "narration",
  "caption",
  "notes",
  "hold",
  "pad",
  "audioOffset",
  "audioAfterAction",
  "audioAfterActionMax",
  "highlight",
  "cursor",
  "assert",
  "zoom",
  "poster",
  "parkMouse",
  "url",
  "selector",
  "value",
  "key",
  "state",
  "delta",
  "from",
  "to",
  "latlng",
  "point",
  "block",
  "allowPartial",
  "card",
]);

const CARD_KEYS = new Set(["eyebrow", "title", "subtitle"]);

async function main() {
  const args = process.argv.slice(2);

  const scenarioPath = args.length
    ? path.resolve(process.cwd(), args[0])
    : DEFAULT_SCENARIO;

  if (!fs.existsSync(scenarioPath)) {
    throw new Error(`Scenario not found: ${scenarioPath}`);
  }

  const baseURL = resolveBaseURL();

  // fixtures.js reads WP_BASE_URL at import time, so set it before the require
  // below and before any module that requires it.
  process.env.WP_BASE_URL = baseURL;

  const fixtures = require("../../tests/e2e/fixtures.js");
  const browserLib = await import("./lib/browser.mjs");
  const cursorLib = await import("./lib/cursor.mjs");
  const highlightLib = await import("./lib/highlight.mjs");
  const { createTimeline } = await import("./lib/timeline.mjs");

  const scenario = JSON.parse(fs.readFileSync(scenarioPath, "utf8"));
  validateScenario(scenario);
  validateScenes(scenario);
  warnUnknownKeys(scenario);

  // A take that fails before its replay must not leave an earlier capture for
  // the build to pick up as if it belonged to this run.
  fs.rmSync(path.join(POSTER_WORK_DIR, `${scenario.id}.png`), {
    force: true,
  });

  const narrationPath = loadNarration(scenario);
  if (narrationPath) {
    console.log(
      `[video] Narration: ${path.relative(process.cwd(), narrationPath)}`,
    );
  }

  const audioTimings = loadAudioTimings(scenario.id);

  const mapSlug = scenario.mapSlug ?? "cape-scott-trail";
  let mapId;
  try {
    mapId = fixtures.getMap(mapSlug).id;
  } catch (error) {
    throw new Error(`Scenario "${scenario.id}": ${error.message}`);
  }

  const tokens = { baseURL, mapId: String(mapId) };
  const libs = {
    fixtures,
    browser: browserLib,
    cursor: cursorLib,
    highlight: highlightLib,
  };

  const browser = await browserLib.launchBrowser();

  try {
    const created = await browserLib.ensureStorageState(browser, baseURL);
    if (created) {
      console.log(
        `[video] Created ${path.relative(process.cwd(), browserLib.STORAGE_STATE_PATH)}.`,
      );
    }

    await browserLib.assertAuthenticated(browser, baseURL);

    const firstScene = scenario.scenes[0];
    const prewarmScene =
      firstScene &&
      (firstScene.action === "goto" || firstScene.action === "card")
        ? resolveScene(firstScene, tokens, firstScene.id)
        : null;

    if (prewarmScene) {
      const mapScene = scenario.scenes.find(
        (scene) => scene.action === "waitForMap",
      );

      await browserLib.warmUp(browser, baseURL, {
        target: prewarmTarget(prewarmScene),
        hideSelectors: scenario.hideSelectors ?? [],
        waitForMap: Boolean(mapScene),
        zoom: mapScene?.zoom,
      });
      console.log(
        `[video] Warm-up ${prewarmScene.action === "card" ? "card" : "navigation"} complete.`,
      );
    }

    const session = await browserLib.startRecording(browser, baseURL, {
      hideSelectors: scenario.hideSelectors ?? [],
      // Put the first scene on screen before t0 so the take opens on the fully
      // rendered scene instead of the blank page. A card is set into the page
      // by the same hook; a goto is navigated.
      prepare: prewarmScene
        ? (page) => prepareScene(page, prewarmScene)
        : undefined,
    });
    const timeline = createTimeline({
      id: scenario.id,
      viewport: browserLib.VIEWPORT,
      startedAt: session.startedAt,
    });

    let failure = null;
    let posterRequests = [];

    try {
      posterRequests = await runScenes(
        session,
        timeline,
        scenario,
        tokens,
        libs,
        audioTimings,
      );
    } catch (error) {
      failure = error;
    }

    let finish = null;
    try {
      const recordedScenes = timeline.scenes.filter(
        (scene) => scene.end !== null,
      );
      const expectedDuration = recordedScenes.length
        ? recordedScenes[recordedScenes.length - 1].end
        : null;

      finish = await browserLib.finishRecording(
        session,
        scenario.id,
        expectedDuration,
      );
    } catch (error) {
      failure = failure ?? error;
    }

    // The poster replay runs in its own context only after the take has
    // stopped recording. Keeping it out of the recording context means the
    // replay's wall-clock time cannot pad the encoded video with a frozen
    // frame.
    if (!failure) {
      try {
        for (const request of posterRequests) {
          const capture = await capturePosterReplay({
            session,
            scenario,
            tokens,
            libs,
            sceneIndex: request.sceneIndex,
            config: request.config,
          });

          timeline.setPosterCapture({
            sceneId: request.sceneId,
            ...capture,
          });
          console.log(
            `[video] Poster replay: ${capture.image.path} ` +
              `(${capture.image.width}x${capture.image.height} from ` +
              `${capture.crop.width}x${capture.crop.height} CSS px at ` +
              `${capture.scale}x; cursor ` +
              `${capture.overlays.cursor ? "present" : "absent"}).`,
          );
        }
      } catch (error) {
        failure = error;
      }
    }

    timeline.setVideo(
      finish
        ? {
            path: finish.path,
            duration: finish.duration,
            offset: finish.offset,
            wallClockDuration: finish.wallClockDuration,
            difference: finish.difference,
          }
        : {
            path: `work/raw/${scenario.id}.webm`,
            duration: null,
            offset: 0,
            wallClockDuration: null,
            difference: null,
          },
    );
    timeline.write(browserLib.TIMELINE_PATH);

    if (finish && finish.violations.length && !failure?.isViolation) {
      const violationError = new Error(
        browserLib.formatViolations(finish.violations),
      );
      violationError.isViolation = true;
      failure = failure
        ? new Error(`${failure.message}\n\n${violationError.message}`)
        : violationError;
    }

    printSummary(scenario, session, timeline, finish, failure);

    if (!audioTimings) {
      console.warn(
        "[video] WARNING: no audio timings found; using scenario holds.",
      );
    }

    if (failure) {
      throw failure;
    }
  } finally {
    await browser.close().catch(() => {});
  }
}

/**
 * Resolve WP_BASE_URL and refuse the project's development and tests
 * instances.
 *
 * @returns {string}
 */
function resolveBaseURL() {
  const value = (process.env.WP_BASE_URL ?? "http://localhost:11000")
    .trim()
    .replace(/\/+$/, "");

  if (!value) {
    throw new Error("WP_BASE_URL is empty.");
  }

  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`WP_BASE_URL is not a valid URL: ${value}`);
  }

  if (parsed.port === "8888" || parsed.port === "8889") {
    throw new Error(
      `Refusing to record against the development or tests instance: ${value}. ` +
        `Use the dedicated video instance on port 11000.`,
    );
  }

  return value;
}

/**
 * Validate the top-level scenario shape needed by the recorder.
 *
 * @param {object} scenario
 */
function validateScenario(scenario) {
  if (!scenario || typeof scenario !== "object" || Array.isArray(scenario)) {
    throw new Error("Scenario must be a JSON object.");
  }

  if (typeof scenario.id !== "string" || scenario.id.trim() === "") {
    throw new Error('Scenario is missing a non-empty string "id".');
  }

  if (!Array.isArray(scenario.scenes) || scenario.scenes.length === 0) {
    throw new Error(
      `Scenario "${scenario.id}" must contain a non-empty "scenes" array.`,
    );
  }

  if (scenario.viewport) {
    const { width, height } = scenario.viewport;
    if (width !== 1280 || height !== 720) {
      console.warn(
        `[video] Scenario viewport ${width}x${height} differs from the fixed ` +
          `recording viewport 1280x720; using 1280x720.`,
      );
    }
  }

  if (scenario.hideSelectors !== undefined) {
    if (!Array.isArray(scenario.hideSelectors)) {
      throw new Error(
        `Scenario "${scenario.id}": "hideSelectors" must be an array of CSS selectors.`,
      );
    }

    for (const selector of scenario.hideSelectors) {
      if (typeof selector !== "string" || selector.trim() === "") {
        throw new Error(
          `Scenario "${scenario.id}": every "hideSelectors" entry must be a non-empty string.`,
        );
      }
    }
  }

  if (
    scenario.pad !== undefined &&
    (typeof scenario.pad !== "number" ||
      !Number.isFinite(scenario.pad) ||
      scenario.pad < 0)
  ) {
    throw new Error(
      `Scenario "${scenario.id}": "pad" must be a non-negative number of seconds.`,
    );
  }

  validateAudioAfterAction(scenario, `Scenario "${scenario.id}"`);
}

/**
 * Validate every scene, including the action-specific fields the runner
 * requires, before the browser launches.
 *
 * @param {object} scenario
 */
function validateScenes(scenario) {
  for (let index = 0; index < scenario.scenes.length; index += 1) {
    const scene = scenario.scenes[index];
    const sceneId = validateScene(scene, index);
    validateSceneAction(scene, sceneId);
  }
}

/**
 * Validate the fields an action reads at run time. The recorder calls this
 * before launch so a malformed late scene cannot surface after earlier scenes
 * have already been recorded.
 *
 * @param {object} scene
 * @param {string} sceneId
 */
function validateSceneAction(scene, sceneId) {
  switch (scene.action) {
    case "goto":
      requireString(scene, sceneId, "url");
      break;

    case "card":
      validateCard(scene.card, sceneId);
      break;

    case "click":
    case "hover":
    case "scrollIntoView":
    case "waitFor":
      requireString(scene, sceneId, "selector");
      break;

    case "scrollTo": {
      const hasTo = scene.to !== undefined;
      const hasSelector = scene.selector !== undefined;

      if (!hasTo && !hasSelector) {
        throw new Error(
          `Scene "${sceneId}": action "scrollTo" requires "to" or "selector".`,
        );
      }

      if (hasTo && hasSelector) {
        throw new Error(
          `Scene "${sceneId}": action "scrollTo" accepts "to" or "selector", not both.`,
        );
      }

      if (hasTo && scene.to !== "top" && scene.to !== "bottom") {
        throw new Error(`Scene "${sceneId}": "to" must be "top" or "bottom".`);
      }

      if (hasSelector) {
        requireString(scene, sceneId, "selector");
      }
      break;
    }

    case "fill":
    case "select":
    case "assertText":
      requireString(scene, sceneId, "selector");
      requireString(scene, sceneId, "value", true);
      break;

    case "press":
      requireString(scene, sceneId, "selector");
      requireString(scene, sceneId, "key");
      break;

    case "dragMap":
      requireString(scene, sceneId, "selector");
      if (scene.delta !== undefined) {
        normalizePoint(scene.delta, sceneId, "delta");
      } else if (scene.from === undefined || scene.to === undefined) {
        throw new Error(
          `Scene "${sceneId}": action "dragMap" requires "from" and "to", or "delta".`,
        );
      }
      break;

    case "clickMapPoint":
      requireString(scene, sceneId, "selector");
      requireMapPoint(scene, sceneId);
      break;

    case "openPopup":
      if (scene.latlng === undefined && scene.point === undefined) {
        requireString(scene, sceneId, "selector");
      }
      break;

    case "poster":
      // The poster object is validated with the shared scene fields, before
      // the browser launches. The action itself only marks the poster beat.
      if (scene.poster !== undefined) {
        parsePosterConfig(scene.poster, sceneId);
      }
      break;

    case "waitForMap":
    case "pause":
      break;

    default:
      throw new Error(`Scene "${sceneId}": unknown action "${scene.action}".`);
  }
}

/**
 * Validate a card object. Unknown keys inside the card are rejected so a
 * misspelled `subtitel` cannot silently render an empty subtitle.
 *
 * @param {object} card
 * @param {string} sceneId
 */
function validateCard(card, sceneId) {
  if (!card || typeof card !== "object" || Array.isArray(card)) {
    throw new Error(
      `Scene "${sceneId}": action "card" requires a "card" object.`,
    );
  }

  if (typeof card.title !== "string" || card.title.trim() === "") {
    throw new Error(
      `Scene "${sceneId}": "card.title" must be a non-empty string.`,
    );
  }

  for (const field of ["eyebrow", "subtitle"]) {
    if (card[field] !== undefined && typeof card[field] !== "string") {
      throw new Error(
        `Scene "${sceneId}": "card.${field}" must be a string when present.`,
      );
    }
  }

  const unknown = Object.keys(card)
    .filter((key) => !CARD_KEYS.has(key))
    .sort();

  if (unknown.length) {
    throw new Error(
      `Scene "${sceneId}": "card" has unknown key(s): ${unknown.join(", ")}.`,
    );
  }
}

/**
 * Require either `latlng` or `point`, matching `resolveMapPoint`.
 *
 * @param {object} scene
 * @param {string} sceneId
 */
function requireMapPoint(scene, sceneId) {
  if (scene.latlng === undefined && scene.point === undefined) {
    throw new Error(
      `Scene "${sceneId}": action "${scene.action}" requires "latlng" or "point".`,
    );
  }
}

/**
 * Warn about keys the recorder does not recognise, so misspellings are visible
 * without rejecting forward-compatible scenario data.
 *
 * @param {object} scenario
 */
function warnUnknownKeys(scenario) {
  warnUnknownObjectKeys(`Scenario "${scenario.id}"`, scenario, SCENARIO_KEYS);

  for (const scene of scenario.scenes) {
    warnUnknownObjectKeys(`Scene "${scene.id}"`, scene, SCENE_KEYS);
  }
}

/**
 * @param {string} label
 * @param {object} value
 * @param {Set<string>} allowed
 */
function warnUnknownObjectKeys(label, value, allowed) {
  const unknown = Object.keys(value)
    .filter((key) => !allowed.has(key))
    .sort();

  if (unknown.length) {
    console.warn(
      `[video] WARNING: ${label} has unknown key(s): ${unknown.join(", ")}`,
    );
  }
}

/**
 * Validate the scenario- or scene-level narration delay fields.
 *
 * @param {object} value
 * @param {string} scope
 */
function validateAudioAfterAction(value, scope) {
  if (
    value.audioAfterAction !== undefined &&
    typeof value.audioAfterAction !== "boolean"
  ) {
    throw new Error(`${scope}: "audioAfterAction" must be a boolean.`);
  }

  if (
    value.audioAfterActionMax !== undefined &&
    (typeof value.audioAfterActionMax !== "number" ||
      !Number.isFinite(value.audioAfterActionMax) ||
      value.audioAfterActionMax < 0)
  ) {
    throw new Error(
      `${scope}: "audioAfterActionMax" must be a non-negative number of seconds.`,
    );
  }
}

/**
 * Load the audio timings produced by the TTS step, if any. The recorder treats
 * the file as authoritative for narrated scene holds.
 *
 * @param {string} scenarioId
 * @returns {object | null}
 */
function loadAudioTimings(scenarioId) {
  const filePath = path.join(
    VIDEO_DIR,
    "work",
    "audio",
    scenarioId,
    "timings.json",
  );

  if (!fs.existsSync(filePath)) {
    return null;
  }

  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    throw new Error(
      `Audio timings "${filePath}" is not valid JSON: ${error.message}`,
    );
  }

  if (!parsed || !Array.isArray(parsed.scenes)) {
    throw new Error(`Audio timings "${filePath}" has no "scenes" array.`);
  }

  for (const entry of parsed.scenes) {
    if (
      !entry ||
      typeof entry.id !== "string" ||
      !Number.isFinite(entry.duration) ||
      entry.duration <= 0
    ) {
      throw new Error(
        `Audio timings "${filePath}" has an invalid entry for scene ` +
          `"${entry?.id ?? "?"}".`,
      );
    }
  }

  console.log(
    `[video] Audio timings: ${path.relative(process.cwd(), filePath)}`,
  );

  return parsed;
}

/**
 * Resolve a scene's narration timing. For a narrated scene the narration
 * starts after the action has settled, capped by `audioAfterActionMax`; the
 * post-action hold is whatever remains of the scene's target duration. A
 * silent scene keeps its scenario hold.
 *
 * @param {object} scene
 * @param {object} scenario
 * @param {object | null} audioTimings
 * @returns {{ audio: string | null, audioDuration: number | null, hold: number, pad: number, afterAction: boolean, maxDelay: number, audioOffset: number | null }}
 */
function resolveTiming(scene, scenario, audioTimings) {
  const entry =
    audioTimings?.scenes.find((candidate) => candidate.id === scene.id) ?? null;

  if (entry) {
    return {
      audio:
        typeof entry.file === "string"
          ? entry.file
          : `work/audio/${scenario.id}/${scene.id}.wav`,
      audioDuration: entry.duration,
      hold: 0,
      pad: scene.pad ?? scenario.pad ?? 0.5,
      afterAction: scene.audioAfterAction ?? scenario.audioAfterAction ?? true,
      maxDelay:
        scene.audioAfterActionMax ?? scenario.audioAfterActionMax ?? 1.5,
      audioOffset: scene.audioOffset ?? null,
    };
  }

  return {
    audio: null,
    audioDuration: null,
    hold: scene.hold ?? 0,
    pad: 0,
    afterAction: true,
    maxDelay: 0,
    audioOffset: null,
  };
}

/**
 * Validate a scene and return its id.
 *
 * @param {object} scene
 * @param {number} index
 * @returns {string}
 */
function validateScene(scene, index) {
  if (!scene || typeof scene !== "object" || Array.isArray(scene)) {
    throw new Error(`Scene at index ${index} must be an object.`);
  }

  if (typeof scene.id !== "string" || scene.id.trim() === "") {
    throw new Error(
      `Scene at index ${index} is missing a non-empty string "id".`,
    );
  }

  if (typeof scene.action !== "string" || scene.action.trim() === "") {
    throw new Error(
      `Scene "${scene.id}" is missing a non-empty "action" field.`,
    );
  }

  if (
    scene.hold !== undefined &&
    (typeof scene.hold !== "number" ||
      !Number.isFinite(scene.hold) ||
      scene.hold < 0)
  ) {
    throw new Error(
      `Scene "${scene.id}": "hold" must be a non-negative number of seconds.`,
    );
  }

  if (
    scene.pad !== undefined &&
    (typeof scene.pad !== "number" ||
      !Number.isFinite(scene.pad) ||
      scene.pad < 0)
  ) {
    throw new Error(
      `Scene "${scene.id}": "pad" must be a non-negative number of seconds.`,
    );
  }

  if (
    scene.audioOffset !== undefined &&
    (typeof scene.audioOffset !== "number" ||
      !Number.isFinite(scene.audioOffset) ||
      scene.audioOffset < 0)
  ) {
    throw new Error(
      `Scene "${scene.id}": "audioOffset" must be a non-negative number of seconds.`,
    );
  }

  if (
    scene.highlight !== undefined &&
    scene.highlight !== null &&
    (typeof scene.highlight !== "object" ||
      typeof scene.highlight.selector !== "string" ||
      scene.highlight.selector.trim() === "")
  ) {
    throw new Error(
      `Scene "${scene.id}": "highlight" must be null or an object with a "selector".`,
    );
  }

  if (
    scene.highlight &&
    scene.highlight.pad !== undefined &&
    (typeof scene.highlight.pad !== "number" ||
      !Number.isFinite(scene.highlight.pad))
  ) {
    throw new Error(`Scene "${scene.id}": "highlight.pad" must be a number.`);
  }

  if (scene.cursor !== undefined && scene.cursor !== null) {
    validateCursor(scene.cursor, scene.id);
  }

  if (
    scene.assert !== undefined &&
    (!scene.assert ||
      typeof scene.assert !== "object" ||
      Array.isArray(scene.assert))
  ) {
    throw new Error(`Scene "${scene.id}": "assert" must be an object.`);
  }

  if (
    scene.zoom !== undefined &&
    (typeof scene.zoom !== "number" ||
      !Number.isFinite(scene.zoom) ||
      scene.zoom < 0)
  ) {
    throw new Error(
      `Scene "${scene.id}": "zoom" must be a non-negative number.`,
    );
  }

  if (scene.poster !== undefined) {
    parsePosterConfig(scene.poster, scene.id);
  }

  if (scene.parkMouse !== undefined && typeof scene.parkMouse !== "boolean") {
    throw new Error(`Scene "${scene.id}": "parkMouse" must be a boolean.`);
  }

  if (
    scene.block !== undefined &&
    scene.block !== "center" &&
    scene.block !== "start" &&
    scene.block !== "end"
  ) {
    throw new Error(
      `Scene "${scene.id}": "block" must be "center", "start" or "end".`,
    );
  }

  if (
    scene.allowPartial !== undefined &&
    typeof scene.allowPartial !== "boolean"
  ) {
    throw new Error(`Scene "${scene.id}": "allowPartial" must be a boolean.`);
  }

  validateAudioAfterAction(scene, `Scene "${scene.id}"`);

  return scene.id;
}

/**
 * @param {object} cursor
 * @param {string} sceneId
 */
function validateCursor(cursor, sceneId) {
  if (typeof cursor.to === "string" && cursor.to.trim() !== "") {
    return;
  }

  if (Number.isFinite(cursor.x) && Number.isFinite(cursor.y)) {
    return;
  }

  throw new Error(
    `Scene "${sceneId}": "cursor" must be { "to": "<selector>" } or ` +
      `{ "x": <number>, "y": <number> }.`,
  );
}

/**
 * Run every scene in order.
 *
 * @param {object} session
 * @param {object} timeline
 * @param {object} scenario
 * @param {{ baseURL: string, mapId: string }} tokens
 * @param {object} libs
 * @param {object | null} audioTimings
 */
async function runScenes(
  session,
  timeline,
  scenario,
  tokens,
  libs,
  audioTimings,
) {
  const { page, violations, t0, hideSelectors } = session;
  const posterRequests = [];

  for (let index = 0; index < scenario.scenes.length; index += 1) {
    const scene = scenario.scenes[index];
    const sceneId = validateScene(scene, index);
    const resolved = resolveScene(scene, tokens, sceneId);
    const timing = resolveTiming(scene, scenario, audioTimings);

    resolved.audio = timing.audio;
    resolved.audioDuration = timing.audioDuration;
    resolved.hold = timing.hold;

    const start = (Date.now() - t0) / 1000;
    timeline.beginScene(resolved, start);

    try {
      if (resolved.parkMouse) {
        await libs.cursor.moveCursorTo(
          page,
          PARK_MOUSE_POINT.x,
          PARK_MOUSE_POINT.y,
          { steps: 1 },
        );
      }

      const result = await runAction({
        page,
        scene: resolved,
        sceneId,
        libs,
      });

      if (resolved.action === "goto" && hideSelectors.length) {
        await libs.browser.applyHiddenSelectors(page, hideSelectors);
      }

      if (resolved.highlight) {
        await libs.highlight.showHighlight(page, resolved.highlight);
      } else {
        await libs.highlight.clearHighlight(page, { fade: false });
      }

      if (resolved.cursor === null) {
        await libs.cursor.hideCursor(page);
      } else if (resolved.cursor) {
        const alreadyThere =
          result?.cursorSelector &&
          resolved.cursor.to === result.cursorSelector;
        if (!alreadyThere) {
          await libs.cursor.applyCursor(
            page,
            resolved.cursor,
            pointerFramingOptions(libs.fixtures, resolved, sceneId),
          );
        }
      }

      if (resolved.assert) {
        await runAssertion(page, resolved.assert, sceneId);
      }

      assertNoViolations(violations, sceneId, libs.browser);
      const record = timeline.markActionEnd(sceneId, (Date.now() - t0) / 1000);
      const actionEnd = record.actionEnd;
      const audioOffset = timing.audioDuration
        ? (timing.audioOffset ??
          (timing.afterAction ? Math.min(actionEnd, timing.maxDelay) : 0))
        : 0;
      const holdSeconds = timing.audioDuration
        ? Math.max(
            0,
            audioOffset + timing.audioDuration + timing.pad - actionEnd,
          )
        : timing.hold;

      timeline.setAudioOffset(sceneId, audioOffset);
      timeline.setHold(sceneId, holdSeconds);
      await hold(page, holdSeconds);

      const posterConfig = posterConfigForScene(resolved, sceneId);

      if (posterConfig) {
        // Mark the end of the poster hold, while the intended overlays are
        // still visible and before the scene cleanup starts. The replay runs
        // after the take has finished recording, so it cannot lengthen the
        // encoded video; the marker still points at this frame.
        timeline.markPoster((Date.now() - t0) / 1000);

        posterRequests.push({
          sceneIndex: index,
          sceneId,
          config: posterConfig,
        });
      }

      assertNoViolations(violations, sceneId, libs.browser);
    } finally {
      await libs.cursor.clearCaret(page).catch(() => {});
      const end = (Date.now() - t0) / 1000;
      timeline.endScene(sceneId, end);
    }
  }

  return posterRequests;
}

/**
 * Resolve the poster configuration for a scene. A `poster` action always
 * captures, using the defaults when it has no payload; the flag form only
 * captures when it is true or an object.
 *
 * @param {object} scene
 * @param {string} sceneId
 * @returns {{ selector: string, aspect: string, pad: number } | null}
 */
function posterConfigForScene(scene, sceneId) {
  if (scene.action === "poster") {
    if (
      scene.poster === undefined ||
      scene.poster === null ||
      typeof scene.poster === "boolean"
    ) {
      return { ...POSTER_DEFAULTS };
    }

    return parsePosterConfig(scene.poster, sceneId);
  }

  return parsePosterConfig(scene.poster, sceneId);
}

/**
 * Replay the scenario up to and including the poster scene in a second,
 * unrecorded context, then capture a cropped 2x PNG.
 *
 * The replay uses the same action implementation and overlay handling as the
 * take, so the map view, open layers panel, selected basemap, highlight and
 * scroll position are reproduced rather than approximated.
 *
 * @param {{ session: object, scenario: object, tokens: object, libs: object, sceneIndex: number, config: { selector: string, aspect: string, pad: number } }} options
 * @returns {Promise<object>}
 */
async function capturePosterReplay({
  session,
  scenario,
  tokens,
  libs,
  sceneIndex,
  config,
}) {
  const sceneId = scenario.scenes[sceneIndex].id;
  let replay = null;

  try {
    replay = await libs.browser.startReplay(session.browser, session.baseURL, {
      hideSelectors: session.hideSelectors,
    });

    for (let index = 0; index <= sceneIndex; index += 1) {
      const scene = scenario.scenes[index];
      const id = validateScene(scene, index);
      const resolved = resolveScene(scene, tokens, id);

      await replayScene({
        page: replay.page,
        scene: resolved,
        sceneId: id,
        libs,
        hideSelectors: session.hideSelectors,
      });
    }

    // A fill scene would otherwise leave its fake caret in the still.
    await libs.cursor.clearCaret(replay.page);
    await replay.page
      .waitForFunction(
        () => {
          const element = document.getElementById("waymark-video-highlight");
          return (
            !element || Number(window.getComputedStyle(element).opacity) >= 0.99
          );
        },
        null,
        { timeout: 2000 },
      )
      .catch(() => {});
    await replay.page.evaluate(
      () =>
        new Promise((resolve) => {
          requestAnimationFrame(() => requestAnimationFrame(resolve));
        }),
    );

    const overlays = await replay.page.evaluate(() => {
      const highlight = document.getElementById("waymark-video-highlight");
      const bounds = highlight?.getBoundingClientRect();

      return {
        cursor: Boolean(document.getElementById("waymark-video-cursor")),
        caret: Boolean(document.getElementById("waymark-video-caret")),
        highlight: Boolean(highlight),
        highlightRect:
          highlight && bounds
            ? {
                x: bounds.x,
                y: bounds.y,
                width: bounds.width,
                height: bounds.height,
              }
            : null,
      };
    });

    const rect = await replay.page
      .locator(config.selector)
      .first()
      .evaluate((element) => {
        const bounds = element.getBoundingClientRect();
        return {
          x: bounds.x,
          y: bounds.y,
          width: bounds.width,
          height: bounds.height,
        };
      });

    const crop = computePosterCrop(
      rect,
      config,
      sceneId,
      libs.browser.VIEWPORT,
      { highlightRect: overlays.highlightRect },
    );

    if (crop.extended) {
      console.log(
        `[video] Poster crop extended beyond "${config.selector}" ` +
          `to include the highlight.`,
      );
    }
    const image = await capturePosterPng(replay.page, crop, scenario.id);

    if (replay.violations.length) {
      const error = new Error(
        `Scene "${sceneId}": poster replay failed the request guard.\n` +
          libs.browser.formatViolations(replay.violations),
      );
      error.isViolation = true;
      throw error;
    }

    return {
      selector: config.selector,
      aspect: config.aspect,
      pad: config.pad,
      crop,
      scale: POSTER_SCALE,
      image: {
        path: path.relative(VIDEO_DIR, image.path).split(path.sep).join("/"),
        width: image.width,
        height: image.height,
      },
      overlays,
    };
  } catch (error) {
    // Never leave a stale capture for the build to pick up after a failed
    // replay.
    fs.rmSync(path.join(POSTER_WORK_DIR, `${scenario.id}.png`), {
      force: true,
    });

    if (String(error.message).startsWith(`Scene "${sceneId}":`)) {
      throw error;
    }

    throw new Error(
      `Scene "${sceneId}": poster replay failed: ${error.message}`,
    );
  } finally {
    if (replay) {
      await replay.context.close().catch(() => {});
    }
  }
}

/**
 * Apply one scene's action and overlays during a replay. Narration, holds,
 * timeline bookkeeping and assertions are deliberately skipped.
 *
 * @param {{ page: import("@playwright/test").Page, scene: object, sceneId: string, libs: object, hideSelectors: string[] }} options
 */
async function replayScene({ page, scene, sceneId, libs, hideSelectors }) {
  if (scene.parkMouse) {
    await libs.cursor.moveCursorTo(
      page,
      PARK_MOUSE_POINT.x,
      PARK_MOUSE_POINT.y,
      { steps: 1 },
    );
  }

  const result = await runAction({
    page,
    scene,
    sceneId,
    libs,
    silent: true,
  });

  if (scene.action === "goto" && hideSelectors.length) {
    await libs.browser.applyHiddenSelectors(page, hideSelectors);
  }

  if (scene.highlight) {
    await libs.highlight.showHighlight(page, scene.highlight);
  } else {
    await libs.highlight.clearHighlight(page, { fade: false });
  }

  if (scene.cursor === null) {
    await libs.cursor.hideCursor(page);
  } else if (scene.cursor) {
    const alreadyThere =
      result?.cursorSelector && scene.cursor.to === result.cursorSelector;
    if (!alreadyThere) {
      await libs.cursor.applyCursor(
        page,
        scene.cursor,
        pointerFramingOptions(libs.fixtures, scene, sceneId),
      );
    }
  }
}

/**
 * Dispatch one action.
 *
 * @param {{ page: import("@playwright/test").Page, scene: object, sceneId: string, libs: object, silent?: boolean }} options
 * @returns {Promise<{ cursorSelector?: string, cursorPoint?: { x: number, y: number } }>}
 */
async function runAction({ page, scene, sceneId, libs, silent = false }) {
  const { fixtures, cursor } = libs;

  switch (scene.action) {
    case "goto": {
      const url = requireString(scene, sceneId, "url");

      // `setContent` keeps the previous URL, so a goto after a card must
      // navigate even when the URL string has not changed.
      const onCard = await isCardPage(page);

      if (onCard || !sameURL(page.url(), url)) {
        await navigateTo(page, url, scene);
      }

      return {};
    }

    case "card": {
      await showCard(page, scene.card);
      return {};
    }

    case "click": {
      const selector = requireString(scene, sceneId, "selector");
      await cursor.clickWithCursor(
        page,
        selector,
        pointerFramingOptions(fixtures, scene, sceneId),
      );
      return { cursorSelector: selector };
    }

    case "fill": {
      const selector = requireString(scene, sceneId, "selector");
      const value = requireString(scene, sceneId, "value", true);

      await cursor.moveCursorToSelector(
        page,
        selector,
        pointerFramingOptions(fixtures, scene, sceneId),
      );
      const locator = page.locator(selector).first();
      await locator.click();
      await locator.fill(value);
      if (!silent) {
        await cursor.showCaret(page, selector);
      }

      return { cursorSelector: selector };
    }

    case "select": {
      const selector = requireString(scene, sceneId, "selector");
      const value = requireString(scene, sceneId, "value", true);

      await cursor.moveCursorToSelector(
        page,
        selector,
        pointerFramingOptions(fixtures, scene, sceneId),
      );
      const locator = page.locator(selector).first();

      try {
        await locator.selectOption(value);
      } catch {
        await locator.selectOption({ label: value });
      }

      return { cursorSelector: selector };
    }

    case "press": {
      const selector = requireString(scene, sceneId, "selector");
      const key = requireString(scene, sceneId, "key");

      await cursor.moveCursorToSelector(
        page,
        selector,
        pointerFramingOptions(fixtures, scene, sceneId),
      );
      const locator = page.locator(selector).first();
      await locator.focus();
      await page.keyboard.press(key);

      return { cursorSelector: selector };
    }

    case "hover": {
      const selector = requireString(scene, sceneId, "selector");
      await cursor.moveCursorToSelector(
        page,
        selector,
        pointerFramingOptions(fixtures, scene, sceneId),
      );
      return { cursorSelector: selector };
    }

    case "scrollIntoView": {
      const selector = requireString(scene, sceneId, "selector");
      await settleElement(page, selector, fixtures, {
        sceneId,
        block: scene.block,
        allowPartial: scene.allowPartial,
      });
      return {};
    }

    case "scrollTo": {
      if (scene.selector !== undefined) {
        const selector = requireString(scene, sceneId, "selector");
        await settleElement(page, selector, fixtures, {
          sceneId,
          block: scene.block,
          allowPartial: scene.allowPartial,
        });
        return {};
      }

      const to = requireString(scene, sceneId, "to");
      await page.evaluate((where) => {
        const top =
          where === "bottom" ? document.documentElement.scrollHeight : 0;
        window.scrollTo(0, top);
      }, to);

      await fixtures.waitForLayoutStable(
        async () =>
          page.evaluate(() => ({
            scrollY: Math.round(window.scrollY),
            height: Math.round(document.documentElement.scrollHeight),
          })),
        { quietMs: 250, pollMs: 100, timeoutMs: 5000 },
      );

      return {};
    }

    case "waitFor": {
      const selector = requireString(scene, sceneId, "selector");
      const state = scene.state === "attached" ? "attached" : "visible";
      await page.locator(selector).first().waitFor({ state });
      return {};
    }

    case "waitForMap": {
      await page.waitForFunction(
        () => Boolean(window.Waymark && window.Waymark.map),
        null,
        { timeout: 30000 },
      );
      await fixtures.settleMap(page);

      if (scene.zoom !== undefined) {
        // A scenario may pin the zoom so the framing matches the frozen tile
        // pack. Set it without animation, then settle the new tile batch.
        await page.evaluate((zoom) => {
          if (window.Waymark && window.Waymark.map) {
            window.Waymark.map.setZoom(zoom, { animate: false });
          }
        }, scene.zoom);
        await fixtures.settleMap(page);
      }

      return {};
    }

    case "dragMap": {
      const selector = requireString(scene, sceneId, "selector");
      const container = page.locator(selector).first();
      await container.waitFor({ state: "visible" });

      const box = await container.boundingBox();
      if (!box) {
        throw new Error(
          `Scene "${sceneId}": cannot drag "${selector}" because it has no box.`,
        );
      }

      let start;
      let end;

      if (scene.delta !== undefined) {
        const delta = normalizePoint(scene.delta, sceneId, "delta");
        start = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
        end = { x: start.x + delta.x, y: start.y + delta.y };
      } else {
        if (scene.from === undefined || scene.to === undefined) {
          throw new Error(
            `Scene "${sceneId}": action "dragMap" requires "from" and "to", or "delta".`,
          );
        }

        start = await resolveMapRelativePoint(
          page,
          scene.from,
          box,
          sceneId,
          "from",
        );
        end = await resolveMapRelativePoint(page, scene.to, box, sceneId, "to");
      }

      await cursor.moveCursorTo(page, start.x, start.y);
      await page.mouse.down();
      await page.mouse.move(end.x, end.y, { steps: 24 });
      await page.mouse.up();
      await fixtures.settleMap(page);

      return { cursorPoint: end };
    }

    case "clickMapPoint": {
      const selector = requireString(scene, sceneId, "selector");
      const target = await resolveMapPoint(page, selector, scene, sceneId);

      await cursor.moveCursorTo(page, target.x, target.y);
      await page.mouse.click(target.x, target.y);
      await page.waitForTimeout(150);

      return { cursorPoint: target };
    }

    case "openPopup": {
      let result;

      if (scene.latlng !== undefined || scene.point !== undefined) {
        const selector =
          typeof scene.selector === "string" && scene.selector !== ""
            ? scene.selector
            : null;
        const target = await resolveMapPoint(page, selector, scene, sceneId);

        await cursor.moveCursorTo(page, target.x, target.y);
        await page.mouse.click(target.x, target.y);
        result = { cursorPoint: target };
      } else {
        const selector = requireString(scene, sceneId, "selector");
        await cursor.clickWithCursor(
          page,
          selector,
          pointerFramingOptions(fixtures, scene, sceneId),
        );
        result = { cursorSelector: selector };
      }

      await page
        .locator(".leaflet-popup")
        .first()
        .waitFor({ state: "visible", timeout: 15000 });

      return result;
    }

    case "pause":
      return {};

    case "poster":
      return {};

    case "assertText": {
      const selector = requireString(scene, sceneId, "selector");
      const value = requireString(scene, sceneId, "value", true);

      const locator = page.locator(selector).first();
      await locator.waitFor({ state: "visible", timeout: 15000 });
      const text = await locator.innerText();

      if (!text.includes(value)) {
        throw new Error(
          `Scene "${sceneId}": expected "${selector}" to contain "${value}", ` +
            `but it contains "${text}".`,
        );
      }

      return {};
    }

    default:
      throw new Error(`Scene "${sceneId}": unknown action "${scene.action}".`);
  }
}

/**
 * Describe the first scene as a pre-warm target. A card is local HTML, so it
 * has no URL to navigate to and no WordPress map to settle.
 *
 * @param {object} scene
 * @returns {{ kind: "card", card: object } | { kind: "goto", url: string, selector?: string }}
 */
function prewarmTarget(scene) {
  if (scene.action === "card") {
    return { kind: "card", card: scene.card };
  }

  return { kind: "goto", url: scene.url, selector: scene.selector };
}

/**
 * Put the first scene on screen before t0. The pre-warm uses the same hook for
 * every first action, so a card cannot regress to a blank opening.
 *
 * @param {import("@playwright/test").Page} page
 * @param {object} scene
 */
async function prepareScene(page, scene) {
  if (scene.action === "card") {
    await showCard(page, scene.card);
    return;
  }

  await navigateTo(page, scene.url, scene);
}

/**
 * Navigate the page and wait until the scene is usable. This is the wait the
 * `goto` action performs, shared with the pre-warm navigation.
 *
 * @param {import("@playwright/test").Page} page
 * @param {string} url
 * @param {object} scene
 */
async function navigateTo(page, url, scene) {
  await page.goto(url, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready.then(() => undefined));

  if (typeof scene.selector === "string" && scene.selector !== "") {
    await page.locator(scene.selector).first().waitFor({ state: "visible" });
  }
}

/**
 * Compare two URLs, ignoring a trailing-slash difference.
 *
 * @param {string} current
 * @param {string} target
 * @returns {boolean}
 */
function sameURL(current, target) {
  const stripTrailingSlash = (value) => value.replace(/\/+$/, "");
  return (
    current === target ||
    stripTrailingSlash(current) === stripTrailingSlash(target)
  );
}

/**
 * Resolve a map-relative point for `dragMap`. Pixel values are offsets from the
 * map container's top-left; selector values resolve to the element centre.
 *
 * @param {import("@playwright/test").Page} page
 * @param {unknown} value
 * @param {{ x: number, y: number, width: number, height: number }} box
 * @param {string} sceneId
 * @param {string} field
 * @returns {Promise<{ x: number, y: number }>}
 */
async function resolveMapRelativePoint(page, value, box, sceneId, field) {
  if (typeof value === "string") {
    return page
      .locator(value)
      .first()
      .evaluate((element) => {
        const bounds = element.getBoundingClientRect();
        return {
          x: bounds.x + bounds.width / 2,
          y: bounds.y + bounds.height / 2,
        };
      });
  }

  if (Array.isArray(value)) {
    return { x: box.x + Number(value[0]), y: box.y + Number(value[1]) };
  }

  if (value && typeof value.selector === "string") {
    const centre = await page
      .locator(value.selector)
      .first()
      .evaluate((element) => {
        const bounds = element.getBoundingClientRect();
        return {
          x: bounds.x + bounds.width / 2,
          y: bounds.y + bounds.height / 2,
        };
      });
    return centre;
  }

  if (value && Number.isFinite(value.x) && Number.isFinite(value.y)) {
    return { x: box.x + value.x, y: box.y + value.y };
  }

  throw new Error(
    `Scene "${sceneId}": "${field}" must be { "x": <number>, "y": <number> }, ` +
      `[x, y], a selector, or { "selector": "..." }.`,
  );
}

/**
 * Convert a scenario `latlng` or `point` into viewport coordinates.
 *
 * @param {import("@playwright/test").Page} page
 * @param {string} selector
 * @param {object} scene
 * @param {string} sceneId
 * @returns {Promise<{ x: number, y: number, mapX: number, mapY: number }>}
 */
async function resolveMapPoint(page, selector, scene, sceneId) {
  if (scene.latlng === undefined && scene.point === undefined) {
    throw new Error(
      `Scene "${sceneId}": action "${scene.action}" requires "latlng" or "point".`,
    );
  }
  const result = await page.evaluate(
    ({ selector: mapSelector, latlng, point }) => {
      const element = mapSelector ? document.querySelector(mapSelector) : null;
      if (mapSelector && !element) {
        return { error: `selector "${mapSelector}" was not found` };
      }

      const candidates = [];

      if (window.Waymark && window.Waymark.map) {
        candidates.push(window.Waymark.map);
      }

      if (
        window.Waymark_Map_Factory &&
        Array.isArray(window.Waymark_Map_Factory.instances)
      ) {
        for (const instance of window.Waymark_Map_Factory.instances) {
          if (instance && instance.map) {
            candidates.push(instance.map);
          }
        }
      }

      if (element && window.jQuery) {
        const waymark = window.jQuery(element).data("Waymark");
        if (waymark && waymark.map) {
          candidates.push(waymark.map);
        }
      }

      const map = element
        ? (candidates.find(
            (candidate) => candidate && candidate.getContainer() === element,
          ) ??
          candidates.find(
            (candidate) =>
              candidate && element.contains(candidate.getContainer()),
          ) ??
          null)
        : (candidates[0] ?? null);

      if (!map) {
        return {
          error: mapSelector
            ? `no Leaflet map is associated with "${mapSelector}"`
            : "no Leaflet map was found on the page",
        };
      }

      const container = map.getContainer();
      const bounds = container.getBoundingClientRect();
      let mapPoint;

      if (latlng !== undefined && latlng !== null) {
        const coordinates = Array.isArray(latlng)
          ? window.L.latLng(latlng[0], latlng[1])
          : window.L.latLng(latlng.lat ?? latlng[0], latlng.lng ?? latlng[1]);
        mapPoint = map.latLngToContainerPoint(coordinates);
      } else {
        const coordinates = Array.isArray(point) ? point : [point.x, point.y];
        mapPoint = window.L.point(coordinates[0], coordinates[1]);
      }

      return {
        x: bounds.left + mapPoint.x,
        y: bounds.top + mapPoint.y,
        mapX: mapPoint.x,
        mapY: mapPoint.y,
      };
    },
    {
      selector,
      latlng: scene.latlng ?? null,
      point: scene.point ?? null,
    },
  );

  if (result.error) {
    throw new Error(`Scene "${sceneId}": ${result.error}.`);
  }

  return result;
}

/**
 * Assert a scenario `assert` block after an action.
 *
 * @param {import("@playwright/test").Page} page
 * @param {object} assertion
 * @param {string} sceneId
 */
async function runAssertion(page, assertion, sceneId) {
  for (const field of ["minCount", "checked", "value"]) {
    if (
      assertion[field] !== undefined &&
      (typeof assertion.selector !== "string" ||
        assertion.selector.trim() === "")
    ) {
      throw new Error(
        `Scene "${sceneId}": an assert with "${field}" requires a "selector".`,
      );
    }
  }

  if (assertion.minCount !== undefined) {
    if (!Number.isInteger(assertion.minCount) || assertion.minCount < 0) {
      throw new Error(
        `Scene "${sceneId}": "assert.minCount" must be a non-negative integer.`,
      );
    }

    const locator = page.locator(assertion.selector);
    const reached = await waitForCondition(
      page,
      async () => (await locator.count()) >= assertion.minCount,
    );

    if (!reached) {
      const count = await locator.count();
      throw new Error(
        `Scene "${sceneId}": expected at least ${assertion.minCount} matches ` +
          `for "${assertion.selector}", but found ${count}.`,
      );
    }
  }

  if (assertion.checked !== undefined) {
    if (typeof assertion.checked !== "boolean") {
      throw new Error(
        `Scene "${sceneId}": "assert.checked" must be a boolean.`,
      );
    }

    const locator = page.locator(assertion.selector).first();
    const matched = await waitForCondition(
      page,
      async () =>
        (await locator.isChecked().catch(() => false)) === assertion.checked,
    );

    if (!matched) {
      const actual = await locator.isChecked().catch(() => false);
      throw new Error(
        `Scene "${sceneId}": expected "${assertion.selector}" to be ${
          assertion.checked ? "checked" : "unchecked"
        }, but it is ${actual ? "checked" : "unchecked"}.`,
      );
    }
  }

  if (assertion.value !== undefined) {
    if (typeof assertion.value !== "string") {
      throw new Error(`Scene "${sceneId}": "assert.value" must be a string.`);
    }

    const locator = page.locator(assertion.selector).first();
    const matched = await waitForCondition(page, async () =>
      (await locator.inputValue().catch(() => "")).includes(assertion.value),
    );

    if (!matched) {
      const actual = await locator.inputValue().catch(() => "");
      throw new Error(
        `Scene "${sceneId}": expected "${assertion.selector}" to have a value ` +
          `containing "${assertion.value}", but it is "${actual}".`,
      );
    }
  }

  if (assertion.selector !== undefined) {
    const locator = page.locator(assertion.selector).first();

    if (assertion.visible !== undefined) {
      await locator.waitFor({
        state: assertion.visible ? "visible" : "hidden",
        timeout: 15000,
      });
    } else if (
      assertion.text === undefined &&
      assertion.minCount === undefined &&
      assertion.checked === undefined &&
      assertion.value === undefined
    ) {
      await locator.waitFor({ state: "visible", timeout: 15000 });
    }
  } else if (assertion.visible !== undefined) {
    throw new Error(
      `Scene "${sceneId}": an assert with "visible" requires a "selector".`,
    );
  }

  if (assertion.text !== undefined) {
    const locator = assertion.selector
      ? page.locator(assertion.selector).first()
      : page.locator("body");

    await locator.waitFor({ state: "visible", timeout: 15000 }).catch(() => {});

    const text = await locator.innerText().catch(() => "");
    if (!text.includes(assertion.text)) {
      const scope = assertion.selector ? ` in "${assertion.selector}"` : "";
      throw new Error(
        `Scene "${sceneId}": expected text "${assertion.text}"${scope}, but it was not present.`,
      );
    }
  }

  if (assertion.url !== undefined) {
    const current = page.url();
    if (!current.includes(assertion.url)) {
      throw new Error(
        `Scene "${sceneId}": expected the URL to contain "${assertion.url}", ` +
          `but it was "${current}".`,
      );
    }
  }
}

/**
 * Poll a condition until it is truthy or the timeout expires.
 *
 * @param {import("@playwright/test").Page} page
 * @param {() => Promise<boolean>} condition
 * @param {number} [timeoutMs]
 * @returns {Promise<boolean>}
 */
async function waitForCondition(page, condition, timeoutMs = 15000) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    if (await condition()) {
      return true;
    }
    await page.waitForTimeout(100);
  }

  return condition();
}

/**
 * Wait for an element and its layout to settle after a scroll. Framing,
 * including the admin-bar inset and the post-scroll visibility check, is
 * delegated to the shared helper.
 *
 * @param {import("@playwright/test").Page} page
 * @param {string} selector
 * @param {object} fixtures
 * @param {{ sceneId?: string, block?: "center" | "start" | "end", allowPartial?: boolean }} [options]
 */
async function settleElement(page, selector, fixtures, options = {}) {
  const locator = page.locator(selector).first();
  await locator.waitFor({ state: "visible" });

  const measure = async () => {
    const box = await locator.boundingBox();
    if (!box) {
      return null;
    }
    return {
      x: Math.round(box.x),
      y: Math.round(box.y),
      width: Math.round(box.width),
      height: Math.round(box.height),
    };
  };

  const settle = (sample) =>
    fixtures.waitForLayoutStable(sample, {
      quietMs: 250,
      pollMs: 100,
      timeoutMs: 5000,
    });

  const result = await ensureVisible(page, locator, {
    selector,
    sceneId: options.sceneId,
    block: options.block,
    allowPartial: options.allowPartial,
    settle,
  });

  // `scrollIntoView` and `scrollTo` are explicit framing beats, so wait for
  // layout even when the target was already visible and no scroll happened.
  if (!result.scrolled) {
    await settle(measure);
  }
}

/**
 * Read a required string field.
 *
 * @param {object} scene
 * @param {string} sceneId
 * @param {string} field
 * @param {boolean} [allowEmpty]
 * @returns {string}
 */
function requireString(scene, sceneId, field, allowEmpty = false) {
  const value = scene[field];
  const valid = typeof value === "string" && (allowEmpty || value.length > 0);

  if (!valid) {
    const requirement = allowEmpty
      ? `a string "${field}" field`
      : `a non-empty string "${field}" field`;
    throw new Error(
      `Scene "${sceneId}": action "${scene.action}" requires ${requirement}.`,
    );
  }

  return value;
}

/**
 * @param {unknown} value
 * @param {string} sceneId
 * @param {string} field
 * @returns {{ x: number, y: number }}
 */
function normalizePoint(value, sceneId, field) {
  if (
    Array.isArray(value) &&
    Number.isFinite(value[0]) &&
    Number.isFinite(value[1])
  ) {
    return { x: Number(value[0]), y: Number(value[1]) };
  }

  if (value && Number.isFinite(value.x) && Number.isFinite(value.y)) {
    return { x: value.x, y: value.y };
  }

  throw new Error(
    `Scene "${sceneId}": "${field}" must be { "x": <number>, "y": <number> } or [x, y].`,
  );
}

/**
 * Pointer framing for hover and click: bring the target into the inset
 * viewport when it is not fully visible, wait for the layout to settle, then
 * move the pointer. An element that is already fully in view is left in place,
 * so hovering the Leaflet layers control never moves the page under the
 * pointer.
 *
 * @param {object} fixtures
 * @param {object} [scene]
 * @param {string} [sceneId]
 * @returns {{ centre: boolean, sceneId?: string, block?: "center" | "start" | "end", allowPartial: boolean, settle: (measure: () => Promise<object | null>) => Promise<void> }}
 */
function pointerFramingOptions(fixtures, scene, sceneId) {
  return {
    centre: true,
    sceneId,
    block: scene?.block,
    allowPartial: scene?.allowPartial === true,
    settle: (measure) =>
      fixtures.waitForLayoutStable(measure, {
        quietMs: 250,
        pollMs: 100,
        timeoutMs: 5000,
      }),
  };
}

/**
 * Clamp the scene hold and wait.
 *
 * @param {import("@playwright/test").Page} page
 * @param {number | undefined} seconds
 */
async function hold(page, seconds) {
  if (!seconds || seconds <= 0) {
    return;
  }

  await page.waitForTimeout(Math.round(seconds * 1000));
}

/**
 * Resolve template tokens in one action field.
 *
 * @param {string} value
 * @param {{ baseURL: string, mapId: string }} tokens
 * @param {string} sceneId
 * @returns {string}
 */
function resolveTokens(value, tokens, sceneId) {
  const resolved = value
    .replace(/\{\{baseURL\}\}/g, tokens.baseURL)
    .replace(/\{\{mapId\}\}/g, tokens.mapId);

  const remaining = resolved.match(/\{\{[^}]+\}\}/);
  if (remaining) {
    throw new Error(
      `Scene "${sceneId}": unresolved template token "${remaining[0]}" in "${value}".`,
    );
  }

  return resolved;
}

/**
 * Clone a scene and resolve tokens in every recording-relevant field.
 *
 * @param {object} scene
 * @param {{ baseURL: string, mapId: string }} tokens
 * @param {string} sceneId
 * @returns {object}
 */
function resolveScene(scene, tokens, sceneId) {
  const resolved = { ...scene };

  for (const field of ["url", "selector", "value", "key"]) {
    if (typeof resolved[field] === "string") {
      resolved[field] = resolveTokens(resolved[field], tokens, sceneId);
    }
  }

  if (resolved.highlight && typeof resolved.highlight === "object") {
    resolved.highlight = { ...resolved.highlight };
    if (typeof resolved.highlight.selector === "string") {
      resolved.highlight.selector = resolveTokens(
        resolved.highlight.selector,
        tokens,
        sceneId,
      );
    }
  }

  if (resolved.poster && typeof resolved.poster === "object") {
    resolved.poster = { ...resolved.poster };
    if (typeof resolved.poster.selector === "string") {
      resolved.poster.selector = resolveTokens(
        resolved.poster.selector,
        tokens,
        sceneId,
      );
    }
  }

  if (resolved.cursor && typeof resolved.cursor.to === "string") {
    resolved.cursor = {
      ...resolved.cursor,
      to: resolveTokens(resolved.cursor.to, tokens, sceneId),
    };
  }

  if (resolved.assert && typeof resolved.assert === "object") {
    resolved.assert = { ...resolved.assert };
    for (const field of ["selector", "text", "url"]) {
      if (typeof resolved.assert[field] === "string") {
        resolved.assert[field] = resolveTokens(
          resolved.assert[field],
          tokens,
          sceneId,
        );
      }
    }
  }

  for (const field of ["from", "to"]) {
    if (typeof resolved[field] === "string") {
      resolved[field] = resolveTokens(resolved[field], tokens, sceneId);
    } else if (
      resolved[field] &&
      typeof resolved[field].selector === "string"
    ) {
      resolved[field] = {
        ...resolved[field],
        selector: resolveTokens(resolved[field].selector, tokens, sceneId),
      };
    }
  }

  return resolved;
}

/**
 * Throw a scene-scoped error when the request guard has recorded a violation.
 *
 * @param {Array<object>} violations
 * @param {string} sceneId
 * @param {object} browserLib
 */
function assertNoViolations(violations, sceneId, browserLib) {
  if (!violations.length) {
    return;
  }

  const error = new Error(
    `Scene "${sceneId}" failed the request guard.\n${browserLib.formatViolations(
      violations,
    )}`,
  );
  error.isViolation = true;
  throw error;
}

/**
 * @param {object} scenario
 * @param {object} session
 * @param {object} timeline
 * @param {object | null} finish
 * @param {Error | null} failure
 */
function printSummary(scenario, session, timeline, finish, failure) {
  const title = scenario.title ? ` — ${scenario.title}` : "";

  console.log(`\n[video] ${scenario.id}${title}`);

  for (const scene of timeline.scenes) {
    const end = scene.end === null ? "?" : scene.end.toFixed(3);
    const duration =
      scene.end === null ? "?" : (scene.end - scene.start).toFixed(3);
    const audioOffset =
      scene.audioOffset === null ? "-" : scene.audioOffset.toFixed(3);
    console.log(
      `[video]   ${scene.id}: ${scene.start.toFixed(3)}s – ${end}s ` +
        `(${scene.action}, audioOffset ${audioOffset}, duration ${duration}s)`,
    );
  }

  if (finish) {
    console.log(
      `[video] Raw video: scripts/video/work/raw/${scenario.id}.webm`,
    );
    console.log(
      `[video] Video duration: ${
        finish.duration === null ? "unknown" : `${finish.duration.toFixed(3)}s`
      }`,
    );
    console.log(
      `[video] Wall-clock duration: ${finish.wallClockDuration.toFixed(3)}s`,
    );
    console.log(
      `[video] Video/wall difference: ${
        finish.difference === null
          ? "unknown"
          : `${finish.difference.toFixed(3)}s`
      }`,
    );
  }

  console.log("[video] Timeline: scripts/video/work/timeline.json");
  console.log(
    `[video] Request guard: ${
      finish ? finish.violations.length : session.violations.length
    } violation(s)`,
  );

  if (failure) {
    console.error(`[video] FAILED: ${failure.message}`);
  } else {
    console.log("[video] Take completed.");
  }
}

function printUsage() {
  console.log(
    [
      "Usage:",
      "  node scripts/video/record.mjs [scenario.json]",
      "",
      "The scenario defaults to changing-basemaps. Run from the repository root.",
      "WP_BASE_URL defaults to http://localhost:11000.",
      "",
      "The raw take is written to scripts/video/work/raw/<id>.webm and timing",
      "to scripts/video/work/timeline.json.",
    ].join("\n"),
  );
}

main().catch((error) => {
  console.error(`[video] ${error.stack ?? error.message}`);
  process.exitCode = 1;
});
