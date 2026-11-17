// Regression coverage for issue #86.
//
// A Map with no `map_init_latlng`/`map_init_zoom` used to leave the Leaflet map
// unloaded. A Circle added before the first `setView()` then had no `_map`, so
// `reset_map_view()` threw on `Circle.getBounds()` every 100ms and the container
// stayed blank. Empty Maps had no bounds to fit and no fallback view.
//
// These specs open the seeded `circle-only` and `empty-map` permalinks and
// assert the fixed state: a loaded Map with a finite centre and zoom, loaded
// tiles, and (for the Circle) an attached layer with valid bounds.
"use strict";

const { test, expect } = require("./fixtures");

const TILE_URL_PATTERN =
  /^https?:\/\/(?:[a-z0-9-]+\.)*tile\.(?:openstreetmap|opentopomap)\.org\//i;

// 1x1 transparent PNG. The Maps under test fall back to a default view far
// from the frozen capture pack, so serve every tile from memory.
const TRANSPARENT_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

test.use({ viewport: { width: 1280, height: 900 } });

/**
 * Serve every basemap tile from memory.
 *
 * Installed after the `waymark` fixture's tile routes, so Playwright's
 * reverse-registration precedence lets this route win.
 *
 * @param {import("@playwright/test").Page} page
 */
async function stubBasemapTiles(page) {
  await page.route(TILE_URL_PATTERN, (route) =>
    route.fulfill({
      status: 200,
      contentType: "image/png",
      body: TRANSPARENT_PNG,
    }),
  );
}

/**
 * Collect console and page errors. `/favicon.ico` is browser-chrome noise and
 * jQuery Migrate emits deprecation notices as console errors on some WordPress
 * versions; neither is a test failure.
 *
 * @param {import("@playwright/test").Page} page
 */
