---
git_hash: "2847394ee3f888f11e4b292e15c986673193cd5a"
modified: "2026-11-02"
---

# Waymark developer documentation

Developer-facing notes for the Waymark WordPress plugin; the user-facing help site lives in [`help/`](../help/) and is not duplicated here.

## Reading order

1. [Getting started](1.start.md) — environment, first-time setup, the plugin and help-site development loops, and help-content authoring.
2. [Architecture](2.architecture.md) — how the plugin boots, stores and upgrades data, renders Maps, exposes endpoints and extension points, and applies security conventions.
3. [Video pipeline](3.video-pipeline.md) — where the screencast tooling lives and how to validate its output.
4. [Testing](4.testing.md) — the PHPUnit, Vitest and Playwright suites, plus the i18n parity check.
5. [Build and release](5.build-and-release.md) — Grunt outputs, distributable builds, help-site deployment and the WordPress.org release flow.

## Quick links

- [Main README](../readme.md)
- [Repository conventions](../AGENTS.md)
- [Plugin bootstrap](../Waymark.php)
- [PHP source](../inc/)
- [Waymark JS library](../waymark-js/)
- [Plugin assets](../assets/)
- [Tests](../tests/)
- [User-facing help site](../help/)

## Documentation coverage

These pages describe the developer-facing shape of the repository: setup, architecture, HTTP/AJAX and extension points, security conventions, the video toolchain, test suites, and build and release procedures. They link to source and configuration rather than repeating implementation detail. For product behaviour and usage, read the [help content](../help/content/).
