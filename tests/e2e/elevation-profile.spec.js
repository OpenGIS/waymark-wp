// Regression coverage for issue #87: a Line whose elevation values are all
// zero still has a profile, but it is flat.
//
// Exporters write `<ele>0</ele>` when they have no elevation source, so a
// fully 3D all-zero track is treated as flat rather than elevation-less. The
// viewer keeps the chart visible and marks the map container with
// `zero-elevation`, which centres the elevation pane's transform origin so a
// flat profile cannot scale out of view. A track with missing or unparseable
// elevation values has no reliable profile and keeps the chart hidden.
//
// Neither Map under test is part of the frozen screenshot captures, so both
// tests serve every basemap tile from memory.
"use strict";

const { test, expect } = require("./fixtures");

const TILE_URL_PATTERN =
  /^https?:\/\/(?:[a-z0-9-]+\.)*tile\.(?:openstreetmap|opentopomap)\.org\//i;

// The elevation SVG extends 10% beyond the map on every side (Leaflet's
// renderer padding). Anything far beyond that means the pane has scaled away
// from the map.
const PANE_TOLERANCE_PX = 80;

// 1x1 transparent PNG.
const TRANSPARENT_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Serve every basemap tile from memory.
 *
 * Installed in the test body, after the `waymark` fixture's tile routes, so
 * Playwright's reverse-registration precedence lets this route win.
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
 * jQuery Migrate emits deprecation notices as console errors on some
 * WordPress versions; neither is a test failure.
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

  return () => {
    expect(
      consoleErrors,
      `Console errors:\n${consoleErrors.join("\n")}`,
    ).toEqual([]);
    expect(pageErrors, `Page errors:\n${pageErrors.join("\n")}`).toEqual([]);
  };
}

/**
 * Dispatch a bubbling click on the Line's Leaflet path and report whether the
 * event reached the layer. Leaflet binds its DOM listeners to the SVG path, so
 * a synthetic bubbling MouseEvent exercises the same handler as a real click.
 *
 * @param {import("@playwright/test").Page} page
 * @returns {Promise<{ dispatched: boolean, reachedLeaflet: boolean }>}
 */
function dispatchLineClick(page) {
  return page.evaluate(() => {
    const path = document.querySelector(
      ".leaflet-overlay-pane path.leaflet-interactive",
    );

    if (!path) {
      return { dispatched: false, reachedLeaflet: false };
    }

    let reachedLeaflet = false;

    // A single Map per page, so the global Waymark instance is this viewer.
    if (window.Waymark && window.Waymark.map_data) {
      window.Waymark.map_data.eachLayer((layer) => {
        if (
          layer.feature &&
          layer.feature.geometry &&
          layer.feature.geometry.type === "LineString"
        ) {
          layer.once("click", () => {
            reachedLeaflet = true;
          });
        }
      });
    }

    path.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        view: window,
      }),
    );

    return { dispatched: true, reachedLeaflet };
  });
}

/**
 * Hover the chart so Leaflet creates the elevation pane and shows its height
 * indicator. The chart lazy-loads its d3 build, so callers must first wait for
 * the chart SVG to be visible.
 *
 * @param {import("@playwright/test").Page} page
 */
async function hoverElevationChart(page) {
  await page
    .locator(".waymark-elevation-container svg")
    .first()
    .hover({ force: true });

  await expect(page.locator(".leaflet-elevation-pane svg")).toBeVisible();
}

/**
 * Read the height indicator rendered into the elevation pane.
 *
 * For a flat profile the guard must keep both the label and the indicator line
 * finite; before the guard they were written as `NaN`, which logged SVG
 * attribute errors.
 *
 * @param {import("@playwright/test").Page} page
 */
