# Video generation pipeline

## What this is

The video pipeline produces scenario-driven screen recordings for the documentation. Playwright drives a seeded, disposable WordPress instance; narration is synthesised as one continuous performance when the provider supports word timestamps, then cut per scene, or per line for providers that do not; ffmpeg assembles the delivery MP4. Scenarios and narration files are versioned inputs, so changes can be reviewed like code. The MP4, poster and captions are build artefacts.

## Prerequisites

- Node 24 or newer.
- `ffmpeg` and `ffprobe` (`brew install ffmpeg`). `ffprobe` is used to read durations and stream metadata and to validate the delivered set.
- One narration provider:
  - macOS `say` and `afconvert` for the local fallback voice.
  - A Deepgram API key for Flux TTS. No SDK or extra dependency is needed. Set it in `.env` (see `.env.example`) or the environment.
- `wp-env`, installed with the project's dependencies.
- The plugin's Playwright dependency (`@playwright/test`).

## Directory layout

```text
scripts/video/
  README.md                 # setup, commands, prerequisites
  record.mjs                # Playwright launcher and scene runner
  tts.mjs                   # narration -> continuous performance or per-line audio and timings
  build.mjs                 # narration bed, MP4, poster, captions, transcript, manifest
  validate.mjs              # read-only validation of committed assets and docs references
  audit.mjs                 # measured QA on one delivered MP4
  doctor.mjs                # read-only preflight for one video
  new.mjs                   # scenario and narration scaffolder
  wp-env.video.json         # dedicated instance on port 11000
  scenarios/
    changing-basemaps.json
  narration/
    changing-basemaps.md
    pronunciations.json     # shared pronunciation lexicon
  lib/
    browser.mjs             # context, storage state, video lifecycle
    card.mjs                # self-contained title and end card overlays
    cursor.mjs              # fake pointer, click ring and fake caret
    framing.mjs             # admin-bar inset and element visibility guard
    highlight.mjs           # target outlines and backdrop
    poster.mjs              # replay poster crop and 2x PNG capture
    timeline.mjs            # performance.now() bookkeeping
    narration.mjs           # shared narration-file parser
    tts/
      index.mjs             # provider registry, resolution and fallback
      alignment.mjs         # script-to-STT word alignment and scene spans
      pace.mjs              # pace measurement, retry ladder and convergence
      pronounce.mjs         # lexicon loading and provider-ready rewriting
      pronunciation-plan.mjs # per-run overrides, counts and speed lock
      shared.mjs            # loudnorm, duration probing and executable helpers
      providers/
        say.mjs             # macOS say provider
        deepgram.mjs        # Deepgram Flux TTS provider
    audio.mjs               # narration bed assembly and ffmpeg helpers
    vtt.mjs                 # timeline + narration -> WebVTT and transcript
    manifest.mjs            # ffprobe metadata, SHA-256 and manifest merge
  work/                     # gitignored
    auth/storage-state.json
    audio/
    build/
    poster/
    raw/
    timeline-<id>.json
```

`changing-basemaps` is the pilot. It is the only scenario and narration pair committed; the remaining scenarios are outstanding.

Each take writes its own `work/timeline-<id>.json`. The id is part of the filename, so recording video B and then building video A cannot silently consume B's take. The build refuses a timeline whose `id` does not match the scenario id and names both ids in the error.

`work/` is gitignored. It holds raw Playwright WebM, TTS audio, timelines and ffmpeg intermediates for the duration of a run. Nothing under `work/` is a deliverable.

A narration file is the authoritative script for its scenario when it exists. `record.mjs` and `tts.mjs` share the parser in `lib/narration.mjs`. The file provides one `## <scene-id>` heading per scene, with the spoken text beneath the heading. The headings must be in scenario order and must cover exactly the scenario's scene ids: the parser fails with a clear error if a scene id is missing, unused or out of order. `(no narration)` marks an intentional silent beat and is stored as an empty narration string. When no narration file exists, the scenario's inline `narration` fields are used.

## Scenario fields

A scenario is a JSON object with these top-level fields:

| Field                 | Required | Description                                                                                                                                                                                                                                     |
| --------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`                  | Yes      | Scenario identifier. It names the raw take, timeline and the matching narration file.                                                                                                                                                           |
| `title`               | No       | Human-readable title used in the recorder summary, MP4 metadata and manifest.                                                                                                                                                                   |
| `version`             | No       | Optional version recorded verbatim as `scenarioVersion` in the manifest; otherwise a 12-character SHA-256 prefix of the scenario JSON.                                                                                                          |
| `output`              | No       | Delivery MP4 path. Defaults to `docs/public/assets/video/<id>.mp4` when omitted.                                                                                                                                                                |
| `viewport`            | No       | Recording viewport. The pipeline is fixed at 1280x720; other values warn and are ignored.                                                                                                                                                       |
| `storageState`        | No       | Informational only. The recorder always uses the fixed path `scripts/video/work/auth/storage-state.json`, creates it on demand and ignores this value.                                                                                          |
| `mapSlug`             | No       | Seeded map slug resolved to a map id for `{{mapId}}` tokens. Defaults to `cape-scott-trail`.                                                                                                                                                    |
| `posterAt`            | No       | Fallback poster timestamp, in seconds or `HH:MM:SS`. The timeline marker wins; it is used for the video-frame comparison and for the fallback poster.                                                                                           |
| `pad`                 | No       | Default silence after narration, in seconds. Defaults to `0.5`; a scene's own `pad` overrides it.                                                                                                                                               |
| `jcut`                | No       | Seconds to pull narration earlier. Defaults to `0`; a scene's own value overrides it. Must be between `0` and `2`. A J-cut is applied after the lead beat, so it can make `audioOffset` negative.                                               |
| `minHold`             | No       | Minimum time between the action settling and the scene end, in seconds. Defaults to `0.15`; a scene's own value overrides it. Prevents a short line plus a large `jcut` from ending a scene before its action has settled.                      |
| `audioAfterAction`    | No       | Wait for the scene's action to finish before starting narration. Defaults to `true`; a scene's own value overrides it.                                                                                                                          |
| `audioAfterActionMax` | No       | Longest delay, in seconds, between the scene start and the start of narration. Defaults to `1.5`; a scene's own value overrides it.                                                                                                             |
| `hideSelectors`       | No       | Array of CSS selectors to hide. Every matching element is hidden on every page load and again after each `goto`; a selector that matches nothing is ignored. Hiding preserves the element's layout box, so surrounding content does not reflow. |
| `scenes`              | Yes      | Ordered array of scene objects. Each scene has an `id` and an `action`; the remaining fields depend on the action.                                                                                                                              |

A scene may also carry an optional `caption`. Silent scenes with a caption get a WebVTT cue and a transcript entry; the text is wrapped in square brackets so it reads as a visual description rather than speech. A silent scene without a caption emits no cue.

The `card` action renders a self-contained 1280x720 title or end card and treats it as a real timeline scene. Its payload is a `card` object with a required `title` and optional `eyebrow` and `subtitle` strings. Every value is escaped, and the card is injected as a full-viewport Shadow DOM overlay over the already-loaded page rather than replacing the document, so it makes no network requests and `page.url()` keeps pointing at the real page. The page underneath is navigated, settled and painted before the overlay appears; removing the overlay reveals it without a reload. An opening or mid-take card is removed at the end of its scene, while a closing card stays over the current page until the take ends. A newline in a subtitle is rendered as a `<br>`; each segment is escaped separately and a space follows the break so the extracted text still reads continuously. Unknown keys inside `card` are rejected. A card scene should set `highlight: null` and `cursor: null`; see the action vocabulary in `VIDEOS.md` for the full list.

Cards use the Open GIS dark brand palette: `#000b00` background, `#e8f5ea` heading and eyebrow, `#eeeeee` subtitle, `#9bb0a3` muted footer and `#0dd70d` accent rule. The eyebrow pairs the inline Open GIS mark with the name in title case, never uppercased. All type uses the brand monospace stack, and a quiet `Waymark` wordmark sits at the bottom-left. The mark is read from `assets/img/ogis-logo-white.svg` at render time and inlined in white at 40x40 px with `shape-rendering: geometricPrecision`, `role="img"` and a `<title>Open GIS</title>` accessible name, so the card stays offline and self-contained.

