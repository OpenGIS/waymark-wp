#!/usr/bin/env node
// Build one delivery video from a raw take and its narration audio.
//
// Usage:
//   node scripts/video/build.mjs <scenario-id> [--no-encode] [--poster-at <time>]
//
// The timeline in work/timeline.json is authoritative for scene starts and
// ends. Narration WAVs are placed at those starts, the MP4 is encoded once,
// and the poster, captions, transcript and manifest are derived from the final
// file.
"use strict";

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

import { assembleNarration, runTool } from "./lib/audio.mjs";
import {
  buildCues,
  parseTimestamp,
  renderTranscript,
  renderVtt,
} from "./lib/vtt.mjs";
import {
  mergeManifest,
  probeMedia,
  sha256,
  toolchainVersions,
} from "./lib/manifest.mjs";

const VIDEO_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(VIDEO_DIR, "..", "..");
const WORK_DIR = path.join(VIDEO_DIR, "work");
const SCENARIO_DIR = path.join(VIDEO_DIR, "scenarios");
const DELIVERY_DIR = path.join(REPO_ROOT, "docs", "public", "assets", "video");
const POSTER_DIR = path.join(DELIVERY_DIR, "posters");
const CAPTION_DIR = path.join(DELIVERY_DIR, "captions");
const TRANSCRIPT_DIR = path.join(DELIVERY_DIR, "transcripts");
const MANIFEST_PATH = path.join(DELIVERY_DIR, "manifest.json");
const TIMELINE_PATH = path.join(WORK_DIR, "timeline.json");

function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    printUsage();
    return;
  }

  const scenarioPath = resolveScenarioPath(options.scenario);
  const scenario = readJSON(scenarioPath, "scenario");
  const id = requireString(scenario.id, "scenario.id");

  const timeline = readJSON(TIMELINE_PATH, "timeline");
  if (timeline.id !== id) {
    throw new Error(
      `The timeline belongs to "${timeline.id}", not "${id}". ` +
        `Re-record or point the build at the matching scenario.`,
    );
  }

  assertSceneOrder(scenario, timeline);

  const timingsPath = path.join(WORK_DIR, "audio", id, "timings.json");
  const timings = options.noEncode
    ? readOptionalJSON(timingsPath)
    : readJSON(timingsPath, "timings");

  if (timings) {
    if (timings.id !== undefined && timings.id !== id) {
      throw new Error(
        `The timings file belongs to "${timings.id}", not "${id}".`,
      );
    }
    validateInputs({ scenario, timeline, timings });
  } else if (!options.noEncode) {
    throw new Error(`No timings file found at ${timingsPath}.`);
  }

  const duration = timelineDuration(timeline);
  const title = requireString(scenario.title ?? id, "scenario.title");

  const outputPath = scenario.output
    ? path.resolve(REPO_ROOT, scenario.output)
    : path.join(DELIVERY_DIR, `${id}.mp4`);
  const posterPath = path.join(POSTER_DIR, `${id}.jpg`);
  const captionsPath = path.join(CAPTION_DIR, `${id}.en.vtt`);
  const transcriptPath = path.join(TRANSCRIPT_DIR, `${id}.md`);
  const narrationPath = path.join(WORK_DIR, "build", id, "narration.wav");

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  if (options.noEncode) {
    if (!fs.existsSync(outputPath)) {
      throw new Error(`--no-encode needs an existing MP4 at ${outputPath}.`);
    }
  } else {
    const rawPath = resolveRawPath(timeline, id);
    const sourceOffset = resolveSourceOffset(timeline);
    const sourceDuration = Math.max(
      0,
      sourceVideoDuration(rawPath, timeline) - sourceOffset,
    );

    const narration = assembleNarration({
      timeline,
      videoDir: VIDEO_DIR,
      outputPath: narrationPath,
      duration,
    });

    encodeVideo({
      rawPath,
      narrationPath: narration.path,
      outputPath,
      duration,
      sourceDuration,
      sourceOffset,
      title,
    });
  }

  const media = probeMedia(outputPath);
  if (Math.abs(media.duration - duration) > 0.2) {
    throw new Error(
      `The encoded MP4 is ${media.duration.toFixed(3)}s, but the timeline ` +
        `totals ${duration.toFixed(3)}s. The difference is over 0.2s.`,
    );
  }

  const posterAt = resolvePosterAt(timeline, scenario, options.posterAt);
  if (posterAt >= media.duration) {
    throw new Error(
      `The poster time (${posterAt.toFixed(3)}s) is outside the video ` +
        `(${media.duration.toFixed(3)}s).`,
    );
  }

  extractPoster(outputPath, posterPath, posterAt);

  const cues = buildCues(timeline, scenario);
  fs.mkdirSync(CAPTION_DIR, { recursive: true });
  fs.writeFileSync(captionsPath, renderVtt(cues), "utf8");

  fs.mkdirSync(TRANSCRIPT_DIR, { recursive: true });
  fs.writeFileSync(transcriptPath, renderTranscript({ title, cues }), "utf8");

  const versions = toolchainVersions();
  const entry = {
    id,
    title,
    scenarioVersion:
      scenario.version ?? shortHash(fs.readFileSync(scenarioPath)),
    playwright: versions.playwright,
    chromium: versions.chromium,
    file: assetPath(outputPath),
    duration: roundSeconds(media.duration),
    width: media.width,
    height: media.height,
    videoCodec: media.videoCodec,
    audioCodec: media.audioCodec,
    size: media.size,
    sha256: sha256(outputPath),
    poster: assetPath(posterPath),
    captions: assetPath(captionsPath),
    transcript: assetPath(transcriptPath),
    narrationProvider: timings?.provider ?? null,
    narrationVoice: timings?.voice ?? null,
    narrationRate: timings?.rate ?? null,
    generatedAt: new Date().toISOString(),
  };

  mergeManifest(MANIFEST_PATH, id, entry);

  printSummary({
    id,
    outputPath,
    posterPath,
    captionsPath,
    transcriptPath,
    duration: media.duration,
    size: media.size,
    posterAt,
    cueCount: cues.length,
    encoded: !options.noEncode,
    narrationPath: options.noEncode ? null : narrationPath,
  });
}

