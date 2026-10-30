// Deterministic capture specs for the Waymark readme screenshots.
//
// One spec per capture subject (hero `editor-demo` plus `screenshot-1..21`).
// Each navigates, settles the Map, asserts the UI it exercises, gates on zero
// console/page errors (excluding only the browser-chrome `/favicon.ico`
// request), waits for the capture target's geometry to stop reflowing, and
// writes a deterministic PNG to `.opencode/tmp/screenshots/`.
//
// These specs double as functional smoke coverage: they run in the normal
// `npm run test:e2e` suite. With `WAYMARK_SCREENSHOTS=1` they instead write
// quality-85 JPEGs to `.opencode/tmp/screenshots/canonical/`; the
// `screenshots`/`screenshots:check` npm scripts publish and verify those. This
// file never writes to `.wordpress-org/` itself.
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const {
  test,
  expect,
  waitForLayoutStable,
  settingsUrl,
} = require("./fixtures");

const ROOT = path.join(__dirname, "..", "..");
const SHOT_DIR = path.join(ROOT, ".opencode", "tmp", "screenshots");

// `WAYMARK_SCREENSHOTS=1` switches the captures to the canonical readme assets:
// JPEG (quality 85) written to a separate directory, from which the npm scripts
// publish them to `.wordpress-org/`. Normal runs keep the deterministic PNGs
// checked against the baseline manifest.
const CANONICAL = process.env.WAYMARK_SCREENSHOTS === "1";
const OUT_DIR = CANONICAL ? path.join(SHOT_DIR, "canonical") : SHOT_DIR;
const EXT = CANONICAL ? "jpg" : "png";
const MANIFEST_PATH = path.join(OUT_DIR, "manifest.json");

// Headed Chromium's browser UI requests /favicon.ico for the tab icon; the
// wp-env tests site serves no favicon, so it 404s. Exclude only this
// browser-chrome noise from the console gate.
const FAVICON_URL = /\/favicon\.ico$/;

// A seeded marker with an associated photo (see the demo GeoJSON).
const POPUP_MARKER_TITLE = "The Scarlet Ibis";

// The WordPress.org readme settings captures, in readme order. Each `content`
// is a Settings nav content id: a whole tab or a single repeatable section.
const SETTINGS_SCREENS = [
  {
    name: "screenshot-9",
    title: "Basemaps",
    content: "waymark-settings-tab-tiles",
  },
  {
    name: "screenshot-10",
    title: "Shortcodes",
    content: "waymark-settings-section-shortcode_options",
  },
  {
    name: "screenshot-11",
    title: "Elevation",
    content: "waymark-settings-section-elevation_options",
  },
  {
    name: "screenshot-12",
    title: "Meta",
    content: "waymark-settings-tab-meta",
  },
  {
    name: "screenshot-13",
    title: "Sleep",
    content: "waymark-settings-section-interaction_options",
  },
  {
    name: "screenshot-14",
    title: "Clustering",
    content: "waymark-settings-section-cluster_options",
  },
  {
    name: "screenshot-15",
    title: "Misc.",
    content: "waymark-settings-section-map_options",
  },
  {
    name: "screenshot-16",
    title: "Markers",
    content: "waymark-settings-tab-markers",
  },
  {
    name: "screenshot-17",
    title: "Lines",
    content: "waymark-settings-tab-lines",
  },
  {
    name: "screenshot-18",
    title: "Shapes",
    content: "waymark-settings-tab-shapes",
  },
  {
    name: "screenshot-19",
    title: "Properties",
    content: "waymark-settings-tab-properties",
  },
  {
    name: "screenshot-20",
    title: "Submissions",
    content: "waymark-settings-tab-submission",
  },
  {
    name: "screenshot-21",
    title: "Advanced",
    content: "waymark-settings-tab-misc",
  },
];

// ---------------------------------------------------------------------------
// Capture bookkeeping
// ---------------------------------------------------------------------------

/** @type {Array<{name: string, file: string, width: number, height: number, sha256: string}>} */
let captures = [];

/**
 * Read the pixel dimensions from a PNG's IHDR chunk.
 *
 * @param {Buffer} buffer
 * @returns {{ width: number, height: number }}
 */
