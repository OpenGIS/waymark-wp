// Settings field labels must be complete, translatable phrases rather than
// translated fragments joined in English word order. This spec checks the
// Basemaps and Markers repeatable sections, where the old markup combined
// visible labels with visually hidden qualifiers.
const { test, expect } = require("./fixtures");

const SETTINGS_PATH =
  "/wp-admin/edit.php?post_type=waymark_map&page=waymark-settings";

/**
 * Escape a literal string for use in a regular expression.
 *
 * @param {string} value
 * @returns {string}
 */
function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const SECTIONS = [
  {
    name: "Basemaps",
    url: `${SETTINGS_PATH}&content=waymark-settings-tab-tiles`,
    selector: ".waymark-settings-section-layers",
    labels: [
      "Basemap Name",
      "Basemap URL",
      "Basemap Attribution",
      "Basemap Max Zoom",
    ],
  },
  {
    name: "Markers",
    url: `${SETTINGS_PATH}&content=waymark-settings-tab-markers`,
    selector: ".waymark-settings-section-marker_types",
    labels: [
      "Marker Label",
      "Marker Shape",
      "Marker Size",
      "Marker Background",
      "Marker Show Initially",
      "Marker Submissions",
      "Icon Type",
      "Icon Name",
      "Icon Colour",
    ],
  },
];

test("renders each settings field label as one complete phrase", async ({
  page,
  waymark,
}) => {
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

  await waymark.login(page);

  for (const sectionConfig of SECTIONS) {
    await page.goto(waymark.adminUrl(sectionConfig.url));

    const section = page.locator(sectionConfig.selector);
    await expect(section, sectionConfig.name).toBeVisible();

    // Repeatable sections are hidden until the splitter has cloned the
    // PHP-rendered table for each saved row.
    const repeatable = section.locator(".waymark-repeatable");
    await expect(repeatable).not.toHaveAttribute("hidden");
    await expect(repeatable.locator("table.form-table").first()).toBeVisible();

    const headers = section.locator("th");
    await expect(headers.first()).toBeVisible();

    const headerTexts = await headers.evaluateAll((cells) =>
      cells.map((cell) => (cell.textContent || "").trim()),
    );

    expect(headerTexts.length, sectionConfig.name).toBeGreaterThan(0);

    for (const text of headerTexts) {
      expect(
        sectionConfig.labels,
        `${sectionConfig.name}: unexpected label "${text}"`,
      ).toContain(text);
    }

    for (const label of sectionConfig.labels) {
      expect(headerTexts, `${sectionConfig.name}: ${label}`).toContain(label);

      const labelCell = section
        .locator("th")
        .filter({ hasText: new RegExp(`^${escapeRegExp(label)}$`) })
        .first();
      await expect(labelCell, `${sectionConfig.name}: ${label}`).toHaveText(
        label,
      );
      await expect(
        labelCell.locator(".waymark-invisible"),
        `${sectionConfig.name}: ${label} must not use a hidden fragment`,
      ).toHaveCount(0);
    }

    // No label may repeat the qualifier added by the old concatenated markup,
    // e.g. "Marker Marker Shape".
    for (const text of headerTexts) {
      expect(text, sectionConfig.name).not.toMatch(
        /\b(Marker|Basemap)\s+\1\b/i,
      );
      expect(text, sectionConfig.name).not.toMatch(/\s{2,}/);
    }

    // The retired hidden-prefix markup must not remain anywhere on the page.
    await expect(page.locator(".waymark-invisible")).toHaveCount(0);
  }

  expect(consoleErrors, `Console errors:\n${consoleErrors.join("\n")}`).toEqual(
    [],
  );
  expect(pageErrors, `Page errors:\n${pageErrors.join("\n")}`).toEqual([]);
});

test("renders boolean settings with the default Yes/No options", async ({
  page,
  waymark,
}) => {
  await waymark.login(page);

  const fields = [
    {
      url: `${SETTINGS_PATH}&content=waymark-settings-section-map_options`,
      selector: ".waymark-input-show_gallery",
    },
    {
      url: `${SETTINGS_PATH}&content=waymark-settings-section-map_options`,
      selector: ".waymark-input-show_filter",
    },
    {
      url: `${SETTINGS_PATH}&content=waymark-settings-section-cluster_options`,
      selector: ".waymark-input-show_cluster",
    },
    {
      url: `${SETTINGS_PATH}&content=waymark-settings-tab-misc`,
      selector: ".waymark-input-debug_mode",
    },
  ];

  for (const field of fields) {
    await page.goto(waymark.adminUrl(field.url));

    const select = page.locator(field.selector);
    await expect(select, field.selector).toBeVisible();
    await expect(select.locator("option")).toHaveText(["Yes", "No"]);
  }
});
