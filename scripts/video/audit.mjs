#!/usr/bin/env node
// Repeatable quality audit for one delivered video.
//
// Usage:
//   node scripts/video/audit.mjs [id] [options]
//
// Measures the final MP4, not the timeline metadata: the audio is decoded to
// 48 kHz mono signed 16-bit and speech is detected per sample above a fixed
// level. Scene attribution comes from the per-id timeline windows, so the
// numbers are directly comparable between takes. Captions and the manifest are
// cross-checked, and a silencedetect pass provides an independent sanity check.
"use strict";

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { resolveTool, runTool } from "./lib/audio.mjs";
import { timelinePath } from "./lib/timeline.mjs";

const VIDEO_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(VIDEO_DIR, "..", "..");
const DELIVERY_DIR = path.join(REPO_ROOT, "docs", "public", "assets", "video");
const SCENARIO_DIR = path.join(VIDEO_DIR, "scenarios");
const DEFAULT_ID = "changing-basemaps";
const SAMPLE_RATE = 48_000;

const DEFAULT_THRESHOLDS = {
  speechLevel: 300,
  pauseThreshold: 0.3,
  gapMin: 0.8,
  gapMax: 1.5,
  gapSpread: 1.8,
  captionTolerance: 0.25,
  noSpeechMax: 25,
  articulationMin: 110,
  articulationMax: 210,
  silenceNoise: -40,
  silenceDuration: 0.45,
};

function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    printUsage();
    return;
  }

  const report = audit(options);

  if (options.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    printReport(report);
  }

  if (options.strict && report.warnings.length) {
    process.exitCode = 1;
  }
}

/**
 * Parse the CLI. Ids may appear before or after flags; flags that set a
 * threshold require a numeric value.
 *
 * @param {string[]} argv
 */
function parseArgs(argv) {
  const options = {
    id: DEFAULT_ID,
    idSet: false,
    json: false,
    strict: false,
    help: false,
    thresholds: { ...DEFAULT_THRESHOLDS },
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];

    if (argument === "--help" || argument === "-h") {
      options.help = true;
      continue;
    }

    if (argument === "--json") {
      options.json = true;
      continue;
    }

    if (argument === "--strict") {
      options.strict = true;
      continue;
    }

    const flag = THRESHOLD_FLAGS[argument];
    if (flag) {
      const value = argv[index + 1];
      if (value === undefined || value.startsWith("-")) {
        throw new Error(`Option "${argument}" requires a numeric value.`);
      }
      index += 1;
      options.thresholds[flag.key] = parseNumber(
        value,
        argument,
        flag.allowNegative,
      );
      continue;
    }

    if (argument.startsWith("-")) {
      throw new Error(`Unknown option "${argument}".`);
    }

    if (options.idSet) {
      throw new Error(`Unexpected argument "${argument}".`);
    }

    options.id = argument;
    options.idSet = true;
  }

  if (options.thresholds.articulationMin > options.thresholds.articulationMax) {
    throw new Error(
      '"--articulation-min" must not be greater than "--articulation-max".',
    );
  }

  if (options.thresholds.gapMin > options.thresholds.gapMax) {
    throw new Error('"--gap-min" must not be greater than "--gap-max".');
  }

  return options;
}

const THRESHOLD_FLAGS = {
  "--speech-level": { key: "speechLevel" },
  "--pause-threshold": { key: "pauseThreshold" },
  "--gap-min": { key: "gapMin" },
  "--gap-max": { key: "gapMax" },
  "--gap-spread": { key: "gapSpread" },
  "--caption-tolerance": { key: "captionTolerance" },
  "--no-speech-max": { key: "noSpeechMax" },
  "--articulation-min": { key: "articulationMin" },
  "--articulation-max": { key: "articulationMax" },
  "--silence-noise": { key: "silenceNoise", allowNegative: true },
  "--silence-duration": { key: "silenceDuration" },
};

/**
 * @param {string} value
 * @param {string} flag
 * @param {boolean} [allowNegative]
 * @returns {number}
 */
function parseNumber(value, flag, allowNegative = false) {
  const number = Number(value);

  if (!Number.isFinite(number) || (!allowNegative && number < 0)) {
    throw new Error(`Option "${flag}" must be a non-negative number.`);
  }

  return number;
}

