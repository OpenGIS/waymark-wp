// Browser coverage for the Map viewer's image lightbox.
//
// The San Josef Bay demo Map carries three images in draw order: the
// "San Josef Bay Trail" LineString (lightbox-only), then the "San Josef Bay"
// and "Eric Lake Camp" markers (both gallery-eligible). That mix lets these
// specs exercise popup markup, opening, keyboard navigation, every close path
// and the gallery integration against real dialog, CSS and Leaflet behaviour.
//
// Every basemap tile is served from memory: the gallery zooms to z16, which is
// past the frozen screenshot tile pack, and tile pixels cannot affect the
// assertions here.
"use strict";

const { test, expect } = require("./fixtures");

const MAP_SLUG = "san-josef-bay";
const POPUP_TITLE = "San Josef Bay";
const LINE_TITLE = "San Josef Bay Trail";
const GALLERY_TITLE = "Eric Lake Camp";

// The three seeded images in draw order, with their attachment keys.
const IMAGE_KEYS = ["shoe-tree", "san-josef-bay", "nahwitti-lake"];

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
 * Serve every basemap tile from memory so the gallery's zoom to z16 never
 * requests a tile that is absent from the frozen capture pack.
 *
 * Installed after the `waymark` fixture's routes, so Playwright's
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
 * Load a viewer Map and settle it.
 *
 * @param {import("@playwright/test").Page} page
 * @param {object} waymark fixture
 * @returns {Promise<{ id: number, slug: string, title: string, permalink: string }>}
 */
async function openViewer(page, waymark) {
  const map = waymark.getMap(MAP_SLUG);

  await page.goto(map.permalink);
  await page.locator(".waymark-is-viewer").waitFor({ state: "visible" });
  await waymark.settleMap(page);

  return map;
}

/**
 * Open the popup of the first layer whose feature title matches.
 *
 * @param {import("@playwright/test").Page} page
 * @param {string} title
 * @returns {Promise<boolean>} whether a matching layer was found
 */
async function openPopupByTitle(page, title) {
  return page.evaluate((targetTitle) => {
    const waymark = window.Waymark;
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
  }, title);
}

/**
 * Open a layer's popup, then click its photo to open the lightbox.
 *
 * @param {import("@playwright/test").Page} page
 * @param {string} title
 * @returns {Promise<{ popup: import("@playwright/test").Locator, dialog: import("@playwright/test").Locator }>}
 */
async function openLightboxFromPopup(page, title) {
  const found = await openPopupByTitle(page, title);
  expect(found, `No seeded layer titled "${title}"`).toBe(true);

  const popup = page.locator(".leaflet-popup").filter({ hasText: title });
  await expect(popup).toBeVisible();

  const photo = popup.locator(".waymark-info-image_large_url a img");
  await expect(photo).toBeVisible();
  await photo.click();

  const dialog = page.locator("dialog.waymark-lightbox");
  await expect(dialog).toBeVisible();

  return { popup, dialog };
}

/**
 * Wait for the lightbox image to finish decoding so its intrinsic dimensions,
 * and therefore the dialog's box, have settled before measuring.
 *
 * @param {import("@playwright/test").Page} page
 */
async function waitForLightboxImage(page) {
  await page.waitForFunction(
    () => {
      const image = document.querySelector(
        "dialog.waymark-lightbox .waymark-lightbox-image",
      );
      return Boolean(image && image.complete && image.naturalWidth > 0);
    },
    null,
    { timeout: 15_000 },
  );

  await page.evaluate(() => document.fonts.ready.then(() => undefined));
}

/**
 * Measure the open lightbox in a single page evaluation. Returning one plain
 * object keeps every assertion on the same snapshot, so no rounding can drift
 * between reads.
 *
 * @param {import("@playwright/test").Page} page
 * @returns {Promise<object>}
 */
