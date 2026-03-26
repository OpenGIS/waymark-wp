# Waymark  #
**Contributors:** [morehawes](https://profiles.wordpress.org/morehawes/)  
**Tags:** GIS, Map maker, GPX, Track, Elevation  
**Requires at least:** 4.6  
**Tested up to:** 6.8  
**Requires PHP:** 5.2  
**Stable tag:** 1.5.11  
**License:** GPLv2 or later  
**License URI:** http://www.gnu.org/licenses/gpl-2.0.html  
**Donate link:** https://github.com/sponsors/OpenGIS  

Waymark adds powerful mapping features to WordPress that are easy to use. Create beautiful, interactive Maps customised to suit your needs.

## Description ##

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


	# Clone the repository (and the Waymark JS submodule)
	git clone --recurse-submodules https://github.com/opengis/waymark.git
	
	# Navigate to the Waymark directory
	cd waymark
	
	# Install the dependencies (or pnpm/yarn install)
	npm install
	
	# Run the build script
	grunt


The build script will watch for changes to the JavaScript and CSS files.

Pull requests are welcome!

> [!IMPORTANT]
> [Waymark JS](https://www.ogis.org/waymark-js/) is responsible for the Viewer and Editor and is included as a Git submodule (`/waymark-js` directory). View on [GitHub](https://github.com/OpenGIS/Waymark-JS/).

## Installation ##

With Waymark enabled, click on the "Maps" link in the sidebar to create and edit Maps. Once you are happy with your Map, copy the Waymark shortcode and add it to your content.

<a href="https://www.ogis.org/waymark-wp/">Read the Docs &raquo;</a>

## Frequently Asked Questions ##

### Is This Free? ###

*Yes!*, however if you (or your organisation) benefit from Waymark, please consider supporting the continued development of the plugin through [sponsorship](https://github.com/sponsors/OpenGIS) 🙂

### Is There a Demo? ###

Yes, <a href="https://www.ogis.org/waymark-wp/">here</a>.

### Can I Get More Help? ###

Yes, please view the <a href="https://www.ogis.org/waymark-wp/">Documentation</a>. If you still need help, feel free to [reach out](https://wordpress.org/support/plugin/waymark/#new-topic-0).

### How Can I Contribute? ###

**If you find value in Waymark please consider supporting it's continued development through [sponsorship](https://github.com/sponsors/OpenGIS). Any amount is appreciated.**

You could also:

* **[Translate the plugin](https://translate.wordpress.org/projects/wp-plugins/waymark/)** If you like the plugin and speak multiple languages, *please* consider becoming a [Translation Editor (PTE)](https://make.wordpress.org/polyglots/handbook/about/roles-and-capabilities/#project-translation-editor) for the plugin.
* **Star**, create an Issue or Fork the project on [GitHub](https://github.com/opengis/waymark/).
* [Add a Review](https://wordpress.org/support/plugin/waymark/reviews/#new-post).
* [Report bugs or suggest new features](https://wordpress.org/support/plugin/waymark/#new-topic-0).

If you have anything bad to say, please <a href="https://wordpress.org/support/plugin/waymark/#new-topic-0">create an issue</a> before leaving a review, this is how the plugin gets better!

### Does Waymark Support Google Maps? ###

Yes! While the Google Maps API is not used, <a href="https://gist.github.com/morehawes/f2982753074599363ca3a9f8582cd572">Google Basemaps can be added to Waymark</a> as raster tiles.  

### Can I Translate the Plugin? ###

Please! Waymark is localization ready, <a href="https://translate.wordpress.org/projects/wp-plugins/waymark/">translation contributions</a> are greatly appreciated.

### Acknowledgements? ###

Waymark relies on input from it's users, thank you to everyone for providing feedback :)

Built on the shoulders of giants, thank you Open-Source!

## Screenshots ##

### 1. Add Overlays (Markers, Lines and Shapes) to create detailed interactive Maps. You can import/export from GPX/KML/GeoJSON. ###
![Add Overlays (Markers, Lines and Shapes) to create detailed interactive Maps. You can import/export from GPX/KML/GeoJSON.](https://ps.w.org/waymark/assets/screenshot-1.jpg)

### 2. Every Overlay can be given a title, image and description. Marker images can be displayed as a gallery. ###
![Every Overlay can be given a title, image and description. Marker images can be displayed as a gallery.](https://ps.w.org/waymark/assets/screenshot-2.jpg)

### 3. Waymark features a clean, intuitive Editor for creating and editing your Maps. Overlays are customisable using Types, which allow you set styles once (colours/icons etc.), so you can simply select it when you are adding to the Map.  ###
![Waymark features a clean, intuitive Editor for creating and editing your Maps. Overlays are customisable using Types, which allow you set styles once (colours/icons etc.), so you can simply select it when you are adding to the Map. ](https://ps.w.org/waymark/assets/screenshot-3.jpg)

### 4. If you have more than one Basemap, you can switch between them when viewing the Map. Overlays can be shown/hidden by Type. ###
![If you have more than one Basemap, you can switch between them when viewing the Map. Overlays can be shown/hidden by Type.](https://ps.w.org/waymark/assets/screenshot-4.jpg)

### 5. Use Meta to provide extra information about your Maps. Meta inputs are customisable and can be grouped.  ###
![Use Meta to provide extra information about your Maps. Meta inputs are customisable and can be grouped. ](https://ps.w.org/waymark/assets/screenshot-5.jpg)

### 6. The Map Details page displays an image gallery, elevation profile, export options, featured image and all Meta provided for the Map. ###
![The Map Details page displays an image gallery, elevation profile, export options, featured image and all Meta provided for the Map.](https://ps.w.org/waymark/assets/screenshot-6.jpg)

### 7. Add Maps to your content using the Waymark Shortcode. You can choose which Meta is displayed. ###
![Add Maps to your content using the Waymark Shortcode. You can choose which Meta is displayed.](https://ps.w.org/waymark/assets/screenshot-7.jpg)

### 8. Organise Maps with Collections and display multiple Maps at once using the Shortcode. Collections can be nested and Maps can be associated with multiple Collections. ###
![Organise Maps with Collections and display multiple Maps at once using the Shortcode. Collections can be nested and Maps can be associated with multiple Collections.](https://ps.w.org/waymark/assets/screenshot-8.jpg)

### 9. Waymark was designed to be very flexible, with lots of Settings to choose from. ###
![Waymark was designed to be very flexible, with lots of Settings to choose from.](https://ps.w.org/waymark/assets/screenshot-9.jpg)

### 10. Documentation and Help is available from the <a href="https://www.ogis.org/waymark-wp/">Waymark</a> website. ###
![Documentation and Help is available from the <a href="https://www.ogis.org/waymark-wp/">Waymark</a> website.](https://ps.w.org/waymark/assets/screenshot-10.jpg)


## Changelog ##

### 1.5.12 ###

Deploy to wordpress.org plugin directory via GitHub Actions

### 1.5.11 ###

Updated Waymark Website URLs.

### 1.5.10 ###

Migrated [Documentation](https://www.ogis.org/waymark-wp/) to GitHub Pages.

### 1.5.9 ###

* Minor improvements and bug fixes.

### 1.5.8 ###

* Minor improvements.

### 1.5.7 ###

* Minor improvements and bug fixes.

### 1.5.6 ###

* Improve Leaflet Elevation compatibility with other instances of Leaflet

### 1.5.5 ###

* Bug fix

### 1.5.4 ###

* Removed Shortcode callback feature

### 1.5.3 ###

* Removed Shortcode Files feature. [Details](https://wordpress.org/support/topic/showing-maps-via-file_url-no-longer-works/).

### 1.5.2 ###

- Fixed a bug where Map data was being lost when editing a Map. Thanks to [hogg66](https://wordpress.org/support/users/hogg66/) for [reporting this](https://wordpress.org/support/topic/map-reverts-to-empty-default-when-i-add-a-new-marker/).

### 1.5.1 ###

- Improved escaping of Shortcode attributes.

### 1.5.0 ###

- **Security update** This is a big update which includes a number of security fixes, many highlighted by the [Plugin Check](https://wordpress.org/plugins/plugin-check/) plugin.
- Fixed a vulnerability where Shortcode attributes were not being escaped. Thanks to Muhammad Yudha for reporting this via Patchstack.
- Added `waymark_pre_update_post_meta` filter. This filter is called before the `update_post_meta` function is called, allowing you to modify the meta data before it is saved. It receives two parameters - `$param_value` and `$param_definition`. Thanks to [DrogoNevets](https://github.com/DrogoNevets) for the [PR](https://github.com/OpenGIS/Waymark/issues/58).
- Submission button bug fix. Thanks to [DrogoNevets](https://github.com/DrogoNevets) for this.

### 1.4.3 ###

- Add missing MultiPolygon support. Raised [here](https://wordpress.org/support/topic/large-kml-display-issue/) and [here](https://github.com/OpenGIS/Waymark/issues/55).
- [Taxonomy label fix](https://github.com/OpenGIS/Waymark/issues/47).
- [Added Name to GPX metadata on Export](https://github.com/OpenGIS/Waymark/issues/48).

### 1.4.2 ###

Fixed a vulnerability where content output to the browser was not being escaped. Thanks to vgo0 for reporting this via Wordfence.

### 1.4.1 ###

- Sleep message fix, thanks to [jiem31](https://wordpress.org/support/users/jiem31/) for [reporting this](https://wordpress.org/support/topic/a-few-ways-for-improvement/).

### 1.4.0 ###

- Added the ability to show/hide all Types initially when using the Shortcode by specifying "*" as the Type key. For example, to initially hide all Marker Types, except "photo" and "alert", use `[Waymark map_id="1234" hide_marker="*" show_marker="photo,alert"]`. Thanks to [Association Franc-Comtoise du Chemin de Compostelle](https://www.af-ccc.fr) for requesting this.
- Improved debugging output.

### 1.3.2 ###

Collection background loading bug fix. Thanks to [zerider](https://wordpress.org/support/users/zerider/) for [reporting this](https://wordpress.org/support/topic/collection-map/).

### 1.3.0 ###

- **Overlay Properties** - Read GeoJSON feature properties when importing (Settings > Overlays > Properties). If Waymark finds data for the specified property keys they will stored upon import. These can be automatically appended to the Overlay Description, or accessed programatically via the `layer.feature.properties` Object. Thanks to [dariospace](https://github.com/dariospace) for the [requesting](https://github.com/OpenGIS/Waymark/issues/45) the return of this feature.

### 1.2.0 ###

Enable or disable various WordPress features of the Map Custom Post Type, including the new ability to enable comments and excerpt integration. This Setting is Available in Settings > Advanced > Post Type. Thanks to [YosoraLife](https://github.com/YosoraLife) for requesting this ([here](https://github.com/OpenGIS/Waymark/pull/42) and [here](https://github.com/OpenGIS/Waymark/issues/44)).

### 1.1.8 ###

Show/Hide Overlay Types bug fix. Thanks to [YosoraLife](https://github.com/YosoraLife) for raising this [issue](https://github.com/OpenGIS/Waymark/issues/41).

### 1.1.7 ###

Another Collection Map link fix.

### 1.1.6 ###

Removed Link to/from Maps Setting in Collection options. Links to/from Collections and Maps will now be displayed by default, but can be hidden using CSS if desired. Thanks to [wkndwlk](https://wordpress.org/support/users/wkndwlk/) for [reporting this](https://wordpress.org/support/topic/links-within-waymarks-on-collection-maps/).

### 1.1.5 ###

- Chinese character fix. Thanks to [hlv008](https://wordpress.org/support/users/hlv008/) for [reporting this](https://wordpress.org/support/topic/the-icon-cannot-be-replaced-or-changed/).

### 1.1.4 ###

- Map height bug fix.

### 1.1.3 ###

- Submission File Upload bug fix.

### 1.1.2 ###

- Adding missing localisations.

### 1.1.1 ###

- Elevation display bug fix. Thanks to [hsmeets](https://wordpress.org/support/users/hsmeets/) for [reporting this](https://wordpress.org/support/topic/height-map-no-longer-shown/).

### 1.1.0 ###

- **[Waymark JS](https://www.ogis.org/waymark-js/)** - The plugin has been significantly refactored, with the JavaScript codebase being split into a separate [project](https://github.com/OpenGIS/Waymark-JS/). This makes the Waymark Editor and Viewer available as a standalone library, which can be used in **any web page** and does not require WordPress. 
- Removed the Show/Hide "Type Labels" Setting. Type labels are always shown by default, but can be hidden using CSS.
- Removed Settings for importing custom GeoJSON properties.
- Lots of other improvements and bug fixes.

### 1.0.4 ###

- Removed "Store Read Files" Setting, which was disabled by default and did not work reliably.
- Waymark JS refactoring, preparing for spin-off.
- Other fixes and improvements.

### 1.0.3 ###

- **Global Callback** - If the function `waymark_loaded_callback` is defined globally, it will be called when Waymark has loaded. This allows you to extend Waymark functionality similar to the Shortcode Callback, however it will apply to *all* Waymark Maps.
- Fix for Export/Overlay Filter [bug](https://github.com/OpenGIS/Waymark/issues/32).
- Other fixes and improvements.

### 1.0.2 ###

Fix for colours not appearing correctly in the Overlay Filter. Thanks to [geomfranzo](https://wordpress.org/support/users/geomfranzo/) for [raising this](https://wordpress.org/support/topic/sort-line-markers-by-name-bug-line-color/).

### 1.0.1 ###

Fixed a bug with Map Exporting. Thanks to <a href="https://wordpress.org/support/users/microteq/">microteq</a> for <a href="https://wordpress.org/support/topic/error-when-downloading-gpx-or-kml/">reporting this</a>.

### 1.0.0 ###

Thanks for helping Waymark get to Version 1! ❤️

* [Map First](https://github.com/opengis/map-first) - A minimal WordPress theme with an *obsession* for Maps. It's open-source too and contains lots of comments about customisations.
* Added Total Ascent and Descent to Elevation Profile. Thanks to <a href="https://github.com/MaximeChallon">MaximeChallon</a> for the <a href="https://github.com/OpenGIS/Waymark/pull/29">Pull Request</a> :)
* Improved rendering of multiple Maps through the Collection Shortcode, where the initial view would sometimes not be set correctly to view all Map data.
* Updated documentation.
* Lots of other bug fixes and improvements.

### 0.9.30 ###

* **Marker Clustering**
    * Once enabled, Markers will be stacked when they are close together. This can help to reduce clutter on the Map.
    * You can enable this feature in Settings > Maps > Clustering, or using the `show_cluster="1"` Shortcode option. 
    * There are also settings to adjust the cluster radius and what what zoom level to start clustering at.
* Added `file_start_type` and `file_end_type` options to the Shortcode Files feature, which allow you to automatically add a Marker of the specified type to the start and/or end of all Lines in the file. Thanks to <a href="https://wordpress.org/support/users/digbymaass/">digbymaass</a> for the <a href="https://wordpress.org/support/topic/shortcode-option-for-start-marker/">suggestion</a>.
* Stop Elevation plugin from adjusting map bounds. Thanks to <a href="https://wordpress.org/support/users/ellocosolo/">ellocosolo</a> for the <a href="https://wordpress.org/support/topic/map_centre-and-map_zoom-shortcodes-cannot-be-used-at-the-same-time/">report</a>.
* Improved KML error handling when loading from URL.
* Improved rendering of multiple Maps through the Collection Shortcode.
* Minor bug fixes

### 0.9.29.5 ###

* Fixed a bug where Submissions were not being saved.

### 0.9.29.4 ###

* Minor bug fix.

### 0.9.29.3 ###

* Added a Collections > "Shortcode Method" Setting. This allows you to choose whether Map data is loaded in the Background (via AJAX), or Embedded in the page when embedding a Collection via the Shortcode. Embedding may be a bad idea for LARGE COLLECTIONS, but *may* resolve some (JavaScript) issues where Collections are not displaying correctly.

### 0.9.29.2 ###

* Fixed a bug where the Shortcode Zoom and Centre parameters were being ignored. Thanks to <a href="https://github.com/killianweid">killianweid</a> for creating <a href="https://github.com/opengis/waymark/issues/25">this issue</a>.

### 0.9.29.1 ###

* Fixed a bug where the default line_opacity was being set to 0. Thanks to <a href="https://wordpress.org/support/users/digbymaass /">digbymaass</a> for <a href="https://wordpress.org/support/topic/update-sets-track-opacity-setting-to-0/">letting me know</a>.

### 0.9.29 ###

* Added `map_width` Shortcode option, which has been requested a couple of times. Thanks for bugging me! :0)
* Added Opacity Setting for Line Types (Lines > Opacity), thanks to <a href="https://wordpress.org/support/users/digbymaass/">digbymaass</a> for the <a href="https://wordpress.org/support/topic/feature-request-opacity-setting-for-lines/">suggestion</a>.

### 0.9.28.7 ###

* Meta data is now preserved when the Map is trashed/restored. Thanks to <a href="https://wordpress.org/support/users/killiandev7/">killiandev7</a> for <a href="https://wordpress.org/support/topic/feature-request-recover-map-data-after-recovering-a-deleted-map/">bringing this to my attention</a>.
* Fixed a bug where special characters in Description were being messed up. Thanks to <a href="https://github.com/killianweid">killianweid</a> for creating this <a href="https://github.com/opengis/waymark/issues/24">issue</a>.
* Fixed a bug with some KML files when loading from URL using Shortcode. Thanks to <a href="https://wordpress.org/support/users/henkna/">henkna</a> for <a href="https://wordpress.org/support/topic/kml-fails-to-load/">letting me know about this</a>.
* Added Leaflet Basemap examples URL to Settings > Basemaps.
* Minor bug fixes and improvements.

### 0.9.28.6 ###

Added `max_zoom` Shortcode option, which will prevent the Map from being zoomed in further that this zoom level (usually ~1-20 range). Thanks to <a href="https://wordpress.org/support/users/microteq/">microteq</a> for the <a href="https://wordpress.org/support/topic/shortcode-ma_zoom-request/">suggestion</a>.

### 0.9.28.5 ###

Added `elevation_units` (metric/imperial) Shortcode option, which will override the Waymark > Elevation > Elevation Units option. Thanks to <a href="https://github.com/randombuffalo">randombuffalo</a> for the <a href="https://github.com/opengis/waymark/issues/22">suggestion</a>.

### 0.9.28.4 ###

* Fixed a Map duplication bug. Thanks to <a href="https://wordpress.org/support/users/microteq/">microteq</a> for <a href="https://wordpress.org/support/topic/duplicating-a-map-ends-in-anempty-page/">reporting this</a>.

### 0.9.28.3 ###

* More fixes!

### 0.9.28.2 ###

* Fixed a bug where Maps initally hidden on page load are broken. Thanks to <a href="https://wordpress.org/support/users/microteq/">microteq</a> for <a href="https://wordpress.org/support/topic/map-does-not-center-and-not-zoom-to-content-when-first-hidden/">reporting this</a>.

* Fix for a weird glitch where *sometimes* the Map will not "wake" if the mouse is hovering over that Map during initial page load. Thanks to <a href="https://wordpress.org/support/users/microteq/">microteq</a> for <a href="https://wordpress.org/support/topic/hovering-over-map-to-zoom/">reporting this</a>.

### 0.9.28.1 ###

* Fixed a bug where Line direction arrows were being shown for hidden Lines. Thanks to <a href="https://wordpress.org/support/users/microteq/">microteq</a> for <a href="https://wordpress.org/support/topic/hiding-track-with-direction-arrows-sometimes-does-not-work/#post-16817555">reporting this</a>.

### 0.9.28 ###

* **Direction Arrows**
  * Lines can now have a direction associated with them. To add a direction, click on a Line while editing a Map and select from the direction dropdown. Thanks <a href="https://wordpress.org/support/topic/feature-request-direction-of-travel/">for</a> <a href="https://wordpress.org/support/topic/direction-arrows-in-route/">the</a> <a href="https://github.com/opengis/waymark/issues/4">suggestions</a>!
* **Interaction**
	* By default, Waymark disables scroll zoom until the user hovers over the Map for 2 seconds. This behaviour can now be customised in Waymark Settings > Maps > Interaction. Settings allow you to adjust the delay and optionally display a message to the user while scroll zoom is disabled, for example "Click or Hover to Wake".
	* Fixed an annoying glitch where mouse "wheeling" over the elevation chart caused the Map to zoom.
	* Added Max Zoom setting in Maps > Basemaps, which was <a href="https://wordpress.org/support/topic/feature-request-zoom-level-limit/">requested a long time ago</a>!
* **Permalinks**
	* Customise your Map and Collection URLs in Waymark Settings > Advanced > Permalinks by specifying Map and Collection slugs (i.e. example.com/[map-slug]/example-map/ and example.com/[collection-slug]/example-collection/). Thanks to <a href="https://wordpress.org/support/users/wkndwlk/">wkndwlk</a> for the <a href="https://wordpress.org/support/topic/map-and-collection-slugs/">suggestion</a>.
* **GeoJSON Properties**
	* You can now read GeoJSON feature properties when importing from file by adding them in Waymark Settings > Overlays > Properties. If Waymark finds data for these properties it will be added to the Overlay description when it is imported. Thanks to <a href="https://wordpress.org/support/users/waimek/">waimek</a> for the <a href="https://wordpress.org/support/topic/using-data-from-geojson/">suggestion</a>.
* **Collection Export**
	* You can now Export entire Collections when embedding them with the Shortcode. Click Details in the Shortcode Header to see the Export feature. The Public Export (Settings > Map > Misc.) and Shortcode Header (Settings > Map > Shortcodes) Settings must be enabled. As with Maps only the currently visible Overlays are exported, with GeoJSON, KML and GPX supported. Thanks to <a href="https://wordpress.org/support/users/wimzwag/">wimzwag</a> for the <a href="https://wordpress.org/support/topic/download-all-geojson-gpx/">suggestion</a>.
* Fixed a bug where elevation data remained visible even when a Line was hidden. Thanks to <a href="https://wordpress.org/support/users/canuck069/">Nigel</a> for <a href="https://wordpress.org/support/topic/gpx-tracks-shadowed-with-evelation-colour/">pointing this out</a>.

### 0.9.27 ###

* Added Map Scale Setting, which displays a distance scale on the Map in kilometers and miles (Settings > Map > Misc.)

### 0.9.26 ###

* Individual Overlay Types can now be Shown/Hidden initially using the Shortcode, overriding the "Show Initially" Setting for each. Use the `hide_marker`, `show_marker`, `hide_line`, `show_line`, `hide_shape`, `show_shape` Shortcode parameters, providing one or multiple (comma separated) Type Keys. For example:

`[Waymark map_id="1234" hide_marker="photo,alert" show_line="green"]`

Thanks to <a href="https://wordpress.org/support/users/hansolo68/">hansolo68</a> for the <a href="https://wordpress.org/support/topic/show-markers-initially-as-shortcode/">suggestion</a>.

* Admin Help page removed in favour of a link to the Waymark website Documentation.

### 0.9.25.1 ###

* Fixed map data container bug, which was causing Map Data not to save.

### 0.9.25 ###

* Settings navigation improvements.
* Submission localization fixes.
* Minor bug fixes.

### 0.9.24 ###

* Editor popup redesign, including Type previews.
* Front-end Submissions improvements.
* Lots of other bug fixes and improvements.

### 0.9.23 ###

* Bug fix

### 0.9.22 ###

* Ignore file extension capitalisation when reading from file. This was a bug that meant reading from file.GPX (instead of file.gpx) was rejected for no good reason.

Credit to Werner for getting in touch and prompting these changes.

### 0.9.21 ###

* Bug fix. Uncaught TypeError: Assignment to constant variable. Thanks to <a href="https://github.com/huubl">huubl</a> for the <a href="https://github.com/opengis/waymark/pull/13">Pull Request</a>!

### 0.9.20 ###

* Front-end Submissions can now be added to a Collection by default. A collection for User and Guest submissions can be specified in Settings > Submissions > Default Collection.

### 0.9.19 ###

* **Shortcode Files**
	* Files (GPX, KML & GeoJSON) can now be displayed using the Shortcode, without the need for a Map to be created. For example:<br> <code>[Waymark file_url="http://example.com/track.gpx"]</code><br> By default, <em>all</em> Overlays (Markers/Lines/Shapes) will be displayed using the default Type (i.e. the first listed in Settings). You can specify a different Type to use like this:<code>[Waymark file_url="http://example.com/track.gpx" file_line_type="photo"]</code>. Thanks to <a href="https://wordpress.org/support/users/golf1025/" rel="nofollow">Jan de Boer</a> for this <a href="https://wordpress.org/support/topic/migrate-gpx-from-other-app/">suggestion</a> and <a href="https://wordpress.org/support/users/yorobo/">yorobo</a> for <a href="https://wordpress.org/support/topic/cant-upload-kml-gpl-file/">the reminder</a>.

### 0.9.18 ###

* **Submissions**
    * Allow registered users, or guests to create Maps from the front-end of your site. You can control who can Submit Maps, what editor features are available and whether submissions should be approved before they are published. Originally suggested <a href="https://wordpress.org/support/topic/feature-request-add-marker-from-frontend/">here</a>.
* **Shortcode Markers**
		* Markers can now be displayed using the Shortcode, without the need for a Map to be created. For example:<br> <code>[Waymark marker_centre="54.526814,-3.017289" marker_type="shelter"]</code><br> As well as the Marker location and Type; a Title, Description and an Image can also be provided. Thanks to <a href="https://wordpress.org/support/users/mistermagoo8691/" rel="nofollow">Angelo Mariani</a> for this <a href="https://wordpress.org/support/topic/show-a-marker-on-the-centre-location/">suggestion</a>.
* Fixed a bug where Shortcode Headers were not displaying on Collection archive pages. Thanks to <a href="https://wordpress.org/support/users/meggsico/">meggsico</a> for <a href="https://wordpress.org/support/topic/maybe-a-bug-7/#post-14815812">bringing this to my attention</a>.
* Improved "accidental zooms" when scrolling by increasing the <a href="https://github.com/CliffCloud/Leaflet.Sleep">Leaflet.Sleep</a> wakeTime from 1 second to 2 seconds. As <a href="https://wordpress.org/support/topic/disable-user-zooming-panning-on-a-map/#post-15208899">requested</a>.
* Lots of back-end fixes and improvements.

### 0.9.17.1 ###

* Fixed a bug where the Export feature did not work correctly when embedding multiple Maps. Thanks to <a href="https://github.com/shenki">shenki</a> on <a href="https://github.com/opengis/waymark/issues/3">GitHub</a>.
* Waymark now has it's own <a href="https://www.ogis.org/waymark-wp/">website</a>! URLs updated.

### 0.9.17 ###

* **Maps**
    * Maps now support Featured Images; if provided this will be displayed on the Map Details page, as well as by the Shortcode. Thanks to David for the suggestion!
* **Markers**
    * Marker Icons can now be custom text or HTML (in addition to Font icons from Ionic Icons and Font Awesome). Thanks for the <a href="https://wordpress.org/support/topic/feature-request-custom-markers/">suggestion</a>!
    * Map Exports are now available on mobile devices.
    * Updated Acknowledgements.
* **Bug fixes**
    * Settings JavaScript fix.
    * Settings repeatable dropdown bug.
    * Settings input sanitisation.

A <b>BIG</b> thank you to the following users for their help with testing:

* <a href="https://wordpress.org/support/users/dalehopp/">dalehopp</a>
* <a href="https://wordpress.org/support/users/coloursign/">coloursign</a>
* <a href="https://wordpress.org/support/users/nhathaway/">nhathaway</a>

### 0.9.16 ###

* **Markers**
    * Markers can now be different shapes! Markers, Circles or Squares in three different sizes: Small, Medium and Large.
    * Markers can now have any colour background, selected using the colour picker or by entering a hexadecimal color (i.e. #RRGGBB)
    * Markers now support Font Awesome icons as well as Ionic Icons.
* **Types**
    * Type labels displayed by popups now match the colours of their respective Marker, Line or Shape.
* **Media Library Uploads**
    * By default Waymark does not save any files uploaded through the Editor. Using this option you can use the Media Library to store and import GPX/KML/GeoJSON files into your Map.
* **Bug fixes**
    * Improved location accuracy when relying on device GPS. Thanks to <a href="https://wordpress.org/support/users/coloursign/">coloursign</a> and <a href="https://wordpress.org/support/users/edwinfr/">edwinfr</a> for <a href="https://wordpress.org/support/topic/more-accurate-location-possible/">bringing this to my attention.</a>
    * Waymark_Helper `asset_url()` fix. Thanks to <a href="https://wordpress.org/support/topic/filter-by-markers-category/">pwrdp</a> for bringing this to my attention.
    * Updated Ion Icons v2 URLs. Thanks to <a href="https://wordpress.org/support/users/gudulemartens/">gudulemartens</a> for <a href="https://wordpress.org/support/topic/ion-icons/">letting me know about this</a>.

### 0.9.15.2 ###

* Localization fixes. Thanks to <a href="https://profiles.wordpress.org/tobifjellner/">tobifjellner</a> for the help via Slack.

### 0.9.15.1 ###

* Bug fix. Thanks to <a href="https://wordpress.org/support/topic/warning-error-by-new-update/">cameraspots1</a> for bringing this to my attention.

### 0.9.15 ###

* **Meta**
    * Meta can now be organised into groups. Meta in the same group will be displayed together when editing and viewing Maps. Groups can be managed in Settings > Meta > Groups.
    * New layout for Meta to incorporate Meta Groups on Map Details page.
* **Shortcode**
    * Meta can now be displayed using the Shortcode by clicking "Details" in the Shortcode Header. Use the Settings > Meta > "In Shortcode?" option to specify which Meta is displayed. Note: this feature requires the Shortcode Header be set to "Show" in Settings > Misc. > Shortcode Options.
    * The Export option is now available through the Shortcode, if the "Public Export" option is enabled (Settings > Misc. > Map Options).
* **Editor** 
    * Overlay descriptions now use a rich text editor.
    * Added the ability to duplicate Markers/Lines/Shapes in the Editor.
    * Editor circle bug fix.
* Gallery JavaScript bug fix.
* Waymark is now localization ready! <a href="https://translate.wordpress.org/projects/wp-plugins/waymark/">Translation contributions</a> greatly appreciated :)
* Waymark is now <a href="https://github.com/opengis/waymark">on GitHub</a>.

### 0.9.14 ###

* **Line Elevations** - Display an interactive elevation graph for Lines that have elevation data. Minimum/Maximum elevation and total length statistics are also displayed. Customise in Settings > Misc. > Elevation Options. Thanks to <a href="https://github.com/Raruto/leaflet-elevation">leaflet-elevation</a>!
* Cyrillic alphabet fix.
* GPX parsing fix.
* Updated user capabilities for plugin features.
* Other bug fixes.

A big thank you to everyone who provided input for this release. Extra special thanks goes to <a href="https://wordpress.org/support/users/coloursign/">coloursign</a>, <a href="https://wordpress.org/support/users/meggsico/">meggsico</a>, <a href="https://wordpress.org/support/users/davinian/">davinian</a>, <a href="https://wordpress.org/support/users/snake-plissken/">snake-plissken</a>, <a href="https://wordpress.org/support/users/sunlight1976/">sunlight1976</a> and <a href="https://wordpress.org/support/users/bumbar/">bumbar</a> for their help with testing.

### 0.9.13 ###

* **Overlay Filter** - This allows your visitors to filter which Markers, Lines and Shapes are currently visible on the Map by clicking on the layer icon. You can choose to show/hide certain Types when the Map initially loads. Enable using the global setting (Settings > Misc. > Map Options), or using the Shortcode.
* **Export** - There is now an Export function when editing a Map. With "Public Export" enabled (Settings > Misc. > Map Options) site visitors can download the Overlays (Markers, Lines and Shapes) currently displayed on the Map Details page. Can be used in conjunction with the Overlay Filter to select which Overlays to download. GeoJSON, GPX and KML formats  supported.
* **Meta** - Added Rich Text, Select and Multi-Select input types.
* Bug fixes.

Thanks to <a href="https://wordpress.org/support/users/neilhorton740/">neilhorton740</a>, <a href="https://wordpress.org/support/users/carldavidcarlstrom/">carldavidcarlstrom</a>, and <a href="https://wordpress.org/support/users/coloursign/">coloursign</a> for  testing and feedback.

### 0.9.12 ###

* **Gallery** - Added the option to display an image gallery for Markers that have images associated with them. Can be changed in Settings > Misc. > Map Options. Can be enabled using the show_gallery="1" Shortcode option.
* Created <a href="https://www.ogis.org/waymark-wp/">Waymark Documentation</a>.
* Updated the <a href="https://www.ogis.org/waymark-wp/">Demo</a>.
* First steps towards <a href="https://developer.wordpress.org/plugins/internationalization/localization/">Localization</a>.
* Added the ability to change Map author. Thanks to <a href="https://wordpress.org/support/topic/feature-request-shortcode-download-link-author-change/">andreasrns</a> for the suggestion.
* Maps now support Revisions.
* Added "Header for Admin" to Settings > Shortcode Options. Use this Setting to always show the Shortcode Header when signed in as admin, useful for quickly navigating to embedded Maps.
* Fixed a bug where circles were being added as Markers.
* Removed undocumented shortcode button in Classic Editor.
* Fixed Leaflet JS conflict when other instances of Leaflet exist. Thanks to <a href="https://wordpress.org/support/topic/blank-map-6/">jmruas</a> for bringing this to my attention.
* Fixed a bug where Types were not being saved for Markers/Lines imported from file.
* Other minor improvements.

A big thanks to <a href="https://wordpress.org/support/users/neilhorton740/">neilhorton740</a> and <a href="https://wordpress.org/support/users/carldavidcarlstrom/">carldavidcarlstrom</a> for bug finding and testing.

### 0.9.11 ###

* **Collections** - Can now be given a description and viewed as an archive (lists Maps in that Collection) on the front-end. A link is displayed on the Map Details page (Collection links support permalinks)
* Map URLs now support permalinks
* Added the ability to duplicate Maps
* In the Editor, Markers now display their Lat,Lng
* Lots of other improvements and bug fixes

Thanks to <a href="https://wordpress.org/support/users/neilhorton740/">neilhorton740</a> and <a href="https://wordpress.org/support/users/carldavidcarlstrom/">carldavidcarlstrom</a> for suggestions and testing.

### 0.9.10 ###

* **Shortcodes** – Added the ability to specify initial Map centre and zoom through the Shortcode: [Waymark map_centre="<lat>,<lng>" map_zoom="<0-18>"]. Shortcodes no longer require a Map ID/Collection ID. Added Using Shortcodes section to Help page.
* **Maps** – Added setting for Default Centre/Zoom when a Map has no data to display.
* **Collections** – Added the option to display a link to Map Details pages from Collections
* Improved Settings input sanitisation
* Lots more performance improvements and bug fixes

Another big thanks to <a href="https://wordpress.org/support/users/neilhorton740/">neilhorton740</a> for suggestions and testing.

### 0.9.9 ###

* Release date: December 17th, 2019

Added the ability to specify a default basemap through shortcode: [Waymark map_id="1234" basemap="Basemap Name"]. Which Basemap to use as the Map Editor default can also be specified in Settings > Misc. > Editor Options. Thanks again to <a href="https://wordpress.org/support/users/neilhorton740/">neilhorton740</a> for the suggestion and testing.

### 0.9.8 ###

* Release date: December 5th, 2019

Added Line Weight setting for Lines and the ability to override the Shortcode Header setting through the shortcode. A HUGE thank you to <a href="https://wordpress.org/support/users/neilhorton740/">neilhorton740</a> for the <a href="https://wordpress.org/support/topic/great-design-and-well-thought-out/">suggestions and testing</a>.

### 0.9.7 ###

* Release date: November 8th, 2019

Added support for Meta, which allows you to customise the input fields that display under the Map Editor. Any data you input will display on the Map Details page. Plus some minor improvements and bug fixes.

### 0.9.6 ###

* Release date: October 28rd, 2019

Added support for Collections, which allow you to organise your Maps and display multiple Maps at once. Also more bug fixes.

### 0.9.5 ###

* Release date: October 23rd, 2019

Integrated <a href="https://github.com/perliedman/leaflet-control-geocoder">leaflet-control-geocoder</a>, thanks for the <a href="https://wordpress.org/support/topic/search-for-place-in-admin-section/">suggestion</a>! Also minor fixes and tweaks.

### 0.9.4 ###

* Release date: October 11th, 2019

Bug fixes and improvements. Thanks again to rottensod!

### 0.9.3 ###

* Release date: September 4th, 2019

Bug fixes and minor tweaks. Thanks to rottensod for your bug finding efforts!

### 0.9.2 ###

* Release date: July 26th, 2019

Integrated Leaflet.Sleep into Waymark for better zoom/scroll event handling. Thanks to numeeja for this suggestion!

### 0.9.1 ###

* Release date: July 25th, 2019

Minor bug fix.

### 0.9 ###

* Release date: July 23rd, 2019

First public release of Waymark!