/**
 * Build the complete audit report.
 *
 * @param {ReturnType<typeof parseArgs>} options
 */
function audit(options) {
  const { id, thresholds } = options;
  const inputs = {
    mp4: path.join(DELIVERY_DIR, `${id}.mp4`),
    captions: path.join(DELIVERY_DIR, "captions", `${id}.en.vtt`),
    transcript: path.join(DELIVERY_DIR, "transcripts", `${id}.md`),
    poster: path.join(DELIVERY_DIR, "posters", `${id}.jpg`),
    timeline: timelinePath(id),
    scenario: path.join(SCENARIO_DIR, `${id}.json`),
  };

  requireFile("MP4", inputs.mp4);
  requireFile("captions", inputs.captions);
  requireFile("transcript", inputs.transcript);
  requireFile("poster", inputs.poster);
  requireFile("timeline", inputs.timeline);

  const scenario = readOptionalJSON(inputs.scenario);
  const timeline = readJSON(inputs.timeline, "timeline");

  if (timeline.id !== id) {
    throw new Error(
      `Timeline ${displayPath(inputs.timeline)} belongs to ` +
        `"${timeline.id}", not "${id}".`,
    );
  }

  if (!Array.isArray(timeline.scenes) || timeline.scenes.length === 0) {
    throw new Error(`Timeline ${displayPath(inputs.timeline)} has no scenes.`);
  }

  const container = probeContainer(inputs.mp4);
  const { samples } = decodeAudio(inputs.mp4);
  const scenes = measureScenes(timeline.scenes, samples, thresholds);

  const measured = scenes.filter(
    (scene) => scene.speechOnset !== null && scene.speechOffset !== null,
  );

  if (measured.length === 0) {
    throw new Error(`No speech detected in ${displayPath(inputs.mp4)}.`);
  }

  const gaps = buildGaps(measured);
  const firstOnset = Math.min(...measured.map((scene) => scene.speechOnset));
  const lastOffset = Math.max(...measured.map((scene) => scene.speechOffset));
  const noSpeech = buildNoSpeech({
    duration: container.duration,
    firstOnset,
    lastOffset,
    gaps,
    scenes,
  });
  const cues = parseVtt(
    fs.readFileSync(inputs.captions, "utf8"),
    inputs.captions,
  );
  const sync = buildSync(cues, scenes);
  const silencedetect = detectSilences(inputs.mp4, container.duration, {
    noise: thresholds.silenceNoise,
    duration: thresholds.silenceDuration,
  });

  const warnings = buildWarnings({
    scenes,
    gaps,
    noSpeech,
    sync,
    thresholds,
  });

  return {
    id,
    title: scenario?.title ?? timeline.id,
    ok: true,
    strict: options.strict,
    inputs: Object.fromEntries(
      Object.entries(inputs).map(([key, value]) => [key, displayPath(value)]),
    ),
    thresholds,
    container,
    scenes,
    gaps,
    noSpeech,
    sync,
    silencedetect,
    warnings,
  };
}

/**
 * Probe the delivered container.
 *
 * @param {string} filePath
 */
function probeContainer(filePath) {
  const { stdout } = runTool("ffprobe", [
    "-v",
    "error",
    "-show_entries",
    "stream=codec_type,codec_name,profile,width,height,r_frame_rate," +
      "sample_rate,channels,bit_rate:format=duration,size,bit_rate",
    "-of",
    "json",
    filePath,
  ]);

  const parsed = JSON.parse(stdout);
  const streams = parsed.streams ?? [];
  const video = streams.find((stream) => stream.codec_type === "video");
  const audio = streams.find((stream) => stream.codec_type === "audio");
  const duration = Number(parsed.format?.duration);
  const size = Number(parsed.format?.size);
  const overallBitrate = Number(parsed.format?.bit_rate);

  if (!video || !audio) {
    throw new Error(
      `ffprobe found no ${video ? "audio" : "video"} stream in ` +
        `${displayPath(filePath)}.`,
    );
  }

  if (!Number.isFinite(duration) || !Number.isFinite(size)) {
    throw new Error(
      `ffprobe could not read the format of ${displayPath(filePath)}.`,
    );
  }

  return {
    duration: round(duration),
    bytes: size,
    overallBitrate: Number.isFinite(overallBitrate) ? overallBitrate : null,
    video: {
      codec: video.codec_name,
      profile: video.profile ?? null,
      width: Number(video.width),
      height: Number(video.height),
      fps: parseRate(video.r_frame_rate),
    },
    audio: {
      codec: audio.codec_name,
      profile: audio.profile ?? null,
      sampleRate: Number(audio.sample_rate),
      channels: Number(audio.channels),
      bitrate: Number.isFinite(Number(audio.bit_rate))
        ? Number(audio.bit_rate)
        : null,
    },
  };
}

