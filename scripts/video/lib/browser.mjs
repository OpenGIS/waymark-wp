// Recording context, authentication state, request guard and video lifecycle.
//
// The harness in `tests/e2e/fixtures.js` is CommonJS and reads WP_BASE_URL at
// import time, so it is required lazily after the caller has set the
// environment variable.
"use strict";

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

import { showCard } from "./card.mjs";
import { installCursor } from "./cursor.mjs";

const require = createRequire(import.meta.url);
const { chromium } = require("@playwright/test");

export const VIEWPORT = { width: 1280, height: 720 };
export const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "..",
);
export const WORK_DIR = path.join(REPO_ROOT, "scripts", "video", "work");
export const RAW_DIR = path.join(WORK_DIR, "raw");
export const AUTH_DIR = path.join(WORK_DIR, "auth");
export const STORAGE_STATE_PATH = path.join(AUTH_DIR, "storage-state.json");
export const HIDDEN_STYLE_ATTRIBUTE = "data-waymark-hidden-selectors";

// Media that ends more than this much before the timeline end is treated as
// truncated. Container and frame rounding account for the small tolerance.
const TRUNCATION_TOLERANCE = 0.25;

/**
 * Build the stylesheet that hides scenario selectors. The selectors carry their
 * own specificity and the declarations are important, so they win over the
 * deterministic reset and WordPress admin styles.
 *
 * @param {string[]} selectors
 * @returns {string}
 */
function buildHideCSS(selectors) {
  return selectors
    .map((selector) => `${selector}{visibility:hidden !important;}`)
    .join("\n");
}

/**
 * Hide matched elements on every page load. The init script injects the rule
 * before the document is parsed, so no frame can paint the hidden content, and
 * it reapplies inline styles at DOMContentLoaded for elements added during
 * parsing. Hiding via `visibility` keeps the element's box, so removing a row
 * does not reflow the layout around it.
 *
 * @param {import("@playwright/test").Page} page
 * @param {string[]} selectors
 */
export async function installHiddenSelectors(page, selectors) {
  if (!selectors.length) {
    return;
  }

  const css = buildHideCSS(selectors);

  await page.addInitScript(
    ({ attribute, css, selectors }) => {
      const inject = () => {
        const root = document.head || document.documentElement;
        if (!root || document.querySelector(`style[${attribute}]`)) {
          return;
        }

        const style = document.createElement("style");
        style.setAttribute(attribute, "");
        style.textContent = css;
        root.appendChild(style);
      };

      const hide = () => {
        for (const selector of selectors) {
          for (const element of document.querySelectorAll(selector)) {
            element.style.setProperty("visibility", "hidden", "important");
          }
        }
      };

      inject();
      hide();

      if (document.readyState === "loading") {
        document.addEventListener(
          "DOMContentLoaded",
          () => {
            inject();
            hide();
          },
          { once: true },
        );
      }
    },
    { attribute: HIDDEN_STYLE_ATTRIBUTE, css, selectors },
  );
}

/**
 * Hide every element matching the scenario selectors after a navigation. A
 * selector that matches nothing is ignored. Returns the number of elements
 * matched across all selectors.
 *
 * @param {import("@playwright/test").Page} page
 * @param {string[]} selectors
 * @returns {Promise<number>}
 */
export async function applyHiddenSelectors(page, selectors) {
  if (!selectors.length) {
    return 0;
  }

  const css = buildHideCSS(selectors);
  const counts = await page.evaluate(
    ({ attribute, css, selectors }) => {
      const root = document.head || document.documentElement;
      if (root && !document.querySelector(`style[${attribute}]`)) {
        const style = document.createElement("style");
        style.setAttribute(attribute, "");
        style.textContent = css;
        root.appendChild(style);
      }

      return selectors.map((selector) => {
        const elements = document.querySelectorAll(selector);
        for (const element of elements) {
          element.style.setProperty("visibility", "hidden", "important");
        }
        return elements.length;
      });
    },
    { attribute: HIDDEN_STYLE_ATTRIBUTE, css, selectors },
  );

  return counts.reduce((total, count) => total + count, 0);
}

/**
 * Load the shared e2e harness. Must only be called after WP_BASE_URL is set in
 * the process environment.
 */
