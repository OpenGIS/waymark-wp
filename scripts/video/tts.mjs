#!/usr/bin/env node
// Synthesise narration audio through a pluggable TTS provider.
//
// Usage:
//   node scripts/video/tts.mjs [scenario-id] [options]
//     [--provider <id>] [--voice <name>] [--rate <wpm>]
//     [--scene <scene-id>] [--force] [--verbose]
//
// A provider with word timestamps (Deepgram) synthesises the whole script as
// one continuous performance, masters it once, aligns the known script to the
// STT words and cuts one 48 kHz mono 16-bit PCM WAV per narrated scene. A
// provider without alignment (say) keeps the per-line path. Durations land in
// `timings.json` beside the audio, and the recorder uses that file to drive
// scene holds. The provider, voice, rate, model and alignment metadata are
// recorded so a take can be traced back to how it was narrated.
"use strict";

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

import { loadNarration } from "./lib/narration.mjs";
import { loadLexicon } from "./lib/tts/pronounce.mjs";
import {
  PRONUNCIATION_VERSION,
  planPronunciations,
} from "./lib/tts/pronunciation-plan.mjs";
import {
  POST_PROCESS_VERSION,
  loadDotEnv,
  oneLine,
  probeDuration,
  run,
} from "./lib/tts/shared.mjs";
import {
  CONTINUOUS_MAX_ATTEMPTS,
  CONTINUOUS_PACE_VERSION,
  PACE_GUARD_VERSION,
  closestPace,
  continuousEstimateRate,
  countWords,
  describeBand,
  isInPaceBand,
  ladderRate,
  measurePace,
  paceDirection,
  resolvePaceOptions,
  roundWpm,
} from "./lib/tts/pace.mjs";
import { ALIGNMENT_VERSION, alignScriptToWords } from "./lib/tts/alignment.mjs";
import { buildStamp, writeJsonAtomic, writeStamp } from "./lib/tts/stamp.mjs";
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
const DEFAULT_LEXICON_PATH = path.join(
  VIDEO_DIR,
  "narration",
  "pronunciations.json",
);
const CONTINUOUS_LEAD_SECONDS = 0.03;
const CONTINUOUS_TAIL_SECONDS = 0.12;
const CONTINUOUS_REQUEST_TIMEOUT_MS = 120_000;

async function main() {
  loadDotEnv(REPO_ROOT, "TTS");

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

  const lexicon = loadLexiconForRun(options);

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
    previous,
    previousById,
    pace,
    lexicon,
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
          rate: selected.rate,
          env: process.env,
        })
      : {};

  const timings = {
    id: scenario.id,
    ...metadata,
    provider: selected.provider.id,
    voice: selected.voice,
    rate: selected.rate,
    mode: selected.continuous ? "continuous" : "per-line",
    pace,
    pronunciations: {
      count: selected.pronunciation.count,
      words: selected.pronunciation.words,
    },
    generatedAt: new Date().toISOString(),
    scenes,
  };

  if (selected.continuous) {
    timings.performanceHash = selected.continuous.hash;
    timings.overallWpm = selected.continuous.overallWpm;
    timings.takeAttempts = selected.continuous.takeAttempts;
    timings.attemptRates = selected.continuous.attemptRates;
    timings.paceSamples = selected.continuous.paceSamples;
    timings.performance = selected.continuous.performance;
    timings.alignment = selected.continuous.alignment;
  }

  if (selected.fallbackFrom) {
    timings.requestedProvider = requestedId;
    timings.fallbackReason = oneLine(selected.fallbackReason);
  }

  const stamp = buildStamp({
    scenarioId: scenario.id,
    provider: selected.provider,
    voice: selected.voice,
    rate: selected.rate,
    pace,
    mode: selected.continuous ? "continuous" : "per-line",
    narrationPath,
    narrated,
    lexiconPath: lexicon.path,
    lexiconHash: lexicon.hash,
    timings,
  });

  if (selected.commit) {
    selected.commit({ timings, timingsPath, stamp });
  } else {
    writeJsonAtomic(timingsPath, timings);
    writeStamp(audioDir, stamp);
  }

  if (!selected.fallbackFrom) {
    console.log(
      `[video] TTS: ${describeProvider(selected.provider, selected.voice)}` +
        `${selected.continuous ? " (continuous performance)" : ""}.`,
    );
  }

  if (selected.continuous) {
    printContinuousTable(selected.rows);
    printContinuousSummary(selected.rows, selected.continuous, pace);
    printReconstructionSummary(selected.continuous.performance);
    console.log(
      `[video] TTS alignment: ${selected.continuous.alignment.matchedWords}/` +
        `${selected.continuous.alignment.scriptWords} script words matched ` +
        `from ${selected.continuous.alignment.sttWords} STT words ` +
        `(${Math.round(selected.continuous.alignment.confidence * 100)}%).`,
    );
  } else {
    printTable(selected.rows);
    printPaceSummary(selected.rows, pace);
  }

  console.log(`[video] Timings: ${path.relative(process.cwd(), timingsPath)}`);
}

