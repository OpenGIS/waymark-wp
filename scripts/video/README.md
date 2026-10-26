# Video generation pipeline

## What this is

The video pipeline produces scenario-driven screen recordings for the documentation. Playwright drives a seeded, disposable WordPress instance; narration is synthesised per scene; ffmpeg assembles the delivery MP4. Scenarios and narration files are versioned inputs, so changes can be reviewed like code. The MP4, poster and captions are build artefacts.

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
  tts.mjs                   # narration -> per-scene audio
  build.mjs                 # narration bed, MP4, poster, captions, transcript, manifest
  validate.mjs              # read-only validation of committed assets and docs references
  scenarios/
    changing-basemaps.json
  narration/
    changing-basemaps.md
  lib/
    browser.mjs             # context, storage state, video lifecycle
    card.mjs                # self-contained title and end card documents
    cursor.mjs              # fake pointer and click ring
    framing.mjs             # admin-bar inset and element visibility guard
    highlight.mjs           # target outlines and backdrop
    poster.mjs              # replay poster crop and 2x PNG capture
    timeline.mjs            # performance.now() bookkeeping
    narration.mjs           # shared narration-file parser
    tts/
      index.mjs             # provider registry, resolution and fallback
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
    timeline.json
```

`changing-basemaps` is the pilot. It is the only scenario and narration pair committed; the remaining scenarios are outstanding.

`work/` is gitignored. It holds raw Playwright WebM, TTS audio, timelines and ffmpeg intermediates for the duration of a run. Nothing under `work/` is a deliverable.

A narration file is the authoritative script for its scenario when it exists. `record.mjs` and `tts.mjs` share the parser in `lib/narration.mjs`. The file provides one `## <scene-id>` heading per scene, with the spoken text beneath the heading. The headings must be in scenario order and must cover exactly the scenario's scene ids: the parser fails with a clear error if a scene id is missing, unused or out of order. `(no narration)` marks an intentional silent beat and is stored as an empty narration string. When no narration file exists, the scenario's inline `narration` fields are used.

## Scenario fields

A scenario is a JSON object with these top-level fields:

| Field                 | Required | Description                                                                                                                                                                                                                                     |
| --------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`                  | Yes      | Scenario identifier. It names the raw take, timeline and the matching narration file.                                                                                                                                                           |
| `title`               | No       | Human-readable title used in the recorder summary, MP4 metadata and manifest.                                                                                                                                                                   |
| `output`              | No       | Delivery MP4 path. Defaults to `docs/public/assets/video/<id>.mp4` when omitted.                                                                                                                                                                |
| `viewport`            | No       | Recording viewport. The pipeline is fixed at 1280x720; other values warn and are ignored.                                                                                                                                                       |
| `storageState`        | No       | Informational only. The recorder always uses the fixed path `scripts/video/work/auth/storage-state.json`, creates it on demand and ignores this value.                                                                                          |
| `mapSlug`             | No       | Seeded map slug resolved to a map id for `{{mapId}}` tokens. Defaults to `cape-scott-trail`.                                                                                                                                                    |
| `posterAt`            | No       | Fallback poster timestamp, in seconds or `HH:MM:SS`. The timeline marker wins; it is used for the video-frame comparison and for the fallback poster.                                                                                           |
| `pad`                 | No       | Default silence after narration, in seconds. Defaults to `0.5`; a scene's own `pad` overrides it.                                                                                                                                               |
| `audioAfterAction`    | No       | Wait for the scene's action to finish before starting narration. Defaults to `true`; a scene's own value overrides it.                                                                                                                          |
| `audioAfterActionMax` | No       | Longest delay, in seconds, between the scene start and the start of narration. Defaults to `1.5`; a scene's own value overrides it.                                                                                                             |
| `hideSelectors`       | No       | Array of CSS selectors to hide. Every matching element is hidden on every page load and again after each `goto`; a selector that matches nothing is ignored. Hiding preserves the element's layout box, so surrounding content does not reflow. |
| `scenes`              | Yes      | Ordered array of scene objects. Each scene has an `id` and an `action`; the remaining fields depend on the action.                                                                                                                              |

A scene may also carry an optional `caption`. Silent scenes with a caption get a WebVTT cue and a transcript entry; the text is wrapped in square brackets so it reads as a visual description rather than speech. A silent scene without a caption emits no cue.

The `card` action renders a self-contained 1280x720 title or end card and treats it as a real timeline scene. Its payload is a `card` object with a required `title` and optional `eyebrow` and `subtitle` strings. Every value is escaped, the document is set into the page with `page.setContent`, and it makes no network requests. A newline in a subtitle is rendered as a `<br>`; each segment is escaped separately and a space follows the break so the extracted text still reads continuously. Unknown keys inside `card` are rejected. A card scene should set `highlight: null` and `cursor: null`; see the action vocabulary in `VIDEOS.md` for the full list.

Cards use the Open GIS dark brand palette: `#000b00` background, `#e8f5ea` heading and eyebrow, `#eeeeee` subtitle, `#9bb0a3` muted footer and `#0dd70d` accent rule. The eyebrow pairs the inline Open GIS mark with the name in title case, never uppercased. All type uses the brand monospace stack, and a quiet `Waymark` wordmark sits at the bottom-left. The mark is read from `assets/img/ogis-logo-white.svg` at render time and inlined in white at 40x40 px with `shape-rendering: geometricPrecision`, `role="img"` and a `<title>Open GIS</title>` accessible name, so the card stays offline and self-contained.

