// Slice 9: the PHP map config must supply an explicit type_key for every
// overlay type plus the legacy alias map, and the editor must use those keys
// for its type control and previews.
//
// The demo alias map currently maps each key to itself, so canonical alias
// selection is covered by waymark-js/tests/stable-type-keys.test.js. This spec
// proves the real PHP -> JS config path and the editor's use of explicit keys.
const { test, expect } = require("./fixtures");

const DEMO_MAP = "cape-scott-trail";
const MARKER_ICONS = ".leaflet-marker-pane .leaflet-marker-icon.waymark-marker";
const TYPE_SELECTOR = ".waymark-info-type select";
const TYPE_PREVIEWS = ".waymark-marker-preview .waymark-type";
const PHOTO_PREVIEW = ".waymark-marker-preview .waymark-marker-photo";

test("editor uses explicit overlay type keys and aliases", async ({
  page,
  waymark,
}) => {
  test.setTimeout(60_000);

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

  const demoMap = waymark.getMap(DEMO_MAP);

  await waymark.login(page);
  await page.goto(
    waymark.adminUrl(`/wp-admin/post.php?post=${demoMap.id}&action=edit`),
  );

  const markerIcons = page.locator(MARKER_ICONS);
  await expect(markerIcons.first()).toBeVisible();

  const config = await page.evaluate(() => ({
    markerTypes: window.Waymark.config.map_options.marker_types.map((type) => ({
      title: type.marker_title,
      key: type.type_key,
    })),
    aliases: window.Waymark.config.type_aliases,
  }));

  expect(config.markerTypes.length).toBeGreaterThan(0);

  for (const type of config.markerTypes) {
    expect(
      type.key,
      `marker type "${type.title}" should carry an explicit type_key`,
    ).toBeTruthy();
  }

  expect(config.aliases).toBeTruthy();
  expect(config.aliases.marker).toBeTruthy();
  expect(Object.keys(config.aliases.marker).length).toBeGreaterThan(0);

  //Open a marker popup; Leaflet sometimes swallows synthetic clicks.
  await markerIcons.first().click();
  if ((await page.locator(TYPE_SELECTOR).count()) === 0) {
    await page.evaluate(() =>
      window.Waymark.map_data.eachLayer(
        (layer) => layer.openPopup && layer.openPopup(),
      ),
    );
  }

  // The type select is intentionally hidden in the editor; the previews are
  // the visible control. Assert attachment, then inspect its options.
  const popup = page.locator(".leaflet-popup").first();
  await expect(popup).toBeVisible();

  const selector = popup.locator(TYPE_SELECTOR);
  await expect(selector).toBeAttached();

  const options = await selector.locator("option").evaluateAll((nodes) =>
    nodes.map((node) => ({
      value: node.value,
      text: (node.textContent || "").trim(),
      selected: node.selected,
      disabled: node.disabled,
    })),
  );

  const typeOptions = options.filter((option) => !option.disabled);
  expect(typeOptions.length).toBe(config.markerTypes.length);

  const explicitKeys = new Set(config.markerTypes.map((type) => type.key));

  for (const option of typeOptions) {
    expect(
      explicitKeys.has(option.value),
      `option "${option.text}" should use an explicit type_key`,
    ).toBe(true);
  }

  const selected = typeOptions.filter((option) => option.selected);
  expect(selected).toHaveLength(1);
  expect(explicitKeys.has(selected[0].value)).toBe(true);

  const previewKeys = await popup
    .locator(TYPE_PREVIEWS)
    .evaluateAll((nodes) =>
      nodes.map((node) => window.jQuery(node).data("type_key")),
    );

  expect(previewKeys).toHaveLength(config.markerTypes.length);

  for (const key of previewKeys) {
    expect(explicitKeys.has(key), `preview key "${key}"`).toBe(true);
  }

  // The default Photo type keeps its stable CSS class.
  await expect(popup.locator(PHOTO_PREVIEW).first()).toBeAttached();

  expect(consoleErrors, `Console errors:\n${consoleErrors.join("\n")}`).toEqual(
    [],
  );
  expect(pageErrors, `Page errors:\n${pageErrors.join("\n")}`).toEqual([]);
});
