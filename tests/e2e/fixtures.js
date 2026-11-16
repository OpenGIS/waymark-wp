// Shared Playwright harness for the deterministic-screenshot suite.
//
// The helpers here make the disposable wp-env tests instance (port 8889)
// render exactly the same every run:
//
//   * `installExternalRequestGuard` fails the test on any network request that
//     leaves the local test instance (or hits a scheme we do not allow).
//   * `stubExternalAssets` serves the handful of known third-party assets
//     (WordPress emoji, Gravatars, the lazily loaded d3 build) from local,
//     deterministic bodies.
//   * `makePageDeterministic` disables motion and caret animation.
//   * `installTileRoutes` records Leaflet basemap tiles once and replays them
//     from `tests/fixtures/demo/tiles/` on every later run.
//   * `settleMap` waits for a Leaflet map to finish loading tiles and fonts.
//
// Specs that need any of this must import the extended `test` from this file
// (see the bottom of the module) or call the helpers explicitly before their
// first navigation. The legacy `map-editor.spec.js` smoke test intentionally
// exercises live OSM tiles and does not use this harness.
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { test: base, expect } = require("@playwright/test");

// ---------------------------------------------------------------------------
// Paths and seed data
// ---------------------------------------------------------------------------

const ROOT = path.join(__dirname, "..", "..");
const DEMO_DIR = path.join(ROOT, "tests", "fixtures", "demo");
const TILES_DIR = path.join(DEMO_DIR, "tiles");
const IMAGES_DIR = path.join(DEMO_DIR, "images");
const SEED_OUTPUT_PATH = path.join(DEMO_DIR, "seed-output.json");
const D3_PATH = path.join(ROOT, "node_modules", "d3", "dist", "d3.min.js");
const TMP_DIR = path.join(ROOT, "temp");
const TILE_RECORD_LOG = path.join(TMP_DIR, "tile-record.log");
const TILE_SERVE_LOG = path.join(TMP_DIR, "tile-serve.log");

const BASE_URL = (process.env.WP_BASE_URL ?? "http://localhost:8889").replace(
  /\/+$/,
  "",
);

/** Parsed output of the demo seeder (`tests/fixtures/demo/seed-output.json`). */
const seedOutput = JSON.parse(fs.readFileSync(SEED_OUTPUT_PATH, "utf8"));

/**
 * Look up a seeded Map by slug.
 *
 * @param {string} slug
 * @returns {{ id: number, slug: string, title: string, permalink: string }}
 */
function getMap(slug) {
  const map = seedOutput.maps.find((candidate) => candidate.slug === slug);

  if (!map) {
    const known = seedOutput.maps.map((candidate) => candidate.slug).join(", ");
    throw new Error(`Unknown demo Map slug "${slug}" (known: ${known})`);
  }

  return map;
}

/**
 * Look up a seeded image URL by key and size.
 *
 * @param {string} key
 * @param {"thumbnail"|"medium"|"large"} [size]
 * @returns {string}
 */
function getImage(key, size = "large") {
  const image = seedOutput.images[key];

  if (!image) {
    const known = Object.keys(seedOutput.images).join(", ");
    throw new Error(`Unknown demo image key "${key}" (known: ${known})`);
  }

  if (!image[size]) {
    throw new Error(`Unknown image size "${size}" for key "${key}"`);
  }

  return image[size];
}

/**
 * Build an absolute URL for a path on the tests instance.
 *
 * @param {string} pathname
 * @returns {string}
 */
function adminUrl(pathname) {
  const suffix = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${BASE_URL}${suffix}`;
}

/** Absolute URL of the seeded Settings page. */
const settingsUrl = adminUrl(seedOutput.settings_url);

// ---------------------------------------------------------------------------
// External-request guard
// ---------------------------------------------------------------------------

const ALLOWED_SCHEMES = ["data:", "blob:", "about:", "javascript:"];

const allowedOrigins = new Set([BASE_URL]);
try {
  const parsed = new URL(BASE_URL);
  for (const host of [parsed.hostname, "localhost", "127.0.0.1"]) {
    allowedOrigins.add(`http://${host}:${parsed.port}`);
    allowedOrigins.add(`https://${host}:${parsed.port}`);
  }
} catch {
  // BASE_URL is not a parseable URL — the literal entry above still applies.
}

