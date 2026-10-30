// Managed readme assets for the WordPress.org plugin directory.
//
// The generated `readme.md` embeds screenshots from `ps.w.org`. Those files can
// change between releases, so every managed URL carries a short content hash.
// This module owns the managed asset list and is shared by the Grunt readme
// build and the screenshot publisher.
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const ROOT = path.join(__dirname, "..");
const ASSET_DIR = path.join(ROOT, ".wordpress-org");
const README_MD = path.join(ROOT, "readme.md");
const README_TXT = path.join(ROOT, "readme.txt");

const MANAGED = [
  "editor-demo",
  ...Array.from({ length: 21 }, (_unused, index) => `screenshot-${index + 1}`),
];

const EXPECTED_STATIC_ASSETS = [
  "banner-1544x500.jpg",
  "banner-772x250.jpg",
  "icon-128x128.png",
  "icon-256x256.png",
];

const MANAGED_URL_PREFIX = "https://ps.w.org/waymark/assets/";

/**
 * Escape a string for use in a regular expression.
 *
 * @param {string} value
 * @returns {string}
 */
function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Longest names first so the alternation cannot settle on a prefix.
const MANAGED_PATTERN = [...MANAGED]
  .sort((a, b) => b.length - a.length)
  .map(escapeRegExp)
  .join("|");

const REWRITE_PATTERN = new RegExp(
  `${escapeRegExp(MANAGED_URL_PREFIX)}(${MANAGED_PATTERN})\\.jpg(?:\\?[^\\s)"'<>]*)?`,
  "g",
);

/**
 * Absolute path of a managed asset.
 *
 * @param {string} name
 * @returns {string}
 */
function assetPath(name) {
  return path.join(ASSET_DIR, `${name}.jpg`);
}

/**
 * Content hash for a managed asset.
 *
 * @param {string} name
 * @returns {string} the first 12 characters of the file's SHA-256 hex digest
 */
function assetVersion(name) {
  const file = assetPath(name);

  if (!fs.existsSync(file)) {
    throw new Error(
      `Cannot hash missing readme asset: ${path.relative(ROOT, file)}`,
    );
  }

  return crypto
    .createHash("sha256")
    .update(fs.readFileSync(file))
    .digest("hex")
    .slice(0, 12);
}

/**
 * Add or refresh content hashes on managed screenshot URLs.
 *
 * URLs that are not managed are left untouched, and rewriting is idempotent.
 *
 * @param {string} markdown
 * @returns {string}
 */
function rewriteReadmeAssetUrls(markdown) {
  return markdown.replace(
    REWRITE_PATTERN,
    (_match, name) =>
      `${MANAGED_URL_PREFIX}${name}.jpg?v=${assetVersion(name)}`,
  );
}

/**
 * Rewrite the generated readme with current asset hashes.
 *
 * @param {string} [filePath]
 * @returns {void}
 */
function hashReadmeFile(filePath = README_MD) {
  const markdown = fs.readFileSync(filePath, "utf8");
  fs.writeFileSync(filePath, rewriteReadmeAssetUrls(markdown));
}

/**
 * Extract the body of a `== Section ==` from a WordPress readme.
 *
 * @param {string} readme
 * @param {string} title
 * @returns {string}
 */
function readmeSection(readme, title) {
  const wanted = title.toLowerCase();
  const collected = [];
  let inSection = false;

  for (const line of readme.split(/\r?\n/)) {
    const heading = /^==\s*(.+?)\s*==$/.exec(line);

    if (heading) {
      inSection = heading[1].toLowerCase() === wanted;
      continue;
    }

    if (inSection) {
      collected.push(line);
    }
  }

  return collected.join("\n");
}

/**
 * Count numbered entries in the `== Screenshots ==` section.
 *
 * @param {string} readme
 * @returns {number}
 */
function countScreenshotEntries(readme) {
  return readmeSection(readme, "screenshots")
    .split(/\r?\n/)
    .filter((line) => /^\d+\.\s+\S/.test(line)).length;
}

/**
 * Verify managed assets and their URLs in both readme files.
 *
 * @returns {string[]} human-readable errors; empty when everything matches
 */
