// Regression coverage for issue #89: the editor info-window image control.
//
//   * A marker without an image URL keeps its intentional 60x60 placeholder
//     box, but hovering it must not blow it up to 240x240 over the rest of the
//     info window.
//   * Images that are not square are cropped to fill (object-fit: cover) at the
//     same size as their anchor instead of being stretched.
//   * The enlargement uses a smooth 0.4s transition for width, height and left,
//     with a prefers-reduced-motion opt-out.
//
// The seeded Map "cape-scott-trail" supplies both cases: "Pub Name" has no
// image URL at all, and "The Shoe Tree" links to a non-square (1024x683)
// original.
"use strict";

const { test, expect, waitForLayoutStable } = require("./fixtures");

const MAP_SLUG = "cape-scott-trail";
// Feature titles come from tests/fixtures/demo/maps/cape-scott-trail.geojson.
// seed-output.json describes the Map, images and settings but not individual
// feature titles, so the two titles this spec needs remain constants.
const NO_IMAGE_TITLE = "Pub Name";
const IMAGE_TITLE = "The Shoe Tree";

const PLACEHOLDER_SIZE = 60;
const HOVER_SIZE = 240;
const POPUP_ANCHOR_SELECTOR = "li.waymark-info-image_large_url a";

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
 * Serve every basemap tile from memory. The image hover checks never zoom, but
 * this keeps them independent of the frozen capture pack.
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
 * Open the seeded Map in the classic editor and let the Map settle. The editor
 * opens its last layer's popup on load; the settle helper closes it.
 *
 * @param {import("@playwright/test").Page} page
 * @param {object} waymark the extended-test fixture
 */
async function openEditor(page, waymark) {
  const map = waymark.getMap(MAP_SLUG);
  await page.goto(`/wp-admin/post.php?post=${map.id}&action=edit`);
  await page.locator(".waymark-is-editor").waitFor({ state: "visible" });
  await waymark.settleMap(page);
}

/**
 * Close every popup and wait until none remain, so a transient popup from an
 * earlier layer cannot be mistaken for the one under test.
 *
 * @param {import("@playwright/test").Page} page
 */
async function closeOpenPopups(page) {
  await page.evaluate(() => {
    if (!window.Waymark) {
      return;
    }

    if (window.Waymark.map_data) {
      window.Waymark.map_data.eachLayer((layer) => {
        if (layer && typeof layer.closePopup === "function") {
          layer.closePopup();
        }
      });
    }

    if (
      window.Waymark.map &&
      typeof window.Waymark.map.closePopup === "function"
    ) {
      window.Waymark.map.closePopup();
    }
  });

  await expect(page.locator(".leaflet-popup")).toHaveCount(0);
}

/**
 * Open the popup of the seeded layer whose feature title matches, then return a
 * locator scoped to that popup. Every hover, read and assertion in a test uses
 * this one locator, never a bare page-wide `.leaflet-popup` or `.last()`.
 *
 * @param {import("@playwright/test").Page} page
 * @param {string} title
 * @returns {Promise<import("@playwright/test").Locator>}
 */
async function openPopupByTitle(page, title) {
  await closeOpenPopups(page);

  const found = await page.evaluate((targetTitle) => {
    if (!window.Waymark || !window.Waymark.map_data) {
      return false;
    }

    let opened = false;
    window.Waymark.map_data.eachLayer((layer) => {
      const properties = layer.feature && layer.feature.properties;
      if (
        properties &&
        properties.title === targetTitle &&
        typeof layer.openPopup === "function"
      ) {
        layer.openPopup();
        opened = true;
      }
    });

    return opened;
  }, title);

  expect(found, `No seeded layer titled "${title}"`).toBe(true);

  const popup = page.locator(".leaflet-popup").filter({
    has: page.locator(`.waymark-info-title input[value="${title}"]`),
  });

  await expect(popup).toHaveCount(1);
  await expect(popup).toBeVisible();
  await expect(popup.locator(".waymark-info-title input")).toHaveValue(title);

  return popup;
}