/**
 * @param {string} url
 * @returns {boolean}
 */
function isAllowedUrl(url) {
  if (ALLOWED_SCHEMES.some((scheme) => url.startsWith(scheme))) {
    return true;
  }

  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    // Non-URL request targets (rare) are not network egress.
    return true;
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return true;
  }

  return allowedOrigins.has(parsed.origin);
}

/**
 * Install the catch-all external-request guard on a page or context.
 *
 * MUST be registered before any specific stub/tile routes: Playwright runs
 * matching handlers in reverse registration order, so later (more specific)
 * routes win and never reach this guard.
 *
 * @param {import("@playwright/test").Page | import("@playwright/test").BrowserContext} target
 * @param {Array<{ url: string, resourceType: string, reason?: string }>} [violations]
 * @returns {Promise<Array<{ url: string, resourceType: string, reason?: string }>>}
 */
async function installExternalRequestGuard(target, violations = []) {
  await target.route("**/*", (route) => {
    const request = route.request();
    const url = request.url();

    if (isAllowedUrl(url)) {
      return route.continue();
    }

    violations.push({
      url,
      resourceType: request.resourceType(),
      reason: "external request",
    });

    return route.abort();
  });

  return violations;
}

/**
 * Assert that no unexpected network activity was recorded.
 *
 * @param {Array<{ url: string, resourceType: string, reason?: string }>} violations
 */
function expectNoExternalRequests(violations) {
  if (!violations.length) {
    return;
  }

  const detail = violations
    .map((violation) => {
      const reason = violation.reason ? ` (${violation.reason})` : "";
      return `  - [${violation.resourceType}] ${violation.url}${reason}`;
    })
    .join("\n");

  const origins = [...allowedOrigins].join(", ");
  expect(
    violations,
    `Unexpected network activity (${violations.length}). Only ${origins} and the ` +
      `data:/blob:/about: schemes are allowed:\n${detail}`,
  ).toEqual([]);
}

// ---------------------------------------------------------------------------
// Known external asset stubs
// ---------------------------------------------------------------------------

// 1x1 transparent GIF / PNG — deterministic placeholders that never vary.
const TRANSPARENT_GIF = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64",
);
const TRANSPARENT_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64",
);

/**
 * Route-fulfil the known third-party assets so they never hit the network.
 *
 * Registered after {@link installExternalRequestGuard} so these specific
 * routes take precedence over the catch-all guard.
 *
 * @param {import("@playwright/test").Page | import("@playwright/test").BrowserContext} target
 */
async function stubExternalAssets(target) {
  // WordPress core emoji script/stylesheet and emoji images (s.w.org).
  await target.route(/s\.w\.org\//, (route) =>
    route.fulfill({
      status: 200,
      contentType: "image/gif",
      body: TRANSPARENT_GIF,
    }),
  );

  // Gravatars (admin-bar avatar and comment avatars).
  await target.route(/gravatar\.com\//, (route) =>
    route.fulfill({
      status: 200,
      contentType: "image/png",
      body: TRANSPARENT_PNG,
    }),
  );

  // d3 is lazy-loaded by the leaflet-elevation chart from this exact URL.
  const d3Body = fs.readFileSync(D3_PATH);
  await target.route(/unpkg\.com\/d3@5\.15\.0\/dist\/d3\.min\.js/, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/javascript",
      body: d3Body,
    }),
  );
}

// ---------------------------------------------------------------------------
// Determinism
// ---------------------------------------------------------------------------

const DETERMINISTIC_CSS =
  "*{transition:none !important;animation:none !important;caret-color:transparent !important}";

/**
 * Force reduced motion and inject CSS that disables transitions, animations
 * and the caret on every navigation.
 *
 * @param {import("@playwright/test").Page} page
 */
async function makePageDeterministic(page) {
  await page.emulateMedia({ reducedMotion: "reduce" });

  await page.addInitScript((css) => {
    const inject = () => {
      const style = document.createElement("style");
      style.setAttribute("data-waymark-deterministic", "");
      style.textContent = css;
      (document.head || document.documentElement).appendChild(style);
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", inject, { once: true });
    } else {
      inject();
    }
  }, DETERMINISTIC_CSS);
}

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------