Scene fields shared by all actions include `hold`, `pad`, `jcut`, `minHold`, `audioAfterAction`, `audioAfterActionMax`, `audioOffset`, `highlight`, `cursor`, `assert`, `poster`, `parkMouse`, `anonymous`, `block` and `allowPartial`. `poster` marks the poster beat and may be `true` (defaults) or an object with `selector` (default `#waymark-map`), `aspect` (default `"16:9"`) and `pad` (default `0` CSS pixels). Unknown keys inside the object are rejected. After the take has stopped recording, the recorder replays the scenario up to that scene in a second, unrecorded 2x context, crops the configured element and writes a PNG under `work/poster/`. Keeping the replay outside the recording context means it adds wall-clock time to the run but never freezes a frame into the video. `audioAfterAction` and `audioAfterActionMax` override the scenario defaults for one scene. A scene's `jcut` pulls its narration earlier by that many seconds and may produce a negative `audioOffset`; `minHold` sets the shortest post-action beat and defaults to `0.15` seconds. `audioOffset` (number, seconds) overrides the computed narration start for one scene, which is useful when the scene is already rendered at its start; an explicit `audioOffset` is not adjusted by `jcut`. `parkMouse: true` moves the real pointer to a neutral point in the blank centre of the WordPress admin bar at the start of the scene, clearing any hover-only affordance (for example the delete control revealed by hovering a repeatable row). It is opt-in and defaults to false because some scenes depend on hover remaining active, such as the Leaflet layers control, which collapses when the pointer leaves it. Every framing path measures the sticky admin bar and verifies that the target is fully inside the visible band after scrolling, so sticky admin chrome cannot clip the top of the target. A target that is already fully visible is not scrolled, so a control that is already in view never moves under the pointer. `scrollIntoView` brings the target into the inset viewport (centred by default) and waits for layout to settle; `scrollTo` scrolls to the document top or bottom, or aligns a selector with the chosen `block`. `hover`, `click`, `fill`, `select`, `press` and `cursor: { "to": ... }` all use the same framing. Set `block` to `start`, `center` (the default) or `end` to choose the alignment. Set `allowPartial: true` when a target is deliberately taller than the viewport; the take logs a warning instead of failing. `cursor: null` hides the synthetic pointer overlay but does not move the real mouse; pair it with `parkMouse: true` when the final frame must also be free of hover state.

### Anonymous scenes

| Field       | Type    | Description                                                                                                                                                                                                                                                                                                                                              |
| ----------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `anonymous` | boolean | Record the scene as a logged-out visitor. The recorder captures the authenticated cookies once, clears them in the same recording context before the scene's `goto`, and restores them before the next authenticated scene. Defaults to `false`. Playwright records video per context, so this is a cookie toggle in the one take, not a second context. |

The poster replay for an anonymous scene is anonymous too. A failed cookie restore stops the take rather than recording a logged-out admin scene, and pre-warm stays authenticated unless the first scene is anonymous.

## Ports

The video instance runs on **11000**. Ports **8888** and **8889** are the project's development and tests instances respectively. They must never be used for recording or seeding.

> [!WARNING]
> Never start, seed or record against 8888 or 8889. Recording mutates seed data and authentication state, and the demo seeder rewrites a fixture used by the test suite. Always pass `--config=scripts/video/wp-env.video.json`, which pins the video instance to port 11000.

## Bringing up the instance

Start the video instance from the repository root. The relative plugin source `"."` resolves to the plugin root only when commands run from there.

```sh
npx wp-env --config=scripts/video/wp-env.video.json start
```

Then activate the plugin, activate Twenty Twenty-Five and run the demo seeder:

```sh
npx wp-env --config=scripts/video/wp-env.video.json run cli \
  wp plugin activate waymark-wp

npx wp-env --config=scripts/video/wp-env.video.json run cli \
  wp theme activate twentytwentyfive

npx wp-env --config=scripts/video/wp-env.video.json run cli \
  wp eval-file wp-content/plugins/waymark-wp/tests/fixtures/demo/seed.php
```

> [!WARNING]
> The demo seeder writes `tests/fixtures/demo/seed-output.json` with URLs built from the target instance's home URL. Running it against the video instance overwrites the fixture used by the tests instance. Restore the file from version control or reseed the tests instance afterwards.

