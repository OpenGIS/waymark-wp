#!/usr/bin/env node
// Synthesise per-scene narration audio through a pluggable TTS provider.
//
// Usage:
//   node scripts/video/tts.mjs [scenario-id] [options]
//     [--provider <id>] [--voice <name>] [--rate <wpm>]
//     [--scene <scene-id>] [--force] [--verbose]
//
// Each narrated scene is written as a normalised 48 kHz mono 16-bit PCM WAV.
// A pace guard measures the delivered speech and re-requests out-of-band scenes
// at a native provider rate before keeping the take closest to the target.
// Durations land in `timings.json` beside the audio, and the recorder uses that
// file to drive scene holds. The provider, voice, rate and model metadata are
// recorded so a take can be traced back to how it was narrated.
"use strict";

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

import { loadNarration } from "./lib/narration.mjs";
import {
  POST_PROCESS_VERSION,
  oneLine,
  probeDuration,
} from "./lib/tts/shared.mjs";
import {
  PACE_GUARD_VERSION,
  closestPace,
  describeBand,
  isInPaceBand,
  measurePace,
  nextRequestRate,
  resolvePaceOptions,
  roundWpm,
} from "./lib/tts/pace.mjs";
import {
  availability,
  describeProvider,
  nextCandidate,
  providerIds,
  resolveCandidates,
  resolveVoice,
} from "./lib/tts/index.mjs";

const VIDEO_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(VIDEO_DIR, "..", "..");
const WORK_DIR = path.join(VIDEO_DIR, "work");
const SCENARIO_DIR = path.join(VIDEO_DIR, "scenarios");
const DEFAULT_RATE = 175;
const DEFAULT_SCENARIO = "changing-basemaps";

async function main() {
  loadDotEnv();

  const options = parseArgs(process.argv.slice(2));
  const pace = resolvePaceOptions(process.env);

  if (options.help) {
    printUsage();
    return;
  }

  const scenarioId = options.scenarioId ?? DEFAULT_SCENARIO;
  const scenarioPath = path.join(SCENARIO_DIR, `${scenarioId}.json`);
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
      `No narration file found for scenario "${scenarioId}". ` +
        `Expected scripts/video/narration/${scenarioId}.md.`,
    );
  }

  console.log(
    `[video] Narration: ${path.relative(process.cwd(), narrationPath)}`,
  );
  console.log(
    `[video] TTS pace guard: target ${pace.targetWpm} wpm ` +
      `(${describeBand(pace)}), up to ${pace.maxAttempts} attempt(s).`,
  );

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

  const { requestedId, candidates } = resolveCandidates({
    flag: options.provider,
    env: process.env,
  });

  const audioDir = path.join(WORK_DIR, "audio", scenario.id);
  const timingsPath = path.join(audioDir, "timings.json");
  fs.mkdirSync(audioDir, { recursive: true });

  const previous = readTimings(timingsPath);
  const previousById = new Map(
    (previous?.scenes ?? []).map((entry) => [entry.id, entry]),
  );

  const selected = await selectAndSynthesise({
    candidates,
    options,
    narrated,
    audioDir,
    previousById,
    pace,
  });

  const scenes = narrated
    .map((scene) => selected.generated.get(scene.id))
    .filter(Boolean);

  if (scenes.length !== narrated.length) {
    throw new Error("Not every narrated scene produced an audio entry.");
  }

  const metadata =
    typeof selected.provider.timingMetadata === "function"
      ? selected.provider.timingMetadata({
          voice: selected.voice,
          rate: options.rate,
          env: process.env,
        })
      : {};

  const timings = {
    id: scenario.id,
    ...metadata,
    provider: selected.provider.id,
    voice: selected.voice,
    rate: options.rate,
    pace,
    generatedAt: new Date().toISOString(),
    scenes,
  };

  if (selected.fallbackFrom) {
    timings.requestedProvider = requestedId;
    timings.fallbackReason = oneLine(selected.fallbackReason);
  }

  fs.writeFileSync(
    timingsPath,
    `${JSON.stringify(timings, null, 2)}\n`,
    "utf8",
  );

  if (!selected.fallbackFrom) {
    console.log(
      `[video] TTS: ${describeProvider(selected.provider, selected.voice)}.`,
    );
  }

  printTable(selected.rows);
  console.log(`[video] Timings: ${path.relative(process.cwd(), timingsPath)}`);
}