/**
 * Decode the audio stream to 48 kHz mono signed 16-bit samples.
 *
 * @param {string} filePath
 */
function decodeAudio(filePath) {
  const result = spawnSync(
    resolveTool("ffmpeg"),
    [
      "-v",
      "error",
      "-i",
      filePath,
      "-map",
      "0:a:0",
      "-ac",
      "1",
      "-ar",
      String(SAMPLE_RATE),
      "-f",
      "s16le",
      "pipe:1",
    ],
    { maxBuffer: 512 * 1024 * 1024 },
  );

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    const detail = (result.stderr ?? "").toString().trim();
    throw new Error(
      `ffmpeg could not decode ${displayPath(filePath)}` +
        `${detail ? `: ${detail}` : ""}.`,
    );
  }

  const buffer = result.stdout;
  const samples = new Int16Array(
    buffer.buffer,
    buffer.byteOffset,
    buffer.byteLength / 2,
  );

  return { samples };
}

/**
 * Measure speech for every timeline scene. Narrated scenes are searched in
 * their timeline window; a negative audio offset extends the window backwards
 * so a J-cut keeps its own line. The next narrated scene's window bounds the
 * current one, so a forward J-cut cannot leak into the previous row.
 *
 * @param {Array<object>} timelineScenes
 * @param {Int16Array} samples
 * @param {Record<string, number>} thresholds
 */
function measureScenes(timelineScenes, samples, thresholds) {
  const working = timelineScenes.map((scene) => {
    const audioOffset = numeric(scene.audioOffset, 0);
    return {
      ...scene,
      audioOffset,
      narrated:
        typeof scene.narration === "string" &&
        scene.narration.trim() !== "" &&
        Number.isFinite(scene.audioDuration) &&
        scene.audioDuration > 0,
      searchStart: scene.start + Math.min(0, audioOffset),
    };
  });

  const narrated = working.filter((scene) => scene.narrated);

  return working.map((scene) => {
    const row = {
      id: scene.id,
      action: scene.action,
      start: round(scene.start),
      end: round(scene.end),
      actionEnd: numeric(scene.actionEnd),
      audioOffset: round(scene.audioOffset),
      jcut: numeric(scene.jcut, 0),
      audioDuration: numeric(scene.audioDuration),
      duration: round(scene.end - scene.start),
      narrated: scene.narrated,
      words: scene.narrated ? countWords(scene.narration) : null,
      speechOnset: null,
      speechOffset: null,
      postActionBeat: null,
      spanWpm: null,
      articulationWpm: null,
      internalPauseTotal: null,
    };

    if (!scene.narrated) {
      return row;
    }

    const position = narrated.indexOf(scene);
    const next = narrated[position + 1];
    const searchEnd =
      next && next.searchStart < scene.end ? next.searchStart : scene.end;
    const measured = measureSpeech(
      samples,
      scene.searchStart,
      searchEnd,
      thresholds,
    );

    if (measured) {
      row.speechOnset = round(measured.onset);
      row.speechOffset = round(measured.offset);
      row.internalPauseTotal = round(measured.pauseTotal);

      if (Number.isFinite(scene.actionEnd)) {
        row.postActionBeat = round(scene.audioOffset - scene.actionEnd);
      }

      const span = measured.offset - measured.onset;
      const articulation = span - measured.pauseTotal;

      if (span > 0) {
        row.spanWpm = round(row.words / (span / 60), 1);
      }

      if (articulation > 0) {
        row.articulationWpm = round(row.words / (articulation / 60), 1);
      }
    }

    return row;
  });
}

