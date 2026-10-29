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

import { hideCard, showCard } from "./lib/card.mjs";
import { ensureVisible } from "./lib/framing.mjs";
import { loadNarration } from "./lib/narration.mjs";
import { createTimeline, timelinePath } from "./lib/timeline.mjs";
import {
  POSTER_DEFAULTS,
  POSTER_SCALE,
  POSTER_WORK_DIR,
  capturePosterPng,
  computePosterCrop,
  parsePosterConfig,
} from "./lib/poster.mjs";
import {
  assertFreshStamp,
  resolveLexiconPath,
  resolveNarrationIdentity,
} from "./lib/tts/stamp.mjs";
import { loadDotEnv } from "./lib/tts/shared.mjs";

const require = createRequire(import.meta.url);
const VIDEO_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(VIDEO_DIR, "..", "..");

// A neutral point in the blank centre of the WordPress admin bar. No admin bar
// item sits there at 1280x720, so parking the real pointer clears hover-only
// affordances without opening a menu or tooltip.
const PARK_MOUSE_POINT = { x: 640, y: 8 };

// A card is a static frame, so the capture encoder needs a moment to settle
// after the first paint. The pre-warm is recorded but skipped by the build, so
// holding the card briefly before the timeline origin keeps the encoder's
// initial transient out of the delivered video.
const CARD_PREWARM_SETTLE_MS = 3500;

// A fixed beat between the UI action settling and the voice starting. Without
// it the narration begins on the same frame as the action, which feels abrupt;
// `jcut` can pull the line earlier from here.
const LEAD_BEAT = 0.3;

// How long the replayed page must hold still before the poster is drawn. The
// take has a narration-length hold after each action, but the poster replay
// moves straight on, so a Leaflet popup pan or a late layout pass can still be
// running when the action returns. Fixed overlays are painted in viewport
// coordinates, so a target that moves after the outline is drawn leaves it out
// of register with the page content.
const POSTER_REPLAY_SETTLE_QUIET_MS = 300;

// The recorded take can open a popup or scroll the page after its action has
// returned, so the highlighted target may still be moving when the outline is
// first drawn. The outline is fixed in viewport coordinates, so it is kept on
// the target until the geometry settles. The follow runs inside the scene's
// existing hold, not before the action end, so it neither lengthens the scene
// nor moves narration.
const TAKE_HIGHLIGHT_TRACK_QUIET_MS = 160;
const TAKE_HIGHLIGHT_TRACK_TIMEOUT_MS = 2000;

