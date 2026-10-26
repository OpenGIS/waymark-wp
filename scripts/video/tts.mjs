#!/usr/bin/env node
// Synthesise per-scene narration audio with the macOS say provider.
//
// Usage:
//   node scripts/video/tts.mjs <scenario-id>
//     [--voice <name>] [--rate <wpm>] [--scene <scene-id>] [--force]
//
// Each narrated scene is written twice: a raw `.aiff` take and a normalised
// 48 kHz mono 16-bit PCM `.wav`. Durations land in `timings.json` beside them,
// and the recorder uses that file to drive scene holds.
"use strict";

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { loadNarration } from "./lib/narration.mjs";

const VIDEO_DIR = path.dirname(fileURLToPath(import.meta.url));
const WORK_DIR = path.join(VIDEO_DIR, "work");
const SCENARIO_DIR = path.join(VIDEO_DIR, "scenarios");
const PROVIDER = "macos-say";
const DEFAULT_VOICE = "Daniel";
const DEFAULT_RATE = 175;
const REQUIRED_TOOLS = ["say", "afconvert", "ffmpeg", "ffprobe"];

function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    printUsage();
    return;
  }

  assertTools();

  const scenarioPath = path.join(SCENARIO_DIR, `${options.scenarioId}.json`);
  if (!fs.existsSync(scenarioPath)) {
    throw new Error(`Scenario not found: ${scenarioPath}`);
  }

  const scenario = JSON.parse(fs.readFileSync(scenarioPath, "utf8"));
  if (
    !scenario ||
    typeof scenario !== "object" ||
    !Array.isArray(scenario.scenes)
  ) {
    throw new Error(`Scenario "${scenarioPath}" has no "scenes" array.`);
  }

  const narrationPath = loadNarration(scenario);
  if (!narrationPath) {
    throw new Error(
      `No narration file found for scenario "${options.scenarioId}". ` +
        `Expected scripts/video/narration/${options.scenarioId}.md.`,
    );
  }

  console.log(
    `[video] Narration: ${path.relative(process.cwd(), narrationPath)}`,
  );

  const voice = options.voice ?? DEFAULT_VOICE;
  const rate = options.rate ?? DEFAULT_RATE;

  const voices = listVoices();
  if (!voices.includes(voice)) {
    throw new Error(
      `Voice "${voice}" is not installed. Available voices: ${voices.join(", ")}`,
    );
  }

  const narrated = scenario.scenes.filter(
    (scene) => typeof scene.narration === "string" && scene.narration.trim(),
  );

  if (!narrated.length) {
    throw new Error(
      `Narration "${narrationPath}" has no narrated scenes to synthesise.`,
    );
  }

  if (options.scene !== null) {
    const match = narrated.find((scene) => scene.id === options.scene);
    if (!match) {
      throw new Error(
        `Scene "${options.scene}" has no narration in "${narrationPath}".`,
      );
    }
  }

  const audioDir = path.join(WORK_DIR, "audio", scenario.id);
  const timingsPath = path.join(audioDir, "timings.json");
  fs.mkdirSync(audioDir, { recursive: true });

  const previous = readTimings(timingsPath);
  const previousById = new Map(
    (previous?.scenes ?? []).map((entry) => [entry.id, entry]),
  );

  const generated = new Map();
  const rows = [];

  for (const scene of narrated) {
    const isSelected = options.scene === null || options.scene === scene.id;
    const wavPath = path.join(audioDir, `${scene.id}.wav`);
    const relativeFile = path
      .relative(VIDEO_DIR, wavPath)
      .split(path.sep)
      .join("/");
    const hash = hashNarration(scene.narration, voice, rate);
    const cached = previousById.get(scene.id);

    if (!isSelected) {
      if (cached) {
        generated.set(scene.id, { ...cached, text: scene.narration });
      }
      continue;
    }

    const canReuse =
      !options.force &&
      options.scene === null &&
      cached?.hash === hash &&
      fs.existsSync(wavPath);

    if (canReuse) {
      const duration = Number.isFinite(cached.duration)
        ? cached.duration
        : probeDuration(wavPath);

      generated.set(scene.id, {
        ...cached,
        text: scene.narration,
        file: relativeFile,
        duration,
        hash,
      });
      rows.push({ id: scene.id, duration, cached: true });
      continue;
    }

    const result = synthesise({
      text: scene.narration,
      voice,
      rate,
      out: wavPath,
    });

    generated.set(scene.id, {
      id: scene.id,
      text: scene.narration,
      file: relativeFile,
      duration: result.duration,
      hash,
    });
    rows.push({ id: scene.id, duration: result.duration, cached: false });
  }

  const scenes = narrated
    .map((scene) => generated.get(scene.id))
    .filter(Boolean);

  const timings = {
    id: scenario.id,
    provider: PROVIDER,
    voice,
    rate,
    generatedAt: new Date().toISOString(),
    scenes,
  };

  fs.writeFileSync(
    timingsPath,
    `${JSON.stringify(timings, null, 2)}\n`,
    "utf8",
  );

  printTable(rows);
  console.log(`[video] Timings: ${path.relative(process.cwd(), timingsPath)}`);
}

