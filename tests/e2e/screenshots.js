// Readme-screenshot publisher and verifier.
//
// The capture spec writes canonical JPEGs to
// `.opencode/tmp/screenshots/canonical/` when `WAYMARK_SCREENSHOTS=1`. This
// helper owns the managed mapping between those files and the WordPress.org
// plugin directory, and is driven by the `screenshots` / `screenshots:check`
// npm scripts (which only reach it after a passing capture run):
//
//   node tests/e2e/screenshots.js publish   # copy canonical -> .wordpress-org
//   node tests/e2e/screenshots.js check      # SHA-256 compare, non-zero on drift
//
// Only the managed readme assets are ever touched.
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { MANAGED, hashReadmeFile } = require("../../scripts/readme-assets");

const ROOT = path.join(__dirname, "..", "..");
const CANONICAL_DIR = path.join(
  ROOT,
  ".opencode",
  "tmp",
  "screenshots",
  "canonical",
);
const TARGET_DIR = path.join(ROOT, ".wordpress-org");
const README_MD = path.join(ROOT, "readme.md");

/**
 * @param {string} file
 * @returns {string} the file's lowercase SHA-256 hex digest
 */
function sha256(file) {
  return crypto
    .createHash("sha256")
    .update(fs.readFileSync(file))
    .digest("hex");
}

/**
 * Absolute path of a managed canonical file.
 *
 * @param {string} name
 * @returns {string}
 */
function canonicalPath(name) {
  return path.join(CANONICAL_DIR, `${name}.jpg`);
}

/**
 * Absolute path of a managed published file.
 *
 * @param {string} name
 * @returns {string}
 */
function targetPath(name) {
  return path.join(TARGET_DIR, `${name}.jpg`);
}

/**
 * Copy every canonical capture into the plugin directory.
 *
 * @returns {number} process exit code
 */
function publish() {
  const missing = MANAGED.filter((name) => !fs.existsSync(canonicalPath(name)));

  if (missing.length) {
    console.error(
      `Canonical capture(s) missing: ${missing.join(", ")}\n` +
        `Run \`npm run screenshots\` after a passing capture run.`,
    );
    return 1;
  }

  if (!fs.existsSync(README_MD)) {
    console.error(
      `readme.md is missing; run \`npx grunt build_wp_md\` before publishing.`,
    );
    return 1;
  }

  fs.mkdirSync(TARGET_DIR, { recursive: true });

  for (const name of MANAGED) {
    const source = canonicalPath(name);
    const destination = targetPath(name);
    fs.copyFileSync(source, destination);
    const bytes = fs.statSync(destination).size;
    console.log(
      `published ${name}.jpg -> ${path.relative(ROOT, destination)} (${bytes} bytes)`,
    );
  }

  hashReadmeFile();
  console.log("Updated readme.md asset URLs with their content hashes.");

  return 0;
}

/**
 * Compare every canonical capture against its published copy.
 *
 * @returns {number} process exit code
 */
function check() {
  const conflicts = [];

  for (const name of MANAGED) {
    const source = canonicalPath(name);
    const destination = targetPath(name);
    const relative = path.relative(ROOT, destination);

    if (!fs.existsSync(source)) {
      conflicts.push(`${name}.jpg: canonical capture missing`);
      continue;
    }

    if (!fs.existsSync(destination)) {
      conflicts.push(`${name}.jpg: ${relative} missing`);
      continue;
    }

    const sourceSha = sha256(source);
    const targetSha = sha256(destination);

    if (sourceSha === targetSha) {
      console.log(`ok    ${name}.jpg  ${sourceSha}`);
    } else {
      conflicts.push(
        `${name}.jpg: drift (canonical ${sourceSha.slice(0, 12)} != published ${targetSha.slice(0, 12)})`,
      );
    }
  }

  if (conflicts.length) {
    console.error(
      `\n${conflicts.length} managed readme asset(s) need republishing:`,
    );
    for (const conflict of conflicts) {
      console.error(`  - ${conflict}`);
    }
    console.error("\nRun `npm run screenshots` to recapture and republish.");
    return 1;
  }

  console.log(`\n${MANAGED.length} managed readme assets match.`);
  return 0;
}

const command = process.argv[2];
const commands = { publish, check };

if (!commands[command]) {
  console.error("Usage: node tests/e2e/screenshots.js <publish|check>");
  process.exit(2);
}

process.exit(commands[command]());