/**
 * Find the first and last sample above the speech level inside a window and
 * sum the internal pauses at or above the configured duration.
 *
 * @param {Int16Array} samples
 * @param {number} start
 * @param {number} end
 * @param {Record<string, number>} thresholds
 * @returns {{ onset: number, offset: number, pauseTotal: number } | null}
 */
function measureSpeech(samples, start, end, thresholds) {
  const from = Math.max(0, Math.floor(start * SAMPLE_RATE));
  const to = Math.min(samples.length, Math.ceil(end * SAMPLE_RATE));
  let first = null;
  let last = null;

  for (let index = from; index < to; index += 1) {
    if (Math.abs(samples[index]) > thresholds.speechLevel) {
      if (first === null) {
        first = index;
      }
      last = index + 1;
    }
  }

  if (first === null || last === null) {
    return null;
  }

  let pauseStart = null;
  let pauseTotal = 0;

  for (let index = first; index < last; index += 1) {
    const voiced = Math.abs(samples[index]) > thresholds.speechLevel;

    if (!voiced && pauseStart === null) {
      pauseStart = index;
    } else if (voiced && pauseStart !== null) {
      const pause = (index - pauseStart) / SAMPLE_RATE;
      if (pause >= thresholds.pauseThreshold) {
        pauseTotal += pause;
      }
      pauseStart = null;
    }
  }

  return {
    onset: first / SAMPLE_RATE,
    offset: last / SAMPLE_RATE,
    pauseTotal,
  };
}

/**
 * Gaps between consecutive narrated scenes: previous speech end to next
 * speech start.
 *
 * @param {Array<object>} measured
 */
function buildGaps(measured) {
  const items = [];

  for (let index = 1; index < measured.length; index += 1) {
    const previous = measured[index - 1];
    const scene = measured[index];
    items.push({
      from: previous.id,
      to: scene.id,
      fromOffset: previous.speechOffset,
      toOnset: scene.speechOnset,
      gap: round(scene.speechOnset - previous.speechOffset),
    });
  }

  const values = items.map((item) => item.gap);
  const min = values.length ? Math.min(...values) : null;
  const max = values.length ? Math.max(...values) : null;
  const sorted = [...values].sort((a, b) => a - b);
  let median = null;

  if (sorted.length) {
    const middle = Math.floor(sorted.length / 2);
    median =
      sorted.length % 2 === 0
        ? round((sorted[middle - 1] + sorted[middle]) / 2)
        : sorted[middle];
  }

  return {
    items,
    count: items.length,
    min: min === null ? null : round(min),
    max: max === null ? null : round(max),
    median,
    spread: min && max ? round(max / min) : null,
  };
}

/**
 * Split the silent part of the film into its three sources.
 *
 * @param {{ duration: number, firstOnset: number, lastOffset: number, gaps: object, scenes: Array<object> }} options
 */
function buildNoSpeech({ duration, firstOnset, lastOffset, gaps, scenes }) {
  const interLineGaps = round(
    gaps.items.reduce((total, item) => total + item.gap, 0),
  );
  const openingToFirstWord = round(firstOnset);
  const lastWordToEnd = round(duration - lastOffset);
  const total = round(openingToFirstWord + interLineGaps + lastWordToEnd);
  const finalCardScene = [...scenes]
    .reverse()
    .find((scene) => scene.action === "card");

  return {
    total,
    share: round((total / duration) * 100, 2),
    openingToFirstWord,
    interLineGaps,
    lastWordToEnd,
    finalCard: finalCardScene
      ? {
          sceneId: finalCardScene.id,
          start: finalCardScene.start,
          end: finalCardScene.end,
          duration: round(finalCardScene.end - finalCardScene.start),
          tailFromStart: round(duration - finalCardScene.start),
        }
      : null,
  };
}

/**
 * Compare each caption cue start with the measured onset of its scene.
 *
 * @param {Array<object>} cues
 * @param {Array<object>} scenes
 */
