// Slice 10: the PHP map config must reach the editor as a BCP-47 locale and
// the display formatter must use it for numbers.
const { test, expect } = require("./fixtures");

const DEMO_MAP = "cape-scott-trail";

test("editor receives a BCP-47 locale and formats numbers", async ({
  page,
  waymark,
}) => {
  test.setTimeout(60_000);

  const demoMap = waymark.getMap(DEMO_MAP);

  await waymark.login(page);
  await page.goto(
    waymark.adminUrl(`/wp-admin/post.php?post=${demoMap.id}&action=edit`),
  );

  await expect(page.locator("#waymark_map_meta")).toBeVisible();
  await expect(page.locator(".waymark-is-editor")).toBeVisible();

  await expect
    .poll(() => page.evaluate(() => Boolean(window.Waymark)))
    .toBe(true);

  const result = await page.evaluate(() => {
    const locale = window.Waymark.config.locale;
    const formatted = window.Waymark.format_number(1234.5, 2);
    const expected = new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(1234.5);

    return { locale, formatted, expected };
  });

  expect(result.locale).toBeTruthy();
  expect(result.locale).not.toContain("_");
  expect(result.locale).toMatch(/^[A-Za-z]{2,3}(?:-[A-Za-z0-9]+)*$/);
  expect(result.formatted).toBe(result.expected);
});
