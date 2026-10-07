// Playwright e2e configuration for the Waymark WordPress plugin.
// Runs against the disposable wp-env tests instance (http://localhost:8889).
// Never point this at the development instance (http://localhost:8888).
const { defineConfig, devices } = require("@playwright/test");

const baseURL = process.env.WP_BASE_URL ?? "http://localhost:8889";

if (/:8888\b/.test(baseURL)) {
  throw new Error(
    `Refusing to run e2e tests against the dev instance: ${baseURL}`,
  );
}

module.exports = defineConfig({
  testDir: "./tests/e2e",
  globalSetup: "./tests/e2e/global.setup.js",
  outputDir: ".opencode/tmp/playwright",
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
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
