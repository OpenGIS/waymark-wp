// Regression: a repeatable Settings group with ragged data must survive a
// save.
//
// A repeatable column with fewer values than its siblings used to render the
// extra rows' inputs without an array index. Saving the Settings form then
// collapsed that column to a scalar and dropped a value. This spec seeds the
// Basemaps group with one Max Zoom, saves the form, and proves both the
// rendered input names and the stored option keep one value per row.
const { execFileSync } = require("node:child_process");
const path = require("node:path");
const { test, expect } = require("./fixtures");

const ROOT = path.join(__dirname, "..", "..");
const IS_WINDOWS = process.platform === "win32";
const WP_ENV_BIN = path.join(
  ROOT,
  "node_modules",
  ".bin",
  IS_WINDOWS ? "wp-env.cmd" : "wp-env",
);
const COMMAND_TIMEOUT = 120_000;

const SETTINGS_PATH =
  "/wp-admin/edit.php?post_type=waymark_map&page=waymark-settings";
const BASEMAPS = ".waymark-settings-section-layers .waymark-repeatable";
const SIBLING_COLUMNS = ["layer_name", "layer_url", "layer_attribution"];
const MAX_ZOOM_NAME = "Waymark_Settings[tiles][layers][layer_max_zoom]";
const ORIGINAL_MARKER = "WAYMARK_ORIGINAL:";
const SEEDED_MARKER = "WAYMARK_SEEDED:";
const LAYERS_MARKER = "WAYMARK_LAYERS:";
const RESTORED_MARKER = "WAYMARK_RESTORED:";

// Read the saved option, keep an exact copy for restoration, then shorten the
// Max Zoom column while the sibling columns keep their two rows. The copy is
// emitted base64-encoded because wp-env appends its own status text to stdout.
const SEED_PHP = `
	$settings = get_option( "Waymark_Settings" );
	if ( ! is_array( $settings ) || ! isset( $settings["tiles"]["layers"] ) || ! is_array( $settings["tiles"]["layers"] ) ) {
		echo "WAYMARK_ERROR:missing-settings";
		exit( 1 );
	}
	foreach ( [ "layer_name", "layer_url", "layer_attribution" ] as $column ) {
		if ( ! isset( $settings["tiles"]["layers"][ $column ] ) || ! is_array( $settings["tiles"]["layers"][ $column ] ) || count( $settings["tiles"]["layers"][ $column ] ) < 2 ) {
			echo "WAYMARK_ERROR:short-" . $column;
			exit( 1 );
		}
	}
	$original = $settings;
	$settings["tiles"]["layers"]["layer_max_zoom"] = [ "18" ];
	update_option( "Waymark_Settings", $settings );
	echo "\\nWAYMARK_ORIGINAL:" . base64_encode( wp_json_encode( $original ) );
	echo "\\nWAYMARK_SEEDED:" . base64_encode( wp_json_encode( get_option( "Waymark_Settings" )["tiles"]["layers"] ) );
`;

const READ_LAYERS_PHP = `
	$settings = get_option( "Waymark_Settings" );
	if ( ! is_array( $settings ) || ! isset( $settings["tiles"]["layers"] ) || ! is_array( $settings["tiles"]["layers"] ) ) {
		echo "WAYMARK_ERROR:missing-settings";
		exit( 1 );
	}
	echo "WAYMARK_LAYERS:" . base64_encode( wp_json_encode( $settings["tiles"]["layers"] ) );
`;

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
 * Read the saved Basemaps columns straight from the option.
 *
 * @returns {Record<string, unknown>}
 */
function readLayers() {
  return decodeMarker(evalPhp(READ_LAYERS_PHP), LAYERS_MARKER).value;
}

/**
 * Put the pre-test option back exactly as it was.
 *
 * @param {string} original Base64 JSON of the complete option.
 * @returns {void}
 */