## Commands

Recording commands are run from the repository root. The scenario defaults to the pilot, `changing-basemaps`, when omitted. Only `record.mjs` reads `WP_BASE_URL`, which defaults to `http://localhost:11000`; `tts.mjs` and `build.mjs` do not use it. The build is offline and needs neither WordPress nor a browser.

The npm scripts mirror the CLIs and forward a scenario after `--`:

```sh
npm run video:tts
npm run video:record
npm run video:build
npm run video:validate
npm run video:audit
npm run video:doctor
npm run video:new -- <id>
npm run video                     # tts, record, build and validate in order
npm run video:record -- scripts/video/scenarios/<id>.json
npm run video -- <id>             # full chain for another scenario
```

The same commands are available directly:

```sh
# Record a scenario to work/raw/<id>.webm and write work/timeline-<id>.json.
# Narration is read from narration/<id>.md when that file exists.
node scripts/video/record.mjs [scripts/video/scenarios/<id>.json]

# Synthesise narration. Deepgram writes one performance and cuts it per scene;
# say uses the per-line fallback. Writes work/audio/<id>/ and a timings.json
# that drives the recorder's holds.
node scripts/video/tts.mjs [<id>] [--provider <id>] [--voice <name>] \
  [--rate 175] [--scene <scene-id>] [--lexicon <path>] \
  [--chunk-chars <n>] [--force] [--verbose]

# Build one video end to end from work/timeline-<id>.json and the narration
# timings. Writes the MP4, poster, WebVTT, transcript and manifest.
node scripts/video/build.mjs [<id>] [--no-encode] [--poster-at <time>]

# Validate the committed deliverables against the manifest and the docs.
# Read-only and offline.
node scripts/video/validate.mjs

# Measure one delivered MP4 and print a readable report. Add --json for
# machine-readable output, or --strict to fail on warnings.
node scripts/video/audit.mjs [<id>] [--json] [--strict]

# Run the read-only preflight. Nothing is written, reseeded or recorded.
node scripts/video/doctor.mjs [<id>]

# Scaffold a scenario and narration pair. Refuses to overwrite either file.
node scripts/video/new.mjs <id>
```

All seven scripts are implemented. `audit.mjs`, `doctor.mjs` and `new.mjs` do not touch WordPress.

### Scaffolding a new video

`new.mjs` writes a matching scenario and narration pair and refuses to overwrite either file:

```sh
npm run video:new -- using-collections
```

It validates the id (`^[a-z0-9]+(-[a-z0-9]+)*$`) and creates `scenarios/<id>.json` and `narration/<id>.md`. The skeleton has an opening `title` card, a `goto` scene, a deliberate `pause` and a closing `end` card. Every value that needs real content is a `<TODO>` placeholder: card copy, the page selector, the opening narration and the notes. The JSON carries the fields a real scenario needs (`version`, `id`, `title`, `output`, `viewport`, `storageState`, `mapSlug`, `posterAt`, `pad`, `hideSelectors`, `scenes`) with sensible defaults. The narration file already has one `## <scene-id>` heading per scene in scenario order, with `(no narration)` on the silent beats, so it is valid for `lib/narration.mjs` from the moment it is written.

Replace the placeholders before running the recorder. `doctor.mjs` treats the untouched `<TODO>` selector as valid syntax but the take will fail at run time when the selector does not match.

### Preflight

`doctor.mjs` is a read-only preflight for one id. It prints one `ok`, `warn` or `fail` line per check and exits non-zero only when something fails:

```sh
npm run video:doctor -- changing-basemaps
```

It checks:

- The recording instance at `WP_BASE_URL` (default `http://localhost:11000`) answers `/wp-json/` as a WordPress site and looks like the Waymark demo. It never probes 8888 or 8889.
- `work/auth/storage-state.json` exists and, when it does, the session is live at `/wp-admin/`. The check loads the admin page in headless Chromium without recording. An expired session fails with the exact file to delete and the command to run.
- The scenario and narration exist, their ids match, `record.mjs`'s eager validation passes and the narration heading contract holds.
- The scenario `mapSlug` resolves in `tests/fixtures/demo/seed-output.json`. A fixture whose permalinks point at a different port from the recording instance is a warning.
- The pinned tile pack under `tests/fixtures/demo/tiles/` reports the available zoom range per host and the covered latitude/longitude region. A scenario zoom that is not pinned for a host, or a map outside the covered region, is a warning.
- The manifest has an entry for the id, and the docs `video-figure` for the id has a `captions=` attribute whose file exists.
- Scenario, narration, audio directory, raw take, timeline and delivered MP4/poster/captions/transcript are present. Missing recorded or delivered assets are warnings, because a new video has not produced them yet.

Use it after scaffolding-and-authoring, again before recording, and after wiring the docs.

### Auditing a delivered video

`audit.mjs` measures the final MP4 rather than trusting the timeline metadata:

```sh
npm run video:audit -- changing-basemaps
npm run video:audit -- changing-basemaps --json
npm run video:audit -- changing-basemaps --strict
```

It decodes the audio to 48 kHz mono signed 16-bit, treats a sample as speech when `|s| > 300`, attributes speech to the timeline's scene windows and runs `silencedetect=noise=-40dB:d=0.45` as an independent cross-check. The report covers the container facts, per-scene speech and pace, inter-line gaps, the no-speech share, caption-to-onset offsets and warnings. Word counts are whitespace-separated tokens containing at least one letter or digit, so a spaced em dash is not a word; articulation pace removes internal silences at or above `--pause-threshold`.

Hard failures exit non-zero: a missing MP4, captions, transcript, poster or timeline; a timeline id that does not match; no speech at all; or overlapping caption cues. Warnings exit `0` unless `--strict` is passed.

Every threshold is a flag:

| Flag                       | Default | Meaning                                                  |
| -------------------------- | ------- | -------------------------------------------------------- |
| `--speech-level <n>`       | `300`   | Absolute sample level that counts as speech.             |
| `--pause-threshold <s>`    | `0.30`  | Shortest internal pause excluded from articulation pace. |
| `--gap-min <s>`            | `0.8`   | Minimum acceptable inter-line gap.                       |
| `--gap-max <s>`            | `1.5`   | Maximum acceptable inter-line gap.                       |
| `--gap-spread <ratio>`     | `1.8`   | Maximum ratio between the longest and shortest gap.      |
| `--caption-tolerance <s>`  | `0.25`  | Maximum cue-start difference from the measured onset.    |
| `--no-speech-max <pct>`    | `25`    | Maximum no-speech share, as a percentage.                |
| `--articulation-min <wpm>` | `110`   | Minimum per-scene articulation pace.                     |
| `--articulation-max <wpm>` | `210`   | Maximum per-scene articulation pace.                     |
| `--silence-noise <dB>`     | `-40`   | `silencedetect` noise floor.                             |
| `--silence-duration <s>`   | `0.45`  | `silencedetect` minimum silence.                         |

Run the audit after every build or rebuild. A `--strict` run is the gate to use before publishing.

### Adding a new video

The runbook is deliberately ordered. Do not record before the scenario and narration are settled.

1. **Scaffold** with `npm run video:new -- <id>`. This refuses to touch an existing scenario or narration file.
2. **Author the scenario.** Replace every `<TODO>` in `scripts/video/scenarios/<id>.json`: the title and output, the card copy, the real `goto` URL and selector, and the actual action scenes. Set `mapSlug`, `posterAt`, `pad` and `hideSelectors`. Keep one stable scene id per beat and keep the JSON free of comments.
3. **Author the narration.** In `scripts/video/narration/<id>.md`, keep exactly one `## <scene-id>` heading per scenario scene, in scenario order. Put the spoken text under each heading and `(no narration)` on silent beats. Use British English. If the scene list changes, update both files together.
4. **Run the preflight** with `npm run video:doctor -- <id>`. Fix every `fail`. Read every `warn`: the missing recorded and delivered assets are expected at this point, but the seed, auth and tile warnings are not.
5. **Synthesise narration** with `npm run video:tts -- <id>`. Check the pace summary and the provider warning. Re-run with `--force` after any narration edit; do not edit the generated WAVs.
6. **Record** with `npm run video:record -- scripts/video/scenarios/<id>.json`. The recorder refuses a take whose narration stamp is missing or stale; rerun the TTS command named in the error first. The take writes `work/raw/<id>.webm` and `work/timeline-<id>.json`. Check the recorder summary for zero request-guard violations and a video/wall-clock difference close to zero. Re-record after changing any action whose on-screen timing affects narration placement.
7. **Build** with `npm run video:build -- <id>`. This reads `work/timeline-<id>.json` and `work/audio/<id>/timings.json`, and writes the MP4, poster, captions, transcript and manifest entry.
8. **Audit** with `npm run video:audit -- <id>`, then with `--strict`. Investigate every warning: fix the narration or scenario and rebuild, or record a deliberate threshold override and say why in review.
9. **Validate** with `npm run video:validate`. It checks the committed assets against the manifest and every docs asset reference. Both must pass before the video is called rebuilt.
10. **Wire the docs.** Add `captions="/assets/video/captions/<id>.en.vtt"` to the matching `::video-figure` in `docs/content/`, and keep its `src` and `poster` paths on the same `/assets/video/...` convention. Update the inventory and status in `VIDEOS.md`, then run `npm run video:doctor -- <id>` once more to confirm the docs wiring is complete.

### Validation and warnings

`record.mjs` validates the whole scenario before it launches the browser: every scene's shared fields, each action's required fields and the action name itself. A malformed late scene therefore fails immediately instead of surfacing after earlier scenes have been recorded. Errors name the scene and use the same wording as the run-time checks, for example `Scene "open-editor": action "click" requires a non-empty string "selector" field.` An unknown action is rejected with `Scene "<id>": unknown action "<name>".`

Unrecognised scenario and scene keys produce a warning rather than an error, so a misspelled optional field such as `highlght` is visible without rejecting forward-compatible data. Legitimate keys, including `notes` and `caption`, are allowed.

When recording stops, the raw take is checked against the timeline end. After subtracting the recorded pre-warm offset, a take whose media ends more than 0.25 s before the timeline end warns that it may be truncated and quotes both durations. A take that covers the timeline, or runs longer, produces no warning.

### Build behaviour

`build.mjs` reads the scenario, `work/timeline-<id>.json` and `work/audio/<id>/timings.json`. It fails loudly when a narrated scene has no WAV, when a WAV is not listed in the timing file, when scene order differs, or when the narration text disagrees between the timeline and the timings.

- The narration bed is assembled at 48 kHz mono 16-bit PCM in `work/build/<id>/`. Each scene WAV is delayed to its timeline `start + audioOffset` and mixed over silence; it is not concatenated. A negative `audioOffset` is trimmed at the timeline origin rather than delaying the whole line. The bed is padded or trimmed to the timeline total.
- The MP4 is encoded once: H.264 High, `yuv420p`, CRF 21, `slow`, lanczos scale to 1280x720, 30 fps, AAC 128 kbps 48 kHz stereo, `+faststart`, metadata stripped with a neutral title. The raw take is trimmed at the recorded pre-warm offset before encoding, so the delivered video starts at the timeline origin.
- The poster prefers the replay PNG at `work/poster/<id>.png`, captured at twice the device scale after the take has stopped recording, then cropped to the poster element. The build downscales it with lanczos to a 1280×720 JPEG. When the PNG is absent it falls back to a frame from the final MP4, so older takes of the same scenario still build. The build reports which source it used, checks the replay against the video frame at the poster timestamp and warns when they diverge. The manifest records `posterSource` as `"replay"` or `"video"`.
- Captions are one cue per scene that has text. A narrated scene's cue runs from `start + audioOffset` to `start + audioOffset + audioDuration`, with the narration verbatim, so it spans the spoken audio and never appears before its sentence. A silent scene with an explicit `caption` gets a cue spanning the whole scene, from `start` to `end`, with the caption wrapped in square brackets. Timestamps are `HH:MM:SS.mmm`.
- The build refuses to emit overlapping cues: a cue that starts before the previous cue ends fails the build.
- The transcript is generated from the same cues, so it cannot drift from the captions.
- The manifest is keyed by video id and merged, so other videos are preserved.

Flags:

| Flag                 | Effect                                                                         |
| -------------------- | ------------------------------------------------------------------------------ |
| `--no-encode`        | Reuse the existing MP4; rebuild the poster, captions, transcript and manifest. |
| `--poster-at <time>` | Override the poster marker in seconds or `HH:MM:SS`.                           |

## Narration providers

`tts.mjs` resolves a provider before it synthesises anything:

1. `--provider <id>`.
2. `VIDEO_TTS_PROVIDER`.
3. Automatic: `deepgram` when `DEEPGRAM_API_KEY` is set, otherwise `say`.

The known providers are `say` (macOS) and `deepgram` (Flux TTS). A requested provider that is unavailable, or that fails fatally, produces one warning line and falls back to the next available provider. `say` is always the final fallback; if it is unavailable or fails, the run stops with a readable error. A synthesis failure restarts the whole run on the fallback provider, so one video never mixes voices.

```text
[video] TTS: deepgram unavailable (DEEPGRAM_API_KEY is not set); falling back to say (Daniel, en-GB).
```

Voice selection is `--voice` > `VIDEO_TTS_VOICE` > the provider default. The defaults are `flux-kit-en` for Deepgram and `Daniel` for `say`. The voice is resolved again if the run falls back, so the fallback uses a valid local voice.

`--rate` keeps its words-per-minute meaning. `say` receives it directly. Deepgram expects a speed multiplier, mapped linearly around the 175 wpm narration baseline: `speed = wpm / 175`, clamped to 0.5–1.5 and rounded to the nearest 0.05. The default 175 wpm therefore becomes 1.0; 140 wpm becomes 0.8 and 210 wpm becomes 1.2.

### Continuous performance

Deepgram has both synthesis and word-level speech-to-text, so it uses **one continuous performance** instead of one request per scene. `say` has no aligned transcript and keeps the per-line path. When the resolved provider cannot do continuous mode, the run logs one warning and uses per-line synthesis:

```text
[video] TTS: say has no word-timestamp alignment; using per-line synthesis (cadence may vary between lines).
```

1. The narration file is read in scenario order. Scenes marked `(no narration)` are skipped. The remaining scene texts are joined with a blank line. When the provider-ready text (after pronunciation rewriting) is within the chunk limit it is sent as one whole-script request through the provider's `synthesise()` path, starting at the run rate. When it is longer, the script is split at scene boundaries into the fewest chunks that fit and each chunk is requested separately (see [Long scripts](#long-scripts)).
2. The whole performance is written to `work/audio/<id>/performance.wav` as 48 kHz mono 16-bit PCM.
3. Silence trim (30 ms lead, 120 ms tail) and `loudnorm=I=-16:TP=-1.5:LRA=11` are applied **once** to the whole performance. Every scene cut comes from that mastered file, so the film has one gain structure and one register. A chunked performance is normalised per chunk and then joined into one master before the cut step.
4. The mastered WAV is sent as raw bytes to Deepgram STT (`/v1/listen`, `nova-3`, `smart_format=true`, `punctuate=true`). The known script is aligned to the returned word timestamps.
5. Each narrated scene is cut from the master. The cut starts 30 ms before its first aligned word and ends 120 ms after its last, clamped to the previous cut, the next cut and the file bounds.

#### Long scripts

Deepgram's batch TTS accepts at most **2,000 characters** of input `text`. Pronunciation overrides inflate that text (`{"word": ..., "pronounce": ...}`), so a script can reach the ceiling even when the authored narration is shorter. To keep headroom, the continuous path splits the provider-ready script at **scene boundaries** when it exceeds **1,800 characters**. It never cuts mid-sentence and uses the fewest chunks that fit. A script that already fits is still one request with the same cache key.

```text
[video] TTS chunks: 3 (limit 1800 chars) — boundaries after scene "create-form", "page-collection".
```

Override the limit with `--chunk-chars <n>` or `VIDEO_TTS_CHUNK_CHARS`; the flag wins. The value must be a whole number from **1 to 1,900**, so it stays comfortably below the provider's hard ceiling. A single scene longer than the limit cannot be split without cutting mid-sentence: it is sent as one request with a warning and remains subject to the 2,000-character limit.

Each chunk is normalised on its own. Joining the masters inserts 90 ms of silence at every seam; with the normal 120 ms tail and 30 ms lead, that recreates the roughly 240 ms paragraph pause the single-request path produces between scenes. Alignment, cut planning, staged promotion and stamping then run on the joined master unchanged, and the reconstruction summary still reports `delta 0.000s`.

