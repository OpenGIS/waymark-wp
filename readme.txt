=== Waymark  ===
Contributors: morehawes
Tags: GIS, Map maker, GPX, Track, Elevation
Requires at least: 4.6
Tested up to: 7.1
Requires PHP: 5.2
Stable tag: 1.6.3
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html
Donate link: https://github.com/sponsors/OpenGIS

Waymark adds powerful mapping features to WordPress that are easy to use. Create beautiful, interactive Maps customised to suit your needs.

== Description ==

❤️ [Keep This Project Alive Through Sponsorship](https://github.com/sponsors/OpenGIS) ❤️

### Creating Maps

Use the intuitive Editor to create Maps with one, or thousands of interactive Overlays.

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

🌟 [GitHub](https://github.com/opengis/waymark)
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
- Maps are displayed using the [Leaflet](https://leafletjs.com/) JavaScript library, which is bundled with Waymark and can be extended using the `waymark_loaded_callback` [callback function](https://www.ogis.org/waymark-wp/advanced/using-the-global-callback-function/.

Be sure to check out [Map First](https://github.com/opengis/map-first), a minimal WordPress theme with an *obsession* for Maps (it's open-source too and contains lots of comments about customisations).

**Waymark is free, open-source ([GPL v2](https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html)) and a labour of Love**. I try to keep the plugin well supported, so please feel free to <a href="https://wordpress.org/support/plugin/waymark/#new-topic-0">reach out</a> with any issues, questions or feedback.

### Development

> [!NOTE]
> To develop locally you will need to have both Node.js and NPM [installed](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).

[Grunt](https://gruntjs.com/) is used to run the build script, which compiles the JavaScript and CSS and performs some other tasks.

`
# Clone the repository (and the Waymark JS submodule)
git clone --recurse-submodules https://github.com/opengis/waymark.git

# Navigate to the Waymark directory
cd waymark

# Install the dependencies (or pnpm/yarn install)
npm install

# Run the build script
grunt
`

The build script will watch for changes to the JavaScript and CSS files.

Pull requests are welcome!

> [!IMPORTANT]
> [Waymark JS](https://www.ogis.org/waymark-js/) is responsible for the Viewer and Editor and is included as a Git submodule (`/waymark-js` directory). View on [GitHub](https://github.com/OpenGIS/Waymark-JS/).

### Dev Server

A local WordPress environment is provided via [wp-env](https://www.npmjs.com/package/@wordpress/env). [Docker](https://www.docker.com/) must be running.

`
npm run dev
`

This starts WordPress at **http://localhost:8888** and prints the credentials summary:

`
────────────────────────────────────
 MySQL  127.0.0.1  root / password
 Admin  http://localhost:8888/wp-admin  admin / password
────────────────────────────────────
`

== Installation ==

[vimeo https://vimeo.com/349575095]

With Waymark enabled, click on the "Maps" link in the sidebar to create and edit Maps. Once you are happy with your Map, copy the Waymark shortcode and add it to your content.

<a href="https://www.ogis.org/waymark-wp/">Read the Docs &raquo;</a>

== Frequently Asked Questions ==

= Is This Free? =

*Yes!*, however if you (or your organisation) benefit from Waymark, please consider supporting the continued development of the plugin through [sponsorship](https://github.com/sponsors/OpenGIS) 🙂

= Is There a Demo? =

Yes, <a href="https://www.ogis.org/waymark-wp/">here</a>.

= Can I Get More Help? =

Yes, please view the <a href="https://www.ogis.org/waymark-wp/">Documentation</a>. If you still need help, feel free to [reach out](https://wordpress.org/support/plugin/waymark/#new-topic-0).

= How Can I Contribute? =

**If you find value in Waymark please consider supporting it's continued development through [sponsorship](https://github.com/sponsors/OpenGIS). Any amount is appreciated.**

You could also:

* **[Translate the plugin](https://translate.wordpress.org/projects/wp-plugins/waymark/)** If you like the plugin and speak multiple languages, *please* consider becoming a [Translation Editor (PTE)](https://make.wordpress.org/polyglots/handbook/about/roles-and-capabilities/#project-translation-editor) for the plugin.
* **Star**, create an Issue or Fork the project on [GitHub](https://github.com/opengis/waymark/).
* [Add a Review](https://wordpress.org/support/plugin/waymark/reviews/#new-post).
* [Report bugs or suggest new features](https://wordpress.org/support/plugin/waymark/#new-topic-0).

If you have anything bad to say, please <a href="https://wordpress.org/support/plugin/waymark/#new-topic-0">create an issue</a> before leaving a review, this is how the plugin gets better!

= Does Waymark Support Google Maps? =

Yes! While the Google Maps API is not used, <a href="https://gist.github.com/morehawes/f2982753074599363ca3a9f8582cd572">Google Basemaps can be added to Waymark</a> as raster tiles.  

= Can I Translate the Plugin? =

Please! Waymark is localization ready, <a href="https://translate.wordpress.org/projects/wp-plugins/waymark/">translation contributions</a> are greatly appreciated.

= Acknowledgements? =

Waymark relies on input from it's users, thank you to everyone for providing feedback :)

Built on the shoulders of giants, thank you Open-Source!

== Screenshots ==

1. Add Overlays (Markers, Lines and Shapes) to create detailed interactive Maps. You can import/export from GPX/KML/GeoJSON.
2. Every Overlay can be given a title, image and description. Marker images can be displayed as a gallery.
3. Waymark features a clean, intuitive Editor for creating and editing your Maps. Overlays are customisable using Types, which allow you set styles once (colours/icons etc.), so you can simply select it when you are adding to the Map. 
4. If you have more than one Basemap, you can switch between them when viewing the Map. Overlays can be shown/hidden by Type.
5. Use Meta to provide extra information about your Maps. Meta inputs are customisable and can be grouped. 
6. The Map Details page displays an image gallery, elevation profile, export options, featured image and all Meta provided for the Map.
7. Add Maps to your content using the Waymark Shortcode. You can choose which Meta is displayed.
8. Organise Maps with Collections and display multiple Maps at once using the Shortcode. Collections can be nested and Maps can be associated with multiple Collections.
9. Waymark was designed to be very flexible, with lots of Settings to choose from.
10. Documentation and Help is available from the <a href="https://www.ogis.org/waymark-wp/">Waymark</a> website.

== Changelog ==

[View on GitHub](https://github.com/OpenGIS/waymark-wp/).