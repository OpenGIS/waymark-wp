// The Marker icon field's tooltip and label must follow the selected icon
// type. Each type has its own translated tip; the field must never expose the
// old pipe-delimited text or an undefined title.
const { test, expect } = require("./fixtures");

const MARKER_SECTION_PATH =
  "/wp-admin/edit.php?post_type=waymark_map&page=waymark-settings&content=waymark-settings-tab-markers";

test("switches Marker icon tips and labels with the icon type", async ({
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
  await page.goto(waymark.adminUrl(MARKER_SECTION_PATH));

  const section = page.locator(".waymark-settings-section-marker_types");
  await expect(section).toBeVisible();

  const iconSelect = section.locator("select.waymark-icon_type").first();
  await expect(iconSelect).toBeVisible();

  const iconInput = section.locator("input.waymark-marker_icon").first();
  await expect(iconInput).toBeVisible();

  const iconRow = iconInput.locator("xpath=ancestor::tr");
  const iconLabel = iconRow.locator(".waymark-icon-label");
  const iconTip = iconRow.locator("a.waymark-tooltip");
  await expect(iconTip).toHaveCount(1);
  await expect(iconTip).toHaveAttribute(
    "data-title",
    "Choose how the Marker icon is displayed.",
  );

  const lang = await page.evaluate(() => window.waymark_php_lang);

  // Assert the literal English source, not only that PHP and the page agree.
  expect(lang.marker_icon_icon_label).toBe("Icon Name");
  expect(lang.marker_icon_text_label).toBe("Icon Text");
  expect(lang.marker_icon_html_label).toBe("Icon HTML");
  expect(lang.marker_icon_icon_tip).toMatch(/^The desired icon name/);
  expect(lang.marker_icon_text_tip).toMatch(/^Text to display inside/);
  expect(lang.marker_icon_html_tip).toMatch(/^The HTML entered/);

  // wp_localize_script decodes entities once, so the JS value should contain
  // the literal entity text "&cross;" rather than "&amp;cross;" or the glyph.
  expect(lang.marker_icon_html_tip).toContain("&cross;");
  expect(lang.marker_icon_html_tip).not.toContain("&amp;cross;");
  expect(lang.marker_icon_html_tip).not.toContain("\u271d");

  const cases = [
    {
      value: "icon",
      label: lang.marker_icon_icon_label,
      tip: lang.marker_icon_icon_tip,
    },
    {
      value: "text",
      label: lang.marker_icon_text_label,
      tip: lang.marker_icon_text_tip,
    },
    {
      value: "html",
      label: lang.marker_icon_html_label,
      tip: lang.marker_icon_html_tip,
    },
  ];

  for (const current of cases) {
    await iconSelect.selectOption(current.value);

    await expect(iconLabel).toHaveText(current.label);

    const title = await iconTip.evaluate((element) =>
      jQuery(element).data("title"),
    );

    expect(title).toBe(current.tip);
    expect(title).not.toBe("undefined");
    expect(title.length).toBeGreaterThan(0);
    expect(title).not.toContain("|Text to display inside the Marker");

    await iconTip.hover();
    await expect(page.locator("#waymark-tooltip-active")).toHaveText(
      current.tip,
    );
    await page.mouse.move(0, 0);
  }

  expect(consoleErrors, `Console errors:\n${consoleErrors.join("\n")}`).toEqual(
    [],
  );
  expect(pageErrors, `Page errors:\n${pageErrors.join("\n")}`).toEqual([]);
});