/**
 * Pick an available provider and synthesise the whole narration run. A fatal
 * synthesis failure restarts the run on the next candidate so one video never
 * mixes voices.
 *
 * @param {{ candidates: object[], options: object, narrated: object[], audioDir: string, previousById: Map<string, object>, pace: object }} args
 * @returns {Promise<{ provider: object, voice: string, generated: Map<string, object>, rows: object[], fallbackFrom: string | null, fallbackReason: string | null }>}
 */
async function selectAndSynthesise({
  candidates,
  options,
  narrated,
  audioDir,
  previousById,
  pace,
}) {
  let index = 0;
  let fallbackFrom = null;
  let fallbackReason = null;
  let forceScenes = new Set();

  while (index < candidates.length) {
    const provider = candidates[index];
    const check = availability(provider, process.env);

    if (check.available) {
      const selection = resolveVoice(provider, {
        flagVoice: options.voice,
        env: process.env,
      });
      const voice = selection.voice;

      try {
        const result = await synthesiseRun({
          provider,
          voice,
          voiceSource: selection.source,
          options,
          narrated,
          audioDir,
          previousById,
          pace,
          force: options.force,
          forceScenes,
        });

        return {
          provider,
          voice,
          generated: result.generated,
          rows: result.rows,
          fallbackFrom,
          fallbackReason,
        };
      } catch (error) {
        if (!error.isProviderFailure) {
          throw error;
        }

        const next = nextCandidate(candidates, provider.id);
        const reason = oneLine(error.message);

        if (!next) {
          console.warn(
            `[video] TTS: ${provider.id} failed (${reason}); ` +
              `no fallback provider is available.`,
          );
          throw error;
        }

        const nextSelection = resolveVoice(next, {
          flagVoice: options.voice,
          env: process.env,
        });

        console.warn(
          `[video] TTS: ${provider.id} failed (${reason}); falling back to ` +
            `${describeProvider(next, nextSelection.voice)}.`,
        );

        fallbackFrom ??= provider.id;
        fallbackReason = reason;
        // A failed run may already have overwritten cached WAVs. Regenerate
        // those scenes on the fallback provider rather than reusing a take
        // that no longer matches its cache entry. Accumulate across failures
        // so a later provider cannot reuse audio from any earlier attempt.
        for (const sceneId of error.writtenScenes ?? []) {
          forceScenes.add(sceneId);
        }
        index += 1;
        continue;
      }
    }

    const next = nextCandidate(candidates, provider.id);
    const reason = oneLine(check.reason);
    const nextSelection = next
      ? resolveVoice(next, {
          flagVoice: options.voice,
          env: process.env,
        })
      : null;

    console.warn(
      next
        ? `[video] TTS: ${provider.id} unavailable (${reason}); falling back to ` +
            `${describeProvider(next, nextSelection.voice)}.`
        : `[video] TTS: ${provider.id} unavailable (${reason}); ` +
            `no fallback provider is available.`,
    );

    fallbackFrom ??= provider.id;
    fallbackReason ??= reason;

    if (!next) {
      throw new Error(
        `No TTS provider is available. ${provider.id}: ${reason}`,
      );
    }

    index += 1;
  }

  throw new Error("No TTS provider is available.");
}

/**
 * Synthesise every narrated scene with one provider. Cache hits are reused
 * only when the provider, voice, rate and text all match.
 *
 * @param {{ provider: object, voice: string, voiceSource: string, options: object, narrated: object[], audioDir: string, previousById: Map<string, object>, pace: object, force: boolean, forceScenes: Set<string> }} args
 * @returns {Promise<{ generated: Map<string, object>, rows: object[] }>}
 */