function pngSize(buffer) {
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

/**
 * Read the pixel dimensions from a JPEG's first SOF segment.
 *
 * @param {Buffer} buffer
 * @returns {{ width: number, height: number }}
 */
function jpegSize(buffer) {
  let offset = 2; // Skip the SOI marker.

  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    const marker = buffer[offset + 1];

    // Standalone markers carry no length payload.
    if (
      marker === 0xd8 ||
      marker === 0xd9 ||
      (marker >= 0xd0 && marker <= 0xd7)
    ) {
      offset += 2;
      continue;
    }

    const length = buffer.readUInt16BE(offset + 2);

    // SOF markers (C0–CF) except DHT (C4), JPG (C8) and DAC (CC).
    if (
      marker >= 0xc0 &&
      marker <= 0xcf &&
      marker !== 0xc4 &&
      marker !== 0xc8 &&
      marker !== 0xcc
    ) {
      return {
        height: buffer.readUInt16BE(offset + 5),
        width: buffer.readUInt16BE(offset + 7),
      };
    }

    offset += 2 + length;
  }

  throw new Error("No JPEG SOF segment found");
}

/**
 * Read a capture's pixel dimensions for the current output format.
 *
 * @param {Buffer} buffer
 * @returns {{ width: number, height: number }}
 */
function imageSize(buffer) {
  return CANONICAL ? jpegSize(buffer) : pngSize(buffer);
}

/**
 * Merge the canonical JPEG options into a capture's screenshot options.
 *
 * @param {import("@playwright/test").PageScreenshotOptions} [options]
 * @returns {import("@playwright/test").PageScreenshotOptions}
 */
function screenshotOptions(options = {}) {
  return CANONICAL ? { ...options, type: "jpeg", quality: 85 } : options;
}

/**
 * Persist a capture to disk and record it in the manifest.
 *
 * @param {string} name
 * @param {Buffer} buffer PNG bytes
 */
