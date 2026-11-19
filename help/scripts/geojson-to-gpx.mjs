import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import { basename, dirname, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const helpRoot = resolve(scriptDir, "..");
const defaultGeoDir = resolve(helpRoot, "public/assets/geo");

const XML_ESCAPES = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&apos;",
};

function escapeXml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (character) => XML_ESCAPES[character],
  );
}

function hasText(value) {
  return typeof value === "string" && value.trim() !== "";
}

function titleCaseBasename(filePath) {
  const name = basename(filePath, extname(filePath));
  return name
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function coordinateParts(coordinates, context) {
  if (!Array.isArray(coordinates) || coordinates.length < 2) {
    throw new Error(`${context}: expected at least two coordinate ordinates`);
  }

  const [lon, lat, ele] = coordinates;

  if (typeof lon !== "number" || !Number.isFinite(lon)) {
    throw new Error(`${context}: longitude is not a finite number`);
  }
  if (typeof lat !== "number" || !Number.isFinite(lat)) {
    throw new Error(`${context}: latitude is not a finite number`);
  }
  if (ele !== undefined && (typeof ele !== "number" || !Number.isFinite(ele))) {
    throw new Error(`${context}: elevation is not a finite number`);
  }

  return { lon, lat, ele };
}

function indented(lines, depth) {
  const pad = "  ".repeat(depth);
  return lines.map((line) => pad + line);
}

function textElement(tag, value, depth) {
  return hasText(value)
    ? indented([`<${tag}>${escapeXml(value)}</${tag}>`], depth)
    : [];
}

function featureElements(properties, depth) {
  return [
    ...textElement("name", properties.title, depth),
    ...textElement("desc", properties.description, depth),
    ...textElement("type", properties.type, depth),
  ];
}

function convertCollection(collection, sourcePath) {
  if (!collection || collection.type !== "FeatureCollection") {
    throw new Error(`${sourcePath}: expected a GeoJSON FeatureCollection`);
  }
  if (!Array.isArray(collection.features)) {
    throw new Error(
      `${sourcePath}: FeatureCollection is missing a features array`,
    );
  }

  const lineFeatures = collection.features.filter(
    (feature) =>
      feature && feature.geometry && feature.geometry.type === "LineString",
  );
  const pointFeatures = collection.features.filter(
    (feature) =>
      feature && feature.geometry && feature.geometry.type === "Point",
  );

  for (const [index, feature] of collection.features.entries()) {
    if (!feature || feature.type !== "Feature") {
      throw new Error(
        `${sourcePath}: feature ${index} is not a GeoJSON Feature`,
      );
    }
    const geometry = feature.geometry;
    if (!geometry || typeof geometry.type !== "string") {
      throw new Error(`${sourcePath}: feature ${index} has no geometry`);
    }
    if (geometry.type !== "LineString" && geometry.type !== "Point") {
      throw new Error(
        `${sourcePath}: feature ${index} uses unsupported geometry type "${geometry.type}"`,
      );
    }
    feature.properties = feature.properties ?? {};
  }

  const metadataTitle = lineFeatures
    .map((feature) => feature.properties.title)
    .find(hasText);

  const metadataName = metadataTitle ?? titleCaseBasename(sourcePath);

  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<gpx xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd" version="1.1" creator="Waymark">',
    "  <metadata>",
    `    <name>${escapeXml(metadataName)}</name>`,
    "  </metadata>",
  ];

  for (const [index, feature] of pointFeatures.entries()) {
    const { lon, lat, ele } = coordinateParts(
      feature.geometry.coordinates,
      `${sourcePath}: point feature ${index}`,
    );
    const properties = feature.properties;

    lines.push(`  <wpt lat="${lat}" lon="${lon}">`);
    if (ele !== undefined) {
      lines.push(`    <ele>${ele}</ele>`);
    }
    lines.push(...featureElements(properties, 2));
    lines.push("  </wpt>");
  }

  for (const [featureIndex, feature] of lineFeatures.entries()) {
    const properties = feature.properties;
    const coordinates = feature.geometry.coordinates;

    if (!Array.isArray(coordinates)) {
      throw new Error(
        `${sourcePath}: line feature ${featureIndex} has no coordinates`,
      );
    }

    lines.push("  <trk>");
    lines.push(...featureElements(properties, 2));
    lines.push("    <trkseg>");

    for (const [coordinateIndex, coordinate] of coordinates.entries()) {
      const { lon, lat, ele } = coordinateParts(
        coordinate,
        `${sourcePath}: line feature ${featureIndex} coordinate ${coordinateIndex}`,
      );

      if (ele === undefined) {
        lines.push(`      <trkpt lat="${lat}" lon="${lon}"></trkpt>`);
      } else {
        lines.push(`      <trkpt lat="${lat}" lon="${lon}">`);
        lines.push(`        <ele>${ele}</ele>`);
        lines.push("      </trkpt>");
      }
    }

    lines.push("    </trkseg>");
    lines.push("  </trk>");
  }

  lines.push("</gpx>");

  return lines.join("\n") + "\n";
}

async function collectGeoJsonFiles(inputPaths) {
  if (inputPaths.length === 0) {
    const entries = await readdir(defaultGeoDir, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".geojson"))
      .map((entry) => resolve(defaultGeoDir, entry.name))
      .sort();
  }

  const files = [];

  for (const inputPath of inputPaths) {
    const absolutePath = resolve(inputPath);
    const info = await stat(absolutePath);

    if (info.isDirectory()) {
      const entries = await readdir(absolutePath, { withFileTypes: true });
      files.push(
        ...entries
          .filter((entry) => entry.isFile() && entry.name.endsWith(".geojson"))
          .map((entry) => resolve(absolutePath, entry.name))
          .sort(),
      );
    } else {
      files.push(absolutePath);
    }
  }

  return files;
}

async function convertFile(sourcePath) {
  let raw;
  try {
    raw = await readFile(sourcePath, "utf8");
  } catch (error) {
    throw new Error(`${sourcePath}: could not read file (${error.message})`);
  }

  let collection;
  try {
    collection = JSON.parse(raw);
  } catch (error) {
    throw new Error(`${sourcePath}: invalid JSON (${error.message})`);
  }

  const xml = convertCollection(collection, sourcePath);
  const target = sourcePath.replace(/\.geojson$/i, "") + ".gpx";
  await writeFile(target, xml, "utf8");

  return target;
}

async function main() {
  const files = await collectGeoJsonFiles(process.argv.slice(2));

  if (files.length === 0) {
    throw new Error("No .geojson files found to convert");
  }

  for (const file of files) {
    const target = await convertFile(file);
    console.log(`${file} -> ${target}`);
  }
}

main().catch((error) => {
  console.error(`geojson-to-gpx: ${error.message}`);
  process.exitCode = 1;
});
