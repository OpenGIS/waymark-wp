// @ts-check
/**
 * Authoring tool: writes deterministic EXIF metadata onto the demo images.
 *
 * Manual use only — run `npm run fixtures:exif` after editing the manifest.
 * This is deliberately not wired into install, test or CI. The script only
 * touches metadata, so pixels, dimensions, file names and orientation stay
 * exactly as they are.
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { exiftool } from "exiftool-vendored";

const script_dir = path.dirname(fileURLToPath(import.meta.url));
const project_root = path.resolve(script_dir, "../..");
const fixture_dir = path.join(project_root, "tests/fixtures/demo");
const images_dir = path.join(fixture_dir, "images");
const manifest_path = path.join(fixture_dir, "image-metadata.json");

const required_keys = [
  "key",
  "file",
  "title",
  "alt",
  "camera_make",
  "camera_model",
  "taken_at",
  "utc_offset",
  "latitude",
  "longitude",
  "altitude",
];

function fail(message) {
  throw new Error(message);
}

function read_manifest() {
  return readFile(manifest_path, "utf8").then((raw) => {
    let entries;
    try {
      entries = JSON.parse(raw);
    } catch (error) {
      fail(`Unable to parse ${manifest_path}: ${error.message}`);
    }

    if (!Array.isArray(entries) || entries.length === 0) {
      fail(`${manifest_path} must contain a non-empty array.`);
    }

    for (const entry of entries) {
      for (const key of required_keys) {
        if (!(key in entry)) {
          fail(`Manifest entry is missing "${key}": ${JSON.stringify(entry)}`);
        }
      }
    }

    return entries;
  });
}

function tags_for(entry) {
  const latitude = Number(entry.latitude);
  const longitude = Number(entry.longitude);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    fail(`Invalid coordinates for ${entry.file}.`);
  }

  return {
    "IFD0:Make": entry.camera_make,
    "IFD0:Model": entry.camera_model,
    "EXIF:DateTimeOriginal": entry.taken_at,
    "EXIF:CreateDate": entry.taken_at,
    "EXIF:OffsetTimeOriginal": entry.utc_offset,
    "EXIF:ExifVersion": "0232",
    "EXIF:ColorSpace#": 1,
    "EXIF:ComponentsConfiguration": "Y, Cb, Cr, -",
    "YCbCrPositioning#": 1,
    "GPS:GPSLatitude": Math.abs(latitude),
    "GPS:GPSLatitudeRef": latitude < 0 ? "S" : "N",
    "GPS:GPSLongitude": Math.abs(longitude),
    "GPS:GPSLongitudeRef": longitude < 0 ? "W" : "E",
    "GPS:GPSAltitude": Number(entry.altitude),
    "GPS:GPSAltitudeRef#": 0,
    "Orientation#": 1,
  };
}

async function main() {
  const entries = await read_manifest();

  for (const entry of entries) {
    const image_path = path.join(images_dir, entry.file);
    await exiftool.write(image_path, tags_for(entry), ["-overwrite_original"]);
    console.log(`Wrote EXIF metadata to ${entry.file}`);
  }
}

try {
  await main();
} finally {
  await exiftool.end();
}