/**
 * Log in to wp-admin using the seeded credentials.
 *
 * @param {import("@playwright/test").Page} page
 */
async function login(page) {
  await page.goto("/wp-login.php");

  // WordPress's wp_attempt_focus() focuses and selects #user_login 200ms after
  // load; wait for it so it cannot interrupt the password fill.
  await page.waitForFunction(
    () => document.activeElement === document.getElementById("user_login"),
    null,
    { timeout: 10_000 },
  );

  await page.fill("#user_login", "admin");
  await page.fill("#user_pass", "password");
  await page.click("#wp-submit");
  await expect(page.locator("#wpadminbar")).toBeVisible();
}

// ---------------------------------------------------------------------------
// Leaflet settle
// ---------------------------------------------------------------------------

/**
 * True once every tile currently rendered by an active Leaflet tile layer has
 * the `leaflet-tile-loaded` class (and at least one tile exists).
 *
 * @returns {boolean}
 */
function tilesAreLoaded() {
  const waymark = window.Waymark;
  const leaflet = window.L;
  if (!waymark || !waymark.map || !leaflet || !leaflet.TileLayer) {
    return false;
  }

  const tileLayers = [];
  waymark.map.eachLayer((layer) => {
    if (layer instanceof leaflet.TileLayer) {
      tileLayers.push(layer);
    }
  });

  if (!tileLayers.length) {
    return false;
  }

  return tileLayers.some((layer) => {
    const container = layer.getContainer ? layer.getContainer() : null;
    if (!container) {
      return false;
    }
    const tiles = container.querySelectorAll("img.leaflet-tile");
    if (!tiles.length) {
      return false;
    }
    for (const tile of tiles) {
      if (!tile.classList.contains("leaflet-tile-loaded")) {
        return false;
      }
    }
    return true;
  });
}

/**
 * Deterministically settle a Leaflet map: wait for tiles, fonts and (by
 * default) close the popups the editor opens automatically on load.
 *
 * @param {import("@playwright/test").Page} page
 * @param {{ closePopups?: boolean, timeout?: number }} [opts]
 */
async function settleMap(page, opts = {}) {
  const { closePopups = true, timeout = 30_000 } = opts;

  await page.waitForFunction(tilesAreLoaded, null, { timeout });

  // A late fitBounds/invalidateSize can request a fresh batch of tiles; confirm
  // the current set stays fully loaded once more.
  await page.waitForTimeout(200);
  await page.waitForFunction(tilesAreLoaded, null, { timeout: 5_000 });

  await page.evaluate(() => document.fonts.ready.then(() => undefined));

  if (closePopups) {
    await page.evaluate(() => {
      const waymark = window.Waymark;
      if (!waymark || !waymark.map) {
        return;
      }
      waymark.map.eachLayer((layer) => {
        if (layer && typeof layer.closePopup === "function") {
          layer.closePopup();
        }
      });
      if (typeof waymark.map.closePopup === "function") {
        waymark.map.closePopup();
      }
    });

    await expect
      .poll(() => page.locator(".leaflet-popup").count(), { timeout: 5_000 })
      .toBe(0)
      .catch(() => {});
  }
}

// ---------------------------------------------------------------------------
// Layout stability
// ---------------------------------------------------------------------------

/**
 * Wait until a measured geometry holds steady across consecutive samples.
 *
 * `settleMap` waits for the map, but a capture target can still reflow after it
 * returns: the classic-editor meta box grows once its admin bundle finishes
 * wiring up tooltips, dropdowns and colour pickers, and a loaded or slow
 * machine can push that growth past the capture. Sampling the target's
 * geometry and requiring it unchanged for a short quiet period lets the layout
 * finish expanding before anything is rasterised.
 *
 * `measure` must return a serialisable value (round coordinates first so
 * sub-pixel jitter cannot stall the wait). The promise resolves once the value
 * has been stable for `quietMs`, or after `timeoutMs` as a safety bound — the
 * capture then proceeds rather than failing the run.
 *
 * @param {() => Promise<unknown>} measure
 * @param {{ quietMs?: number, pollMs?: number, timeoutMs?: number }} [opts]
 * @returns {Promise<void>}
 */
