#!/usr/bin/env node
// Read-only preflight for one video.
//
// Usage:
//   node scripts/video/doctor.mjs [id]
//
// Checks the recording instance, stored session, scenario and narration,
// seeded map, pinned tile pack, docs wiring and the local asset set. Nothing is
// written and nothing is reseeded. The recording instance is only queried with
// HTTP GET; the authentication check navigates to /wp-admin/ in a headless
// browser and reads the admin bar.
"use strict";

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { loadNarration, NARRATION_DIR } from "./lib/narration.mjs";
import { timelinePath } from "./lib/timeline.mjs";
import { validateScenario, validateScenes } from "./record.mjs";

const VIDEO_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(VIDEO_DIR, "..", "..");
const DELIVERY_DIR = path.join(REPO_ROOT, "docs", "public", "assets", "video");
const PUBLIC_DIR = path.join(REPO_ROOT, "docs", "public");
const CONTENT_DIR = path.join(REPO_ROOT, "docs", "content");
const SCENARIO_DIR = path.join(VIDEO_DIR, "scenarios");
const WORK_DIR = path.join(VIDEO_DIR, "work");
const AUTH_PATH = path.join(WORK_DIR, "auth", "storage-state.json");
const SEED_PATH = path.join(
  REPO_ROOT,
  "tests",
  "fixtures",
  "demo",
  "seed-output.json",
);
const MAPS_DIR = path.join(REPO_ROOT, "tests", "fixtures", "demo", "maps");
const TILES_DIR = path.join(REPO_ROOT, "tests", "fixtures", "demo", "tiles");
const MANIFEST_PATH = path.join(DELIVERY_DIR, "manifest.json");
const DEFAULT_ID = "changing-basemaps";

async function main() {
  const args = process.argv.slice(2);

  if (args[0] === "--help" || args[0] === "-h") {
    printUsage();
    return;
  }

  if (args.length > 1) {
    throw new Error(`Unexpected argument "${args[1]}". Pass one video id.`);
  }

  const id = args[0] ?? DEFAULT_ID;
  const results = [];

  add(results, "section", "Recording instance");
  const baseURL = resolveBaseURL(results);

  // fixtures.js reads WP_BASE_URL when it is required, so set it before the
  // auth check imports the browser helpers.
  process.env.WP_BASE_URL = baseURL;
  await checkInstance(baseURL, results);

  add(results, "section", "Auth");
  await checkAuth(baseURL, results);

  add(results, "section", "Scenario and narration");
  const scenarioReport = checkScenario(id, results);

  add(results, "section", "Seed expectations");
  checkSeed(scenarioReport.scenario, baseURL, results);

  add(results, "section", "Tiles");
  checkTiles(scenarioReport.scenario, scenarioReport.mapSlug, results);

  add(results, "section", "Docs wiring");
  checkDocs(id, results);

  add(results, "section", "Assets");
  checkAssets(id, scenarioReport, results);

  printReport(id, results);

  if (results.some((result) => result.status === "fail")) {
    process.exitCode = 1;
  }
}

/**
 * Resolve WP_BASE_URL and refuse the project's development and tests
 * instances. The doctor must never probe 8888 or 8889.
 *
 * @param {Array<object>} results
 * @returns {string}
 */
function resolveBaseURL(results) {
  const value = (process.env.WP_BASE_URL ?? "http://localhost:11000")
    .trim()
    .replace(/\/+$/, "");

  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    add(results, "fail", `WP_BASE_URL is not a valid URL: ${value}`);
    return value;
  }

  if (parsed.port === "8888" || parsed.port === "8889") {
    add(
      results,
      "fail",
      `Refusing to probe ${value}: ports 8888 and 8889 are off-limits. ` +
        `Use the video instance on port 11000.`,
    );
    return value;
  }

  return value;
}

/**
 * GET the REST index and the home page title. Both are read-only.
 *
 * @param {string} baseURL
 * @param {Array<object>} results
 */