async function measureLightbox(page) {
  return page.evaluate(() => {
    const dialog = document.querySelector("dialog.waymark-lightbox");
    const dialogRect = dialog.getBoundingClientRect();

    const box = (rect) => ({
      left: rect.left,
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      width: rect.width,
      height: rect.height,
    });

    const control = (selector) => {
      const element = dialog.querySelector(selector);
      return element ? box(element.getBoundingClientRect()) : null;
    };

    const caption = dialog.querySelector(".waymark-lightbox-caption");

    return {
      viewport: { width: window.innerWidth, height: window.innerHeight },
      dialog: box(dialogRect),
      dialogPosition: getComputedStyle(dialog).position,
      scrollWidth: document.documentElement.scrollWidth,
      controls: {
        close: control(".waymark-lightbox-close"),
        prev: control(".waymark-lightbox-prev"),
        next: control(".waymark-lightbox-next"),
      },
      captionFontSize: caption ? getComputedStyle(caption).fontSize : null,
    };
  });
}

/**
 * Assert the dialog is centred on both axes within 2 CSS px, fully contained
 * by the viewport, and leaves the page without horizontal overflow.
 *
 * @param {object} geometry measured by {@link measureLightbox}
 */
function expectLightboxCentred(geometry) {
  const { viewport, dialog } = geometry;

  // The shipped regression was a `position: relative` dialog. The centring
  // maths alone can pass while the page sits at scroll zero, so pin the
  // positioning scheme that anchors the viewer to the viewport.
  expect(geometry.dialogPosition).toBe("fixed");

  // Relative positioning defeated the top layer's `inset: 0; margin: auto`
  // centring and pinned the viewer to the top of the viewport.
  expect(
    Math.abs(dialog.left - (viewport.width - dialog.width) / 2),
    "Lightbox should be horizontally centred",
  ).toBeLessThanOrEqual(2);

  expect(
    Math.abs(dialog.top - (viewport.height - dialog.height) / 2),
    "Lightbox should be vertically centred",
  ).toBeLessThanOrEqual(2);

  expect(
    dialog.right,
    "Lightbox should not overflow the right edge",
  ).toBeLessThanOrEqual(viewport.width);
  expect(
    dialog.bottom,
    "Lightbox should not overflow the bottom edge",
  ).toBeLessThanOrEqual(viewport.height);
  expect(
    geometry.scrollWidth,
    "Opening the lightbox should not overflow the page horizontally",
  ).toBeLessThanOrEqual(viewport.width);
}

test.beforeEach(async ({ page }) => {
  await stubBasemapTiles(page);
});

// ---------------------------------------------------------------------------
// Popup markup and opening
// ---------------------------------------------------------------------------

test("popup photo is a lazy img link that opens the viewer at the large URL", async ({
  page,
  waymark,
}) => {
  test.setTimeout(90_000);
  const assertNoErrors = startErrorGate(page);
  const map = await openViewer(page, waymark);

  const found = await openPopupByTitle(page, POPUP_TITLE);
  expect(found, `No seeded marker titled "${POPUP_TITLE}"`).toBe(true);

  const popup = page.locator(".leaflet-popup").filter({ hasText: POPUP_TITLE });
  await expect(popup).toBeVisible();

  const link = popup.locator(".waymark-info-image_large_url a");
  await expect(link).toBeVisible();
  await expect(link).toHaveAttribute("target", "_blank");
  await expect(link).toHaveAttribute("rel", /noopener/);
  await expect(link).toHaveAttribute(
    "href",
    waymark.getImage("san-josef-bay", "large"),
  );

  const image = link.locator("img");
  await expect(image).toBeVisible();
  await expect(image).toHaveAttribute("loading", "lazy");
  await expect(image).toHaveAttribute("alt", POPUP_TITLE);
  await expect(image).toHaveAttribute(
    "src",
    waymark.getImage("san-josef-bay", "medium"),
  );

  await image.click();

  const dialog = page.locator("dialog.waymark-lightbox");
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute("open", "");
  await expect(page).toHaveURL(map.permalink);
  await expect(page.locator("html")).toHaveClass(/waymark-lightbox-open/);

  const lightboxImage = dialog.locator(".waymark-lightbox-image");
  await expect(lightboxImage).toHaveAttribute(
    "src",
    waymark.getImage("san-josef-bay", "large"),
  );

  const full = dialog.locator(".waymark-lightbox-full");
  await expect(full).toHaveAttribute(
    "href",
    waymark.getImage("san-josef-bay", "large"),
  );
  await expect(full).toHaveAttribute("target", "_blank");

  assertNoErrors();
});

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