async function synthesiseRun({
  provider,
  voice,
  voiceSource,
  options,
  narrated,
  audioDir,
  previousById,
  pace,
  force,
  forceScenes,
}) {
  const generated = new Map();
  const rows = [];
  const written = new Set();

  for (const scene of narrated) {
    const isSelected = options.scene === null || options.scene === scene.id;
    const wavPath = path.join(audioDir, `${scene.id}.wav`);
    const relativeFile = path
      .relative(VIDEO_DIR, wavPath)
      .split(path.sep)
      .join("/");
    const hash = hashNarration(
      scene.narration,
      provider,
      voice,
      options.rate,
      pace,
    );
    const cached = previousById.get(scene.id);

    if (!isSelected) {
      if (forceScenes.has(scene.id)) {
        throw new Error(
          `Scene "${scene.id}" was partially rewritten by a failed provider. ` +
            `Run without --scene to regenerate every scene.`,
        );
      }

      if (!cached) {
        throw new Error(
          `Scene "${scene.id}" has no cached audio for provider ` +
            `"${provider.id}" and voice "${voice}". Run without --scene to ` +
            `regenerate every scene.`,
        );
      }

      if (cached.hash !== hash || !fs.existsSync(wavPath)) {
        throw new Error(
          `Scene "${scene.id}" was narrated with a different provider, voice ` +
            `or rate. Run without --scene to regenerate every scene.`,
        );
      }

      const duration = Number.isFinite(cached.duration)
        ? cached.duration
        : probeDuration(wavPath);
      const paceInfo = cachedPaceInfo(cached, wavPath, scene.narration);

      generated.set(scene.id, {
        ...cached,
        text: scene.narration,
        file: relativeFile,
        duration,
        ...paceInfo,
        hash,
      });
      logChosenPace(scene.id, paceInfo, pace, true);
      continue;
    }

    const canReuse =
      !force &&
      !forceScenes.has(scene.id) &&
      options.scene === null &&
      cached?.hash === hash &&
      fs.existsSync(wavPath);

    if (canReuse) {
      const duration = Number.isFinite(cached.duration)
        ? cached.duration
        : probeDuration(wavPath);
      const paceInfo = cachedPaceInfo(cached, wavPath, scene.narration);

      generated.set(scene.id, {
        ...cached,
        text: scene.narration,
        file: relativeFile,
        duration,
        ...paceInfo,
        hash,
      });
      logChosenPace(scene.id, paceInfo, pace, true);
      rows.push({
        id: scene.id,
        duration,
        wpm: paceInfo.wpm,
        attempts: paceInfo.attempts,
        cached: true,
      });
      continue;
    }

    const before = fileSignature(wavPath);

    let result;
    try {
      result = await synthesiseWithPaceGuard({
        provider,
        voice,
        voiceSource,
        rate: options.rate,
        text: scene.narration,
        sceneId: scene.id,
        wavPath,
        audioDir,
        pace,
        verbose: options.verbose,
      });
    } catch (error) {
      // A provider can fail before it writes anything, notably a fatal HTTP
      // error. Only force the fallback to regenerate this scene when the file
      // actually changed; otherwise a valid cached take is still reusable.
      if (fileSignature(wavPath) !== before) {
        written.add(scene.id);
      }
      error.writtenScenes = [...written];
      error.isProviderFailure = true;
      throw error;
    }

    written.add(scene.id);

    generated.set(scene.id, {
      id: scene.id,
      text: scene.narration,
      file: relativeFile,
      duration: result.duration,
      speechSeconds: result.speechSeconds,
      wordCount: result.wordCount,
      wpm: result.wpm,
      firstWpm: result.firstWpm,
      attempts: result.attempts,
      requestedRate: result.requestedRate,
      attemptRates: result.attemptRates,
      hash,
    });
    rows.push({
      id: scene.id,
      duration: result.duration,
      wpm: result.wpm,
      attempts: result.attempts,
      cached: false,
    });
  }

  return { generated, rows };
}

/**
 * Synthesise one scene into a scratch take, measure its pace, and retry while
 * the take is outside the acceptable band. A retry asks the provider for a
 * different native speaking rate estimated from the measured pace; the audio is
 * never time-stretched. The take closest to the target is promoted to the
 * scene's WAV.
 *
 * @param {{ provider: object, voice: string, voiceSource: string, rate: number, text: string, sceneId: string, wavPath: string, audioDir: string, pace: { targetWpm: number, bandWpm: number, maxAttempts: number }, verbose: boolean }} options
 * @returns {Promise<{ duration: number, speechSeconds: number, wordCount: number, wpm: number, firstWpm: number, attempts: number, requestedRate: number, attemptRates: number[] }>}
 */