function checkReadmeAssets() {
  const errors = [];

  for (const name of MANAGED) {
    const file = assetPath(name);

    if (!fs.existsSync(file)) {
      errors.push(`Missing managed asset ${path.relative(ROOT, file)}.`);
    }
  }

  for (const name of EXPECTED_STATIC_ASSETS) {
    const file = path.join(ASSET_DIR, name);

    if (!fs.existsSync(file)) {
      errors.push(`Missing static asset ${path.relative(ROOT, file)}.`);
    }
  }

  if (!fs.existsSync(README_MD)) {
    errors.push(`Missing ${path.relative(ROOT, README_MD)}.`);
  } else {
    const markdown = fs.readFileSync(README_MD, "utf8");

    for (const name of MANAGED) {
      if (!fs.existsSync(assetPath(name))) {
        continue;
      }

      const version = assetVersion(name);
      const pattern = new RegExp(
        `${escapeRegExp(MANAGED_URL_PREFIX + name)}\\.jpg(?:\\?[^\\s)"'<>]*)?`,
        "g",
      );
      const matches = markdown.match(pattern) || [];
      const expected = `${MANAGED_URL_PREFIX}${name}.jpg?v=${version}`;

      if (matches.length !== 1) {
        errors.push(
          `${name}.jpg appears ${matches.length} time(s) in readme.md; expected exactly once.`,
        );
        continue;
      }

      if (matches[0] !== expected) {
        errors.push(
          `${name}.jpg in readme.md is ${matches[0]}; expected ${expected}.`,
        );
      }
    }
  }

  if (!fs.existsSync(README_TXT)) {
    errors.push(`Missing ${path.relative(ROOT, README_TXT)}.`);
  } else {
    const readme = fs.readFileSync(README_TXT, "utf8");

    for (const name of MANAGED) {
      const versioned = new RegExp(
        `${escapeRegExp(MANAGED_URL_PREFIX + name)}\\.jpg\\?v=`,
      );

      if (versioned.test(readme)) {
        errors.push(
          `readme.txt must not version ${name}.jpg; remove the ?v= query string.`,
        );
      }
    }

    const entries = countScreenshotEntries(readme);

    if (entries !== 21) {
      errors.push(
        `readme.txt == Screenshots == has ${entries} entries; expected 21.`,
      );
    }

    if (!readmeSection(readme, "description").includes("editor-demo.jpg")) {
      errors.push("readme.txt description is missing editor-demo.jpg.");
    }
  }

  let assetFiles = [];

  try {
    assetFiles = fs.readdirSync(ASSET_DIR);
  } catch (_error) {
    errors.push(`Missing ${path.relative(ROOT, ASSET_DIR)} directory.`);
  }

  const managedScreenshots = new Set(
    MANAGED.filter((name) => name.startsWith("screenshot-")).map(
      (name) => `${name}.jpg`,
    ),
  );

  for (const file of assetFiles) {
    if (/^screenshot-.+\.jpg$/i.test(file) && !managedScreenshots.has(file)) {
      errors.push(
        `Unexpected screenshot asset ${path.join(".wordpress-org", file)}; only screenshot-1.jpg to screenshot-21.jpg are managed.`,
      );
    }
  }

  return errors;
}

/**
 * Command-line entry point.
 *
 * @param {string[]} argv
 * @returns {number} process exit code
 */
function main(argv) {
  const command = argv[2];

  if (command === "check") {
    const errors = checkReadmeAssets();

    if (errors.length) {
      console.error("Readme asset check failed:");
      for (const error of errors) {
        console.error(`  - ${error}`);
      }
      return 1;
    }

    console.log(
      `Readme assets OK: ${MANAGED.length} managed URLs carry their content hash.`,
    );
    return 0;
  }

  if (command === "hash") {
    hashReadmeFile();
    console.log("Updated readme.md asset URLs with their content hashes.");
    return 0;
  }

  console.error("Usage: node scripts/readme-assets.js <check|hash>");
  return 2;
}

if (require.main === module) {
  process.exit(main(process.argv));
}

module.exports = {
  MANAGED,
  EXPECTED_STATIC_ASSETS,
  assetVersion,
  rewriteReadmeAssetUrls,
  hashReadmeFile,
  checkReadmeAssets,
};
