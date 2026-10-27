// WebVTT captions and the Markdown transcript derive from one timeline.
//
// A cue is emitted for every narrated scene. The cue starts when the audio
// starts (the scene start plus its audio offset) and spans the audio itself, so
// no caption appears before its sentence is spoken. A silent scene only gets a
// cue when the scenario supplies an explicit `caption`, which is written in
// square brackets so it reads as a visual description rather than speech.
"use strict";

/**
 * Format seconds as a WebVTT timestamp (`HH:MM:SS.mmm`).
 *
 * @param {number} seconds
 * @returns {string}
 */
export function formatTimestamp(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) {
    throw new Error(`Cannot format an invalid timestamp: ${seconds}.`);
  }

  const totalMilliseconds = Math.round(seconds * 1000);
  const hours = Math.floor(totalMilliseconds / 3_600_000);
  const minutes = Math.floor((totalMilliseconds % 3_600_000) / 60_000);
  const wholeSeconds = Math.floor((totalMilliseconds % 60_000) / 1000);
  const milliseconds = totalMilliseconds % 1000;

  return (
    `${String(hours).padStart(2, "0")}:` +
    `${String(minutes).padStart(2, "0")}:` +
    `${String(wholeSeconds).padStart(2, "0")}.` +
    `${String(milliseconds).padStart(3, "0")}`
  );
}

/**
 * Parse a scenario poster value. Accepts seconds or `HH:MM:SS(.mmm)`.
 *
 * @param {number | string | null | undefined} value
 * @returns {number | null}
 */
export function parseTimestamp(value) {
  if (typeof value === "number") {
    return Number.isFinite(value) && value >= 0 ? value : null;
  }

  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }

  const trimmed = value.trim();
  const clock = /^(\d+):([0-5]\d):([0-5]\d(?:\.\d+)?)$/.exec(trimmed);
  if (clock) {
    return Number(clock[1]) * 3600 + Number(clock[2]) * 60 + Number(clock[3]);
  }

  const seconds = Number(trimmed);
  return Number.isFinite(seconds) && seconds >= 0 ? seconds : null;
}

/**
 * Wrap a caption in square brackets unless the author already did.
 *
 * @param {string} caption
 * @returns {string}
 */
export function bracketCaption(caption) {
  const trimmed = caption.trim();
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    return trimmed;
  }
  return `[${trimmed}]`;
}

/**
 * Build one cue per scene that has text. Narrated scenes use the narration
 * verbatim; silent scenes use the scenario's explicit caption.
 *
 * @param {object} timeline
 * @param {object} scenario
 * @returns {Array<{ id: string, start: number, end: number, text: string, narration: string, caption: string | null }>}
 */
export function buildCues(timeline, scenario) {
  if (!Array.isArray(timeline.scenes)) {
    throw new Error("The timeline has no scenes array.");
  }

  const scenarioScenes = new Map(
    (scenario.scenes ?? []).map((scene) => [scene.id, scene]),
  );
  const cues = [];

  for (const scene of timeline.scenes) {
    const narration = (scene.narration ?? "").trim();
    const rawCaption = scenarioScenes.get(scene.id)?.caption;
    const caption =
      typeof rawCaption === "string" && rawCaption.trim() !== ""
        ? bracketCaption(rawCaption)
        : null;

    const text = narration || caption;
    if (!text) {
      continue;
    }

    if (!Number.isFinite(scene.start) || !Number.isFinite(scene.end)) {
      throw new Error(`Scene "${scene.id}" has no numeric start and end.`);
    }

    if (scene.end <= scene.start) {
      throw new Error(
        `Scene "${scene.id}" ends at ${scene.end}s, before it starts at ${scene.start}s.`,
      );
    }

    const audioOffset = Number.isFinite(scene.audioOffset)
      ? scene.audioOffset
      : 0;
    const hasAudio =
      Number.isFinite(scene.audioDuration) && scene.audioDuration > 0;
    const start = hasAudio ? scene.start + audioOffset : scene.start;
    const end = hasAudio ? start + scene.audioDuration : scene.end;

    cues.push({
      id: scene.id,
      start,
      end,
      text,
      narration,
      caption,
    });
  }

  return cues;
}

/**
 * Reject a cue set in which one cue starts before the previous cue ends. The
 * build refuses to emit overlapping captions rather than clamping or warning.
 *
 * @param {Array<{ id: string, start: number, end: number }>} cues
 */
export function assertNoCueOverlap(cues) {
  for (let index = 1; index < cues.length; index += 1) {
    const previous = cues[index - 1];
    const cue = cues[index];

    if (cue.start < previous.end) {
      throw new Error(
        `Captions overlap: cue "${cue.id}" starts at ` +
          `${cue.start.toFixed(3)}s, before "${previous.id}" ends at ` +
          `${previous.end.toFixed(3)}s.`,
      );
    }
  }
}

/**
 * Escape the characters that would otherwise be parsed as WebVTT markup or
 * break a cue. Cue text is always kept on one line.
 *
 * @param {string} text
 * @returns {string}
 */
export function escapeCueText(text) {
  return text
    .replace(/\r?\n/g, " ")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Render cues as a WebVTT document.
 *
 * @param {Array<{ id: string, start: number, end: number, text: string }>} cues
 * @returns {string}
 */
export function renderVtt(cues) {
  const blocks = ["WEBVTT"];

  for (const cue of cues) {
    blocks.push(
      [
        cue.id,
        `${formatTimestamp(cue.start)} --> ${formatTimestamp(cue.end)}`,
        escapeCueText(cue.text),
      ].join("\n"),
    );
  }

  return `${blocks.join("\n\n")}\n`;
}

/**
 * Render the Markdown transcript. Each scene with content appears under its
 * timecode so the transcript stays aligned with the video by construction. A
 * visual caption is kept alongside the narration when both exist.
 *
 * @param {{ title: string, cues: Array<{ start: number, end: number, narration: string, caption: string | null }> }} options
 * @returns {string}
 */
export function renderTranscript({ title, cues }) {
  const lines = [`# ${title}`, ""];

  for (const cue of cues) {
    const parts = [cue.narration, cue.caption].filter(Boolean);
    if (!parts.length) {
      continue;
    }

    lines.push(
      `**${formatTimestamp(cue.start)} – ${formatTimestamp(cue.end)}**`,
      "",
      parts.join("\n\n"),
      "",
    );
  }

  return `${lines.join("\n").trimEnd()}\n`;
}