async function synthesiseWithPaceGuard({
  provider,
  voice,
  voiceSource,
  rate,
  text,
  sceneId,
  wavPath,
  audioDir,
  pace,
  verbose,
}) {
  const attemptDir = path.join(audioDir, ".pace");
  const takes = [];
  let requestedRate = rate;

  fs.mkdirSync(attemptDir, { recursive: true });

  try {
    for (let attempt = 1; attempt <= pace.maxAttempts; attempt += 1) {
      const attemptPath = path.join(attemptDir, `${sceneId}-${attempt}.wav`);
      const result = await provider.synthesise({
        text,
        voice,
        rate: requestedRate,
        outPath: attemptPath,
        env: process.env,
        sceneId,
        verbose,
        allowVoiceSubstitution: voiceSource !== "flag",
        log: console.log,
      });
      const duration = Number.isFinite(result?.duration)
        ? result.duration
        : probeDuration(attemptPath);
      const measured = measurePace(attemptPath, text);

      takes.push({
        attempt,
        path: attemptPath,
        duration,
        requestedRate,
        ...measured,
      });

      console.log(
        `[video] TTS pace ${sceneId}: attempt ${attempt}/` +
          `${pace.maxAttempts} ${roundWpm(measured.wpm)} wpm ` +
          `(request ${requestedRate} wpm, target ${pace.targetWpm}).`,
      );

      if (isInPaceBand(measured.wpm, pace)) {
        break;
      }

      requestedRate = nextRequestRate(
        requestedRate,
        measured.wpm,
        pace.targetWpm,
      );
    }

    const chosen = closestPace(takes, (take) => take.wpm, pace.targetWpm);
    const inBand = takes.some((take) => isInPaceBand(take.wpm, pace));

    fs.copyFileSync(chosen.path, wavPath);
    copyAiffSidecar(chosen.path, wavPath);

    if (!inBand) {
      console.warn(
        `[video] TTS pace ${sceneId}: no attempt inside ` +
          `${describeBand(pace)}; using the closest take at ` +
          `${roundWpm(chosen.wpm)} wpm.`,
      );
    }

    logChosenPace(
      sceneId,
      {
        wpm: chosen.wpm,
        firstWpm: takes[0].wpm,
        attempts: takes.length,
      },
      pace,
      false,
    );

    return {
      duration: chosen.duration,
      speechSeconds: chosen.speechSeconds,
      wordCount: chosen.wordCount,
      wpm: roundWpm(chosen.wpm),
      firstWpm: roundWpm(takes[0].wpm),
      attempts: takes.length,
      requestedRate: chosen.requestedRate,
      attemptRates: takes.map((take) => take.requestedRate),
    };
  } finally {
    fs.rmSync(attemptDir, { recursive: true, force: true });
  }
}

/**
 * Reuse the pace recorded beside a cached take. Older cache entries that
 * predate the guard are measured from the WAV instead.
 *
 * @param {object} cached
 * @param {string} wavPath
 * @param {string} text
 * @returns {{ speechSeconds: number, wordCount: number, wpm: number, firstWpm: number, attempts: number }}
 */
function cachedPaceInfo(cached, wavPath, text) {
  const attempts = Number.isInteger(cached.attempts) ? cached.attempts : 1;

  if (
    Number.isFinite(cached.speechSeconds) &&
    Number.isFinite(cached.wordCount) &&
    Number.isFinite(cached.wpm)
  ) {
    return {
      speechSeconds: cached.speechSeconds,
      wordCount: cached.wordCount,
      wpm: cached.wpm,
      firstWpm: Number.isFinite(cached.firstWpm) ? cached.firstWpm : cached.wpm,
      attempts,
    };
  }

  const measured = measurePace(wavPath, text);

  return {
    ...measured,
    firstWpm: measured.wpm,
    attempts,
  };
}

/**
 * Preserve a provider's raw sidecar (the say `.aiff`) when a retried take is
 * promoted over the final WAV.
 *
 * @param {string} fromWav
 * @param {string} toWav
 */
function copyAiffSidecar(fromWav, toWav) {
  const fromAiff = fromWav.replace(/\.wav$/, ".aiff");
  if (!fs.existsSync(fromAiff)) {
    return;
  }

  fs.copyFileSync(fromAiff, toWav.replace(/\.wav$/, ".aiff"));
}

/**
 * Log the take that was kept. The arrow form mirrors the per-attempt log when
 * more than one take was requested.
 *
 * @param {string} sceneId
 * @param {{ wpm: number, firstWpm: number, attempts: number }} info
 * @param {{ targetWpm: number }} pace
 * @param {boolean} cached
 */
function logChosenPace(sceneId, info, pace, cached) {
  const suffix = cached ? ", cached" : "";

  if (info.attempts > 1) {
    console.log(
      `[video] TTS pace ${sceneId}: ${roundWpm(info.firstWpm)} wpm → ` +
        `retry ${roundWpm(info.wpm)} wpm (target ${pace.targetWpm}${suffix}).`,
    );
    return;
  }

  console.log(
    `[video] TTS pace ${sceneId}: ${roundWpm(info.wpm)} wpm ` +
      `(target ${pace.targetWpm}${suffix}).`,
  );
}

