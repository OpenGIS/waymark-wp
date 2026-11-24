# Deterministic screenshot harness

The readme screenshot specs render the disposable wp-env tests instance
(port 8889) and are expected to produce byte-identical captures on every run.
`tests/e2e/fixtures.js` provides the helpers that make that possible, and
`tests/fixtures/demo/tiles/` holds the frozen basemap pack they replay from.

The suite runs against the tests instance only; the global setup heals it
(reactivates the plugin and theme) and reseeds the demo dataset before any spec
runs.

## Harness

Import the extended `test` from `./fixtures`. Each helper is wired up as an
auto-use fixture, so a spec only has to navigate and assert:

| Helper                        | Purpose                                                                                                            |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `installExternalRequestGuard` | Fails the test on any request that leaves the local test instance, or uses a scheme outside the allow-list.        |
| `stubExternalAssets`          | Serves the known third-party assets (WordPress emoji, Gravatar, the lazy d3 build).                                |
| `makePageDeterministic`       | Disables motion, transitions and the caret.                                                                        |
| `installTileRoutes`           | Records and replays the Leaflet basemap tiles from the tile pack.                                                  |
| `settleMap`                   | Waits for a Leaflet map's tiles and fonts to settle, and closes the popups the editor opens automatically on load. |

The specs in this directory include:

- `screenshots.spec.js` — the capture specs, and functional smoke coverage. It
  imports the harness.
- `info-window-zoom.spec.js` — regression coverage for the Map info window
  staying inside its container, and its editor fields staying usable, after
  zooming out. It also proves multiple Maps re-fit independently. It stubs every
  basemap tile transparently because it zooms beyond the frozen pack. It imports
  the harness.
- `map-view-defaults.spec.js` — regression coverage for the guaranteed initial
  Map view. It opens the seeded `circle-only` Map and proves it loads and fits
  its Circle with valid bounds, then opens `empty-map` and proves it renders at
  the Settings Default Centre/Zoom. Both must finish with zero console and page
  errors. It stubs every basemap tile transparently because the fallback view
  sits outside the frozen pack. It imports the harness.
- `elevation-profile.spec.js` — regression coverage for elevation detection and
  readouts: the all-zero `flat-elevation` track shows a flat profile with a
  centred transform origin, a finite height indicator on hover, and
  distance-only map hover, chart tooltip and summary readouts, while the
  real-elevation `cape-scott-trail` track shows its profile without the
  `zero-elevation` class and adds elevation to the same three readouts. It
  stubs every basemap tile transparently because neither Map is part of the
  frozen pack. It imports the harness.
- `map-editor-height.spec.js` — regression coverage for the admin Map editor
  height. It proves the editor renders at the configured Map Height, follows a
  non-default setting, never drops below the 450px floor, and keeps its height
  across saving and dismissing the update notice. It stubs every basemap tile
  transparently and imports the harness.
- `responsive-admin.spec.js` — the settings screen at a 500px viewport: the
  sidebar stacks below the card, the OGIS callout banner is absent, the help icons
  stay inline with their inputs, and neither tab scrolls horizontally. It
  imports the harness.
- `settings-repeatable.spec.js` — seeds a ragged repeatable Basemaps column,
  saves the Settings form, then proves every rendered input stays indexed and
  both column values persist. It restores the option afterwards. It imports the
  harness.
- `front-submission-image.spec.js` — front-end submission editor image
  controls. A signed-in user who can upload files gets the WordPress Media
  Library from both the toolbar and the marker popup; selecting an attachment
  from the popup updates the Marker; a toolbar selection creates a Marker whose
  saved GeoJSON carries the chosen image's large and thumbnail URLs; and closing
  the frame leaves no Marker behind. Guests and signed-in users without
  `upload_files` keep the native file chooser (`add_photo` and `marker_photo`)
  with no Media Library modal; the no-upload case also proves the fallback
  toolbar input sits inside `.waymark-edit-toolbar`. The spec creates a
  disposable submission Page and a subscriber, restores the settings and
  deletes both afterwards, and stubs every basemap tile from memory. It imports
  the harness.
