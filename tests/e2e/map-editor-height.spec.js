// Regression coverage for issue #88: the admin Map editor height must follow
// the configured Map Height setting rather than the browser viewport.
//
// The editor used to size its Map from the viewport, so the same Map measured
// one height before saving and a shorter one after the "Post updated." notice
// appeared. These specs pin the height at 1440x900 (where the old calculation
// gave roughly 479px before saving and 420px after) and prove that:
//
//   * the height survives a save and the dismissal of the success notice,
//   * a non-default Map Height setting is honoured, and
//   * the editor never drops below the 450px floor.
//
// The Settings changes run through the wp-admin form and are restored in a
// `finally` block so later specs and screenshots see the seeded value again.
"use strict";

const { test, expect, waitForLayoutStable } = require("./fixtures");

const EDITOR_POST_ID = 100;
const EDITOR_PATH = `/wp-admin/post.php?post=${EDITOR_POST_ID}&action=edit`;
const SETTINGS_PATH =
  "/wp-admin/edit.php?post_type=waymark_map&page=waymark-settings";
// The "Misc." navigation entry selects the map_options section; the
// "Advanced" entry selects the whole misc tab and hides this section. The Map
// Height field lives in the former.
const MISC_SECTION_PATH = `${SETTINGS_PATH}&content=waymark-settings-section-map_options`;
const MAP_HEIGHT_FIELD =
  "input[name='Waymark_Settings[misc][map_options][map_height]']";

const DEFAULT_MAP_HEIGHT = 450;
const CONFIGURED_MAP_HEIGHT = 500;
const BELOW_FLOOR_MAP_HEIGHT = 300;

const TILE_URL_PATTERN =
  /^https?:\/\/(?:[a-z0-9-]+\.)*tile\.(?:openstreetmap|opentopomap)\.org\//i;

// 1x1 transparent PNG.
const TRANSPARENT_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

// At 1440x900 the old viewport-derived height differed before and after the
// save, so this viewport exposes the regression instead of masking it. A
// larger viewport can hit the old 600px clamp and hide the problem.
test.use({ viewport: { width: 1440, height: 900 } });

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Serve every basemap tile from memory. Tile pixels cannot affect the Map
 * container's height, and the frozen capture pack does not cover this
 * viewport.
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
 * Open the seeded Map in the classic editor and wait until the Map layout has
 * finished expanding.
 *
 * @param {import("@playwright/test").Page} page
 * @param {object} waymark the extended-test fixture
 */
async function openEditor(page, waymark) {
  await page.goto(EDITOR_PATH);
  await page.locator(".waymark-is-editor").waitFor({ state: "visible" });
  await waymark.settleMap(page);

  await waitForLayoutStable(async () => {
    const geometry = await measureEditorMap(page);
    return geometry
      ? {
          inlineHeight: geometry.inlineHeight,
          rectHeight: geometry.rectHeight,
        }
      : null;
  });
}

/**
 * Read the editor Map's inline height, its rendered height and the clearance
 * between the top-left control stack and the bottom-left drawing toolbar.
 *
 * @param {import("@playwright/test").Page} page
 * @returns {Promise<{ inlineHeight: string, rectHeight: number, controlClearance: number|null }|null>}
 */
async function measureEditorMap(page) {
  return page.evaluate(() => {
    const mapElement = document.querySelector("#waymark-map");
    if (!mapElement) {
      return null;
    }

    const mapRect = mapElement.getBoundingClientRect();
    const topLeftElement = mapElement.querySelector(
      ".leaflet-top.leaflet-left",
    );
    const toolbarElement = mapElement.querySelector(".waymark-edit-toolbar");

    let controlClearance = null;
    if (topLeftElement && toolbarElement) {
      const topLeftRect = topLeftElement.getBoundingClientRect();
      const toolbarRect = toolbarElement.getBoundingClientRect();
      controlClearance = Math.round(toolbarRect.top - topLeftRect.bottom);
    }

    return {
      inlineHeight: mapElement.style.height,
      rectHeight: Math.round(mapRect.height),
      controlClearance,
    };
  });
}

/**
 * Assert the editor Map renders at exactly the expected pixel height, both in
 * its inline style and in its laid-out box.
 *
 * @param {object} geometry result of {@link measureEditorMap}
 * @param {number} expectedHeight
 * @param {string} label
 */
function expectEditorHeight(geometry, expectedHeight, label) {
  expect(geometry, `${label}: the editor Map is missing`).not.toBeNull();
  expect(geometry.inlineHeight, `${label}: inline height`).toBe(
    `${expectedHeight}px`,
  );
  expect(geometry.rectHeight, `${label}: rendered height`).toBe(expectedHeight);
}

/**
 * Read the current Map Height value from the Misc. section of the Settings
 * screen.
 *
 * @param {import("@playwright/test").Page} page
 * @returns {Promise<string>}
 */
async function readMapHeightSetting(page) {
  await page.goto(MISC_SECTION_PATH);
  const field = page.locator(MAP_HEIGHT_FIELD);
  await field.waitFor({ state: "visible" });
  return field.inputValue();
}

/**
 * Save a new Map Height through the wp-admin Settings form and confirm the
 * value survived the round trip.
 *
 * @param {import("@playwright/test").Page} page
 * @param {string|number} value
 */
