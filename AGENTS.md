# Working notes

Pointers for anyone — human or automated — changing this repository.

## Read the documentation first

The user-facing documentation lives in `docs/content/**/*.md`. It describes how
the plugin is meant to behave, and it is usually the fastest way to understand a
feature before touching its code.

- `docs/content/` — documentation source (Nuxt Content, Markdown)
- `docs/app/` — the documentation site itself
- `docs/public/` — static assets, including the screencasts in `assets/video/`
- `scripts/video/README.md` — how the screencasts are produced

If code and documentation disagree, treat that as a defect in one of them and
fix both.

## Branding

Waymark is an Open GIS project, and all design decisions follow the Open GIS
brand guidelines: <https://www.ogis.org/branding/>.

- Write the organisation as **Open GIS** — two words, both capitalised. Never
  `OpenGIS`, `opengis` or `OPEN GIS` in prose.
- Accent colour: **`#0dd70d`**. Dark brand surface: **`#000b00`**.
- Brand typeface is a monospace stack; see `scripts/video/lib/card.mjs` for the
  exact stack used on video cards.
- The logo is vendored at `assets/img/ogis-logo-white.svg`. Use that file; do
  not redraw the mark or add a second copy.
- Screencast highlights, click rings and card accents use the accent colour so
  the videos, documentation and product look like one family.

When a new surface needs a colour, take it from the brand tokens rather than
inventing one.

## Project shape

A WordPress plugin.

- `Waymark.php` — plugin bootstrap and header (the version lives here)
- `inc/` — PHP: admin screens, front-end rendering, objects, helpers
- `assets/` — LESS sources and their compiled CSS/JS (`assets/less` → `assets/css`)
- `waymark-js/` — the map library, built into `waymark-js/dist`
- `languages/` — translation template
- `tests/` — PHPUnit, Vitest and Playwright suites
- `docs/` — the documentation site

Compiled files are committed. Edit the sources and rebuild; never hand-edit
`*.min.*`, `waymark-js/dist` or the generated translation template.

## Development

```sh
npm run dev      # wp-env on 8888 + grunt watch
npm run grunt    # rebuild CSS, JS bundles and the translation template
npm test         # Vitest, PHPUnit and Playwright
```

The documentation site is separate:

```sh
cd docs && npm run dev     # http://localhost:11003
cd docs && npm run generate
```

## Conventions

- British English in documentation, comments and interface copy.
- Match the surrounding code. This plugin uses WordPress conventions, not a
  framework layer cake: no service, action or repository abstractions unless one
  already exists in the area you are editing.
- Prefer the platform. Add a dependency only when it clearly earns its place.
- JavaScript over TypeScript; plain CSS or LESS rather than a utility framework.
- Keep user-visible strings translatable and inside the existing text domain.
- Settings and post data are sanitised on save and escaped on output.

## Before declaring work done

- Run the suites that cover what you changed. `npm test` runs all three.
- Rebuild generated assets with `npm run grunt` if you touched LESS, JS sources
  or translatable strings.
- If admin/Settings UI shown in the WordPress.org readme screenshots changes,
  run `npm run screenshots` and include the updated `.wordpress-org/` assets and
  `readme.md`.
- For screencast work, follow the runbook in `scripts/video/README.md` and run
  `npm run video:validate`.
- Update `README.md` and `docs/` when behaviour changes.

## Git

- Work on a branch; keep commits focused and their messages in the imperative.
- Do not commit secrets. `.env` files are ignored; `.env.example` documents the
  variables that exist.