async function checkInstance(baseURL, results) {
  const refused = results.some(
    (result) =>
      result.status === "fail" &&
      result.message.startsWith("Refusing to probe"),
  );

  if (refused) {
    add(
      results,
      "warn",
      "site checks skipped because the base URL is refused.",
    );
    return;
  }

  let response;
  try {
    response = await fetch(`${baseURL}/wp-json/`, {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(5_000),
    });
  } catch (error) {
    add(
      results,
      "fail",
      `${baseURL} did not respond to GET /wp-json/ (${error.message}).`,
    );
    return;
  }

  if (!response.ok) {
    add(results, "fail", `${baseURL}/wp-json/ responded ${response.status}.`);
    return;
  }

  let site;
  try {
    site = await response.json();
  } catch {
    add(results, "fail", `${baseURL}/wp-json/ is not a JSON response.`);
    return;
  }

  if (typeof site?.name !== "string" || typeof site?.url !== "string") {
    add(
      results,
      "fail",
      `${baseURL}/wp-json/ did not return a WordPress site name and URL.`,
    );
    return;
  }

  const siteOrigin = new URL(site.url).origin;
  if (siteOrigin !== new URL(baseURL).origin) {
    add(
      results,
      "warn",
      `site URL ${site.url} differs from WP_BASE_URL ${baseURL}.`,
    );
  }

  const title = await fetchTitle(baseURL);
  const looksExpected = /waymark/i.test(`${site.name} ${title}`);
  add(
    results,
    looksExpected ? "ok" : "warn",
    `WordPress site "${site.name}" at ${site.url}` +
      `${title ? ` (title "${title}")` : ""}` +
      `${looksExpected ? "" : " does not look like the Waymark demo"}.`,
  );
}

/**
 * @param {string} baseURL
 * @returns {Promise<string | null>}
 */
async function fetchTitle(baseURL) {
  try {
    const response = await fetch(`${baseURL}/`, {
      signal: AbortSignal.timeout(5_000),
    });
    if (!response.ok) {
      return null;
    }
    const html = await response.text();
    const match = /<title[^>]*>(.*?)<\/title>/is.exec(html);
    return match ? match[1].replace(/\s+/g, " ").trim() : null;
  } catch {
    return null;
  }
}

/**
 * Verify the stored session without recording. A missing state file is a
 * warning; an expired state file is a failure with the exact fix.
 *
 * @param {string} baseURL
 * @param {Array<object>} results
 */
async function checkAuth(baseURL, results) {
  const refused = results.some(
    (result) =>
      result.status === "fail" &&
      result.message.startsWith("Refusing to probe"),
  );

  if (refused) {
    return;
  }

  if (!fs.existsSync(AUTH_PATH)) {
    add(
      results,
      "warn",
      `${displayPath(AUTH_PATH)} is missing; the recorder creates it on the ` +
        `first take.`,
    );
    return;
  }

  let browser;
  try {
    const { assertAuthenticated, launchBrowser } =
      await import("./lib/browser.mjs");
    browser = await launchBrowser();
    await assertAuthenticated(browser, baseURL);
    add(results, "ok", "stored session is live at /wp-admin/.");
  } catch (error) {
    add(
      results,
      "fail",
      `stored session check failed: ${firstLine(error.message)}`,
    );
  } finally {
    await browser?.close().catch(() => {});
  }
}

/**
 * Validate the scenario and its narration file, using the recorder's own
 * up-front checks.
 *
 * @param {string} id
 * @param {Array<object>} results
 * @returns {{ scenario: object | null, mapSlug: string | null }}
 */
function checkScenario(id, results) {
  const scenarioPath = path.join(SCENARIO_DIR, `${id}.json`);
  const narrationPath = path.join(NARRATION_DIR, `${id}.md`);
  let scenario = null;

  if (!fs.existsSync(scenarioPath)) {
    add(results, "fail", `scenario is missing: ${displayPath(scenarioPath)}.`);
  } else {
    try {
      scenario = JSON.parse(fs.readFileSync(scenarioPath, "utf8"));
    } catch (error) {
      add(
        results,
        "fail",
        `scenario is not valid JSON: ${displayPath(scenarioPath)} ` +
          `(${error.message}).`,
      );
    }
  }

  if (!fs.existsSync(narrationPath)) {
    add(
      results,
      "fail",
      `narration is missing: ${displayPath(narrationPath)}.`,
    );
  }

  if (!scenario) {
    return { scenario: null, mapSlug: null };
  }

  if (scenario.id !== id) {
    add(
      results,
      "fail",
      `scenario id "${scenario.id}" does not match the requested id "${id}".`,
    );
    return { scenario, mapSlug: null };
  }

  try {
    validateScenario(scenario);
    validateScenes(scenario);
  } catch (error) {
    add(results, "fail", `recorder validation failed: ${error.message}`);
    return { scenario, mapSlug: null };
  }

  try {
    const used = loadNarration(scenario);
    if (!used) {
      add(
        results,
        "fail",
        `narration is missing: ${displayPath(narrationPath)}.`,
      );
    } else {
      add(
        results,
        "ok",
        `scenario and narration pass recorder validation ` +
          `(${scenario.scenes.length} scenes).`,
      );
    }
  } catch (error) {
    add(results, "fail", `narration contract failed: ${error.message}`);
  }

  return {
    scenario,
    mapSlug: scenario.mapSlug ?? "cape-scott-trail",
  };
}

