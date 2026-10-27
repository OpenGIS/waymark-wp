// Audio assembly and process helpers for the video build.
//
// The narration track is not a concatenation: every scene WAV is delayed to its
// timeline start and mixed over one silent bed, so gaps between scenes stay
// silent and the result is exactly the video duration.
"use strict";

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const TOOL_DIRECTORIES = ["/usr/local/bin"];

/**
 * Resolve an executable, preferring the local ffmpeg install.
 *
 * @param {string} name
 * @returns {string}
 */
export function resolveTool(name) {
  for (const directory of TOOL_DIRECTORIES) {
    const candidate = path.join(directory, name);
    if (isExecutable(candidate)) {
      return candidate;
    }
  }

  for (const directory of (process.env.PATH ?? "").split(path.delimiter)) {
    if (!directory) {
      continue;
    }

    const candidate = path.join(directory, name);
    if (isExecutable(candidate)) {
      return candidate;
    }
  }

  throw new Error(
    `Missing required executable "${name}". Install ffmpeg and ffprobe and ` +
      `put them on PATH.`,
  );
}

/**
 * Run a tool, returning stdout and throwing a useful error on failure.
 *
 * @param {string} name
 * @param {string[]} args
 * @param {{ cwd?: string }} [options]
 * @returns {{ stdout: string, stderr: string }}
 */
export function runTool(name, args, options = {}) {
  const executable = resolveTool(name);
  const result = spawnSync(executable, args, {
    cwd: options.cwd,
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    const detail = (result.stderr ?? "").trim();
    throw new Error(
      `${name} failed (exit ${result.status})${detail ? `: ${detail}` : ""}`,
    );
  }

  return { stdout: result.stdout ?? "", stderr: result.stderr ?? "" };
}

/**
 * Assemble the narration bed.
 *
 * @param {{ timeline: object, videoDir: string, outputPath: string, duration: number }} options
 * @returns {{ path: string, duration: number }}
 */
export function assembleNarration({
  timeline,
  videoDir,
  outputPath,
  duration,
}) {
  const narrated = timeline.scenes.filter(
    (scene) =>
      typeof scene.narration === "string" && scene.narration.trim() !== "",
  );

  if (!narrated.length) {
    throw new Error("The timeline has no narrated scenes to assemble.");
  }

  const inputs = [
    "-f",
    "lavfi",
    "-t",
    String(duration),
    "-i",
    "anullsrc=channel_layout=mono:sample_rate=48000",
  ];

  const filters = [`[0:a]atrim=0:${duration},asetpts=PTS-STARTPTS[base]`];
  const mixLabels = ["[base]"];

  narrated.forEach((scene, index) => {
    if (!scene.audio) {
      throw new Error(`Scene "${scene.id}" has narration but no audio path.`);
    }

    const audioPath = path.isAbsolute(scene.audio)
      ? scene.audio
      : path.join(videoDir, scene.audio);

    if (!fs.existsSync(audioPath)) {
      throw new Error(
        `Scene "${scene.id}" is narrated but its WAV is missing: ${audioPath}`,
      );
    }

    const offset = Number.isFinite(scene.audioOffset) ? scene.audioOffset : 0;
    const startMs = Math.round((scene.start + offset) * 1000);
    const delayMs = Math.max(0, startMs);
    // A J-cut can place the speech before the timeline origin. `adelay` cannot
    // take a negative delay, so trim the part that falls before zero instead of
    // delaying the whole line and shifting it later.
    const trimMs = Math.max(0, -startMs);
    const trimFilter =
      trimMs > 0
        ? `atrim=start=${(trimMs / 1000).toFixed(3)},asetpts=PTS-STARTPTS,`
        : "";
    const label = `a${index + 1}`;

    inputs.push("-i", audioPath);
    filters.push(
      `[${index + 1}:a]` +
        "aresample=48000:async=1:first_pts=0," +
        "aformat=sample_fmts=fltp:channel_layouts=mono," +
        trimFilter +
        `adelay=${delayMs}:all=1,` +
        `atrim=0:${duration},asetpts=PTS-STARTPTS[${label}]`,
    );
    mixLabels.push(`[${label}]`);
  });

  filters.push(
    `${mixLabels.join("")}` +
      `amix=inputs=${mixLabels.length}:duration=first:dropout_transition=0:` +
      "normalize=0," +
      "aformat=sample_fmts=s16:sample_rates=48000:channel_layouts=mono[out]",
  );

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  runTool("ffmpeg", [
    "-hide_banner",
    "-loglevel",
    "error",
    "-y",
    ...inputs,
    "-filter_complex",
    filters.join(";"),
    "-map",
    "[out]",
    "-t",
    String(duration),
    "-c:a",
    "pcm_s16le",
    "-ar",
    "48000",
    "-ac",
    "1",
    outputPath,
  ]);

  const probed = probeAudio(outputPath);
  if (Math.abs(probed.duration - duration) > 0.05) {
    throw new Error(
      `Assembled narration is ${probed.duration.toFixed(3)}s, expected ` +
        `${duration.toFixed(3)}s.`,
    );
  }

  return { path: outputPath, duration: probed.duration };
}

/**
 * Read the format facts that matter for the narration bed.
 *
 * @param {string} filePath
 * @returns {{ duration: number, sampleRate: number, channels: number, codec: string }}
 */
export function probeAudio(filePath) {
  const { stdout } = runTool("ffprobe", [
    "-v",
    "error",
    "-select_streams",
    "a:0",
    "-show_entries",
    "stream=codec_name,sample_rate,channels:format=duration",
    "-of",
    "json",
    filePath,
  ]);

  const parsed = JSON.parse(stdout);
  const stream = parsed.streams?.[0];
  const duration = Number(parsed.format?.duration);

  if (!stream || !Number.isFinite(duration)) {
    throw new Error(`ffprobe could not read audio details from ${filePath}.`);
  }

  return {
    duration,
    sampleRate: Number(stream.sample_rate),
    channels: Number(stream.channels),
    codec: stream.codec_name,
  };
}

/**
 * @param {string} candidate
 * @returns {boolean}
 */
function isExecutable(candidate) {
  try {
    fs.accessSync(candidate, fs.constants.X_OK);
    return true;
  } catch {
    return false;
  }
}