/**
 * Read the image anchor and its child image from the scoped anchor element.
 *
 * Rect dimensions are rounded because the transition's intermediate frames can
 * land on fractional pixels.
 *
 * @param {import("@playwright/test").Locator} anchor
 * @returns {Promise<object|null>}
 */
async function readImageControl(anchor) {
  return anchor.evaluate((element) => {
    const img = element.querySelector("img");
    if (!img) {
      return null;
    }

    const anchorStyle = getComputedStyle(element);
    const imgStyle = getComputedStyle(img);
    const anchorRect = element.getBoundingClientRect();
    const imgRect = img.getBoundingClientRect();

    return {
      href: element.getAttribute("href"),
      hasHoverClass: element.classList.contains("waymark-hover"),
      anchorWidth: anchorStyle.width,
      anchorHeight: anchorStyle.height,
      anchorLeft: Math.round(anchorRect.left),
      transitionDuration: anchorStyle.transitionDuration,
      transitionProperty: anchorStyle.transitionProperty,
      transitionTimingFunction: anchorStyle.transitionTimingFunction,
      objectFit: imgStyle.objectFit,
      anchorRect: {
        left: Math.round(anchorRect.left),
        top: Math.round(anchorRect.top),
        width: Math.round(anchorRect.width),
        height: Math.round(anchorRect.height),
      },
      imgRect: {
        width: Math.round(imgRect.width),
        height: Math.round(imgRect.height),
      },
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
    };
  });
}

/**
 * Split a computed comma-separated CSS list into trimmed values.
 *
 * @param {string} value
 * @returns {string[]}
 */
function splitCssList(value) {
  return value.split(",").map((item) => item.trim());
}

/**
 * Wait until the scoped image control's box has stopped changing on screen.
 * The helper needs the anchor locator so it reads the same element the test
 * hovers.
 *
 * Position is part of the measured box because opening a popup makes Leaflet
 * auto-pan the map to reveal it. Hovering mid-pan adds the hover class and then
 * removes it again when the moving popup slides out from under the stationary
 * pointer, so the control must be settled before it is hovered.
 *
 * @param {import("@playwright/test").Locator} anchor
 * @param {{ quietMs?: number, timeoutMs?: number }} [options]
 */
async function waitForImageControlStable(anchor, options = {}) {
  await waitForLayoutStable(
    async () => {
      const metrics = await readImageControl(anchor);
      return metrics
        ? {
            left: metrics.anchorRect.left,
            top: metrics.anchorRect.top,
            width: metrics.anchorRect.width,
            height: metrics.anchorRect.height,
          }
        : null;
    },
    { quietMs: 500, timeoutMs: 5_000, ...options },
  );
}

// ---------------------------------------------------------------------------
// Test 1: a marker without an image keeps its placeholder size on hover
// ---------------------------------------------------------------------------