test("arrow keys cycle every seeded image and wrap", async ({
  page,
  waymark,
}) => {
  test.setTimeout(90_000);
  const assertNoErrors = startErrorGate(page);
  await openViewer(page, waymark);

  // The LineString is the first feature, so its image is item one of three.
  const { dialog } = await openLightboxFromPopup(page, LINE_TITLE);
  const image = dialog.locator(".waymark-lightbox-image");
  const count = dialog.locator(".waymark-lightbox-count");

  const expected = IMAGE_KEYS.map((key) => waymark.getImage(key, "large"));

  await expect(count).toHaveText("1 of 3");
  await expect(image).toHaveAttribute("src", expected[0]);
  await expect(dialog).not.toHaveClass(/waymark-lightbox-single/);

  // A full cycle of ArrowRight presses visits all three images and wraps.
  const seen = [await image.getAttribute("src")];
  for (const index of [1, 2, 0]) {
    await page.keyboard.press("ArrowRight");
    await expect(image).toHaveAttribute("src", expected[index]);
    seen.push(await image.getAttribute("src"));
  }

  expect(seen).toEqual([...expected, expected[0]]);
  await expect(count).toHaveText("1 of 3");

  // ArrowLeft from the first item wraps backwards to the last image.
  await page.keyboard.press("ArrowLeft");
  await expect(image).toHaveAttribute("src", expected[2]);
  await expect(count).toHaveText("3 of 3");

  // The next button works while the dialog is not in single-item mode.
  await dialog.locator(".waymark-lightbox-next").click();
  await expect(image).toHaveAttribute("src", expected[0]);

  // ArrowRight still advances a multi-image viewer.
  await page.keyboard.press("ArrowRight");
  await expect(image).toHaveAttribute("src", expected[1]);
  await expect(count).toHaveText("2 of 3");
  await expect(dialog).not.toHaveClass(/waymark-lightbox-single/);

  assertNoErrors();
});

// ---------------------------------------------------------------------------
// Map sync on navigation
// ---------------------------------------------------------------------------