The chunk plan (boundary scene ids and each chunk's text) is part of the performance cache key, so moving a boundary by changing the limit or editing the lexicon regenerates the take. A cache hit makes no request and leaves `timings.json` and `stamp.json` untouched. A pre-chunk single-request master (recorded before chunking existed) remains valid until it is next generated; after that its plan is recorded and later limit changes invalidate normally.

If any chunk fails, the run aborts instead of falling back to another provider. Staging is removed, the previous performance and scene WAVs are untouched, and the command exits non-zero:

```text
[video] TTS failed: TTS chunk 2/3 after scene "create-form" failed: HTTP 413: ...
```

Alignment is monotonic and forward-only. Both sides are lowercased, stripped of punctuation, whitespace-collapsed and the spaced em dash is dropped. Each script word is matched to the next STT word that equals it, with a three-token look-ahead for insertions and deletions. Short concatenations handle common STT differences such as `top-right` → `top right`, `Basemap` → `base map` and `Open Street Map` → `OpenStreetMap`; a conservative edit-distance match covers a misheard long word. A scene with no confident match, or a scene whose first word does not follow the previous scene, fails the run and names the scene and words. The run does not guess a cut point.

Per-scene durations, pace and alignment confidence are written to `timings.json`. Concatenating the cuts reconstructs the master minus the inter-scene gaps and the head/tail trim; the run prints the segment total, the narrated span and the exact reconstruction delta.

### Narration stamp

A successful run writes `work/audio/<id>/stamp.json`. It records the narration file and spoken-text hashes, the lexicon content hash, the provider and voice, the words-per-minute rate and provider speed, the pronunciation-plan version, the scene-duration map and a hash of `timings.json`. It is written only after valid audio and timings exist.

`record.mjs` validates the stamp before it launches the browser and refuses the take when the stamp is missing or the narration, lexicon, provider/voice or timing data no longer match. The failure is one line and exits non-zero:

```text
Narration audio is stale: the lexicon changed since it was generated. Run "npm run video:tts -- changing-basemaps" first.
```

A continuous run renders takes into a temporary staging directory, transcribes and aligns the kept take there, and only then promotes it to `performance.wav`, rewrites the scene WAVs and writes `timings.json` and the stamp. An alignment, provider or cut-planning failure removes the staging directory, leaves the previous take and timings in place and exits non-zero, so a stale or partial take can never be recorded as if it succeeded.

### Pace guard

The per-line path (the `say` fallback and an explicit `--scene`) measures each take separately. A provider delivery is not trusted to land at a consistent pace. After synthesis and silence trimming, `tts.mjs` measures the spoken part of each take from its first to its last non-silent sample (the 30 ms lead and 120 ms tail pads are silent and therefore excluded), counts the words in the scene's narration text and computes words per minute.

Defaults are a **165 wpm target**, an acceptable band of **±10 wpm (155–175)** and at most **4 attempts per scene**. A take inside the band is kept immediately.

An out-of-band take does not jump straight to a different rate. Retries follow a fixed ladder from the provider's default rate `R` (175 wpm unless `--rate` says otherwise):

| Attempt | Requested rate           | Purpose                                                                                                    |
| ------: | ------------------------ | ---------------------------------------------------------------------------------------------------------- |
|       1 | `R`                      | Normal take.                                                                                               |
|       2 | `R`                      | Re-roll: the provider is nondeterministic, so a fresh take can land differently without a register change. |
|       3 | `R × 0.9` or `R × 1.1`   | First rate nudge, in the needed direction (too fast → slower).                                             |
|       4 | `R × 0.85` or `R × 1.15` | Last resort, same direction.                                                                               |

A re-roll preserves the voice register; a rate change does not. The ladder therefore spends attempts on fresh generations before it asks the provider to speak at a measurably different rate. Every rate is clamped to what the provider can honour first: Deepgram rounds to its 0.05 speed step and clamps `speed` to 0.5–1.5, while `say` takes whole words per minute. The audio is never resampled or time-stretched. The take closest to the target wins, and when no attempt lands in band the run warns once and uses that closest take.

Each attempt and the chosen take are logged, for example:

```text
[video] TTS pace layers-control: attempt 1/4 181 wpm (request 175 wpm, target 165).
[video] TTS pace layers-control: attempt 2/4 168 wpm (request 175 wpm, target 165).
[video] TTS pace layers-control: 181 wpm → retry 168 wpm (target 165).
```

At the end of the run one summary line reports the distinct requested rates, so the register spread is visible at a glance:

```text
[video] TTS pace: 9 scene(s), rates used 175×7, 158×2 — all within band (155–175 wpm).
```

The guard is shared by every provider, so the local `say` fallback is measured the same way. The settings can be overridden per run:

| Environment variable      | Default | Meaning                                        |
| ------------------------- | ------- | ---------------------------------------------- |
| `VIDEO_TTS_TARGET_WPM`    | `165`   | Target pace in words per minute.               |
| `VIDEO_TTS_PACE_BAND_WPM` | `10`    | Acceptable distance either side of the target. |
| `VIDEO_TTS_MAX_ATTEMPTS`  | `4`     | Maximum per-line takes for one scene.          |

A configured attempt count above four repeats the last rung of the ladder. It applies to the per-line path; continuous mode always uses at most four whole takes. The pace settings and the guard version are part of the cache key, so changing the target, band or attempt count regenerates takes instead of reusing one made for a different delivery.

In continuous mode the **whole performance** is the unit of pace. It is measured from its first to its last non-silent sample and compared with the same 155–175 wpm band. Because a whole take is expensive and the provider's response is neither proportional nor well behaved, retries converge on the target by estimating the measured response rather than stepping a fixed ratio:

1. Take 1 uses the run rate `R`.
2. Take 2 uses the first-order estimate `R × target / measured` from take 1's requested rate, clamped by the provider.
3. Take 3 and later use a secant through the two sampled `(rate, wpm)` pairs that bracket the target, or through the two nearest pairs when the target is outside the sampled range: `nextRate = r1 + (target − w1) × (r2 − r1) / (w2 − w1)`. A nearly flat pair, or an estimate that repeats a rate already sampled, falls back to a 5% step in the needed direction.
4. The run stops as soon as a take lands inside the band. Otherwise the closest take is kept.

At most **4 whole takes** are requested. There is no same-rate re-roll and no per-scene nudge. Every rate is clamped to what the provider can honour before it is requested and recorded: Deepgram rounds to its 0.05 speed step and clamps `speed` to 0.5–1.5. The script is re-aligned and the cuts are regenerated from the kept take. Per-scene pace is information only.

The run ends with the overall pace, the number of takes, any scene outside the band and the sampled `(requested rate → measured wpm)` pairs:

```text
[video] TTS pace: overall 163 wpm after 3 take(s); all scenes within band (155–175 wpm).
[video] TTS pace samples (requested → measured): 175 → 183, 158 → 150, 166 → 163.
```

When no whole take lands inside 155–175 wpm, the closest take is kept and the summary reports the result; the run does not fail and does not fall back to per-line synthesis.

The delivered pilot is an example of the out-of-band outcome: four whole takes measured 204, 113, 139 and 151 wpm, so the closest take at 151 wpm was kept. Deepgram's `speed` grid advances in 0.05 steps, which puts the requested rates around the 165 wpm target at 158 and 166; 165 itself is not requestable. Repeated calls at the same setting also vary, so an in-band result is not guaranteed.

### Deepgram

The provider uses Node's built-in `fetch`; there is no SDK. In continuous mode the whole script is one batch request per take; the per-line fallback uses one request per scene:

```text
POST {DEEPGRAM_BASE_URL or region}/v2/speak
  ?model=<voice>&encoding=linear16&sample_rate=48000&container=wav&speed=<multiplier>
Authorization: Token <DEEPGRAM_API_KEY>
Content-Type: application/json

{"text":"..."}
```

The response is a complete 48 kHz mono 16-bit PCM WAV. It is written straight to a temporary file and then normalised to the delivery WAV with the same `loudnorm` step as the local voice. `bit_rate` is not sent with `linear16`.

After a continuous performance is mastered, the provider sends the WAV bytes to Deepgram STT for alignment:

```text
POST {DEEPGRAM_BASE_URL or region}/v1/listen
  ?model=nova-3&smart_format=true&punctuate=true
Authorization: Token <DEEPGRAM_API_KEY>
Content-Type: audio/wav
```

Word timestamps are read from `results.channels[0].alternatives[0].words[]`, with `results.utterances[]` accepted when that is what comes back. The transcript is used only to place cuts; it is never the delivered narration. The TTS request gets a longer 120-second timeout in continuous mode because the API can stream a whole-film response slowly; per-line requests keep the 30-second timeout.

- `DEEPGRAM_REGION` selects the endpoint: unset is `https://api.deepgram.com`; `eu`, `au` and `in` use the matching regional host.
- `DEEPGRAM_BASE_URL` overrides the whole base URL, which is useful for a local test server.
- Per-line requests time out after 30 seconds; a continuous TTS request uses 120 seconds. `408`, `429`, `500`, `502`, `503` and `504` are retried up to three attempts with exponential backoff and jitter, honouring `Retry-After` when present. `400`, `401`, `402`, `403`, `413` and `415` are fatal and do not retry.
- Each request is limited to 2,000 characters. The continuous path splits at scene boundaries when the provider-ready text exceeds the chunk limit (default 1,800, range 1–1,900), so a long script no longer fails with `413`/`text_too_long`. A per-line scene, an unsplittable single scene, or a chunk that still exceeds the hard limit fails before or at the request and names the scene and character count.
- Error bodies may be the legacy shape (`err_code`, `err_msg`), the modern shape (`category`, `message`, `details`), or plain text. The provider prints one readable line with the HTTP status and whichever fields exist.
- `--verbose` logs the `dg-model-name`, `dg-request-id`, `dg-pronunciations-applied` and `dg-warnings` response headers. The STT model and request id are recorded in the `alignment` block of `timings.json`.

Deepgram is a paid API: every uncached synthesis is a request — one per line in the per-line path, or up to four whole-performance takes in continuous mode. Check current pricing before a large run, and rely on the cache for reruns. Cloud audio is not guaranteed to be bit-identical across calls, so the cache is also what keeps an already-recorded take stable.

The repository loads `.env` from the root when it exists, using `process.loadEnvFile` inside a try/catch. It is never required and its contents are never logged. `.env.example` documents `DEEPGRAM_API_KEY`, `DEEPGRAM_REGION`, `DEEPGRAM_BASE_URL`, `VIDEO_TTS_PROVIDER`, `VIDEO_TTS_VOICE`, `VIDEO_TTS_TARGET_WPM`, `VIDEO_TTS_PACE_BAND_WPM` and `VIDEO_TTS_MAX_ATTEMPTS`; `.env` and its local variants are gitignored. `VIDEO_TTS_LEXICON` and `VIDEO_TTS_CHUNK_CHARS` are also read by `tts.mjs` when set.

### Pronunciation

`scripts/video/narration/pronunciations.json` is the shared lexicon. Each entry has a `display` name, one or more written `match` variants, British-English `ipa`, a plain-text `spoken` respelling and optional `say` phonemes and `notes`. Matching is whole-word, case-insensitive and longest-first, so `OpenTopoMap` wins over `topo` while `topography` is left alone. Add an entry by appending an object with at least a non-empty `match` array; keep the file valid JSON. The run loads the lexicon once and fails with one readable line when it is missing or malformed.

The lexicon rewrites only the synthesis text. The narration file, the display text stored in `timings.json`, captions and transcripts keep the authored spelling. Use `--lexicon <path>` or `VIDEO_TTS_LEXICON` to point at another file; the default is the repository lexicon.

Deepgram receives inline IPA objects such as `\{"word": "topo", "pronounce": "ˈtɒpəʊ"\}`, with the braces escaped exactly as shown. Unescaped braces are spoken aloud. The provider compares the `dg-pronunciations-applied` response header with the expected replacement count and warns, naming the scene, when it is zero or low; `--verbose` also surfaces `dg-warnings`.

Flux rejects pronunciation overrides combined with a speed other than 1.0 (`CONTROL_COMBINATION_INVALID`). A run with one or more replacements therefore pins every request to speed 1.0 and prints one line such as:

```text
[video] TTS pronunciation: 6 override(s) applied (topo, GeoJSON, GPX, KML, map_id, collection_id); pace locked to speed 1.0.
```

The continuous and per-line pace ladders still make up to four takes, but every take uses the locked rate and the closest to the target is kept. An explicit non-1.0 `--rate` with overrides is clamped to the speed-1.0 rate with a warning rather than sent. `say` receives the plain-text respellings because the Daniel voice reads phoneme blocks literally. Alignment still uses the authored display words, so the IPA object changes the pronunciation without changing what STT is expected to hear. The lexicon content hash is part of the cache key, so editing an IPA string regenerates the affected takes, and `timings.json` records a small `pronunciations` block with the total count and distinct words.

## Audio and holds

Narration defines timing. `tts.mjs` writes `work/audio/<id>/timings.json` with each narrated scene's text, WAV path, measured duration, speech duration, word count, measured pace, attempt count and the rates requested for each attempt, plus the guard settings, a SHA-256 cache hash and the provider metadata. The `say` provider keeps a raw `.aiff` beside the normalised 48 kHz mono 16-bit PCM WAV; the Deepgram response is written to a temporary WAV and removed after normalisation.

A continuous run keeps the same per-scene fields and adds `mode: "continuous"`, `performanceHash`, `overallWpm`, `takeAttempts`, `attemptRates`, `paceSamples` (the sampled requested-rate and measured-wpm pairs), a `chunks` block (count, limit, seam boundaries and per-chunk character counts), a `performance` block (master path, duration, narrated span, inter-scene gaps, head/tail trim and the reconstruction delta) and an `alignment` block. Each scene also carries an `alignment` object with its confidence, matched and unmatched word counts, first and last matched words and cut boundaries. The existing fields keep their names and meanings for the recorder, build and captions; `duration` remains the cut WAV's duration and `file` remains its path. In continuous mode `firstWpm`, `attempts` and `attemptRates` describe the whole take rather than a per-scene retry.

Narration starts after the action has settled, plus a fixed lead beat, minus any J-cut, not at the scene start. For a narrated scene the recorder computes:

```text
audioOffset   = scene.audioOffset
                ?? (audioAfterAction
                    ? min(actionEnd, audioAfterActionMax) + LEAD_BEAT - jcut
                    : 0)
durationFloor = actionEnd + minHold
sceneDuration = max(durationFloor, audioOffset + audioDuration + pad)
hold          = max(0, sceneDuration - actionEnd)
```

`LEAD_BEAT` is fixed at `0.3` seconds and guarantees a beat between the action settling and the voice starting. `audioAfterAction` defaults to `true` and `audioAfterActionMax` to `1.5` seconds; both can be set at scenario level and overridden per scene. The cap matters for a `goto` that takes longer than the cap to load: the speech starts at the cap while the page is still settling, rather than waiting out the whole load. A scene's explicit `audioOffset` overrides the computed value verbatim, is never adjusted by `jcut`, and is useful to leave a deliberate beat on a scene that is already rendered when it starts, such as the pre-warmed opening.

`jcut` defaults to `0`, can be set at scenario level and overridden per scene, and must be between `0` and `2` seconds. It pulls the narration earlier so a line can lead its own visual change and start inside the previous scene's tail air. Because it is subtracted after the lead beat, a `jcut` larger than `actionEnd + LEAD_BEAT` produces a negative `audioOffset`; that is intended. For example, with `actionEnd` at 0.5 s, `jcut` at 1.1 s, `audioDuration` at 6.0 s, `pad` at 0.5 s and `minHold` at 0.15 s, the offset is `min(0.5, 1.5) + 0.3 - 1.1 = -0.3` s: narration starts 0.3 s before the scene, the floor is 0.65 s, the audio plus pad reaches 6.2 s, so the scene lasts 6.2 s and holds for 5.7 s after the action.

`minHold` defaults to `0.15` seconds and can be set at scenario level or per scene. It stops a short line plus a large `jcut` from ending a scene before its own action has settled. After the take, `record.mjs` checks every negative offset against the previous narrated scene's absolute speech end and fails the run if the two overlap, since a J-cut must never land on the previous line.

`pad` defaults to `0.5` at scenario level and can be overridden per scene. A scene without audio (a silent beat such as `settle` or `outro`) uses its own `hold`, which defaults to `0`, and lasts `actionEnd + hold`; the `minHold` floor does not apply to silent scenes. When `timings.json` is absent every scene uses its own `hold` and the recorder warns at the end of the run. The timeline records `audio`, `audioDuration`, `audioOffset`, `jcut`, `minHold`, `hold` and `actionEnd` for every scene. `hold` is the silence actually held after the action, so for a narrated scene it is smaller than `audioDuration` whenever the action overlaps the start of the narration.

Audio is cached by a SHA-256 over the text, provider id, resolved voice, rate, any provider speed multiplier, the pace settings, the pace-guard version, the pronunciation plan version, the lexicon content hash and the post-processing version. A continuous performance also includes its mode, alignment version, whole-script text and, when it was split, the chunk plan (boundary scene ids and per-chunk text) in the key. Switching provider, voice, rate, speed, pronunciation or lexicon therefore regenerates rather than reusing the wrong audio. A cache hit makes no request and leaves `timings.json` and `stamp.json` byte-identical. Reruns reuse existing WAVs and `--force` regenerates everything. `--scene <id>` regenerates one scene on the per-line path; it requires compatible per-line cache entries for the other scenes, so after a continuous performance regenerate the whole run instead of mixing modes. `timings.json` records the provider, voice, rate, pace guard, model metadata, a `pronunciations` block, a `chunks` block for continuous runs and, when a fallback happened, the requested provider and the reason.

Before recording starts, `record.mjs` performs an unrecorded warm-up for a first `goto` or `card` scene, including the scenario's `waitForMap` settle. This removes cold start-up cost. It then puts the first scene on screen on the recorded page before the timeline origin: a `goto` navigates to its URL and performs its wait, while a `card` first navigates to the first non-card `goto` scene's URL, waits for its selector and the map, applies `hideSelectors`, and only then injects the card overlay. The take therefore opens on the fully rendered first scene rather than the blank page, and the page revealed when the card ends is already painted. The pre-warm is recorded but skipped by the build using the timeline's `video.offset`. Neither warm-up runs between scenes, and a scenario whose first action is neither `goto` nor `card` is not pre-warmed.

## Delivery paths

```text
docs/public/assets/video/<id>.mp4
docs/public/assets/video/posters/<id>.jpg
docs/public/assets/video/captions/<id>.en.vtt
docs/public/assets/video/transcripts/<id>.md
docs/public/assets/video/manifest.json
```

Posters are JPEG, 1280x720. The high-resolution source PNG is an intermediate under `scripts/video/work/poster/` and is not delivered. Captions use the `.en.vtt` language suffix and live in `captions/`; transcripts live in `transcripts/` as Markdown. The manifest is a single object keyed by video id, so adding a video merges its entry without touching the others.

Keep the `/assets/video/...` path convention: the docs resolve these paths through `withAssetBase`, so moving or renaming them breaks base-path handling.

## Determinism

A recording must reproduce the same frames and timings from the same scenario, narration, seed data and browser build.

- Use the pinned tile pack through `installTileRoutes`, which aborts missing tiles rather than falling back to the network.
- Keep the external-request guard installed so unpinned third-party requests fail loudly. The poster replay installs the same guard, storage state, deterministic reset and tile routes as the take, and fails the run if it records a violation.
- Emulate reduced motion.
- Use the deterministic page reset from `tests/e2e/fixtures.js`.

The tile record/replay policy is documented in `tests/e2e/README.md`. Record missing tiles deliberately and respect the upstream tile usage policies; never let a production recording depend on live tiles.

## What not to commit

- Raw Playwright WebM recordings.
- TTS audio and provider responses.
- ffmpeg intermediates.
- `storage-state.json`, `.env` and any credentials.
- Timelines and pipeline logs.

All of these belong in `scripts/video/work/`, which is gitignored.
