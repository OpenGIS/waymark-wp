# Demo fixtures

A small, deterministic demo dataset for the disposable wp-env tests instance.
It gives the plugin's documentation screenshots a realistic, reproducible set
of Maps, Collections, Media, Meta and Settings.

The dataset is recreated from scratch on every seed, so it can be regenerated at
any time without leaving stale content behind.

## Contents

| Path                            | Purpose                                                                                                                                                 |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `maps/cape-scott-trail.geojson` | Canonical GeoJSON template for the hero Map, derived from `tests/fixtures/route.geojson`.                                                               |
| `images/`                       | The photos referenced by the template.                                                                                                                  |
| `seed.php`                      | Idempotent seeder, run with `wp eval-file`.                                                                                                             |
| `seed-output.json`              | Generated output (IDs, slugs, permalinks, collection terms and image URLs). Regenerated on every run; output is deterministic and stays byte-identical. |

The template is a normal GeoJSON `FeatureCollection`. On top of the source route
it:

- replaces the broken relative image URLs with `%%IMG:<key>:<size>%%` tokens;
- keeps the hero route's authentic elevation (the third ordinate) verbatim from
  `tests/fixtures/route.geojson`, so the elevation chart shows the real profile;
- adds one `Polygon` shape and one circle (`Point` with a `radius`), so Shapes
  are covered.

Elevation is never synthesised. Only the hero route carries a real elevation
profile; every other seeded Line is 2-ordinate. The seeder copies coordinates
verbatim and asserts the inline Lines stay flat, so a fabricated profile cannot
creep back in.

Every feature `properties.type` matches a Type seeded in Settings.

## Image tokens

Image URL fields use tokens of the form:

```
%%IMG:<key>:<size>%%
```

- `<key>` is a stable photo key, for example `scarlet-ibis`.
- `<size>` is one of `thumbnail`, `medium` or `large`.

The seeder sideloads each photo, captures the WordPress-generated URLs and
resolves the tokens (via `strtr`) before writing the Map data. The resolved
`seed-output.json` records the same key to URL mapping.

Attachment IDs are non-deterministic and are deliberately excluded from
`seed-output.json`.

## Running the seeder

The seeder is intended for the tests instance (port 8889) only. It refuses to
run against the development instance.

```sh
npx wp-env run tests-cli wp eval-file wp-content/plugins/waymark-wp/tests/fixtures/demo/seed.php
```

The Playwright global setup (`tests/e2e/global.setup.js`) runs it automatically
before every e2e suite.

## Licence

The route photos are derived from the repository's existing fixture images in
`assets/img/` and are normalised with `sips -Z 1920` to keep the committed
fixtures small.