/**
 * Parse the CLI arguments.
 *
 * @param {string[]} argv
 * @returns {{ scenarioId: string | null, provider: string | null, voice: string | null, rate: number, scene: string | null, force: boolean, verbose: boolean, help: boolean }}
 */
function parseArgs(argv) {
  const options = {
    scenarioId: null,
    provider: null,
    voice: null,
    rate: DEFAULT_RATE,
    scene: null,
    force: false,
    verbose: false,
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

    if (argument === "--verbose") {
      options.verbose = true;
      continue;
    }

    if (
      argument === "--provider" ||
      argument === "--voice" ||
      argument === "--rate" ||
      argument === "--scene"
    ) {
      const value = argv[index + 1];
      if (value === undefined || value.startsWith("--")) {
        throw new Error(`Option "${argument}" requires a value.`);
      }
      index += 1;

      if (argument === "--provider") {
        options.provider = value;
      } else if (argument === "--voice") {
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

  return options;
}

/**
 * Cache key for one take. Provider, voice, rate, any provider-specific speed,
 * the pace settings and the post-processing version are part of the key, so
 * switching provider, voice, pace target or the trim chain never reuses the
 * wrong audio.
 *
 * @param {string} text
 * @param {object} provider
 * @param {string} voice
 * @param {number} rate
 * @param {{ targetWpm: number, bandWpm: number, maxAttempts: number }} pace
 * @returns {string}
 */
function hashNarration(text, provider, voice, rate, pace) {
  const speed =
    typeof provider.speedForRate === "function"
      ? provider.speedForRate(rate)
      : null;

  return crypto
    .createHash("sha256")
    .update(
      JSON.stringify({
        provider: provider.id,
        voice,
        rate,
        speed,
        pace,
        paceGuard: PACE_GUARD_VERSION,
        text,
        postProcess: POST_PROCESS_VERSION,
      }),
    )
    .digest("hex");
}

/**
 * Identify the current on-disk state of a file without reading its contents.
 *
 * @param {string} filePath
 * @returns {string | null}
 */
function fileSignature(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return `${stats.mtimeMs}:${stats.size}`;
  } catch {
    return null;
  }
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
 * Load `.env` from the repository root when it exists. Never required, and its
 * contents are never logged.
 */
function loadDotEnv() {
  const envPath = path.join(REPO_ROOT, ".env");
  if (!fs.existsSync(envPath)) {
    return;
  }

  try {
    process.loadEnvFile(envPath);
  } catch {
    console.warn(
      "[video] TTS: .env exists but could not be loaded; continuing without it.",
    );
  }
}

/**
 * @param {Array<{ id: string, duration: number, wpm?: number, attempts?: number, cached: boolean }>} rows
 */
function printTable(rows) {
  let total = 0;

  console.log("\n[video] Scene durations");
  for (const row of rows) {
    total += row.duration;
    const suffix = row.cached ? " (cached)" : "";
    const pace = Number.isFinite(row.wpm)
      ? `  ${String(roundWpm(row.wpm)).padStart(3)} wpm  x${row.attempts}`
      : "";
    console.log(
      `[video]   ${row.id.padEnd(18)} ${row.duration.toFixed(3)}s${pace}${suffix}`,
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
      "  node scripts/video/tts.mjs [scenario-id] [options]",
      "",
      `The scenario id defaults to ${DEFAULT_SCENARIO}.`,
      "",
      "Options:",
      `  --provider <id>    ${providerIds().join(" or ")} (default: deepgram when`,
      "                     DEEPGRAM_API_KEY is set, otherwise say)",
      "  --voice <name>     voice (default: provider-specific)",
      `  --rate <wpm>       speaking rate in words per minute (default: ${DEFAULT_RATE})`,
      "  --scene <id>       process one scene only",
      "  --force            ignore the cache and regenerate",
      "  --verbose          log provider model and request identifiers",
      "",
      "Environment:",
      "  DEEPGRAM_API_KEY, DEEPGRAM_REGION, DEEPGRAM_BASE_URL",
      "  VIDEO_TTS_PROVIDER, VIDEO_TTS_VOICE",
      "  VIDEO_TTS_TARGET_WPM, VIDEO_TTS_PACE_BAND_WPM, VIDEO_TTS_MAX_ATTEMPTS",
      "",
      "A .env file in the repository root is loaded when present. Audio is",
      "written to scripts/video/work/audio/<id>/ with a timings.json file",
      "beside it. Run from the repository root.",
    ].join("\n"),
  );
}

main().catch((error) => {
  console.error(`[video] ${oneLine(error?.message ?? error)}`);
  process.exitCode = 1;
});