function startErrorGate(page) {
  const consoleErrors = [];
  const pageErrors = [];

  page.on("console", (message) => {
    if (message.type() !== "error") {
      return;
    }
    if (/\/favicon\.ico$/.test(message.location().url)) {
      return;
    }
    if (/jquery migrate/i.test(message.text())) {
      return;
    }
    consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(String(error)));

  return {
    consoleErrors,
    pageErrors,
    summary() {
      return {
        consoleErrors: consoleErrors.length,
        pageErrors: pageErrors.length,
      };
    },
    assertNoErrors() {
      expect(
        consoleErrors,
        `Console errors:\n${consoleErrors.join("\n")}`,
      ).toEqual([]);
      expect(pageErrors, `Page errors:\n${pageErrors.join("\n")}`).toEqual([]);
    },
  };
}

/**
 * Wait for the Waymark instance of the page's first Map.
 *
 * @param {import("@playwright/test").Page} page
 */
async function waitForWaymarkMap(page) {
  await page.waitForFunction(
    () => {
      const element = document.querySelector(".waymark-map");
      if (!element || !window.jQuery) {
        return false;
      }
      const waymark = window.jQuery(element).data("Waymark");
      return Boolean(waymark && waymark.map);
    },
    null,
    { timeout: 15_000 },
  );
}

/**
 * Read the Map's loaded flag, centre and zoom. Unloaded Maps throw from
 * `getCenter()`, so report the loaded flag first rather than masking it.
 *
 * @param {import("@playwright/test").Page} page
 */
function readMapState(page) {
  return page.evaluate(() => {
    const element = document.querySelector(".waymark-map");
    if (!element || !window.jQuery) {
      return { found: false };
    }

    const waymark = window.jQuery(element).data("Waymark");
    if (!waymark || !waymark.map) {
      return { found: true, map: false };
    }

    const map = waymark.map;
    const loaded = map._loaded === true;

    if (!loaded) {
      return { found: true, map: true, loaded };
    }

    try {
      const centre = map.getCenter();
      return {
        found: true,
        map: true,
        loaded,
        centre: { lat: centre.lat, lng: centre.lng },
        zoom: map.getZoom(),
      };
    } catch (error) {
      return { found: true, map: true, loaded, error: String(error) };
    }
  });
}

/**
 * Read the Circle layer's attachment and bounds. `getBounds()` throws while the
 * layer is not attached, which is exactly the regression: report it instead of
 * letting the evaluation fail.
 *
 * @param {import("@playwright/test").Page} page
 */
function readCircleState(page) {
  return page.evaluate(() => {
    const element = document.querySelector(".waymark-map");
    const waymark = element && window.jQuery(element).data("Waymark");

    if (!waymark || !waymark.map_data) {
      return { found: false };
    }

    let result = { found: false };

    waymark.map_data.eachLayer((layer) => {
      const properties = layer.feature && layer.feature.properties;
      if (!properties || !properties.radius) {
        return;
      }

      const attached = layer._map === waymark.map;

      try {
        const bounds = layer.getBounds();
        const southWest = bounds.getSouthWest();
        const northEast = bounds.getNorthEast();

        result = {
          found: true,
          attached,
          radius:
            typeof layer.getRadius === "function" ? layer.getRadius() : null,
          boundsValid: Boolean(bounds && bounds.isValid()),
          bounds: {
            south: southWest.lat,
            west: southWest.lng,
            north: northEast.lat,
            east: northEast.lng,
          },
        };
      } catch (error) {
        result = { found: true, attached, error: String(error) };
      }
    });

    return result;
  });
}

/**
 * Read the default view exposed to the page by the plugin config.
 *
 * @param {import("@playwright/test").Page} page
 */
function readConfiguredDefaultView(page) {
  return page.evaluate(() => {
    const options =
      window.waymark_user_config && window.waymark_user_config.map_options;

    if (!options) {
      return null;
    }

    return {
      latlng: options.map_default_latlng ?? null,
      zoom: options.map_default_zoom ?? null,
    };
  });
}

/**
 * Count rendered Leaflet tiles that decoded successfully.
 *
 * @param {import("@playwright/test").Page} page
 */
function countLoadedTiles(page) {
  return page
    .locator("img.leaflet-tile")
    .evaluateAll(
      (tiles) =>
        tiles.filter((tile) => tile.complete && tile.naturalWidth > 0).length,
    );
}

/**
 * Assert the Map container is visible with a non-zero box.
 *
 * @param {import("@playwright/test").Page} page
 */
async function expectVisibleMap(page) {
  const container = page.locator(".waymark-is-viewer");

  await expect(container).toBeVisible();

  const box = await container.boundingBox();

  expect(box, "Map container has no layout box").not.toBeNull();
  expect(box.width, "Map container has no width").toBeGreaterThan(0);
  expect(box.height, "Map container has no height").toBeGreaterThan(0);
}

// ---------------------------------------------------------------------------
// Circle-only Map
// ---------------------------------------------------------------------------

test("circle-only map loads before fitting its Circle", async ({
  page,
  waymark,
}) => {
  test.setTimeout(90_000);
  const errors = startErrorGate(page);
  await stubBasemapTiles(page);

  const map = waymark.getMap("circle-only");

  await page.goto(map.permalink);
  await expectVisibleMap(page);
  await waitForWaymarkMap(page);

  const state = await readMapState(page);
  const circle = await readCircleState(page);

  console.log(
    `[map-view-defaults] circle-only: map=${JSON.stringify(state)}, ` +
      `circle=${JSON.stringify(circle)}, errors=${JSON.stringify(errors.summary())}`,
  );

  expect(
    state.loaded,
    `Map is not loaded (${errors.pageErrors.length} page errors, first: ${
      errors.pageErrors[0] ?? "none"
    })`,
  ).toBe(true);

  expect(
    Number.isFinite(state.centre?.lat),
    "centre latitude is not finite",
  ).toBe(true);
  expect(
    Number.isFinite(state.centre?.lng),
    "centre longitude is not finite",
  ).toBe(true);
  expect(Number.isFinite(state.zoom), "zoom is not finite").toBe(true);

  expect(circle.found, "Circle layer was not added to the data layer").toBe(
    true,
  );
  expect(circle.attached, "Circle layer is not attached to the Map").toBe(true);
  expect(circle.boundsValid, "Circle bounds are not valid").toBe(true);

  await expect
    .poll(() => countLoadedTiles(page), { timeout: 20_000 })
    .toBeGreaterThan(0);

  errors.assertNoErrors();
});

// ---------------------------------------------------------------------------
// Empty Map
// ---------------------------------------------------------------------------

test("empty map falls back to the configured default view", async ({
  page,
  waymark,
}) => {
  test.setTimeout(90_000);
  const errors = startErrorGate(page);
  await stubBasemapTiles(page);

  const map = waymark.getMap("empty-map");

  await page.goto(map.permalink);
  await expectVisibleMap(page);
  await waitForWaymarkMap(page);

  const state = await readMapState(page);
  const defaults = await readConfiguredDefaultView(page);

  console.log(
    `[map-view-defaults] empty-map: map=${JSON.stringify(state)}, ` +
      `config=${JSON.stringify(defaults)}, errors=${JSON.stringify(
        errors.summary(),
      )}`,
  );

  expect(
    defaults,
    "waymark_user_config.map_options is missing from the page",
  ).not.toBeNull();
  expect(
    Array.isArray(defaults.latlng),
    "map_default_latlng is not exposed as an array",
  ).toBe(true);
  expect(
    Number.isFinite(defaults.zoom),
    "map_default_zoom is not a number",
  ).toBe(true);

  expect(
    state.loaded,
    `Map is not loaded (${errors.pageErrors.length} page errors, first: ${
      errors.pageErrors[0] ?? "none"
    })`,
  ).toBe(true);

  expect(state.centre?.lat, "centre latitude is not finite").toBeCloseTo(
    defaults.latlng[0],
    4,
  );
  expect(state.centre?.lng, "centre longitude is not finite").toBeCloseTo(
    defaults.latlng[1],
    4,
  );
  expect(state.zoom, "zoom does not match the configured default").toBe(
    defaults.zoom,
  );

  await expect
    .poll(() => countLoadedTiles(page), { timeout: 20_000 })
    .toBeGreaterThan(0);

  errors.assertNoErrors();
});