function fixtures() {
  return require("../../../tests/e2e/fixtures.js");
}

/**
 * Format request-guard violations for an error message.
 *
 * @param {Array<{ url: string, resourceType: string, reason?: string }>} violations
 * @returns {string}
 */
export function formatViolations(violations) {
  if (!violations.length) {
    return "";
  }

  const detail = violations
    .map((violation) => {
      const reason = violation.reason ? ` (${violation.reason})` : "";
      return `  - [${violation.resourceType}] ${violation.url}${reason}`;
    })
    .join("\n");

  return `Unexpected network activity (${violations.length}):\n${detail}`;
}

/**
 * Format an error for a one-line context message.
 *
 * @param {unknown} value
 * @returns {string}
 */
function oneLineMessage(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Switch a context between the authenticated session and an anonymous visitor.
 * Playwright records video per context, so an anonymous scene cannot use a
 * second context; clearing and restoring cookies inside the recording context
 * is the only way to keep one continuous take. Restoring is treated as fatal
 * when it fails, because continuing would record a logged-out admin scene.
 *
 * @param {import("@playwright/test").BrowserContext} context
 * @param {Array<object>} authCookies Captured before the first anonymous scene.
 * @param {boolean} anonymous
 * @param {string} label Scene or replay label for the error message.
 */
export async function setAnonymousState(
  context,
  authCookies,
  anonymous,
  label,
) {
  if (anonymous) {
    await context.clearCookies();
    return;
  }

  if (!Array.isArray(authCookies) || authCookies.length === 0) {
    throw new Error(
      `${label}: cannot restore the authenticated session because no cookies ` +
        `were captured before the anonymous scene. The take was stopped.`,
    );
  }

  await context.clearCookies();

  try {
    await context.addCookies(authCookies);
  } catch (error) {
    throw new Error(
      `${label}: failed to restore the authenticated WordPress session ` +
        `(${oneLineMessage(error?.message ?? error)}). The take was stopped ` +
        `so it cannot continue into a logged-out admin scene.`,
    );
  }

  const restored = await context.cookies();
  if (!restored.some((cookie) => cookie.name.includes("wordpress_logged_in"))) {
    throw new Error(
      `${label}: the authenticated WordPress cookie was not restored. The ` +
        `take was stopped so it cannot continue into a logged-out admin scene.`,
    );
  }
}

/**
 * Launch the pinned Chromium build.
 */
export async function launchBrowser() {
  return chromium.launch();
}

/**
 * Create the authentication state on demand. The login happens in a separate,
 * unrecorded context, so the login screen is never captured.
 *
 * @param {import("@playwright/test").Browser} browser
 * @param {string} baseURL
 * @returns {Promise<boolean>} whether a new state file was created
 */
export async function ensureStorageState(browser, baseURL) {
  fs.mkdirSync(AUTH_DIR, { recursive: true });

  if (fs.existsSync(STORAGE_STATE_PATH)) {
    return false;
  }

  const { installExternalRequestGuard, stubExternalAssets, login } = fixtures();
  const violations = [];
  const context = await browser.newContext({
    baseURL,
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
  });

  try {
    await installExternalRequestGuard(context, violations);
    await stubExternalAssets(context);

    const page = await context.newPage();
    await login(page);
    await context.storageState({ path: STORAGE_STATE_PATH });
  } finally {
    await context.close().catch(() => {});
  }

  if (violations.length) {
    throw new Error(formatViolations(violations));
  }

  return true;
}

/**
 * Validate the stored session before the recording context exists. This is the
 * "start of every take" admin-bar assertion: an expired session fails here,
 * rather than recording the login screen.
 *
 * @param {import("@playwright/test").Browser} browser
 * @param {string} baseURL
 */
export async function assertAuthenticated(browser, baseURL) {
  const { installExternalRequestGuard, stubExternalAssets } = fixtures();
  const violations = [];
  const context = await browser.newContext({
    baseURL,
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
    storageState: STORAGE_STATE_PATH,
  });

  try {
    await installExternalRequestGuard(context, violations);
    await stubExternalAssets(context);

    const page = await context.newPage();
    await page.goto("/wp-admin/", { waitUntil: "domcontentloaded" });

    try {
      await page
        .locator("#wpadminbar")
        .waitFor({ state: "visible", timeout: 15000 });
    } catch {
      throw new Error(
        `The stored WordPress session is not authenticated (no admin bar at ` +
          `${baseURL}/wp-admin/). Delete ` +
          `${path.relative(REPO_ROOT, STORAGE_STATE_PATH)} and run the ` +
          `recorder again to create a fresh login.`,
      );
    }
  } finally {
    await context.close().catch(() => {});
  }

  if (violations.length) {
    throw new Error(formatViolations(violations));
  }
}

/**
 * Warm the page behind the first scene in an unrecorded context. This removes
 * the cold first-load variance (server, PHP and database caches) so the first
 * recorded scene loads promptly and its narration does not play over a blank
 * page.
 *
 * A card is an overlay, so it does not replace the target page. A card opening
 * therefore warms the first non-card `goto` URL, waits for its selector and the
 * map when the scenario has a `waitForMap` scene, and only then injects the
 * card. A card-only scenario with no `goto` has no page to warm.
 *
 * @param {import("@playwright/test").Browser} browser
 * @param {string} baseURL
 * @param {{ target?: { kind: "goto", url: string, selector?: string | null } | { kind: "card", card: object } | null, card?: object | null, hideSelectors?: string[], waitForMap?: boolean, zoom?: number, anonymous?: boolean }} options
 */
export async function warmUp(browser, baseURL, options) {
  const {
    installExternalRequestGuard,
    stubExternalAssets,
    makePageDeterministic,
    installTileRoutes,
    settleMap,
  } = fixtures();

  const target = options.target ?? null;
  const card = options.card ?? (target?.kind === "card" ? target.card : null);
  const navigation = target?.kind === "goto" ? target : null;
  const isCard = Boolean(card);

  if (isCard && (typeof card !== "object" || Array.isArray(card))) {
    throw new Error("Warm-up card requires a card object.");
  }

  if (navigation) {
    if (typeof navigation.url !== "string" || navigation.url.trim() === "") {
      throw new Error("Warm-up navigation requires a URL.");
    }
  } else if (!isCard) {
    throw new Error("Warm-up requires a navigation target or a card.");
  }

  const hideSelectors = Array.isArray(options.hideSelectors)
    ? options.hideSelectors
    : [];
  const violations = [];

  const context = await browser.newContext({
    baseURL,
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
    storageState: STORAGE_STATE_PATH,
  });

  try {
    await installExternalRequestGuard(context, violations);
    await stubExternalAssets(context);

    // The warm-up mirrors the first scene. It is only anonymous when that
    // scene opts in; otherwise it keeps the authenticated cold-start warm-up.
    if (options.anonymous) {
      await context.clearCookies();
    }

    const page = await context.newPage();
    page.setDefaultTimeout(30000);
    page.setDefaultNavigationTimeout(45000);

    await makePageDeterministic(page);
    await installHiddenSelectors(page, hideSelectors);
    await installTileRoutes(page, { violations });

    if (navigation) {
      await page.goto(navigation.url, { waitUntil: "load" });
      await page.evaluate(() => document.fonts.ready.then(() => undefined));

      if (
        typeof navigation.selector === "string" &&
        navigation.selector !== ""
      ) {
        await page
          .locator(navigation.selector)
          .first()
          .waitFor({ state: "visible" });
      }

      if (options.waitForMap) {
        await page.waitForFunction(
          () => Boolean(window.Waymark && window.Waymark.map),
          null,
          { timeout: 30000 },
        );
        await settleMap(page);

        if (options.zoom !== undefined) {
          await page.evaluate((zoom) => {
            if (window.Waymark && window.Waymark.map) {
              window.Waymark.map.setZoom(zoom, { animate: false });
            }
          }, options.zoom);
          await settleMap(page);
        }
      }
    }

    if (isCard) {
      await showCard(page, card);
    }
  } finally {
    await context.close().catch(() => {});
  }

  if (violations.length) {
    throw new Error(formatViolations(violations));
  }
}

/**
 * Create the recording context and page.
 *
 * Registration order mirrors the fixture documentation: the catch-all guard
 * first, then the specific asset stubs, then the page-level deterministic reset,
 * the scenario hide selectors and the tile routes. The cursor init script is
 * added before the page exists so it survives every navigation.
 *
 * @param {import("@playwright/test").Browser} browser
 * @param {string} baseURL
 * @param {{ hideSelectors?: string[], prepare?: (page: import("@playwright/test").Page) => Promise<void>, anonymous?: boolean }} [options]
 */
export async function startRecording(browser, baseURL, options = {}) {
  const {
    installExternalRequestGuard,
    stubExternalAssets,
    makePageDeterministic,
    installTileRoutes,
  } = fixtures();

  const hideSelectors = Array.isArray(options.hideSelectors)
    ? options.hideSelectors
    : [];

  fs.mkdirSync(RAW_DIR, { recursive: true });

  const violations = [];
  const context = await browser.newContext({
    baseURL,
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
    recordVideo: { dir: RAW_DIR, size: VIEWPORT },
    reducedMotion: "reduce",
    storageState: STORAGE_STATE_PATH,
  });

  try {
    // Capture the authenticated cookies before any anonymous pre-warm so the
    // take can restore them for a later authenticated scene.
    const authCookies = await context.cookies();

    if (options.anonymous) {
      await context.clearCookies();
    }

    // The video recorder starts when the page is created. `recordingStartedAt`
    // marks that origin, while `t0` is taken after the optional pre-warm, so
    // the timeline starts on a fully rendered page. The difference is stored
    // as `videoOffset` so the build can skip the recorded pre-warm.
    const recordingStartedAt = Date.now();

    const page = await context.newPage();
    page.setDefaultTimeout(30000);
    page.setDefaultNavigationTimeout(45000);

    // Install routes and init scripts after the blank page exists but before
    // the first navigation.
    await installExternalRequestGuard(context, violations);
    await stubExternalAssets(context);
    await installCursor(context);
    await makePageDeterministic(page);
    await installHiddenSelectors(page, hideSelectors);
    await installTileRoutes(page, { violations });

    if (typeof options.prepare === "function") {
      await options.prepare(page);
    }

    const t0 = Date.now();
    const startedAt = new Date(t0).toISOString();
    const videoOffset = roundSeconds((t0 - recordingStartedAt) / 1000);

    return {
      browser,
      baseURL,
      context,
      page,
      violations,
      hideSelectors,
      authCookies,
      anonymous: Boolean(options.anonymous),
      t0,
      startedAt,
      videoOffset,
      closed: false,
      finish: null,
    };
  } catch (error) {
    await context.close().catch(() => {});
    throw error;
  }
}

/**
 * Create a second, unrecorded context for a poster replay. It mirrors the
 * recording context's viewport, storage state, request guard, deterministic
 * reset, hide selectors and tile routes, but captures at twice the device
 * scale and never records video. The synthetic pointer overlay is deliberately
 * not installed, so the still cannot contain it.
 *
 * @param {import("@playwright/test").Browser} browser
 * @param {string} baseURL
 * @param {{ hideSelectors?: string[] }} [options]
 * @returns {Promise<{ context: import("@playwright/test").BrowserContext, page: import("@playwright/test").Page, violations: Array<object>, authCookies: Array<object> }>}
 */
export async function startReplay(browser, baseURL, options = {}) {
  const {
    installExternalRequestGuard,
    stubExternalAssets,
    makePageDeterministic,
    installTileRoutes,
  } = fixtures();

  const hideSelectors = Array.isArray(options.hideSelectors)
    ? options.hideSelectors
    : [];

  const violations = [];
  const context = await browser.newContext({
    baseURL,
    viewport: VIEWPORT,
    deviceScaleFactor: 2,
    reducedMotion: "reduce",
    storageState: STORAGE_STATE_PATH,
  });

  try {
    // The replay starts authenticated so it can reproduce admin scenes; an
    // anonymous poster scene clears these cookies at its own replay step.
    const authCookies = await context.cookies();
    const page = await context.newPage();
    page.setDefaultTimeout(30000);
    page.setDefaultNavigationTimeout(45000);

    await installExternalRequestGuard(context, violations);
    await stubExternalAssets(context);
    await makePageDeterministic(page);
    await installHiddenSelectors(page, hideSelectors);
    await installTileRoutes(page, { violations });

    return { context, page, violations, authCookies };
  } catch (error) {
    await context.close().catch(() => {});
    throw error;
  }
}

/**
 * Close the context, save the raw video and measure it. The video handle is
 * taken before the context closes, as Playwright requires.
 *
 * @param {Awaited<ReturnType<typeof startRecording>>} session
 * @param {string} id
 * @param {number | null} [expectedDuration]
 */
export async function finishRecording(session, id, expectedDuration = null) {
  if (session.closed) {
    return session.finish;
  }

  if (session.finish) {
    return session.finish;
  }

  session.closed = true;

  const video = session.page.video();
  const videoPath = path.join(RAW_DIR, `${id}.webm`);

  let closeError = null;
  try {
    await session.context.close();
  } catch (error) {
    closeError = error;
  }

  const wallClockDuration = roundSeconds((Date.now() - session.t0) / 1000);

  let duration = null;
  if (video) {
    await video.saveAs(videoPath);
    // Playwright leaves its generated recording alongside the saved copy.
    // Remove it so work/raw holds only the named take.
    await video.delete().catch(() => {});
    duration = probeVideoDuration(videoPath);
  }

  const offset = session.videoOffset ?? 0;
  const available =
    duration === null ? null : roundSeconds(Math.max(0, duration - offset));
  const difference =
    available === null
      ? null
      : roundSeconds(Math.abs(available - wallClockDuration));
  const expected = Number.isFinite(expectedDuration)
    ? roundSeconds(expectedDuration)
    : null;

  if (
    available !== null &&
    expected !== null &&
    available < expected - TRUNCATION_TOLERANCE
  ) {
    console.warn(
      `[video] WARNING: raw video may be truncated: it covers ` +
        `${available.toFixed(2)}s after the ${offset.toFixed(2)}s pre-warm, ` +
        `but the timeline runs ${expected.toFixed(2)}s.`,
    );
  }

  session.finish = {
    path: `work/raw/${id}.webm`,
    absolutePath: videoPath,
    duration,
    offset,
    wallClockDuration,
    difference,
    violations: session.violations,
  };

  if (closeError) {
    throw closeError;
  }

  return session.finish;
}

/**
 * Measure a WebM file. ffprobe is preferred, then ffmpeg, then a small EBML
 * duration reader so the recorder still reports a value on a minimal system.
 *
 * @param {string} filePath
 * @returns {number | null}
 */
export function probeVideoDuration(filePath) {
  const ffprobe = findExecutable("ffprobe");
  if (ffprobe) {
    try {
      const output = execFileSync(
        ffprobe,
        [
          "-v",
          "error",
          "-show_entries",
          "format=duration",
          "-of",
          "default=noprint_wrappers=1:nokey=1",
          filePath,
        ],
        { encoding: "utf8" },
      ).trim();
      const value = Number(output);
      if (Number.isFinite(value) && value > 0) {
        return roundSeconds(value);
      }
    } catch {
      // Fall through to ffmpeg.
    }
  }

  const ffmpeg = findExecutable("ffmpeg") ?? findPlaywrightFfmpeg();
  if (ffmpeg) {
    try {
      const result = spawnSync(ffmpeg, ["-hide_banner", "-i", filePath], {
        encoding: "utf8",
      });
      const output = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
      const match = output.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
      if (match) {
        const value =
          Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]);
        if (Number.isFinite(value) && value > 0) {
          return roundSeconds(value);
        }
      }
    } catch {
      // Fall through to the EBML reader.
    }
  }

  const fromHeader = readWebmDuration(filePath);
  return fromHeader === null ? null : roundSeconds(fromHeader);
}

