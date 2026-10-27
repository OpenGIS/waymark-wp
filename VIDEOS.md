# Videos

This is the reference document for the screencasts published with the Waymark documentation. The generation pipeline is implemented under `scripts/video/` and has been used to rebuild one video. `scripts/video/README.md` is the operational guide; this file records the inventory, the constraints on replacements, and the delivery state.

> [!WARNING]
> Only `changing-basemaps` has been rebuilt with the pipeline. The other seven videos are legacy manual captures: they have no editable source (scenario or narration), no captions, no transcript and no manifest entry. The pipeline is a local toolchain; CI validates committed assets but never generates them.

Scenarios, narration and build code live under `scripts/video/`. The delivered MP4s, posters, captions, transcripts and manifest live under `docs/public/assets/video/`. For a rebuilt video the tracked inputs are text; its MP4 and sidecars are build artefacts. For the seven legacy videos the committed MP4 is the only source.

## Current inventory

| Video                   | Status  |          Duration |    Size | Poster                  |
| ----------------------- | ------- | ----------------: | ------: | ----------------------- |
| `getting-started.mp4`   | Legacy  | 795.8 s (13:15.8) | 14.4 MB | `getting-started.jpg`   |
| `settings.mp4`          | Legacy  | 996.4 s (16:36.4) | 28.1 MB | `settings.jpg`          |
| `using-the-editor.mp4`  | Legacy  |  476.7 s (7:56.7) | 17.4 MB | `using-the-editor.jpg`  |
| `markers.mp4`           | Legacy  |  273.1 s (4:33.1) |  8.1 MB | `markers.jpg`           |
| `using-types.mp4`       | Legacy  |  253.1 s (4:13.1) |  5.7 MB | `using-types.jpg`       |
| `adding-map-meta.mp4`   | Legacy  |  171.3 s (2:51.3) |  5.3 MB | `adding-map-meta.jpg`   |
| `using-collections.mp4` | Legacy  |  161.0 s (2:41.0) |  3.8 MB | `using-collections.jpg` |
| `changing-basemaps.mp4` | Rebuilt |   89.7 s (1:29.7) |  5.0 MB | `changing-basemaps.jpg` |

| Set         |                Duration |    Size |
| ----------- | ----------------------: | ------: |
| Legacy (7)  | **3,127.5 s (52:07.5)** | 82.8 MB |
| Rebuilt (1) |     **89.7 s (1:29.7)** |  5.0 MB |
| **Total**   | **3,217.3 s (53:37.3)** | 87.8 MB |

Per-file figures are rounded to one decimal place. Totals are calculated from the files before rounding, so a total can differ by a tenth from the sum of the rounded rows. Sizes are rounded mebibytes, labelled MB.

All eight are 1280×720 H.264 High, yuv420p, with AAC LC 48 kHz audio. The seven legacy files are 25 or 29.97 fps with mono audio at 59–65 kbps. The rebuilt pilot is 30 fps with stereo 128 kbps audio and `+faststart`; its MP4 is 89.749 s, 5,234,884 bytes (4.99 MB) and 466,622 b/s overall, and the manifest records the duration and size exactly. The pilot has 13 scenes: it opens on a typographic title card and closes on a typographic end card. Posters are 1280×720 JPEG.

The pilot’s narration is one continuous Deepgram Flux performance at `flux-kit-en`, aligned with Deepgram STT (`nova-3`) and cut into nine scene WAVs. The cuts total 74.095 s and 190/190 script words match; the overall pace is 151 wpm — outside the 155–175 wpm guard band.

### Placement

- `docs/content/index.md` lines 15–28 contain the six-video “Getting Started” grid: `getting-started`, `using-the-editor`, `using-types`, `changing-basemaps`, `using-collections` and `adding-map-meta`.
- `docs/content/customising/markers.md` line 6 contains the `markers` video.
- `docs/content/customising/settings.md` line 6 contains the `settings` video.

The grid is wrapped by `docs/app/components/content/VideoGrid.vue`; individual videos are rendered by `docs/app/components/content/VideoFigure.vue`. The rebuilt video is the only one with a `captions` attribute in the docs content.

### Playback and base path

`VideoFigure.vue` renders a native `<video controls playsinline preload="metadata">` element with the supplied poster. It has an optional `captions` prop that accepts either a path string or an array of `{ src, srclang, label, default }` objects. A string becomes one English track marked default; an array is rendered as multiple `<track kind="captions">` elements. Both the string and the array forms are resolved through `withAssetBase`.

The other seven videos pass no `captions` prop, so they emit no `<track>` element.

The source, poster and caption paths are resolved through `withAssetBase` (`docs/app/utils/assets.ts:42-54`). A path such as `/assets/video/getting-started.mp4` therefore resolves correctly whether the documentation is served from `/` or `/waymark-wp/`. Keep the `/assets/video/...` convention when adding or replacing files; otherwise the deployed docs will break under the base path.

### Legacy status and poster frames

The seven legacy posters show the 2019–2021 WordPress admin and front-end UI with the old red Waymark “W” branding. None shows the current dark OGIS admin styling. Four are full admin captures, two are split composites, and one is a pure front-end capture. No legacy poster is blank or corrupt.

The rebuilt `changing-basemaps` poster is different: it is a 2× replay capture during the Open Topo Map hold, cropped around the map and its layers panel with the highlight outline preserved and no synthetic cursor. The delivered JPEG is 1280×720 from a 1504×846 crop, taken from the poster marker at 52.214 s. It shows the current admin rather than the old capture and is sharper than a frame lifted from the H.264 stream.

The following observations are inferences from the seven legacy poster frames, not a full shot list. The underlying recordings have not been transcribed.

| Video               | Poster frame (inference)                                                                                                                                                                                |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `getting-started`   | WP admin “Edit Map” for “Our Test Map”; Map Editor metabox; red-outlined polygon over Isle René-Levasseur; left editing toolbar with red W; Publish box and Map Shortcode panel.                        |
| `using-the-editor`  | WP admin Edit Map; marker edit popover with Photo type, Marker Title, image upload and Marker Description; blue line and red arrow shape; Publish box.                                                  |
| `using-types`       | Front-end “Seal Bay Park” map; red/blue lines, green bike markers, blue droplet marker, “Footpath” hover label; Thunderforest/OSM attribution.                                                          |
| `using-collections` | Waymark → Collections admin; create-collection form; “Island Rides” row, Count 2, truncated shortcode; standard WP table.                                                                               |
| `adding-map-meta`   | WP admin Edit Map for “Trent River Loop”; map; Collections box with “Island Rides” and “Courtenay” checked; Publish box.                                                                                |
| `markers`           | Split composite: Settings/Marker Types list (Camp, Beer, Water; icon types and colours) and front-end “Route Map” popup “The Scarlet Ibis” with photo and description.                                  |
| `settings`          | Split composite: Settings tabs Basemaps/Markers/Lines/Shapes/Meta/Misc, Marker Types rows Photo/Water, old first-person “Hi, I’m …” sidebar; front-end “Waypoint” page with green route and GPX export. |

Because the current admin uses the OGIS design rather than the old red branding, the seven legacy videos need re-recording before they can represent the current plugin.

## 1. Goals and constraints

The generated set should be:

- **Deterministic.** The same scenario, narration, seed data and browser version produce the same frames and timings. Map tiles, fonts and third-party assets must be pinned or stubbed.
- **Repeatable.** A short sequence of commands rebuilds a video from its scenario and narration without manual video editing.
- **Reviewable.** Scenarios and narration are text files under version control, so changes can be reviewed like code. The final MP4 is a build artefact.
- **Accessible.** Every rebuilt video has captions and a transcript, keyboard-accessible native controls and sufficient contrast. Visual actions are described, not only spoken.
- **Compatible with the current docs.** Delivery stays at `docs/public/assets/video/<id>.mp4` with a poster at `docs/public/assets/video/posters/<id>.jpg`, captions at `docs/public/assets/video/captions/<id>.en.vtt`, a transcript at `docs/public/assets/video/transcripts/<id>.md` and an entry in `docs/public/assets/video/manifest.json`, so `VideoFigure` and the base-path resolution continue to work unchanged.

Operational constraints:

- **Never use the development instance on ports 8888 or 8889.** Recording and seeding run against a dedicated, disposable wp-env instance on port 11000 (`scripts/video/wp-env.video.json`, `autoPort: false`). `record.mjs` refuses a `WP_BASE_URL` whose port is 8888 or 8889. The project’s Playwright config refuses `:8888` (`playwright.config.js:13-17`), and the demo seeder refuses it too (`tests/fixtures/demo/seed.php:42-45`). The 8889 tests instance is also off-limits by policy; the code guards are not a substitute for that rule.
- **Generate locally.** Recording needs a disposable WordPress instance, a pinned browser, a narration provider (macOS `say` or Deepgram) and ffmpeg. CI validates committed metadata and assets only; it never records, synthesises or encodes.
- **Do not commit raw intermediates.** Raw WebM, TTS audio, timelines and ffmpeg intermediates belong in `scripts/video/work/`, which is gitignored. Nothing under `work/` is a deliverable.
- **Commit the delivery files.** The MP4s stay in the repository rather than using external hosting. Consider Git LFS only if the delivered set grows substantially.

## 2. Pipeline layout

The pipeline is implemented. Generation inputs and build outputs are kept separate:

```text
scripts/video/
  README.md                 # setup, commands, prerequisites
  record.mjs                # Playwright launcher and scene runner
  tts.mjs                   # narration -> continuous performance or per-line audio and timings
  build.mjs                 # narration bed, MP4, poster, captions, transcript, manifest
  validate.mjs              # committed-asset and docs-reference validator
  audit.mjs                 # measured QA on one delivered MP4
  doctor.mjs                # read-only preflight for one video
  new.mjs                   # scenario and narration scaffolder
  wp-env.video.json         # dedicated instance on port 11000
  scenarios/
    changing-basemaps.json
  narration/
    changing-basemaps.md
  lib/
    browser.mjs             # context, storage state, video lifecycle, pre-warm
    card.mjs                # self-contained title and end card overlays
    cursor.mjs              # fake pointer, click ring and fake caret
    framing.mjs             # admin-bar inset and element visibility guard
    highlight.mjs           # target outlines
    poster.mjs              # replay poster crop and 2x PNG capture
    timeline.mjs            # scene timing bookkeeping
    narration.mjs           # shared narration-file parser
    tts/
      index.mjs             # provider registry, resolution and fallback
      alignment.mjs         # script-to-STT word alignment and scene spans
      pace.mjs              # pace measurement, retry ladder and convergence
      shared.mjs            # loudnorm, duration probing and executable helpers
      providers/
        say.mjs             # macOS say provider
        deepgram.mjs        # Deepgram Flux TTS provider
    audio.mjs               # narration bed assembly and ffmpeg helpers
    vtt.mjs                 # timeline + narration -> WebVTT and transcript
    manifest.mjs            # ffprobe metadata, SHA-256 and manifest merge
  work/                     # gitignored
    auth/storage-state.json
    audio/<id>/             # provider takes, normalised .wav files, timings.json
    build/<id>/             # assembled narration bed
    poster/<id>.png         # 2x replay capture for the delivery poster
    raw/<id>.webm
    timeline-<id>.json      # one take, one id; never shared between videos
```