// Scenario-level selectors to hide. Kept here so `navigateTo` can reapply them
// the moment a navigation commits, rather than waiting for the action to end.
let activeHideSelectors = [];

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
  "jcut",
  "minHold",
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
  "jcut",
  "minHold",
  "audioOffset",
  "audioAfterAction",
  "audioAfterActionMax",
  "highlight",
  "cursor",
  "assert",
  "zoom",
  "poster",
  "parkMouse",
  "anonymous",
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
  loadDotEnv(REPO_ROOT, "record");

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
  validateNarrationStamp(scenario, narrationPath, audioTimings);

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

    // A card is now an overlay, so its pre-warm must load the page it will
    // eventually reveal. Point it at the first non-card goto scene, which is
    // the first real page the take will show.
    const cardPageSource =
      prewarmScene?.action === "card"
        ? scenario.scenes.find((scene) => scene.action === "goto")
        : null;
    const cardPageScene = cardPageSource
      ? resolveScene(cardPageSource, tokens, cardPageSource.id)
      : null;
    const mapScene = scenario.scenes.find(
      (scene) => scene.action === "waitForMap",
    );

    // A card is an overlay over the page it reveals, so that page must be
    // warmed in the cookie state the take will show it in. Warming the page
    // authenticated and then reloading it for an anonymous scene leaves the
    // old admin-bar document on screen until the new one paints.
    const prewarmAnonymous =
      prewarmScene?.action === "card"
        ? cardPageScene?.anonymous === true
        : prewarmScene?.anonymous === true;

    if (prewarmScene) {
      const warmTarget =
        prewarmScene.action === "goto"
          ? navigationTarget(prewarmScene)
          : navigationTarget(cardPageScene);

      await browserLib.warmUp(browser, baseURL, {
        target: warmTarget,
        card: prewarmScene.action === "card" ? prewarmScene.card : null,
        hideSelectors: scenario.hideSelectors ?? [],
        waitForMap: Boolean(mapScene && warmTarget),
        zoom: mapScene?.zoom,
        anonymous: prewarmAnonymous,
      });
      console.log(
        `[video] Warm-up ${prewarmScene.action === "card" ? "card" : "navigation"} complete.`,
      );
    }

    const session = await browserLib.startRecording(browser, baseURL, {
      hideSelectors: scenario.hideSelectors ?? [],
      // Put the first scene on screen before t0 so the take opens on the fully
      // rendered scene instead of the blank page. A card is injected as an
      // overlay over its already-warmed page; a goto is navigated.
      prepare: prewarmScene
        ? (page) =>
            prepareScene(page, prewarmScene, {
              pageScene: cardPageScene,
              hideSelectors: scenario.hideSelectors ?? [],
              waitForMap: Boolean(mapScene && cardPageScene),
              fixtures: libs.fixtures,
              applyHiddenSelectors: browserLib.applyHiddenSelectors,
            })
        : undefined,
      anonymous: prewarmAnonymous,
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
      assertNoNarrationCollision(timeline);
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
    timeline.write(timelinePath(scenario.id));

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

  validateJcut(scenario.jcut, `Scenario "${scenario.id}"`);
  validateMinHold(scenario.minHold, `Scenario "${scenario.id}"`);

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
 * Validate an optional J-cut. A J-cut pulls narration earlier, so it is a
 * non-negative number of seconds no larger than the upper bound the timing
 * model supports.
 *
 * @param {number | undefined} value
 * @param {string} scope
 */
function validateJcut(value, scope) {
  if (value === undefined) {
    return;
  }

  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < 0 ||
    value > 2.0
  ) {
    const shown = typeof value === "number" ? value : JSON.stringify(value);
    throw new Error(
      `${scope}: "jcut" must be a number between 0 and 2 seconds (got ${shown}).`,
    );
  }
}

/**
 * Validate the optional minimum scene hold.
 *
 * @param {number | undefined} value
 * @param {string} scope
 */
function validateMinHold(value, scope) {
  if (value === undefined) {
    return;
  }

  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new Error(
      `${scope}: "minHold" must be a non-negative number of seconds.`,
    );
  }
}

/**
 * Validate an explicit narration offset. A J-cut can place narration before
 * the scene start, so a small negative value is valid.
 *
 * @param {number | undefined} value
 * @param {string} scope
 */
