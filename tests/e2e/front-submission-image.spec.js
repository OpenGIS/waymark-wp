// Front-end submission editor image controls.
//
// A signed-in user who can upload files gets the WordPress Media Library for
// marker images: both the editor toolbar button and the marker popup button
// open the same image frame. Guests, and signed-in users without upload_files,
// keep the direct file-upload fallback.
//
// The demo seed has no submission Page, so this spec owns a disposable one and
// enables submissions for the duration of the file. It restores the exact
// pre-test settings and deletes the Page afterwards, using the same wp-env
// pattern as settings-repeatable.spec.js.
"use strict";

const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const {
  test,
  expect,
  installExternalRequestGuard,
  expectNoExternalRequests,
  stubExternalAssets,
  makePageDeterministic,
  installTileRoutes,
  settleMap,
} = require("./fixtures");

const ROOT = path.join(__dirname, "..", "..");
const IS_WINDOWS = process.platform === "win32";
const WP_ENV_BIN = path.join(
  ROOT,
  "node_modules",
  ".bin",
  IS_WINDOWS ? "wp-env.cmd" : "wp-env",
);
const COMMAND_TIMEOUT = 120_000;

const PAGE_SLUG = "waymark-e2e-submission";
const PAGE_TITLE = "Waymark E2E Submission";

// A subscriber can reach the submission Page through `submission_roles` but
// has no `upload_files` capability, so the server-side media gate stays off.
const SUBSCRIBER_LOGIN = "waymark-noupload";
const SUBSCRIBER_PASSWORD = "waymark-noupload-pass";
const SUBSCRIBER_EMAIL = "waymark-noupload@example.com";

const BASE_URL = (process.env.WP_BASE_URL ?? "http://localhost:8889").replace(
  /\/+$/,
  "",
);

const ORIGINAL_MARKER = "WAYMARK_ORIGINAL:";
const PAGE_ID_MARKER = "WAYMARK_PAGE_ID:";
const PAGE_URL_MARKER = "WAYMARK_PAGE_URL:";
const RESTORED_MARKER = "WAYMARK_RESTORED:";
const PAGE_DELETED_MARKER = "WAYMARK_PAGE_DELETED:";
const SUBSCRIBER_DELETED_MARKER = "WAYMARK_SUBSCRIBER_DELETED:";

const MARKER_ICON = ".leaflet-marker-pane .leaflet-marker-icon.waymark-marker";
const TOOLBAR_IMAGE = ".waymark-edit-toolbar a.waymark-edit-image";
const MODAL = ".media-modal:visible";
const UPLOADS_PATTERN = /^https?:\/\/.+\/uploads\//;

// Set WAYMARK_E2E_EVIDENCE_DIR to also write one screenshot per screen.
const EVIDENCE_DIR = process.env.WAYMARK_E2E_EVIDENCE_DIR;

const TILE_URL_PATTERN =
  /^https?:\/\/(?:[a-z0-9-]+\.)*tile\.(?:openstreetmap|opentopomap)\.org\//i;

// 1x1 transparent PNG. The submission editor opens at the default map centre,
// which is outside the frozen screenshot tile pack, so every basemap tile is
// served from memory. Tile pixels cannot affect the assertions here.
const TRANSPARENT_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