test("navigating the viewer pans the map to each feature and opens its popup", async ({
  page,
  waymark,
}) => {
  test.setTimeout(90_000);
  const assertNoErrors = startErrorGate(page);
  await openViewer(page, waymark);

  // Popup auto-pan shifts the final centre by the popup's height, so disable
  // it here; the viewer's own pan to each feature is what this test asserts.
  await page.evaluate(() => {
    window.L.Popup.prototype.options.autoPan = false;
  });

  // The LineString is item one of three, so the viewer opens without panning
  // and leaves the map at its initial bounds — the recorded baseline.
  const { dialog } = await openLightboxFromPopup(page, LINE_TITLE);
  const count = dialog.locator(".waymark-lightbox-count");
  const next = dialog.locator(".waymark-lightbox-next");

  await expect(count).toHaveText("1 of 3");

  const readCentre = () =>
    page.evaluate(() => {
      const centre = window.Waymark.map.getCenter();
      return { lat: centre.lat, lng: centre.lng };
    });

  const readPoint = (title) =>
    page.evaluate((targetTitle) => {
      let point = null;
      window.Waymark.map_data.eachLayer((layer) => {
        const properties = layer.feature && layer.feature.properties;
        if (
          properties &&
          properties.title === targetTitle &&
          typeof layer.getLatLng === "function"
        ) {
          const latlng = layer.getLatLng();
          point = { lat: latlng.lat, lng: latlng.lng };
        }
      });
      return point;
    }, title);

  const startCentre = await readCentre();
  const markerLatLng = await readPoint(POPUP_TITLE);
  expect(
    markerLatLng,
    `No seeded marker titled "${POPUP_TITLE}"`,
  ).not.toBeNull();

  await next.click();
  await expect(count).toHaveText("2 of 3");

  // Both the pan and the popup's auto-pan are animated, so poll until the map
  // has both moved from the baseline and settled on the marker.
  await expect
    .poll(
      async () => {
        const centre = await readCentre();
        return {
          moved:
            Math.abs(centre.lat - startCentre.lat) > 1e-6 ||
            Math.abs(centre.lng - startCentre.lng) > 1e-6,
          near:
            Math.abs(centre.lat - markerLatLng.lat) < 1e-3 &&
            Math.abs(centre.lng - markerLatLng.lng) < 1e-3,
        };
      },
      {
        timeout: 10_000,
        message: `Map centre should settle within 1e-3° of "${POPUP_TITLE}"`,
      },
    )
    .toEqual({ moved: true, near: true });

  await expect
    .poll(
      () =>
        page.evaluate((title) => {
          let open = false;
          window.Waymark.map_data.eachLayer((layer) => {
            const properties = layer.feature && layer.feature.properties;
            if (
              properties &&
              properties.title === title &&
              typeof layer.isPopupOpen === "function"
            ) {
              open = layer.isPopupOpen();
            }
          });
          return open;
        }, POPUP_TITLE),
      { timeout: 5_000 },
    )
    .toBe(true);

  const sanJosefCentre = await readCentre();
  const ericLatLng = await readPoint(GALLERY_TITLE);
  expect(
    ericLatLng,
    `No seeded marker titled "${GALLERY_TITLE}"`,
  ).not.toBeNull();

  await next.click();
  await expect(count).toHaveText("3 of 3");

  await expect
    .poll(
      async () => {
        const centre = await readCentre();
        return {
          moved:
            Math.abs(centre.lat - sanJosefCentre.lat) > 1e-6 ||
            Math.abs(centre.lng - sanJosefCentre.lng) > 1e-6,
          near:
            Math.abs(centre.lat - ericLatLng.lat) < 1e-3 &&
            Math.abs(centre.lng - ericLatLng.lng) < 1e-3,
        };
      },
      {
        timeout: 10_000,
        message: `Map centre should settle within 1e-3° of "${GALLERY_TITLE}"`,
      },
    )
    .toEqual({ moved: true, near: true });

  assertNoErrors();
});

// ---------------------------------------------------------------------------
// Feature description in the caption
// ---------------------------------------------------------------------------

test("the caption shows each feature's description as plain text", async ({
  page,
  waymark,
}) => {
  test.setTimeout(90_000);
  const assertNoErrors = startErrorGate(page);
  await openViewer(page, waymark);

  // Give one seeded feature HTML-marked description text. The viewer must strip
  // the markup and decode the entity before rendering it as text.
  const updated = await page.evaluate((targetTitle) => {
    let count = 0;

    window.Waymark.map_data.eachLayer((layer) => {
      const properties = layer.feature && layer.feature.properties;
      if (properties && properties.title === targetTitle) {
        properties.description = "<p>Tidal crossing &amp; sea stacks.</p>";
        count++;
      }
    });

    return count;
  }, POPUP_TITLE);
  expect(updated, `No seeded layer titled "${POPUP_TITLE}"`).toBe(1);

  const { dialog } = await openLightboxFromPopup(page, POPUP_TITLE);
  const description = dialog.locator(".waymark-lightbox-description");

  await expect(description).toBeVisible();
  await expect(description).toHaveText("Tidal crossing & sea stacks.");
  expect(
    await description.evaluate((element) => element.children.length),
    "Description should be rendered as text, not markup",
  ).toBe(0);

  const styles = await description.evaluate((element) => {
    const computed = getComputedStyle(element);
    return {
      flexBasis: computed.flexBasis,
      textAlign: computed.textAlign,
      maxHeight: computed.maxHeight,
      overflowY: computed.overflowY,
    };
  });

  expect(styles).toEqual({
    flexBasis: "100%",
    textAlign: "center",
    maxHeight: "65px",
    overflowY: "auto",
  });

  // The next seeded image (Eric Lake Camp) has no description, so the caption
  // should hide the description element rather than leave a blank row.
  await dialog.locator(".waymark-lightbox-next").click();
  await expect(dialog.locator(".waymark-lightbox-count")).toHaveText("3 of 3");
  await expect(description).toBeHidden();

  // Stepping back restores the text.
  await dialog.locator(".waymark-lightbox-prev").click();
  await expect(dialog.locator(".waymark-lightbox-count")).toHaveText("2 of 3");
  await expect(description).toBeVisible();
  await expect(description).toHaveText("Tidal crossing & sea stacks.");

  await dialog.locator(".waymark-lightbox-close").click();
  await expect(dialog).toBeHidden();

  // A description longer than the cap should scroll instead of growing the
  // dialog, proving max-height and overflow-y work together.
  const longDescription = "Long description sentence. ".repeat(60).trim();

  await page.evaluate(
    ({ targetTitle, descriptionText }) => {
      window.Waymark.map_data.eachLayer((layer) => {
        const properties = layer.feature && layer.feature.properties;
        if (properties && properties.title === targetTitle) {
          properties.description = `<p>${descriptionText}</p>`;
        }
      });
    },
    { targetTitle: POPUP_TITLE, descriptionText: longDescription },
  );

  await openLightboxFromPopup(page, POPUP_TITLE);
  await expect(description).toBeVisible();

  expect(
    await description.evaluate(
      (element) => element.scrollHeight > element.clientHeight,
    ),
    "A long description should scroll within the 65px cap",
  ).toBe(true);

  await dialog.locator(".waymark-lightbox-close").click();
  await expect(dialog).toBeHidden();

  assertNoErrors();
});

