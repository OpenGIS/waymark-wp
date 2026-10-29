# Reorganise `docs/` into `help/` and `docs/`

Plan for separating the **public user help site** from **codebase documentation**.

## Goal

- Move the current Nuxt site from `docs/` to `help/` and rebrand it as **Help** —
  the public, user-facing manual published at `https://www.ogis.org/waymark-wp/`.
- Reuse `docs/` for **developer documentation** maintained with the `docs` skill:
  numbered pages, frontmatter metadata, index-first, gap-detected.
- Leave the video pipeline untouched in behaviour; only its hardcoded paths move.

## Current state

- `docs/` is the **published help site** (Nuxt Content, 23 Markdown pages, 26 Vue
  components), deployed to GitHub Pages by `.github/workflows/deploy-docs.yml`
  and served publicly under `/waymark-wp/`.
- The same folder also carries the committed delivery assets
  (`docs/public/assets/video/`, 48 MB) and the brand assets
  (`docs/public/assets/img/`, 50 MB).
- There is **no developer documentation folder**. Pipeline documentation lives at
  `scripts/video/README.md`.

## Target layout

```
help/                     # public user help (Nuxt app, unchanged shape)
  content/                # 23 user pages
  app/                    # site components and layouts
  public/assets/          # images, video, css, js
  scripts/                # sync-waymark-assets.mjs
  nuxt.config.ts, package.json, ...

docs/                     # developer documentation (docs skill)
  README.md               # index and reading order
  1.start.md              # setup, dev loop, tests
  2.architecture.md       # plugin structure, data flow
  3.video-pipeline.md     # distilled from scripts/video/README.md
  4.testing.md            # PHPUnit, Vitest, Playwright
  5.build-and-release.md  # grunt, dist, WordPress.org, docs deploy
  assets/                 # diagrams
```

## Assumptions & constraints

- The published base URL stays `/waymark-wp/` and the public URL stays
  `https://www.ogis.org/waymark-wp/`. A folder rename is invisible to visitors.
- Content links are **route paths** (`/tutorials/...`), not filesystem paths, so
  they survive the move unchanged. All 21 internal links are absolute routes and
  route through `NuxtLink`; nothing in `docs/content` contains `docs/`.
- `waymark-js/tests/docs/` is a **different, unrelated directory**. Never run a
  blanket `docs` → `help` rename.
- Developer documentation is internal: it must not be published by the site, and
  must stay out of the WordPress.org zip.
- The video pipeline keeps working throughout; no video is re-recorded for this.

## Affected areas

### Hard filesystem paths (must change)

| file:line                                                                      | what                                                                     |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| `.github/workflows/deploy-docs.yml:32,35,39,43,51`                             | cache path, three working dirs, artifact path                            |
| `.distignore:18`                                                               | excludes `docs` from the plugin zip — must exclude `help` **and** `docs` |
| `scripts/dist.sh:72`                                                           | forbidden-path regex contains `docs(/                                    | $)` |
| `scripts/video/validate.mjs:22-24`                                             | `docs/public`, `docs/content`, manifest                                  |
| `scripts/video/build.mjs:40,921`                                               | delivery dir and public dir                                              |
| `scripts/video/doctor.mjs:24-26`                                               | delivery, public, content dirs                                           |
| `scripts/video/audit.mjs:24`                                                   | delivery dir                                                             |
| `scripts/video/new.mjs:89`                                                     | scaffolded `output` path                                                 |
| `scripts/video/scenarios/changing-basemaps.json:4`, `using-collections.json:5` | `output` paths                                                           |
| `help/scripts/sync-waymark-assets.mjs:37`                                      | log string names `docs/public/assets`                                    |
| `docs/dist` (symlink)                                                          | absolute symlink to `docs/.output/public`; must be recreated or deleted  |

### Rebrand copy (user-visible)

| file:line                                           | current                                                     |
| --------------------------------------------------- | ----------------------------------------------------------- |
| `docs/nuxt.config.ts:24`                            | `title: "Documentation"`                                    |
| `docs/nuxt.config.ts:25`                            | `titleTemplate: "%s – Waymark"`                             |
| `docs/content/index.md:2`                           | frontmatter `title: Documentation` (rendered as the H1)     |
| `docs/app/components/AppHeader.vue:5`               | `aria-label="Documentation home"`                           |
| `inc/Admin/Waymark_Menu.php:27`                     | submenu label `Documentation`, menu label `Docs`            |
| `inc/Helpers/Waymark_Helper.php:27`                 | `Read the Docs »`                                           |
| `readme.md` / `readme.txt:36,104-118,163`           | `Demo & Docs`, `### Documentation`, “Nuxt 4 app in `docs/`” |
| `tests/phpunit/test-admin-branding.php:39-40,73-88` | asserts the URL and `Read the Docs »`                       |
| `tests/e2e/responsive-admin.spec.js:84`             | asserts `Read the Docs »`                                   |
| `languages/waymark.pot:84,88,1600`                  | generated; regenerate after the copy change                 |

### Prose references to update

- `AGENTS.md:7,11-13,47,60,63-64,85` — points at `docs/content`, `cd docs`.
- `scripts/video/README.md` — delivery paths, docs wiring and validator roots
  under `docs/`.