// The spec's own Page is created before the settings are changed. If Page
// creation fails, nothing has been written and there is nothing to restore.
// Markers are base64 JSON because wp-env appends its own status text.
const SETUP_PHP = `
	$settings = get_option( "Waymark_Settings" );
	if ( ! is_array( $settings ) ) {
		echo "WAYMARK_ERROR:missing-settings";
		exit( 1 );
	}
	$original = $settings;

	$existing = get_posts( [
		"post_type" => "page",
		"name" => "${PAGE_SLUG}",
		"post_status" => "any",
		"numberposts" => -1,
	] );
	foreach ( $existing as $page ) {
		wp_delete_post( $page->ID, true );
	}

	$page_id = wp_insert_post( [
		"post_type" => "page",
		"post_status" => "publish",
		"post_title" => "${PAGE_TITLE}",
		"post_name" => "${PAGE_SLUG}",
		"post_content" => '[Waymark content="submission"]',
	] );
	if ( ! $page_id || is_wp_error( $page_id ) ) {
		echo "WAYMARK_ERROR:page";
		exit( 1 );
	}

	$settings["submission"]["global"]["submission_enable"] = "1";
	$settings["submission"]["from_users"]["submission_roles"] = [ "administrator", "subscriber" ];
	$settings["submission"]["from_users"]["submission_features"] = [ "draw", "photo", "file", "title", "meta" ];
	$settings["submission"]["from_public"]["submission_public"] = "1";
	$settings["submission"]["from_public"]["submission_features"] = [ "draw", "photo", "file", "title" ];
	update_option( "Waymark_Settings", $settings );

	// Idempotent subscriber: no upload_files capability, but allowed to submit.
	$user = get_user_by( "login", "${SUBSCRIBER_LOGIN}" );
	if ( ! $user ) {
		$user_id = wp_create_user( "${SUBSCRIBER_LOGIN}", "${SUBSCRIBER_PASSWORD}", "${SUBSCRIBER_EMAIL}" );
		if ( is_wp_error( $user_id ) ) {
			echo "WAYMARK_ERROR:subscriber";
			exit( 1 );
		}
		$user = new WP_User( $user_id );
	}
	$user->set_role( "subscriber" );

	echo "\\nWAYMARK_ORIGINAL:" . base64_encode( wp_json_encode( $original ) );
	echo "\\nWAYMARK_PAGE_ID:" . $page_id;
	echo "\\nWAYMARK_PAGE_URL:" . get_permalink( $page_id );
`;

let pageUrl = null;
let pageId = null;
let originalSettings = null;

test.setTimeout(120_000);

/**
 * Run the project-local wp-env binary against the tests instance.
 *
 * @param {string[]} args
 * @returns {string}
 */
function runWpEnv(args) {
  try {
    return execFileSync(WP_ENV_BIN, args, {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      timeout: COMMAND_TIMEOUT,
      shell: IS_WINDOWS,
    });
  } catch (error) {
    const detail = [error.stdout, error.stderr]
      .filter(Boolean)
      .join("\n")
      .trim();
    throw new Error(
      `wp-env command failed (${args.join(" ")}).${detail ? `\n${detail}` : ""}`,
    );
  }
}

/**
 * Evaluate PHP inside the tests instance.
 *
 * @param {string} php
 * @returns {string}
 */
function evalPhp(php) {
  return runWpEnv(["run", "tests-cli", "wp", "eval", php]);
}

/**
 * Read a whitespace-terminated marker from wp-env output.
 *
 * @param {string} output
 * @param {string} marker
 * @returns {string}
 */
function readMarker(output, marker) {
  const index = output.indexOf(marker);

  if (index === -1) {
    const failure = output.match(/WAYMARK_ERROR:[^\s✔]+/);
    throw new Error(
      `wp eval did not return ${marker}${failure ? ` (${failure[0]})` : ""}`,
    );
  }

  return output.slice(index + marker.length).split(/\s/)[0];
}

/**
 * Decode a base64 JSON marker from wp-env output.
 *
 * @param {string} output
 * @param {string} marker
 * @returns {{ base64: string, value: unknown }}
 */
function decodeMarker(output, marker) {
  const match = output.match(new RegExp(`${marker}([A-Za-z0-9+/=]+)`));

  if (!match) {
    const failure = output.match(/WAYMARK_ERROR:[^\s✔]+/);
    throw new Error(
      `wp eval did not return ${marker}${failure ? ` (${failure[0]})` : ""}`,
    );
  }

  return {
    base64: match[1],
    value: JSON.parse(Buffer.from(match[1], "base64").toString("utf8")),
  };
}

/**
 * Delete the disposable Page and restore the exact pre-test settings.
 *
 * @returns {void}
 */
