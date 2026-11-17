### Testing

`tests/docs/` covers the library's documented API chapters, one test file per chapter; the remaining suites are behaviour regressions. Run them from the repository root (`vitest.config.mjs` configures Vitest with the jsdom environment):

```bash
npm run test:js
```

```
tests/
├── setup.js                     # Global test setup (loads globals like $, L)
├── docs/
│   ├── 1.index.test.js
│   ├── 2.map.test.js
│   ├── 3.viewer.test.js
│   ├── 4.editor.test.js
│   └── 5.customise.test.js
├── console-regressions.test.js  # Editor console regressions
├── editor-i18n.test.js          # Per-type editor strings
├── i18n-escaping.test.js        # Escaped translated output
├── locale-formatting.test.js    # Locale-aware number formatting
├── map-view-defaults.test.js    # Default Map view fallbacks (issue #86)
├── stable-type-keys.test.js     # Stable overlay type keys
└── xss.test.js                  # Popup sanitisation regressions
```

## Handling Legacy Code (Non-Module)

Since the source code (`src/js/*.js`) uses global function declarations and is not modular (ESM), we cannot simply `import` the files.
**Strategy**:

1. In `tests/setup.js`, we will use `fs` to read the source files.
2. We will execute the file contents in the global scope (using `window.eval` or similar) to register `Waymark_Map`, `Waymark_Map_Viewer`, etc., on the `window` object, mimicking the browser behavior.
3. jQuery and Leaflet will be attached to `window` before loading the source code.

## Test-Documentation Synchronization

The chapter numbering keeps the tests aligned with the library's documented API:

1. **Naming Convention**: Each `tests/docs/` file corresponds to one documented API chapter.
2. **Section Mapping**: `describe` blocks in tests match the section headings within their chapter.
   - Example: the Map Options section maps to `describe('Map Options', ...)` in `2.map.test.js`.
3. **Concept Verification**: Tests implement the documented code examples and assert the expected outcome.

> [!NOTE]
> The suites outside `tests/docs/` are exceptions to the 1:1 mirroring. They are
> behaviour regressions, not chapter documentation:
>
> - `xss.test.js` covers the popup sanitisation helpers (`sanitize_description`,
>   `escape_html`, `is_safe_url`).
> - `editor-i18n.test.js`, `i18n-escaping.test.js` and
>   `locale-formatting.test.js` cover per-type editor strings, escaping of
>   translated output and locale-aware number formatting.
> - `stable-type-keys.test.js` covers stable overlay type keys.
> - `map-view-defaults.test.js` covers the default Map view fallbacks: a viewer
>   with no initial centre or zoom must load before fitting data, fall back to
>   the configured defaults or a world view, and keep a numeric zoom.
> - `console-regressions.test.js` covers editor console regressions:
>   deprecated jQuery shorthands, selection via `.prop`, copied data defaults and
>   the circle-only `getRadius` path.

## Example Test Structure (`tests/docs/2.map.test.js`)

```javascript
import { describe, it, expect, beforeEach } from 'vitest';

describe('2. Map Configuration', () => {
  let waymark;

  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = '<div id="waymark-map"></div>';
  });

  describe('Basic Initialization', () => {
    it('should initialize the map with default options', () => {
      // Corresponds to basic usage example in docs
      waymark = new Waymark_Map();
      waymark.init({
        map_div_id: 'waymark-map'
      });

      expect(document.querySelector('.leaflet-container')).toBeTruthy();
    });
  });

  describe('Loading Data', () => {
    it('should load GeoJSON data', () => {
      waymark = new Waymark_Map();
      waymark.init();

      const geojson = { ... }; // Example data from docs
      waymark.load_json(geojson);

      // Assertions to verify data is on map
    });
  });
});
```