test("marker without an image keeps its 60px placeholder on hover", async ({
  page,
  waymark,
}) => {
  test.setTimeout(120_000);
  const assertNoErrors = startErrorGate(page);
  await stubBasemapTiles(page);

  await waymark.login(page);
  await openEditor(page, waymark);

  const popup = await openPopupByTitle(page, NO_IMAGE_TITLE);
  const anchor = popup.locator(POPUP_ANCHOR_SELECTOR);
  await expect(anchor).toHaveCount(1);
  await expect(anchor).toBeVisible();

  // Opening the popup auto-pans the map to reveal it. Let that pan finish
  // before hovering: a popup still in motion slides out from under the pointer
  // and fires mouseleave, removing the hover class the test is about to read.
  await waitForImageControlStable(anchor);

  const initial = await readImageControl(anchor);
  expect(initial, "the image control is missing").not.toBeNull();
  expect(
    initial.href ?? "",
    "the no-image marker still has a real image href",
  ).toBe("");
  expect(initial.anchorWidth, "placeholder width before hovering").toBe(
    `${PLACEHOLDER_SIZE}px`,
  );
  expect(initial.anchorHeight, "placeholder height before hovering").toBe(
    `${PLACEHOLDER_SIZE}px`,
  );

  await anchor.hover();

  // The hover class is still applied; the CSS guard is what excludes anchors
  // without a real href. Asserting the class proves the hover actually ran.
  await expect(anchor).toHaveClass(/waymark-hover/);

  // Sampling until the geometry is stable also catches a transition that is
  // still growing the box; the placeholder never moves.
  await waitForImageControlStable(anchor);

  const hovered = await readImageControl(anchor);
  expect(
    hovered,
    "the image control disappeared while hovering",
  ).not.toBeNull();
  expect(hovered.hasHoverClass, "the hover class was not applied").toBe(true);
  expect(hovered.anchorWidth, "placeholder width while hovering").toBe(
    `${PLACEHOLDER_SIZE}px`,
  );
  expect(hovered.anchorHeight, "placeholder height while hovering").toBe(
    `${PLACEHOLDER_SIZE}px`,
  );
  expect(hovered.imgRect, "the image box changed size on hover").toEqual(
    initial.imgRect,
  );
  expect(
    hovered.anchorRect.width,
    `the placeholder grew to the ${HOVER_SIZE}px hover size`,
  ).toBeLessThan(HOVER_SIZE);
  expect(
    hovered.anchorRect.height,
    `the placeholder grew to the ${HOVER_SIZE}px hover size`,
  ).toBeLessThan(HOVER_SIZE);

  // The production case has no href attribute. The empty-string branch must be
  // guarded too, so exercise it directly on the same scoped anchor.
  await anchor.evaluate((element) => element.setAttribute("href", ""));
  await expect(anchor).toHaveClass(/waymark-hover/);
  await waitForImageControlStable(anchor, { quietMs: 250 });

  const emptyHref = await readImageControl(anchor);
  expect(
    emptyHref,
    "the image control disappeared with an empty href",
  ).not.toBeNull();
  expect(emptyHref.href, "the empty href was not retained").toBe("");
  expect(emptyHref.anchorWidth, "placeholder width with an empty href").toBe(
    `${PLACEHOLDER_SIZE}px`,
  );
  expect(emptyHref.anchorHeight, "placeholder height with an empty href").toBe(
    `${PLACEHOLDER_SIZE}px`,
  );
  expect(emptyHref.imgRect, "the image box changed with an empty href").toEqual(
    initial.imgRect,
  );

  assertNoErrors();
});

// ---------------------------------------------------------------------------
// Test 2: an image marker crops to fill and transitions on hover
// ---------------------------------------------------------------------------