function buildSync(cues, scenes) {
  const byId = new Map(scenes.map((scene) => [scene.id, scene]));
  const items = cues.map((cue) => {
    const scene = cue.id ? byId.get(cue.id) : null;
    const onset = scene?.speechOnset ?? null;

    return {
      id: cue.id,
      start: round(cue.start),
      end: round(cue.end),
      onset,
      delta: onset === null ? null : round(cue.start - onset),
      silent: onset === null,
    };
  });

  const measured = items.filter((item) => item.delta !== null);
  let maxAbs = null;

  for (const item of measured) {
    if (maxAbs === null || Math.abs(item.delta) > Math.abs(maxAbs.delta)) {
      maxAbs = item;
    }
  }

  return { items, maxAbs };
}

/**
 * Read the WebVTT cues and fail on malformed or overlapping timings.
 *
 * @param {string} source
 * @param {string} filePath
 */
function parseVtt(source, filePath) {
  const document = source
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n")
    .trim();

  if (!document.startsWith("WEBVTT")) {
    throw new Error(`${displayPath(filePath)} does not start with WEBVTT.`);
  }

  const blocks = document.split(/\n{2,}/);
  const cues = [];

  for (const block of blocks.slice(1)) {
    const lines = block.split("\n").map((line) => line.trimEnd());

    if (/^(NOTE|STYLE|REGION)\b/.test(lines[0] ?? "")) {
      continue;
    }

    const timingIndex = lines.findIndex((line) => line.includes("-->"));
    if (timingIndex === -1) {
      continue;
    }

    const [rawStart, rawEnd] = lines[timingIndex].split(/\s+-->\s+/);
    const start = parseCueTimestamp((rawStart ?? "").trim());
    const end = parseCueTimestamp((rawEnd ?? "").trim().split(/\s+/)[0]);
    const id = timingIndex > 0 ? lines[timingIndex - 1].trim() : null;

    if (start === null || end === null) {
      throw new Error(
        `Malformed cue "${id ?? cues.length + 1}" in ` +
          `${displayPath(filePath)}.`,
      );
    }

    const previous = cues[cues.length - 1];
    if (previous && start < previous.end) {
      throw new Error(
        `Captions overlap: cue "${id ?? cues.length + 1}" starts at ` +
          `${formatSeconds(start)}, before "${previous.id}" ends at ` +
          `${formatSeconds(previous.end)}.`,
      );
    }

    cues.push({ id, start, end });
  }

  if (cues.length === 0) {
    throw new Error(`${displayPath(filePath)} contains no cues.`);
  }

  return cues;
}

/**
 * Run ffmpeg's silencedetect as an independent cross-check. The threshold and
 * minimum duration mirror the manual pilot convention.
 *
 * @param {string} filePath
 * @param {number} duration
 * @param {{ noise: number, duration: number }} options
 */
function detectSilences(filePath, duration, options) {
  const { stderr } = runTool("ffmpeg", [
    "-hide_banner",
    "-nostats",
    "-i",
    filePath,
    "-map",
    "0:a:0",
    "-af",
    `silencedetect=noise=${options.noise}dB:d=${options.duration}`,
    "-f",
    "null",
    "-",
  ]);

  const intervals = [];
  let start = null;

  for (const line of stderr.split(/\r?\n/)) {
    const startMatch = /silence_start:\s*(-?\d+(?:\.\d+)?)/.exec(line);
    if (startMatch) {
      start = Number(startMatch[1]);
      continue;
    }

    const endMatch = /silence_end:\s*(-?\d+(?:\.\d+)?)/.exec(line);
    if (endMatch) {
      const end = Number(endMatch[1]);
      if (start !== null) {
        intervals.push({
          start: round(start),
          end: round(end),
          duration: round(end - start),
        });
      }
      start = null;
    }
  }

  if (start !== null) {
    intervals.push({
      start: round(start),
      end: round(duration),
      duration: round(duration - start),
    });
  }

  return {
    noise: options.noise,
    minDuration: options.duration,
    intervals,
    count: intervals.length,
    total: round(
      intervals.reduce((total, interval) => total + interval.duration, 0),
    ),
  };
}

/**
 * @param {{ scenes: Array<object>, gaps: object, noSpeech: object, sync: object, thresholds: Record<string, number> }} input
 */