Scene fields shared by all actions include `hold`, `pad`, `audioAfterAction`, `audioAfterActionMax`, `audioOffset`, `highlight`, `cursor`, `assert`, `poster`, `parkMouse`, `block` and `allowPartial`. `poster` marks the poster beat and may be `true` (defaults) or an object with `selector` (default `#waymark-map`), `aspect` (default `"16:9"`) and `pad` (default `0` CSS pixels). Unknown keys inside the object are rejected. After the take has stopped recording, the recorder replays the scenario up to that scene in a second, unrecorded 2x context, crops the configured element and writes a PNG under `work/poster/`. Keeping the replay outside the recording context means it adds wall-clock time to the run but never freezes a frame into the video. `audioAfterAction` and `audioAfterActionMax` override the scenario defaults for one scene. `audioOffset` (number, seconds) overrides the computed narration start for one scene, which is useful when the scene is already rendered at its start. `parkMouse: true` moves the real pointer to a neutral point in the blank centre of the WordPress admin bar at the start of the scene, clearing any hover-only affordance (for example the delete control revealed by hovering a repeatable row). It is opt-in and defaults to false because some scenes depend on hover remaining active, such as the Leaflet layers control, which collapses when the pointer leaves it. Every framing path measures the sticky admin bar and verifies that the target is fully inside the visible band after scrolling, so sticky admin chrome cannot clip the top of the target. A target that is already fully visible is not scrolled, so a control that is already in view never moves under the pointer. `scrollIntoView` centres the target and waits for layout to settle; `scrollTo` scrolls to the document top or bottom, or aligns a selector with the chosen `block`. `hover`, `click`, `fill`, `select`, `press` and `cursor: { "to": ... }` all use the same framing. Set `block` to `start`, `center` (the default) or `end` to choose the alignment. Set `allowPartial: true` when a target is deliberately taller than the viewport; the take logs a warning instead of failing. `cursor: null` hides the synthetic pointer overlay but does not move the real mouse; pair it with `parkMouse: true` when the final frame must also be free of hover state.

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
npm run video                     # tts, record, build and validate in order
npm run video:record -- scripts/video/scenarios/<id>.json
npm run video -- <id>             # full chain for another scenario
```

The same commands are available directly:

```sh
# Record a scenario to work/raw/<id>.webm and write work/timeline.json.
# Narration is read from narration/<id>.md when that file exists.
node scripts/video/record.mjs [scripts/video/scenarios/<id>.json]

# Synthesise per-scene narration. Writes work/audio/<id>/ and a timings.json
# that drives the recorder's holds.
node scripts/video/tts.mjs [<id>] [--provider <id>] [--voice <name>] \
  [--rate 175] [--scene <scene-id>] [--force] [--verbose]

# Build one video end to end from work/timeline.json and the narration
# timings. Writes the MP4, poster, WebVTT, transcript and manifest.
node scripts/video/build.mjs [<id>] [--no-encode] [--poster-at <time>]

