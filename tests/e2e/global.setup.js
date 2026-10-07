// Playwright global setup: heal and verify the disposable wp-env tests
// instance before any spec runs.
//
// The WordPress PHPUnit bootstrap shares the tests-instance database
// (wp-tests-config.php reads WORDPRESS_DB_NAME), so running the PHP suite
// deactivates the plugin and resets the theme to a non-existent "default".
// Reactivating both here makes `npm run test:e2e` self-healing after
// `npm run test:php`.
const { execFileSync } = require("node:child_process");
const path = require("node:path");

const ROOT = path.join(__dirname, "..", "..");
const IS_WINDOWS = process.platform === "win32";
const WP_ENV_BIN = path.join(
  ROOT,
  "node_modules",
  ".bin",
  IS_WINDOWS ? "wp-env.cmd" : "wp-env",
);
const COMMAND_TIMEOUT = 120_000;

function runWpEnv(args) {
  return execFileSync(WP_ENV_BIN, args, {
    cwd: ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    timeout: COMMAND_TIMEOUT,
    shell: IS_WINDOWS,
  });
}

module.exports = async (config) => {
  const baseURL =
    config.projects[0]?.use?.baseURL ??
    process.env.WP_BASE_URL ??
    "http://localhost:8889";

  // Fail fast (and clearly) when the tests instance is not running.
  try {
    await fetch(baseURL, { signal: AbortSignal.timeout(5_000) });
  } catch (error) {
    throw new Error(
      `wp-env tests instance not reachable at ${baseURL} — run \`npx wp-env start\` (${error.message})`,
    );
  }

  // The PHP suite wipes the database: reactivate the plugin and a working
  // theme before the browser tests run.
  const steps = [
    ["plugin", "activate", "waymark-wp"],
    ["theme", "activate", "twentytwentyfive"],
  ];

  for (const wpArgs of steps) {
    try {
      runWpEnv(["run", "tests-cli", "wp", ...wpArgs]);
    } catch (error) {
      const detail = [error.stdout, error.stderr]
        .filter(Boolean)
        .join("\n")
        .trim();
      throw new Error(
        `Failed to prepare the wp-env tests instance (\`wp ${wpArgs.join(" ")}\`). Is wp-env running? Try \`npx wp-env start\`.\n${detail}`,
      );
    }
  }

  console.log(`[global-setup] wp-env tests instance ready at ${baseURL}`);
};
