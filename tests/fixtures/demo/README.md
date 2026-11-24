# Demo fixtures

A small, deterministic demo dataset for disposable wp-env instances. It gives
the plugin's documentation screenshots a realistic, reproducible set of Maps,
Collections, Media, Meta and Settings.

The seeder has three modes. Tests mode recreates the dataset from scratch on the
disposable tests instance. Dev mode seeds the development instance once, when it
is still untouched. Dev force mode resets the demo artefacts on the development
instance and reseeds it, preserving unrelated content.

## Contents

| Path                            | Purpose                                                                                                                                                                                                    |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `maps/cape-scott-trail.geojson` | Canonical GeoJSON template for the hero Map, derived from `tests/fixtures/route.geojson`.                                                                                                                  |
| `image-metadata.json`           | Manifest for the demo photos: titles, alt text, camera, capture time, GPS and altitude.                                                                                                                    |
| `images/`                       | The photos referenced by the template and described by `image-metadata.json`.                                                                                                                              |
| `seed.php`                      | Seeder, run with `wp eval-file`; reads `image-metadata.json`. Tests mode resets and rewrites the fixture; dev mode seeds only an untouched instance; dev force mode resets the demo artefacts and reseeds. |
| `seed-guard.php`                | Read-only freshness checks and demo-artefact selection for dev and dev force modes; including it has no side effects.                                                                                      |
| `seed-output.json`              | Generated output (IDs, slugs, permalinks, collection terms and image URLs), written by tests mode only. Output is deterministic and stays byte-identical.                                                  |

The template is a normal GeoJSON `FeatureCollection`. On top of the source route
it:

- replaces the broken relative image URLs with `%%IMG:<key>:<size>%%` tokens;
- keeps the hero route's authentic elevation (the third ordinate) verbatim from
  `tests/fixtures/route.geojson`, so the elevation chart shows the real profile;
- adds two `Polygon` shapes, so Shapes are covered; the Circle lives in the
  separate `circle-only` Map (103).

Elevation is never synthesised. Only the hero route carries a real elevation
profile; the other hand-written Lines are 2-ordinate. The deliberate
`flat-elevation` fixture is the exception: its Line carries third ordinates
that are all zero — the shape an exporter writes when it has no elevation
source — so it acts as the regression fixture for flat all-zero profiles. The
seeder copies coordinates verbatim and asserts the other inline Lines stay
2-ordinate, so a fabricated profile cannot creep back in.

Every feature `properties.type` matches a Type seeded in Settings.

Two extra Maps are regression fixtures for the default-view fallback: `103`
`circle-only` is a single Circle overlay and `104` `empty-map` is an empty
FeatureCollection. Neither is assigned to a Collection, so the demo Page and
Collection output stay unchanged.

## Image tokens

Image URL fields use tokens of the form:

```
%%IMG:<key>:<size>%%
```

- `<key>` is a stable photo key, for example `scarlet-ibis`.
- `<size>` is one of `thumbnail`, `medium` or `large`.

The seeder sideloads each photo, captures the WordPress-generated URLs and
resolves the tokens (via `strtr`) before writing the Map data. In tests mode,
the resolved `seed-output.json` records the same key to URL mapping.

Attachment IDs are non-deterministic and are deliberately excluded from
`seed-output.json`.

## Image metadata

`image-metadata.json` is the single source of truth for the demo photos. Each
entry records the stable image key, file name, title and alt text, camera make
and model, EXIF capture timestamp, UTC offset, GPS latitude and longitude, and
altitude. The GPS coordinates follow each image's feature location in the demo
Maps.

The checked-in files are authored from that manifest:

```sh
npm run fixtures:exif
```

That runs [`scripts/fixtures/demo-exif.mjs`](../../../scripts/fixtures/demo-exif.mjs),
which uses the pinned `exiftool-vendored` dev dependency to write the metadata
without re-encoding the pixels. Pixels, dimensions, file names and orientation
stay identical; only the metadata bytes change. Orientation is written as
`Orientation#=1`.

This is a manual authoring step, not part of install, tests or CI. Run it after
editing the manifest, and always after any resize: tools such as `sips` strip
metadata when they re-encode a file, so resize first and write EXIF second.

The seeder reads the same manifest. Because `wp eval-file` is not an admin
request, it registers `Waymark_Admin::add_gps_exif` before sideloading, then
asserts each attachment's `image_meta` has GPS coordinates matching the
manifest, the manifest's camera model, and a capture timestamp. The PHPUnit
fixture test in
[`tests/phpunit/test-demo-image-exif.php`](../../phpunit/test-demo-image-exif.php)
verifies the checked-in files carry the manifest's EXIF, including the GPS
conversion and orientation.

WordPress derives `created_timestamp` from each file's EXIF local time as if it
were UTC. The checked-in files store local time plus `OffsetTimeOriginal`, so
the derived timestamp is not the actual UTC capture time; the plugin does not
consume `created_timestamp`.

## Running the seeder

The seeder has three modes:

| Mode           | Instance           | Behaviour                                                               |
| -------------- | ------------------ | ----------------------------------------------------------------------- |
| Tests fixture  | tests (8889)       | Always resets the disposable instance and rewrites `seed-output.json`.  |
| Dev fresh-only | development (8888) | Seeds only an untouched instance and never writes `seed-output.json`.   |
| Dev force      | development (8888) | Resets the demo artefacts and reseeds; never writes `seed-output.json`. |