function recordCapture(name, buffer) {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const file = path.join(OUT_DIR, `${name}.${EXT}`);
  fs.writeFileSync(file, buffer);

  const { width, height } = imageSize(buffer);
  captures = captures.filter((entry) => entry.name !== name);
  captures.push({
    name,
    file: path.relative(ROOT, file),
    width,
    height,
    sha256: crypto.createHash("sha256").update(buffer).digest("hex"),
  });

  fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(captures, null, 2)}\n`);
}

/**
 * Wait for the whole document's geometry to hold steady.
 *
 * @param {import("@playwright/test").Page} page
 */
async function settleDocumentLayout(page) {
  await waitForLayoutStable(() =>
    page.evaluate(() => ({
      width: document.documentElement.scrollWidth,
      height: document.documentElement.scrollHeight,
      bodyWidth: document.body.scrollWidth,
      bodyHeight: document.body.scrollHeight,
    })),
  );
}

/**
 * Rasterise a screenshot and record it, without a layout wait.
 *
 * @param {import("@playwright/test").Page} page
 * @param {string} name
 * @param {import("@playwright/test").PageScreenshotOptions} [options]
 */
async function screenshotPage(page, name, options = {}) {
  const buffer = await page.screenshot(screenshotOptions(options));
  recordCapture(name, buffer);
}

/**
 * Screenshot the viewport (or a page-coordinate clip) and record it.
 *
 * @param {import("@playwright/test").Page} page
 * @param {string} name
 * @param {import("@playwright/test").PageScreenshotOptions} [options]
 */
async function capturePage(page, name, options = {}) {
  await settleDocumentLayout(page);
  await screenshotPage(page, name, options);
}

/**
 * Screenshot a single element and record it.
 *
 * The element's bounding box is fractional (theme layout), and
 * `locator.screenshot()`'s handling of that fraction flips a handful of
 * anti-aliased pixels between runs. Capture an explicit integer page clip
 * (floor the top-left, ceil the bottom-right) instead — same framing, but
 * rasterised identically every run.
 *
 * @param {import("@playwright/test").Locator} locator
 * @param {string} name
 */
async function captureLocator(locator, name) {
  // The target's own box is the geometry that must settle: the editor meta box
  // grows as its admin bundle finishes wiring up, and a loaded machine can push
  // that growth past `settleMap`.
  await waitForLayoutStable(() =>
    locator.boundingBox().then((box) =>
      box
        ? {
            x: Math.round(box.x),
            y: Math.round(box.y),
            width: Math.round(box.width),
            height: Math.round(box.height),
          }
        : null,
    ),
  );

  const clip = await locator.evaluate((element) => {
    const box = element.getBoundingClientRect();
    const x = Math.max(0, Math.floor(box.left + window.scrollX));
    const y = Math.max(0, Math.floor(box.top + window.scrollY));
    const right = Math.ceil(box.right + window.scrollX);
    const bottom = Math.ceil(box.bottom + window.scrollY);
    return { x, y, width: right - x, height: bottom - y };
  });

  const buffer = await locator
    .page()
    .screenshot(screenshotOptions({ clip, fullPage: true }));
  recordCapture(name, buffer);
}

/**
 * Scroll an element to a fixed distance below the viewport top.
 *
 * Scrolls with an explicit page-coordinate offset rather than
 * `scrollIntoViewIfNeeded`, whose framing depends on the element's current
 * visibility, so every capture starts from the same scroll position.
 *
 * @param {import("@playwright/test").Locator} locator
 * @param {number} offset
 */
async function scrollToElementTop(locator, offset) {
  await locator.waitFor({ state: "attached" });
  await locator.evaluate((element, gap) => {
    const top = element.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, Math.max(0, Math.round(top - gap)));
  }, offset);
}

// Screenshot-only tweaks for Settings screens whose natural height runs past
// the 1000px viewport. Meta hides the trailing Groups section so the framed
// card ends cleanly after Meta Inputs with the Save button visible. Markers
// hides its section description and footer so the eight rows and the WordPress
// footer stay inside the frame. Advanced is the tallest tab; hiding its section
// descriptions and the trailing Post Type and Debug sections keeps Collection,
// Editor and Permalinks framed with Save.
const SETTINGS_SCREEN_CSS = {
  "waymark-settings-tab-meta":
    "#waymark-admin-container .waymark-settings-tab-meta .waymark-settings-section-groups { display: none !important; }",
  "waymark-settings-tab-misc":
    "#waymark-admin-container .waymark-settings-tab-misc .waymark-settings-section-description," +
    "#waymark-admin-container .waymark-settings-tab-misc .waymark-settings-section-post," +
    "#waymark-admin-container .waymark-settings-tab-misc .waymark-settings-section-advanced { display: none !important; }",
  "waymark-settings-tab-markers":
    "#waymark-admin-container .waymark-settings-tab-markers .waymark-settings-section-description," +
    "#waymark-admin-container .waymark-settings-tab-markers .waymark-settings-section-footer { display: none !important; }",
  "waymark-settings-tab-properties":
    "#waymark-admin-container .waymark-settings-tab-properties .waymark-settings-section-props .waymark-settings-section-footer { display: none !important; }",
};

/**
 * Navigate to a Settings screen and capture the admin viewport.
 *
 * Each capture is a 1600x1000 CSS viewport (3200x2000 at DPR2), not a
 * full-page or element capture, so the Settings chrome frames the screen
 * consistently. Repeatable sections render their first group only; the clone
 * templates are hidden with screenshot-only CSS.
 *
 * @param {import("@playwright/test").Page} page
 * @param {string} name
 * @param {string} content Settings nav content id
 */
async function captureSettingsScreen(page, name, content) {
  const url = new URL(settingsUrl);
  url.searchParams.set("content", content);

  await page.goto(url.toString());
  await page.locator("#waymark-admin-container").waitFor({ state: "visible" });

  await expect(
    page.locator(`#waymark-settings-nav a[data-content="${content}"]`),
  ).toHaveClass(/is-active/);
  await expect(page.locator(`.${content}`).first()).toBeVisible();

  await page.addStyleTag({
    content:
      "#waymark-admin-container .waymark-settings-tab .waymark-repeatable > .form-table ~ .form-table { display: none !important; }" +
      (SETTINGS_SCREEN_CSS[content] ?? ""),
  });

  await page.evaluate(() => window.scrollTo(0, 0));

  const viewport = page.viewportSize() ?? { width: 1600, height: 1000 };

  // Guard against a screen whose Save button falls below the fixed capture
  // viewport. A clipped submit button is a framing defect, so fail rather than
  // silently publishing it. Screens that genuinely have no submit button are
  // reported instead.
  const submitButton = page
    .locator('#waymark-admin-container p.submit input[type="submit"]')
    .filter({ visible: true })
    .first();

  if ((await submitButton.count()) === 0) {
    test.info().annotations.push({
      type: "submit-viewport-guard",
      description: `${name}: no visible Settings submit button to check`,
    });
  } else {
    const box = await submitButton.boundingBox();

    expect(
      box,
      `${name}: Settings submit button has no bounding box`,
    ).not.toBeNull();

    if (box) {
      expect(
        box.y + box.height,
        `${name}: Settings submit button extends below the ${viewport.width}x${viewport.height} viewport (bounding box: x=${box.x}, y=${box.y}, width=${box.width}, height=${box.height})`,
      ).toBeLessThanOrEqual(viewport.height);
    }
  }

  // Guard the WordPress admin footer too: it must sit fully inside the fixed
  // capture viewport, otherwise the screen is clipped at the frame edge. A
  // Settings screen with no footer is reported rather than silently accepted.
  const adminFooter = page
    .locator("#wpfooter")
    .filter({ visible: true })
    .first();

  if ((await adminFooter.count()) === 0) {
    test.info().annotations.push({
      type: "footer-viewport-guard",
      description: `${name}: no visible #wpfooter to check`,
    });
  } else {
    const box = await adminFooter.boundingBox();

    expect(box, `${name}: #wpfooter has no bounding box`).not.toBeNull();

    if (box) {
      expect(
        box.y + box.height,
        `${name}: #wpfooter extends below the ${viewport.width}x${viewport.height} viewport (bounding box: x=${box.x}, y=${box.y}, width=${box.width}, height=${box.height})`,
      ).toBeLessThanOrEqual(viewport.height);
    }
  }

  await capturePage(page, name);
}

