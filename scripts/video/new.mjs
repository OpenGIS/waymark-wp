#!/usr/bin/env node
// Scaffold a scenario and narration pair for a new video.
//
// Usage:
//   node scripts/video/new.mjs <id>
//
// Creates scripts/video/scenarios/<id>.json and narration/<id>.md. Both files
// are refused if they already exist, so a scaffold never overwrites authored
// work. The generated pair satisfies the recorder's eager validation and the
// narration heading contract; real selectors and copy replace the <TODO>
// placeholders before recording.
"use strict";

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const VIDEO_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(VIDEO_DIR, "..", "..");
const SCENARIO_DIR = path.join(VIDEO_DIR, "scenarios");
const NARRATION_DIR = path.join(VIDEO_DIR, "narration");
const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function main() {
  const id = process.argv[2];

  if (id === undefined || id === "--help" || id === "-h") {
    printUsage();
    process.exitCode = id === undefined ? 1 : 0;
    return;
  }

  if (process.argv.length > 3) {
    throw new Error(
      `Unexpected argument "${process.argv[3]}". Pass a single video id.`,
    );
  }

  if (!ID_PATTERN.test(id)) {
    throw new Error(
      `Invalid id "${id}". Use lowercase letters, digits and single hyphens, ` +
        `for example "using-collections".`,
    );
  }

  const scenarioPath = path.join(SCENARIO_DIR, `${id}.json`);
  const narrationPath = path.join(NARRATION_DIR, `${id}.md`);

  for (const filePath of [scenarioPath, narrationPath]) {
    if (fs.existsSync(filePath)) {
      throw new Error(
        `Refusing to overwrite ${displayPath(filePath)}; it already exists.`,
      );
    }
  }

  fs.mkdirSync(SCENARIO_DIR, { recursive: true });
  fs.mkdirSync(NARRATION_DIR, { recursive: true });

  fs.writeFileSync(
    scenarioPath,
    `${JSON.stringify(buildScenario(id), null, 2)}\n`,
    "utf8",
  );
  fs.writeFileSync(narrationPath, buildNarration(), "utf8");

  console.log(`[video] Created ${displayPath(scenarioPath)}.`);
  console.log(`[video] Created ${displayPath(narrationPath)}.`);
  console.log(
    "[video] Replace every <TODO> placeholder, then run " +
      `"npm run video:doctor ${id}" before narrating.`,
  );
}

/**
 * The skeleton scene list: an opening card, one real navigation, an
 * intentional beat and a closing card.
 *
 * @param {string} id
 * @returns {object}
 */
function buildScenario(id) {
  const title = "<TODO: Video title>";

  return {
    version: "1",
    id,
    title,
    output: `docs/public/assets/video/${id}.mp4`,
    viewport: { width: 1280, height: 720 },
    storageState: "scripts/video/work/auth/storage-state.json",
    mapSlug: "cape-scott-trail",
    posterAt: "00:00:05",
    pad: 0.5,
    hideSelectors: [],
    scenes: [
      {
        id: "title",
        action: "card",
        card: {
          eyebrow: "<TODO: Eyebrow>",
          title,
          subtitle: "<TODO: Opening subtitle>",
        },
        hold: 2,
        highlight: null,
        cursor: null,
        notes: "Opening card. Replace the eyebrow, title and subtitle.",
      },
      {
        id: "open",
        action: "goto",
        url: "{{baseURL}}/wp-admin/post.php?post={{mapId}}&action=edit",
        selector: "<TODO: selector for the loaded view>",
        hold: 8,
        highlight: null,
        cursor: null,
        notes: "Replace the selector, then add the real opening action.",
      },
      {
        id: "pause",
        action: "pause",
        hold: 6,
        highlight: null,
        cursor: null,
        notes: "Replace with a real action, or keep as an intentional beat.",
      },
      {
        id: "end",
        action: "card",
        card: {
          eyebrow: "<TODO: Eyebrow>",
          title,
          subtitle: "<TODO: Closing line>",
        },
        hold: 2.8,
        highlight: null,
        cursor: null,
        notes: "Closing card. Replace the eyebrow, title and subtitle.",
      },
    ],
  };
}

/**
 * One `## <scene-id>` heading per scene, in scenario order.
 *
 * @returns {string}
 */
function buildNarration() {
  return [
    "# <TODO: Video title>",
    "",
    "## title",
    "",
    "(no narration)",
    "",
    "## open",
    "",
    "<TODO: Opening narration.>",
    "",
    "## pause",
    "",
    "(no narration)",
    "",
    "## end",
    "",
    "(no narration)",
    "",
  ].join("\n");
}

function printUsage() {
  console.log(
    [
      "Usage:",
      "  node scripts/video/new.mjs <id>",
      "",
      "Creates scripts/video/scenarios/<id>.json and narration/<id>.md.",
      "The id uses lowercase letters, digits and single hyphens.",
    ].join("\n"),
  );
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
  console.error(`[video] ${error.message}`);
  process.exitCode = 1;
}
