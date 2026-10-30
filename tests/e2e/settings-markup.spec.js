// Slice 7 markup regression coverage: the split sentences must keep their
// intended links, emphasis and code samples once they pass through wp_kses,
// and the admin notices must actually render.
const fs = require("node:fs");
const path = require("node:path");
const { test, expect } = require("./fixtures");

const SETTINGS_PATH =
  "/wp-admin/edit.php?post_type=waymark_map&page=waymark-settings";
const COLLECTIONS_PATH =
  "/wp-admin/edit-tags.php?taxonomy=waymark_collection&post_type=waymark_map";
const TMP_DIR = path.join(__dirname, "..", "..", ".opencode", "tmp");

/**
 * Build a Settings URL for a tab or section.
 *
 * @param {string} content Settings nav content id.
 * @returns {string}
 */
function settingsUrl(content) {
  return `${SETTINGS_PATH}&content=${content}`;
}

/**
 * Fail the test on console errors or uncaught page errors.
 *
 * @param {import("@playwright/test").Page} page
 * @returns {() => void}
 */
function startErrorGate(page) {
  const consoleErrors = [];
  const pageErrors = [];

  page.on("console", (message) => {
    if (message.type() !== "error") {
      return;
    }
    // jQuery Migrate emits deprecation warnings as console messages on some
    // WordPress versions; they are not test failures.
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
 * Save a full-page screenshot for the screen under test.
 *
 * @param {import("@playwright/test").Page} page
 * @param {string} name
 */
async function capture(page, name) {
  fs.mkdirSync(TMP_DIR, { recursive: true });
  await page.screenshot({
    path: path.join(TMP_DIR, `slice7-${name}.png`),
    fullPage: true,
  });
}

test("Basemaps description renders one closed lead span with all four links", async ({
  page,
  waymark,
}) => {
  test.setTimeout(60_000);
  const assertNoErrors = startErrorGate(page);

  await waymark.login(page);
  await page.goto(waymark.adminUrl(settingsUrl("waymark-settings-tab-tiles")));

  const section = page.locator(".waymark-settings-section-layers");
  const description = section.locator(".waymark-settings-section-description");
  const lead = description.locator("span.waymark-lead");

  await expect(lead).toHaveCount(1);
  await expect(lead).toBeVisible();
  await expect(lead).toContainText(
    "Waymark uses the excellent OpenStreetMap as its default Basemap and supports many other providers.",
  );
  await expect(lead).toContainText(
    "Thunderforest and Mapbox are examples of providers that offer easy access to beautiful Basemaps (including satellite imagery).",
  );
  await expect(lead).toContainText(
    "They require registration, but have a free usage tier.",
  );

  // The two paragraphs are separated by a real double line break, and the
  // span is closed before the footer (no escaped markup).
  await expect(lead.locator("br")).toHaveCount(2);
  await expect(description).not.toContainText("</span>");

  const hrefs = await lead
    .locator("a")
    .evaluateAll((links) => links.map((link) => link.getAttribute("href")));

  expect(hrefs).toEqual([
    "https://www.openstreetmap.org/fixthemap",
    "https://leaflet-extras.github.io/leaflet-providers/preview/",
    "https://www.thunderforest.com/",
    "https://www.mapbox.com/maps/",
  ]);

  await capture(page, "basemaps");
  assertNoErrors();
});

test("Properties tab renders the JSON example and the waymark-code sample", async ({
  page,
  waymark,
}) => {
  test.setTimeout(60_000);
  const assertNoErrors = startErrorGate(page);

  await waymark.login(page);
  await page.goto(
    waymark.adminUrl(settingsUrl("waymark-settings-tab-properties")),
  );

  const props = page.locator(".waymark-settings-section-props");
  const description = props.locator(".waymark-settings-section-description");

  await expect(
    description.locator('b a[href="https://geojson.org/"]'),
  ).toBeVisible();
  await expect(description.locator("code")).toHaveText(
    "layer.feature.properties",
  );

  // The preformatted GeoJSON example must survive wp_kses.
  const json = props.locator(".waymark-settings-section-footer pre > code");
  await expect(json).toBeVisible();
  await expect(json).toContainText('"type": "FeatureCollection"');
  await expect(json).toContainText('"created_date": "2021-07-15T00:42:41Z"');
  await expect(
    props.locator(".waymark-settings-section-footer"),
  ).not.toContainText("<pre>");

  // The Options footer keeps its classed code sample and the corrected key.
  const options = page.locator(".waymark-settings-section-options");
  const sample = options.locator(
    ".waymark-settings-section-footer code.waymark-code",
  );
  await expect(sample).toBeVisible();
  await expect(sample).toContainText("waymark-property-property_key");
  await expect(sample).toContainText("property_value");
  await expect(sample).not.toContainText("proprty_value");

  await capture(page, "properties");
  assertNoErrors();
});

test("Marker Label tooltip keeps its four sentences without entity artefacts", async ({
  page,
  waymark,
}) => {
  test.setTimeout(60_000);
  const assertNoErrors = startErrorGate(page);

  await waymark.login(page);
  await page.goto(
    waymark.adminUrl(settingsUrl("waymark-settings-tab-markers")),
  );

  const section = page.locator(".waymark-settings-section-marker_types");
  const repeatable = section.locator(".waymark-repeatable");

  // The splitter clones the PHP-rendered table before the fields are visible.
  await expect(repeatable).not.toHaveAttribute("hidden");

  const tip = section
    .locator(".marker_title-container a.waymark-tooltip")
    .first();

  await expect(tip).toBeVisible();

  const title = await tip.getAttribute("data-title");

  expect(title).toContain(
    'What kind of Marker is this? E.g. "Photo", "Grocery Store", "Warning!".',
  );
  expect(title).toContain("Once saved, Marker labels cannot be edited.");
  expect(title).toContain(
    "The Marker Label is displayed in the Tooltip (when hovering over the Marker) and in the Info Window (once the Marker is clicked).",
  );
  expect(title).toContain("Hide in Settings > Misc. > Type Labels.");
  expect(title).not.toContain("&#039;");
  expect(title).not.toContain("&amp;");

  // The hover tooltip uses .text(), so a double-encoded translation would be
  // visible here even when the attribute looks correct.
  await tip.hover();
  const liveTip = page.locator("#waymark-tooltip-active");
  await expect(liveTip).toBeVisible();
  await expect(liveTip).toContainText(
    'What kind of Marker is this? E.g. "Photo"',
  );
  await expect(liveTip).toContainText(
    "Hide in Settings > Misc. > Type Labels.",
  );
  await expect(liveTip).not.toContainText("&#039;");
  await expect(liveTip).not.toContainText("&amp;");

  await capture(page, "markers");
  assertNoErrors();
});

test("Sleep Options description keeps its bold emphasis", async ({
  page,
  waymark,
}) => {
  test.setTimeout(60_000);
  const assertNoErrors = startErrorGate(page);

  await waymark.login(page);
  await page.goto(
    waymark.adminUrl(
      settingsUrl("waymark-settings-section-interaction_options"),
    ),
  );

  const section = page.locator(".waymark-settings-section-interaction_options");
  const description = section.locator(".waymark-settings-section-description");

  await expect(description.locator("b")).toHaveCount(2);
  await expect(description.locator("b").nth(0)).toHaveText("Sleeping");
  await expect(description.locator("b").nth(1)).toHaveText("Waking");
  await expect(description).toContainText(
    "Waymark Maps will zoom when the user scrolls.",
  );
  await expect(description).toContainText(
    "This can cause some unexpected/annoying behaviour when scrolling a page.",
  );
  await expect(description).toContainText("may create a better experience.");

  await capture(page, "sleep");
  assertNoErrors();
});

test("Collections screen renders the Collections notice markup", async ({
  page,
  waymark,
}) => {
  test.setTimeout(60_000);
  const assertNoErrors = startErrorGate(page);

  await waymark.login(page);
  await page.goto(waymark.adminUrl(COLLECTIONS_PATH));
  await expect(page.locator("#the-list")).toBeVisible();

  await capture(page, "collections");

  const notice = page.locator("#waymark-notice-container");

  await expect(notice).toBeVisible();
  await expect(notice).toContainText(
    "Collections allow you to organise your Maps.",
  );
  await expect(notice).toContainText(
    "Use the Shortcode to display all Maps in a Collection at once.",
  );

  const shortcode = notice.locator("a", { hasText: "Shortcode" });
  await expect(shortcode).toHaveAttribute(
    "href",
    "https://www.ogis.org/waymark-wp/#shortcodes",
  );

  const docs = notice.locator("a", { hasText: "Read the Docs" });
  await expect(docs).toBeVisible();
  await expect(docs).toHaveAttribute(
    "href",
    "https://www.ogis.org/waymark-wp/customising/settings/#misc-collection_options",
  );
  await expect(docs).toHaveClass(/button/);
  await expect(docs).toHaveClass(/waymark-right/);
  await expect(docs).toContainText("Read the Docs");
  await expect(docs.locator(".waymark-arrow")).toHaveCount(1);

  await expect(notice).not.toContainText("<a href=");
  await expect(notice).not.toContainText("<span");

  assertNoErrors();
});