function readHeightIndicator(page) {
  return page.evaluate(() => {
    const pane = document.querySelector(".leaflet-elevation-pane");
    const label = pane.querySelector(".height-focus-label");
    const line = pane.querySelector(".height-focus.line");

    return {
      text: label.textContent.trim(),
      visibility: getComputedStyle(label).visibility,
      labelY: label.getAttribute("y"),
      lineY1: line.getAttribute("y1"),
      lineY2: line.getAttribute("y2"),
    };
  });
}

/**
 * Measure the map container, the elevation pane SVG and the SVG's computed
 * transform origin.
 *
 * @param {import("@playwright/test").Page} page
 */
function measureElevationPane(page) {
  return page.evaluate(() => {
    const round = (value) => Math.round(value * 10) / 10;

    const box = (element) => {
      const rect = element.getBoundingClientRect();
      return {
        left: round(rect.left),
        top: round(rect.top),
        right: round(rect.right),
        bottom: round(rect.bottom),
        width: round(rect.width),
        height: round(rect.height),
      };
    };

    const map = document.querySelector(".waymark-map-container");
    const svg = document.querySelector(".leaflet-elevation-pane svg");
    const animated = svg.matches(".leaflet-zoom-animated")
      ? svg
      : svg.querySelector(".leaflet-zoom-animated");

    return {
      map: box(map),
      pane: box(svg),
      transformOrigin: getComputedStyle(animated).transformOrigin,
    };
  });
}

/**
 * @param {{ map: object, pane: object }} measurement
 * @param {number} tolerance
 */
function expectPaneWithinMap(measurement, tolerance) {
  const { map, pane } = measurement;
  const overflow = {
    left: Math.max(0, map.left - pane.left),
    top: Math.max(0, map.top - pane.top),
    right: Math.max(0, pane.right - map.right),
    bottom: Math.max(0, pane.bottom - map.bottom),
  };

  for (const [side, value] of Object.entries(overflow)) {
    expect(
      value,
      `Elevation pane overflows the map's ${side} edge by ${value}px ` +
        `(pane: ${JSON.stringify(pane)}, map: ${JSON.stringify(map)})`,
    ).toBeLessThanOrEqual(tolerance);
  }
}

/**
 * Assert the transform origin resolves to the centre of the pane, not
 * Leaflet's top-left default.
 *
 * @param {{ pane: object, transformOrigin: string }} measurement
 */
function expectCentredOrigin(measurement) {
  const { pane, transformOrigin } = measurement;

  expect(
    transformOrigin,
    "Leaflet's top-left transform origin would scale a flat profile away from the map",
  ).not.toBe("0px 0px");

  const parts = transformOrigin.split(/\s+/);
  const toPixels = (value, size) =>
    value.endsWith("%") ? (parseFloat(value) / 100) * size : parseFloat(value);

  expect(toPixels(parts[0], pane.width)).toBeCloseTo(pane.width / 2, 0);
  expect(toPixels(parts[1], pane.height)).toBeCloseTo(pane.height / 2, 0);
}

// ---------------------------------------------------------------------------
// Test 1: an all-zero elevation track shows a flat profile
// ---------------------------------------------------------------------------

