// Regression coverage for issue #84: a Map info window ("popup") must stay
// inside the Map container when the Map zooms out.
//
// The editor popup is 341px tall and `.leaflet-container` clips its overflow.
// Leaflet only auto-pans when a popup opens or updates, so zooming out used to
// move the popup's top above the clip line and leave its title input and image
// upload button unclickable. Waymark now re-fits the open popup on `zoomend`.
//
// These specs zoom past the frozen screenshot tile pack, so they serve a
// transparent PNG for every basemap tile: tile pixels cannot affect popup
// geometry, and the pack only covers the capture zooms.
"use strict";

const { test, expect, waitForLayoutStable } = require("./fixtures");

const EDITOR_POST_ID = 100;
const VIEWER_MAP_SLUG = "cape-scott-trail";
const EDITOR_LINE_TITLE = "North North Island";
const VIEWER_POPUP_TITLE = "The Scarlet Ibis";
const EDITOR_POPUP_HEIGHT = 341;
const ZOOM_SETTLE_MS = 700;

const TILE_URL_PATTERN =
  /^https?:\/\/(?:[a-z0-9-]+\.)*tile\.(?:openstreetmap|opentopomap)\.org\//i;

// 1x1 transparent PNG.
const TRANSPARENT_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

// The editor Map now follows the configured Map Height with a 450px floor
// (issue #88). This viewport is wide enough for the meta box to lay out at
// that height and keeps the 341px popup within the viewport, so the
// elementFromPoint hit tests below can reach its controls.
test.use({ viewport: { width: 1600, height: 800 } });

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Serve every basemap tile from memory so zooming out never needs a tile that
 * is absent from the frozen capture pack.
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
 * Open the popup of the first layer whose feature title matches, iterating a
 * Map instance's data layer. autoPan is left enabled, unlike the screenshot
 * helper: the test needs the natural open/zoom behaviour.
 *
 * @param {import("@playwright/test").Page} page
 * @param {string} title
 * @param {number} [mapIndex] index into `.waymark-map`
 * @returns {Promise<boolean>} whether a matching layer was found
 */
async function openPopupByTitle(page, title, mapIndex = 0) {
  return page.evaluate(
    ({ targetTitle, mapIndex: index }) => {
      const element = document.querySelectorAll(".waymark-map")[index];
      const waymark =
        (element && window.jQuery(element).data("Waymark")) || window.Waymark;

      if (!waymark || !waymark.map_data) {
        return false;
      }

      let found = false;
      waymark.map_data.eachLayer((layer) => {
        const properties = layer.feature && layer.feature.properties;
        if (
          properties &&
          properties.title === targetTitle &&
          typeof layer.openPopup === "function"
        ) {
          layer.openPopup();
          found = true;
        }
      });

      return found;
    },
    { targetTitle: title, mapIndex },
  );
}

/**
 * Measure a Map's open popup and its container in viewport coordinates, with
 * optional `elementFromPoint` hit tests on popup descendants.
 *
 * @param {import("@playwright/test").Page} page
 * @param {{ mapSelector?: string, mapIndex?: number, hitSelectors?: Record<string, string> }} [options]
 * @returns {Promise<object|null>}
 */
async function measurePopupGeometry(page, options = {}) {
  return page.evaluate(
    ({ mapSelector, mapIndex, hitSelectors }) => {
      const map = document.querySelectorAll(mapSelector)[mapIndex];
      if (!map) {
        return null;
      }

      const popup = map.querySelector(".leaflet-popup");
      if (!popup) {
        return null;
      }

      const popupRect = popup.getBoundingClientRect();
      const mapRect = map.getBoundingClientRect();
      const hits = {};

      for (const [key, selector] of Object.entries(hitSelectors)) {
        const element = popup.querySelector(selector);
        if (!element) {
          hits[key] = { found: false };
          continue;
        }

        const rect = element.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        const target = document.elementFromPoint(x, y);

        hits[key] = {
          found: true,
          matches: target === element,
          target: target
            ? `${target.tagName.toLowerCase()}.${target.className}`
            : null,
          centre: { x, y },
        };
      }

      return {
        popup: {
          top: popupRect.top,
          bottom: popupRect.bottom,
          left: popupRect.left,
          right: popupRect.right,
          height: popupRect.height,
          offsetHeight: popup.offsetHeight,
        },
        map: {
          top: mapRect.top,
          bottom: mapRect.bottom,
          left: mapRect.left,
          right: mapRect.right,
          height: mapRect.height,
        },
        hits,
      };
    },
    {
      mapSelector: options.mapSelector ?? ".waymark-map",
      mapIndex: options.mapIndex ?? 0,
      hitSelectors: options.hitSelectors ?? {},
    },
  );
}