/**
 * @param {string} name
 * @returns {string | null}
 */
function findExecutable(name) {
  const pathValue = process.env.PATH ?? "";
  for (const directory of pathValue.split(path.delimiter)) {
    if (!directory) {
      continue;
    }
    const candidate = path.join(directory, name);
    try {
      fs.accessSync(candidate, fs.constants.X_OK);
      return candidate;
    } catch {
      // Keep looking.
    }
  }
  return null;
}

/**
 * Locate the ffmpeg binary bundled with the installed Playwright browsers.
 *
 * @returns {string | null}
 */
function findPlaywrightFfmpeg() {
  const roots = [];

  if (process.env.PLAYWRIGHT_BROWSERS_PATH) {
    roots.push(process.env.PLAYWRIGHT_BROWSERS_PATH);
  }

  if (process.platform === "darwin") {
    roots.push(path.join(os.homedir(), "Library", "Caches", "ms-playwright"));
  } else if (process.platform === "win32") {
    roots.push(
      path.join(process.env.LOCALAPPDATA ?? os.homedir(), "ms-playwright"),
    );
  } else {
    roots.push(path.join(os.homedir(), ".cache", "ms-playwright"));
  }

  for (const root of roots) {
    if (!root || !fs.existsSync(root)) {
      continue;
    }

    const directories = fs
      .readdirSync(root, { withFileTypes: true })
      .filter(
        (entry) => entry.isDirectory() && entry.name.startsWith("ffmpeg-"),
      )
      .map((entry) => path.join(root, entry.name))
      .sort()
      .reverse();

    for (const directory of directories) {
      for (const file of fs.readdirSync(directory)) {
        if (!/^ffmpeg(?:\.exe)?$|^ffmpeg-(?:mac|linux|win)$/.test(file)) {
          continue;
        }

        const candidate = path.join(directory, file);
        try {
          fs.accessSync(candidate, fs.constants.X_OK);
          return candidate;
        } catch {
          // Keep looking.
        }
      }
    }
  }

  return null;
}

