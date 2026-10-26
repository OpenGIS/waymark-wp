// Timing bookkeeping for the video recorder.
//
// Sequence times are seconds measured from a single wall-clock origin, taken
// immediately before the recording page is created. The timeline is the source
// of truth for audio placement, captions and poster extraction.
"use strict";

import fs from "node:fs";
import path from "node:path";

/**
 * Round a duration to milliseconds.
 *
 * @param {number} value
 * @returns {number}
 */
export function roundSeconds(value) {
  return Math.round(value * 1000) / 1000;
}

/**
 * Create a timeline builder for one take.
 *
 * @param {{ id: string, viewport: { width: number, height: number }, startedAt: string }} options
 */
export function createTimeline({ id, viewport, startedAt }) {
  const scenes = [];
  const sceneIds = new Set();
  let posterAt = null;
  let video = null;

  return {
    id,
    startedAt,
    viewport,
    scenes,

    /**
     * Register a scene and its start time.
     *
     * @param {object} scene
     * @param {number} start
     */
    beginScene(scene, start) {
      if (sceneIds.has(scene.id)) {
        throw new Error(`Scene id "${scene.id}" is used more than once.`);
      }
      sceneIds.add(scene.id);

      const record = {
        id: scene.id,
        start: roundSeconds(start),
        end: null,
        action: scene.action,
        narration: scene.narration ?? "",
        audio: scene.audio ?? null,
        audioDuration: scene.audioDuration ?? null,
        audioOffset: 0,
        hold: scene.hold ?? null,
        actionEnd: null,
      };

      if (scene.action === "poster" || scene.poster === true) {
        record.poster = true;
      }

      scenes.push(record);

      return record;
    },

    /**
     * Record when a scene's action finished, before its hold. The value is
     * relative to the scene start.
     *
     * @param {string} sceneId
     * @param {number} at
     */
    markActionEnd(sceneId, at) {
      const record = scenes.find((scene) => scene.id === sceneId);
      if (!record) {
        throw new Error(
          `Cannot mark the action end of unknown scene "${sceneId}".`,
        );
      }

      record.actionEnd = roundSeconds(Math.max(0, at - record.start));

      return record;
    },

    /**
     * Record when the scene's narration starts, relative to the scene start.
     *
     * @param {string} sceneId
     * @param {number} offset
     */
    setAudioOffset(sceneId, offset) {
      const record = scenes.find((scene) => scene.id === sceneId);
      if (!record) {
        throw new Error(
          `Cannot set the audio offset of unknown scene "${sceneId}".`,
        );
      }

      record.audioOffset = roundSeconds(Math.max(0, offset));
    },

    /**
     * Record the silence held after the action.
     *
     * @param {string} sceneId
     * @param {number} seconds
     */
    setHold(sceneId, seconds) {
      const record = scenes.find((scene) => scene.id === sceneId);
      if (!record) {
        throw new Error(`Cannot set the hold of unknown scene "${sceneId}".`);
      }

      record.hold = roundSeconds(Math.max(0, seconds));
    },

    /**
     * Close a scene at an end time.
     *
     * @param {string} sceneId
     * @param {number} end
     */
    endScene(sceneId, end) {
      const record = scenes.find((scene) => scene.id === sceneId);
      if (!record) {
        throw new Error(`Cannot end unknown scene "${sceneId}".`);
      }

      record.end = roundSeconds(Math.max(record.start, end));
    },

    /**
     * Record the preferred poster frame at a scene start.
     *
     * @param {number} at
     */
    markPoster(at) {
      if (posterAt === null) {
        posterAt = roundSeconds(at);
      }
    },

    /**
     * Record the raw video details measured when the context closed.
     *
     * @param {{ path: string, duration: number | null, offset: number, wallClockDuration: number, difference: number | null }} info
     */
    setVideo(info) {
      video = { ...info };
    },

    /**
     * Plain serialisable representation.
     */
    toJSON() {
      return {
        id,
        startedAt,
        viewport,
        posterAt,
        scenes,
        video,
      };
    },

    /**
     * Write the timeline to disk.
     *
     * @param {string} filePath
     */
    write(filePath) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(
        filePath,
        `${JSON.stringify(this.toJSON(), null, 2)}\n`,
        "utf8",
      );
    },
  };
}