/**
 * Parse the CLI arguments and reject anything unrecognised.
 *
 * @param {string[]} argv
 * @returns {{ scenario: string | null, noEncode: boolean, posterAt: number | null, help: boolean }}
 */
function parseArgs(argv) {
  const options = {
    scenario: null,
    noEncode: false,
    posterAt: null,
    help: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];

    if (argument === "--help" || argument === "-h") {
      options.help = true;
      continue;
    }

    if (argument === "--no-encode") {
      options.noEncode = true;
      continue;
    }

    if (argument === "--poster-at") {
      const value = argv[index + 1];
      if (value === undefined || value.startsWith("-")) {
        throw new Error('Option "--poster-at" requires a timestamp.');
      }
      index += 1;

      const seconds = parseTimestamp(value);
      if (seconds === null) {
        throw new Error(
          `"--poster-at" must be seconds or HH:MM:SS, got "${value}".`,
        );
      }
      options.posterAt = seconds;
      continue;
    }

    if (argument.startsWith("-")) {
      throw new Error(`Unknown option "${argument}".`);
    }

    if (options.scenario !== null) {
      throw new Error(`Unexpected argument "${argument}".`);
    }

    options.scenario = argument;
  }

  if (!options.help && options.scenario === null) {
    throw new Error("A scenario id is required.");
  }

  return options;
}

/**
 * Accept either a scenario id or a path to its JSON file.
 *
 * @param {string} value
 * @returns {string}
 */
function resolveScenarioPath(value) {
  const candidate = value.endsWith(".json")
    ? path.resolve(process.cwd(), value)
    : path.join(SCENARIO_DIR, `${value}.json`);

  if (!fs.existsSync(candidate)) {
    throw new Error(`Scenario not found: ${candidate}`);
  }

  return candidate;
}

/**
 * The timeline and scenario must describe the same scenes in the same order.
 *
 * @param {object} scenario
 * @param {object} timeline
 */
function assertSceneOrder(scenario, timeline) {
  if (!Array.isArray(scenario.scenes) || !scenario.scenes.length) {
    throw new Error('The scenario has no "scenes" array.');
  }

  if (!Array.isArray(timeline.scenes) || !timeline.scenes.length) {
    throw new Error('The timeline has no "scenes" array.');
  }

  const scenarioIds = scenario.scenes.map((scene) => scene.id);
  const timelineIds = timeline.scenes.map((scene) => scene.id);

  if (scenarioIds.length !== timelineIds.length) {
    throw new Error(
      `The scenario has ${scenarioIds.length} scenes but the timeline has ` +
        `${timelineIds.length}.`,
    );
  }

  for (let index = 0; index < scenarioIds.length; index += 1) {
    if (scenarioIds[index] !== timelineIds[index]) {
      throw new Error(
        `Scene order differs at position ${index + 1}: scenario has ` +
          `"${scenarioIds[index]}", timeline has "${timelineIds[index]}".`,
      );
    }
  }
}