- `map-editor.spec.js` — the legacy smoke test. It intentionally exercises live
  OSM tiles, so it deliberately does **not** import the harness and is not
  pack-backed. Leave it standalone.

## Tile pack

Tiles are stored one file per XYZ coordinate:

```
tests/fixtures/demo/tiles/<host>/<z>/<x>/<y>.png
```

`<host>` is `openstreetmap` or `opentopomap`. In replay (the default),
`installTileRoutes` serves every matching request straight from disk. A request
for a tile that is not in the pack is aborted and recorded as a violation naming
`<host>/<z>/<x>/<y>`, which the external-request check then fails the test on.
The pack therefore hard-fails on a missing tile rather than quietly reaching
upstream.

The pack holds exactly the tiles the capture specs request — no more — and is
frozen at that set. Add tiles only by recording (below), and remove stale ones
with the prune procedure.

## Recording tiles

Record mode fetches only the tiles that are missing from the pack; tiles already
present are served from disk without a network round-trip. Fetches are throttled
to at most one per second and sent with a descriptive user agent. Each recorded
tile is logged to stdout (prefixed `[tile-record]`) and appended to
`temp/tile-record.log`.

```sh
WAYMARK_RECORD_TILES=1 npx playwright test tests/e2e/screenshots.spec.js
```

> [!WARNING]
> Respect the OpenStreetMap and OpenTopoMap tile usage policies. Never
> bulk-download tiles. Record only the handful a framing or zoom change needs.

Re-record when a capture's framing or zoom changes enough to request different
tiles, or when a new capture is added — run the command above and commit the
newly written tiles.

## Freezing the pack

To confirm the pack matches the captures exactly:

1. Run the capture spec with served-tile logging enabled. Every tile served from
   disk is printed as `[tile-serve] served <host>/<z>/<x>/<y>` and appended to
   `temp/tile-serve.log`. The logging is off unless the variable is set,
   so a normal run stays quiet.

   ```sh
   WAYMARK_TILE_LOG=1 npx playwright test tests/e2e/screenshots.spec.js
   ```

2. Remove every pack tile that did not appear in the log, then delete any
   directories left empty (`<host>`, `<z>` and `<x>` levels).

If a tile in the log turns out to be missing from the pack, stop: a capture was
left unserved, and the pack must be re-recorded before pruning.

## Running the capture spec

```sh
npx playwright test tests/e2e/screenshots.spec.js
```

Each capture is written to `temp/screenshots/` as a PNG, alongside a
`manifest.json` recording its pixel dimensions and SHA-256. The full suite
(`npm run test:e2e`) runs every spec in this directory together.

## Readme assets

The WordPress.org directory assets in `.wordpress-org/` are generated from the
captures rather than edited by hand:

```sh
npm run screenshots        # capture the canonical JPEGs, publish them, and rewrite readme.md hashes
npm run screenshots:check  # capture, verify the published files match, then run readme:check
```

Both commands run the capture spec with `WAYMARK_SCREENSHOTS=1`, which writes
quality-85 JPEGs to `temp/screenshots/canonical/` instead of the usual
PNGs under `temp/screenshots/`. The publish or compare step only runs
when that capture run passes:

- `npm run screenshots` copies the managed files (`editor-demo.jpg` and
  `screenshot-1.jpg` through `screenshot-21.jpg`) into `.wordpress-org/` and
  regenerates the `?v=` content hashes in `readme.md`.
- `npm run screenshots:check` compares each managed canonical file against its
  published copy by SHA-256, then runs `npm run readme:check`. It exits non-zero,
  listing the mismatches, when a published asset or readme hash has drifted. It
  never writes to `.wordpress-org/` or `readme.md`.

Byte-for-byte determinism is only expected within the canonical local
environment: OS fonts and browser builds can change the output. The JPEGs should
match across runs there and `screenshots:check` passes without republishing, but
a Chromium or Playwright upgrade can change the JPEG encoding even for identical
pixels. `screenshot-6` has shown occasional sub-pixel raster noise across
sessions, so do not treat a single cross-environment hash mismatch as a content
regression — verify the capture visually and rerun.

Recapture after changes to admin/Settings UI that appear in the published
screenshots, then commit the refreshed `.wordpress-org/` assets and `readme.md`.