/**
 * Confirm the scenario's map slug resolves in the seeded fixture and note a
 * fixture/instance port mismatch.
 *
 * @param {object | null} scenario
 * @param {string} baseURL
 * @param {Array<object>} results
 */
function checkSeed(scenario, baseURL, results) {
  if (!scenario) {
    add(
      results,
      "warn",
      "seed checks skipped because the scenario is missing.",
    );
    return;
  }

  let seed;
  try {
    seed = JSON.parse(fs.readFileSync(SEED_PATH, "utf8"));
  } catch (error) {
    add(
      results,
      "fail",
      `seed fixture is unreadable: ${displayPath(SEED_PATH)} ` +
        `(${error.message}).`,
    );
    return;
  }

  const slug = scenario.mapSlug ?? "cape-scott-trail";
  const maps = Array.isArray(seed.maps) ? seed.maps : [];
  const map = maps.find((candidate) => candidate.slug === slug);

  if (!map) {
    const known = maps.map((candidate) => candidate.slug).join(", ");
    add(
      results,
      "fail",
      `mapSlug "${slug}" does not resolve in ` +
        `${displayPath(SEED_PATH)} (known: ${known || "none"}).`,
    );
  } else {
    add(
      results,
      "ok",
      `mapSlug "${slug}" resolves to map ${map.id} "${map.title}".`,
    );
  }

  const permalink = maps[0]?.permalink ?? seed.page?.url ?? null;
  if (permalink) {
    const fixturePort = new URL(permalink).port || "80";
    const instancePort = new URL(baseURL).port || "80";

    if (fixturePort !== instancePort) {
      add(
        results,
        "warn",
        `fixture permalinks use port ${fixturePort}, but the recording ` +
          `instance uses ${instancePort}; reseed the video instance before ` +
          `recording.`,
      );
    } else {
      add(
        results,
        "ok",
        `fixture permalinks use the recording port ${fixturePort}.`,
      );
    }
  }
}

/**
 * Report the pinned tile pack and compare it with the scenario.
 *
 * @param {object | null} scenario
 * @param {string | null} mapSlug
 * @param {Array<object>} results
 */
function checkTiles(scenario, mapSlug, results) {
  const pack = readTilePack(TILES_DIR);

  if (!pack.hosts.length) {
    add(
      results,
      "fail",
      `tile pack is missing or empty: ${displayPath(TILES_DIR)}.`,
    );
    return;
  }

  for (const host of pack.hosts) {
    add(
      results,
      "ok",
      `${host.name}: zoom ${formatZoomRange(host.zooms)}, ` +
        `${host.count} tile(s), lat ${formatRange(host.bounds.south, host.bounds.north)}, ` +
        `lon ${formatRange(host.bounds.west, host.bounds.east)}.`,
    );
  }

  if (!scenario) {
    add(
      results,
      "warn",
      "tile request checks skipped because the scenario is missing.",
    );
    return;
  }

  const requested = [
    ...new Set(
      (scenario.scenes ?? [])
        .map((scene) => scene.zoom)
        .filter((zoom) => Number.isFinite(zoom)),
    ),
  ].sort((a, b) => a - b);

  if (!requested.length) {
    add(results, "ok", "scenario does not pin a zoom.");
  } else {
    for (const zoom of requested) {
      const missing = pack.hosts.filter((host) => !host.zoomSet.has(zoom));
      if (missing.length) {
        add(
          results,
          "warn",
          `scenario requests zoom ${zoom}, which is not pinned for ` +
            `${missing.map((host) => host.name).join(", ")}.`,
        );
      } else {
        add(
          results,
          "ok",
          `scenario zoom ${zoom} is pinned for every tile host.`,
        );
      }
    }
  }

  if (!mapSlug) {
    add(
      results,
      "warn",
      "map coverage check skipped because mapSlug is unknown.",
    );
    return;
  }

  const mapPath = path.join(MAPS_DIR, `${mapSlug}.geojson`);
  if (!fs.existsSync(mapPath)) {
    add(
      results,
      "warn",
      `no map geometry for "${mapSlug}" at ${displayPath(mapPath)}; ` +
        `coverage not verified.`,
    );
    return;
  }

  const mapBounds = readGeoJsonBounds(mapPath);
  if (!mapBounds) {
    add(
      results,
      "warn",
      `could not read a bounding box from ${displayPath(mapPath)}.`,
    );
    return;
  }

  if (containsBounds(pack.bounds, mapBounds)) {
    add(results, "ok", `map "${mapSlug}" is inside the covered region.`);
  } else if (intersectsBounds(pack.bounds, mapBounds)) {
    add(
      results,
      "warn",
      `map "${mapSlug}" extends outside the covered region.`,
    );
  } else {
    add(results, "warn", `map "${mapSlug}" is outside the covered region.`);
  }
}