// ---------------------------------------------------------------------------
// Error gate
// ---------------------------------------------------------------------------

/**
 * Start collecting console and page errors. `favicon.ico` console noise is
 * ignored; everything else must be empty at teardown.
 *
 * @param {import("@playwright/test").Page} page
 */
function startErrorGate(page) {
  const consoleErrors = [];
  const pageErrors = [];

  page.on("console", (msg) => {
    if (msg.type() === "error" && !FAVICON_URL.test(msg.location().url)) {
      consoleErrors.push(`[${msg.type()}] ${msg.text()}`);
    }
  });
  page.on("pageerror", (err) => pageErrors.push(String(err)));

  return () => {
    expect(
      consoleErrors,
      `Console errors:\n${consoleErrors.join("\n")}`,
    ).toEqual([]);
    expect(pageErrors, `Page errors:\n${pageErrors.join("\n")}`).toEqual([]);
  };
}

// ---------------------------------------------------------------------------
// Map helpers
// ---------------------------------------------------------------------------

/**
 * Assert a Leaflet map has finished loading its tiles.
 *
 * @param {import("@playwright/test").Page} page
 */
async function expectTilesLoaded(page) {
  await expect
    .poll(() => page.locator("img.leaflet-tile-loaded").count(), {
      timeout: 30_000,
    })
    .toBeGreaterThan(0);
}

/**
 * Force every viewer Map on the page back to a deterministic data-bounds view.
 *
 * The leaflet-elevation control re-fits the Map to its track extent on resize
 * and when its track layer loads. That asynchronous re-fit races the capture,
 * so once the elevation chart has rendered, fit each Map to its GeoJSON bounds
 * so the capture is reproducible.
 *
 * @param {import("@playwright/test").Page} page
 */
async function settleViewerMaps(page) {
  await page
    .locator(".waymark-elevation-container svg")
    .first()
    .waitFor({ state: "visible", timeout: 20_000 })
    .catch(() => {});

  // Give any pending elevation resize work a chance to drain first.
  await page.waitForTimeout(750);

  await page.evaluate(() => {
    document.querySelectorAll(".waymark-map-container").forEach((element) => {
      const waymark = window.jQuery(element).data("Waymark");
      if (!waymark || !waymark.map || !waymark.map_data) {
        return;
      }

      // Detach the elevation control's resize re-fit (and any other resize
      // listener) so a later reflow cannot move the Map off the pinned view.
      waymark.map.off("resize");

      const bounds = waymark.map_data.getBounds();
      if (bounds && bounds.isValid()) {
        waymark.map.fitBounds(bounds);
      }
    });
  });
}