function buildWarnings({ scenes, gaps, noSpeech, sync, thresholds }) {
  const warnings = [];

  for (const gap of gaps.items) {
    if (gap.gap < thresholds.gapMin || gap.gap > thresholds.gapMax) {
      warnings.push({
        code: "gap-band",
        scene: gap.to,
        message:
          `gap ${gap.gap.toFixed(3)} s between "${gap.from}" and ` +
          `"${gap.to}" is outside ${thresholds.gapMin.toFixed(2)}–` +
          `${thresholds.gapMax.toFixed(2)} s`,
      });
    }
  }

  if (gaps.spread !== null && gaps.spread > thresholds.gapSpread) {
    warnings.push({
      code: "gap-spread",
      message:
        `gap spread ${gaps.spread.toFixed(2)}× exceeds ` +
        `${thresholds.gapSpread.toFixed(2)}×`,
    });
  }

  for (const scene of scenes) {
    if (
      scene.narrated &&
      scene.jcut === 0 &&
      scene.actionEnd !== null &&
      scene.postActionBeat !== null &&
      scene.postActionBeat < -0.001
    ) {
      warnings.push({
        code: "post-action-beat",
        scene: scene.id,
        message:
          `scene "${scene.id}" starts narration ` +
          `${Math.abs(scene.postActionBeat).toFixed(3)} s before its action ` +
          `settled and has no jcut`,
      });
    }
  }

  for (const cue of sync.items) {
    if (
      cue.delta !== null &&
      Math.abs(cue.delta) > thresholds.captionTolerance
    ) {
      warnings.push({
        code: "caption-sync",
        scene: cue.id,
        message:
          `cue "${cue.id}" starts ${cue.delta.toFixed(3)} s from its ` +
          `measured onset (tolerance ±${thresholds.captionTolerance.toFixed(2)} s)`,
      });
    }
  }

  if (noSpeech.share > thresholds.noSpeechMax) {
    warnings.push({
      code: "no-speech-share",
      message:
        `no-speech share ${noSpeech.share.toFixed(2)} % exceeds ` +
        `${thresholds.noSpeechMax} %`,
    });
  }

  for (const scene of scenes) {
    if (scene.articulationWpm === null) {
      continue;
    }

    if (
      scene.articulationWpm < thresholds.articulationMin ||
      scene.articulationWpm > thresholds.articulationMax
    ) {
      warnings.push({
        code: "articulation-wpm",
        scene: scene.id,
        message:
          `scene "${scene.id}" articulation is ` +
          `${scene.articulationWpm.toFixed(1)} wpm, outside ` +
          `${thresholds.articulationMin}–${thresholds.articulationMax} wpm`,
      });
    }
  }

  return warnings;
}

/**
 * @param {object} report
 */