/**
 * Validate that narration and audio agree in both directions.
 *
 * @param {{ scenario: object, timeline: object, timings: object }} options
 */
function validateInputs({ scenario, timeline, timings }) {
  if (!Array.isArray(timings.scenes)) {
    throw new Error('The timings file has no "scenes" array.');
  }

  if (!timings.scenes.length) {
    throw new Error("The timings file has no scene entries.");
  }

  const narrated = timeline.scenes.filter(
    (scene) =>
      typeof scene.narration === "string" && scene.narration.trim() !== "",
  );
  const narratedIds = narrated.map((scene) => scene.id);
  const narratedSet = new Set(narratedIds);

  if (narratedSet.size !== narratedIds.length) {
    throw new Error("The timeline repeats a narrated scene id.");
  }

  const timingIds = timings.scenes.map((scene) => scene.id);
  const timingSet = new Set(timingIds);

  if (timingSet.size !== timingIds.length) {
    throw new Error(`"${timings.id ?? "timings"}" repeats a scene id.`);
  }

  const missing = narratedIds.filter((id) => !timingSet.has(id));
  const unused = timingIds.filter((id) => !narratedSet.has(id));

  if (missing.length || unused.length) {
    const details = [];
    if (missing.length) {
      details.push(`no audio for narrated scene(s): ${missing.join(", ")}`);
    }
    if (unused.length) {
      details.push(`audio without a narrated scene: ${unused.join(", ")}`);
    }
    throw new Error(`Narration and timeline disagree: ${details.join("; ")}.`);
  }

  const timingById = new Map(timings.scenes.map((scene) => [scene.id, scene]));
  const expectedFiles = new Set();

  for (const scene of narrated) {
    const timing = timingById.get(scene.id);
    if (!timing || typeof timing.file !== "string") {
      throw new Error(`Scene "${scene.id}" has no audio file in timings.`);
    }

    if (typeof scene.audio !== "string" || scene.audio.trim() === "") {
      throw new Error(
        `Scene "${scene.id}" is narrated but has no audio path in the timeline.`,
      );
    }

    const timelineFile = path.resolve(VIDEO_DIR, scene.audio);
    const timingFile = path.resolve(VIDEO_DIR, timing.file);

    if (timelineFile !== timingFile) {
      throw new Error(
        `Scene "${scene.id}" points at ${timelineFile} in the timeline but ` +
          `${timingFile} in timings.json.`,
      );
    }

    if (!fs.existsSync(timelineFile)) {
      throw new Error(`Missing narration WAV: ${timelineFile}`);
    }

    if ((timing.text ?? "").trim() !== scene.narration.trim()) {
      throw new Error(
        `Scene "${scene.id}" narration differs between the timeline and ` +
          `timings.json.`,
      );
    }

    expectedFiles.add(path.basename(timelineFile));
  }

  const audioDir = path.dirname(
    path.resolve(VIDEO_DIR, timings.scenes[0].file),
  );
  const stray = fs
    .readdirSync(audioDir)
    .filter((name) => name.endsWith(".wav"))
    .filter((name) => !expectedFiles.has(name));

  if (stray.length) {
    throw new Error(
      `Unaccounted narration WAV(s) in ${audioDir}: ${stray.join(", ")}. ` +
        `Remove them or add the scenes to the timeline.`,
    );
  }

  const scenarioIds = new Set(scenario.scenes.map((scene) => scene.id));
  for (const scene of timeline.scenes) {
    if (!scenarioIds.has(scene.id)) {
      throw new Error(`The scenario has no scene "${scene.id}".`);
    }
  }
}

/**
 * The timeline total is the last scene end.
 *
 * @param {object} timeline
 * @returns {number}
 */
function timelineDuration(timeline) {
  let total = 0;

  for (const scene of timeline.scenes) {
    if (!Number.isFinite(scene.start) || !Number.isFinite(scene.end)) {
      throw new Error(`Scene "${scene.id}" has no numeric start and end.`);
    }
    if (scene.end <= scene.start) {
      throw new Error(`Scene "${scene.id}" ends before it starts.`);
    }
    total = Math.max(total, scene.end);
  }

  return roundSeconds(total);
}

