// Narration-file parsing shared by the recorder and the TTS step.
//
// A narration file is the authoritative script for its scenario: one
// `## <scene-id>` heading per scenario scene, in scenario order. `(no narration)`
// marks an intentional silent beat and is stored as an empty string.
"use strict";

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const NARRATION_DIR = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "narration",
);

/**
 * Replace inline scene narration with the authoritative narration file when
 * `scripts/video/narration/<id>.md` exists. The file must cover every scenario
 * scene, contain no extra scenes and list the headings in scenario order.
 *
 * @param {object} scenario
 * @returns {string | null} the narration file used, or null when absent
 */
export function loadNarration(scenario) {
  const filePath = path.join(NARRATION_DIR, `${scenario.id}.md`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const entries = parseNarration(fs.readFileSync(filePath, "utf8"), filePath);
  const scenarioIds = scenario.scenes.map((scene) => scene.id);
  const scenarioIdSet = new Set(scenarioIds);
  const missing = scenarioIds.filter((id) => !entries.has(id));
  const unused = [...entries.keys()].filter((id) => !scenarioIdSet.has(id));

  if (missing.length || unused.length) {
    const details = [];
    if (missing.length) {
      details.push(`missing scene(s): ${missing.join(", ")}`);
    }
    if (unused.length) {
      details.push(`unused scene(s): ${unused.join(", ")}`);
    }

    throw new Error(
      `Narration "${filePath}" does not match scenario "${scenario.id}": ` +
        `${details.join("; ")}.`,
    );
  }

  const narrationIds = [...entries.keys()];
  for (let index = 0; index < scenarioIds.length; index += 1) {
    if (narrationIds[index] !== scenarioIds[index]) {
      throw new Error(
        `Narration "${filePath}" scene order does not match the scenario: ` +
          `expected "${scenarioIds[index]}" at position ${index + 1}, found ` +
          `"${narrationIds[index]}".`,
      );
    }
  }

  for (const scene of scenario.scenes) {
    scene.narration = entries.get(scene.id);
  }

  return filePath;
}

/**
 * Parse a narration file into ordered scene text. Only `## <scene-id>` headings
 * delimit scenes; the H1 title and any text before the first heading are
 * ignored. `(no narration)` is stored as an empty string.
 *
 * @param {string} source
 * @param {string} filePath
 * @returns {Map<string, string>}
 */
export function parseNarration(source, filePath) {
  const entries = new Map();
  let sceneId = null;
  let lines = [];

  const commit = () => {
    if (sceneId === null) {
      return;
    }

    if (entries.has(sceneId)) {
      throw new Error(`Narration "${filePath}" repeats scene "${sceneId}".`);
    }

    const text = lines
      .map((line) => line.trim())
      .filter(Boolean)
      .join(" ")
      .trim();

    entries.set(sceneId, text === "(no narration)" ? "" : text);
  };

  for (const line of source.split(/\r?\n/)) {
    const heading = /^##\s+(.+?)\s*$/.exec(line);

    if (heading) {
      commit();
      sceneId = heading[1].trim();
      lines = [];
      continue;
    }

    if (sceneId !== null) {
      lines.push(line);
    }
  }

  commit();

  if (entries.size === 0) {
    throw new Error(
      `Narration "${filePath}" contains no "## <scene-id>" headings.`,
    );
  }

  return entries;
}