# Validate the committed deliverables against the manifest and the docs.
# Read-only and offline.
node scripts/video/validate.mjs
```

All four scripts are implemented.

### Validation and warnings

`record.mjs` validates the whole scenario before it launches the browser: every scene's shared fields, each action's required fields and the action name itself. A malformed late scene therefore fails immediately instead of surfacing after earlier scenes have been recorded. Errors name the scene and use the same wording as the run-time checks, for example `Scene "open-editor": action "click" requires a non-empty string "selector" field.` An unknown action is rejected with `Scene "<id>": unknown action "<name>".`

Unrecognised scenario and scene keys produce a warning rather than an error, so a misspelled optional field such as `highlght` is visible without rejecting forward-compatible data. Legitimate keys, including `notes` and `caption`, are allowed.

When recording stops, the raw take is checked against the timeline end. After subtracting the recorded pre-warm offset, a take whose media ends more than 0.25 s before the timeline end warns that it may be truncated and quotes both durations. A take that covers the timeline, or runs longer, produces no warning.

### Build behaviour

`build.mjs` reads the scenario, `work/timeline.json` and `work/audio/<id>/timings.json`. It fails loudly when a narrated scene has no WAV, when a WAV is not listed in the timing file, when scene order differs, or when the narration text disagrees between the timeline and the timings.

- The narration bed is assembled at 48 kHz mono 16-bit PCM in `work/build/<id>/`. Each scene WAV is delayed to its timeline `start + audioOffset` and mixed over silence; it is not concatenated. The bed is padded or trimmed to the timeline total.
- The MP4 is encoded once: H.264 High, `yuv420p`, CRF 21, `slow`, lanczos scale to 1280x720, 30 fps, AAC 128 kbps 48 kHz stereo, `+faststart`, metadata stripped with a neutral title. The raw take is trimmed at the recorded pre-warm offset before encoding, so the delivered video starts at the timeline origin.
- The poster prefers the replay PNG at `work/poster/<id>.png`, captured at twice the device scale after the take has stopped recording, then cropped to the poster element. The build downscales it with lanczos to a 1280×720 JPEG. When the PNG is absent it falls back to a frame from the final MP4, so older takes and the legacy videos still build. The build reports which source it used, checks the replay against the video frame at the poster timestamp and warns when they diverge. The manifest records `posterSource` as `"replay"` or `"video"`.
- Captions are one cue per scene that has text. A narrated scene's cue runs from `start + audioOffset` to `start + audioOffset + audioDuration`, with the narration verbatim, so it spans the spoken audio and never appears before its sentence. A silent scene with an explicit `caption` gets a cue spanning the whole scene, from `start` to `end`, with the caption wrapped in square brackets. Timestamps are `HH:MM:SS.mmm`.
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

### Pace guard

A provider delivery is not trusted to land at a consistent pace. After synthesis and silence trimming, `tts.mjs` measures the spoken part of each take from its first to its last non-silent sample (the 30 ms lead and 120 ms tail pads are silent and therefore excluded), counts the words in the scene's narration text and computes words per minute.

Defaults are a **165 wpm target**, an acceptable band of **±20 wpm (145–185)** and at most **3 attempts per scene**. A take inside the band is kept immediately. An out-of-band take is re-requested at a native provider rate estimated from the measured pace; the estimate is deliberately damped (square root of the target/measured ratio) because provider speed quantisation can otherwise overshoot badly on a short line. The audio is never resampled or time-stretched. The take closest to the target wins, and when no attempt lands in band the run warns once and uses that closest take.

Each attempt and the chosen take are logged, for example:

```text
[video] TTS pace layers-control: attempt 1/3 201 wpm (request 175 wpm, target 165).
[video] TTS pace layers-control: attempt 2/3 172 wpm (request 158 wpm, target 165).
[video] TTS pace layers-control: 201 wpm → retry 172 wpm (target 165).
```

The guard is shared by every provider, so the local `say` fallback is measured the same way. The settings can be overridden per run:

| Environment variable      | Default | Meaning                                        |
| ------------------------- | ------- | ---------------------------------------------- |
| `VIDEO_TTS_TARGET_WPM`    | `165`   | Target pace in words per minute.               |
| `VIDEO_TTS_PACE_BAND_WPM` | `20`    | Acceptable distance either side of the target. |
| `VIDEO_TTS_MAX_ATTEMPTS`  | `3`     | Maximum takes requested for one scene.         |

The pace settings and the guard version are part of the cache key, so changing the target, band or attempt count regenerates takes instead of reusing one made for a different delivery.

### Deepgram

The provider uses Node's built-in `fetch`; there is no SDK. Each scene is one batch request:

```text
POST {DEEPGRAM_BASE_URL or region}/v2/speak
  ?model=<voice>&encoding=linear16&sample_rate=48000&container=wav&speed=<multiplier>
Authorization: Token <DEEPGRAM_API_KEY>
Content-Type: application/json

