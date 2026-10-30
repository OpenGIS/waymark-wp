// Responsive admin layout: at a 500px viewport the settings sidebar stacks
// below the settings card, the OGIS callout banner is absent, and the help
// icons sit beside their inputs instead of overlapping them.
const { test, expect } = require("./fixtures");

const ABOUT_LINKS = ["https://www.ogis.org/waymark-wp/"];

test("stacks the settings sidebar and keeps help icons inline at 500px", async ({
  page,
  waymark,
}) => {
  test.setTimeout(30_000);

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

  await page.setViewportSize({ width: 500, height: 900 });
  await waymark.login(page);
  await page.goto(waymark.settingsUrl);

  // Wait for the settings navigation script to activate the tab from the URL
  // so measurements are taken against the settled layout.
  await expect(page.locator(".waymark-settings-tab-markers")).toBeVisible();
  await expect(page.locator(".waymark-settings-tab-tiles")).toBeHidden();

  const about = page.locator("#waymark-about");
  const card = page.locator("#waymark-admin-container > .card");
  await expect(about).toBeVisible();
  await expect(card).toBeVisible();

  // The page fits the viewport without horizontal scrolling.
  const viewport = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }));
  expect(viewport.scrollWidth).toBeLessThanOrEqual(viewport.innerWidth);

  // The sidebar stacks above the card and spans the content width.
  const cardBox = await card.boundingBox();
  const aboutBox = await about.boundingBox();
  expect(cardBox).not.toBeNull();
  expect(aboutBox).not.toBeNull();
  expect(aboutBox.y + aboutBox.height).toBeLessThanOrEqual(cardBox.y);
  expect(Math.abs(aboutBox.width - cardBox.width)).toBeLessThanOrEqual(2);

  // The lead line matches the docs footer: project repo, then OGIS.
  const lead = about.locator(".ogis-panel__heading");
  await expect(lead).toHaveText("Open-Source by Open GIS.");
  const leadLinks = lead.locator("a");
  await expect(leadLinks).toHaveCount(2);
  await expect(leadLinks.nth(0)).toHaveAttribute(
    "href",
    "https://github.com/opengis/waymark-wp",
  );
  await expect(leadLinks.nth(0)).toHaveAttribute("target", "_blank");
  await expect(leadLinks.nth(0)).toHaveAttribute("rel", "noopener noreferrer");
  await expect(leadLinks.nth(0)).toHaveText("Open-Source");
  await expect(leadLinks.nth(1)).toHaveAttribute(
    "href",
    "https://www.ogis.org",
  );
  await expect(leadLinks.nth(1)).toHaveAttribute("target", "_blank");
  await expect(leadLinks.nth(1)).toHaveAttribute("rel", "noopener noreferrer");
  await expect(leadLinks.nth(1)).toHaveText("Open GIS");

  // The links list is visible and holds exactly the expected link.
  const links = about.locator("ul.ogis-panel__links");
  await expect(links).toBeVisible();
  const anchors = links.locator("a");
  await expect(anchors).toHaveCount(1);
  await expect(anchors).toHaveText("Read the Docs");
  await expect(anchors.locator(".waymark-arrow")).toHaveCount(1);
  expect(
    await anchors.evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute("href")),
    ),
  ).toEqual(ABOUT_LINKS);

  // The OGIS callout banner is not rendered.
  const calloutBanner = page.locator(
    "#waymark-notice-container.plugin-callout",
  );
  await expect(calloutBanner).toHaveCount(0);

  // The label column spans the content width so controls get the full row.
  const header = page.locator("table.form-table th:visible").first();
  await expect(header).toBeVisible();
  const headerBox = await header.boundingBox();
  expect(headerBox).not.toBeNull();
  expect(headerBox.width).toBeGreaterThan(350);

  // Reveal the Tiles tab, home of the long Basemap URL input and the short
  // Max Zoom input.
  await page
    .locator(
      '#waymark-settings-nav a[data-content="waymark-settings-tab-tiles"]',
    )
    .click();
  await expect(page.locator(".waymark-settings-tab-tiles")).toBeVisible();
  await expect(page.locator(".waymark-settings-tab-markers")).toBeHidden();

  // Both inputs keep their help icon on the same row, to the right, without
  // overlapping the input. The section is repeatable and renders two Basemaps
  // by default, so the first pair is enough to prove the layout.
  for (const groupClass of [
    "layer_url-container",
    "layer_max_zoom-container",
  ]) {
    const group = page.locator(`.${groupClass}`).first();
    await expect(group).toBeVisible();

    const input = group.locator("input.waymark-input");
    const tooltip = group.locator("a.waymark-tooltip");
    await expect(input).toBeVisible();
    await expect(tooltip).toBeVisible();

    await input.scrollIntoViewIfNeeded();
    const inputBox = await input.boundingBox();
    const tooltipBox = await tooltip.boundingBox();
    expect(inputBox).not.toBeNull();
    expect(tooltipBox).not.toBeNull();

    expect(tooltipBox.y).toBeGreaterThanOrEqual(inputBox.y - 1);
    expect(tooltipBox.y).toBeLessThanOrEqual(inputBox.y + inputBox.height);
    expect(tooltipBox.x).toBeGreaterThanOrEqual(
      inputBox.x + inputBox.width - 1,
    );
  }

  // Switching tabs must not introduce horizontal scrolling either.
  const tilesViewport = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }));
  expect(tilesViewport.scrollWidth).toBeLessThanOrEqual(
    tilesViewport.innerWidth,
  );

  expect(consoleErrors, `Console errors:\n${consoleErrors.join("\n")}`).toEqual(
    [],
  );
  expect(pageErrors, `Page errors:\n${pageErrors.join("\n")}`).toEqual([]);
});