/**
 * Wait for the popup to exist, then for its position relative to the Map to
 * stop changing. Popup auto-pan and zoom animations both move it, and the
 * description editor can grow it after TinyMCE initialises.
 *
 * @param {import("@playwright/test").Page} page
 * @param {object} options {@link measurePopupGeometry} options
 */
async function waitForPopupPlacement(page, options) {
  await expect
    .poll(() => measurePopupGeometry(page, options), { timeout: 10_000 })
    .not.toBeNull();

  await waitForLayoutStable(
    async () => {
      const geometry = await measurePopupGeometry(page, options);
      if (!geometry) {
        return null;
      }
      return {
        top: Math.round(geometry.popup.top - geometry.map.top),
        bottom: Math.round(geometry.popup.bottom - geometry.map.bottom),
        height: Math.round(geometry.popup.height),
      };
    },
    { quietMs: 250, timeoutMs: 5_000 },
  );
}

/**
 * Assert the popup is entirely inside its Map container (1px tolerance) and
 * log the observed margins for the run report.
 *
 * @param {string} label
 * @param {object} geometry result of {@link measurePopupGeometry}
 */
function assertPopupInsideMap(label, geometry) {
  const topMargin = geometry.popup.top - geometry.map.top;
  const bottomMargin = geometry.map.bottom - geometry.popup.bottom;

  console.log(
    `[info-window-zoom] ${label}: popup top ${geometry.popup.top.toFixed(
      1,
    )}px, Map top ${geometry.map.top.toFixed(1)}px ` +
      `(top margin ${topMargin.toFixed(1)}px); popup bottom ${geometry.popup.bottom.toFixed(
        1,
      )}px, Map bottom ${geometry.map.bottom.toFixed(1)}px ` +
      `(bottom margin ${bottomMargin.toFixed(
        1,
      )}px); popup height ${geometry.popup.offsetHeight}px`,
  );

  expect(
    topMargin,
    `${label}: popup top is ${Math.abs(topMargin).toFixed(
      1,
    )}px above the Map container's clip line`,
  ).toBeGreaterThanOrEqual(-1);

  expect(
    bottomMargin,
    `${label}: popup bottom extends ${Math.abs(bottomMargin).toFixed(
      1,
    )}px below the Map container`,
  ).toBeGreaterThanOrEqual(-1);
}

/**
 * Assert the centre of a popup element is not covered by another element.
 *
 * @param {string} label
 * @param {object} geometry result of {@link measurePopupGeometry}
 * @param {string} key hit selector key
 */
function assertPopupHitTestable(label, geometry, key) {
  const hit = geometry.hits[key];

  expect(hit.found, `${label}: "${key}" element is missing`).toBe(true);
  expect(
    hit.matches,
    `${label}: "${key}" centre is covered by ${hit.target}`,
  ).toBe(true);
}

/**
 * Log and assert the editor popup height at every measurement step. A future
 * sizing or CSS-scale workaround would change this even if the top margin looks
 * healthy.
 *
 * @param {string} label
 * @param {object} geometry result of {@link measurePopupGeometry}
 */
function assertEditorPopupHeight(label, geometry) {
  expect(
    Math.abs(geometry.popup.offsetHeight - EDITOR_POPUP_HEIGHT),
    `${label}: popup offsetHeight is ${
      geometry.popup.offsetHeight
    }px, expected ~${EDITOR_POPUP_HEIGHT}px`,
  ).toBeLessThanOrEqual(2);
}