async function saveMapHeightSetting(page, value) {
  await page.goto(MISC_SECTION_PATH);

  const field = page.locator(MAP_HEIGHT_FIELD);
  await field.waitFor({ state: "visible" });
  await field.fill(String(value));

  await page.click("#submit");

  await expect(page.locator(".waymark-notice.notice-success")).toContainText(
    "Settings Updated.",
    { timeout: 30_000 },
  );
  await expect(field).toHaveValue(String(value));
}

/**
 * Put the original Map Height back. Called from a `finally` block so a failed
 * assertion cannot leak the test value into later specs.
 *
 * @param {import("@playwright/test").Page} page
 * @param {string} originalValue
 */
async function restoreMapHeightSetting(page, originalValue) {
  const currentValue = await readMapHeightSetting(page);
  if (currentValue !== originalValue) {
    await saveMapHeightSetting(page, originalValue);
  }
}

// ---------------------------------------------------------------------------
// Test 1: height is stable across the save cycle
// ---------------------------------------------------------------------------

test("editor Map height survives saving and dismissing the update notice", async ({
  page,
  waymark,
}) => {
  test.setTimeout(120_000);
  const assertNoErrors = startErrorGate(page);
  await stubBasemapTiles(page);

  await waymark.login(page);
  await openEditor(page, waymark);

  const beforeSave = await measureEditorMap(page);
  expectEditorHeight(beforeSave, DEFAULT_MAP_HEIGHT, "before saving");

  await page.click("#publish");

  const notice = page.locator("#message.updated");
  await expect(notice).toBeVisible({ timeout: 30_000 });
  await expect(notice).toContainText("Post updated.");

  // The notice only exists after the editor has reloaded; re-wait for the Map
  // and its layout instead of measuring the outgoing document.
  await page.locator(".waymark-is-editor").waitFor({ state: "visible" });
  await waymark.settleMap(page);
  await waitForLayoutStable(async () => {
    const geometry = await measureEditorMap(page);
    return geometry
      ? {
          inlineHeight: geometry.inlineHeight,
          rectHeight: geometry.rectHeight,
        }
      : null;
  });

  const afterSave = await measureEditorMap(page);
  expectEditorHeight(afterSave, DEFAULT_MAP_HEIGHT, "after saving");
  expect(
    afterSave.inlineHeight,
    "the inline height changed across the save cycle",
  ).toBe(beforeSave.inlineHeight);
  expect(
    afterSave.rectHeight,
    "the rendered height changed across the save cycle",
  ).toBe(beforeSave.rectHeight);

  await notice.locator(".notice-dismiss").click();
  await expect(notice).toBeHidden();

  // Dismissing the notice reflows the page; the Map height must not follow it.
  await waitForLayoutStable(async () => {
    const geometry = await measureEditorMap(page);
    return geometry
      ? {
          inlineHeight: geometry.inlineHeight,
          rectHeight: geometry.rectHeight,
        }
      : null;
  });

  const afterDismiss = await measureEditorMap(page);
  expectEditorHeight(afterDismiss, DEFAULT_MAP_HEIGHT, "after dismissing");
  expect(
    afterDismiss.inlineHeight,
    "the inline height changed when the notice was dismissed",
  ).toBe(beforeSave.inlineHeight);
  expect(
    afterDismiss.rectHeight,
    "the rendered height changed when the notice was dismissed",
  ).toBe(beforeSave.rectHeight);

  // A viewport-derived height could squeeze the bottom-left drawing toolbar
  // into the top-left control stack at this viewport.
  expect(
    afterDismiss.controlClearance,
    "the top-left controls overlap the drawing toolbar",
  ).toBeGreaterThan(0);

  assertNoErrors();
});

// ---------------------------------------------------------------------------
// Test 2: a non-default setting is honoured
// ---------------------------------------------------------------------------

test("editor Map height follows the configured Map Height setting", async ({
  page,
  waymark,
}) => {
  test.setTimeout(120_000);
  const assertNoErrors = startErrorGate(page);
  await stubBasemapTiles(page);

  await waymark.login(page);
  const originalValue = await readMapHeightSetting(page);

  try {
    await saveMapHeightSetting(page, CONFIGURED_MAP_HEIGHT);
    await openEditor(page, waymark);

    const geometry = await measureEditorMap(page);
    expectEditorHeight(
      geometry,
      CONFIGURED_MAP_HEIGHT,
      `${CONFIGURED_MAP_HEIGHT}px setting`,
    );
  } finally {
    await restoreMapHeightSetting(page, originalValue);
  }

  assertNoErrors();
});

// ---------------------------------------------------------------------------
// Test 3: the 450px floor is enforced
// ---------------------------------------------------------------------------

test("editor Map height never drops below the 450px floor", async ({
  page,
  waymark,
}) => {
  test.setTimeout(120_000);
  const assertNoErrors = startErrorGate(page);
  await stubBasemapTiles(page);

  await waymark.login(page);
  const originalValue = await readMapHeightSetting(page);

  try {
    await saveMapHeightSetting(page, BELOW_FLOOR_MAP_HEIGHT);
    await openEditor(page, waymark);

    const geometry = await measureEditorMap(page);
    expectEditorHeight(geometry, DEFAULT_MAP_HEIGHT, "below-floor setting");
  } finally {
    await restoreMapHeightSetting(page, originalValue);
  }

  assertNoErrors();
});