function printReport(report) {
  const container = report.container;
  const { audio, video } = container;

  console.log(
    `[video] Audit: ${report.id}${report.title ? ` — ${report.title}` : ""}`,
  );
  console.log("");
  console.log("[video] Container");
  console.log(
    `[video]   duration ${container.duration.toFixed(3)} s, ` +
      `${formatInteger(container.bytes)} bytes, overall ` +
      `${formatBitrate(container.overallBitrate)}`,
  );
  console.log(
    `[video]   video ${video.codec}${video.profile ? ` (${video.profile})` : ""} ` +
      `${video.width}×${video.height}, ${video.fps.toFixed(3)} fps`,
  );
  console.log(
    `[video]   audio ${audio.codec}${audio.profile ? ` (${audio.profile})` : ""} ` +
      `${audio.sampleRate} Hz, ${audio.channels} ch, ` +
      `${formatBitrate(audio.bitrate)}`,
  );
  console.log(
    `[video]   silencedetect ${report.silencedetect.count} interval(s), ` +
      `${report.silencedetect.total.toFixed(3)} s at ` +
      `${report.silencedetect.noise} dB / ` +
      `${report.silencedetect.minDuration} s`,
  );
  console.log("");
  console.log("[video] Scenes");
  console.log(
    "[video]   " +
      [
        "id".padEnd(16),
        "start".padStart(7),
        "end".padStart(7),
        "actEnd".padStart(7),
        "aOff".padStart(6),
        "jcut".padStart(5),
        "aDur".padStart(6),
        "dur".padStart(6),
        "onset".padStart(7),
        "offset".padStart(7),
        "beat".padStart(6),
        "span".padStart(6),
        "artic".padStart(6),
        "pause".padStart(6),
      ].join(" "),
  );

  for (const scene of report.scenes) {
    console.log(
      "[video]   " +
        [
          scene.id.padEnd(16),
          formatCell(scene.start),
          formatCell(scene.end),
          formatCell(scene.actionEnd),
          scene.audioOffset.toFixed(3).padStart(6),
          scene.jcut.toFixed(2).padStart(5),
          formatCell(scene.audioDuration),
          formatCell(scene.duration),
          formatCell(scene.speechOnset),
          formatCell(scene.speechOffset),
          formatCell(scene.postActionBeat),
          formatCell(scene.spanWpm, 1),
          formatCell(scene.articulationWpm, 1),
          formatCell(scene.internalPauseTotal),
        ].join(" "),
    );
  }

  console.log("");
  console.log("[video] Inter-line gaps");
  for (const gap of report.gaps.items) {
    console.log(
      `[video]   ${gap.from} → ${gap.to}: ` +
        `${gap.fromOffset.toFixed(3)} → ${gap.toOnset.toFixed(3)} s = ` +
        `${gap.gap.toFixed(3)} s`,
    );
  }
  if (report.gaps.count === 0) {
    console.log("[video]   none.");
  } else {
    console.log(
      `[video]   min ${report.gaps.min.toFixed(3)} s, ` +
        `max ${report.gaps.max.toFixed(3)} s, ` +
        `median ${report.gaps.median.toFixed(3)} s, ` +
        `spread ${report.gaps.spread.toFixed(2)}×`,
    );
  }

  console.log("");
  console.log("[video] No-speech share");
  console.log(
    `[video]   ${report.noSpeech.total.toFixed(3)} s / ` +
      `${report.noSpeech.share.toFixed(2)} % ` +
      `(threshold ${report.thresholds.noSpeechMax} %)`,
  );
  console.log(
    `[video]   opening to first word ${report.noSpeech.openingToFirstWord.toFixed(3)} s`,
  );
  console.log(
    `[video]   inter-line gaps ${report.noSpeech.interLineGaps.toFixed(3)} s`,
  );
  console.log(
    `[video]   last word to end ${report.noSpeech.lastWordToEnd.toFixed(3)} s`,
  );
  if (report.noSpeech.finalCard) {
    const card = report.noSpeech.finalCard;
    console.log(
      `[video]   final card "${card.sceneId}": ` +
        `${card.duration.toFixed(3)} s on screen ` +
        `(${card.start.toFixed(3)}–${card.end.toFixed(3)}), ` +
        `${card.tailFromStart.toFixed(3)} s from its start to EOF`,
    );
  }

  console.log("");
  console.log("[video] A/V sync");
  for (const cue of report.sync.items) {
    const cueName = cue.id ?? "(no id)";
    if (cue.silent) {
      console.log(
        `[video]   ${cueName.padEnd(16)} cue ` +
          `${cue.start.toFixed(3)}  silent cue`,
      );
    } else {
      console.log(
        `[video]   ${cueName.padEnd(16)} cue ${cue.start.toFixed(3)}  ` +
          `onset ${cue.onset.toFixed(3)}  offset ` +
          `${cue.delta >= 0 ? "+" : "−"}${Math.abs(cue.delta).toFixed(3)} s`,
      );
    }
  }
  if (report.sync.maxAbs) {
    console.log(
      `[video]   max |offset| ${Math.abs(report.sync.maxAbs.delta).toFixed(3)} s ` +
        `("${report.sync.maxAbs.id}", ` +
        `${report.sync.maxAbs.delta.toFixed(3)} s)`,
    );
  }

  console.log("");
  console.log("[video] Warnings");
  if (report.warnings.length === 0) {
    console.log("[video]   none.");
  } else {
    for (const warning of report.warnings) {
      console.log(`[video]   - ${warning.message}`);
    }
  }
  console.log("");
  console.log(
    `[video] ${report.warnings.length} warning(s); ` +
      `run with --strict to fail on warnings.`,
  );
}