/**
 * Resolve the raw take recorded in the timeline.
 *
 * @param {object} timeline
 * @param {string} id
 * @returns {string}
 */
function resolveRawPath(timeline, id) {
  const relative = timeline.video?.path ?? `work/raw/${id}.webm`;
  const rawPath = path.resolve(VIDEO_DIR, relative);

  if (!fs.existsSync(rawPath)) {
    throw new Error(`Raw take not found: ${rawPath}`);
  }

  return rawPath;
}

/**
 * @param {string} rawPath
 * @param {object} timeline
 * @returns {number}
 */
function sourceVideoDuration(rawPath, timeline) {
  if (Number.isFinite(timeline.video?.duration)) {
    return timeline.video.duration;
  }

  return probeMedia(rawPath).duration;
}

/**
 * The recorded page is pre-warmed before the timeline origin, so the raw take
 * starts on the blank page and a short navigation. The build skips that prefix.
 *
 * @param {object} timeline
 * @returns {number}
 */
function resolveSourceOffset(timeline) {
  return Number.isFinite(timeline.video?.offset) && timeline.video.offset > 0
    ? timeline.video.offset
    : 0;
}

/**
 * Encode the delivery MP4 in one pass. The source video is cloned at the end by
 * at most the difference between the raw take and the timeline total.
 *
 * @param {{ rawPath: string, narrationPath: string, outputPath: string, duration: number, sourceDuration: number, sourceOffset: number, title: string }} options
 */
function encodeVideo({
  rawPath,
  narrationPath,
  outputPath,
  duration,
  sourceDuration,
  sourceOffset,
  title,
}) {
  const pad = Math.max(0, duration - sourceDuration);
  const filters = [
    "scale=1280:720:flags=lanczos",
    "setsar=1",
    "fps=30",
    "format=yuv420p",
  ];

  if (pad > 0.001) {
    filters.push(`tpad=stop_mode=clone:stop_duration=${pad.toFixed(3)}`);
  }

  const audioEncoder = selectAacEncoder();
  const audioOptions =
    audioEncoder === "aac_at"
      ? ["-aac_at_mode", "cbr"]
      : ["-aac_coder", "twoloop"];

  const inputArguments = [];

  if (sourceOffset > 0.001) {
    inputArguments.push("-ss", sourceOffset.toFixed(3));
  }

  inputArguments.push("-i", rawPath, "-i", narrationPath);

  runTool("ffmpeg", [
    "-hide_banner",
    "-loglevel",
    "error",
    "-y",
    ...inputArguments,
    "-map",
    "0:v:0",
    "-map",
    "1:a:0",
    "-vf",
    filters.join(","),
    "-c:v",
    "libx264",
    "-profile:v",
    "high",
    "-pix_fmt",
    "yuv420p",
    "-crf",
    "21",
    "-preset",
    "slow",
    "-c:a",
    audioEncoder,
    ...audioOptions,
    "-b:a",
    "128k",
    "-ar",
    "48000",
    "-ac",
    "2",
    "-t",
    String(duration),
    "-movflags",
    "+faststart",
    "-map_metadata",
    "-1",
    "-metadata",
    `title=${title}`,
    outputPath,
  ]);
}

/**
 * Prefer the platform AAC encoder when it is present. The native encoder drops
 * below the requested bitrate on sparse speech, so a measured 128 kbps stream
 * needs AudioToolbox on macOS. The native encoder remains the fallback.
 *
 * @returns {string}
 */
function selectAacEncoder() {
  const { stdout } = runTool("ffmpeg", ["-hide_banner", "-encoders"]);
  return /\baac_at\b/.test(stdout) ? "aac_at" : "aac";
}

/**
 * Prefer the timeline marker, then the scenario marker, then an override.
 * The override wins because it is explicit.
 *
 * @param {object} timeline
 * @param {object} scenario
 * @param {number | null} override
 * @returns {number}
 */
function resolvePosterAt(timeline, scenario, override) {
  if (override !== null) {
    return override;
  }

  const fromTimeline = Number.isFinite(timeline.posterAt)
    ? timeline.posterAt
    : null;
  const fromScenario = parseTimestamp(scenario.posterAt);
  const posterAt = fromTimeline ?? fromScenario;

  if (posterAt === null) {
    throw new Error(
      "No poster marker in the timeline or scenario. Pass --poster-at <time>.",
    );
  }

  return posterAt;
}