function restoreState() {
  const deletedPageId = pageId ?? 0;
  const php = `
		$data = json_decode( base64_decode( "${originalSettings}" ), true );
		if ( ! is_array( $data ) ) {
			echo "WAYMARK_ERROR:restore-decode";
			exit( 1 );
		}
		update_option( "Waymark_Settings", $data );
		$page_id = (int) "${deletedPageId}";
		if ( $page_id ) {
			wp_delete_post( $page_id, true );
		}
		// Safety net: remove anything that still holds the disposable slug.
		$remaining = get_posts( [
			"post_type" => "page",
			"name" => "${PAGE_SLUG}",
			"post_status" => "any",
			"numberposts" => -1,
		] );
		foreach ( $remaining as $page ) {
			wp_delete_post( $page->ID, true );
		}
		$leftover = get_posts( [
			"post_type" => "page",
			"name" => "${PAGE_SLUG}",
			"post_status" => "any",
			"numberposts" => -1,
		] );
		// Remove the subscriber created for the no-upload coverage.
		$user = get_user_by( "login", "${SUBSCRIBER_LOGIN}" );
		if ( $user ) {
			require_once ABSPATH . "wp-admin/includes/user.php";
			wp_delete_user( $user->ID );
		}
		$user_leftover = get_user_by( "login", "${SUBSCRIBER_LOGIN}" );
		echo "\\nWAYMARK_RESTORED:" . base64_encode( wp_json_encode( get_option( "Waymark_Settings" ) ) );
		echo "\\nWAYMARK_PAGE_DELETED:" . ( empty( $leftover ) ? "1" : "0" );
		echo "\\nWAYMARK_SUBSCRIBER_DELETED:" . ( empty( $user_leftover ) ? "1" : "0" );
	`;

  const output = evalPhp(php);
  const restored = decodeMarker(output, RESTORED_MARKER).value;
  const expected = JSON.parse(
    Buffer.from(originalSettings, "base64").toString("utf8"),
  );

  if (JSON.stringify(restored) !== JSON.stringify(expected)) {
    throw new Error("Waymark_Settings was not restored to its pre-test value.");
  }

  if (readMarker(output, PAGE_DELETED_MARKER) !== "1") {
    throw new Error("The disposable submission Page was not deleted.");
  }

  if (readMarker(output, SUBSCRIBER_DELETED_MARKER) !== "1") {
    throw new Error("The submission subscriber user was not deleted.");
  }
}

/**
 * Write a screenshot for browser evidence when an output directory is set.
 *
 * @param {import("@playwright/test").Page} page
 * @param {string} name
 */
async function captureEvidence(page, name) {
  if (!EVIDENCE_DIR) {
    return;
  }

  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
  await page.screenshot({ path: path.join(EVIDENCE_DIR, `${name}.png`) });
}

/**
 * Serve every basemap tile from memory.
 *
 * Installed after the `waymark` fixture's tile routes, so Playwright's
 * reverse-registration precedence lets this route win.
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
 * jQuery Migrate emits deprecation notices as console errors on some WordPress
 * versions; neither is a test failure.
 *
 * @param {import("@playwright/test").Page} page
 * @returns {() => void} assertion callback
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
 * Log in as a specific user on the tests instance.
 *
 * The shared `waymark.login` helper is hard-wired to the seeded admin; this
 * variant lets the no-upload test sign in as its own subscriber. Passing
 * `redirectTo` lands the login response straight on the requested URL, so a
 * subscriber never has to pass through wp-admin and the test observes the
 * front end itself.
 *
 * @param {import("@playwright/test").Page} page
 * @param {string} username
 * @param {string} password
 * @param {string} [redirectTo]
 */
async function loginAs(page, username, password, redirectTo) {
  const loginUrl = redirectTo
    ? `/wp-login.php?redirect_to=${encodeURIComponent(redirectTo)}`
    : "/wp-login.php";
  await page.goto(loginUrl);

  // WordPress's wp_attempt_focus() focuses and selects #user_login 200ms after
  // load; wait for it so it cannot interrupt the password fill.
  await page.waitForFunction(
    () => document.activeElement === document.getElementById("user_login"),
    null,
    { timeout: 10_000 },
  );

  await page.fill("#user_login", username);
  await page.fill("#user_pass", password);
  await page.click("#wp-submit");
  await expect(page.locator("#wpadminbar")).toBeVisible();
}

/**
 * Wait for the submission editor and settle its map.
 *
 * @param {import("@playwright/test").Page} page
 * @param {object} waymark the extended-test fixture
 */
async function openSubmissionEditor(page, waymark) {
  await page.goto(pageUrl);
  await page.locator(".waymark-is-editor").waitFor({ state: "visible" });
  await expect(page.locator("#waymark-map.waymark-submission")).toBeVisible();
  await waymark.settleMap(page);
}

/**
 * Add a marker at the map centre and open its popup.
 *
 * @param {import("@playwright/test").Page} page
 * @returns {import("@playwright/test").Locator} the open popup
 */
async function addMarkerAndOpenPopup(page) {
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

  await markerIcons.first().click();
  const popup = page.locator(".leaflet-popup");
  if ((await popup.count()) === 0) {
    await page.evaluate(() =>
      window.Waymark.map_data.eachLayer(
        (layer) => layer.openPopup && layer.openPopup(),
      ),
    );
  }
  await expect(popup).toBeVisible();

  return popup;
}