async function waitForLayoutStable(measure, opts = {}) {
  const { quietMs = 900, pollMs = 100, timeoutMs = 15_000 } = opts;
  const deadline = Date.now() + timeoutMs;
  let previous;
  let stableSince = 0;

  while (Date.now() < deadline) {
    let current;
    try {
      current = JSON.stringify(await measure());
    } catch {
      current = undefined;
    }

    if (current !== undefined && current === previous) {
      if (stableSince === 0) {
        stableSince = Date.now();
      }
      if (Date.now() - stableSince >= quietMs) {
        return;
      }
    } else {
      stableSince = 0;
    }

    previous = current;
    await new Promise((resolve) => setTimeout(resolve, pollMs));
  }
}

// ---------------------------------------------------------------------------
// Tile record / replay
// ---------------------------------------------------------------------------

const TILE_URL_PATTERN =
  /^https?:\/\/(?:[a-z0-9-]+\.)*tile\.(?:openstreetmap|opentopomap)\.org\//i;

const TILE_HOST_KEYS = {
  "tile.openstreetmap.org": "openstreetmap",
  "tile.opentopomap.org": "opentopomap",
};

const TILE_RECORD_THROTTLE_MS = 1000;
const TILE_RECORD_USER_AGENT = "Waymark-WP-e2e-tile-recorder";

let recordChain = Promise.resolve();
let lastRecordAt = 0;

/**
 * Serialise upstream tile fetches with a minimum gap between requests.
 *
 * @template T
 * @param {() => Promise<T>} task
 * @returns {Promise<T>}
 */
function scheduleRecordedFetch(task) {
  const run = recordChain.then(async () => {
    const elapsed = Date.now() - lastRecordAt;
    if (lastRecordAt && elapsed < TILE_RECORD_THROTTLE_MS) {
      await new Promise((resolve) =>
        setTimeout(resolve, TILE_RECORD_THROTTLE_MS - elapsed),
      );
    }
    lastRecordAt = Date.now();
    return task();
  });

  recordChain = run.then(
    () => undefined,
    () => undefined,
  );

  return run;
}

/**
 * Derive the tile host key and z/x/y from a tile URL.
 *
 * @param {string} url
 * @returns {{ host: string, z: string, x: string, y: string } | null}
 */
function parseTileUrl(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  const hostname = parsed.hostname.toLowerCase();
  let host = null;
  for (const [suffix, key] of Object.entries(TILE_HOST_KEYS)) {
    if (hostname === suffix || hostname.endsWith(`.${suffix}`)) {
      host = key;
      break;
    }
  }
  if (!host) {
    return null;
  }

  const match = parsed.pathname
    .replace(/^\/+/, "")
    .match(/^(\d+)\/(\d+)\/(\d+)(?:@2x)?\.(?:png|jpe?g)/);

  if (!match) {
    return null;
  }

  return { host, z: match[1], x: match[2], y: match[3] };
}

/**
 * @param {{ host: string, z: string, x: string, y: string }} tile
 */
function recordTileLog(tile) {
  const line = `recorded ${tile.host} ${tile.z}/${tile.x}/${tile.y}`;
  console.log(`[tile-record] ${line}`);
  fs.mkdirSync(TMP_DIR, { recursive: true });
  fs.appendFileSync(TILE_RECORD_LOG, `${line}\n`);
}

/**
 * Log a tile served from disk during replay when `WAYMARK_TILE_LOG=1`.
 *
 * The pack holds exactly the tiles the capture specs request, so this log is
 * how that set is audited (see `tests/e2e/README.md`). One line per tile per
 * request; disabled and silent by default.
 *
 * @param {{ host: string, z: string, x: string, y: string }} tile
 */
function logServedTile(tile) {
  if (process.env.WAYMARK_TILE_LOG !== "1") {
    return;
  }

  const line = `served ${tile.host}/${tile.z}/${tile.x}/${tile.y}`;
  console.log(`[tile-serve] ${line}`);
  fs.mkdirSync(TMP_DIR, { recursive: true });
  fs.appendFileSync(TILE_SERVE_LOG, `${line}\n`);
}