/**
 * Parse the CLI arguments.
 *
 * @param {string[]} argv
 * @returns {{ scenarioId: string | null, voice: string | null, rate: number | null, scene: string | null, force: boolean, help: boolean }}
 */
function parseArgs(argv) {
  const options = {
    scenarioId: null,
    voice: null,
    rate: null,
    scene: null,
    force: false,
    help: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];

    if (argument === "--help" || argument === "-h") {
      options.help = true;
      continue;
    }

    if (argument === "--force") {
      options.force = true;
      continue;
    }

    if (
      argument === "--voice" ||
      argument === "--rate" ||
      argument === "--scene"
    ) {
      const value = argv[index + 1];
      if (value === undefined || value.startsWith("--")) {
        throw new Error(`Option "${argument}" requires a value.`);
      }
      index += 1;

      if (argument === "--voice") {
        options.voice = value;
      } else if (argument === "--rate") {
        const rate = Number(value);
        if (!Number.isFinite(rate) || rate <= 0) {
          throw new Error(
            `"--rate" must be a positive number, got "${value}".`,
          );
        }
        options.rate = rate;
      } else {
        options.scene = value;
      }
      continue;
    }

    if (argument.startsWith("-")) {
      throw new Error(`Unknown option "${argument}".`);
    }

    if (options.scenarioId !== null) {
      throw new Error(`Unexpected argument "${argument}".`);
    }

    options.scenarioId = argument;
  }

  if (!options.help && options.scenarioId === null) {
    throw new Error("A scenario id is required.");
  }

  return options;
}

/**
 * Synthesise one narration line, returning the normalised WAV and its duration.
 * The raw provider take is kept beside it with an `.aiff` extension.
 *
 * @param {{ text: string, voice: string, rate: number, out: string }} options
 * @returns {{ file: string, duration: number }}
 */
export function synthesise({ text, voice, rate, out }) {
  if (typeof text !== "string" || text.trim() === "") {
    throw new Error("synthesise() requires non-empty text.");
  }

  const parsed = path.parse(out);
  const aiffPath = path.join(parsed.dir, `${parsed.name}.aiff`);
  const sourcePath = path.join(parsed.dir, `${parsed.name}.source.wav`);

  fs.mkdirSync(parsed.dir, { recursive: true });

  run("say", ["-v", voice, "-r", String(rate), "-o", aiffPath, "--", text]);
  run("afconvert", [
    "-f",
    "WAVE",
    "-d",
    "LEI16@48000",
    "-c",
    "1",
    aiffPath,
    sourcePath,
  ]);

  try {
    run("ffmpeg", [
      "-hide_banner",
      "-loglevel",
      "error",
      "-y",
      "-i",
      sourcePath,
      "-af",
      "loudnorm=I=-16:TP=-1.5:LRA=11",
      "-ar",
      "48000",
      "-ac",
      "1",
      "-c:a",
      "pcm_s16le",
      out,
    ]);
  } finally {
    fs.rmSync(sourcePath, { force: true });
  }

  return { file: out, duration: probeDuration(out) };
}