/**
 * Extract a JPEG from the final MP4, not the raw take.
 *
 * @param {string} inputPath
 * @param {string} outputPath
 * @param {number} at
 */
function extractPoster(inputPath, outputPath, at) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  runTool("ffmpeg", [
    "-hide_banner",
    "-loglevel",
    "error",
    "-y",
    "-i",
    inputPath,
    "-ss",
    at.toFixed(3),
    "-frames:v",
    "1",
    "-vf",
    "scale=1280:720:flags=lanczos",
    "-q:v",
    "2",
    outputPath,
  ]);
}

/**
 * @param {object} summary
 */
function printSummary(summary) {
  const bitrate = (summary.size * 8) / summary.duration;

  console.log("");
  console.log(`[video] Built ${summary.id}`);
  if (summary.narrationPath) {
    console.log(`[video]   narration   ${displayPath(summary.narrationPath)}`);
  } else {
    console.log("[video]   encode      reused the existing MP4");
  }
  console.log(`[video]   video       ${displayPath(summary.outputPath)}`);
  console.log(
    `[video]   poster      ${displayPath(summary.posterPath)} ` +
      `(${summary.posterAt.toFixed(3)}s)`,
  );
  console.log(
    `[video]   captions    ${displayPath(summary.captionsPath)} ` +
      `(${summary.cueCount} cue(s))`,
  );
  console.log(`[video]   transcript  ${displayPath(summary.transcriptPath)}`);
  console.log(`[video]   manifest    ${displayPath(MANIFEST_PATH)}`);
  console.log(`[video]   duration    ${summary.duration.toFixed(3)}s`);
  console.log(`[video]   size        ${formatBytes(summary.size)}`);
  console.log(`[video]   bitrate     ${formatBitrate(bitrate)}`);
  console.log(
    `[video]   encoded     ${summary.encoded ? "yes" : "no (--no-encode)"}`,
  );
}

/**
 * @param {string} value
 * @param {string} label
 * @returns {string}
 */
function requireString(value, label) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Missing or empty "${label}".`);
  }
  return value.trim();
}

/**
 * @param {string} filePath
 * @param {string} label
 * @returns {object}
 */
function readJSON(filePath, label) {
  let source;
  try {
    source = fs.readFileSync(filePath, "utf8");
  } catch {
    throw new Error(`Cannot read the ${label} at ${filePath}.`);
  }

  try {
    return JSON.parse(source);
  } catch (error) {
    throw new Error(
      `The ${label} at ${filePath} is not valid JSON: ${error.message}`,
    );
  }
}

/**
 * @param {string} filePath
 * @returns {object | null}
 */
function readOptionalJSON(filePath) {
  return fs.existsSync(filePath) ? readJSON(filePath, "timings") : null;
}

/**
 * @param {Buffer} buffer
 * @returns {string}
 */
function shortHash(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex").slice(0, 12);
}

/**
 * @param {string} filePath
 * @returns {string}
 */
function assetPath(filePath) {
  const publicDir = path.join(REPO_ROOT, "docs", "public");
  const relative = path.relative(publicDir, filePath).split(path.sep).join("/");

  return `/${relative}`;
}

/**
 * @param {string} filePath
 * @returns {string}
 */
function displayPath(filePath) {
  return path.relative(REPO_ROOT, filePath).split(path.sep).join("/");
}

/**
 * @param {number} value
 * @returns {number}
 */
function roundSeconds(value) {
  return Math.round(value * 1000) / 1000;
}

/**
 * @param {number} bytes
 * @returns {string}
 */
function formatBytes(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

/**
 * @param {number} bitsPerSecond
 * @returns {string}
 */
function formatBitrate(bitsPerSecond) {
  return `${(bitsPerSecond / 1_000_000).toFixed(2)} Mb/s`;
}

function printUsage() {
  console.log(
    [
      "Usage:",
      "  node scripts/video/build.mjs <scenario-id> [options]",
      "",
      "Options:",
      "  --no-encode          reuse the existing MP4 and rebuild the sidecars",
      "  --poster-at <time>   poster timestamp in seconds or HH:MM:SS",
      "",
      "Reads work/timeline.json and work/audio/<id>/timings.json. Writes the",
      "MP4, poster, WebVTT captions, Markdown transcript and manifest.",
    ].join("\n"),
  );
}

try {
  main();
} catch (error) {
  console.error(`[video] ${error.stack ?? error.message}`);
  process.exitCode = 1;
}