/**
 * Open a Map layer's popup by the feature title, without clicking the map.
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
      const feature = layer.feature;
      if (
        feature &&
        feature.properties &&
        feature.properties.title === targetTitle &&
        typeof layer.openPopup === "function"
      ) {
        // Keep the pinned view: autoPan would shift the Map by a
        // font-timing-dependent amount and make the capture irreproducible.
        const popup = layer.getPopup && layer.getPopup();
        if (popup) {
          popup.options.autoPan = false;
        }
        layer.openPopup();
        found = true;
      }
    });

    return found;
  }, title);
}

// ---------------------------------------------------------------------------
// Admin editor session
// ---------------------------------------------------------------------------

/**
 * Log in and open the seeded Map in the classic editor, settled and ready.
 *
 * @param {import("@playwright/test").Page} page
 * @param {import("./fixtures").test} waymark fixture
 */
async function openEditor(page, waymark) {
  await waymark.login(page);
  await page.goto("/wp-admin/post.php?post=100&action=edit");
  await expect(page.locator("#waymark_map_meta")).toBeVisible();
  await page.locator(".waymark-is-editor").waitFor({ state: "visible" });
  await waymark.settleMap(page);
  await expectTilesLoaded(page);
}

test.beforeAll(() => {
  captures = [];
});

// ---------------------------------------------------------------------------
// Hero: editor-demo
// ---------------------------------------------------------------------------

test("hero editor-demo: tight Map Editor panel", async ({ page, waymark }) => {
  test.setTimeout(120_000);
  const assertNoErrors = startErrorGate(page);
  await openEditor(page, waymark);

  const mapPanel = page.locator(".waymark-is-editor");
  await expect(mapPanel.locator(".waymark-edit-toolbar")).toBeVisible();
  await expect(
    mapPanel.locator(".leaflet-marker-pane .waymark-marker"),
  ).toHaveCount(13);

  await captureLocator(mapPanel, "editor-demo");
  assertNoErrors();
});

// ---------------------------------------------------------------------------
// screenshot-1: editor with overlays
// ---------------------------------------------------------------------------

test("screenshot-1: Map Editor meta box with seeded overlays", async ({
  page,
  waymark,
}) => {
  test.setTimeout(120_000);
  const assertNoErrors = startErrorGate(page);
  await openEditor(page, waymark);

  const mapPanel = page.locator(".waymark-is-editor");
  await expect(
    mapPanel.locator(".leaflet-marker-pane .waymark-marker"),
  ).toHaveCount(13);
  // Seeded Lines and Shapes render as SVG paths in the overlay pane.
  expect(
    await mapPanel.locator(".leaflet-overlay-pane path").count(),
  ).toBeGreaterThan(0);

  // Frame the Map Editor meta box itself: keep the admin chrome, but centre
  // the Map and its draw toolbar rather than the full editor layout used by
  // screenshot-3.
  await scrollToElementTop(page.locator("#waymark_map_meta"), 32);
  await capturePage(page, "screenshot-1");
  assertNoErrors();
});

// ---------------------------------------------------------------------------
// screenshot-3: the full classic editor (viewport)
// ---------------------------------------------------------------------------

test("screenshot-3: full classic editor framing", async ({ page, waymark }) => {
  test.setTimeout(120_000);
  const assertNoErrors = startErrorGate(page);
  await openEditor(page, waymark);

  await expect(page.locator("#submitdiv")).toBeVisible();
  await expect(page.locator("#waymark_collectiondiv")).toBeVisible();
  await expect(page.locator("#waymark_map_shortcode")).toBeVisible();
  await expect(page.locator("#waymark_map_export")).toBeVisible();
  await expect(page.locator("#waymark_map_shortcode input")).toHaveValue(
    /map_id="100"/,
  );
  await expect(
    page.locator("#waymark_map_export select[name=export_format] option"),
  ).toHaveCount(3);

  // Hide the localhost permalink row so the capture does not expose the test
  // instance URL. This is WordPress editor chrome, not plugin UI.
  await page.addStyleTag({
    content: "#edit-slug-box { display: none !important; }",
  });

  await page.evaluate(() => window.scrollTo(0, 0));
  await capturePage(page, "screenshot-3");
  assertNoErrors();
});

// ---------------------------------------------------------------------------
// screenshot-5: editor meta boxes (About / Details) + Featured Image
// ---------------------------------------------------------------------------