/**
 * Read the tile pack directory into per-host zoom sets and bounds.
 *
 * @param {string} directory
 */
function readTilePack(directory) {
  const hosts = [];
  const overall = {
    west: Infinity,
    south: Infinity,
    east: -Infinity,
    north: -Infinity,
  };

  let hostEntries;
  try {
    hostEntries = fs.readdirSync(directory, { withFileTypes: true });
  } catch {
    return { hosts, bounds: overall };
  }

  for (const hostEntry of hostEntries) {
    if (!hostEntry.isDirectory()) {
      continue;
    }

    const hostPath = path.join(directory, hostEntry.name);
    const zooms = [];
    const zoomSet = new Set();
    const bounds = {
      west: Infinity,
      south: Infinity,
      east: -Infinity,
      north: -Infinity,
    };
    let count = 0;

    for (const zoomEntry of fs.readdirSync(hostPath, { withFileTypes: true })) {
      if (!zoomEntry.isDirectory() || !/^\d+$/.test(zoomEntry.name)) {
        continue;
      }

      const zoom = Number(zoomEntry.name);
      zooms.push(zoom);
      zoomSet.add(zoom);
      const zoomPath = path.join(hostPath, zoomEntry.name);

      for (const xEntry of fs.readdirSync(zoomPath, { withFileTypes: true })) {
        if (!xEntry.isDirectory() || !/^\d+$/.test(xEntry.name)) {
          continue;
        }

        const x = Number(xEntry.name);
        const xPath = path.join(zoomPath, xEntry.name);

        for (const yEntry of fs.readdirSync(xPath, { withFileTypes: true })) {
          if (!yEntry.isFile() || !yEntry.name.endsWith(".png")) {
            continue;
          }

          const match = /^(\d+)\.png$/.exec(yEntry.name);
          if (!match) {
            continue;
          }

          const y = Number(match[1]);
          const tile = tileBounds(zoom, x, y);
          count += 1;
          bounds.west = Math.min(bounds.west, tile.west);
          bounds.south = Math.min(bounds.south, tile.south);
          bounds.east = Math.max(bounds.east, tile.east);
          bounds.north = Math.max(bounds.north, tile.north);
          overall.west = Math.min(overall.west, tile.west);
          overall.south = Math.min(overall.south, tile.south);
          overall.east = Math.max(overall.east, tile.east);
          overall.north = Math.max(overall.north, tile.north);
        }
      }
    }

    if (count) {
      hosts.push({
        name: hostEntry.name,
        zooms: zooms.sort((a, b) => a - b),
        zoomSet,
        count,
        bounds,
      });
    }
  }

  return { hosts, bounds: overall };
}

/**
 * Web Mercator tile bounds in degrees.
 *
 * @param {number} zoom
 * @param {number} x
 * @param {number} y
 */
function tileBounds(zoom, x, y) {
  const scale = 2 ** zoom;
  return {
    west: (x / scale) * 360 - 180,
    east: ((x + 1) / scale) * 360 - 180,
    north:
      Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / scale))) * (180 / Math.PI),
    south:
      Math.atan(Math.sinh(Math.PI * (1 - (2 * (y + 1)) / scale))) *
      (180 / Math.PI),
  };
}

/**
 * @param {string} filePath
 * @returns {{ west: number, south: number, east: number, north: number } | null}
 */