/**
 * Open the popup of the single marker already on the map.
 *
 * @param {import("@playwright/test").Page} page
 * @returns {import("@playwright/test").Locator} the open popup
 */
async function openExistingMarkerPopup(page) {
  const markerIcons = page.locator(MARKER_ICON);
  await expect(markerIcons).toHaveCount(1);
  await markerIcons.first().click();

  const popup = page.locator(".leaflet-popup");
  if ((await popup.count()) === 0) {
    await page.evaluate(() =>
      window.Waymark.map_data.eachLayer(
        (layer) => layer.openPopup && layer.openPopup(),
      ),
    );
  }
  await expect(popup).toBeVisible();

  return popup;
}

/**
 * Assert the Media Library frame's custom chrome and browse tab.
 *
 * @param {import("@playwright/test").Page} page
 * @returns {import("@playwright/test").Locator} the visible modal
 */
async function expectMediaFrame(page) {
  const modal = page.locator(MODAL);

  await expect(modal).toBeVisible();
  await expect(page.locator(".media-frame-title h1")).toHaveText("Add Image");
  await expect(
    page.locator(".media-frame-toolbar .media-button-select"),
  ).toHaveText("Use Image");
  await expect(
    page.locator(".media-toolbar-primary .button-primary"),
  ).toHaveText("Use Image");

  // The frame must open on the Media Library tab. WordPress restores the
  // per-user `libraryContent` tab when a frame opens, so the explicit
  // content-mode switch has to win. Assert tab state only, never attachment
  // counts or grid contents.
  const browseTab = modal.locator(".media-router #menu-item-browse");
  const uploadTab = modal.locator(".media-router #menu-item-upload");
  await expect(browseTab).toHaveClass(/\bactive\b/);
  await expect(browseTab).toHaveAttribute("aria-selected", "true");
  await expect(uploadTab).not.toHaveClass(/\bactive\b/);
  await expect(uploadTab).toHaveAttribute("aria-selected", "false");

  return modal;
}

test.beforeAll(() => {
  // One wp-env round trip seeds the settings and creates the Page.
  const output = evalPhp(SETUP_PHP);
  originalSettings = decodeMarker(output, ORIGINAL_MARKER).base64;
  pageId = Number(readMarker(output, PAGE_ID_MARKER));
  pageUrl = readMarker(output, PAGE_URL_MARKER);

  expect(pageId).toBeGreaterThan(0);
  expect(pageUrl).toContain(PAGE_SLUG);
});

test.afterAll(() => {
  if (originalSettings !== null) {
    restoreState();
  }
});

test.beforeEach(async ({ page }) => {
  await stubBasemapTiles(page);
});