test("screenshot-5: seeded meta groups and Featured Image", async ({
  page,
  waymark,
}) => {
  test.setTimeout(120_000);
  const assertNoErrors = startErrorGate(page);
  await openEditor(page, waymark);

  await expect(page.locator("#waymark-parameter-group-about")).toBeVisible();
  await expect(page.locator("#waymark-parameter-group-details")).toBeVisible();
  await expect(page.locator("#postimagediv img")).toBeVisible();

  // Collapse About and expand Details so the capture shows the seeded fields.
  await page.locator("#waymark-parameter-group-about legend").click();
  await page.locator("#waymark-parameter-group-details legend").click();

  const details = page.locator(
    "#waymark-parameter-group-details .waymark-accordion-group-content",
  );
  await expect(details).toBeVisible();

  await expect(page.locator('input[name="map_date"]')).toHaveValue(
    "2026-06-15",
  );
  await expect(page.locator('input[name="map_distance_km"]')).toHaveValue(
    "91.4",
  );
  await expect(page.locator('input[name="map_weather"]')).toHaveValue(
    "Overcast",
  );

  // Frame the Meta box (main column) alongside the Featured Image sidebar.
  await page.locator("#waymark_map_meta").scrollIntoViewIfNeeded();
  await capturePage(page, "screenshot-5");
  assertNoErrors();
});

// ---------------------------------------------------------------------------
// screenshot-2: front-end marker popup with photo
// ---------------------------------------------------------------------------