{"text":"..."}
```

The response is a complete 48 kHz mono 16-bit PCM WAV. It is written straight to a temporary file and then normalised to the delivery WAV with the same `loudnorm` step as the local voice. `bit_rate` is not sent with `linear16`.

- `DEEPGRAM_REGION` selects the endpoint: unset is `https://api.deepgram.com`; `eu`, `au` and `in` use the matching regional host.
- `DEEPGRAM_BASE_URL` overrides the whole base URL, which is useful for a local test server.
- Requests time out after 30 seconds. `408`, `429`, `500`, `502`, `503` and `504` are retried up to three attempts with exponential backoff and jitter, honouring `Retry-After` when present. `400`, `401`, `402`, `403`, `413` and `415` are fatal and do not retry.
- Each scene is limited to 2,000 characters. A longer line fails before the request and names the scene and the character count.
- Error bodies may be the legacy shape (`err_code`, `err_msg`), the modern shape (`category`, `message`, `details`), or plain text. The provider prints one readable line with the HTTP status and whichever fields exist.
- `--verbose` logs the `dg-model-name` and `dg-request-id` response headers. The same metadata is kept in `timings.json` where available.

Deepgram is a paid API: every uncached scene is a request. Check current pricing before a large run, and rely on the cache for reruns. Cloud audio is not guaranteed to be bit-identical across calls, so the cache is also what keeps an already-recorded take stable.

The repository loads `.env` from the root when it exists, using `process.loadEnvFile` inside a try/catch. It is never required and its contents are never logged. `.env.example` documents `DEEPGRAM_API_KEY`, `DEEPGRAM_REGION`, `DEEPGRAM_BASE_URL`, `VIDEO_TTS_PROVIDER`, `VIDEO_TTS_VOICE`, `VIDEO_TTS_TARGET_WPM`, `VIDEO_TTS_PACE_BAND_WPM` and `VIDEO_TTS_MAX_ATTEMPTS`; `.env` and its local variants are gitignored.

## Audio and holds

Narration defines timing. `tts.mjs` writes `work/audio/<id>/timings.json` with each narrated scene's text, WAV path, measured duration, speech duration, word count, measured pace, attempt count and the rates requested for each attempt, plus the guard settings, a SHA-256 cache hash and the provider metadata. The `say` provider keeps a raw `.aiff` beside the normalised 48 kHz mono 16-bit PCM WAV; the Deepgram response is written to a temporary WAV and removed after normalisation.

Narration starts after the action has settled, not at the scene start. For a narrated scene the recorder computes `audioOffset = min(actionEnd, audioAfterActionMax)` (or `0` when `audioAfterAction` is false), then holds until the scene reaches `audioOffset + audioDuration + pad`. `audioAfterAction` defaults to `true` and `audioAfterActionMax` to `1.5` seconds; both can be set at scenario level and overridden per scene. The cap matters for a `goto` that takes longer than the cap to load: the speech starts at the cap while the page is still settling, rather than waiting out the whole load. A scene's `audioOffset` overrides the computed value verbatim; use it to leave a deliberate beat on a scene that is already rendered when it starts, such as the pre-warmed opening.

`pad` defaults to `0.5` at scenario level and can be overridden per scene. A scene without audio (a silent beat such as `settle` or `outro`) uses its own `hold`, which defaults to `0`, and lasts `actionEnd + hold`; when `timings.json` is absent every scene uses its own `hold` and the recorder warns at the end of the run. The timeline records `audio`, `audioDuration`, `audioOffset`, `hold` and `actionEnd` for every scene. `hold` is the silence actually held after the action, so for a narrated scene it is smaller than `audioDuration` whenever the action overlaps the start of the narration.

Audio is cached by a SHA-256 over the text, provider id, resolved voice, rate, any provider speed multiplier, the pace settings and the pace-guard version. Switching provider, voice or delivery target therefore regenerates rather than reusing the wrong audio. Reruns reuse existing WAVs, `--force` regenerates everything and `--scene` regenerates one scene. `timings.json` records the provider, voice, rate, pace guard, model metadata and, when a fallback happened, the requested provider and the reason.

Before recording starts, `record.mjs` performs an unrecorded warm-up for a first `goto` scene, including the scenario's `waitForMap` settle. This removes cold start-up cost. It then puts the first scene on the recorded page before the timeline origin: a `goto` navigates to its URL and performs its wait, while a `card` is set into the page with `showCard`. The take therefore opens on the fully rendered first scene rather than the blank page. The pre-warm is recorded but skipped by the build using the timeline's `video.offset`. Warm-up is card-aware: a card target is local HTML, so the WordPress map wait is skipped even when the scenario contains `waitForMap` scenes. Neither warm-up runs between scenes, and a scenario whose first action is neither `goto` nor `card` is not pre-warmed.

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