test("popup image button opens the Media Library and selection updates the marker", async ({
  page,
  waymark,
}) => {
  const assertNoErrors = startErrorGate(page);

  await waymark.login(page);
  await openSubmissionEditor(page, waymark);

  const popup = await addMarkerAndOpenPopup(page);
  const imageButton = popup.locator(".waymark-info-image_large_url .button");
  await expect(imageButton).toBeVisible();

  await imageButton.click();
  const modal = await expectMediaFrame(page);

  // Choose a seeded demo image. The selection updates the marker feature and
  // the popup preview in place without touching the server.
  const attachments = modal.locator(".media-frame-content .attachment");
  await expect(attachments.first()).toBeVisible({ timeout: 15_000 });
  await captureEvidence(page, "front-submission-popup-media-library");

  await attachments.first().click();

  const selectButton = modal.locator(
    ".media-frame-toolbar .media-button-select",
  );
  await expect(selectButton).toBeEnabled();
  await captureEvidence(page, "front-submission-popup-selected");
  await selectButton.click();
  await expect(page.locator(MODAL)).toHaveCount(0);

  const imageLink = popup.locator(".waymark-info-image_large_url a");
  const imagePreview = popup.locator(".waymark-info-image_large_url img");
  const imageInput = popup.locator(".waymark-info-image_large_url input");

  await expect(imageLink).toHaveAttribute("href", /^https?:\/\/.+\/uploads\//);
  await expect(imagePreview).toHaveAttribute(
    "src",
    /^https?:\/\/.+\/uploads\//,
  );
  await expect(imageInput).toHaveValue(/^https?:\/\/.+\/uploads\//);

  // The preview must be a real, decoded image, not just a URL attribute.
  await expect
    .poll(
      () =>
        imagePreview.evaluate((image) =>
          Boolean(image.complete && image.naturalWidth > 0),
        ),
      { timeout: 15_000 },
    )
    .toBe(true);

  await captureEvidence(page, "front-submission-marker-preview");

  assertNoErrors();
});

test("toolbar image button opens the same Media Library frame", async ({
  page,
  waymark,
}) => {
  const assertNoErrors = startErrorGate(page);

  await waymark.login(page);
  await openSubmissionEditor(page, waymark);

  const toolbarImage = page.locator(TOOLBAR_IMAGE);
  await expect(toolbarImage).toBeVisible();
  await toolbarImage.click();

  const modal = await expectMediaFrame(page);
  await expect(
    modal.locator(".media-frame-content .attachment").first(),
  ).toBeVisible({ timeout: 15_000 });
  await captureEvidence(page, "front-submission-toolbar-media-library");

  // Closing the frame must leave no modal over the editor and must not create
  // a marker: only the select handler adds one.
  await modal.locator(".media-modal-close").click();
  await expect(page.locator(MODAL)).toHaveCount(0);
  await expect(page.locator(MARKER_ICON)).toHaveCount(0);

  assertNoErrors();
});

test("toolbar image selection creates a marker with the chosen image", async ({
  page,
  waymark,
}) => {
  const assertNoErrors = startErrorGate(page);

  await waymark.login(page);
  await openSubmissionEditor(page, waymark);

  const toolbarImage = page.locator(TOOLBAR_IMAGE);
  await expect(toolbarImage).toBeVisible();
  await toolbarImage.click();

  const modal = await expectMediaFrame(page);
  const attachments = modal.locator(".media-frame-content .attachment");
  await expect(attachments.first()).toBeVisible({ timeout: 15_000 });
  await attachments.first().click();

  const selectButton = modal.locator(
    ".media-frame-toolbar .media-button-select",
  );
  await expect(selectButton).toBeEnabled();
  await captureEvidence(page, "front-submission-toolbar-selected");
  await selectButton.click();
  await expect(page.locator(MODAL)).toHaveCount(0);

  // The select handler resolves the attachment metadata over AJAX before it
  // adds the Marker; wait for both the layer and the saved GeoJSON.
  const markerIcons = page.locator(MARKER_ICON);
  await expect(markerIcons).toHaveCount(1, { timeout: 15_000 });

  const dataInput = page.locator("#waymark-data");
  await expect(dataInput).toHaveClass(/waymark-input-map_data/);
  await expect
    .poll(
      async () => {
        try {
          return JSON.parse(await dataInput.inputValue()).features.length;
        } catch {
          return 0;
        }
      },
      { timeout: 15_000 },
    )
    .toBe(1);

  const geojson = JSON.parse(await dataInput.inputValue());
  const properties = geojson.features[0].properties;
  expect(properties.image_large_url).toMatch(UPLOADS_PATTERN);
  expect(typeof properties.image_thumbnail_url).toBe("string");
  expect(properties.image_thumbnail_url).toMatch(UPLOADS_PATTERN);

  const popup = await openExistingMarkerPopup(page);
  await expect(
    popup.locator(".waymark-info-image_large_url img"),
  ).toHaveAttribute("src", UPLOADS_PATTERN);
  await expect(
    popup.locator(".waymark-info-image_large_url input"),
  ).toHaveValue(UPLOADS_PATTERN);
  await captureEvidence(page, "front-submission-toolbar-marker-preview");

  assertNoErrors();
});

test("guest image button keeps the native file-upload fallback", async ({
  page,
  waymark,
}) => {
  const assertNoErrors = startErrorGate(page);

  // Each Playwright test gets a fresh context, so this visitor is logged out.
  await openSubmissionEditor(page, waymark);
  await expect(page.locator("#wpadminbar")).toHaveCount(0);
  await captureEvidence(page, "front-submission-guest-editor");

  const toolbarImage = page.locator(TOOLBAR_IMAGE);
  await expect(toolbarImage).toBeVisible();

  const [chooser] = await Promise.all([
    page.waitForEvent("filechooser"),
    toolbarImage.click(),
  ]);

  const chooserInput = chooser.element();
  expect(chooser.isMultiple()).toBe(false);
  expect(await chooserInput.getAttribute("type")).toBe("file");
  expect(await chooserInput.getAttribute("name")).toBe("add_photo");
  await expect(page.locator(".media-modal")).toHaveCount(0);

  assertNoErrors();
});

test("guest popup image button keeps the marker_photo fallback", async ({
  page,
  waymark,
}) => {
  const assertNoErrors = startErrorGate(page);

  await openSubmissionEditor(page, waymark);
  await expect(page.locator("#wpadminbar")).toHaveCount(0);

  const popup = await addMarkerAndOpenPopup(page);
  const imageButton = popup.locator(".waymark-info-image_large_url .button");
  await expect(imageButton).toBeVisible();
  await captureEvidence(page, "front-submission-guest-popup");

  const [chooser] = await Promise.all([
    page.waitForEvent("filechooser"),
    imageButton.click(),
  ]);

  const chooserInput = chooser.element();
  expect(chooser.isMultiple()).toBe(false);
  expect(await chooserInput.getAttribute("type")).toBe("file");
  expect(await chooserInput.getAttribute("name")).toBe("marker_photo");
  await expect(page.locator(".media-modal")).toHaveCount(0);

  assertNoErrors();
});

test("signed-in user without upload_files keeps the native fallback", async ({
  browser,
}) => {
  test.setTimeout(120_000);

  // A separate context keeps the subscriber's cookies away from the admin
  // session the other tests use. It also needs its own copy of the harness,
  // because the auto-use fixture only wires up the default Page.
  const context = await browser.newContext({
    baseURL: BASE_URL,
    viewport: { width: 1600, height: 1000 },
    deviceScaleFactor: 2,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  const violations = [];

  await installExternalRequestGuard(page, violations);
  await stubExternalAssets(page);
  await makePageDeterministic(page);
  await installTileRoutes(page, { violations });
  await stubBasemapTiles(page);

  const assertNoErrors = startErrorGate(page);

  try {
    await loginAs(page, SUBSCRIBER_LOGIN, SUBSCRIBER_PASSWORD, pageUrl);
    await expect(page.locator(".waymark-is-editor")).toBeVisible();
    await expect(page.locator("#waymark-map.waymark-submission")).toBeVisible();
    await settleMap(page);
    await captureEvidence(page, "front-submission-noupload-editor");

    // The server gate is genuinely off: `waymark_js` exists, but without
    // `media_library`, and no frame markup was printed.
    const mediaLibrary = await page.evaluate(() => ({
      defined: typeof window.waymark_js !== "undefined",
      enabled: Boolean(window.waymark_js && window.waymark_js.media_library),
    }));
    expect(mediaLibrary.defined).toBe(true);
    expect(mediaLibrary.enabled).toBe(false);
    await expect(page.locator(".media-modal")).toHaveCount(0);

    const toolbarImage = page.locator(TOOLBAR_IMAGE);
    await expect(toolbarImage).toBeVisible();

    const [chooser] = await Promise.all([
      page.waitForEvent("filechooser"),
      toolbarImage.click(),
    ]);

    const toolbarChooserInput = chooser.element();
    expect(chooser.isMultiple()).toBe(false);
    expect(await toolbarChooserInput.getAttribute("type")).toBe("file");
    expect(await toolbarChooserInput.getAttribute("name")).toBe("add_photo");
    // The fallback input must live in the class-selected toolbar.
    expect(
      await toolbarChooserInput.evaluate((input) =>
        Boolean(input.closest(".waymark-edit-toolbar")),
      ),
    ).toBe(true);
    await expect(page.locator(".media-modal")).toHaveCount(0);

    const popup = await addMarkerAndOpenPopup(page);
    const imageButton = popup.locator(".waymark-info-image_large_url .button");
    await expect(imageButton).toBeVisible();
    await captureEvidence(page, "front-submission-noupload-popup");

    const [popupChooser] = await Promise.all([
      page.waitForEvent("filechooser"),
      imageButton.click(),
    ]);

    const popupInput = popupChooser.element();
    expect(popupChooser.isMultiple()).toBe(false);
    expect(await popupInput.getAttribute("type")).toBe("file");
    expect(await popupInput.getAttribute("name")).toBe("marker_photo");
    await expect(page.locator(".media-modal")).toHaveCount(0);

    assertNoErrors();
    expectNoExternalRequests(violations);
  } finally {
    await context.close();
  }
});
