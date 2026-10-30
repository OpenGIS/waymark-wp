// The Waymark submenu must identify its items by slug, not by translated
// labels. On the add-new screen the "New Map" item is hidden and "Maps" is
// marked current; on the Collection taxonomy screen "Collections" is current.
const { test, expect } = require("./fixtures");

const ADD_NEW_MAP_PATH = "/wp-admin/post-new.php?post_type=waymark_map";
const COLLECTIONS_PATH =
  "/wp-admin/edit-tags.php?taxonomy=waymark_collection&post_type=waymark_map";

// The add-new screen mounts the Map editor, which requests live OSM tiles.
// This spec only inspects the admin menu, so serve a transparent tile instead
// of depending on the recorded tile fixtures.
const TRANSPARENT_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  "base64",
);

test("marks the parent submenu item current on add-new and collection screens", async ({
  page,
  waymark,
}) => {
  await page.route("https://*.tile.openstreetmap.org/**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "image/png",
      body: TRANSPARENT_PNG,
    }),
  );

  await waymark.login(page);

  const menu = page.locator("#toplevel_page_edit-post_type-waymark_map");
  const submenu = menu.locator("ul.wp-submenu");

  const mapsItem = submenu
    .locator('a[href="edit.php?post_type=waymark_map"]')
    .locator("xpath=..");
  const newMapItem = submenu
    .locator('a[href="post-new.php?post_type=waymark_map"]')
    .locator("xpath=..");
  const collectionsItem = submenu
    .locator(
      'a[href="edit-tags.php?taxonomy=waymark_collection&post_type=waymark_map"]',
    )
    .locator("xpath=..");

  await page.goto(waymark.adminUrl(ADD_NEW_MAP_PATH));

  await expect(menu).toHaveClass(/wp-has-current-submenu/);
  await expect(mapsItem).toHaveClass(/\bcurrent\b/);
  await expect(newMapItem).toHaveClass(/\bhidden\b/);
  await expect(collectionsItem).not.toHaveClass(/\bcurrent\b/);

  // The plugin's admin CSS hides the class rather than removing the item.
  const newMapDisplay = await newMapItem.evaluate(
    (element) => getComputedStyle(element).display,
  );
  expect(newMapDisplay).toBe("none");

  await page.goto(waymark.adminUrl(COLLECTIONS_PATH));

  await expect(collectionsItem).toHaveClass(/\bcurrent\b/);
  await expect(mapsItem).not.toHaveClass(/\bcurrent\b/);
});