/**
 * @param {number | null} value
 * @param {number} [digits]
 */
function formatCell(value, digits = 3) {
  if (value === null || value === undefined) {
    return "-".padStart(6);
  }

  return value.toFixed(digits).padStart(6);
}

/**
 * @param {number | null} bitsPerSecond
 */
function formatBitrate(bitsPerSecond) {
  if (!Number.isFinite(bitsPerSecond)) {
    return "unknown";
  }

  return `${(bitsPerSecond / 1000).toFixed(1)} kb/s`;
}

/**
 * @param {number} value
 */
function formatInteger(value) {
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * @param {number} seconds
 */
function formatSeconds(seconds) {
  return `${seconds.toFixed(3)} s`;
}

/**
 * @param {string} label
 * @param {string} filePath
 */
function requireFile(label, filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`${label} is missing: ${displayPath(filePath)}.`);
  }
}

/**
 * @param {string} filePath
 * @returns {object | null}
 */
function readOptionalJSON(filePath) {
  return fs.existsSync(filePath) ? readJSON(filePath, "scenario") : null;
}

/**
 * @param {string} filePath
 * @param {string} label
 */
function readJSON(filePath, label) {
  let parsed;

  try {
    parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    throw new Error(
      `Cannot read ${label} ${displayPath(filePath)}: ${error.message}`,
    );
  }

  return parsed;
}

/**
 * @param {number | null | undefined} value
 * @param {number | null} [fallback]
 */
function numeric(value, fallback = null) {
  return Number.isFinite(value) ? value : fallback;
}

/**
 * @param {string} rate
 */
function parseRate(rate) {
  const [numerator, denominator] = String(rate ?? "")
    .split("/")
    .map(Number);

  if (!Number.isFinite(numerator) || !Number.isFinite(denominator)) {
    return 0;
  }

  return denominator === 0 ? 0 : numerator / denominator;
}

/**
 * @param {string} value
 * @returns {number | null}
 */
function parseCueTimestamp(value) {
  const match = /^(\d+):([0-5]\d):([0-5]\d)\.(\d{3})$/.exec(value);

  if (!match) {
    return null;
  }

  return (
    Number(match[1]) * 3600 +
    Number(match[2]) * 60 +
    Number(match[3]) +
    Number(match[4]) / 1000
  );
}

/**
 * @param {string} text
 */
function countWords(text) {
  return text
    .trim()
    .split(/\s+/)
    .filter((token) => /[\p{L}\p{N}]/u.test(token)).length;
}

/**
 * @param {number} value
 * @param {number} [digits]
 */
function round(value, digits = 3) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

/**
 * @param {string} filePath
 */
function displayPath(filePath) {
  return path.relative(REPO_ROOT, filePath).split(path.sep).join("/");
}

function printUsage() {
  console.log(
    [
      "Usage:",
      `  node scripts/video/audit.mjs [id] [options]`,
      "",
      `The id defaults to ${DEFAULT_ID}.`,
      "",
      "Options:",
      "  --json                       print the report as JSON",
      "  --strict                     exit non-zero when warnings are present",
      "  --speech-level <n>           sample level for speech (default 300)",
      "  --pause-threshold <s>        internal pause length (default 0.30)",
      "  --gap-min <s>                minimum inter-line gap (default 0.8)",
      "  --gap-max <s>                maximum inter-line gap (default 1.5)",
      "  --gap-spread <ratio>         maximum max/min gap ratio (default 1.8)",
      "  --caption-tolerance <s>      maximum cue/onset offset (default 0.25)",
      "  --no-speech-max <percent>    maximum no-speech share (default 25)",
      "  --articulation-min <wpm>     minimum articulation pace (default 110)",
      "  --articulation-max <wpm>     maximum articulation pace (default 210)",
      "  --silence-noise <dB>         silencedetect noise floor (default -40)",
      "  --silence-duration <s>       silencedetect minimum (default 0.45)",
    ].join("\n"),
  );
}

try {
  main();
} catch (error) {
  console.error(`[video] AUDIT FAILED: ${error.message}`);
  process.exitCode = 1;
}
