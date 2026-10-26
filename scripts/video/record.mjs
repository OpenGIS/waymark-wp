#!/usr/bin/env node
// Scenario-driven screen recorder.
//
// Usage:
//   node scripts/video/record.mjs scripts/video/scenarios/<id>.json
//
// Run from the repository root. The target instance is read from WP_BASE_URL
// and defaults to the dedicated video instance on http://localhost:11000.
"use strict";

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

import { loadNarration } from "./lib/narration.mjs";

const require = createRequire(import.meta.url);
const VIDEO_DIR = path.dirname(fileURLToPath(import.meta.url));

// A neutral point in the blank centre of the WordPress admin bar. No admin bar
// item sits there at 1280x720, so parking the real pointer clears hover-only
// affordances without opening a menu or tooltip.
const PARK_MOUSE_POINT = { x: 640, y: 8 };

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  const scenarioPath = path.resolve(process.cwd(), args[0]);
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
      firstScene && firstScene.action === "goto"
        ? resolveScene(firstScene, tokens, firstScene.id)
        : null;

    if (prewarmScene) {
      const mapScene = scenario.scenes.find(
        (scene) => scene.action === "waitForMap",
      );

      await browserLib.warmUp(browser, baseURL, {
        url: prewarmScene.url,
        selector: prewarmScene.selector,
        hideSelectors: scenario.hideSelectors ?? [],
        waitForMap: Boolean(mapScene),
        zoom: mapScene?.zoom,
      });
      console.log("[video] Warm-up navigation complete.");
    }

    const session = await browserLib.startRecording(browser, baseURL, {
      hideSelectors: scenario.hideSelectors ?? [],
      // Navigate the recorded page before t0 so the take opens on the fully
      // rendered first scene instead of the blank page.
      prepare: prewarmScene
        ? (page) => navigateTo(page, prewarmScene.url, prewarmScene)
        : undefined,
    });
    const timeline = createTimeline({
      id: scenario.id,
      viewport: browserLib.VIEWPORT,
      startedAt: session.startedAt,
    });

    let failure = null;

    try {
      await runScenes(session, timeline, scenario, tokens, libs, audioTimings);
    } catch (error) {
      failure = error;
    }

    let finish = null;
    try {
      finish = await browserLib.finishRecording(session, scenario.id);
    } catch (error) {
      failure = failure ?? error;
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

  if (scene.poster !== undefined && typeof scene.poster !== "boolean") {
    throw new Error(`Scene "${scene.id}": "poster" must be a boolean.`);
  }

  if (scene.parkMouse !== undefined && typeof scene.parkMouse !== "boolean") {
    throw new Error(`Scene "${scene.id}": "parkMouse" must be a boolean.`);
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
          await libs.cursor.applyCursor(page, resolved.cursor);
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

      if (resolved.action === "poster" || resolved.poster === true) {
        // Mark the end of the poster hold, while the intended overlays are
        // still visible and before the scene cleanup starts.
        timeline.markPoster((Date.now() - t0) / 1000);
      }

      assertNoViolations(violations, sceneId, libs.browser);
    } finally {
      await libs.cursor.clearCaret(page).catch(() => {});
      const end = (Date.now() - t0) / 1000;
      timeline.endScene(sceneId, end);
    }
  }
}

/**
 * Dispatch one action.
 *
 * @param {{ page: import("@playwright/test").Page, scene: object, sceneId: string, libs: object }} options
 * @returns {Promise<{ cursorSelector?: string, cursorPoint?: { x: number, y: number } }>}
 */
async function runAction({ page, scene, sceneId, libs }) {
  const { fixtures, cursor } = libs;

  switch (scene.action) {
    case "goto": {
      const url = requireString(scene, sceneId, "url");

      if (!sameURL(page.url(), url)) {
        await navigateTo(page, url, scene);
      }

      return {};
    }

    case "click": {
      const selector = requireString(scene, sceneId, "selector");
      await cursor.clickWithCursor(
        page,
        selector,
        pointerFramingOptions(fixtures),
      );
      return { cursorSelector: selector };
    }

    case "fill": {
      const selector = requireString(scene, sceneId, "selector");
      const value = requireString(scene, sceneId, "value", true);

      await cursor.moveCursorToSelector(page, selector);
      const locator = page.locator(selector).first();
      await locator.click();
      await locator.fill(value);
      await cursor.showCaret(page, selector);

      return { cursorSelector: selector };
    }

    case "select": {
      const selector = requireString(scene, sceneId, "selector");
      const value = requireString(scene, sceneId, "value", true);

      await cursor.moveCursorToSelector(page, selector);
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

      await cursor.moveCursorToSelector(page, selector);
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
        pointerFramingOptions(fixtures),
      );
      return { cursorSelector: selector };
    }

    case "scrollIntoView": {
      const selector = requireString(scene, sceneId, "selector");
      await settleElement(page, selector, fixtures);
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
        await cursor.clickWithCursor(page, selector);
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
 * Wait for an element and its layout to settle after a scroll.
 *
 * @param {import("@playwright/test").Page} page
 * @param {string} selector
 * @param {object} fixtures
 */
async function settleElement(page, selector, fixtures) {
  const locator = page.locator(selector).first();
  await locator.waitFor({ state: "visible" });
  await locator.evaluate((element) => {
    element.scrollIntoView({ block: "center", inline: "nearest" });
  });

  await fixtures.waitForLayoutStable(
    async () => {
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
    },
    { quietMs: 250, pollMs: 100, timeoutMs: 5000 },
  );
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
 * Pointer framing for hover and click: centre the target when it is not fully
 * visible, wait for the layout to settle, then move the pointer. An element
 * that is already fully in view is left in place, so hovering the Leaflet
 * layers control never moves the page under the pointer.
 *
 * @param {object} fixtures
 * @returns {{ centre: boolean, settle: (measure: () => Promise<object | null>) => Promise<void> }}
 */
function pointerFramingOptions(fixtures) {
  return {
    centre: true,
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
      "  node scripts/video/record.mjs <scenario.json>",
      "",
      "Run from the repository root. WP_BASE_URL defaults to",
      "http://localhost:11000.",
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