/**
 * Pick an available provider and synthesise the whole narration run. A fatal
 * synthesis failure restarts the run on the next candidate so one video never
 * mixes voices.
 *
 * @param {{ candidates: object[], options: object, narrated: object[], audioDir: string, previous: object | null, previousById: Map<string, object>, pace: object, lexicon: { path: string, hash: string, lexicon: object } }} args
 * @returns {Promise<{ provider: object, voice: string, rate: number, pronunciation: object, generated: Map<string, object>, rows: object[], continuous: object | null, fallbackFrom: string | null, fallbackReason: string | null }>}
 */
async function selectAndSynthesise({
  candidates,
  options,
  narrated,
  audioDir,
  previous,
  previousById,
  pace,
  lexicon,
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
      const pronunciation = planPronunciations({
        provider,
        narrated,
        lexicon: lexicon.lexicon,
        lexiconHash: lexicon.hash,
        rate: options.rate,
      });

      logPronunciationPlan(pronunciation);

      try {
        const canRunContinuous =
          provider.supportsContinuous === true && options.scene === null;
        let result;

        if (canRunContinuous) {
          result = await synthesiseContinuousRun({
            provider,
            voice,
            voiceSource: selection.source,
            options,
            narrated,
            audioDir,
            previous,
            pace,
            pronunciation,
          });
        } else {
          if (provider.supportsContinuous !== true && options.scene === null) {
            console.warn(
              `[video] TTS: ${provider.id} has no word-timestamp alignment; ` +
                `using per-line synthesis (cadence may vary between lines).`,
            );
          }

          result = await synthesiseRun({
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
            pronunciation,
          });
        }

        return {
          provider,
          voice,
          rate: pronunciation.rate,
          pronunciation,
          generated: result.generated,
          rows: result.rows,
          continuous: result.continuous ?? null,
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
 * @param {{ provider: object, voice: string, voiceSource: string, options: object, narrated: object[], audioDir: string, previousById: Map<string, object>, pace: object, force: boolean, forceScenes: Set<string>, pronunciation: object }} args
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
  pronunciation,
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
    const synthesisText = pronunciation.texts.get(scene.id) ?? scene.narration;
    const hash = hashNarration(
      scene.narration,
      provider,
      voice,
      pronunciation.rate,
      pace,
      pronunciation.lexiconHash,
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
          `Scene "${scene.id}" was narrated with a different provider, voice, ` +
            `rate or pronunciation. Run without --scene to regenerate every ` +
            `scene.`,
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
        requestedRate: paceInfo.requestedRate,
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
        rate: pronunciation.rate,
        text: synthesisText,
        paceText: scene.narration,
        sceneId: scene.id,
        wavPath,
        audioDir,
        pace,
        verbose: options.verbose,
        locked: pronunciation.locked,
        expectedPronunciations: pronunciation.sceneCounts.get(scene.id) ?? 0,
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
      requestedRate: result.requestedRate,
      cached: false,
    });
  }

  return { generated, rows };
}

/**
 * Synthesise the whole narration as one continuous performance, master it once,
 * align the known script to its STT word timestamps, and cut one WAV per scene.
 *
 * The performance is the unit of pace: a whole take is re-rendered at a nudged
 * rate only when the overall pace is outside the band. Per-scene pace is
 * reported but never triggers a retry. Every cut comes from the same mastered
 * file, so there is one gain structure and one register across the film.
 *
 * @param {{ provider: object, voice: string, voiceSource: string, options: object, narrated: object[], audioDir: string, previous: object | null, pace: object, pronunciation: object }} args
 * @returns {Promise<{ generated: Map<string, object>, rows: object[], continuous: object }>}
 */
async function synthesiseContinuousRun({
  provider,
  voice,
  voiceSource,
  options,
  narrated,
  audioDir,
  previous,
  pace,
  pronunciation,
}) {
  const performanceText = buildPerformanceText(narrated);
  const synthesisText = buildPerformanceSynthesisText(narrated, pronunciation);
  const performancePath = path.join(audioDir, "performance.wav");
  const hash = hashPerformance(
    performanceText,
    provider,
    voice,
    pronunciation.rate,
    pace,
    pronunciation.lexiconHash,
    synthesisText,
  );

  if (
    !options.force &&
    canReuseContinuous({ previous, narrated, performancePath, hash })
  ) {
    return reuseContinuous({ previous, narrated, hash });
  }

  const stagingDir = path.join(audioDir, ".next");
  const stagedPerformancePath = path.join(stagingDir, "performance.wav");

  fs.rmSync(stagingDir, { recursive: true, force: true });
  fs.mkdirSync(stagingDir, { recursive: true });

  try {
    const take = await synthesisePerformance({
      provider,
      voice,
      voiceSource,
      options,
      performanceText,
      synthesisText,
      performancePath: stagedPerformancePath,
      audioDir,
      pace,
      rate: pronunciation.rate,
      locked: pronunciation.locked,
      expectedPronunciations: pronunciation.count,
    });

    const performanceDuration = probeDuration(stagedPerformancePath);
    const performanceSpeechSeconds = measurePace(
      stagedPerformancePath,
      performanceText,
    ).speechSeconds;
    const stt = await provider.transcribeWav({
      wavPath: stagedPerformancePath,
      env: process.env,
      verbose: options.verbose,
      log: console.log,
    });
    const alignment = alignScriptToWords({
      scenes: narrated,
      words: stt.words,
    });
    const cuts = planContinuousCuts(alignment.scenes, performanceDuration);
    const cutDurations = writeContinuousCuts({
      performancePath: stagedPerformancePath,
      outDir: stagingDir,
      narrated,
      cuts,
    });

    const sceneEntries = [];
    const rows = [];

    for (let index = 0; index < narrated.length; index += 1) {
      const scene = narrated[index];
      const aligned = alignment.scenes[index];
      const cut = cuts[index];
      const duration = cutDurations[index];
      const wordCount = countWords(scene.narration);
      const speechSeconds = aligned.end - aligned.start;
      const wpm = (wordCount / speechSeconds) * 60;

      const entry = {
        id: scene.id,
        text: scene.narration,
        file: relativeAudioFile(audioDir, scene.id),
        duration,
        speechSeconds: roundSeconds(speechSeconds),
        wordCount,
        wpm: roundWpm(wpm),
        firstWpm: roundWpm(take.firstWpm),
        attempts: take.attempts,
        requestedRate: take.requestedRate,
        attemptRates: take.attemptRates,
        hash,
        alignment: {
          confidence: roundConfidence(aligned.confidence),
          matchedWords: aligned.matchedWords,
          scriptWords: aligned.scriptWords,
          unmatchedWords: aligned.unmatchedWords,
          firstMatchedWord: aligned.firstMatchedWord.word,
          firstMatchedScriptWord: aligned.firstMatchedWord.scriptWord,
          firstMatchedStart: roundSeconds(aligned.firstMatchedWord.start),
          lastMatchedWord: aligned.lastMatchedWord.word,
          lastMatchedScriptWord: aligned.lastMatchedWord.scriptWord,
          lastMatchedEnd: roundSeconds(aligned.lastMatchedWord.end),
          cutFirstWord: aligned.cutStartWord.word,
          cutLastWord: aligned.cutEndWord.word,
          cutStart: roundSeconds(cut.start),
          cutEnd: roundSeconds(cut.end),
          sttStartIndex: aligned.sttStartIndex,
          sttEndIndex: aligned.sttEndIndex,
        },
      };

      sceneEntries.push(entry);
      rows.push({
        id: scene.id,
        duration,
        wpm: entry.wpm,
        attempts: take.attempts,
        requestedRate: take.requestedRate,
        cached: false,
        confidence: aligned.confidence,
      });
    }

    const performance = {
      file: relativeAudioFile(audioDir, "performance"),
      ...summarisePerformance({
        performanceDuration,
        performanceSpeechSeconds,
        performanceText,
        take,
        alignment,
        cuts,
        cutDurations,
      }),
    };
    const continuous = {
      hash,
      overallWpm: take.wpm,
      takeAttempts: take.attempts,
      attemptRates: take.attemptRates,
      paceSamples: take.paceSamples,
      performance,
      alignment: {
        version: ALIGNMENT_VERSION,
        model: stt.model,
        requestId: stt.requestId,
        sttWords: alignment.sttWordCount,
        scriptWords: alignment.scriptWordCount,
        matchedWords: alignment.matchedCount,
        unmatchedWords: alignment.unmatchedCount,
        confidence: roundConfidence(alignment.confidence),
      },
    };

    return {
      generated: new Map(sceneEntries.map((entry) => [entry.id, entry])),
      rows,
      continuous,
      commit: ({ timings, timingsPath, stamp }) => {
        promoteStagedRun({
          stagingDir,
          audioDir,
          narrated,
          timings,
          timingsPath,
          stamp,
        });
      },
    };
  } catch (error) {
    fs.rmSync(stagingDir, { recursive: true, force: true });
    throw error;
  }
}

/**
 * Build the performance text in scenario order, skipping silent scenes and
 * separating scenes with a blank line so the provider reads paragraphs.
 *
 * @param {object[]} narrated
 * @returns {string}
 */
function buildPerformanceText(narrated) {
  return narrated.map((scene) => scene.narration.trim()).join("\n\n");
}

/**
 * Build the provider-ready performance text from the pronunciation plan. The
 * authored performance text is kept for measurement, timings and alignment.
 *
 * @param {object[]} narrated
 * @param {{ texts: Map<string, string> }} pronunciation
 * @returns {string}
 */
function buildPerformanceSynthesisText(narrated, pronunciation) {
  return narrated
    .map((scene) => pronunciation.texts.get(scene.id) ?? scene.narration)
    .map((text) => text.trim())
    .join("\n\n");
}

/**
 * True when the existing timings and WAVs describe the same continuous
 * performance as the current run.
 *
 * @param {{ previous: object | null, narrated: object[], performancePath: string, hash: string }} options
 * @returns {boolean}
 */
function canReuseContinuous({ previous, narrated, performancePath, hash }) {
  if (!previous || previous.mode !== "continuous") {
    return false;
  }

  if (previous.performanceHash !== hash) {
    return false;
  }

  if (
    !previous.performance ||
    !previous.alignment ||
    !Number.isFinite(previous.overallWpm)
  ) {
    return false;
  }

  if (!fs.existsSync(performancePath)) {
    return false;
  }

  if (
    !Array.isArray(previous.scenes) ||
    previous.scenes.length !== narrated.length
  ) {
    return false;
  }

  for (let index = 0; index < narrated.length; index += 1) {
    const scene = narrated[index];
    const entry = previous.scenes[index];

    if (!entry || entry.id !== scene.id) {
      return false;
    }

    if (!Number.isFinite(entry.duration) || entry.duration <= 0) {
      return false;
    }

    if ((entry.text ?? "").trim() !== scene.narration.trim()) {
      return false;
    }

    if (
      typeof entry.file !== "string" ||
      !fs.existsSync(path.resolve(VIDEO_DIR, entry.file))
    ) {
      return false;
    }
  }

  return true;
}

/**
 * Rebuild the in-memory result from a cached continuous timings file.
 *
 * @param {{ previous: object, narrated: object[], hash: string }} options
 * @returns {{ generated: Map<string, object>, rows: object[], continuous: object }}
 */
function reuseContinuous({ previous, narrated, hash }) {
  const generated = new Map();
  const rows = [];

  for (let index = 0; index < narrated.length; index += 1) {
    const scene = narrated[index];
    const entry = previous.scenes[index];

    generated.set(scene.id, { ...entry, text: scene.narration });
    rows.push({
      id: scene.id,
      duration: entry.duration,
      wpm: entry.wpm,
      attempts: entry.attempts,
      requestedRate: entry.requestedRate,
      cached: true,
      confidence: entry.alignment?.confidence,
    });
  }

  console.log("[video] TTS: continuous performance reused from cache.");

  return {
    generated,
    rows,
    continuous: {
      hash,
      overallWpm: previous.overallWpm,
      takeAttempts: previous.takeAttempts,
      attemptRates: previous.attemptRates ?? [],
      paceSamples: previous.paceSamples ?? [],
      performance: previous.performance,
      alignment: previous.alignment,
    },
  };
}

/**
 * Render whole-performance takes until one lands inside the pace band, then
 * promote the closest take to `performance.wav`.
 *
 * @param {{ provider: object, voice: string, voiceSource: string, options: object, performanceText: string, synthesisText: string, performancePath: string, audioDir: string, pace: object, rate: number, locked: boolean, expectedPronunciations: number }} options
 * @returns {Promise<{ duration: number, speechSeconds: number, wordCount: number, wpm: number, firstWpm: number, attempts: number, requestedRate: number, attemptRates: number[] }>}
 */
async function synthesisePerformance({
  provider,
  voice,
  voiceSource,
  options,
  performanceText,
  synthesisText,
  performancePath,
  audioDir,
  pace,
  rate,
  locked,
  expectedPronunciations,
}) {
  const attemptDir = path.join(audioDir, ".performance");
  const takes = [];

  fs.mkdirSync(attemptDir, { recursive: true });

  try {
    for (let attempt = 1; attempt <= CONTINUOUS_MAX_ATTEMPTS; attempt += 1) {
      const requestedRate = locked
        ? rate
        : clampRate(
            provider,
            continuousEstimateRate({
              baseRate: rate,
              targetWpm: pace.targetWpm,
              samples: takes.map((take) => ({
                rate: take.requestedRate,
                wpm: take.wpm,
              })),
            }),
          );
      const attemptPath = path.join(attemptDir, `performance-${attempt}.wav`);
      let result;

      try {
        result = await provider.synthesise({
          text: synthesisText,
          voice,
          rate: requestedRate,
          outPath: attemptPath,
          env: process.env,
          sceneId: "performance",
          verbose: options.verbose,
          timeoutMs: CONTINUOUS_REQUEST_TIMEOUT_MS,
          expectedPronunciations,
          allowVoiceSubstitution: voiceSource !== "flag",
          log: console.log,
        });
      } catch (error) {
        error.isProviderFailure = true;
        throw error;
      }

      const duration = Number.isFinite(result?.duration)
        ? result.duration
        : probeDuration(attemptPath);
      const measured = measurePace(attemptPath, performanceText);

      takes.push({
        attempt,
        path: attemptPath,
        duration,
        requestedRate,
        ...measured,
      });

      console.log(
        `[video] TTS pace performance: attempt ${attempt}/` +
          `${CONTINUOUS_MAX_ATTEMPTS} ${roundWpm(measured.wpm)} wpm ` +
          `(request ${requestedRate} wpm, target ${pace.targetWpm}).`,
      );

      if (isInPaceBand(measured.wpm, pace)) {
        break;
      }
    }

    const chosen = closestPace(takes, (take) => take.wpm, pace.targetWpm);
    const inBand = takes.some((take) => isInPaceBand(take.wpm, pace));

    fs.copyFileSync(chosen.path, performancePath);

    if (!inBand) {
      console.warn(
        `[video] TTS pace performance: no whole take inside ` +
          `${describeBand(pace)}; using the closest take at ` +
          `${roundWpm(chosen.wpm)} wpm.`,
      );
    }

    return {
      duration: chosen.duration,
      speechSeconds: chosen.speechSeconds,
      wordCount: chosen.wordCount,
      wpm: roundWpm(chosen.wpm),
      firstWpm: roundWpm(takes[0].wpm),
      attempts: takes.length,
      requestedRate: chosen.requestedRate,
      attemptRates: takes.map((take) => take.requestedRate),
      paceSamples: takes.map((take) => ({
        rate: take.requestedRate,
        wpm: roundWpm(take.wpm),
      })),
    };
  } finally {
    fs.rmSync(attemptDir, { recursive: true, force: true });
  }
}

/**
 * Turn aligned word times into cut boundaries. Each cut keeps the 30 ms lead
 * and 120 ms tail pads, clamped so it never reaches into a neighbouring scene
 * or beyond the mastered file.
 *
 * @param {Array<{ id: string, start: number, end: number }>} alignedScenes
 * @param {number} fileDuration
 * @returns {Array<{ start: number, end: number }>}
 */
function planContinuousCuts(alignedScenes, fileDuration) {
  const rawStarts = alignedScenes.map((scene) =>
    Math.max(0, scene.start - CONTINUOUS_LEAD_SECONDS),
  );
  const rawEnds = alignedScenes.map((scene) =>
    Math.min(fileDuration, scene.end + CONTINUOUS_TAIL_SECONDS),
  );
  const cuts = [];
  let previousEnd = 0;

  for (let index = 0; index < alignedScenes.length; index += 1) {
    const start = Math.max(rawStarts[index], previousEnd);
    const end = Math.min(
      rawEnds[index],
      index + 1 < alignedScenes.length ? rawStarts[index + 1] : fileDuration,
    );

    if (!(end > start)) {
      throw new Error(
        `Scene "${alignedScenes[index].id}": cut ` +
          `${start.toFixed(3)}–${end.toFixed(3)}s is empty after clamping to ` +
          `its neighbours.`,
      );
    }

    cuts.push({ start, end });
    previousEnd = end;
  }

  return cuts;
}

/**
 * Cut every scene from the staged performance and return the measured duration
 * of each cut WAV. Nothing is written to the run's audio directory here.
 *
 * @param {{ performancePath: string, outDir: string, narrated: object[], cuts: Array<{ start: number, end: number }> }} options
 * @returns {number[]}
 */
function writeContinuousCuts({ performancePath, outDir, narrated, cuts }) {
  const durations = [];

  fs.mkdirSync(outDir, { recursive: true });

  for (let index = 0; index < narrated.length; index += 1) {
    const cut = cuts[index];
    const outPath = path.join(outDir, `${narrated[index].id}.wav`);

    run("ffmpeg", [
      "-hide_banner",
      "-loglevel",
      "error",
      "-y",
      "-i",
      performancePath,
      "-af",
      `atrim=start=${cut.start.toFixed(6)}:end=${cut.end.toFixed(6)},` +
        "asetpts=PTS-STARTPTS",
      "-ar",
      "48000",
      "-ac",
      "1",
      "-c:a",
      "pcm_s16le",
      outPath,
    ]);
    durations.push(probeDuration(outPath));
  }

  return durations;
}

/**
 * Promote a fully validated staged run. Existing files are backed up first so
 * any I/O failure restores the previous take rather than leaving a mix of old
 * and new audio.
 *
 * @param {{ stagingDir: string, audioDir: string, narrated: object[], timings: object, timingsPath: string, stamp: object }} options
 */
function promoteStagedRun({
  stagingDir,
  audioDir,
  narrated,
  timings,
  timingsPath,
  stamp,
}) {
  const backupDir = path.join(audioDir, ".promote-backup");
  const stampPath = path.join(audioDir, "stamp.json");
  const names = [
    "performance.wav",
    ...narrated.map((scene) => `${scene.id}.wav`),
    "timings.json",
    "stamp.json",
  ];
  const existed = new Set();

  fs.rmSync(backupDir, { recursive: true, force: true });
  fs.mkdirSync(backupDir, { recursive: true });

  for (const name of names) {
    const source = path.join(audioDir, name);

    if (fs.existsSync(source)) {
      fs.copyFileSync(source, path.join(backupDir, name));
      existed.add(name);
    }
  }

  try {
    fs.renameSync(
      path.join(stagingDir, "performance.wav"),
      path.join(audioDir, "performance.wav"),
    );

    for (const scene of narrated) {
      fs.renameSync(
        path.join(stagingDir, `${scene.id}.wav`),
        path.join(audioDir, `${scene.id}.wav`),
      );
    }

    writeJsonAtomic(timingsPath, timings);
    writeJsonAtomic(stampPath, stamp);
  } catch (error) {
    for (const name of names) {
      const target = path.join(audioDir, name);

      if (existed.has(name)) {
        fs.copyFileSync(path.join(backupDir, name), target);
      } else {
        fs.rmSync(target, { force: true });
      }
    }

    throw error;
  } finally {
    fs.rmSync(backupDir, { recursive: true, force: true });
    fs.rmSync(stagingDir, { recursive: true, force: true });
  }
}

/**
 * Summarise the master and the cuts for the timings file and the run summary.
 *
 * @param {{ performanceDuration: number, performanceSpeechSeconds: number, performanceText: string, take: object, alignment: object, cuts: Array<{ start: number, end: number }>, cutDurations: number[] }} options
 * @returns {object}
 */
function summarisePerformance({
  performanceDuration,
  performanceSpeechSeconds,
  performanceText,
  take,
  alignment,
  cuts,
  cutDurations,
}) {
  const headTrim = cuts[0].start;
  const tailTrim = performanceDuration - cuts[cuts.length - 1].end;
  let interSceneGaps = 0;

  for (let index = 1; index < cuts.length; index += 1) {
    interSceneGaps += cuts[index].start - cuts[index - 1].end;
  }

  const segmentTotal = cutDurations.reduce(
    (total, duration) => total + duration,
    0,
  );
  const masterMinusGaps = performanceDuration - interSceneGaps;
  const masterMinusGapsAndTrim = masterMinusGaps - headTrim - tailTrim;

  return {
    duration: roundSeconds(performanceDuration),
    speechSeconds: roundSeconds(performanceSpeechSeconds),
    wordCount: countWords(performanceText),
    wpm: take.wpm,
    firstWpm: take.firstWpm,
    attempts: take.attempts,
    requestedRate: take.requestedRate,
    attemptRates: take.attemptRates,
    paceSamples: take.paceSamples,
    narratedSpan: roundSeconds(
      alignment.scenes[alignment.scenes.length - 1].end -
        alignment.scenes[0].start,
    ),
    interSceneGaps: roundSeconds(interSceneGaps),
    segmentTotal: roundSeconds(segmentTotal),
    headTrim: roundSeconds(headTrim),
    tailTrim: roundSeconds(tailTrim),
    masterMinusGaps: roundSeconds(masterMinusGaps),
    masterMinusGapsAndTrim: roundSeconds(masterMinusGapsAndTrim),
    reconstructionDelta: roundSeconds(segmentTotal - masterMinusGapsAndTrim),
  };
}

/**
 * Path to a WAV in the run's audio directory, relative to the video directory.
 *
 * @param {string} audioDir
 * @param {string} baseName
 * @returns {string}
 */
function relativeAudioFile(audioDir, baseName) {
  return path
    .relative(VIDEO_DIR, path.join(audioDir, `${baseName}.wav`))
    .split(path.sep)
    .join("/");
}

/**
 * @param {number} value
 * @returns {number}
 */
function roundSeconds(value) {
  return Math.round(value * 1000) / 1000;
}

/**
 * @param {number} value
 * @returns {number}
 */
function roundConfidence(value) {
  return Math.round(value * 1000) / 1000;
}

/**
 * Cache key for one continuous performance. The whole text, provider, voice,
 * rate, pace settings, alignment version and post-processing version are part
 * of the key.
 *
 * @param {string} text
 * @param {object} provider
 * @param {string} voice
 * @param {number} rate
 * @param {{ targetWpm: number, bandWpm: number, maxAttempts: number }} pace
 * @param {string} lexiconHash
 * @param {string} synthesisText
 * @returns {string}
 */
function hashPerformance(
  text,
  provider,
  voice,
  rate,
  pace,
  lexiconHash,
  synthesisText,
) {
  const speed =
    typeof provider.speedForRate === "function"
      ? provider.speedForRate(rate)
      : null;

  return crypto
    .createHash("sha256")
    .update(
      JSON.stringify({
        mode: "continuous",
        provider: provider.id,
        voice,
        rate,
        speed,
        pace,
        continuousPace: CONTINUOUS_PACE_VERSION,
        alignment: ALIGNMENT_VERSION,
        text,
        synthesisText,
        pronunciations: lexiconHash,
        pronunciationPlan: PRONUNCIATION_VERSION,
        postProcess: POST_PROCESS_VERSION,
      }),
    )
    .digest("hex");
}

/**
 * Synthesise one scene into a scratch take, measure its pace, and retry while
 * the take is outside the acceptable band. Retries follow a fixed ladder from
 * the run's default rate: a second take at the same rate first, then 10% and
 * 15% rate nudges in the needed direction. Re-rolling at the same rate can land
 * in band without changing the voice register; only a re-roll failure moves the
 * rate. The audio is never time-stretched. The take closest to the target is
 * promoted to the scene's WAV.
 *
 * @param {{ provider: object, voice: string, voiceSource: string, rate: number, text: string, paceText: string, sceneId: string, wavPath: string, audioDir: string, pace: { targetWpm: number, bandWpm: number, maxAttempts: number }, verbose: boolean, locked: boolean, expectedPronunciations: number }} options
 * @returns {Promise<{ duration: number, speechSeconds: number, wordCount: number, wpm: number, firstWpm: number, attempts: number, requestedRate: number, attemptRates: number[] }>}
 */
async function synthesiseWithPaceGuard({
  provider,
  voice,
  voiceSource,
  rate,
  text,
  paceText,
  sceneId,
  wavPath,
  audioDir,
  pace,
  verbose,
  locked,
  expectedPronunciations,
}) {
  const attemptDir = path.join(audioDir, ".pace");
  const takes = [];
  let direction = null;

  fs.mkdirSync(attemptDir, { recursive: true });

  try {
    for (let attempt = 1; attempt <= pace.maxAttempts; attempt += 1) {
      if (attempt >= 3 && direction === null) {
        direction = paceDirection(takes[takes.length - 1].wpm, pace.targetWpm);
      }

      const requestedRate = locked
        ? rate
        : clampRate(provider, ladderRate(rate, attempt, direction));
      const attemptPath = path.join(attemptDir, `${sceneId}-${attempt}.wav`);
      const result = await provider.synthesise({
        text,
        voice,
        rate: requestedRate,
        outPath: attemptPath,
        env: process.env,
        sceneId,
        verbose,
        expectedPronunciations,
        allowVoiceSubstitution: voiceSource !== "flag",
        log: console.log,
      });
      const duration = Number.isFinite(result?.duration)
        ? result.duration
        : probeDuration(attemptPath);
      const measured = measurePace(attemptPath, paceText);

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
 * Clamp a ladder rate to what the provider can honour before it is requested or
 * recorded. Deepgram rounds to its speed step and clamps to 0.5–1.5; say takes
 * whole words per minute. Rounding here keeps the logged and recorded rate
 * honest instead of naming a value the provider would silently move away from.
 *
 * @param {object} provider
 * @param {number} rate
 * @returns {number}
 */
function clampRate(provider, rate) {
  const clamped =
    typeof provider.clampRate === "function" ? provider.clampRate(rate) : rate;
  return Math.round(clamped);
}

/**
 * Reuse the pace recorded beside a cached take. Older cache entries that
 * predate the guard are measured from the WAV instead.
 *
 * @param {object} cached
 * @param {string} wavPath
 * @param {string} text
 * @returns {{ speechSeconds: number, wordCount: number, wpm: number, firstWpm: number, attempts: number, requestedRate: number | null, attemptRates: number[] }}
 */
function cachedPaceInfo(cached, wavPath, text) {
  const attempts = Number.isInteger(cached.attempts) ? cached.attempts : 1;
  const requestedRate = Number.isFinite(cached.requestedRate)
    ? cached.requestedRate
    : null;
  const attemptRates = Array.isArray(cached.attemptRates)
    ? cached.attemptRates
    : requestedRate === null
      ? []
      : [requestedRate];

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
      requestedRate,
      attemptRates,
    };
  }

  const measured = measurePace(wavPath, text);

  return {
    ...measured,
    firstWpm: measured.wpm,
    attempts,
    requestedRate,
    attemptRates,
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
 * @returns {{ scenarioId: string | null, provider: string | null, voice: string | null, rate: number, scene: string | null, lexicon: string | null, force: boolean, verbose: boolean, help: boolean }}
 */
function parseArgs(argv) {
  const options = {
    scenarioId: null,
    provider: null,
    voice: null,
    rate: DEFAULT_RATE,
    scene: null,
    lexicon: null,
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
      argument === "--scene" ||
      argument === "--lexicon"
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
      } else if (argument === "--lexicon") {
        options.lexicon = value;
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
 * @param {string} lexiconHash
 * @returns {string}
 */
function hashNarration(text, provider, voice, rate, pace, lexiconHash) {
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
        pronunciations: lexiconHash,
        pronunciationPlan: PRONUNCIATION_VERSION,
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
 * Load the shared pronunciation lexicon once per run. The explicit flag wins
 * over `VIDEO_TTS_LEXICON`, which wins over the repository default. A missing
 * or malformed file is fatal: silently narrating without the intended
 * pronunciations would be worse than stopping.
 *
 * @param {{ lexicon: string | null }} options
 * @returns {{ path: string, hash: string, lexicon: object }}
 */
function loadLexiconForRun(options) {
  const override = (
    options.lexicon ??
    process.env.VIDEO_TTS_LEXICON ??
    ""
  ).trim();
  const lexiconPath = override
    ? path.resolve(process.cwd(), override)
    : DEFAULT_LEXICON_PATH;

  if (!fs.existsSync(lexiconPath)) {
    throw new Error(
      `Pronunciation lexicon not found: ${lexiconPath}. ` +
        `Pass --lexicon <path> or set VIDEO_TTS_LEXICON.`,
    );
  }

  let lexicon;
  try {
    lexicon = loadLexicon(lexiconPath);
  } catch (error) {
    const message = oneLine(error.message);
    throw new Error(
      message.includes(lexiconPath) ? message : `${message} (${lexiconPath})`,
    );
  }

  const hash = crypto
    .createHash("sha256")
    .update(fs.readFileSync(lexiconPath))
    .digest("hex");

  console.log(
    `[video] TTS pronunciation lexicon: ` +
      `${path.relative(process.cwd(), lexiconPath)} ` +
      `(${lexicon.entries.length} entries, ${hash.slice(0, 12)}).`,
  );

  return { path: lexiconPath, hash, lexicon };
}

/**
 * Print the run's pronunciation outcome once. Overrides pin the request to
 * speed 1.0 on a speed-based provider; a non-1.0 caller rate is clamped and
 * warned about rather than sent, because Flux would reject the combination.
 *
 * @param {{ count: number, words: string[], locked: boolean, clamped: boolean, requestedRate: number, requestedSpeed: number | null, rate: number }} plan
 */
function logPronunciationPlan(plan) {
  if (plan.count === 0) {
    return;
  }

  const words = plan.words.join(", ");

  if (plan.locked && plan.clamped) {
    console.warn(
      `[video] TTS pronunciation: requested rate ${plan.requestedRate} wpm ` +
        `maps to speed ${plan.requestedSpeed}; clamping to ${plan.rate} wpm ` +
        `(speed 1.0) because overrides are present.`,
    );
  }

  console.log(
    `[video] TTS pronunciation: ${plan.count} override(s) applied ` +
      `(${words}); ` +
      (plan.locked ? "pace locked to speed 1.0." : "using respellings."),
  );
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

/**
 * Print the per-scene cuts and their alignment confidence. Per-scene pace is
 * information only in continuous mode; it never triggers a retry.
 *
 * @param {Array<{ id: string, duration: number, wpm?: number, attempts?: number, cached: boolean, confidence?: number }>} rows
 */
function printContinuousTable(rows) {
  let total = 0;

  console.log("\n[video] Scene durations");
  for (const row of rows) {
    total += row.duration;
    const pace = Number.isFinite(row.wpm)
      ? `  ${String(roundWpm(row.wpm)).padStart(3)} wpm`
      : "";
    const alignment = Number.isFinite(row.confidence)
      ? `  align ${Math.round(row.confidence * 100)}%`
      : "";
    const suffix = row.cached ? " (cached)" : "";
    console.log(
      `[video]   ${row.id.padEnd(18)} ${row.duration.toFixed(3)}s` +
        `${pace}${alignment}${suffix}`,
    );
  }

  console.log(
    `[video]   ${"total".padEnd(18)} ${total.toFixed(3)}s (${rows.length} scene(s))`,
  );
}

/**
 * One line for the whole take: overall pace, number of takes, and any scene
 * outside the band.
 *
 * @param {Array<{ id: string, wpm?: number }>} rows
 * @param {{ overallWpm: number, takeAttempts: number, paceSamples?: Array<{ rate: number, wpm: number }> }} continuous
 * @param {{ targetWpm: number, bandWpm: number }} pace
 */
function printContinuousSummary(rows, continuous, pace) {
  const outside = rows
    .filter((row) => !Number.isFinite(row.wpm) || !isInPaceBand(row.wpm, pace))
    .map((row) => `${row.id} ${roundWpm(row.wpm)} wpm`);
  const verdict = outside.length
    ? `outside band: ${outside.join(", ")}`
    : `all scenes within band (${describeBand(pace)})`;

  console.log(
    `[video] TTS pace: overall ${roundWpm(continuous.overallWpm)} wpm after ` +
      `${continuous.takeAttempts} take(s); ${verdict}.`,
  );

  const samples = (continuous.paceSamples ?? [])
    .map((sample) => `${sample.rate} → ${roundWpm(sample.wpm)}`)
    .join(", ");

  if (samples) {
    console.log(`[video] TTS pace samples (requested → measured): ${samples}.`);
  }
}

/**
 * Report how the cut segments relate to the mastered performance.
 *
 * @param {{ segmentTotal: number, narratedSpan: number, duration: number, interSceneGaps: number, headTrim: number, tailTrim: number, masterMinusGapsAndTrim: number, reconstructionDelta: number }} performance
 */
function printReconstructionSummary(performance) {
  console.log(
    `[video] TTS reconstruction: ${performance.segmentTotal.toFixed(3)}s of ` +
      `cut segments vs ${performance.narratedSpan.toFixed(3)}s narrated span; ` +
      `master ${performance.duration.toFixed(3)}s, gaps ` +
      `${performance.interSceneGaps.toFixed(3)}s, head ` +
      `${performance.headTrim.toFixed(3)}s, tail ` +
      `${performance.tailTrim.toFixed(3)}s; master − gaps − trim ` +
      `${performance.masterMinusGapsAndTrim.toFixed(3)}s, delta ` +
      `${performance.reconstructionDelta.toFixed(3)}s.`,
  );
}

/**
 * Print one line that makes the register spread auditable across the run: the
 * distinct requested rates and how many scenes used each, followed by whether
 * every scene landed inside the band.
 *
 * @param {Array<{ wpm?: number, requestedRate?: number }>} rows
 * @param {{ targetWpm: number, bandWpm: number }} pace
 */
function printPaceSummary(rows, pace) {
  const counts = new Map();

  for (const row of rows) {
    if (!Number.isFinite(row.requestedRate)) {
      continue;
    }
    counts.set(row.requestedRate, (counts.get(row.requestedRate) ?? 0) + 1);
  }

  const rates = [...counts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0] - right[0])
    .map(([rate, count]) => `${rate}×${count}`)
    .join(", ");
  const outside = rows.filter(
    (row) => !Number.isFinite(row.wpm) || !isInPaceBand(row.wpm, pace),
  );
  const verdict = outside.length
    ? `${outside.length} scene(s) outside band (${describeBand(pace)})`
    : `all within band (${describeBand(pace)})`;

  console.log(
    `[video] TTS pace: ${rows.length} scene(s), rates used ` +
      `${rates || "unknown"} — ${verdict}.`,
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
      "  --scene <id>       process one scene only (per-line path)",
      "  --lexicon <path>   pronunciation lexicon (default:",
      "                     scripts/video/narration/pronunciations.json)",
      "  --force            ignore the cache and regenerate",
      "  --verbose          log provider model and request identifiers",
      "",
      "Environment:",
      "  DEEPGRAM_API_KEY, DEEPGRAM_REGION, DEEPGRAM_BASE_URL",
      "  VIDEO_TTS_PROVIDER, VIDEO_TTS_VOICE, VIDEO_TTS_LEXICON",
      "  VIDEO_TTS_TARGET_WPM, VIDEO_TTS_PACE_BAND_WPM, VIDEO_TTS_MAX_ATTEMPTS",
      "",
      "A continuous-capable provider (Deepgram) synthesises the whole script",
      "once, then aligns and cuts it per scene. Other providers use per-line",
      "synthesis. A .env file in the repository root is loaded when present.",
      "Audio is written to scripts/video/work/audio/<id>/ with a timings.json",
      "file beside it. Run from the repository root.",
    ].join("\n"),
  );
}

main().catch((error) => {
  console.error(`[video] TTS failed: ${oneLine(error?.message ?? error)}`);
  process.exitCode = 1;
});