/**
 * Read the Duration element from a WebM Segment Info block. This is a fallback
 * for systems without ffprobe or ffmpeg; it scans the first 256 KB for the
 * Duration and TimecodeScale element ids.
 *
 * @param {string} filePath
 * @returns {number | null}
 */
function readWebmDuration(filePath) {
  const buffer = fs.readFileSync(filePath);
  const scanLimit = Math.min(buffer.length, 256 * 1024);

  const findId = (id) => {
    for (let index = 0; index < scanLimit - id.length; index += 1) {
      let matched = true;
      for (let offset = 0; offset < id.length; offset += 1) {
        if (buffer[index + offset] !== id[offset]) {
          matched = false;
          break;
        }
      }
      if (matched) {
        return index;
      }
    }
    return -1;
  };

  const durationId = [0x44, 0x89];
  const scaleId = [0x2a, 0xd7, 0xb1];

  const durationIndex = findId(durationId);
  if (durationIndex === -1) {
    return null;
  }

  const durationSize = readVintSize(buffer, durationIndex + durationId.length);
  if (!durationSize || (durationSize.value !== 4 && durationSize.value !== 8)) {
    return null;
  }

  const durationStart = durationIndex + durationId.length + durationSize.length;
  const duration =
    durationSize.value === 4
      ? buffer.readFloatBE(durationStart)
      : buffer.readDoubleBE(durationStart);

  if (!Number.isFinite(duration) || duration <= 0) {
    return null;
  }

  let scale = 1_000_000;
  const scaleIndex = findId(scaleId);
  if (scaleIndex !== -1) {
    const scaleSize = readVintSize(buffer, scaleIndex + scaleId.length);
    if (scaleSize && scaleSize.value > 0 && scaleSize.value <= 8) {
      const scaleStart = scaleIndex + scaleId.length + scaleSize.length;
      let raw = 0;
      for (let offset = 0; offset < scaleSize.value; offset += 1) {
        raw = raw * 256 + buffer[scaleStart + offset];
      }
      if (raw > 0) {
        scale = raw;
      }
    }
  }

  return (duration * scale) / 1e9;
}

/**
 * Decode an EBML variable-length size.
 *
 * @param {Buffer} buffer
 * @param {number} position
 * @returns {{ value: number, length: number } | null}
 */
function readVintSize(buffer, position) {
  const first = buffer[position];
  if (first === undefined) {
    return null;
  }

  let length = 1;
  let mask = 0x80;
  while (length <= 8 && (first & mask) === 0) {
    length += 1;
    mask >>= 1;
  }

  if (length > 8) {
    return null;
  }

  let value = first & (mask - 1);
  for (let offset = 1; offset < length; offset += 1) {
    const byte = buffer[position + offset];
    if (byte === undefined) {
      return null;
    }
    value = value * 256 + byte;
  }

  return { value, length };
}

/**
 * @param {number} value
 * @returns {number}
 */
function roundSeconds(value) {
  return Math.round(value * 1000) / 1000;
}