// ---------------------------------------------------------------------------
// Close paths
// ---------------------------------------------------------------------------

test("Escape closes the viewer and restores focus to the popup link", async ({
  page,
  waymark,
}) => {
  test.setTimeout(90_000);
  const assertNoErrors = startErrorGate(page);
  await openViewer(page, waymark);

  const { dialog } = await openLightboxFromPopup(page, POPUP_TITLE);
  await expect(dialog).toBeVisible();

  await page.keyboard.press("Escape");

  await expect(dialog).toBeHidden();
  await expect(page.locator("html")).not.toHaveClass(/waymark-lightbox-open/);
  expect(await dialog.getAttribute("open")).toBeNull();

  await expect
    .poll(
      () =>
        page.evaluate(() =>
          Boolean(
            document.activeElement &&
            document.activeElement.matches(
              ".leaflet-popup .waymark-info-image_large_url a",
            ),
          ),
        ),
      { timeout: 5_000 },
    )
    .toBe(true);

  assertNoErrors();
});

test("the close button and a backdrop click both close the viewer", async ({
  page,
  waymark,
}) => {
  test.setTimeout(90_000);
  const assertNoErrors = startErrorGate(page);
  await openViewer(page, waymark);

  const { popup, dialog } = await openLightboxFromPopup(page, POPUP_TITLE);
  const photo = popup.locator(".waymark-info-image_large_url a img");

  await dialog.locator(".waymark-lightbox-close").click();
  await expect(dialog).toBeHidden();
  await expect(page.locator("html")).not.toHaveClass(/waymark-lightbox-open/);

  await photo.click();
  await expect(dialog).toBeVisible();

  // A point outside the dialog's centred box lands on its backdrop.
  await page.mouse.click(8, 8);
  await expect(dialog).toBeHidden();
  await expect(page.locator("html")).not.toHaveClass(/waymark-lightbox-open/);

  assertNoErrors();
});

// ---------------------------------------------------------------------------
// Gallery integration
// ---------------------------------------------------------------------------

test("a gallery thumbnail opens its popup and the matching lightbox image", async ({
  page,
  waymark,
}) => {
  test.setTimeout(90_000);
  const assertNoErrors = startErrorGate(page);
  await openViewer(page, waymark);

  // Only the two markers are gallery-eligible; the LineString is not.
  const thumbnails = page.locator(".waymark-gallery-container .waymark-image");
  await expect(thumbnails).toHaveCount(2);

  const thumbnail = page.locator(
    `.waymark-gallery-container .waymark-image img[alt="${GALLERY_TITLE}"]`,
  );
  await expect(thumbnail).toBeVisible();
  await thumbnail.click();

  const popup = page
    .locator(".leaflet-popup")
    .filter({ hasText: GALLERY_TITLE });
  await expect(popup).toBeVisible();

  const dialog = page.locator("dialog.waymark-lightbox");
  await expect(dialog).toBeVisible();
  await expect(dialog.locator(".waymark-lightbox-image")).toHaveAttribute(
    "src",
    waymark.getImage("nahwitti-lake", "large"),
  );
  await expect(dialog.locator(".waymark-lightbox-count")).toHaveText("3 of 3");

  assertNoErrors();
});

