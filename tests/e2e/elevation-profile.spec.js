// Regression coverage for issue #87: a Line whose elevation values are all
// zero must not show the elevation profile.
//
// Exporters write `<ele>0</ele>` when they have no elevation source, so an
// all-zero track is treated as having no elevation data. The viewer creates
// the elevation container whenever the feature is enabled, but it must stay
// hidden for such a track and still appear for one with real elevation.
//
// Neither Map under test is part of the frozen screenshot captures, so both
// tests serve every basemap tile from memory.
"use strict";

const { test, expect } = require("./fixtures");

const TILE_URL_PATTERN =
  /^https?:\/\/(?:[a-z0-9-]+\.)*tile\.(?:openstreetmap|opentopomap)\.org\//i;

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

// ---------------------------------------------------------------------------
// Test 1: all-zero elevation hides the profile
// ---------------------------------------------------------------------------

test("all-zero elevation track hides the elevation profile", async ({
  page,
  waymark,
}) => {
  test.setTimeout(90_000);
  const assertNoErrors = startErrorGate(page);
  await stubBasemapTiles(page);

  const map = waymark.getMap("flat-elevation");

  await page.goto(map.permalink);
  await expect(page.locator(".waymark-is-viewer")).toBeVisible();

  // Do not call settleMap(): it waits for the elevation SVG, which must never
  // appear here. Wait for Leaflet itself and the rendered Line path instead.
  await expect(page.locator(".leaflet-container")).toBeVisible();
  await expect(
    page.locator(".leaflet-overlay-pane path.leaflet-interactive"),
  ).toHaveCount(1);

  // The container exists because the viewer feature is enabled, but it must be
  // hidden: the track has coordinates with third ordinates, all of them zero.
  const elevationContainer = page.locator(".waymark-elevation-container");
  await expect(elevationContainer).toHaveCount(1);
  await expect(elevationContainer).toBeHidden();

  // Exercise the Line click path as well: a click must not reveal a profile
  // for a track with no elevation source.
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
      .click({ force: true });
  }

  await page.waitForTimeout(500);
  await expect(elevationContainer).toBeHidden();

  assertNoErrors();
});

// ---------------------------------------------------------------------------
// Test 2: real elevation still shows the profile
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

  // The chart lazy-loads its d3 build, so allow a generous timeout.
  await expect(page.locator(".waymark-elevation-container svg")).toBeVisible({
    timeout: 30_000,
  });

  assertNoErrors();
});