test("all-zero elevation track shows a flat, correctly positioned profile", async ({
  page,
  waymark,
}) => {
  test.setTimeout(90_000);
  const assertNoErrors = startErrorGate(page);
  await stubBasemapTiles(page);

  const map = waymark.getMap("flat-elevation");

  await page.goto(map.permalink);
  await expect(page.locator(".waymark-is-viewer")).toBeVisible();

  await expect(page.locator(".leaflet-container")).toBeVisible();
  await expect(
    page.locator(".leaflet-overlay-pane path.leaflet-interactive").first(),
  ).toBeVisible();

  const mapContainer = page.locator(".waymark-map-container");
  const elevationContainer = page.locator(".waymark-elevation-container");
  const chartSvg = elevationContainer.locator("svg");

  // The chart lazy-loads its d3 build, so allow a generous timeout. A fully 3D
  // all-zero track is flat: the chart is shown, not hidden.
  await expect(elevationContainer).toBeVisible({ timeout: 30_000 });
  await expect(chartSvg).toBeVisible({ timeout: 30_000 });
  await expect(mapContainer).toHaveClass(/zero-elevation/);

  // Hovering the chart shows the height indicator and creates the elevation
  // pane. A flat profile used to divide by a zero maximum and write NaN into
  // the SVG attributes, which logged console errors; the guard keeps the
  // indicator finite. The strict error gate below proves the fix.
  await hoverElevationChart(page);

  const heightLabel = page.locator(
    ".leaflet-elevation-pane .height-focus-label",
  );
  await expect(heightLabel).toBeVisible();

  const indicator = await readHeightIndicator(page);
  console.log(
    `[elevation-profile] flat height indicator: ${JSON.stringify(indicator)}`,
  );

  expect(indicator.visibility).toBe("visible");
  expect(indicator.text).toMatch(/^0(?:\.0+)?\s+(?:m|ft)$/i);

  for (const [name, value] of Object.entries({
    labelY: indicator.labelY,
    lineY1: indicator.lineY1,
    lineY2: indicator.lineY2,
  })) {
    expect(value, `${name} must not be NaN`).not.toBe("NaN");
    expect(Number.isFinite(Number(value)), `${name} must be finite`).toBe(true);
  }

  // A flat profile's indicator has no vertical extent.
  expect(Number(indicator.lineY2)).toBeCloseTo(Number(indicator.lineY1), 5);

  // The pane stays anchored to the map with a centred transform origin. This
  // is the defect: with Leaflet's top-left origin, a scaled flat profile flies
  // out of view.
  const measurement = await measureElevationPane(page);
  console.log(
    `[elevation-profile] flat map measurement: ${JSON.stringify(measurement)}`,
  );

  expectPaneWithinMap(measurement, PANE_TOLERANCE_PX);
  expectCentredOrigin(measurement);

  // Exercise the Line click path: a click must keep the flat profile and its
  // class rather than clearing or hiding the chart.
  const click = await dispatchLineClick(page);

  expect(click.dispatched, "No Line path to click").toBe(true);

  if (click.reachedLeaflet) {
    console.log(
      "[elevation-profile] dispatched bubbling MouseEvent reached Leaflet",
    );
  } else {
    console.log(
      "[elevation-profile] dispatched MouseEvent did not reach Leaflet; using a forced Playwright click",
    );
    await page
      .locator(".leaflet-overlay-pane path.leaflet-interactive")
      .first()
      .click({ force: true });
  }

  await expect(chartSvg).toBeVisible({ timeout: 30_000 });
  await expect(mapContainer).toHaveClass(/zero-elevation/);

  assertNoErrors();
});

// ---------------------------------------------------------------------------
// Test 2: real elevation still shows the profile without the flat class
// ---------------------------------------------------------------------------

test("real elevation track still shows the elevation profile", async ({
  page,
  waymark,
}) => {
  test.setTimeout(90_000);
  const assertNoErrors = startErrorGate(page);
  await stubBasemapTiles(page);

  const map = waymark.getMap("cape-scott-trail");

  await page.goto(map.permalink);
  await expect(page.locator(".waymark-is-viewer")).toBeVisible();

  const mapContainer = page.locator(".waymark-map-container");

  // The chart lazy-loads its d3 build, so allow a generous timeout.
  await expect(page.locator(".waymark-elevation-container svg")).toBeVisible({
    timeout: 30_000,
  });

  // A genuine profile keeps Leaflet's default transform origin.
  await expect(mapContainer).not.toHaveClass(/zero-elevation/);

  await hoverElevationChart(page);

  const measurement = await measureElevationPane(page);
  console.log(
    `[elevation-profile] real-elevation map measurement: ${JSON.stringify(measurement)}`,
  );

  expectPaneWithinMap(measurement, PANE_TOLERANCE_PX);

  assertNoErrors();
});