/**
 * Install tile record/replay routes for OpenStreetMap and OpenTopoMap.
 *
 * Replay (default): tiles are served from
 * `tests/fixtures/demo/tiles/<host>/<z>/<x>/<y>.png`. A missing tile aborts the
 * request and records a violation naming `host/z/x/y`, which
 * {@link expectNoExternalRequests} then surfaces. Every served tile is logged
 * when `WAYMARK_TILE_LOG=1` (see {@link logServedTile}).
 *
 * Record (`WAYMARK_RECORD_TILES=1` or `{ record: true }`): a missing tile is
 * fetched upstream (throttled to one request per second), written to the
 * fixtures directory and logged; existing tiles are served from disk without a
 * network round-trip.
 *
 * Registered after the guard so tiles never trip the external-request check.
 *
 * @param {import("@playwright/test").Page} page
 * @param {{ record?: boolean, violations?: Array<{ url: string, resourceType: string, reason?: string }> }} [opts]
 */
async function installTileRoutes(page, opts = {}) {
  const record = opts.record ?? process.env.WAYMARK_RECORD_TILES === "1";
  const violations = opts.violations ?? [];

  await page.route(TILE_URL_PATTERN, async (route) => {
    const request = route.request();
    const tile = parseTileUrl(request.url());
    if (!tile) {
      return route.continue();
    }

    const filePath = path.join(
      TILES_DIR,
      tile.host,
      tile.z,
      tile.x,
      `${tile.y}.png`,
    );

    if (record && !fs.existsSync(filePath)) {
      try {
        await scheduleRecordedFetch(async () => {
          const response = await route.fetch({
            headers: {
              ...request.headers(),
              "user-agent": TILE_RECORD_USER_AGENT,
            },
          });

          if (!response.ok()) {
            throw new Error(`upstream responded ${response.status()}`);
          }

          const body = await response.body();
          fs.mkdirSync(path.dirname(filePath), { recursive: true });
          fs.writeFileSync(filePath, body);
          recordTileLog(tile);
        });
      } catch (error) {
        violations.push({
          url: request.url(),
          resourceType: request.resourceType(),
          reason: `tile record failed (${error.message})`,
        });
        return route.abort();
      }
    }

    if (!fs.existsSync(filePath)) {
      violations.push({
        url: request.url(),
        resourceType: request.resourceType(),
        reason: `missing tile ${tile.host}/${tile.z}/${tile.x}/${tile.y}`,
      });
      return route.abort();
    }

    logServedTile(tile);

    return route.fulfill({
      status: 200,
      contentType: "image/png",
      path: filePath,
    });
  });

  return violations;
}

// ---------------------------------------------------------------------------
// Extended test fixture
// ---------------------------------------------------------------------------

/**
 * Playwright `test` with the whole harness wired up as an auto-use fixture.
 *
 * Import this from screenshot specs for single-import ergonomics:
 *
 *   const { test, expect } = require("./fixtures");
 *
 * The `waymark` fixture is available on `test` arguments and exposes the seed
 * helpers plus bound `login`/`settleMap`. Any unexpected network activity makes
 * the test fail on teardown.
 */
const test = base.extend({
  waymark: [
    async ({ page }, use) => {
      const violations = [];
      await installExternalRequestGuard(page, violations);
      await stubExternalAssets(page);
      await makePageDeterministic(page);
      await installTileRoutes(page, {
        violations,
        record: process.env.WAYMARK_RECORD_TILES === "1",
      });

      await use({
        violations,
        seed: seedOutput,
        getMap,
        getImage,
        adminUrl,
        settingsUrl,
        login: (target = page) => login(target),
        settleMap: (target = page, settleOpts) => settleMap(target, settleOpts),
      });

      expectNoExternalRequests(violations);
    },
    { auto: true },
  ],
});

module.exports = {
  test,
  expect,
  seedOutput,
  getMap,
  getImage,
  adminUrl,
  settingsUrl,
  login,
  installExternalRequestGuard,
  expectNoExternalRequests,
  stubExternalAssets,
  makePageDeterministic,
  settleMap,
  waitForLayoutStable,
  installTileRoutes,
  parseTileUrl,
  DETERMINISTIC_CSS,
  TILES_DIR,
  D3_PATH,
  TILE_RECORD_LOG,
  TILE_SERVE_LOG,
};