Only the pilot’s scenario and narration exist today. Add a scenario and its narration when a video is rebuilt.

Delivery remains:

```text
docs/public/assets/video/<id>.mp4
docs/public/assets/video/posters/<id>.jpg
docs/public/assets/video/captions/<id>.en.vtt
docs/public/assets/video/transcripts/<id>.md
docs/public/assets/video/manifest.json
```

The root `.gitignore` contains `scripts/video/work/`, `.env` and its local variants. `scripts/video/work/` holds the raw Playwright WebM, TTS audio, timelines and ffmpeg intermediates for the duration of a run. Nothing in it is committed. `.env.example` is tracked and documents the narration environment.

## 3. Scenario script schema

A scenario is a JSON file with a top-level video definition and an ordered list of scenes. The recorder resolves template tokens such as `{{baseURL}}` and `{{mapId}}` at runtime; it does not hard-code instance URLs. `mapId` is resolved from the seeded map matching `mapSlug` in `tests/fixtures/demo/seed-output.json`.

A narration file at `scripts/video/narration/<id>.md` is the authoritative script for its scenario when it exists. It provides one `## <scene-id>` heading per scene, in scenario order, with the spoken text beneath. `(no narration)` marks an intentional silent beat. The parser fails if a scene id is missing, unused or out of order. When no narration file exists, the scenario’s inline `narration` fields are used.

`tts.mjs` writes `work/audio/<id>/stamp.json` only after a successful run. The stamp records hashes of the narration file and spoken text, the lexicon content, the provider and voice, the rate/speed policy, the pronunciation-plan version and the scene-duration map, plus a hash of `timings.json`. `record.mjs` validates it before starting the browser; a missing stamp or any mismatch, such as an edited narration line or lexicon, fails with one line naming the change and telling the operator to rerun `npm run video:tts -- <id>`. A continuous run also stages, transcribes and aligns a take before promoting it, so a failed run exits non-zero without replacing the previous performance, scene WAVs or timings.

### Top-level fields

| Field                 | Type             | Required | Purpose                                                                                                                                                                        |
| --------------------- | ---------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `id`                  | string           | yes      | Stable identifier; names the raw take, timeline, narration file and delivery basename.                                                                                         |
| `title`               | string           | no       | Human-readable title for the recorder summary, MP4 metadata and manifest.                                                                                                      |
| `version`             | string           | no       | Optional version stored verbatim as `scenarioVersion` in the manifest; otherwise a 12-character SHA-256 prefix of the scenario JSON.                                           |
| `output`              | string           | no       | Delivery MP4 path, relative to the repository root. Defaults to `docs/public/assets/video/<id>.mp4`.                                                                           |
| `viewport`            | object           | no       | `{ "width": 1280, "height": 720 }`. The pipeline is fixed at 1280×720; other values warn and are ignored.                                                                      |
| `storageState`        | string           | no       | Documentation only at present. The recorder uses the fixed `scripts/video/work/auth/storage-state.json` and creates it if it is missing.                                       |
| `mapSlug`             | string           | no       | Seeded map slug resolved to a map id for `{{mapId}}`. Defaults to `cape-scott-trail`.                                                                                          |
| `posterAt`            | string or number | no       | Fallback poster timestamp, `HH:MM:SS` or seconds. A timeline poster marker wins over it.                                                                                       |
| `pad`                 | number           | no       | Default silence after narration, in seconds. Defaults to `0.5`; a scene’s own `pad` overrides it.                                                                              |
| `jcut`                | number           | no       | Seconds to pull narration earlier. Defaults to `0`; a scene’s own value overrides it. Between `0` and `2`; applied after the lead beat, so it can make `audioOffset` negative. |
| `minHold`             | number           | no       | Shortest post-action beat in seconds. Defaults to `0.15`; a scene’s own value overrides it.                                                                                    |
| `audioAfterAction`    | bool             | no       | Wait for the scene’s action to finish before starting narration. Defaults to `true`; a scene’s own value overrides it.                                                         |
| `audioAfterActionMax` | number           | no       | Longest delay, in seconds, between the scene start and the start of narration. Defaults to `1.5`; a scene’s own value overrides it.                                            |
| `hideSelectors`       | array            | no       | CSS selectors hidden on every page load and again after each `goto`. A selector that matches nothing is ignored. Hiding uses `visibility: hidden`, so layout is unchanged.     |
| `scenes`              | array            | yes      | Ordered scene objects. Each scene needs an `id` and an `action`; the remaining fields depend on the action.                                                                    |

### Scene fields

| Field                 | Type           | Purpose                                                                                                                                                                                                                                                                                                                       |
| --------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`                  | string         | Stable scene identifier; used for audio filenames, captions and the timeline.                                                                                                                                                                                                                                                 |
| `action`              | string         | Action from the vocabulary below.                                                                                                                                                                                                                                                                                             |
| `narration`           | string         | Inline narration. Overridden by the narration file when one exists. May be empty.                                                                                                                                                                                                                                             |
| `caption`             | string         | Visual description. A silent scene may carry one, which emits a bracketed WebVTT cue spanning the whole scene; with narration, the caption is included in the transcript alongside the speech.                                                                                                                                |
| `hold`                | number         | Silent-scene hold in seconds. Narrated scenes use the audio-derived hold when `timings.json` exists.                                                                                                                                                                                                                          |
| `pad`                 | number         | Per-scene silence after narration, overriding the scenario `pad`.                                                                                                                                                                                                                                                             |
| `jcut`                | number         | Per-scene J-cut in seconds, overriding the scenario `jcut`. Pulls narration earlier and may produce a negative `audioOffset`.                                                                                                                                                                                                 |
| `minHold`             | number         | Per-scene minimum hold after the action, overriding the scenario `minHold`. Defaults to `0.15`.                                                                                                                                                                                                                               |
| `audioAfterAction`    | bool           | Per-scene override for the scenario field.                                                                                                                                                                                                                                                                                    |
| `audioAfterActionMax` | number         | Per-scene override for the scenario field.                                                                                                                                                                                                                                                                                    |
| `audioOffset`         | number         | Explicit narration start, in seconds from the scene start. Overrides the computed offset.                                                                                                                                                                                                                                     |
| `highlight`           | object or null | `{ "selector": "...", "pad": 8 }`; draws or updates the target outline. `null` clears it after the action.                                                                                                                                                                                                                    |
| `cursor`              | object or null | `{ "to": "..." }` or `{ "x": 640, "y": 360 }`; moves the fake pointer. `null` hides the overlay without moving the real mouse.                                                                                                                                                                                                |
| `assert`              | object         | Post-action check; see the notes after the action table.                                                                                                                                                                                                                                                                      |
| `zoom`                | number         | Zoom applied by `waitForMap` before settling the tile batch.                                                                                                                                                                                                                                                                  |
| `poster`              | bool or object | `true` or an object `{ selector, aspect, pad }`. Marks the poster frame at the end of the hold, in addition to the `poster` action. An object sets `selector` (default `#waymark-map`), `aspect` (default `"16:9"`) and `pad` (default `0`) for the replay crop.                                                              |
| `parkMouse`           | bool           | Move the real pointer to a neutral point in the admin bar before the scene’s action, clearing hover-only affordances.                                                                                                                                                                                                         |
| `anonymous`           | bool           | Record the scene as a logged-out visitor. The recording context clears its cookies before the scene’s `goto` and restores them before the next authenticated scene; the poster replay follows the same state. Playwright records video per context, so this is a cookie toggle in the one take, not a second browser context. |
| `block`               | string         | Vertical alignment for framing: `center` (default), `start` or `end`. The admin bar is treated as the top of the viewport.                                                                                                                                                                                                    |
| `allowPartial`        | bool           | Downgrade a still-clipped target after scrolling to a warning instead of failing the take. Use only for a target taller than the viewport.                                                                                                                                                                                    |
| `notes`               | string         | Direction for reviewers; ignored by the recorder.                                                                                                                                                                                                                                                                             |

### Action vocabulary

| Action           | Payload                            | Behaviour                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ---------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `goto`           | `url`, optional `selector`         | Navigate, wait for load and fonts, then wait for the selector if supplied. It is a no-op when the page already matches the URL. A card overlay does not change the URL, so a `goto` back to that page after a card does not reload it.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `card`           | `card`                             | Render a self-contained 1280×720 title or end card as a full-viewport Shadow DOM overlay over the already-loaded page, and hold it as a real timeline scene. The `card` object requires a non-empty `title` and accepts optional `eyebrow` and `subtitle` strings. Values are escaped, unknown keys are rejected, and a newline in a subtitle renders as a line break with each segment escaped separately. The overlay makes no network requests and leaves `page.url()` on the real page. An opening or mid-take card is removed at the end of its scene, revealing the pre-warmed page underneath; a closing card stays over the current page until the take ends. The card uses the Open GIS dark palette (`#000b00` background, `#e8f5ea` heading and eyebrow, `#eeeeee` subtitle, `#9bb0a3` muted footer, `#0dd70d` accent rule), the brand monospace stack throughout, an inline white Open GIS mark beside the title-case eyebrow name and a quiet `Waymark` footer wordmark. |
| `click`          | `selector`                         | Move the fake pointer, click, and wait for actionability. If hovering hides the target, click the recorded coordinates instead.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `fill`           | `selector`, `value`                | Move to the field, click, fill it and show a fake caret at the text end.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `select`         | `selector`, `value`                | Choose an option by value, falling back to a visible label.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `press`          | `selector`, `key`                  | Focus the target and press a key.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `hover`          | `selector`                         | Move the pointer over the target without clicking. The target is centred first only when it is not fully visible.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `scrollIntoView` | `selector`                         | Bring the target into the inset viewport (centred by default) and wait for the layout to settle.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `scrollTo`       | `to` or `selector`                 | Scroll to the document `top` or `bottom`, or align a selector with `block` using the same admin-bar inset logic. Use it to reset the viewport framing between beats, including before a closing card.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `waitFor`        | `selector`, optional `state`       | Wait for the target to be visible, or `attached` when `state` is `"attached"`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `waitForMap`     | optional `zoom`                    | Wait for `window.Waymark.map`, run the Leaflet settle routine, then pin and settle the zoom when supplied.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `dragMap`        | `selector`, `delta` or `from`/`to` | Pan the map by a pixel offset or between two map-relative points, then settle the tiles.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `clickMapPoint`  | `selector`, `latlng` or `point`    | Click a map coordinate, preferring `latlng` over screen pixels.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `openPopup`      | `selector`, or `latlng`/`point`    | Open a marker popup and wait for `.leaflet-popup`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `pause`          | none                               | An intentional beat with no UI action.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `poster`         | none                               | Mark a candidate poster frame at the end of the hold; no UI action. The replay capture uses the scene’s `poster` object when present.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `assertText`     | `selector`, `value`                | Assert visible text and hold on the result.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |

