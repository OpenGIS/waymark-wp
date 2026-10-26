=== Waymark ===
Contributors: morehawes
Tags: GIS, Map maker, GPX, Track, Elevation
Requires at least: 6.4
Tested up to: 7.1
Requires PHP: 8.3
Stable tag: 1.7.2
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html
Donate link: https://github.com/sponsors/OpenGIS

Create beautiful, interactive Maps with Waymark.

== Description ==

![The Waymark Map Editor displaying a route on a map](https://ps.w.org/waymark/assets/editor-demo.jpg)

- **Overlays** - Create Markers, Lines and Shapes with a:
  - Title
  - Image (Media Library or link to external image)
  - Description (Rich text editor, HTML supported)
  - Type (defined in Settings)
- **Import**
  - GPX
  - KML
  - GeoJSON
  - EXIF (Image location metadata)
  - Elevation data (adds an interactive profile chart for Lines with elevation data)
- **Meta** - Add extra information to your Maps; these are customisable form inputs that allow you to add additional content to your Maps.
- **Types** - Set options to visually distinguish between Overlays (colours/icons etc.), then select it when using the Editor.
- **Collections** - Group Maps together and display multiple Maps at once. Create complex Collection hierarchies to suit your needs and associate Maps with multiple Collections.
- **Submissions** - Allow registered users, or guests to create Maps from the front-end of your site. You can control who can Submit Maps, what editor features are available and whether submissions should be approved before they are published.

🌟 [GitHub](https://github.com/opengis/waymark-wp)
👐 [WordPress](https://wordpress.org/plugins/waymark/)
📖 [Demo & Docs](https://www.ogis.org/waymark-wp/)

### Displaying Maps

Embed your Maps using the `[Waymark]` Shortcode, or link to the Map Details page.

- **Shortcodes**
  - Display a single Map, or a Collection of Maps anywhere that Shortcodes are supported.
  - An optional Shortcode Header displays the Map/Collection title, a link to the Map Details page and any Meta.
  - Display a Marker defined through the Shortcode.
  - Display a Basemap only, without any Overlays by providing centre and zoom parameters.
- **Basemaps** - Uses [OpenStreetMap](https://www.openstreetmap.org/fixthemap) by default, with support for multiple raster tiled/"slippy" Basemaps. You can switch Basemaps using the Overlay Filter.
- **Overlay Filter** - Allow the user to filter which Overlays are currently visible on the Map.
- **Export**
  - (Optionally) Let anyone Export Maps into GPX, KML and GeoJSON formats through the Shortcode Header or on the Map Details page.
  - Works on mobile devices.

### Customising

Built to be flexible, Waymark has lots of [Settings](https://www.ogis.org/waymark-wp/customising/settings/) and Types provide one place to control how Overlays (Markers/Lines/Shapes) are displayed.

Marker Icons can be provided as:
  - Font Icons ([Ionic Icons v2](https://ionic.io/ionicons/v2/cheatsheet.html)/[Font Awesome v4](https://fontawesome.com/v4.7.0/cheatsheet/))
  - Simple Text, or [Emojis](https://emojifinder.com/) (i.e. 🏕️, 🚩, 📸).
  - Custom HTML (good ol' `<img src="https://example.com/icon.svg">`, or a more complex structure). So you can pretty much create any kind of Icon you want.

For developers:

- Most elements can be [styled using CSS](https://www.ogis.org/waymark-wp/customising/styling-with-css-selectors/) and have sensibly named `waymark-` classes.
- WordPress integration:
  - Maps are stored using the custom post type `waymark_map`.
  - Collections use the `waymark_collection` Taxonomy.
  - Embed Maps using the `[Waymark]` [Shortcode](https://www.ogis.org/waymark-wp/) anywhere they are supported, or dynamically using the `do_shortcode(["Waymark"])` [function](https://developer.wordpress.org/reference/functions/do_shortcode/).
- Geographical data is stored in [GeoJSON](https://geojson.org/) format. Types are specified using the `type` Property, i.e. `{feature: { geometry: { type: 'Point', coordinates: [0, 0] } }, properties: { type: 'Alert', title: 'Bridge Removed!' }`.
- Specify which GeoJSON feature properties to store when importing (Settings > Overlays > Properties). These can be automatically appended to the Overlay Description, or accessed programatically via the `layer.feature.properties` Object.
- Maps are displayed using the [Leaflet](https://leafletjs.com/) JavaScript library, which is bundled with Waymark and can be extended using the `waymark_loaded_callback` [callback function](https://www.ogis.org/waymark-wp/advanced/using-the-global-callback-function/).

### User Examples

- [Association Franc-Comtoise du Chemin de Compostelle – eGuide](https://www.af-ccc.fr/eguide/)
- [Cres & Lošinj Trail – Lošinj Trail 2025](https://clt.remarkable.events/losinj-trail-en/)
- [hikingTICINO](https://www.hikingticino.com/wanderungen/category-wanderung/)
- [Horizontes – PT281](https://horizontes.pt/pt281/)
- [Il Cammino del Lago Maggiore – Le 11 tappe](https://www.camminolagomaggiore.it/11-tappe-cammino-lago-maggiore/)
- [Merritt Mountain Bike Association – Iron Mountain](https://merrittbike.ca/our-trails/iron-mountain/)
- [Trekkaholic – Trekking al lago Bianco in Alpe Veglia](https://www.trekkaholic.it/piemonte/trekking-lago-bianco-alpe-veglia/)
- [Via Apsyrtides](https://viaapsyrtides.hr/stage-1/)
- [Zadar Archipelago – Interactive Map](https://zadar-archipelago.hr/interactive-map/)
- [Zagorje Outdoor – Konjička staza broj 10](https://zagorjeoutdoor.hr/sl/ride_staza/konjicka-staza-broj-10/)

### Development

**Note:** Docker, Node.js and NPM required.

~~~bash
# Clone the repository
git clone https://github.com/opengis/waymark-wp.git

# Navigate to the Waymark directory
cd waymark-wp

# Install the dependencies (or pnpm/yarn install)
npm install

# Start WordPress at http://localhost:8888 and rebuild assets on change
npm run dev
~~~

### Documentation

The documentation site is a Nuxt 4 app in `docs/`, built with `@nuxt/content`. Node 24.15 or newer is required.

~~~bash
cd docs
npm ci
npm run sync-assets
npm run dev
~~~

The local preview runs at http://localhost:11003. To build the static site for GitHub Pages:

~~~bash
NUXT_APP_BASE_URL=/waymark-wp/ npm run generate
~~~

### Assets

Styles and scripts are compiled from Less and JavaScript sources into the minified bundles enqueued by the plugin — edit the sources, not the build output:

- `assets/` — the plugin CSS (compiled from `assets/less/`) and JavaScript, served as the `front` and `admin` bundles.
- `waymark-js/` — the bundled [Waymark JS](https://www.ogis.org/waymark-js/) library powering the Viewer and Editor: sources in `src/` and `libs/`, built into `dist/`.

### Testing

Three suites cover the plugin — JavaScript unit tests (Vitest), PHP integration tests (PHPUnit) and browser end-to-end tests (Playwright). The PHP and browser suites run against the disposable wp-env tests instance at **http://localhost:8889**; the development instance is never touched. The wp-env environment (`npm run dev`) must be running first.

~~~bash
# JavaScript unit tests (Vitest, jsdom) — Viewer, Editor and description sanitisation
npm run test:js

# PHP integration tests (PHPUnit against the WordPress test library)
npm run test:php

# Browser end-to-end tests (Playwright/Chromium) — login, Maps, Markers, responsive admin layout, front-end
npm run test:e2e

# Run all three in sequence
npm test

# One-off: prepare the tests container (after a fresh "wp-env destroy")
npm run test:php:setup
~~~

All three suites also run automatically in CI on pull requests and pushes to `master`.

wp-env pins PHP 8.3 to match the plugin's declared floor. `WP_ENV_PHP_VERSION` and `WP_ENV_CORE` override the PHP and WordPress versions — useful for testing a release candidate or a newer PHP:

~~~bash
WP_ENV_PHP_VERSION=8.5 WP_ENV_CORE=WordPress/WordPress#trunk npm run test:php
~~~

`npm run test:php:lint` checks PHP syntax at the floor. CI exercises both boundaries — WordPress 6.4 with PHP 8.3, and current WordPress with PHP 8.5 — while the browser suite runs on current WordPress only.

== Frequently Asked Questions ==

= Can I Get More Help? =

Yes, please view the <a href="https://www.ogis.org/waymark-wp/">Documentation</a>.

= How Can I Contribute? =

* Please help **[Translate the plugin](https://translate.wordpress.org/projects/wp-plugins/waymark/)**
* Or [Add a Review (in your language)](https://wordpress.org/support/plugin/waymark/reviews/#new-post).

If you have anything bad to say, please <a href="https://wordpress.org/support/plugin/waymark/#new-topic-0">create an issue</a> before leaving a review, this is how the plugin gets better!

= Does Waymark Support Google Maps? =

Yes! While the Google Maps API is not used, <a href="https://gist.github.com/morehawes/f2982753074599363ca3a9f8582cd572">Google Basemaps can be added to Waymark</a> as raster tiles.  

= Can I Translate the Plugin? =

Please! Waymark is localization ready, <a href="https://translate.wordpress.org/projects/wp-plugins/waymark/">translation contributions</a> are greatly appreciated.

== Screenshots ==

1. Add Overlays (Markers, Lines and Shapes) to create detailed interactive Maps. You can import/export from GPX/KML/GeoJSON.
2. Every Overlay can be given a title, image and description. Marker images can be displayed as a gallery.
3. Waymark features a clean, intuitive Editor for creating and editing your Maps. Overlays are customisable using Types, which allow you set styles once (colours/icons etc.), so you can simply select it when you are adding to the Map. 
4. If you have more than one Basemap, you can switch between them when viewing the Map. Overlays can be shown/hidden by Type.
5. Use Meta to provide extra information about your Maps. Meta inputs are customisable and can be grouped. 
6. The Map Details page displays an image gallery, elevation profile, export options, featured image and all Meta provided for the Map.
7. Add Maps to your content using the Waymark Shortcode. You can choose which Meta is displayed.
8. Organise Maps with Collections and display multiple Maps at once using the Shortcode. Collections can be nested and Maps can be associated with multiple Collections.
9. Basemaps — Add, reorder and configure raster basemaps.
10. Shortcodes — Control the Shortcode header and admin preview.
11. Elevation — Configure the elevation profile, units, colours and initial visibility.
12. Meta — Create custom Meta inputs and organise them into groups.
13. Sleep — Set the scroll-zoom wake delay and message.
14. Clustering — Group nearby Markers and tune the cluster threshold and radius.
15. Misc. — Configure map height, zoom, gallery, filter and export behaviour.
16. Markers — Define Marker Types: label, shape, size, colour, icon and visibility.
17. Lines — Define Line Types: colour, weight, opacity and visibility.
18. Shapes — Define Shape Types: colour, fill opacity and visibility.
19. Properties — Choose which GeoJSON feature properties are imported and shown.
20. Submissions — Control front-end submissions by role and for guests.
21. Advanced — Configure editor, collection, permalink, post type and debug options.

== Changelog ==

= 1.7.2 =
* Fix "Array to string conversion" warnings when repeatable Settings values are incomplete.
* Fix Settings rows losing a value when a repeatable column has fewer entries than the other columns.

= 1.7.1 =
* Documentation: record the 1.7.0 changes in this changelog.

= 1.7.0 =
* Security: Waymark now requires PHP 8.3 and WordPress 6.4.
* Fix fatal errors when attachment metadata, GeoJSON or Collection data is malformed.
* Fix PHP 8.1+ deprecation notices when optional values are empty or missing.
* Development: test against the PHP 8.3 / WordPress 6.4 floor as well as current releases.

[View changes on GitHub &raquo;](https://github.com/OpenGIS/waymark-wp/commits/master/)

== Upgrade Notice ==

= 1.7.1 =
Waymark now requires PHP 8.3 and WordPress 6.4, introduced in the 1.7.0 security release. Sites running older versions will remain on the previous release and will not receive further updates, including security fixes. Update PHP and WordPress before upgrading.

= 1.7.0 =
This is a security release. Waymark now requires PHP 8.3 and WordPress 6.4. Sites running older versions will remain on the previous release and will not receive further updates, including security fixes. Update PHP and WordPress before upgrading.