/**
 * @param {string} text
 * @param {string} voice
 * @param {number} rate
 * @returns {string}
 */
function hashNarration(text, voice, rate) {
  return crypto
    .createHash("sha256")
    .update(`${text}\n${voice}\n${rate}`)
    .digest("hex");
}

/**
 * Read an existing timings file, tolerating its absence.
 *
 * @param {string} filePath
 * @returns {object | null}
 */
function readTimings(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));
    return parsed && Array.isArray(parsed.scenes) ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Ensure every executable this provider needs is available.
 */
function assertTools() {
  const missing = REQUIRED_TOOLS.filter((name) => !resolveExecutable(name));

  if (missing.length) {
    throw new Error(
      `Missing required executable(s): ${missing.join(", ")}. The macOS say ` +
        `provider needs say, afconvert, ffmpeg and ffprobe on PATH.`,
    );
  }
}

/**
 * List the installed say voices.
 *
 * @returns {string[]}
 */
function listVoices() {
  const output = run("say", ["-v", "?"]);

  return output
    .split(/\r?\n/)
    .map((line) => /^(.+?)\s+[a-z]{2}[_-][A-Za-z0-9]+\s+#/.exec(line))
    .filter(Boolean)
    .map((match) => match[1].trim());
}

/**
 * Measure a media file in seconds.
 *
 * @param {string} filePath
 * @returns {number}
 */
function probeDuration(filePath) {
  const output = run("ffprobe", [
    "-v",
    "error",
    "-show_entries",
    "format=duration",
    "-of",
    "default=noprint_wrappers=1:nokey=1",
    filePath,
  ]).trim();
  const duration = Number(output);

  if (!Number.isFinite(duration) || duration <= 0) {
    throw new Error(`ffprobe could not read a duration from ${filePath}.`);
  }

  return Math.round(duration * 1000) / 1000;
}

/**
 * Run a command and return its stdout, failing with the command's stderr.
 *
 * @param {string} command
 * @param {string[]} args
 * @returns {string}
 */
function run(command, args) {
  const executable = resolveExecutable(command);
  if (!executable) {
    throw new Error(`Missing required executable: ${command}.`);
  }

  const result = spawnSync(executable, args, { encoding: "utf8" });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    const detail = (result.stderr ?? "").trim();
    throw new Error(
      `${command} failed (exit ${result.status})${detail ? `: ${detail}` : ""}`,
    );
  }

  return result.stdout ?? "";
}

/**
 * Find an executable on PATH.
 *
 * @param {string} name
 * @returns {string | null}
 */
function resolveExecutable(name) {
  for (const directory of (process.env.PATH ?? "").split(path.delimiter)) {
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
 * @param {Array<{ id: string, duration: number, cached: boolean }>} rows
 */
function printTable(rows) {
  let total = 0;

  console.log("\n[video] Scene durations");
  for (const row of rows) {
    total += row.duration;
    const suffix = row.cached ? " (cached)" : "";
    console.log(
      `[video]   ${row.id.padEnd(18)} ${row.duration.toFixed(3)}s${suffix}`,
    );
  }

  console.log(
    `[video]   ${"total".padEnd(18)} ${total.toFixed(3)}s (${rows.length} scene(s))`,
  );
}

function printUsage() {
  console.log(
    [
      "Usage:",
      "  node scripts/video/tts.mjs <scenario-id> [options]",
      "",
      "Options:",
      `  --voice <name>     say voice (default: ${DEFAULT_VOICE})`,
      `  --rate <wpm>       speaking rate in words per minute (default: ${DEFAULT_RATE})`,
      "  --scene <id>       process one scene only",
      "  --force            ignore the cache and regenerate",
      "",
      "Audio is written to scripts/video/work/audio/<id>/ with a timings.json",
      "file beside it. Run from the repository root.",
    ].join("\n"),
  );
}

try {
  main();
} catch (error) {
  console.error(`[video] ${error.stack ?? error.message}`);
  process.exitCode = 1;
}