`assert` runs after the action and its overlays, and does not create a separate timing beat. It supports `visible`, `text`, `url`, `minCount`, `checked` and `value`; `minCount`, `checked` and `value` require a `selector`. `text` searches the selector’s contents, or the body when no selector is given. `url` matches a substring of the current URL. A failed assertion stops the take.

### Example

This is an excerpt from the delivered `changing-basemaps` scenario. The full file has more scenes, including the closing card, and reviewer notes; the selectors and values below are the real ones.

```json
{
  "id": "changing-basemaps",
  "title": "Changing Basemaps",
  "output": "docs/public/assets/video/changing-basemaps.mp4",
  "viewport": { "width": 1280, "height": 720 },
  "storageState": "scripts/video/work/auth/storage-state.json",
  "mapSlug": "cape-scott-trail",
  "posterAt": "00:00:50",
  "pad": 0.5,
  "hideSelectors": ["#edit-slug-box"],
  "scenes": [
    {
      "id": "title",
      "action": "card",
      "card": {
        "eyebrow": "Open GIS",
        "title": "Changing Basemaps",
        "subtitle": "Switching basemaps in the Map Editor"
      },
      "hold": 2.0,
      "highlight": null,
      "cursor": null
    },
    {
      "id": "open-editor",
      "action": "goto",
      "url": "{{baseURL}}/wp-admin/post.php?post={{mapId}}&action=edit",
      "hold": 10.9,
      "highlight": null,
      "cursor": { "to": "#waymark-map" },
      "assert": { "selector": "#waymark-map", "visible": true }
    },
    {
      "id": "settle",
      "action": "waitForMap",
      "zoom": 9,
      "hold": 0.4,
      "caption": "The map zooms out to fit the whole route",
      "highlight": { "selector": "#waymark-map", "pad": 8 },
      "cursor": null
    },
    {
      "id": "choose-topo",
      "action": "click",
      "selector": "#waymark-map .leaflet-control-layers-base label:has-text(\"Open Topo Map\") input",
      "hold": 8.9,
      "highlight": {
        "selector": "#waymark-map .leaflet-control-layers",
        "pad": 8
      },
      "cursor": {
        "to": "#waymark-map .leaflet-control-layers-base label:has-text(\"Open Topo Map\") input"
      },
      "assert": {
        "selector": "#waymark-map .leaflet-control-layers-base label:has-text(\"Open Topo Map\") input",
        "checked": true
      },
      "pad": 0.8
    },
    {
      "id": "hold-topo",
      "action": "waitForMap",
      "hold": 7.6,
      "poster": {
        "selector": "#waymark-map",
        "aspect": "16:9",
        "pad": 0
      },
      "highlight": {
        "selector": "#waymark-map .leaflet-control-layers",
        "pad": 8
      },
      "cursor": null,
      "pad": 0.8
    }
  ]
}
```

### Selector guidance

- Prefer stable, scoped selectors. The pilot scopes the basemap radio to `.leaflet-control-layers-base` because the map attribution also contains “OpenStreetMap”.
- Confirm labels against the seeded instance. This instance exposes two basemaps, `Open Street Map` and `Open Topo Map`; a generic example such as `text=Satellite` is not valid here.
- Use `:visible` when a count should reflect the expanded panel rather than hidden markup. The pilot asserts at least two visible labels in the open layers control.
- Avoid `nth-child`, generated class names and selectors tied to DOM order. The admin markup can change without any visible design change.
- Use stable plugin containers where no accessible role exists, and document why the selector is stable. The admin map container is `#waymark-map` (`inc/Admin/Waymark_JS.php:78`).
- Pin the site language for recording. Translatable strings are not stable selectors across locales.
- Keep assertions user-visible. Avoid asserting implementation details such as a particular class on a map pane.

## 4. Timing model

Timing is **audio-first**. Do not hand-maintain absolute timestamps in the scenario. The narration defines how long each scene lasts.

1. Write the narration per scene in `scripts/video/narration/<id>.md`, using the same scene ids as the scenario.
2. Run `tts.mjs`. It resolves a narration provider. Deepgram synthesises one continuous performance, aligns it with STT and cuts one WAV per narrated scene; `say` synthesises each scene separately. Either path writes `work/audio/<id>/timings.json` with each scene’s text, WAV path, measured duration, cache hash and provider metadata.
3. Record the scenario. The recorder reads `timings.json` and computes each scene’s hold.
4. Build the video. `build.mjs` places each WAV at its timeline start plus `audioOffset` and derives the captions from the same values.

### Scene timing

For a narrated scene:

```text
audioOffset   = scene.audioOffset
                ?? (audioAfterAction
                    ? min(actionEnd, audioAfterActionMax) + LEAD_BEAT - jcut
                    : 0)
durationFloor = actionEnd + minHold
sceneDuration = max(durationFloor, audioOffset + audioDuration + pad)
hold          = max(0, sceneDuration - actionEnd)
```

`LEAD_BEAT` is fixed at `0.3` seconds, so the voice always has a beat after the action settles. `jcut` defaults to `0`, may be set at scenario or scene level and is validated between `0` and `2`; it pulls the narration earlier and is subtracted after the lead beat. A `jcut` larger than `actionEnd + LEAD_BEAT` therefore produces a negative `audioOffset`, which is intended: the line starts inside the previous scene’s tail air. An explicit `audioOffset` replaces the computed value outright and is not adjusted by `jcut`. `audioAfterAction` defaults to `true`, `audioAfterActionMax` to `1.5` seconds, `minHold` to `0.15` seconds and `pad` to `0.5` seconds; all can be set at scenario level and overridden per scene.

`actionEnd` is measured after the action, its overlays and any assertion. `minHold` guarantees the scene never ends before its action has settled, even when a short line and a large `jcut` would otherwise make it do so. The cap matters when a `goto` runs past it: in the pilot’s settings navigation, the action finishes at 1.715 s, so narration starts at the 1.5 s cap (0.8 s after the lead beat and J-cut) and the hold is 9.255 s rather than waiting for the action to finish before speaking. As a worked example, `actionEnd` 0.5 s, `jcut` 1.1 s, `audioDuration` 6.0 s, `pad` 0.5 s and `minHold` 0.15 s give an offset of `min(0.5, 1.5) + 0.3 - 1.1 = -0.3` s; the audio plus pad reaches 6.2 s and the floor is 0.65 s, so the scene lasts 6.2 s and holds for 5.7 s. After the take, a negative offset is checked against the previous narrated scene’s absolute speech end, and an overlap fails the run.

The `open-editor` scene is pre-warmed and painted before the title card is removed, so its `goto` is a no-op and the action settles after 0.427 s. Narration therefore starts at the computed offset of 0.727 s into the editor scene, after the card has gone, rather than after a cold reload.

A silent scene has no audio entry, so it uses the scene’s `hold` and lasts `actionEnd + hold`; the `minHold` floor does not apply. `(no narration)` produces no WAV and no hold calculation. If `timings.json` is absent, every scene uses `hold` and the recorder warns at the end of the run.

Card scenes are ordinary timeline scenes with their own `hold`, so their holds count towards the delivered duration. The card itself is a full-viewport Shadow DOM overlay injected over the already-loaded page rather than a replacement document or pre/post-roll: admin CSS cannot reach the card and the card's styles cannot leak into the page. An opening or mid-take card is removed at the end of its scene, revealing the page that was loaded, settled and painted underneath it; a closing card overlays whatever page is current and stays up until the take ends. Both cards use the Open GIS dark brand styling: a `#000b00` background, inline white Open GIS mark at 40×40 px and title-case name on the eyebrow row, a `#0dd70d` accent rule, `#e8f5ea` monospace title, `#eeeeee` monospace subtitle and a muted `#9bb0a3` `Waymark` wordmark at the bottom-left. A newline in a card subtitle renders as a line break, with each segment escaped separately. The mark is inlined from `assets/img/ogis-logo-white.svg` with `shape-rendering: geometricPrecision`, `role="img"` and a `<title>Open GIS</title>`, so the overlay needs no network access.

### Timeline

The recorder writes `scripts/video/work/timeline-<id>.json`. The id is part of the filename, so recording one video and then building another cannot silently consume the wrong take. The build refuses a timeline whose `id` does not match the scenario id and names both ids in the error. The timeline is the source of truth for audio placement, captions and poster extraction. A scene record carries the scene id, start and end, action, narration, audio path, audio duration, audio offset, J-cut, minimum hold, action end and actual hold:

```json
{
  "id": "changing-basemaps",
  "startedAt": "<ISO timestamp>",
  "viewport": { "width": 1280, "height": 720 },
  "posterAt": 52.214,
  "poster": {
    "sceneId": "hold-topo",
    "selector": "#waymark-map",
    "aspect": "16:9",
    "pad": 0,
    "crop": {
      "x": 195,
      "y": 232,
      "width": 752,
      "height": 423,
      "extended": false
    },
    "scale": 2,
    "image": {
      "path": "work/poster/changing-basemaps.png",
      "width": 1504,
      "height": 846
    }
  },
  "scenes": [
    {
      "id": "open-editor",
      "start": 2.039,
      "end": 13.418,
      "action": "goto",
      "narration": "Waymark Maps are edited in the WordPress admin. Open the Map you want to work on, and the Editor loads with your saved markers, lines and shapes.",
      "audio": "work/audio/changing-basemaps/open-editor.wav",
      "audioDuration": 10.15,
      "audioOffset": 0.727,
      "jcut": 0,
      "minHold": 0.15,
      "hold": 10.95,
      "actionEnd": 0.427
    }
  ]
}
```

The timeline also records the replay poster’s resolved crop and image size, the raw video path, measured duration, pre-warm offset and wall-clock difference. For the pilot the marker is at 52.214 s, the crop is 752×423 CSS pixels and the 2× PNG is 1504×846. The crop values are in CSS pixels; the PNG dimensions are those values multiplied by `scale`. `crop.extended` is true when the crop had to reach beyond the poster element to contain the highlight. If narration changes after recording, regenerate the narration audio — the whole performance on the continuous path — and re-record; do not stretch the audio.

`build.mjs` fails when a narrated scene has no WAV, when a WAV is not listed in `timings.json`, when the scene order differs, when the narration text disagrees between the timeline and the timings, or when one caption cue would start before the previous cue ends. It also rejects an encoded MP4 whose duration differs from the timeline by more than 0.2 seconds. The delivered timeline totals 89.746 s and the encoded MP4 is 89.749 s, within that tolerance.

