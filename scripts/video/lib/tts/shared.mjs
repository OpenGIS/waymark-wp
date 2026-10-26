// Shared helpers for the narration providers.
//
// A provider only needs to turn text into a WAV. Normalisation, duration
// probing and executable discovery live here so every provider produces the
// same 48 kHz mono 16-bit PCM output.
"use strict";

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const LOUDNORM_FILTER = "loudnorm=I=-16:TP=-1.5:LRA=11";

// Bumped whenever the post-processing chain changes, so cached takes made by
// an older chain are regenerated instead of silently reused.
export const POST_PROCESS_VERSION = 3;

const TRIM_LEAD_SECONDS = 0.03;
const TRIM_TAIL_SECONDS = 0.12;
const TRIM_SAMPLE_RATE = 48_000;
const TRIM_MAX_BUFFER = 64 * 1024 * 1024;
// Roughly −40.8 dBFS at 16-bit, the same audible boundary used to measure
// caption onsets. A quieter floor leaves slow sub-threshold ramps in place.
const TRIM_THRESHOLD_SAMPLE = 300;

/**
 * Find an executable on PATH.
 *
 * @param {string} name
 * @returns {string | null}
 */
export function resolveExecutable(name) {
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
 * Return the executables from `names` that are not on PATH.
 *
 * @param {string[]} names
 * @returns {string[]}
 */
export function missingExecutables(names) {
  return names.filter((name) => !resolveExecutable(name));
}

/**
 * Run a command and return its stdout, failing with the command's stderr.
 *
 * @param {string} command
 * @param {string[]} args
 * @returns {string}
 */
export function run(command, args) {
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
 * Measure a media file in seconds.
 *
 * @param {string} filePath
 * @returns {number}
 */
export function probeDuration(filePath) {
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
 * Decode a take to mono 48 kHz signed 16-bit PCM in memory so its audible
 * bounds can be measured from the samples themselves.
 *
 * @param {string} sourcePath
 * @returns {Buffer}
 */
function decodePcm(sourcePath) {
  const executable = resolveExecutable("ffmpeg");
  if (!executable) {
    throw new Error("Missing required executable: ffmpeg.");
  }

  const result = spawnSync(
    executable,
    [
      "-hide_banner",
      "-loglevel",
      "error",
      "-i",
      sourcePath,
      "-f",
      "s16le",
      "-acodec",
      "pcm_s16le",
      "-ar",
      String(TRIM_SAMPLE_RATE),
      "-ac",
      "1",
      "-",
    ],
    { maxBuffer: TRIM_MAX_BUFFER },
  );

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    const detail = (result.stderr ?? "").toString().trim();
    throw new Error(
      `ffmpeg could not decode ${sourcePath}${detail ? `: ${detail}` : ""}`,
    );
  }

  return result.stdout;
}

/**
 * Measure the leading and trailing silence of a take.
 *
 * The first and last samples above the silence threshold define the audible
 * speech. Returns null when the take is silent throughout, in which case the
 * caller leaves it untrimmed.
 *
 * @param {string} sourcePath
 * @returns {{ duration: number, lead: number, tail: number } | null}
 */
function measureAudibleBounds(sourcePath) {
  const pcm = decodePcm(sourcePath);
  const totalSamples = Math.floor(pcm.length / 2);
  let first = -1;
  let last = -1;

  for (let index = 0; index < totalSamples; index += 1) {
    if (Math.abs(pcm.readInt16LE(index * 2)) > TRIM_THRESHOLD_SAMPLE) {
      if (first === -1) {
        first = index;
      }
      last = index;
    }
  }

  if (first === -1) {
    return null;
  }

  return {
    duration: totalSamples / TRIM_SAMPLE_RATE,
    lead: first / TRIM_SAMPLE_RATE,
    tail: (totalSamples - 1 - last) / TRIM_SAMPLE_RATE,
  };
}

/**
 * Measure the audible speech in a take, excluding the lead and tail pads.
 * Returns zero when the file contains no sample above the silence threshold.
 *
 * @param {string} sourcePath
 * @returns {number}
 */
export function measureSpeechDuration(sourcePath) {
  const bounds = measureAudibleBounds(sourcePath);
  if (!bounds) {
    return 0;
  }

  return bounds.duration - bounds.lead - bounds.tail;
}

/**
 * Build the filter chain that trims the take to a short natural pad and then
 * normalises it. Silence beyond the targets is removed; when a take has less
 * than the target, the remainder is padded so every take opens and closes with
 * the same amount of quiet.
 *
 * @param {{ duration: number, lead: number, tail: number } | null} bounds
 * @returns {{ filter: string, trimmedLead: number, trimmedTail: number }}
 */
function buildTrimFilter(bounds) {
  if (!bounds) {
    return { filter: LOUDNORM_FILTER, trimmedLead: 0, trimmedTail: 0 };
  }

  const retainedLead = Math.min(bounds.lead, TRIM_LEAD_SECONDS);
  const retainedTail = Math.min(bounds.tail, TRIM_TAIL_SECONDS);
  const leadPad = TRIM_LEAD_SECONDS - retainedLead;
  const tailPad = TRIM_TAIL_SECONDS - retainedTail;

  const start = Math.max(0, bounds.lead - TRIM_LEAD_SECONDS);
  const end = Math.min(
    bounds.duration,
    bounds.duration - bounds.tail + TRIM_TAIL_SECONDS,
  );

  const filters = [
    `atrim=start=${start.toFixed(6)}:end=${end.toFixed(6)}`,
    "asetpts=PTS-STARTPTS",
  ];

  if (leadPad > 0.0005) {
    filters.push(`adelay=${(leadPad * 1000).toFixed(3)}:all=1`);
  }

  if (tailPad > 0.0005) {
    filters.push(`apad=pad_dur=${tailPad.toFixed(6)}`);
  }

  filters.push(LOUDNORM_FILTER);

  return {
    filter: filters.join(","),
    trimmedLead: bounds.lead - retainedLead,
    trimmedTail: bounds.tail - retainedTail,
  };
}

/**
 * Normalise a provider take to the delivery audio format, trimming variable
 * leading and trailing silence first so the recordings start and end
 * consistently.
 *
 * @param {string} sourcePath
 * @param {string} outPath
 * @param {{ verbose?: boolean, log?: (message: string) => void, sceneId?: string | null }} [options]
 */
export function normaliseWav(
  sourcePath,
  outPath,
  { verbose = false, log = () => {}, sceneId = null } = {},
) {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });

  const bounds = measureAudibleBounds(sourcePath);
  const { filter, trimmedLead, trimmedTail } = buildTrimFilter(bounds);

  if (verbose && bounds) {
    const label = sceneId ? ` ${sceneId}:` : "";
    log(
      `[video] TTS trim${label} −${trimmedLead.toFixed(3)}s lead, ` +
        `−${trimmedTail.toFixed(3)}s tail.`,
    );
  }

  run("ffmpeg", [
    "-hide_banner",
    "-loglevel",
    "error",
    "-y",
    "-i",
    sourcePath,
    "-af",
    filter,
    "-ar",
    "48000",
    "-ac",
    "1",
    "-c:a",
    "pcm_s16le",
    outPath,
  ]);
}

/**
 * Count characters by Unicode code point, so a multi-byte character counts
 * once rather than once per UTF-16 code unit.
 *
 * @param {string} text
 * @returns {number}
 */
export function characterCount(text) {
  return [...text].length;
}

/**
 * Collapse arbitrary text to a single readable line.
 *
 * @param {unknown} value
 * @returns {string}
 */
export function oneLine(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * True when a buffer starts with a RIFF/WAVE header pair.
 *
 * @param {Buffer} buffer
 * @returns {boolean}
 */
export function isRiffWave(buffer) {
  return (
    Buffer.isBuffer(buffer) &&
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WAVE"
  );
}