- `readme.md`/`readme.txt` development section.
- Pre-existing staleness worth fixing while here:
  `tests/fixtures/demo/README.md:68` (`docs/assets/img/` does not exist);
  `AGENTS.md:85` says `README.md` but the file is `readme.md`.

### Deliberately unchanged

- `waymark-js/tests/docs/` and its readme.
- `.opencode/plans/*` historical documents.
- Generated directories (`.nuxt`, `.output`, `.data`, `node_modules`) travel with
  the move but should be deleted and regenerated, not committed.
- `docs/public/js/index.html` (redirect to the Waymark JS page) moves with the app.

## Slices (ordered)

### 1. Move the app and fix every path

`git mv docs help`, delete the stale `docs/dist` symlink and the generated
`.nuxt`, `.output`, `.data`; move `docs/.gitignore` with the app. Update the
workflow, `.distignore`, `scripts/dist.sh`, the five video tooling constants, the
two scenario output paths, the sync-assets log string, and every prose path in
`AGENTS.md`, `scripts/video/README.md`, `readme.md`/`readme.txt`.
Introduce `scripts/video/lib/paths.mjs` exporting `PUBLIC_DIR`, `CONTENT_DIR` and
`DELIVERY_DIR` so the next move is one line instead of six.

**Verifies:** `cd help && npm ci && npm run sync-assets && NUXT_APP_BASE_URL=/waymark-wp/ npm run generate` succeeds and `help/.output/public/index.html` exists; `npm run video:validate` passes (8 manifest entries, 24 docs references); `npm run dist` produces a zip with no `help/` or `docs/`; `grep -rn '"docs", "public"\|docs/public\|docs/content' scripts/` returns nothing.

### 2. Rebrand the surface to Help

Change the site title, the H1 frontmatter, the header aria-label, the plugin
submenu and menu labels, the helper link text, and the readme prose. Update the
PHPUnit branding assertions and the Playwright assertion in the same change, then
regenerate `languages/waymark.pot` and `readme.md` with `npm run grunt`.

**Verifies:** `npm run test:php` and `npm run test:e2e` green; `npm run test:js`
green; the built site shows `Help` in the title and H1; the admin submenu reads
`Help`; no `Documentation` string remains in `inc/`, `readme.txt` or the site
shell (`docs/content` body prose may still say “documentation” where it means the
concept).

### 3. Stand up the new `docs/` with the docs skill

Create `docs/README.md` plus numbered pages with `git_hash`/`modified`
frontmatter: `1.start.md`, `2.architecture.md`, `3.video-pipeline.md`,
`4.testing.md`, `5.build-and-release.md`. Distil `scripts/video/README.md` into
`3.video-pipeline.md` (adjusting its internal paths). The README stays the
operational runbook and is linked, not copied.

**Verifies:** every `docs/*.md` has valid frontmatter; every internal link
resolves; `docs/README.md` indexes every page; `grep` shows no duplicated
pipeline reference tables between `docs/3.video-pipeline.md` and
`scripts/video/README.md`.

### 4. Guardrails and sweep

Add a short "documentation map" section to `AGENTS.md` (help site vs developer
docs vs runbook) and correct the two stale references. Add path filters to the
deploy workflow so non-site pushes stop rebuilding it (`help/**`,
`waymark-js/dist/**`, `assets/css/front.min.css`, `package.json`), keeping
`workflow_dispatch`.

**Verifies:** `npm test` green; `npm run video:validate` green;
`grep -rn "docs/public\|docs/content\|docs/app" --exclude-dir=.opencode` returns
only the new `docs/` developer pages where they describe history; a CI run on a
plugin-only change skips the site build.

## Open questions

1. **How far should the rebrand go?** The site title/H1/aria-label clearly become
   Help. The open part is the plugin surface: submenu `Documentation` → `Help`,
   and `Read the Docs »` → something else. Options: rebrand all of it; rebrand the
   menu label but keep the familiar “Read the Docs” link; or rebrand only the
   site and leave plugin copy alone.
2. **Distil `scripts/video/README.md` into `docs/3.video-pipeline.md` as part of
   this work**, or leave the README as the single source until later? Absorbing
   it now is cleaner; deferring avoids churn while the pipeline is still being
   edited.
3. **Add the deploy path filter now?** It is a small, separate win (stops every
   push rebuilding the site) but touches CI in the same change as the move.

## Risks

- `.distignore` and `dist.sh` are the two places where a missed entry ships the
  entire 590 MB app inside the WordPress plugin zip.
- The deploy workflow has **no path trigger**: if a slice lands with `docs/`
  partially moved, every subsequent push fails the Pages build. Land slice 1
  atomically.
- `docs/dist` is an absolute symlink; a plain `mv` leaves it pointing at the old
  path.
- Generated caches inside `.nuxt`/`.output` hold absolute paths; regenerate after
  the move rather than trusting them.
- Rebranding PHP strings requires regenerating `languages/waymark.pot` and
  updating two test suites in the same commit, or CI fails on assertions that
  still expect `Read the Docs »`.