### Pace and duration

The legacy set is long: `getting-started` is 13:15.8 and `settings` is 16:36.4. The rebuilt pilot is 1:29.7. A 2–6 minute piece remains the target for fuller topics; split long topics into separate videos rather than producing another 13–16 minute recording.

Working targets:

- 5–20 seconds per scene.
- Narration at the default 175 words per minute for `say`. Deepgram maps the same figure to a 1.0 speed multiplier. Adjust `--rate` if a different pace is needed.
- A maximum of about 6 minutes for a first-pass video.
- `pad` defaults to 0.5 seconds; the pilot uses 0.8 seconds on the basemap-switching scenes.

### Poster capture

The preferred poster is a still captured from a second, unrecorded replay of the page, not a frame lifted from the encoded video. Once the take has stopped recording, the recorder opens a browser context at `deviceScaleFactor: 2`, replays the scenario from the first scene up to and including the poster scene, and screenshots the configured element. The context uses the same 1280×720 viewport, storage state, request guard, deterministic reset and tile routes as the take, so the replay reproduces the same map view, open layers panel, selected basemap, highlight and scroll position without the synthetic cursor. Running the replay after the recording context has closed keeps its wall-clock time out of the encoded video, so the delivered duration always matches the timeline.

The crop is the largest box of the configured aspect ratio that fits inside the padded element box. It is centred on the element, then shifted within the element so it contains the active highlight, including the highlight's padding and the poster `pad`. Defaults are `#waymark-map`, `16:9` and zero padding. If the highlight is larger than the fitted crop or reaches outside the element, the box grows as needed; any extension beyond the element is included rather than clipped, and the recorder logs a one-line note. The PNG lands at `scripts/video/work/poster/<id>.png` with dimensions in CSS pixels × 2. The delivered `changing-basemaps` poster comes from this path: a 1504×846 crop at 2× around the map and its layers panel, with the highlight outline preserved, downscaled to 1280×720.

The build prefers that PNG and downscales it with lanczos to the 1280×720 delivery JPEG. When the PNG is absent, it falls back to a frame from the final MP4, which keeps older takes of the same scenario workable. The delivered pilot uses the replay source (`posterSource: "replay"`). Precedence for the timestamp used by the comparison and fallback is:

1. `--poster-at <time>` on `build.mjs`.
2. The timeline marker written by the `poster` action or a truthy `poster` field.
3. The scenario `posterAt` fallback.

The marker is taken at the end of the poster scene’s hold, while the intended overlays are still visible; the pilot’s marker is at 52.214 s. To catch replay drift, the build extracts the video frame at that timestamp, crops it to the same rectangle, normalises both images to the same size, computes the mean absolute difference per channel and warns when the mean Δ is above 10. The delivered pilot measures 2.9 at the poster timestamp. A warning means the replay did not reproduce the take; inspect it rather than accepting the poster. The manifest records `posterSource` as `"replay"` or `"video"`.

Do not hand-edit the delivered JPEG unless the edit is recorded in the manifest.

## 5. Playwright recording

### Reuse the existing harness

The deterministic screenshot harness in `tests/e2e/fixtures.js` already solves most of the hard problems. The recorder reuses its helpers rather than reimplementing them:

| Helper                        | Location                    | Use for video                                                                  |
| ----------------------------- | --------------------------- | ------------------------------------------------------------------------------ |
| `login`                       | `tests/e2e/fixtures.js:292` | One-off authentication to create `storageState`; keep login out of recordings. |
| `getMap`                      | `tests/e2e/fixtures.js:54`  | Resolve a seeded Map by slug.                                                  |
| `waymark.seed`                | `tests/e2e/fixtures.js:679` | Access the parsed `seed-output.json` data through the test fixture.            |
| `settleMap`                   | `tests/e2e/fixtures.js:362` | Wait for Leaflet tiles and fonts; close popups unless disabled.                |
| `installTileRoutes`           | `tests/e2e/fixtures.js:581` | Record/replay the pinned tile pack.                                            |
| `makePageDeterministic`       | `tests/e2e/fixtures.js:264` | Disable transitions, animations and caret blink.                               |
| `installExternalRequestGuard` | `tests/e2e/fixtures.js:153` | Fail the run on unexpected network egress.                                     |
| `stubExternalAssets`          | `tests/e2e/fixtures.js:221` | Serve emoji, Gravatars and the d3 build locally.                               |
| `waitForLayoutStable`         | `tests/e2e/fixtures.js:420` | Wait for layout measurements to stop changing.                                 |

`tests/e2e/global.setup.js` is the reference for preparing a disposable instance: activate the plugin, activate Twenty Twenty-Five and run the demo seeder. The video instance needs the same preparation. The screenshot suite in `tests/e2e/screenshots.spec.js` is a useful reference for navigation and assertions, but it is not the recorder.

> [!WARNING]
> `tests/e2e/fixtures.js` resolves its allowed origin from `WP_BASE_URL` at import time (default `http://localhost:8889`). The recorder sets `WP_BASE_URL` before requiring the fixture. Set it in the environment before starting the launcher; changing it after the import will not update the request guard. The seed fixture’s permalinks are also written for 8889, so use `getMap().id` and build URLs against the video `baseURL` rather than reusing `.permalink`.

### Separate launcher, not the test runner

The recorder is a separate Playwright launcher (`scripts/video/record.mjs`), not a spec executed by `playwright test`. The test runner’s pass/fail lifecycle, retries and reporting are not appropriate for a long recording session, and a failed assertion should stop the take cleanly rather than trigger a retry that produces a second partial video.

The launcher imports the pure helpers from the CommonJS fixture with `createRequire`:

```js
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("@playwright/test");
const {
  login,
  installExternalRequestGuard,
  stubExternalAssets,
  makePageDeterministic,
  installTileRoutes,
  settleMap,
} = require("../../tests/e2e/fixtures.js");
```

### Context and video lifecycle

Record one context per video at 1280×720, device scale factor 1. Do not inherit the screenshot project’s 1600×1000 @ DPR 2 defaults (`playwright.config.js:21-25`); video has its own dimensions and a fixed 30 fps output. The lifecycle exposed by `lib/browser.mjs` is used in this order:

```js
const browser = await launchBrowser();
await ensureStorageState(browser, baseURL);
await assertAuthenticated(browser, baseURL);
await warmUp(browser, baseURL, {
  url,
  selector,
  hideSelectors,
  waitForMap,
  zoom,
});
const session = await startRecording(browser, baseURL, {
  hideSelectors,
  prepare,
});
// Run the scenario scenes here.
const finish = await finishRecording(session, id);
```

`startRecording` creates the browser context with `recordVideo`, `reducedMotion: "reduce"` and the saved storage state. It then creates the page and installs the request guard, asset stubs, cursor overlay, deterministic reset, hidden selectors and tile routes before the first navigation. `finishRecording` saves the raw take as `work/raw/<id>.webm`, deletes Playwright’s generated copy and measures the file. It records the video and wall-clock durations and their difference; a take whose media ends more than 0.25 s before the timeline end warns that it may be truncated.

Playwright records page content only, not browser chrome. That is the intended mode for documentation videos. If a future tutorial needs the browser toolbar or the OS, use an OS-level capture tool rather than reconstructing browser chrome inside the page.

#### Pre-warm

The first `goto` or `card` scene is prepared twice:

1. An unrecorded `warmUp` context loads the page behind the scene, applies `hideSelectors`, waits for the optional selector, and runs the `waitForMap` settle and zoom when the scenario has a `waitForMap` scene. For a `goto` that is the scene's URL; for a `card` it is the first non-card `goto` scene's URL. This warms the server, PHP and database caches. A card-only scenario with no `goto` has no page to warm. The warm-up stays logged in unless the first scene sets `anonymous: true`.
2. The recorded context then puts the same scene on screen before `t0` through the `prepare` hook: a `goto` navigates and performs its wait, while a `card` navigates to the page behind it, waits for its selector and the map, applies `hideSelectors`, and only then injects the overlay. The timeline origin is set after this step, and `video.offset` stores the elapsed pre-warm.

For a first `goto`, the scene navigation is a no-op because the page already matches; for a first `card`, the overlay is not injected again because the prepare hook has already put it on screen, and the following `goto` to the warmed page is a no-op because the overlay never changed `page.url()`. `build.mjs` seeks past `timeline.video.offset` before encoding, so the delivered video starts at the timeline origin. Without the recorded pre-warm the take opened on a blank white page for about 0.75 seconds.

Pre-warm runs only for a first scene whose action is `goto` or `card`; a scenario with any other first action is not pre-warmed. There is no pre-warm between scenes.

### Guards and determinism

The request guard and page setup are installed in the harness’s order:

1. The catch-all external-request guard.
2. The stubbed third-party assets.
3. The cursor init script (so it survives every navigation).
4. The deterministic page reset.
5. The scenario `hideSelectors`.
6. The pinned tile routes.

A violation is checked after every action and every hold and fails the take. A missing tile aborts the request rather than falling back to the network. Do not weaken the guard to get a take.

### Authentication

`ensureStorageState` creates `work/auth/storage-state.json` on demand by logging in through a separate, unrecorded context. `assertAuthenticated` then checks for the admin bar before the recording context exists, so an expired session fails immediately instead of recording the login screen. If the state expires, delete the file and run the recorder again.

Do not commit `storage-state.json`; it contains session cookies.

### Fake cursor and highlights

Playwright does not paint a mouse cursor into the video. `lib/cursor.mjs` injects a fixed-position pointer overlay into every document and hides the real cursor with `cursor: none !important`. The pointer is moved with `page.mouse.move(x, y, { steps: 20 })`, so the overlay follows a smooth path. Click rings pulse on `mousedown` and `mouseup`.

`makePageDeterministic` disables animations, transitions and the native caret. The cursor and highlight overlays use id-scoped rules with `!important`, which beat the universal transition reset on specificity. The fake caret is a 2 px element positioned at the field’s text end, with no blink.

`lib/highlight.mjs` draws a blue outline with a soft halo and drop shadow, positioned with `getBoundingClientRect()` so it never affects layout.

#### Overlay continuity

Highlights persist across scene boundaries; there is no per-scene teardown. Each scene applies its own highlight after its action, or clears it when `highlight` is `null`. Re-applying the same selector only repositions the existing rectangle, so consecutive scenes outlining the same element do not blink. A change of selector replaces the element and fades it in around the new target.

`cursor: null` hides the pointer overlay without moving the real mouse, which is useful for a clean poster frame while a hover-dependent control stays open. `parkMouse: true` moves the real pointer to the blank centre of the admin bar at `(640, 8)` before the scene’s action, clearing hover-only affordances such as the delete control on a repeatable row. Only the fake caret is cleared at the end of every scene.

### Maps and tiles