test("screenshot-2: marker popup with photo", async ({ page, waymark }) => {
  test.setTimeout(120_000);
  const assertNoErrors = startErrorGate(page);

  await page.goto(waymark.getMap("cape-scott-trail").permalink);
  await waymark.settleMap(page);
  await settleViewerMaps(page);
  await waymark.settleMap(page);

  const found = await openPopupByTitle(page, POPUP_MARKER_TITLE);
  expect(found, `No seeded marker titled "${POPUP_MARKER_TITLE}"`).toBe(true);

  const popup = page.locator(".leaflet-popup");
  await expect(popup).toBeVisible();
  await expect(popup).toContainText(POPUP_MARKER_TITLE);

  // The overlay photo is rendered as a background-image link, so wait for it
  // to be applied and then preload its bytes before capturing.
  const photoLink = popup.locator(".waymark-info-image_large_url a");
  await expect(photoLink).toBeVisible();
  await expect
    .poll(
      () => photoLink.evaluate((el) => getComputedStyle(el).backgroundImage),
      { timeout: 15_000 },
    )
    .toContain("url(");
  await photoLink.evaluate(async (el) => {
    const match = getComputedStyle(el).backgroundImage.match(
      /url\(["']?(.*?)["']?\)/,
    );
    if (!match) {
      return;
    }
    await new Promise((resolve) => {
      const img = new Image();
      img.onload = resolve;
      img.onerror = resolve;
      img.src = match[1];
    });
  });

  // Place the marker at a fixed point so the (autoPan-disabled) popup is fully
  // framed and the Map offset is reproducible.
  await page.evaluate((title) => {
    const waymark = window.Waymark;
    if (!waymark || !waymark.map || !waymark.map_data) {
      return;
    }

    let target = null;
    waymark.map_data.eachLayer((layer) => {
      if (
        layer.feature &&
        layer.feature.properties &&
        layer.feature.properties.title === title
      ) {
        target = layer;
      }
    });
    if (!target || typeof target.getLatLng !== "function") {
      return;
    }

    const size = waymark.map.getSize();
    const current = waymark.map.latLngToContainerPoint(target.getLatLng());
    const delta = current.clone();
    delta.x -= size.x / 2;
    delta.y -= size.y * 0.72;
    waymark.map.panBy(delta, { animate: false });
  }, POPUP_MARKER_TITLE);

  await waymark.settleMap(page, { closePopups: false });
  await expectTilesLoaded(page);

  await captureLocator(page.locator(".waymark-map-container"), "screenshot-2");
  assertNoErrors();
});

// ---------------------------------------------------------------------------
// screenshot-4: basemap switcher + overlay type filter
// ---------------------------------------------------------------------------

test("screenshot-4: basemap switcher and type filter", async ({
  page,
  waymark,
}) => {
  test.setTimeout(120_000);
  const assertNoErrors = startErrorGate(page);

  await page.goto(waymark.getMap("cape-scott-trail").permalink);
  await waymark.settleMap(page);
  await settleViewerMaps(page);
  await waymark.settleMap(page);

  const layersControl = page.locator(".leaflet-control-layers");
  const baseLayers = layersControl.locator(
    ".leaflet-control-layers-base label",
  );
  await expect(baseLayers).toHaveCount(2);
  // Leaflet keeps the control collapsed until hover, hiding its labels.
  await layersControl.evaluate((el) =>
    el.classList.add("leaflet-control-layers-expanded"),
  );
  await expect(layersControl).toContainText("OpenStreetMap");
  await expect(layersControl).toContainText("OpenTopoMap");

  // A real interaction: switch to the OpenTopoMap basemap.
  await layersControl
    .locator(".leaflet-control-layers-base label", { hasText: "OpenTopoMap" })
    .click();
  await expect(layersControl.locator("input[type=radio]").nth(1)).toBeChecked();
  await waymark.settleMap(page);
  await expectTilesLoaded(page);

  // The overlay type filter lists the coloured marker/line/shape types
  // (6 marker types + 1 line type + 2 shape types).
  await expect(
    layersControl.locator(
      ".leaflet-control-layers-overlays .waymark-type-text",
    ),
  ).toHaveCount(9);

  // Leaflet only expands the control on hover, so force the expanded state for
  // the capture (mouse movement while scrolling would otherwise collapse it).
  // Release the overlay list's own height cap too: its 300px max-height scrolls
  // the last filter entries (the final "Green" line type) out of view.
  await page.addStyleTag({
    content:
      ".leaflet-control-layers .leaflet-control-layers-list{display:block !important}" +
      ".leaflet-control-layers .leaflet-control-layers-toggle{display:none !important}" +
      ".leaflet-control-layers-list{max-height:none !important;overflow:visible !important}",
  });

  // The fully expanded control no longer fits above the bottom gallery inside
  // the default 450px Map. Grow the Map container for this capture only so the
  // whole switcher and filter list clear the gallery with a little breathing
  // room, measuring the control and gallery rather than assuming an offset.
  const mapHeight = await page.evaluate(() => {
    const container = document
      .querySelector(".waymark-map-container")
      .getBoundingClientRect();
    const control = document
      .querySelector(".leaflet-control-layers")
      .getBoundingClientRect();
    const gallery = document.querySelector(".waymark-gallery-container");
    const galleryHeight = gallery ? gallery.getBoundingClientRect().height : 0;
    const controlBottom = control.bottom - container.top;
    return Math.ceil(controlBottom + galleryHeight + 24);
  });
  await page.addStyleTag({
    content: `.waymark-map-container{height:${mapHeight}px !important}`,
  });

  // Re-measure the enlarged Map and let it fetch the extra tile rows. Re-pin
  // the data-bounds view afterwards so the resize cannot leave a sub-pixel
  // offset that varies the capture between runs.
  await page.evaluate(() => {
    document.querySelectorAll(".waymark-map-container").forEach((element) => {
      const waymark = window.jQuery(element).data("Waymark");
      if (waymark && waymark.map) {
        waymark.map.invalidateSize();
      }
    });
  });
  await settleViewerMaps(page);
  await waymark.settleMap(page);
  await expectTilesLoaded(page);

  await captureLocator(page.locator(".waymark-map-container"), "screenshot-4");
  assertNoErrors();
});

// ---------------------------------------------------------------------------
// screenshot-6: Map Details page
// ---------------------------------------------------------------------------

test("screenshot-6: Map Details page", async ({ page, waymark }) => {
  test.setTimeout(120_000);
  const assertNoErrors = startErrorGate(page);

  await page.goto(waymark.getMap("cape-scott-trail").permalink);
  await waymark.settleMap(page);

  // Elevation chart renders via the stubbed local d3 build.
  await expect(page.locator(".waymark-elevation-container svg")).toBeVisible({
    timeout: 20_000,
  });
  // Expand the collapsed Details meta group so both groups are visible.
  await page
    .locator(".waymark-meta-group-details legend")
    .click()
    .catch(() => {});

  const content = page.locator(".wp-block-post-content");
  await expect(content.locator(".waymark-map-container")).toBeVisible();
  await expect(content.locator(".waymark-gallery-container")).toBeAttached();
  await expect(content.locator(".waymark-meta-export_data form")).toHaveCount(
    1,
  );
  await expect(content.locator(".waymark-meta-collection_list")).toContainText(
    "Vancouver Island",
  );
  await expect(content.locator(".waymark-meta-map_description")).toContainText(
    "Port Hardy",
  );

  // Start just above the first content block (the Map) so the post byline
  // frames the top edge and the map, gallery and elevation profile share the
  // viewport without slicing the featured image above. Scroll first: bringing
  // the Map into view can trigger a Leaflet resize and tile fade, so settling
  // before scrolling lets that late frame land after the map looked ready.
  await scrollToElementTop(
    page.locator(".wp-block-post-content > *").first(),
    100,
  );

  // Pin the Map to a deterministic data-bounds view (the elevation control
  // otherwise re-fits to its near-degenerate track extent on resize).
  await settleViewerMaps(page);
  await waymark.settleMap(page);
  await expectTilesLoaded(page);

  // Let any remaining Leaflet tile fade or marker animation finish, then
  // confirm no late tile request reopened the map loading state.
  await page.waitForTimeout(1000);
  await waymark.settleMap(page);
  await expectTilesLoaded(page);

  await capturePage(page, "screenshot-6");
  assertNoErrors();
});

// ---------------------------------------------------------------------------
// screenshot-7: shortcode in content
// ---------------------------------------------------------------------------

test("screenshot-7: shortcode rendered in page content", async ({
  page,
  waymark,
}) => {
  test.setTimeout(120_000);
  const assertNoErrors = startErrorGate(page);

  await page.goto(waymark.seed.page.url);
  await expect(page.locator(".wp-block-post-content")).toBeVisible();

  await expect(page.locator(".waymark-shortcode")).toHaveCount(2);
  await expect(page.locator(".waymark-header")).toHaveCount(2);
  await waymark.settleMap(page);
  await expectTilesLoaded(page);

  const content = page.locator(".wp-block-post-content");
  await expect(content).toContainText("Cape Scott Trail");
  await expect(content).toContainText("Vancouver Island");

  // Pin every Map to a deterministic data-bounds view (the elevation control
  // otherwise re-fits to its near-degenerate track extent on resize).
  await settleViewerMaps(page);
  await waymark.settleMap(page);
  await expectTilesLoaded(page);

  // Start at the first content block (the "Cape Scott Trail" heading) with the
  // page title above it, framing the first Map and its shortcode.
  await scrollToElementTop(
    page.locator(".wp-block-post-content > *").first(),
    120,
  );
  await capturePage(page, "screenshot-7");
  assertNoErrors();
});

// ---------------------------------------------------------------------------
// screenshot-8: Collections admin
// ---------------------------------------------------------------------------

test("screenshot-8: Collections admin table", async ({ page, waymark }) => {
  test.setTimeout(120_000);
  const assertNoErrors = startErrorGate(page);

  await waymark.login(page);
  await page.goto(
    "/wp-admin/edit-tags.php?taxonomy=waymark_collection&post_type=waymark_map",
  );
  await expect(page.locator("#the-list")).toBeVisible();

  const head = page.locator("thead");
  await expect(head).toContainText("Count");
  await expect(head).toContainText("Shortcode");

  const list = page.locator("#the-list");
  await expect(list).toContainText("Vancouver Island");
  await expect(list).toContainText("Backpacking");
  await expect(list).toContainText("Day Hikes");

  // The readonly Shortcode input fills its column, so the full value must fit
  // without horizontal clipping.
  const shortcodeInput = list.locator("input[type=text]").first();
  await expect(shortcodeInput).toBeVisible();
  await expect(shortcodeInput).toHaveValue('[Waymark collection_id="2"]');
  expect(
    await shortcodeInput.evaluate((el) => el.scrollWidth <= el.clientWidth),
  ).toBe(true);

  await page.evaluate(() => window.scrollTo(0, 0));
  await capturePage(page, "screenshot-8");
  assertNoErrors();
});

// ---------------------------------------------------------------------------
// screenshot-9..21: Settings screens
// ---------------------------------------------------------------------------

for (const { name, title, content } of SETTINGS_SCREENS) {
  test(`${name}: Settings ${title}`, async ({ page, waymark }) => {
    test.setTimeout(120_000);
    const assertNoErrors = startErrorGate(page);

    await waymark.login(page);
    await captureSettingsScreen(page, name, content);
    assertNoErrors();
  });
}
