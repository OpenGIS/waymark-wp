// Slice 11 layout resilience: the decorative docs arrow must not be part of
// the translatable string, and it must flip when the document direction does.
// Long labels must widen the settings label column instead of overflowing it.
const { test, expect } = require("./fixtures");

test("flips the docs arrow and keeps long labels inside the viewport", async ({
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

  await waymark.login(page);
  await page.goto(waymark.settingsUrl);

  await expect(page.locator(".waymark-settings-tab-markers")).toBeVisible();

  const arrow = page.locator(".waymark-docs-link .waymark-arrow").first();
  await expect(arrow).toHaveCount(1);
  await expect(arrow).toHaveAttribute("aria-hidden", "true");

  const arrowMetrics = () =>
    arrow.evaluate((node) => {
      const after = window.getComputedStyle(node, "::after");
      const arrowRect = node.getBoundingClientRect();
      const textNode = Array.from(node.parentElement.childNodes).find(
        (child) =>
          child.nodeType === Node.TEXT_NODE && child.textContent.trim(),
      );
      const range = document.createRange();
      range.selectNodeContents(textNode);
      const textRect = range.getBoundingClientRect();

      return {
        content: after.content.replace(/^"|"$/g, ""),
        direction: after.direction,
        arrowLeft: arrowRect.left,
        arrowRight: arrowRect.right,
        textLeft: textRect.left,
        textRight: textRect.right,
      };
    });

  const ltr = await arrowMetrics();
  expect(ltr.content).toBe("\u00bb");
  expect(ltr.direction).toBe("ltr");
  expect(ltr.arrowLeft).toBeGreaterThanOrEqual(ltr.textRight - 1);

  try {
    await page.evaluate(() => {
      document.documentElement.dir = "rtl";
    });

    const rtl = await arrowMetrics();

    // The base content stays U+00BB in both directions. U+00BB is a Unicode
    // bidi-mirrored character and the pseudo-element inherits the document's
    // `direction: rtl`, so the browser draws that right-pointing code point as
    // a left-pointing glyph. An explicit `[dir="rtl"]` override to U+00AB
    // would mirror the already-mirrored glyph a second time (a double-flip),
    // which is the regression this assertion guards against.
    expect(rtl.content).toBe("\u00bb");
    expect(rtl.direction).toBe("rtl");
    expect(rtl.arrowRight).toBeLessThanOrEqual(rtl.textLeft + 1);

    // Settings field labels are rendered as table headers rather than the
    // editor's `.waymark-control-label`, so widen a real label cell.
    const label = page.locator("table.form-table th:visible").first();
    await expect(label).toBeVisible();

    const originalLabel = await label.evaluate((node) => node.textContent);

    try {
      await label.evaluate((node) => {
        node.textContent =
          "A deliberately long control label used to verify layout resilience";
      });

      const box = await label.boundingBox();
      expect(box).not.toBeNull();
      expect(box.width).toBeGreaterThan(160);

      const overflow = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));

      expect(overflow.scrollWidth).toBeLessThanOrEqual(
        overflow.clientWidth + 1,
      );
    } finally {
      await label.evaluate((node, text) => {
        node.textContent = text;
      }, originalLabel);
    }
  } finally {
    await page.evaluate(() => {
      document.documentElement.dir = "ltr";
    });
  }

  expect(consoleErrors, `Console errors:\n${consoleErrors.join("\n")}`).toEqual(
    [],
  );
  expect(pageErrors, `Page errors:\n${pageErrors.join("\n")}`).toEqual([]);
});