/**
 * Zoom a Map out through its Waymark instance and wait for Leaflet's 250ms
 * zoom animation plus the re-fit pan to settle. The placement wait afterwards
 * removes any reliance on the exact duration.
 *
 * @param {import("@playwright/test").Page} page
 * @param {number} [mapIndex] index into `.waymark-map`
 */
async function zoomOut(page, mapIndex = 0) {
  await page.evaluate((index) => {
    const element = document.querySelectorAll(".waymark-map")[index];
    const waymark =
      (element && window.jQuery(element).data("Waymark")) || window.Waymark;
    waymark.map.zoomOut();
  }, mapIndex);

  await page.waitForTimeout(ZOOM_SETTLE_MS);
}

/**
 * Read both Map instances' centres and zooms on the multi-Map demo page.
 *
 * @param {import("@playwright/test").Page} page
 */
async function readMapState(page) {
  return page.evaluate(() =>
    [...document.querySelectorAll(".waymark-map")].map((element) => {
      const waymark = window.jQuery(element).data("Waymark");
      const centre = waymark.map.getCenter();
      return {
        centre: { lat: centre.lat, lng: centre.lng },
        zoom: waymark.map.getZoom(),
      };
    }),
  );
}

// ---------------------------------------------------------------------------
// Test 1: editor popup stays usable after zooming out
// ---------------------------------------------------------------------------

test("editor info window stays usable after zooming out", async ({
  page,
  waymark,
}) => {
  test.setTimeout(120_000);
  const assertNoErrors = startErrorGate(page);
  await stubBasemapTiles(page);

  // Open the seeded Map in the classic editor.
  await waymark.login(page);
  await page.goto(`/wp-admin/post.php?post=${EDITOR_POST_ID}&action=edit`);
  await expect(page.locator("#waymark_map_meta")).toBeVisible();
  await page.locator(".waymark-is-editor").waitFor({ state: "visible" });
  await waymark.settleMap(page);

  // The editor opens the last layer's popup on load; settleMap closed it.
  // Open the LineString popup under test.
  const found = await openPopupByTitle(page, EDITOR_LINE_TITLE, 0);
  expect(found, `No seeded LineString titled "${EDITOR_LINE_TITLE}"`).toBe(
    true,
  );

  // TinyMCE is the heaviest popup content and the part that loses its
  // interactivity when the popup is clipped, so wait for it exactly as the
  // editor smoke spec does.
  await expect(page.locator(".leaflet-popup")).toBeVisible();
  await page.waitForFunction(
    () => window.tinymce && window.tinymce.get("waymark-info-description"),
  );
  await expect(page.locator("#waymark-info-description_ifr")).toBeVisible();
  await expect(
    page.locator(".waymark-info-image_large_url .button"),
  ).toBeVisible();

  const editorGeometry = {
    mapSelector: ".waymark-is-editor",
    hitSelectors: {
      title: ".waymark-info-title input",
      imageUpload: ".waymark-info-image_large_url .button",
    },
  };

  await waitForPopupPlacement(page, editorGeometry);

  let geometry = await measurePopupGeometry(page, editorGeometry);
  assertPopupInsideMap("editor initial zoom", geometry);
  assertPopupHitTestable("editor initial zoom", geometry, "title");
  assertPopupHitTestable("editor initial zoom", geometry, "imageUpload");
  assertEditorPopupHeight("editor initial zoom", geometry);

  for (let step = 1; step <= 2; step += 1) {
    await zoomOut(page);

    await expect(page.locator(".leaflet-popup")).toBeVisible();
    await waitForPopupPlacement(page, editorGeometry);

    geometry = await measurePopupGeometry(page, editorGeometry);
    assertPopupInsideMap(`editor after zoom out ${step}`, geometry);
    assertPopupHitTestable(`editor after zoom out ${step}`, geometry, "title");
    assertPopupHitTestable(
      `editor after zoom out ${step}`,
      geometry,
      "imageUpload",
    );
    assertEditorPopupHeight(`editor after zoom out ${step}`, geometry);
  }

  // The rich text editor must still be live after the zooms, not merely
  // visible: click into its body, type, undo, and confirm the content is
  // unchanged.
  const tinymceState = await page.evaluate(() => {
    const editor = window.tinymce.get("waymark-info-description");
    return editor
      ? { present: true, connected: editor.getBody().isConnected }
      : { present: false };
  });
  expect(tinymceState, "TinyMCE description editor is not live").toEqual({
    present: true,
    connected: true,
  });

  const initialContent = await page.evaluate(() =>
    window.tinymce.get("waymark-info-description").getContent(),
  );

  const descriptionBody = page
    .frameLocator("#waymark-info-description_ifr")
    .locator("body");
  await page.locator("#waymark-info-description_ifr").scrollIntoViewIfNeeded();
  await descriptionBody.click();
  await page.keyboard.type("Q");

  await expect
    .poll(
      () =>
        page.evaluate(() =>
          window.tinymce.get("waymark-info-description").getContent(),
        ),
      { timeout: 5_000 },
    )
    .not.toBe(initialContent);

  // ControlOrMeta is Ctrl on Linux/Windows and Cmd on macOS; TinyMCE accepts
  // either, but the platform shortcut is the reliable one.
  await page.keyboard.press("ControlOrMeta+z");

  await expect
    .poll(
      () =>
        page.evaluate(() =>
          window.tinymce.get("waymark-info-description").getContent(),
        ),
      { timeout: 5_000 },
    )
    .toBe(initialContent);

  // Type into the title, then restore it. The change listener only runs on
  // blur, so undo leaves the underlying feature data unchanged.
  const titleInput = page.locator(".waymark-info-title input");
  const originalTitle = await titleInput.inputValue();
  await titleInput.click();
  await titleInput.evaluate((element) =>
    element.setSelectionRange(element.value.length, element.value.length),
  );
  await titleInput.pressSequentially("Z");
  await expect(titleInput).toHaveValue(`${originalTitle}Z`);

  await titleInput.press("ControlOrMeta+z");
  await expect(titleInput).toHaveValue(originalTitle);

  assertNoErrors();
});