// ---------------------------------------------------------------------------
// Single-image presentation
// ---------------------------------------------------------------------------

test("a single-image set hides prev/next", async ({ page, waymark }) => {
  test.setTimeout(90_000);
  const assertNoErrors = startErrorGate(page);
  await openViewer(page, waymark);

  // No seeded Map has exactly one image, so open the viewer's public API with
  // a single-item set to exercise the single-item presentation in the browser.
  const url = waymark.getImage("san-josef-bay", "large");
  await page.evaluate((imageUrl) => {
    window.Waymark.lightbox.open(
      [
        {
          url: imageUrl,
          href: imageUrl,
          alt: "Single image",
          title: "Single image",
        },
      ],
      0,
    );
  }, url);

  const dialog = page.locator("dialog.waymark-lightbox");
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveClass(/waymark-lightbox-single/);
  await expect(dialog.locator(".waymark-lightbox-count")).toHaveText("1 of 1");
  await expect(dialog.locator(".waymark-lightbox-prev")).toBeHidden();
  await expect(dialog.locator(".waymark-lightbox-next")).toBeHidden();

  await page.keyboard.press("ArrowRight");
  await expect(dialog.locator(".waymark-lightbox-image")).toHaveAttribute(
    "src",
    url,
  );
  await expect(dialog.locator(".waymark-lightbox-count")).toHaveText("1 of 1");

  assertNoErrors();
});

// ---------------------------------------------------------------------------
// Layout regression: the viewer is centred, not pinned to the top
// ---------------------------------------------------------------------------
//
// The dialog once used `position: relative`, which defeated the top layer's
// `inset: 0; margin: auto` centring and pinned the viewer to the top of the
// viewport. These positional assertions would have caught that before release.

test.describe("layout: the viewer is centred in the default viewport", () => {
  test("the open viewer is centred on both axes and fully contained", async ({
    page,
    waymark,
  }) => {
    test.setTimeout(90_000);
    const assertNoErrors = startErrorGate(page);
    await openViewer(page, waymark);

    const { dialog } = await openLightboxFromPopup(page, POPUP_TITLE);
    await expect(dialog).toBeVisible();
    await waitForLightboxImage(page);

    const geometry = await measureLightbox(page);
    expectLightboxCentred(geometry);

    assertNoErrors();
  });
});

test.describe("layout: the viewer is centred on a phone viewport", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("the viewer stays centred with 44px controls and a 14px caption", async ({
    page,
    waymark,
  }) => {
    test.setTimeout(90_000);
    const assertNoErrors = startErrorGate(page);
    await openViewer(page, waymark);

    const { dialog } = await openLightboxFromPopup(page, POPUP_TITLE);
    await expect(dialog).toBeVisible();
    await waitForLightboxImage(page);

    const geometry = await measureLightbox(page);
    expectLightboxCentred(geometry);

    for (const [name, control] of Object.entries(geometry.controls)) {
      expect(control, `The ${name} control should exist`).not.toBeNull();

      if (!control) {
        continue;
      }

      expect(
        Math.abs(control.width - 44),
        `The ${name} control should be 44px wide`,
      ).toBeLessThanOrEqual(0.5);
      expect(
        Math.abs(control.height - 44),
        `The ${name} control should be 44px tall`,
      ).toBeLessThanOrEqual(0.5);

      expect(
        control.left,
        `The ${name} control should sit inside the dialog`,
      ).toBeGreaterThanOrEqual(geometry.dialog.left);
      expect(control.top).toBeGreaterThanOrEqual(geometry.dialog.top);
      expect(control.right).toBeLessThanOrEqual(geometry.dialog.right);
      expect(control.bottom).toBeLessThanOrEqual(geometry.dialog.bottom);
    }

    expect(geometry.captionFontSize).toBe("14px");

    assertNoErrors();
  });
});