Run `settleMap` after navigation and after any action that changes the map view. It waits for tiles, confirms the set once more after a possible late `fitBounds`, waits for fonts and closes popups by default. Pass `{ closePopups: false }` when the popup is part of the scene, or open the popup after settling.

Use the pinned tile pack in `tests/fixtures/demo/tiles/` for deterministic frames. `installTileRoutes` aborts a missing tile and records it as a violation by design. If a new framing needs tiles that are not in the pack, record only the missing tiles with `WAYMARK_RECORD_TILES=1` and respect the OpenStreetMap and OpenTopoMap usage policies. The tile-pack rules are documented in `tests/e2e/README.md`.

The pilot pins `zoom: 9` in its `settle` scene. The editor’s `fitBounds` lands on zoom 10, but the pinned OpenTopoMap pack has no zoom 10 tiles; pinning 9 keeps both basemaps on pinned tiles. Live OSM tiles are acceptable only for exploratory drafts, never for a production recording.

### Version and browser

The repository declares `@playwright/test` `^1.63.0` (`package.json:27`) and configures Chromium only. The delivered manifest records the installed Playwright version (1.63.0) and Chromium build (153.0.8010.12). Pin the browser build used for recording and check the manifest after an upgrade: a Playwright or Chromium change can alter rendering and video encoding even when the scenario is unchanged.

## 6. WordPress and admin preparation

### Dedicated instance

Use the separate wp-env configuration in `scripts/video/wp-env.video.json`:

```json
{
  "plugins": ["."],
  "port": 11000,
  "autoPort": false
}
```

Run these commands from the repository root, so the relative plugin source `"."` resolves to the plugin root rather than to `scripts/video/`. Start the instance on the session port, never on 8888 or 8889:

```sh
npx wp-env --config=scripts/video/wp-env.video.json start
```

The video instance only needs the development site. If a future pipeline needs a separate tests site, add `"testsEnvironment": true` and `"testsPort": 11010`.

### Seed and theme

Activate the plugin and Twenty Twenty-Five, then run the demo seeder:

```sh
npx wp-env --config=scripts/video/wp-env.video.json run cli \
  wp plugin activate waymark-wp

npx wp-env --config=scripts/video/wp-env.video.json run cli \
  wp theme activate twentytwentyfive

npx wp-env --config=scripts/video/wp-env.video.json run cli \
  wp eval-file wp-content/plugins/waymark-wp/tests/fixtures/demo/seed.php
```

The seed provides:

| Item        | Value                                                                                                                     |
| ----------- | ------------------------------------------------------------------------------------------------------------------------- |
| Maps        | Cape Scott Trail (#100), San Josef Bay (#101), North Coast Trail (#102)                                                   |
| Page        | Waymark Demo (#110, slug `waymark-demo`)                                                                                  |
| Collections | Vancouver Island (parent), Day Hikes, Backpacking                                                                         |
| Settings    | Marker Types tab at `/wp-admin/edit.php?post_type=waymark_map&page=waymark-settings&content=waymark-settings-tab-markers` |

Use these seeded items for new recordings. The legacy videos use different demo content (“Our Test Map”, “Seal Bay Park”, “Log Train Trail”, “Trent River Loop”, “Island Rides” and so on), which is not part of the current seed.

The pilot uses Map 100, Cape Scott Trail, resolved through `mapSlug: "cape-scott-trail"`. The instance exposes exactly two basemaps, `Open Street Map` and `Open Topo Map`.

> [!WARNING]
> The seeder writes `tests/fixtures/demo/seed-output.json` with URLs built from the target instance’s home URL (`tests/fixtures/demo/seed.php:667-672`). Running it against port 11000 will overwrite the fixture used by the 8889 test suite. Restore the file from version control or reseed the tests instance afterwards. Do not ignore this side effect.

### Run-specific admin setup

These are setup steps, not content changes:

- Use one admin colour scheme for the recording user and keep it consistent across the set.
- Dismiss the WordPress welcome guide and any plugin notices that are not part of the demonstration.
- Hide Screen Options when they are not relevant; they add visual noise and can shift layout.
- Confirm permalinks are set to `/%postname%/`. The seeder already does this (`tests/fixtures/demo/seed.php:235-237`).
- Use the seeded page and map permalinks for front-end scenes.
- For editor scenes, use `post.php?post=<id>&action=edit` and wait for the Map Editor before the first action.
- Hide developer-only chrome with `hideSelectors` where it cannot be dismissed, for example the slug box. The pilot hides `#edit-slug-box`.
- Do not show the login screen or credentials. Local defaults are `admin` / `password` (`tests/e2e/fixtures.js:303-304`); they are for local setup only.

Record the current OGIS admin styling, not the old red “W” branding. This is the main reason the seven legacy videos cannot simply be re-encoded.

## 7. AI voice-over

Narration is produced behind a small provider interface in `scripts/video/lib/tts/`. The implemented providers are Deepgram Flux TTS (`deepgram`) and macOS `say` (`say`). Both return the same normalised WAV, so the recorder, build and captions do not care which one produced a take. Deepgram also supports a **continuous performance**: one whole-script synthesis request per take, one mastering pass, then speech-to-text alignment and per-scene cuts. `say` has no aligned transcript, so it keeps the per-line path.

| Provider     | Status          | Notes                                                                               |
| ------------ | --------------- | ----------------------------------------------------------------------------------- |
| Deepgram     | Implemented     | Flux TTS batch API; default voice `flux-kit-en`; paid and needs `DEEPGRAM_API_KEY`. |
| macOS `say`  | Implemented     | macOS only; no credentials; default voice `Daniel`; always the final fallback.      |
| OpenAI TTS   | Not implemented | Hosted API; needs a key and usage budget.                                           |
| ElevenLabs   | Not implemented | Hosted API; check voice licensing and cloning consent.                              |
| Azure Speech | Not implemented | Hosted API; pronunciation and voice selection are configurable.                     |
| Google Cloud | Not implemented | Hosted API; check quotas and data terms.                                            |

Store API keys in `.env` or the environment. Never put keys in scenarios, narration files, committed `.env` files or CI logs. The repository loads `.env` from its root when present, never requires it, and never logs its contents.

### Provider selection and fallback

1. `--provider <id>`.
2. `VIDEO_TTS_PROVIDER`.
3. Automatic: `deepgram` when `DEEPGRAM_API_KEY` is set, otherwise `say`.

A requested provider that is unavailable, or that fails fatally, prints one warning line and falls back to the next available provider. `say` is always last; if it is unavailable or fails, the run stops with a readable message. A synthesis failure restarts the whole run on the fallback provider, so a delivered video never mixes voices.

```text
[video] TTS: deepgram unavailable (DEEPGRAM_API_KEY is not set); falling back to say (Daniel, en-GB).
```

Voice selection is `--voice` > `VIDEO_TTS_VOICE` > the provider default. The defaults are `flux-kit-en` (Deepgram) and `Daniel` (say). The voice is resolved again if the run falls back, so the local fallback uses a valid installed voice.

`--rate` keeps its words-per-minute meaning. `say` receives it directly. Deepgram expects a speed multiplier, mapped linearly around the 175 wpm baseline: `speed = wpm / 175`, clamped to 0.5–1.5 and rounded to the nearest 0.05. The default 175 wpm therefore maps to 1.0; 140 wpm maps to 0.8 and 210 wpm to 1.2.

### Continuous performance

Per-line synthesis gives every line its own delivery, so a run can mix registers even when the requested rate is fixed. Deepgram therefore synthesises the whole script once. A provider without word timestamps (say) falls back to the per-line path with one warning that cadence may vary between lines.

1. Read the narration in scenario order, skip `(no narration)` scenes and join the remaining texts with a blank line.
2. Send the combined provider-ready text through the provider’s `synthesise()` path, starting at the run rate, and write the kept take to `work/audio/<id>/performance.wav` (48 kHz mono 16-bit PCM). When the text exceeds the chunk limit it is split at scene boundaries and requested as several chunks, then joined into the same single master (see below).
3. Apply the 30 ms lead / 120 ms tail silence trim and `loudnorm=I=-16:TP=-1.5:LRA=11` **once** to the whole performance. Every scene cut comes from that mastered file, so the gain structure is shared across the film. A chunked performance is normalised per chunk and joined before this step.
4. Send the mastered WAV as raw bytes to Deepgram STT (`/v1/listen`, `nova-3`, `smart_format=true`, `punctuate=true`) and read word timestamps from `results.channels[0].alternatives[0].words[]`, falling back to `results.utterances[]`.
5. Align the known script to those words and cut each scene from the master: start 30 ms before the first aligned word, end 120 ms after the last, clamped to the previous cut, the next cut and the file bounds.

#### Long scripts

Deepgram’s batch TTS accepts at most **2,000 characters** per request. Pronunciation overrides add inline objects, so the provider-ready text is longer than the authored narration. The continuous path therefore splits at **scene boundaries** when the provider-ready script exceeds **1,800 characters**, using the fewest chunks that fit and never cutting mid-sentence. A script that already fits stays one request with the same cache key.

```text
[video] TTS chunks: 3 (limit 1800 chars) — boundaries after scene "create-form", "page-collection".
```

The limit is `--chunk-chars <n>` or `VIDEO_TTS_CHUNK_CHARS` (flag wins), a whole number from **1 to 1,900**. A single scene longer than the limit cannot be split without cutting mid-sentence, so it is sent as one request with a warning and remains subject to the 2,000-character ceiling.

Each chunk is normalised on its own. Joining the masters inserts 90 ms of silence at every seam, which with the normal 120 ms tail and 30 ms lead recreates the roughly 240 ms paragraph pause of the single-request path. Alignment, cut planning, staged promotion and stamping run on the joined master unchanged and still report `delta 0.000s`.

The chunk plan (boundary scene ids and per-chunk text) is part of the performance cache key, so a limit change that moves a boundary or a lexicon edit regenerates the take. A cache hit makes no request and leaves `timings.json` and `stamp.json` untouched. A pre-chunk single-request master remains valid until it is next generated, after which its plan is recorded and later limit changes invalidate normally.

If any chunk fails, the run aborts without falling back to another provider. Staging is removed, the previous performance and scene WAVs are untouched, and the command exits non-zero, naming the chunk and the scene before it.

```text
[video] TTS failed: TTS chunk 2/3 after scene "create-form" failed: HTTP 413: ...
```

Alignment is monotonic and forward-only. Both sides are lowercased, stripped of punctuation, whitespace-collapsed and the spaced em dash is dropped. Each script word is matched to the next STT word that equals it, with a three-token look-ahead for insertions and deletions. Short concatenations handle `top-right` → `top right`, `Basemap` → `base map` and `Open Street Map` → `OpenStreetMap`; a conservative edit-distance match covers a misheard long word. A scene with no confident match, or a scene whose first word does not follow the previous scene, fails the run with the scene id and the words that failed. The run never guesses a cut point.

`timings.json` keeps the existing per-scene shape and adds the performance and alignment metadata. Concatenating the cuts reconstructs the master minus the inter-scene gaps and the head/tail trim; the run prints the segment total, the narrated span and the exact reconstruction delta.

A pace guard measures each normalised take after silence trimming. On the per-line path (the `say` fallback and an explicit `--scene`) it measures each scene separately: the speech duration runs from the first to the last non-silent sample, so the 30 ms lead and 120 ms tail pads are excluded. The scene’s words are counted from its narration text and converted to words per minute. A take outside **165 ± 10 wpm (155–175)** is retried up to **4 attempts** per scene. The ladder re-rolls at the provider’s default rate `R` first, then nudges to `R × 0.9` or `R × 1.1` and finally `R × 0.85` or `R × 1.15` in the needed direction. Re-rolling preserves the voice register; changing the rate does not, so rate changes are the last resort. Every rate is clamped to what the provider can honour before it is requested. The audio is never time-stretched; the take closest to the target is kept, and a run with no in-band attempt warns once. The run ends with a summary of the distinct requested rates. `VIDEO_TTS_TARGET_WPM`, `VIDEO_TTS_PACE_BAND_WPM` and `VIDEO_TTS_MAX_ATTEMPTS` override the defaults; the attempt count applies to the per-line path, while continuous mode is fixed at four whole takes.

In continuous mode the whole performance is the unit of pace. The same 155–175 wpm band applies, but retries converge on the target by estimating the measured response instead of stepping a fixed ladder: take 1 at `R`, take 2 at `R × target / measured`, then a secant through the two sampled `(rate, wpm)` pairs that bracket the target (or the two nearest when it lies outside the sampled range), with at most **4 whole takes** and a 5% step when a pair is too flat. There is no same-rate re-roll and no per-scene nudge. The run stops as soon as a take is in band; otherwise the closest take is kept, the script is re-aligned and the cuts are regenerated. Per-scene pace is information only. The summary reports the sampled `(rate, wpm)` pairs; when no whole take lands inside 155–175 wpm, the closest take is kept and the result is reported rather than falling back to per-line synthesis.

### Voice and synthesis

Deepgram is one batch request per take for the whole script in continuous mode; the per-line fallback uses one request per scene:

```text
POST {DEEPGRAM_BASE_URL or region}/v2/speak
  ?model=<voice>&encoding=linear16&sample_rate=48000&container=wav&speed=<multiplier>
Authorization: Token <DEEPGRAM_API_KEY>
Content-Type: application/json

{"text":"..."}
```

The response is a complete 48 kHz mono 16-bit PCM WAV. It is written straight to a temporary file and normalised with `ffmpeg loudnorm` (`I=-16:TP=-1.5:LRA=11`) to the delivery WAV. `bit_rate` is not sent with `linear16`. In continuous mode the TTS request gets a 120-second timeout because the API can stream a whole-film response slowly; per-line requests keep the 30-second timeout.

After mastering, the continuous WAV is sent to Deepgram STT for alignment:

```text
POST {DEEPGRAM_BASE_URL or region}/v1/listen
  ?model=nova-3&smart_format=true&punctuate=true
Authorization: Token <DEEPGRAM_API_KEY>
Content-Type: audio/wav
```

The transcript is used only to place cuts; it is never the delivered narration.

- `DEEPGRAM_REGION` selects the endpoint: unset is `https://api.deepgram.com`; `eu`, `au` and `in` use the matching regional host.
- `DEEPGRAM_BASE_URL` overrides the whole base URL, which is useful for a local test server.
- Per-line requests time out after 30 seconds; a continuous TTS request uses 120 seconds. `408`, `429`, `500`, `502`, `503` and `504` are retried up to three attempts with exponential backoff and jitter, honouring `Retry-After`. `400`, `401`, `402`, `403`, `413` and `415` are fatal and do not retry.
- Each request is limited to 2,000 characters. The continuous path splits at scene boundaries when the provider-ready text exceeds the chunk limit (default 1,800, range 1–1,900), so a long script no longer fails with `413`/`text_too_long`. A per-line scene, an unsplittable single scene, or a chunk that still exceeds the hard limit fails before or at the request and names the scene and character count. A failed chunk aborts the run rather than falling back to a different provider.
- Error bodies may be the legacy shape (`err_code`, `err_msg`), the modern shape (`category`, `message`, `details`), or plain text. The provider prints one readable line with the HTTP status and whichever fields exist.
- `--verbose` logs the `dg-model-name` and `dg-request-id` response headers.

Deepgram is a paid API, so every uncached synthesis is a request: one per line in the per-line path, or up to four whole-performance takes in continuous mode. Check current pricing before a large run and rely on the cache for reruns. Cloud audio is not guaranteed to be bit-identical across calls, so the cache is also what keeps an already-recorded take stable.

The `say` provider keeps a raw `.aiff` take, converts it to 48 kHz mono WAV with `afconvert`, and then applies the same loudnorm step. It needs `say` and `afconvert` on macOS.

Both providers write `timings.json` beside the audio. It records the provider, voice, rate, pace settings, model metadata and speed where applicable, plus one entry per narrated scene with its speech duration, word count, measured pace, attempt count, final requested rate and the rates requested for each attempt. When a fallback happened it also records the requested provider and the reason. A continuous run adds `mode: "continuous"`, `performanceHash`, `overallWpm`, `takeAttempts`, `attemptRates`, `paceSamples`, a `performance` block and an `alignment` block. Each scene also carries an `alignment` object with confidence, matched and unmatched word counts, first and last matched words and cut boundaries. Existing fields keep their names; in continuous mode `duration` is the cut WAV duration and `firstWpm`, `attempts` and `attemptRates` describe the whole take.

Audio is cached by a SHA-256 over the text, provider id, resolved voice, rate, any provider speed multiplier, the pace settings, the pace-guard version, the pronunciation plan version, the lexicon content hash and the post-processing version. A continuous performance also includes its mode, alignment version, whole-script text and, when split, the chunk plan (boundary scene ids and per-chunk text) in the key. Switching provider, voice, rate, speed, pronunciation, lexicon or a chunk boundary therefore regenerates rather than reusing the wrong audio. A cache hit makes no request and leaves `timings.json` and `stamp.json` untouched. Reruns reuse existing WAVs, `--voice` and `--rate` override the defaults, `--force` regenerates everything and `--scene <id>` regenerates one scene on the per-line path, which requires compatible per-line cache entries for the other scenes; regenerate the whole run after a continuous performance. `timings.json` is the recorder’s source of truth for holds and records the pronunciation count, distinct words and, for continuous runs, the chunk plan.

```sh
node scripts/video/tts.mjs changing-basemaps --provider deepgram
node scripts/video/tts.mjs changing-basemaps --provider say --voice Daniel --rate 175
node scripts/video/tts.mjs changing-basemaps --scene open-editor --force  # per-line cache only
```

The provider contract is intentionally small:

```js
export default {
  id: "deepgram",
  label: "Deepgram",
  defaultVoice: "flux-kit-en",
  supportsContinuous: true,
  isAvailable(env) {},
  synthesise({ text, voice, rate, outPath, env, sceneId, timeoutMs }) {},
  transcribeWav({ wavPath, env }) {},
};
```

`supportsContinuous` is true only when a provider can synthesise one whole-script performance and return word timestamps for it. A provider without it keeps the per-line path and logs one warning that cadence may vary between lines.

A new provider is one module under `lib/tts/providers/` plus one import and one registry line in `lib/tts/index.mjs`. There is no class hierarchy or plugin loader.

### Voice and pronunciation

A shared pronunciation lexicon at `scripts/video/narration/pronunciations.json` is loaded once per run. Each entry has a `display` name, one or more `match` variants, British-English `ipa`, a plain-text `spoken` respelling and optional `say` phonemes and `notes`. Matching is whole-word, case-insensitive and longest-first, so `OpenTopoMap` wins over `topo` while `topography` is untouched. Add an entry by appending an object with a non-empty `match` array and keep the file valid JSON. `--lexicon <path>` or `VIDEO_TTS_LEXICON` points the run at another file; a missing or malformed lexicon is a fatal, readable error rather than a silent skip.

The lexicon rewrites only the synthesis text. The narration file, the displayed text in `timings.json`, captions and transcripts keep the authored spelling. Deepgram receives brace-escaped inline IPA objects (`\{"word": "topo", "pronounce": "ˈtɒpəʊ"\}`); unescaped braces would be spoken aloud. The provider checks `dg-pronunciations-applied` against the expected replacement count and warns, naming the scene, when it is zero or low; `--verbose` also surfaces `dg-warnings`.

Flux rejects pronunciation overrides combined with a speed other than 1.0 (`CONTROL_COMBINATION_INVALID`), so a run with any overrides pins every request to speed 1.0 and prints one line naming the count and words. Both pace ladders still make up to four takes, but every take uses the locked rate and the closest to the target is kept. An explicit non-1.0 `--rate` with overrides is clamped to the speed-1.0 rate with a warning instead of being sent. `say` receives the plain-text respellings because the Daniel voice reads phoneme blocks literally. Alignment still uses the authored display words, so the pronunciation changes without changing what STT is expected to hear. The lexicon content hash is part of the cache key, so editing an IPA string regenerates the affected takes, and `timings.json` records a `pronunciations` block with the total count and distinct words.

Terms that are not in the lexicon are passed through verbatim; add them to the lexicon rather than misspelling them in the narration. The following editorial guidance is not automated:

| Term            | Suggested treatment                            |
| --------------- | ---------------------------------------------- |
| Waymark         | “WAY-mark”                                     |
| OGIS / Open GIS | “oh-gee-eye-ess” on first use, then “Open GIS” |
| GeoJSON         | “JEE-oh-JAY-son”                               |
| Leaflet         | “LEF-lit”                                      |
| WordPress       | “WORD-press”                                   |
| wp-admin        | “double-you-pee-admin”                         |
| shortcode       | “SHORT-code”                                   |
| lat/lng         | “latitude and longitude”                       |
| GPX / KML       | “G-P-X” / “K-M-L”                              |

TTS engines frequently mispronounce product names, abbreviations and place names. If a term needs a specific reading, add it to the shared lexicon and review the track by ear; the narration text keeps its natural spelling.

### Continuous performance and scene cuts

A provider with word timestamps (Deepgram) synthesises the whole script once and cuts it per scene from one mastered performance. That is the preferred path because it gives the film one register and one gain structure. When the provider-ready script exceeds the chunk limit, it is split at scene boundaries and the chunk masters are joined into that same single performance before the cuts. A provider without an aligned transcript (`say`) still generates one audio file per scene, and an explicit `--scene` uses the same per-line path.

The continuous master is loudness-normalised once, after synthesis:

```sh
ffmpeg -i performance.wav \
  -af "loudnorm=I=-16:TP=-1.5:LRA=11" \
  -ar 48000 -ac 1 -c:a pcm_s16le performance-normalised.wav
```

Each scene is then cut from that file with a 30 ms lead and a 120 ms tail, clamped to its neighbours. The per-line path applies the same loudnorm chain to each scene instead.

For the final delivery the narration bed is mixed at 48 kHz mono, then encoded as AAC at 128 kbps and 48 kHz stereo. Keep the normalised WAVs and the continuous master in `scripts/video/work/audio/`; do not commit them.

If a TTS take runs long, shorten the script. Do not speed it up beyond about 1.1×; faster speech becomes harder to follow and sounds unnatural. The pad is part of the computed hold, not a hand-added gap.

### Disclosure and consent

Disclose synthetic narration where required by the publishing context or the voice provider’s terms. Obtain consent before cloning or imitating a real person’s voice. Do not use a voice that implies endorsement by a real individual. The manifest records the provider, voice and rate for each rebuilt video.

## 8. Post-production with ffmpeg

The build requires `ffmpeg` and `ffprobe` on `PATH`. `tts.mjs` additionally needs either macOS `say` and `afconvert`, or a Deepgram API key.

### Assemble the narration bed

`build.mjs` does not concatenate the scene WAVs. It creates a silent 48 kHz mono bed for the whole timeline, delays each scene WAV to `scene.start + audioOffset`, trims it to the video duration and mixes the inputs with `amix` (`normalize=0`). A negative `audioOffset` is trimmed at the timeline origin rather than delaying the whole line. The result is a single narration WAV at `work/build/<id>/narration.wav`, exactly as long as the timeline.

### Encode once

The video and narration bed are encoded together in a single ffmpeg pass. There is no separate mux step:

- Playwright produces a VP8 WebM. The build re-times it to 30 fps and encodes H.264.
- The source is trimmed by `timeline.video.offset` before the scale and frame-rate chain.
- Video: H.264 High, `yuv420p`, CRF 21, `slow`, lanczos scale to 1280×720, `setsar=1`, 30 fps.
- Audio: AAC 128 kbps, 48 kHz, stereo.
- `+faststart`, metadata stripped except a neutral `title`.
- If the raw take is shorter than the timeline, the last frame is cloned for the difference; `-t` bounds the output to the timeline duration.

AAC is encoded with macOS AudioToolbox `aac_at` in CBR mode where it is available. The native `aac` encoder undershot the requested 128 kbps on sparse speech, so it is the fallback rather than the default; when used it sets `-aac_coder twoloop`.

`build.mjs` also accepts `--no-encode`, which reuses the existing MP4 and rebuilds the poster, captions, transcript and manifest, and `--poster-at <time>`, which overrides the poster timestamp. The poster step prefers the 2x replay PNG and falls back to a final-MP4 frame when it is absent, as described under poster capture.

### Build the poster

`build.mjs` builds the poster automatically. When `scripts/video/work/poster/<id>.png` exists it downscales that replay capture to `docs/public/assets/video/posters/<id>.jpg`. Otherwise it extracts the frame at the poster timestamp from the final muxed video. The build log states which source was used, for example `poster docs/public/assets/video/posters/<id>.jpg (replay 1504×846 → 1280×720)` or `(video frame at 52.214s)`, and the build warns when the mean Δ between the replay and the video frame exceeds 10; the delivered pilot measures 2.9.

Pass `--poster-at` to override the timestamp. Otherwise the timeline marker wins, falling back to the scenario `posterAt`. A replay poster should need no manual inspection for the cursor, because the replay context never installs the synthetic pointer.

### Master files

Delivery is 720p only. Do not record or archive a separate 1080p master. Record at 1280×720 and keep the intermediate WebM under `scripts/video/work/` only for the duration of the run. The poster replay is a still-only second context at 2× device scale; it does not produce a 1080p master. If a full-resolution master is needed later, record a second Playwright context at 1920×1080 and derive the 720p delivery file; upscaling the 720p recording adds no detail.

### Captions

Prefer soft captions (WebVTT) over burned-in text. Soft captions are searchable, translatable, styleable by the browser and available to assistive technology. Burn captions into the picture only when a target platform cannot render a caption track, and if you do, keep them inside the safe area with sufficient contrast.

### Manifest

The manifest is a single JSON object keyed by video id at `docs/public/assets/video/manifest.json`. A delivered entry looks like this:

```json
{
  "changing-basemaps": {
    "id": "changing-basemaps",
    "title": "Changing Basemaps",
    "scenarioVersion": "<12-character scenario hash>",
    "playwright": "1.63.0",
    "chromium": "153.0.8010.12",
    "file": "/assets/video/changing-basemaps.mp4",
    "duration": 89.749,
    "width": 1280,
    "height": 720,
    "videoCodec": "h264",
    "audioCodec": "aac",
    "size": 5234884,
    "sha256": "<sha256>",
    "poster": "/assets/video/posters/changing-basemaps.jpg",
    "posterSource": "replay",
    "captions": "/assets/video/captions/changing-basemaps.en.vtt",
    "transcript": "/assets/video/transcripts/changing-basemaps.md",
    "narrationProvider": "deepgram",
    "narrationVoice": "flux-kit-en",
    "narrationRate": 175,
    "generatedAt": "<ISO timestamp>"
  }
}
```

The media and narration values above are from the delivered pilot; `scenarioVersion`, `sha256` and `generatedAt` are shown as placeholders. `scenarioVersion` is a 12-character SHA-256 prefix of the scenario JSON unless the scenario sets `version`; `sha256` changes when the video is rebuilt, and `generatedAt` records the build time. The narration fields are copied from the timings file, so a local `say` fallback changes them to `say`, `Daniel` and the local rate. `mergeManifest` preserves every other video id, so rebuilding one video never rewrites the others. A malformed manifest is a hard error rather than something to overwrite.

Read the media values with `ffprobe` and compute the digest with `shasum -a 256` on macOS (or `sha256sum` on Linux). A manifest makes metadata validation possible without decoding every video.

## 9. Captions, transcripts and accessibility

### WebVTT from the timeline

Captions are generated from the timeline plus the narration. Timings are never inferred from frames.

- A cue is emitted for every narrated scene. The pilot delivers 11 cues: one for each of its nine narrated scenes plus two for silent beats that carry an explicit `caption`.
- For a narrated scene, a cue starts at `scene.start + audioOffset` and spans `audioDuration`, not the whole scene. It therefore never appears before its sentence. Because `audioOffset` may be negative, the build checks every cue against the previous cue's end and fails rather than emitting an overlap.
- A silent scene may carry an explicit `caption`, which emits a bracketed cue spanning the whole scene. Without a caption it emits no cue. The pilot uses this for two beats, `settle` and `reset-view`. A caption supplied alongside narration appears in the transcript as well as the speech.
- Cue identifiers are scene ids. Timestamps use `HH:MM:SS.mmm`. Text is escaped for `&`, `<` and `>`, and each cue is kept on one line.

The start of the pilot’s captions:

```vtt
WEBVTT

open-editor
00:00:02.766 --> 00:00:12.916
Waymark Maps are edited in the WordPress admin. Open the Map you want to work on, and the Editor loads with your saved markers, lines and shapes.

settle
00:00:13.419 --> 00:00:14.299
[The map zooms out to fit the whole route]

layers-control
00:00:14.553 --> 00:00:22.848
In the top-right corner is the layers control. It only appears when more than one Basemap is configured in Waymark Settings.
```

### Caption tracks in the docs

`VideoFigure.vue` accepts an optional `captions` prop and renders one `<track kind="captions">` per entry, resolved through `withAssetBase`. A string is shorthand for a single English track marked default:

```md
::video-figure{src="/assets/video/changing-basemaps.mp4" poster="/assets/video/posters/changing-basemaps.jpg" captions="/assets/video/captions/changing-basemaps.en.vtt"}
```

The array form takes `{ src, srclang, label, default }` objects and is intended for translated tracks:

```ts
captions: [
  {
    src: "/assets/video/captions/changing-basemaps.en.vtt",
    srclang: "en",
    label: "English",
    default: true,
  },
];
```

Only the pilot currently supplies a caption path. The other seven videos emit no `<track>`. English is the only language delivered for the pilot; additional languages are outstanding work.

### Transcript

`build.mjs` writes a Markdown transcript to `docs/public/assets/video/transcripts/<id>.md`, derived from the same cues as the WebVTT. Each entry has a timecode, the spoken narration and any visual caption. Because captions and transcript come from one source, the transcript cannot drift from the captions.

Transcripts live under `transcripts/`, not beside the captions.

### Accessibility checklist

- Keep native `<video controls>`; do not replace it with a custom player unless there is a clear need.
- Preserve `playsinline` and `preload="metadata"`.
- Ensure the player and any custom controls are keyboard accessible.
- Provide captions and a transcript for every rebuilt video. The seven legacy videos still need both.
- Describe visual-only information in captions or the transcript.
- Do not use colour alone to convey meaning; pair highlights with shape, outline or text.
- Maintain sufficient contrast for highlights, captions and on-screen text.
- Avoid rapid flashing, strobing and unnecessary motion. The recorder disables decorative animation.
- Do not auto-play with sound. The current player does not auto-play; keep it that way.

## 10. Publishing and validation

### Publishing

Replace the same eight filenames so existing docs references keep working. Add a `captions` attribute when a rebuilt video gains a caption track, add new files only for new topics, and update the docs grid or page that references them.

For each replacement:

- Write the MP4 to `docs/public/assets/video/<id>.mp4`.
- Write the poster to `docs/public/assets/video/posters/<id>.jpg`.
- Write the English captions to `docs/public/assets/video/captions/<id>.en.vtt`.
- Write the transcript to `docs/public/assets/video/transcripts/<id>.md`.
- Merge the manifest entry at `docs/public/assets/video/manifest.json`.
- Update the inventory table in this file with the new duration, size and poster.
- Update any docs caption or transcript that refers to the old content.

No translated caption files are delivered yet. English is the only language in the set.

Delivery is fixed at 1280×720; no separate master is archived.

### Scaffold, preflight and audit

Three commands make a new video repeatable without touching the delivery assets:

```sh
# Create scenarios/<id>.json and narration/<id>.md; refuses to overwrite either.
npm run video:new -- <id>

# Read-only preflight: instance, session, scenario, narration, seed, tiles,
# docs wiring and local assets. Exits non-zero only on a fail.
npm run video:doctor -- <id>

# Measure the final MP4: container facts, per-scene speech and pace, inter-line
# gaps, no-speech share, caption sync and warnings. Add --json or --strict.
npm run video:audit -- <id>
```

`new.mjs` writes a comment-free scenario with an opening card, a `goto`, a `pause` and a closing card, plus a narration file with one `## <scene-id>` heading per scene. Every value that needs real content is a `<TODO>` placeholder. The scaffold passes the recorder's eager validation and the narration heading contract immediately; the placeholders must be replaced before recording.

`doctor.mjs` never writes, reseeds or records. It refuses to probe ports 8888 and 8889, queries the video instance with HTTP GET and checks the stored session by loading `/wp-admin/` in headless Chromium. Missing recorded or delivered assets are warnings, not failures, so the same command works before and after the first take.

`audit.mjs` decodes the delivered audio to 48 kHz mono signed 16-bit and detects speech above `|s| > 300`, attributes it through the per-id timeline windows and cross-checks with `silencedetect=noise=-40dB:d=0.45`. Hard failures are a missing MP4, captions, transcript, poster or timeline, a timeline id mismatch, no speech at all, or overlapping cues. Its thresholds are all flags: `--gap-min`, `--gap-max`, `--gap-spread`, `--caption-tolerance`, `--no-speech-max`, `--articulation-min`, `--articulation-max`, `--pause-threshold`, `--speech-level`, `--silence-noise` and `--silence-duration`. Run it after every build; use `--strict` as the publishing gate.

### Adding a new video

1. `npm run video:new -- <id>`.
2. Replace every `<TODO>` in `scripts/video/scenarios/<id>.json` with real copy, URLs, selectors and actions; set `mapSlug`, `posterAt`, `pad` and `hideSelectors`.
3. Write `scripts/video/narration/<id>.md`: one `## <scene-id>` heading per scene, in scenario order, with `(no narration)` on silent beats. Use British English and keep the scene ids in step with the scenario.
4. `npm run video:doctor -- <id>` and fix every `fail`. The missing take and delivery warnings are expected at this stage.
5. `npm run video:tts -- <id>` and check the pace summary. Re-run with `--force` after any narration edit.
6. `npm run video:record -- scripts/video/scenarios/<id>.json`. The take writes `work/raw/<id>.webm` and `work/timeline-<id>.json`; check for zero request-guard violations and a small video/wall-clock difference.
7. `npm run video:build -- <id>`. This consumes `work/timeline-<id>.json` and `work/audio/<id>/timings.json`.
8. `npm run video:audit -- <id>`, then `npm run video:audit -- <id> --strict`. Fix or explicitly justify every warning.
9. `npm run video:validate` and make it pass.
10. Add `captions="/assets/video/captions/<id>.en.vtt"` to the matching `::video-figure` in `docs/content/`, update the inventory in this file, and run `npm run video:doctor -- <id>` once more to confirm the docs wiring.

Never publish a video until steps 8 and 9 pass.

### Validate the committed assets

Run the validator from the repository root:

```sh
node scripts/video/validate.mjs
```

It is read-only and offline. It validates every manifest entry:

- The MP4 exists, is non-empty and its size matches the manifest.
- `ffprobe` duration is within 0.2 seconds of the manifest, and width, height, video codec and audio codec match.
- The SHA-256 digest matches.
- The poster is a non-empty 1280×720 JPEG.
- The captions are non-empty WebVTT containing at least one cue, with valid, ordered timestamps.
- The transcript is non-empty.

It also scans `docs/content/` for `src`, `poster` and `captions` attributes pointing at `/assets/video/...` and confirms each target exists under `docs/public/`. Legacy videos without a manifest entry are not required to have one, so they do not fail the check.

### CI validation

The `Video` job in `.github/workflows/tests.yml` runs on Ubuntu, sets up Node 24, installs ffmpeg and runs `node scripts/video/validate.mjs`. It validates only. Do not add recording, TTS or transcoding to CI: generation needs a disposable WordPress instance, a pinned browser, a narration provider and human review.

### Validate the docs build

```sh
cd docs
npm run generate
```

The docs `dev` script uses port 11003 (`docs/package.json:6`). For a smoke test, use a free port in the 11000–11999 range and do not disturb the WordPress instances on 8888/8889.

Smoke-check the generated site:

- Every poster loads.
- Every video plays with the native controls.
- The rebuilt video’s captions are selectable and timed correctly.
- Paths resolve under both `/` and `/waymark-wp/`.
- No console errors or missing-asset requests.

### Do not commit

Keep the following out of version control:

- Raw Playwright WebM recordings.
- TTS audio and provider responses.
- ffmpeg intermediates.
- `storage-state.json` and any credentials.
- Temporary timelines and pipeline logs.

They belong in `scripts/video/work/`, which is gitignored.

## 11. Recommended rollout

`changing-basemaps` is delivered. At 1:29.7 it is the shortest video, it has a clear visual action (opening the Leaflet layers control and switching basemaps), and it exercises cursor movement, highlighting, map settling, TTS, captions and poster extraction without a long script.

The remaining videos, in order:

1. `using-collections`
2. `adding-map-meta`
3. `using-types`
4. `using-the-editor`
5. `markers`
6. `settings`
7. `getting-started`

Each is still the legacy capture until it is rebuilt. A rebuild needs a scenario, narration, generated audio, a recorded take, captions, a transcript and a manifest entry. Do not mark a video as rebuilt until its manifest entry validates.

Rewrite the long topics into shorter scenes as part of the work. The current 13–16 minute pieces are too long for a first programmatic pass and are harder to review, caption and re-record.

Re-record only after the admin UI and copy are final. A design or wording change after recording invalidates both the footage and the narration.

## 12. Decisions

Resolved during the build:

- **Pilot video:** `changing-basemaps`, delivered at 89.749 s (1:29.7), 5,234,884 bytes (4.99 MB).
- **Capture style:** page-only Playwright at 1280×720, DPR 1, with an injected cursor and no browser chrome.
- **Narration:** provider-based. The delivered pilot uses one continuous Deepgram Flux TTS performance at `flux-kit-en`, aligned with Deepgram STT (`nova-3`) and cut per scene; macOS `say` (`Daniel`, en_GB) remains the per-line fallback. Audio is cached by a SHA-256 over the text, provider, voice, rate, speed, pace settings and guard version.
- **Timing:** audio-first. Narration starts at `min(actionEnd, audioAfterActionMax)` plus a fixed 0.3 s lead beat and minus `jcut`, at `0` when `audioAfterAction` is false, or at an explicit `audioOffset`; a `minHold` floor keeps the scene at least as long as its action, and the hold is derived from audio duration and `pad`.
- **Pre-warm:** an unrecorded warm-up plus a recorded navigation or card overlay before `t0`; the build discards the recorded prefix using `timeline.video.offset`. A card warms the page behind it, including the WordPress map, so removing the overlay reveals a fully painted editor.
- **Overlay continuity:** highlights persist across scene boundaries and each scene owns its own state; re-applying the same selector does not fade the outline out and back in.
- **Hidden chrome:** scenario-level `hideSelectors` uses `visibility: hidden` so developer-only UI can be removed without reflow. The pilot hides `#edit-slug-box`.
- **AAC encoding:** prefer AudioToolbox `aac_at` in CBR mode; fall back to native `aac` with `twoloop`.
- **Delivery:** 1280×720 MP4s committed under `docs/public/assets/video/`; no separate 1080p master.
- **Captions and transcript:** English WebVTT plus a generated Markdown transcript for the pilot. Additional languages are not delivered.
- **Validation:** `node scripts/video/validate.mjs` runs in CI against committed assets; CI never generates.
- **Manifest:** a single object keyed by video id, merged per video, with media facts and a SHA-256 digest.

Open:

- Rebuild the seven legacy videos, starting with `using-collections`.
- Decide whether translated caption tracks are needed, and if so which languages.
- Decide whether a pronunciation lexicon is worth adding; narration is currently passed to the selected provider verbatim.
- Establish a scenario and narration for each new video before recording.

## Reference map

| Path                                             | Role                                                                                           |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| `scripts/video/README.md`                        | Operational guide: setup, commands, prerequisites.                                             |
| `scripts/video/record.mjs`                       | Playwright launcher, scene runner and timeline writer.                                         |
| `scripts/video/tts.mjs`                          | Provider-backed narration, continuous performance or per-line audio, and `timings.json`.       |
| `scripts/video/build.mjs`                        | Narration bed, MP4, poster, captions, transcript and manifest.                                 |
| `scripts/video/lib/poster.mjs`                   | Poster config, crop maths and 2x replay capture.                                               |
| `scripts/video/validate.mjs`                     | Read-only validator for committed assets and docs references.                                  |
| `scripts/video/audit.mjs`                        | Measured QA on one delivered MP4: speech, gaps, pace, sync and warnings.                       |
| `scripts/video/doctor.mjs`                       | Read-only preflight: instance, auth, scenario, narration, seed, tiles, docs wiring, assets.    |
| `scripts/video/new.mjs`                          | Scenario and narration scaffolder; refuses to overwrite existing files.                        |
| `scripts/video/scenarios/changing-basemaps.json` | Delivered pilot scenario.                                                                      |
| `scripts/video/narration/changing-basemaps.md`   | Delivered pilot narration.                                                                     |
| `scripts/video/wp-env.video.json`                | Dedicated video instance on port 11000.                                                        |
| `scripts/video/work/`                            | Gitignored raw takes, audio, timelines and build intermediates.                                |
| `docs/public/assets/video/manifest.json`         | Delivery metadata keyed by video id.                                                           |
| `docs/public/assets/video/captions/`             | WebVTT captions; English only for the pilot.                                                   |
| `docs/public/assets/video/transcripts/`          | Generated Markdown transcripts.                                                                |
| `docs/app/components/content/VideoFigure.vue`    | Native video player, poster, optional caption tracks and base-path resolution.                 |
| `docs/app/components/content/VideoGrid.vue`      | Grid wrapper used on the docs home page.                                                       |
| `docs/app/utils/assets.ts`                       | `withAssetBase`, which resolves `/assets/...` under the configured base path.                  |
| `docs/content/index.md`                          | Six-video Getting Started grid (lines 15–28).                                                  |
| `docs/content/customising/markers.md`            | Markers video (line 6).                                                                        |
| `docs/content/customising/settings.md`           | Settings video (line 6).                                                                       |
| `inc/Admin/Waymark_JS.php`                       | Admin map container `#waymark-map`.                                                            |
| `tests/e2e/fixtures.js`                          | Deterministic screenshot harness: login, seeding, map settling, tiles, external-request guard. |
| `tests/e2e/global.setup.js`                      | Activates the plugin and theme, then seeds the tests instance.                                 |
| `tests/e2e/screenshots.spec.js`                  | Existing deterministic capture spec; reference for navigation and assertions.                  |
| `tests/e2e/README.md`                            | Tile-pack record/replay policy.                                                                |
| `tests/fixtures/demo/seed.php`                   | Demo Maps, Collections, Page, Media and Settings.                                              |
| `tests/fixtures/demo/seed-output.json`           | Parsed seed data used by the e2e harness.                                                      |
| `playwright.config.js`                           | Test runner configuration, 8888 guard and screenshot viewport defaults.                        |
| `docs/package.json`                              | Docs build script (`npm run generate`) and dev port.                                           |