// ---------------------------------------------------------------------------
// Test 2: viewer popup re-fits on zoom
// ---------------------------------------------------------------------------

test("viewer info window re-fits inside the map after zooming out", async ({
  page,
  waymark,
}) => {
  test.setTimeout(120_000);
  const assertNoErrors = startErrorGate(page);
  await stubBasemapTiles(page);

  const map = waymark.getMap(VIEWER_MAP_SLUG);

  await page.goto(map.permalink);
  await page.locator(".waymark-is-viewer").waitFor({ state: "visible" });
  await waymark.settleMap(page);

  // The elevation control re-fits the Map on resize and when its track layer
  // loads; let that drain before opening the popup so only zooming can move it
  // afterwards.
  await page
    .locator(".waymark-elevation-container svg")
    .first()
    .waitFor({ state: "visible", timeout: 20_000 })
    .catch(() => {});
  await page.waitForTimeout(750);
  await waymark.settleMap(page);

  const found = await openPopupByTitle(page, VIEWER_POPUP_TITLE, 0);
  expect(found, `No seeded marker titled "${VIEWER_POPUP_TITLE}"`).toBe(true);
  await expect(page.locator(".leaflet-popup")).toContainText(
    VIEWER_POPUP_TITLE,
  );

  const viewerGeometry = { mapSelector: ".waymark-is-viewer" };

  await waitForPopupPlacement(page, viewerGeometry);
  assertPopupInsideMap(
    "viewer initial zoom",
    await measurePopupGeometry(page, viewerGeometry),
  );

  for (let step = 1; step <= 2; step += 1) {
    await zoomOut(page);

    await expect(page.locator(".leaflet-popup")).toContainText(
      VIEWER_POPUP_TITLE,
    );
    await waitForPopupPlacement(page, viewerGeometry);
    assertPopupInsideMap(
      `viewer after zoom out ${step}`,
      await measurePopupGeometry(page, viewerGeometry),
    );
  }

  assertNoErrors();
});