function readGeoJsonBounds(filePath) {
  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }

  const positions = [];
  collectPositions(parsed, positions);

  if (!positions.length) {
    return null;
  }

  return {
    west: Math.min(...positions.map((position) => position[0])),
    south: Math.min(...positions.map((position) => position[1])),
    east: Math.max(...positions.map((position) => position[0])),
    north: Math.max(...positions.map((position) => position[1])),
  };
}

/**
 * @param {unknown} value
 * @param {Array<number[]>} positions
 */
function collectPositions(value, positions) {
  if (!Array.isArray(value)) {
    if (value && typeof value === "object") {
      for (const child of Object.values(value)) {
        collectPositions(child, positions);
      }
    }
    return;
  }

  if (
    value.length >= 2 &&
    typeof value[0] === "number" &&
    typeof value[1] === "number"
  ) {
    positions.push([value[0], value[1]]);
    return;
  }

  for (const child of value) {
    collectPositions(child, positions);
  }
}

/**
 * @param {object} outer
 * @param {object} inner
 */
function containsBounds(outer, inner) {
  return (
    inner.west >= outer.west - 0.001 &&
    inner.east <= outer.east + 0.001 &&
    inner.south >= outer.south - 0.001 &&
    inner.north <= outer.north + 0.001
  );
}

/**
 * @param {object} first
 * @param {object} second
 */
function intersectsBounds(first, second) {
  return !(
    first.east < second.west ||
    first.west > second.east ||
    first.north < second.south ||
    first.south > second.north
  );
}

/**
 * Confirm the manifest entry, the docs figure and its caption attribute.
 *
 * @param {string} id
 * @param {Array<object>} results
 */
function checkDocs(id, results) {
  const manifest = readManifest();
  if (manifest === null) {
    add(
      results,
      "fail",
      `manifest is unreadable: ${displayPath(MANIFEST_PATH)}.`,
    );
  } else if (!manifest[id]) {
    add(
      results,
      "warn",
      `no manifest entry for "${id}" yet; the build writes it.`,
    );
  } else {
    add(results, "ok", `manifest has an entry for "${id}".`);
  }

  const figures = findVideoFigures(id);

  if (!figures.length) {
    add(
      results,
      "warn",
      `no docs video-figure references /assets/video/${id}.mp4 yet.`,
    );
    return;
  }

  for (const figure of figures) {
    const where = displayPath(figure.file);

    if (!figure.attributes.captions) {
      add(
        results,
        "fail",
        `${where} video-figure for "${id}" has no captions= attribute.`,
      );
      continue;
    }

    for (const attribute of ["poster", "captions"]) {
      const reference = figure.attributes[attribute];
      if (!reference) {
        continue;
      }

      const asset = path.join(PUBLIC_DIR, reference.replace(/^\/+/, ""));
      if (fs.existsSync(asset)) {
        add(results, "ok", `${where} ${attribute} exists: ${reference}.`);
      } else {
        add(
          results,
          "fail",
          `${where} ${attribute}="${reference}" is missing.`,
        );
      }
    }
  }
}

/**
 * @returns {object | null}
 */
function readManifest() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    return null;
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed
      : null;
  } catch {
    return null;
  }
}

/**
 * @param {string} id
 * @returns {Array<{ file: string, attributes: Record<string, string> }>}
 */
function findVideoFigures(id) {
  const figures = [];

  for (const file of findMarkdownFiles(CONTENT_DIR)) {
    const source = fs.readFileSync(file, "utf8");

    for (const match of source.matchAll(/::video-figure\{([^}]*)\}/g)) {
      const attributes = parseAttributes(match[1]);
      const src = attributes.src ?? "";

      if (src.endsWith(`/assets/video/${id}.mp4`)) {
        figures.push({ file, attributes });
      }
    }
  }

  return figures;
}

/**
 * @param {string} source
 * @returns {Record<string, string>}
 */
function parseAttributes(source) {
  const attributes = {};

  for (const match of source.matchAll(/([a-zA-Z-]+)="([^"]*)"/g)) {
    attributes[match[1]] = match[2];
  }

  return attributes;
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
 * Report the local asset set. Missing recorded and delivered files are
 * warnings because they are expected before the first take.
 *
 * @param {string} id
 * @param {{ scenario: object | null }} scenarioReport
 * @param {Array<object>} results
 */