function validateAudioOffset(value, scope) {
  if (value === undefined) {
    return;
  }

  if (typeof value !== "number" || !Number.isFinite(value) || value < -2.0) {
    throw new Error(
      `${scope}: "audioOffset" must be a number of seconds no less than -2.`,
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
 * Refuse a take whose narration audio no longer matches the current narration,
 * lexicon, provider/voice or timing data. Narrated scenes require a stamp;
 * silent scenarios never produce one.
 *
 * @param {object} scenario
 * @param {string | null} narrationPath
 * @param {object | null} audioTimings
 */
function validateNarrationStamp(scenario, narrationPath, audioTimings) {
  const narrated = scenario.scenes.filter(
    (scene) =>
      typeof scene.narration === "string" && scene.narration.trim() !== "",
  );

  if (!narrated.length) {
    return;
  }

  const audioDir = path.join(VIDEO_DIR, "work", "audio", scenario.id);
  const identity = resolveNarrationIdentity({ env: process.env });
  const lexiconPath = resolveLexiconPath({ env: process.env });

  assertFreshStamp({
    audioDir,
    scenarioId: scenario.id,
    narrated,
    narrationPath,
    lexiconPath,
    identity,
    timings: audioTimings,
  });

  console.log(
    `[video] Narration stamp: ` +
      `${path.relative(process.cwd(), path.join(audioDir, "stamp.json"))} ` +
      `(${identity.providerId}/${identity.voice}).`,
  );
}

/**
 * Resolve a scene's narration timing. For a narrated scene the narration
 * starts after the action has settled, plus the fixed lead beat and minus any
 * J-cut, capped by `audioAfterActionMax`. The scene lasts at least its action
 * plus `minHold`, and otherwise until the narration and pad have played. A
 * silent scene keeps its scenario hold.
 *
 * @param {object} scene
 * @param {object} scenario
 * @param {object | null} audioTimings
 * @returns {{ audio: string | null, audioDuration: number | null, hold: number, pad: number, afterAction: boolean, maxDelay: number, audioOffset: number | null, jcut: number, minHold: number }}
 */
function resolveTiming(scene, scenario, audioTimings) {
  const entry =
    audioTimings?.scenes.find((candidate) => candidate.id === scene.id) ?? null;
  const jcut = scene.jcut ?? scenario.jcut ?? 0;
  const minHold = scene.minHold ?? scenario.minHold ?? 0.15;

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
      jcut,
      minHold,
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
    jcut,
    minHold,
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

  validateJcut(scene.jcut, `Scene "${scene.id}"`);
  validateMinHold(scene.minHold, `Scene "${scene.id}"`);
  validateAudioOffset(scene.audioOffset, `Scene "${scene.id}"`);

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

  if (scene.anonymous !== undefined && typeof scene.anonymous !== "boolean") {
    throw new Error(`Scene "${scene.id}": "anonymous" must be a boolean.`);
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
  let anonymousState = Boolean(session.anonymous);
  activeHideSelectors = hideSelectors ?? [];

  for (let index = 0; index < scenario.scenes.length; index += 1) {
    const scene = scenario.scenes[index];
    const sceneId = validateScene(scene, index);
    const resolved = resolveScene(scene, tokens, sceneId);
    const timing = resolveTiming(scene, scenario, audioTimings);

    resolved.audio = timing.audio;
    resolved.audioDuration = timing.audioDuration;
    resolved.hold = timing.hold;
    resolved.jcut = timing.jcut;
    resolved.minHold = timing.minHold;

    const start = (Date.now() - t0) / 1000;
    timeline.beginScene(resolved, start);

    try {
      const sceneAnonymous = resolved.anonymous === true;
      const switched = sceneAnonymous !== anonymousState;

      if (switched) {
        await libs.browser.setAnonymousState(
          session.context,
          session.authCookies,
          sceneAnonymous,
          `Scene "${sceneId}"`,
        );
        anonymousState = sceneAnonymous;
      }

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
        reload: switched,
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
          (timing.afterAction
            ? Math.min(actionEnd, timing.maxDelay) + LEAD_BEAT - timing.jcut
            : 0))
        : 0;
      const durationFloor = actionEnd + timing.minHold;
      const sceneDuration = timing.audioDuration
        ? Math.max(
            durationFloor,
            audioOffset + timing.audioDuration + timing.pad,
          )
        : actionEnd + timing.hold;
      const holdSeconds = timing.audioDuration
        ? Math.max(0, sceneDuration - actionEnd)
        : timing.hold;

      timeline.setAudioOffset(sceneId, audioOffset);
      timeline.setHold(sceneId, holdSeconds);

      // Keep the outline on the target until any post-action motion finishes.
      // The outline is already visible, so it follows a moving popup rather
      // than jumping to its final position after the narration has started.
      let trackSeconds = 0;
      if (resolved.highlight) {
        // Never follow for longer than the scene's own hold: the outline is
        // repositioned inside the existing beat, so the scene cannot grow.
        const trackTimeoutMs = Math.min(
          TAKE_HIGHLIGHT_TRACK_TIMEOUT_MS,
          Math.max(0, Math.round(holdSeconds * 1000)),
        );
        const trackStartedAt = Date.now();
        await libs.highlight.trackHighlight(page, resolved.highlight, {
          quietMs: TAKE_HIGHLIGHT_TRACK_QUIET_MS,
          timeoutMs: trackTimeoutMs,
        });
        trackSeconds = (Date.now() - trackStartedAt) / 1000;
      }

      await hold(page, Math.max(0, holdSeconds - trackSeconds));

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

      // Remove an opening or mid-take card at the end of its scene so the next
      // scene starts on the fully painted page underneath. A closing card is
      // the last frame of the take and stays up until recording stops.
      if (resolved.action === "card" && index < scenario.scenes.length - 1) {
        await hideCard(page);
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
 * Fail when a J-cut pulls a line back into the previous line's speech. Only a
 * negative offset can overlap the preceding scene, so the pass only inspects
 * those. A scene with no preceding narrated scene has nothing to collide with.
 *
 * @param {object} timeline
 */
function assertNoNarrationCollision(timeline) {
  let previous = null;

  for (const scene of timeline.scenes) {
    const narrated =
      Number.isFinite(scene.audioDuration) && scene.audioDuration > 0;

    if (!narrated) {
      continue;
    }

    const offset = Number.isFinite(scene.audioOffset) ? scene.audioOffset : 0;

    if (offset < 0 && previous) {
      const speechStart = scene.start + offset;
      const previousEnd =
        previous.start + previous.audioOffset + previous.audioDuration;

      if (speechStart < previousEnd) {
        const jcut = Number.isFinite(scene.jcut) ? scene.jcut : 0;
        throw new Error(
          `Scene "${scene.id}": jcut of ${jcut.toFixed(2)}s starts ` +
            `narration at ${speechStart.toFixed(2)}s, which overlaps ` +
            `"${previous.id}" ending at ${previousEnd.toFixed(2)}s. Reduce ` +
            `the jcut or lengthen the previous scene's pad.`,
        );
      }
    }

    previous = scene;
  }
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

    let anonymousState = false;
    let posterScene = null;

    for (let index = 0; index <= sceneIndex; index += 1) {
      const scene = scenario.scenes[index];
      const id = validateScene(scene, index);
      const resolved = resolveScene(scene, tokens, id);
      const sceneAnonymous = resolved.anonymous === true;
      const switched = sceneAnonymous !== anonymousState;

      if (switched) {
        await libs.browser.setAnonymousState(
          replay.context,
          replay.authCookies,
          sceneAnonymous,
          `Scene "${id}" poster replay`,
        );
        anonymousState = sceneAnonymous;
      }

      await replayScene({
        page: replay.page,
        scene: resolved,
        sceneId: id,
        libs,
        hideSelectors: session.hideSelectors,
        reload: switched,
      });

      posterScene = resolved;
    }

    // Let any scroll, layout pass or Leaflet pan finish before drawing the
    // still. The overlays are then repositioned against the settled geometry
    // immediately before the screenshot, so the outline cannot be left behind
    // by content that was still moving when the scene's action returned.
    await settlePosterReplay(replay.page, libs.fixtures, posterScene, config);
    await applySceneHighlight(replay.page, posterScene, libs);

    // A fill scene would otherwise leave its fake caret in the still.
    await libs.cursor.clearCaret(replay.page);
    const expectedHighlight = Boolean(posterScene?.highlight);

    // The outline fades in through a transition, so the still has to wait until
    // it is fully opaque. When the scene expects an outline, a missing element
    // is a failure rather than something to wait out: otherwise the screenshot
    // would silently drop the highlight the scene asked for.
    await replay.page
      .waitForFunction(
        ({ elementId, expected }) => {
          const element = document.getElementById(elementId);
          if (!element) {
            return !expected;
          }
          const bounds = element.getBoundingClientRect();
          return (
            Number(window.getComputedStyle(element).opacity) >= 0.99 &&
            bounds.width > 0 &&
            bounds.height > 0
          );
        },
        { elementId: "waymark-video-highlight", expected: expectedHighlight },
        { timeout: 2000 },
      )
      .catch(() => {});
    await replay.page.evaluate(
      () =>
        new Promise((resolve) => {
          requestAnimationFrame(() => requestAnimationFrame(resolve));
        }),
    );

    const overlays = await replay.page.evaluate(
      ({ expected }) => {
        const highlight = document.getElementById("waymark-video-highlight");
        const bounds = highlight?.getBoundingClientRect();
        const style = highlight ? window.getComputedStyle(highlight) : null;

        return {
          expected,
          cursor: Boolean(document.getElementById("waymark-video-cursor")),
          caret: Boolean(document.getElementById("waymark-video-caret")),
          highlight: Boolean(highlight),
          highlightOpacity: style ? Number(style.opacity) : null,
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
      },
      { expected: expectedHighlight },
    );

    if (
      expectedHighlight &&
      (!overlays.highlight ||
        overlays.highlightOpacity < 0.99 ||
        !overlays.highlightRect ||
        !overlays.highlightRect.width ||
        !overlays.highlightRect.height)
    ) {
      throw new Error(
        `Scene "${sceneId}": the poster highlight was expected but ` +
          `${
            overlays.highlight
              ? `is not visible (opacity ${overlays.highlightOpacity}, rect ` +
                `${JSON.stringify(overlays.highlightRect)})`
              : "the element is missing"
          }.`,
      );
    }

    if (expectedHighlight) {
      console.log(
        `[video] Poster highlight ${overlays.highlightRect.width}x` +
          `${overlays.highlightRect.height} at ` +
          `${overlays.highlightRect.x},${overlays.highlightRect.y} ` +
          `(opacity ${overlays.highlightOpacity}).`,
      );
    }

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
 * Wait for the replayed page to stop moving. The measurement covers the scroll
 * position, the poster target and the highlighted target, so a late layout pass,
 * a scroll and a Leaflet popup pan all delay the capture until the geometry is
 * steady. The caller then draws the fixed outline against that geometry.
 *
 * @param {import("@playwright/test").Page} page
 * @param {object} fixtures
 * @param {object | null} scene
 * @param {{ selector: string }} config
 */
async function settlePosterReplay(page, fixtures, scene, config) {
  const selectors = [config.selector];
  if (scene?.highlight?.selector) {
    selectors.push(scene.highlight.selector);
  }

  const measure = async () => {
    const scroll = await page.evaluate(() => ({
      x: Math.round(window.scrollX),
      y: Math.round(window.scrollY),
    }));

    const boxes = [];
    for (const selector of selectors) {
      const box = await page
        .locator(selector)
        .first()
        .boundingBox()
        .catch(() => null);

      boxes.push(
        box
          ? {
              x: Math.round(box.x),
              y: Math.round(box.y),
              width: Math.round(box.width),
              height: Math.round(box.height),
            }
          : null,
      );
    }

    return { scroll, boxes };
  };

  await fixtures.waitForLayoutStable(measure, {
    quietMs: POSTER_REPLAY_SETTLE_QUIET_MS,
    pollMs: 100,
    timeoutMs: 5000,
  });
}

/**
 * Draw or clear a scene's outline. Shared by the take replay and the poster
 * replay so both use the same selector and padding.
 *
 * @param {import("@playwright/test").Page} page
 * @param {object} scene
 * @param {object} libs
 */
async function applySceneHighlight(page, scene, libs) {
  if (scene.highlight) {
    await libs.highlight.showHighlight(page, scene.highlight);
  } else {
    await libs.highlight.clearHighlight(page, { fade: false });
  }
}

/**
 * Apply one scene's action and overlays during a replay. Narration, holds,
 * timeline bookkeeping and assertions are deliberately skipped.
 *
 * @param {{ page: import("@playwright/test").Page, scene: object, sceneId: string, libs: object, hideSelectors: string[], reload?: boolean }} options
 */
async function replayScene({
  page,
  scene,
  sceneId,
  libs,
  hideSelectors,
  reload = false,
}) {
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
    reload,
  });

  if (scene.action === "goto" && hideSelectors.length) {
    await libs.browser.applyHiddenSelectors(page, hideSelectors);
  }

  await applySceneHighlight(page, scene, libs);

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
 * @param {{ page: import("@playwright/test").Page, scene: object, sceneId: string, libs: object, silent?: boolean, reload?: boolean }} options
 * @returns {Promise<{ cursorSelector?: string, cursorPoint?: { x: number, y: number } }>}
 */
async function runAction({
  page,
  scene,
  sceneId,
  libs,
  silent = false,
  reload = false,
}) {
  const { fixtures, cursor } = libs;

  switch (scene.action) {
    case "goto": {
      const url = requireString(scene, sceneId, "url");
      const currentURL = page.url();

      // The URL survives an overlay card, so a goto to the page already loaded
      // for the card is a no-op and does not discard the warmed document. A
      // cookie-state switch must reload even when the URL is unchanged, or the
      // page could keep the old admin bar (or lose the new one) for the scene.
      if (reload || !sameURL(currentURL, url)) {
        if (reload && sameURLIgnoringFragment(currentURL, url)) {
          // A goto that differs only by its fragment is a same-document
          // navigation: no request is made and the old document survives, so
          // a cookie switch would not take effect. Load the bare URL for a
          // real navigation, then restore the fragment in-page so the anchor
          // still applies without a second request.
          const fragment = fragmentOf(url);
          if (fragment) {
            await navigateTo(page, stripFragment(url), scene);
            await restoreFragment(page, fragment);
          } else {
            await navigateTo(page, url, scene);
          }
        } else {
          await navigateTo(page, url, scene);
        }
      }

      if (scene.anonymous === true) {
        await assertNoAdminBarOnPublicPage(page, url, sceneId);
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
      await waitForMapReady(page, fixtures, scene.zoom);
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
 * Describe a scene as a navigation target for the unrecorded warm-up.
 *
 * @param {object | null} scene
 * @returns {{ kind: "goto", url: string, selector?: string } | null}
 */
function navigationTarget(scene) {
  if (!scene || scene.action !== "goto") {
    return null;
  }

  return { kind: "goto", url: scene.url, selector: scene.selector };
}

/**
 * Wait for the editor map and settle it, optionally pinning the zoom so the
 * framing matches the frozen tile pack. This is the wait shared by the
 * `waitForMap` action and the card pre-warm.
 *
 * @param {import("@playwright/test").Page} page
 * @param {object} fixtures
 * @param {number} [zoom]
 */
async function waitForMapReady(page, fixtures, zoom) {
  await page.waitForFunction(
    () => Boolean(window.Waymark && window.Waymark.map),
    null,
    { timeout: 30000 },
  );
  await fixtures.settleMap(page);

  if (zoom !== undefined) {
    await page.evaluate((value) => {
      if (window.Waymark && window.Waymark.map) {
        window.Waymark.map.setZoom(value, { animate: false });
      }
    }, zoom);
    await fixtures.settleMap(page);
  }
}

/**
 * Put the first scene on screen before t0. A card is injected as an overlay
 * over the page it will later reveal, so that page is navigated, settled and
 * hidden-selector-cleaned first. A goto navigates directly.
 *
 * @param {import("@playwright/test").Page} page
 * @param {object} scene
 * @param {{ pageScene?: object | null, hideSelectors?: string[], waitForMap?: boolean, zoom?: number, fixtures?: object, applyHiddenSelectors?: (page: import("@playwright/test").Page, selectors: string[]) => Promise<number> }} [options]
 */
async function prepareScene(page, scene, options = {}) {
  if (scene.action === "card") {
    if (options.pageScene) {
      await navigateTo(page, options.pageScene.url, options.pageScene);

      if (options.hideSelectors?.length) {
        await options.applyHiddenSelectors?.(page, options.hideSelectors);
      }

      if (options.waitForMap) {
        await waitForMapReady(page, options.fixtures, options.zoom);
      }
    }

    await showCard(page, scene.card);
    await page.waitForTimeout(CARD_PREWARM_SETTLE_MS);
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
  // Commit first, then hide immediately: waiting for `load` leaves the
  // permalink row (and any other dev-only chrome) on screen for the whole
  // navigation, which is long enough to land in a frame.
  await page.goto(url, { waitUntil: "commit" });

  if (activeHideSelectors.length > 0) {
    const { applyHiddenSelectors } = await import("./lib/browser.mjs");
    await applyHiddenSelectors(page, activeHideSelectors).catch(() => {});
    await page.waitForLoadState("domcontentloaded");
    await applyHiddenSelectors(page, activeHideSelectors);
  }

  await page.waitForLoadState("load");
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
 * Remove the fragment from a URL.
 *
 * @param {string} value
 * @returns {string}
 */
function stripFragment(value) {
  const index = value.indexOf("#");
  return index === -1 ? value : value.slice(0, index);
}

/**
 * Return the fragment of a URL, including the leading `#`, or an empty string.
 *
 * @param {string} value
 * @returns {string}
 */
function fragmentOf(value) {
  const index = value.indexOf("#");
  return index === -1 ? "" : value.slice(index);
}

/**
 * Compare two URLs, ignoring the fragment and a trailing-slash difference.
 *
 * @param {string} current
 * @param {string} target
 * @returns {boolean}
 */
function sameURLIgnoringFragment(current, target) {
  return sameURL(stripFragment(current), stripFragment(target));
}

/**
 * Restore a fragment in the current document without issuing a request.
 *
 * @param {import("@playwright/test").Page} page
 * @param {string} fragment
 */
async function restoreFragment(page, fragment) {
  await page.evaluate(async (hash) => {
    if (window.location.hash !== hash) {
      window.location.hash = hash;
    }

    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve)),
    );
  }, fragment);
}

/**
 * Fail when an anonymous public page still carries the WordPress admin bar.
 * The admin bar is rendered from the authenticated cookies, so its presence
 * means the cookie switch or the navigation did not replace the document.
 *
 * @param {import("@playwright/test").Page} page
 * @param {string} url
 * @param {string} sceneId
 */
async function assertNoAdminBarOnPublicPage(page, url, sceneId) {
  let target;
  let current;

  try {
    target = new URL(url);
    current = new URL(page.url());
  } catch {
    return;
  }

  if (target.origin !== current.origin) {
    return;
  }

  if (target.pathname.startsWith("/wp-admin")) {
    return;
  }

  const present = await page.evaluate(
    () => document.getElementById("wpadminbar") !== null,
  );

  if (present) {
    throw new Error(
      `Scene "${sceneId}": an anonymous scene still shows the WordPress admin ` +
        `bar; the aggregate page is authenticated. Check the cookie switch and ` +
        `any fragment-only navigation.`,
    );
  }
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
    const jcut = Number.isFinite(scene.jcut) ? scene.jcut.toFixed(2) : "-";
    const minHold = Number.isFinite(scene.minHold)
      ? scene.minHold.toFixed(2)
      : "-";
    console.log(
      `[video]   ${scene.id}: ${scene.start.toFixed(3)}s – ${end}s ` +
        `(${scene.action}, audioOffset ${audioOffset}, duration ${duration}s, ` +
        `jcut ${jcut}s, minHold ${minHold}s)`,
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

  console.log(
    `[video] Timeline: ${path.relative(process.cwd(), timelinePath(scenario.id))}`,
  );
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
      "to scripts/video/work/timeline-<id>.json.",
    ].join("\n"),
  );
}

export { validateScenario, validateScenes, warnUnknownKeys };

const isEntryPoint =
  process.argv[1] !== undefined &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isEntryPoint) {
  main().catch((error) => {
    console.error(
      error?.isStaleAudio
        ? `[video] ${error.message}`
        : `[video] ${error.stack ?? error.message}`,
    );
    process.exitCode = 1;
  });
}
