// End-to-end smoke test: create a Map in the classic editor, add a marker,
// give it an HTML description containing a link (exercising the GeoJSON
// escaping path), publish it, and verify the front end renders the overlay
// with no console errors. Finally reopen the editor to confirm the data
// survived the round trip.
const { test, expect } = require("@playwright/test");

const DESCRIPTION_HTML = '<p>E2E <a href="https://example.com">link</a></p>';
const MAP_DATA = 'textarea[name="map_data"]';
const MARKER_ICON = ".leaflet-marker-pane .leaflet-marker-icon.waymark-marker";
// Headed Chromium's browser UI requests /favicon.ico for the tab icon; the
// wp-env tests site serves no favicon, so it 404s. Headless Chromium makes no
// such request. Exclude only this browser-chrome noise from the console gate.
const FAVICON_URL = /\/favicon\.ico$/;

test("creates a Map with a linked marker description and renders it on the front end", async ({
  page,
}) => {
  // The flow spans several full page loads plus tile waits.
  test.setTimeout(90_000);

  const consoleErrors = [];
  const pageErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error" && !FAVICON_URL.test(msg.location().url)) {
      consoleErrors.push(`[${msg.type()}] ${msg.text()}`);
    }
  });
  page.on("pageerror", (err) => pageErrors.push(String(err)));

  // 1. Log in.
  await page.goto("/wp-login.php");
  // WordPress's wp_attempt_focus() focuses and selects #user_login 200ms after
  // load; wait for it so it cannot interrupt the password fill.
  await page.waitForFunction(
    () => document.activeElement === document.getElementById("user_login"),
    null,
    { timeout: 10_000 },
  );
  await page.fill("#user_login", "admin");
  await page.fill("#user_pass", "password");
  await page.click("#wp-submit");
  await expect(page.locator("#wpadminbar")).toBeVisible();

  // 2. Open the classic Map editor.
  await page.goto("/wp-admin/post-new.php?post_type=waymark_map");
  const title = `E2E Smoke Map ${Date.now()}`;
  await expect(page.locator("#title")).toBeVisible();
  const mapData = page.locator(MAP_DATA);
  await expect(mapData).toBeAttached();

  // 3. Title.
  await page.fill("#title", title);

  // 4. Add a marker; the toolbar button drops it at the map centre.
  const addMarkerButton = page.locator(
    "a.waymark-edit-button.waymark-edit-marker",
  );
  await expect(addMarkerButton).toBeVisible();
  await addMarkerButton.click();
  const markerIcons = page.locator(MARKER_ICON);
  if ((await markerIcons.count()) === 0) {
    // Leaflet occasionally swallows synthetic clicks; fall back to jQuery.
    await page.evaluate(() =>
      window
        .jQuery("a.waymark-edit-button.waymark-edit-marker")
        .trigger("click"),
    );
  }
  await expect(markerIcons).toHaveCount(1);

  // 5. Open the marker popup and wait for its TinyMCE description editor.
  await markerIcons.first().click();
  if ((await page.locator(".leaflet-popup").count()) === 0) {
    await page.evaluate(() =>
      window.Waymark.map_data.eachLayer(
        (layer) => layer.openPopup && layer.openPopup(),
      ),
    );
  }
  await page.waitForFunction(
    () => window.tinymce && window.tinymce.get("waymark-info-description"),
  );

  // 6. Set an HTML description containing a link.
  await page.evaluate((html) => {
    const editor = window.tinymce.get("waymark-info-description");
    editor.setContent(html);
    editor.fire("change");
  }, DESCRIPTION_HTML);

  // 7. Close the popup by clicking the map canvas away from the marker.
  await page
    .locator(".leaflet-container")
    .click({ position: { x: 200, y: 400 } });
  const popup = page.locator(".leaflet-popup");
  if (await popup.isVisible()) {
    await page.evaluate(() => window.Waymark.map.closePopup());
  }
  await expect(popup).toBeHidden();

  // 8. The (debug-hidden) data textarea now holds escaped, valid GeoJSON.
  const rawMapData = await mapData.inputValue();
  expect(rawMapData).toContain('href=\\"https://example.com\\"');
  const geoJson = JSON.parse(rawMapData);
  expect(geoJson.type).toBe("FeatureCollection");
  expect(geoJson.features).toHaveLength(1);
  expect(geoJson.features[0].properties.description).toBe(DESCRIPTION_HTML);

  // 9. Editor screenshot.
  await page.screenshot({ path: ".opencode/tmp/e2e-map-01-editor.png" });

  // 10. Publish and capture the post ID and permalink.
  await page.click("#publish");
  const notice = page.locator("#message.updated");
  await expect(notice).toContainText("Post published.");
  const postId = new URL(page.url()).searchParams.get("post");
  expect(postId).toBeTruthy();
  const permalink = await notice.locator("a").first().getAttribute("href");
  expect(permalink).toBeTruthy();

  // 11. Front end renders tiles and the marker overlay.
  await page.goto(permalink);
  await expect
    .poll(() => page.locator("img.leaflet-tile-loaded").count(), {
      timeout: 20_000,
    })
    .toBeGreaterThan(0);
  await expect(page.locator(MARKER_ICON)).toHaveCount(1);

  // 12. Front end screenshot (scroll the map into frame first).
  await page.locator(".leaflet-container").scrollIntoViewIfNeeded();
  await page.screenshot({ path: ".opencode/tmp/e2e-map-02-frontend.png" });

  // 13. Reopen the editor; the saved data survived the round trip.
  await page.goto(`/wp-admin/post.php?post=${postId}&action=edit`);
  await expect(page.locator(MARKER_ICON)).toHaveCount(1);
  const reloadedRaw = await page.locator(MAP_DATA).inputValue();
  const reloadedGeoJson = JSON.parse(reloadedRaw);
  expect(reloadedGeoJson.features).toHaveLength(1);
  expect(reloadedGeoJson.features[0].properties.description).toBe(
    DESCRIPTION_HTML,
  );

  // 14. Reloaded editor screenshot.
  await page.screenshot({ path: ".opencode/tmp/e2e-map-03-editor-reload.png" });

  // 15. Tidy up: move the test post to the trash.
  page.once("dialog", (dialog) => dialog.accept());
  await page.locator("#delete-action a").click();
  await expect(page.locator("#message")).toContainText(/Trash/i);

  // Whole-run console/page error gate.
  expect(consoleErrors, `Console errors:\n${consoleErrors.join("\n")}`).toEqual(
    [],
  );
  expect(pageErrors, `Page errors:\n${pageErrors.join("\n")}`).toEqual([]);
});