// ---------------------------------------------------------------------------
// Test 3: two viewer maps on one page stay independent
// ---------------------------------------------------------------------------

test("two viewer maps keep their info windows independent", async ({
  page,
  waymark,
}) => {
  test.setTimeout(120_000);
  const assertNoErrors = startErrorGate(page);
  await stubBasemapTiles(page);

  await page.goto(waymark.seed.page.url);
  await expect(page.locator(".waymark-map")).toHaveCount(2);

  // Wait for both Map instances and their data layers, not just the global
  // `Waymark` instance the shared settle helper follows.
  await expect
    .poll(
      () =>
        page.evaluate(() =>
          [...document.querySelectorAll(".waymark-map")].map((element) => {
            const waymark = window.jQuery(element).data("Waymark");
            return Boolean(waymark && waymark.map && waymark.map_data);
          }),
        ),
      { timeout: 30_000 },
    )
    .toEqual([true, true]);

  for (const index of [0, 1]) {
    await expect
      .poll(
        () =>
          page.evaluate((mapIndex) => {
            const element = document.querySelectorAll(".waymark-map")[mapIndex];
            const waymark = window.jQuery(element).data("Waymark");
            return waymark.map_data.getLayers().length;
          }, index),
        { timeout: 30_000 },
      )
      .toBeGreaterThan(0);
  }

  await waymark.settleMap(page);

  // Each map opens its own popups as its data loads. Open the photo popup on
  // the second map, then the one on the first: opening the second must not
  // close the first (Leaflet's autoClose is scoped to a single Map).
  const openedOnSecond = await openPopupByTitle(page, VIEWER_POPUP_TITLE, 1);
  expect(
    openedOnSecond,
    `No popup titled "${VIEWER_POPUP_TITLE}" on the second Map`,
  ).toBe(true);

  const openedOnFirst = await openPopupByTitle(page, VIEWER_POPUP_TITLE, 0);
  expect(
    openedOnFirst,
    `No popup titled "${VIEWER_POPUP_TITLE}" on the first Map`,
  ).toBe(true);

  const popupOnFirst = page
    .locator(".waymark-map")
    .nth(0)
    .locator(".leaflet-popup");
  const popupOnSecond = page
    .locator(".waymark-map")
    .nth(1)
    .locator(".leaflet-popup");

  await expect(popupOnFirst).toBeVisible();
  await expect(popupOnSecond).toBeVisible();
  await expect(popupOnFirst).toContainText(VIEWER_POPUP_TITLE);
  await expect(popupOnSecond).toContainText(VIEWER_POPUP_TITLE);

  const firstGeometryOptions = { mapSelector: ".waymark-map", mapIndex: 0 };
  await waitForPopupPlacement(page, firstGeometryOptions);

  const before = await readMapState(page);
  expect(before).toHaveLength(2);

  for (let step = 1; step <= 2; step += 1) {
    await zoomOut(page, 0);
    await waitForPopupPlacement(page, firstGeometryOptions);

    assertPopupInsideMap(
      `demo first Map after zoom out ${step}`,
      await measurePopupGeometry(page, firstGeometryOptions),
    );
  }

  const after = await readMapState(page);
  expect(after).toHaveLength(2);

  // The first Map really zoomed (so the assertions above are not vacuous).
  expect(after[0].zoom).toBe(before[0].zoom - 2);

  // The re-fit is scoped to the zooming instance: the second Map's centre must
  // be untouched, proving its open popup was not panned by the first Map.
  expect(
    after[1].centre,
    "the second Map moved when the first Map was zoomed",
  ).toEqual(before[1].centre);
  expect(after[1].zoom).toBe(before[1].zoom);

  // Both popups survived the zoom.
  await expect(popupOnFirst).toBeVisible();
  await expect(popupOnSecond).toBeVisible();

  assertNoErrors();
});