function restoreSettings(original) {
  const php = `
		$data = json_decode( base64_decode( "${original}" ), true );
		if ( ! is_array( $data ) ) {
			echo "WAYMARK_ERROR:restore-decode";
			exit( 1 );
		}
		update_option( "Waymark_Settings", $data );
		echo "WAYMARK_RESTORED:" . base64_encode( wp_json_encode( get_option( "Waymark_Settings" ) ) );
	`;

  const restored = decodeMarker(
    runWpEnv(["run", "tests-cli", "wp", "eval", php]),
    RESTORED_MARKER,
  ).value;
  const expected = JSON.parse(Buffer.from(original, "base64").toString("utf8"));

  if (JSON.stringify(restored) !== JSON.stringify(expected)) {
    throw new Error("Waymark_Settings was not restored to its pre-test value.");
  }
}

test("keeps a ragged repeatable column indexed through a settings save", async ({
  page,
  waymark,
}) => {
  // Three wp-env round trips plus the settings save and reload.
  test.setTimeout(120_000);

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

  let original = null;

  try {
    const seed = evalPhp(SEED_PHP);
    original = decodeMarker(seed, ORIGINAL_MARKER).base64;

    const seeded = decodeMarker(seed, SEEDED_MARKER).value;
    expect(seeded.layer_max_zoom).toEqual(["18"]);
    for (const column of SIBLING_COLUMNS) {
      expect(seeded[column]).toHaveLength(2);
    }

    await waymark.login(page);
    await page.goto(SETTINGS_PATH);

    // The repeatable script replaces the single PHP-rendered table with one
    // table per saved row, then indexes every input in each clone.
    const repeatable = page.locator(BASEMAPS);
    await expect(repeatable).toHaveCount(1);
    const rows = repeatable.locator("table.form-table");
    await expect(rows).toHaveCount(2);

    const rowNames = await rows.evaluateAll((tables) =>
      tables.map((table) =>
        Array.from(table.querySelectorAll("input.waymark-input")).map((input) =>
          input.getAttribute("name"),
        ),
      ),
    );

    expect(rowNames).toHaveLength(2);
    rowNames.forEach((names, rowIndex) => {
      expect(names.length).toBeGreaterThan(0);
      for (const name of names) {
        expect(name, `${name} should end with row index [${rowIndex}]`).toMatch(
          new RegExp(`\\[${rowIndex}\\]$`),
        );
      }
    });

    // The short column must still receive an index on its missing row.
    const maxZoomInputs = repeatable.locator(
      "input.waymark-input.waymark-layer_max_zoom",
    );
    await expect(maxZoomInputs).toHaveCount(2);
    await expect(maxZoomInputs.nth(0)).toHaveAttribute(
      "name",
      `${MAX_ZOOM_NAME}[0]`,
    );
    await expect(maxZoomInputs.nth(1)).toHaveAttribute(
      "name",
      `${MAX_ZOOM_NAME}[1]`,
    );

    const body = page.locator("body");
    await expect(body).not.toHaveClass(/php-error/);
    expect(await page.evaluate(() => document.body.innerText)).not.toContain(
      "Warning:",
    );

    // Save and wait for the settings page to reload with its success notice.
    await Promise.all([
      page.waitForURL(/settings-updated=true/),
      page.locator("#submit").click(),
    ]);

    const notice = page.locator(".waymark-notice.notice-success");
    await expect(notice).toBeVisible();
    await expect(notice).toContainText("Settings Updated");

    await expect(body).not.toHaveClass(/php-error/);
    expect(await page.evaluate(() => document.body.innerText)).not.toContain(
      "Warning:",
    );

    // The saved option keeps one value per row rather than collapsing to a
    // scalar.
    const saved = readLayers();
    expect(Array.isArray(saved.layer_max_zoom)).toBe(true);
    expect(saved.layer_max_zoom).toHaveLength(2);
    expect(saved.layer_max_zoom).toEqual(["18", "18"]);
    for (const column of SIBLING_COLUMNS) {
      expect(saved[column]).toHaveLength(2);
    }

    expect(
      consoleErrors,
      `Console errors:\n${consoleErrors.join("\n")}`,
    ).toEqual([]);
    expect(pageErrors, `Page errors:\n${pageErrors.join("\n")}`).toEqual([]);
  } finally {
    // Restore the exact pre-test option so later specs see clean data.
    if (original !== null) {
      restoreSettings(original);
    }
  }
});