test("image marker crops to fill during a 0.4s hover transition", async ({
  page,
  waymark,
}) => {
  test.setTimeout(120_000);
  const assertNoErrors = startErrorGate(page);
  await stubBasemapTiles(page);

  await waymark.login(page);
  await openEditor(page, waymark);

  const popup = await openPopupByTitle(page, IMAGE_TITLE);
  const anchor = popup.locator(POPUP_ANCHOR_SELECTOR);
  await expect(anchor).toHaveCount(1);
  await expect(anchor).toBeVisible();

  // Let the popup's auto-pan settle before the image work and hover, so the
  // box cannot move out from under the pointer once the hover class is set.
  await waitForImageControlStable(anchor);

  const img = anchor.locator("img");
  await expect(img).toHaveCount(1);

  // The shared harness disables transitions and emulates reduced motion for
  // determinism. Re-enable both so the hover transition can be observed.
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.evaluate(() => {
    const deterministic = document.querySelector(
      "[data-waymark-deterministic]",
    );
    if (deterministic) {
      deterministic.remove();
    }
  });

  const href = await anchor.getAttribute("href");
  expect(href, "the image marker has no linked image URL").toBeTruthy();

  // The seeded preview points at WordPress's square 150x150 thumbnail. Swap in
  // the linked original so crop-to-fill is exercised with a genuinely
  // non-square source image.
  await img.evaluate((element, url) => {
    element.src = url;
  }, href);

  await expect
    .poll(
      async () => {
        const natural = await img.evaluate((element) => [
          element.naturalWidth,
          element.naturalHeight,
        ]);
        return {
          loaded: natural[0] > 0,
          nonSquare: natural[0] !== natural[1],
        };
      },
      { timeout: 10_000 },
    )
    .toEqual({ loaded: true, nonSquare: true });

  const rest = await readImageControl(anchor);
  expect(rest, "the image control is missing").not.toBeNull();
  expect(rest.naturalWidth, "the preview image did not load").toBeGreaterThan(
    0,
  );
  expect(
    rest.naturalWidth,
    "the source image must be non-square for the crop check",
  ).not.toBe(rest.naturalHeight);
  expect(rest.objectFit, "the editor image is not cropped to fill").toBe(
    "cover",
  );
  expect(rest.anchorWidth, "anchor width at rest").toBe(
    `${PLACEHOLDER_SIZE}px`,
  );
  expect(rest.anchorHeight, "anchor height at rest").toBe(
    `${PLACEHOLDER_SIZE}px`,
  );
  expect(rest.imgRect, "the image does not fill its anchor at rest").toEqual({
    width: PLACEHOLDER_SIZE,
    height: PLACEHOLDER_SIZE,
  });

  const properties = splitCssList(rest.transitionProperty);
  for (const property of ["width", "height", "left"]) {
    expect(
      properties,
      `the hover transition does not cover ${property}`,
    ).toContain(property);
  }

  const durations = splitCssList(rest.transitionDuration);
  expect(durations, "unexpected transition duration list").toHaveLength(
    properties.length,
  );
  for (const duration of durations) {
    expect(duration, "the hover transition is not 0.4s").toBe("0.4s");
  }

  const timingFunctions = splitCssList(rest.transitionTimingFunction);
  expect(timingFunctions, "unexpected transition timing list").toHaveLength(
    properties.length,
  );
  for (const timingFunction of timingFunctions) {
    expect(timingFunction, "the hover transition is not linear").toBe("linear");
  }

  await anchor.hover();
  await expect(anchor).toHaveClass(/waymark-hover/);

  await expect
    .poll(
      async () => {
        const metrics = await readImageControl(anchor);
        return metrics ? metrics.anchorWidth : null;
      },
      { timeout: 5_000 },
    )
    .toBe(`${HOVER_SIZE}px`);

  const hovered = await readImageControl(anchor);
  expect(
    hovered,
    "the image control disappeared while hovering",
  ).not.toBeNull();
  expect(hovered.hasHoverClass, "the hover class was not applied").toBe(true);
  expect(hovered.anchorWidth, "anchor width while hovering").toBe(
    `${HOVER_SIZE}px`,
  );
  expect(hovered.anchorHeight, "anchor height while hovering").toBe(
    `${HOVER_SIZE}px`,
  );
  expect(
    hovered.anchorLeft,
    "the hovered anchor did not shift left",
  ).toBeLessThan(rest.anchorLeft);
  expect(hovered.imgRect, "the hovered image is not square").toEqual({
    width: HOVER_SIZE,
    height: HOVER_SIZE,
  });
  expect(hovered.naturalWidth, "the source image changed during hover").toBe(
    rest.naturalWidth,
  );
  expect(hovered.naturalHeight, "the source image changed during hover").toBe(
    rest.naturalHeight,
  );
  expect(hovered.objectFit, "the hovered image lost its cover crop").toBe(
    "cover",
  );

  // The reduced-motion opt-out must collapse the transition.
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect
    .poll(
      async () => {
        const metrics = await readImageControl(anchor);
        return metrics ? splitCssList(metrics.transitionDuration) : null;
      },
      { timeout: 5_000 },
    )
    .toEqual(["0s"]);

  assertNoErrors();
});