function checkAssets(id, scenarioReport, results) {
  const assets = [
    {
      label: "scenario",
      filePath: path.join(SCENARIO_DIR, `${id}.json`),
      missing: "not authored yet",
      required: true,
    },
    {
      label: "narration",
      filePath: path.join(NARRATION_DIR, `${id}.md`),
      missing: "not authored yet",
      required: true,
    },
    {
      label: "audio directory",
      filePath: path.join(WORK_DIR, "audio", id),
      missing: "not synthesised yet",
    },
    {
      label: "raw take",
      filePath: path.join(WORK_DIR, "raw", `${id}.webm`),
      missing: "not recorded yet",
    },
    {
      label: "timeline",
      filePath: timelinePath(id),
      missing: "not recorded yet",
    },
    {
      label: "delivered MP4",
      filePath: path.join(DELIVERY_DIR, `${id}.mp4`),
      missing: "not built yet",
    },
    {
      label: "delivered poster",
      filePath: path.join(DELIVERY_DIR, "posters", `${id}.jpg`),
      missing: "not built yet",
    },
    {
      label: "delivered captions",
      filePath: path.join(DELIVERY_DIR, "captions", `${id}.en.vtt`),
      missing: "not built yet",
    },
    {
      label: "delivered transcript",
      filePath: path.join(DELIVERY_DIR, "transcripts", `${id}.md`),
      missing: "not built yet",
    },
  ];

  for (const asset of assets) {
    const exists = fs.existsSync(asset.filePath);

    if (!exists) {
      add(
        results,
        asset.required ? "fail" : "warn",
        `${asset.label} is missing (${asset.missing}): ` +
          `${displayPath(asset.filePath)}.`,
      );
      continue;
    }

    if (asset.label === "audio directory") {
      const files = fs.readdirSync(asset.filePath);
      add(
        results,
        "ok",
        `${asset.label}: ${displayPath(asset.filePath)} (${files.length} entries).`,
      );
    } else {
      const stat = fs.statSync(asset.filePath);
      add(
        results,
        "ok",
        `${asset.label}: ${displayPath(asset.filePath)} ` +
          `(${stat.size} bytes).`,
      );
    }
  }
}

/**
 * @param {string[]} zooms
 */
function formatZoomRange(zooms) {
  if (!zooms.length) {
    return "none";
  }

  return zooms.length === 1
    ? String(zooms[0])
    : `${zooms[0]}–${zooms[zooms.length - 1]}`;
}

/**
 * @param {number} first
 * @param {number} second
 */
function formatRange(first, second) {
  return `${first.toFixed(3)}–${second.toFixed(3)}`;
}

/**
 * @param {Array<object>} results
 * @param {"ok" | "warn" | "fail" | "section"} status
 * @param {string} message
 */
function add(results, status, message) {
  results.push({ status, message });
}

/**
 * @param {string} id
 * @param {Array<object>} results
 */
function printReport(id, results) {
  console.log(`[video] Doctor: ${id}`);

  for (const result of results) {
    if (result.status === "section") {
      console.log("");
      console.log(`[video] ${result.message}`);
      continue;
    }

    console.log(`[video]   ${result.status.padEnd(4)}  ${result.message}`);
  }

  const counts = results.reduce(
    (total, result) => {
      if (result.status !== "section") {
        total[result.status] += 1;
      }
      return total;
    },
    { ok: 0, warn: 0, fail: 0 },
  );

  console.log("");
  console.log(
    `[video] Summary: ${counts.ok} ok, ${counts.warn} warn, ` +
      `${counts.fail} fail.`,
  );
}

/**
 * @param {string} filePath
 */
function displayPath(filePath) {
  return path.relative(REPO_ROOT, filePath).split(path.sep).join("/");
}

/**
 * Keep one readable line from a browser error and strip terminal colours.
 *
 * @param {string} message
 * @returns {string}
 */
function firstLine(message) {
  return String(message ?? "")
    .replace(/\u001b\[[0-9;]*m/g, "")
    .split(/\r?\n/)[0]
    .trim();
}

function printUsage() {
  console.log(
    [
      "Usage:",
      "  node scripts/video/doctor.mjs [id]",
      "",
      `The id defaults to ${DEFAULT_ID}.`,
      "",
      "Read-only checks against WP_BASE_URL (default http://localhost:11000).",
      "Nothing is written, reseeded or recorded.",
    ].join("\n"),
  );
}

main().catch((error) => {
  console.error(`[video] DOCTOR FAILED: ${error.message}`);
  process.exitCode = 1;
});