Tests mode is the fixture the test suite depends on. The two dev modes are
development helpers; neither is used by CI or the video pipeline.

### Tests mode

Tests mode is used for the disposable tests instance (port 8889). Because that
instance is disposable, it force-deletes every Map and every Collection, the
demo Page by slug, demo attachments and the `waymark-demo` uploads directory,
and anything occupying reserved IDs 100–119. It then recreates the dataset and
rewrites `seed-output.json` with URLs built from the target instance's home URL.

```sh
npx wp-env run tests-cli wp eval-file wp-content/plugins/waymark-wp/tests/fixtures/demo/seed.php
```

The Playwright global setup (`tests/e2e/global.setup.js`) runs it automatically
before every e2e suite. Each run also asserts the stored GPS, camera and
capture-date metadata. Tests mode refuses the development instance (8888); the
two dev modes accept it.

### Dev mode

`npm run dev` runs `seed:dev` after `wp-env start`. The script targets the
development container (`cli`, port 8888):

```sh
npm run seed:dev
# wp-env run cli wp eval-file wp-content/plugins/waymark-wp/tests/fixtures/demo/seed.php dev
```

Dev mode seeds only when the instance is untouched. It stops before the first
write and logs `Skipping demo seed: <reason>.` when any of these is true:

- the `waymark_demo_dev_seeded` marker is set;
- `Waymark_Settings` exists;
- any Map exists, in any status;
- any Collection exists;
- a Page with the `waymark-demo` slug exists;
- demo media (`waymark-demo/` attachments) exists;
- the `waymark-demo` uploads directory is not empty;
- any post occupies a reserved demo ID from 100 to 119.

On success it sets `waymark_demo_dev_seeded` and never writes
`seed-output.json`. The plugin uninstall clears the marker, but it does not
delete the demo content.

When the gate trips, the seeder logs `Skipping demo seed: <reason>.` followed by
a hint to run `npm run seed:dev:force`. A bare `npx wp-env start` does not seed.

### Dev force mode

Dev force mode resets the demo artefacts on an already-used development instance
and reseeds it. It is development tooling, not a test or video entry point:

```sh
npm run seed:dev:force
# wp-env run cli wp eval-file wp-content/plugins/waymark-wp/tests/fixtures/demo/seed.php dev force
```

`force` is a positional token. WP-CLI `eval-file` rejects an undeclared
`--force` flag and `wp-env run` consumes a `--` separator, so `dev --force` is
not the documented interface; pass `dev force`. The parser accepts `--force`
only as an alias for a direct in-container run, which the npm script never uses.

> [!WARNING]
> Dev force mode is destructive. It permanently deletes the demo Maps, Page,
> Collections and attachments on the current development instance, removes the
> demo uploads directory, and overwrites the demo settings and site options. Run
> it only against an instance whose demo content and site options you can lose.
> It never deletes unrelated content.

Safety gates are checked before the first write:

- `force` requires `dev`; `force` alone is a usage error.
- `wp_get_environment_type()` must be `local` or `development`.
- The site URL must not contain `:8889`; the tests instance keeps its broad
  reset in tests mode.
- Reserved demo IDs 100–105 (Maps) and 110 (Page) must be free or hold demo
  content, identified by slug. If non-demo content occupies any of them, the
  seeder aborts, lists the IDs and titles, and deletes nothing. Move or delete
  that content and retry; it never deletes unknown content at those IDs.

The reset removes only the following demo artefacts and plugin state:

- demo Maps selected by slug, including the `__trashed` variants;
- the demo Page selected by slug, including the `__trashed` variant;
- demo attachments whose `_wp_attached_file` starts with `waymark-demo/`, then
  the `uploads/waymark-demo/` directory that remains;
- demo Collection terms selected by slug only, children before parents;
- the `waymark_demo_dev_seeded` and `waymark_activation_redirect` options.

It then reseeds settings, site options (title, tagline, timezone, date and time
formats, permalink structure), media, Maps, Collections and the demo Page, and
sets `waymark_demo_dev_seeded` again, so a later `npm run seed:dev` skips.
Unrelated posts, pages, terms and media are preserved. Repeated runs reset and
reseed cleanly, so the Maps stay on IDs 100–105 and the Page on 110. Force mode
logs a warning and the demo item counts before deleting, and it never writes
`seed-output.json`; only tests mode writes that fixture.

#### Clean slate

Force mode keeps unrelated content. Destroy and recreate the instance only when
you need a completely clean slate:

```sh
npx wp-env destroy
npm run dev
```

The read-only helpers live in [`seed-guard.php`](seed-guard.php):
`waymark_demo_state()` returns the state flags,
`waymark_demo_reason_for_state()` returns the first reason the instance is not
untouched, and the `waymark_demo_*` selection helpers describe exactly which
content dev force mode may delete. They all read without writing.

## Licence

The route photos are derived from the repository's existing fixture images in
`assets/img/` and are normalised with `sips -Z 1920` before
`npm run fixtures:exif` writes their metadata, to keep the committed fixtures
small.
