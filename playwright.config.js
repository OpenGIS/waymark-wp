// Playwright e2e configuration for the Waymark WordPress plugin.
// Runs against the disposable wp-env tests instance (http://localhost:8889).
// Never point this at the development instance (http://localhost:8888).
//
// Deterministic screenshot specs must obtain the harness (external-request
// guard, asset stubs, determinism and tile record/replay) from
// tests/e2e/fixtures.js — see its extended `test`. The legacy map-editor smoke
// spec intentionally uses live OSM tiles and does not.
const { defineConfig, devices } = require("@playwright/test");

const baseURL = process.env.WP_BASE_URL ?? "http://localhost:8889";

if (/:8888\b/.test(baseURL)) {
  throw new Error(
    `Refusing to run e2e tests against the dev instance: ${baseURL}`,
  );
}

// Shared rendering defaults for the screenshot suite: a fixed retina viewport
// at the Desktop Chrome device profile, with motion disabled.
const screenshotDefaults = {
  viewport: { width: 1600, height: 1000 },
  deviceScaleFactor: 2,
  reducedMotion: "reduce",
};

module.exports = defineConfig({
  testDir: "./tests/e2e",
  globalSetup: "./tests/e2e/global.setup.js",
  outputDir: "temp/playwright",
  timeout: 15_000,
  expect: { timeout: 5_000 },
  retries: 0,
  workers: 1,
  fullyParallel: false,
  reporter: [["list"]],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], ...screenshotDefaults },
    },
  ],
});
