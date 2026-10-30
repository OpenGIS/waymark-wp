---
title: Settings
description: Configure Basemaps, Markers, Lines, Shapes, Meta, Submissions and other Waymark Map options.
---

::video-figure{src="/assets/video/settings.mp4" poster="/assets/video/posters/settings.jpg" label="Waymark - Settings" captions="/assets/video/captions/settings.en.vtt"}
::

<a id="tiles"></a>

## Basemaps

Waymark uses the excellent [OpenStreetMap](https://www.openstreetmap.org/fixthemap) as its default Basemap and supports many [other providers](https://leaflet-extras.github.io/leaflet-providers/preview/). <br /> <br /> [Thunderforest](https://www.thunderforest.com/) and [Mapbox](https://www.mapbox.com/maps/) are examples of providers that offer easy access to beautiful Basemaps (including satellite imagery). They require registration, but have a free usage tier.

::settings
:::setting{title="Basemap Name" type="text" default="Open Street Map"}
The Layer Name will appear in a dropdown list shown by the Map when multiple Basemaps have been entered. You can change the default basemap in the shortcode: `[Waymark map_id="1234" basemap="Basemap Name"]`
:::

:::setting{title="Basemap URL" type="text" default="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}
Many mapping services support the Slippy Map format. Waymark requires URLs that contain {z} (zoom level) and {x}/{y} (tile coordinates). For example the OpenCycleMap URL is https<wbr>://tile.thunderforest.com/cycle/{z}/{x}/{y}@2x.png?apikey=\[your_api_key\].
:::

:::setting{title="Basemap Attribution" type="text" default="© OpenStreetMap contributors"}
Mapping services often have the requirement that attribution is displayed by the map. Text and HTML links are supported.
:::

:::setting{title="Basemap Max Zoom" type="text" default="18"}
Set a maximum zoom level for this Basemap, the default is 18.
:::
::

<a id="markers"></a>

## Markers

### Marker Types

Customise how Markers are displayed on the Map. Set these styles once, then select the appropriate Type when you add to the Map.

The label is a display name. The key is a stable internal identifier used in Shortcodes and CSS; translating the label does not change the key.

::settings
:::setting{title="Marker Label" type="text" default="Photo"}
What kind of Marker is this? E.g. "Photo", "Grocery Store", "Warning!". Once saved, Marker labels cannot be edited. The Marker Label is displayed in the Tooltip (when hovering over the Marker) and in the Info Window (once the Marker is clicked). Hide in Settings &gt; Misc. &gt; Type Labels.
:::

:::setting{title="Marker Shape" type="select" default="marker"}
Which shape of Marker to use. Circles and Squares are centered at the specified location, Markers point down to that location.
:::

:::setting{title="Marker Size" type="select" default="large"}
Which size of Marker to use.
:::

:::setting{title="Marker Background" type="text" default="white"}
The Marker background colour. Click "Select Colour" to select.
:::

:::setting{title="Marker Show Initially" type="boolean" default="1"}
When using the Overlay Filter you can choose to show/hide certain Types when the Map initially loads.
:::

:::setting{title="Marker Submissions" type="boolean" default="1"}
Make this Type available in front-end Submissions?
:::

:::setting{title="Icon Type" type="select" default="icon"}
Font Icons are available from Font Awesome and Ionic Icons. Simple Text or Emojis are supported, as well as custom HTML. So you can pretty much use anything you like!
:::

:::setting{title="Icon Name" type="text" default="ion-camera"}
The desired icon name from Ionicons or Font Awesome, e.g. "ion-camera", or "fa-camera". Click the links to see the full list of icons available.

Text to display inside the Marker, in the chosen colour. Space is very limited! Pro Tip: adjust text size using CSS; for all Markers: .waymark-icon-text{font-size: 18px}, or by Type: .waymark-marker-photo .waymark-icon-text{...}. Use your browser's inspector to dig for Type class names.

The HTML entered will be added inside each Marker. Pro Tip! HTML Entities supported (e.g. &amp;cross; as well as Unicode and Emojis!), or provide HTML to integrate with other Icon providers.
:::

:::setting{title="Icon Colour" type="text" default="#475260"}
The colour of the icon. Click "Select Colour" to select.
:::
::

<a id="lines"></a>

## Lines

### Line Types

Customise how Lines are displayed on the Map. Set these styles once, then select the appropriate Type when you add to the Map.

The label is a display name. The key is a stable internal identifier used in Shortcodes and CSS; translating the label does not change the key.

::settings
:::setting{title="Line Label" type="text" default="Red"}
What kind of Line is this? E.g. "Easy", "Walking Only", "Dark Red". The Line Label is displayed in the Tooltip (when hovering over the Line) and in the Line Info Window. Once saved, Line labels cannot be edited.
:::

:::setting{title="Line Colour" type="text" default="#d84848"}
The colour of the Line. Click "Select Colour" to select.
:::

:::setting{title="Line Width" type="text" default="3"}
The width of the Line, in pixels.
:::

:::setting{title="Line Opacity" type="text" default="0.7"}
The opacity of the Line, between 0.0 and 1.0 (e.g. "0.5").
:::

:::setting{title="Line Show Initially" type="boolean" default="1"}
When using the Overlay Filter you can choose to show/hide certain Types when the Map initially loads.
:::

:::setting{title="Line Submissions" type="boolean" default="1"}
Make this Type available in front-end Submissions?
:::
::

<a id="shapes"></a>

## Shapes

<a id="shapes-shape_types"></a>

### Shape Types

Customise how Shapes are displayed on the Map. Set these styles once, then select the appropriate Type when you add to the Map.

The label is a display name. The key is a stable internal identifier used in Shortcodes and CSS; translating the label does not change the key.

::settings
:::setting{title="Shape Label" type="text" default="Red"}
What kind of Shape is this? E.g. "Park", "Danger!", "Light Blue". The Shape Label is displayed in the Tooltip (when hovering over the Shape) and in the Shape Info Window. Once saved, Shape labels cannot be edited.
:::

:::setting{title="Shape Colour" type="text" default="#d84848"}
The colour of the Shape. Click "Select Colour" to select.
:::

:::setting{title="Shape Fill Opacity" type="text" default="0.5"}
The opacity of the inside of the shape, between 0.0 and 1.0 (e.g. "0.5").
:::

:::setting{title="Shape Show Initially" type="boolean" default="1"}
When using the Overlay Filter you can choose to show/hide certain Types when the Map initially loads.
:::

:::setting{title="Shape Submissions" type="boolean" default="1"}
Make this Type available in front-end Submissions?
:::
::

<a id="meta"></a>

## Meta

Create additional input fields that appear underneath the Map Editor. Any Meta that has been input is displayed on the Map Details page, and can also be displayed by the Shortcode.

::settings
:::setting{title="Meta Title" type="text" default="Description"}
The title appears next to the input field.
:::

:::setting{title="Meta Default" type="text"}
The default value for the input field. For Select and Multi-Select enter the option/comma-separated options to be selected by default.
:::

:::setting{title="Meta Tip" type="text" default="The Description you enter here will be displayed on the Map Details page."}
A tip provides additional information about an input field... just like this!
:::

:::setting{title="Meta Type" type="select" default="textarea_rich"}
The type of input field to use.
:::

:::setting{title="Meta Options" type="text"}
A comma-separated list of options for the input.
:::

:::setting{title="Meta Group" type="select"}
Which group this Meta belongs to (if any). Meta in the same group will be displayed together when editing and viewing Maps. Meta not in a group will be displayed above any groups.
:::

:::setting{title="Meta In Shortcode" type="boolean" default="0"}
Whether this content should be displayed when embedding a Map using the Shortcode.
:::

:::setting{title="Meta In Submissions" type="boolean" default="0"}
Make this Meta available in front-end Submissions?
:::
::

<a id="meta-groups"></a>

### Groups

Create groups to organise your Map Meta. Meta in the same group will be displayed together when editing and viewing Maps.

::settings
:::setting{title="Group Title" type="text"}
The title appears above the Meta in that group.
:::
::

<a id="properties"></a>

## Properties

<a id="properties-props"></a>

Read **[GeoJSON](https://geojson.org/)** feature properties when importing. <br /> <br /> If Waymark finds data for the property keys below it will be stored when it is imported. These can be automatically appended to the Overlay Description, or accessed programmatically via the `layer.feature.properties` Object.

::settings
:::setting{title="Property Key" type="text"}
This is the key associated with the data you are trying to access, i.e. "properties": {"property_key": "Some content here"}
:::

:::setting{title="Property Title" type="text"}
The value for this property will be added to the Overlay Description under this title.
:::
::

<a id="properties-options"></a>

### Options

Append listed Properties to the Overlay Description.

::settings
:::setting{title="Append" type="boolean" default="0"}
Append the property value to the Overlay Description.
:::
::

<a id="submission"></a>

## Submissions

<a id="submission-global"></a>

### Front-End Submissions

Use the `[Waymark content="submission"]` Shortcode to allow Map submissions from the front-end of your site.

::settings
:::setting{title="Allow Submissions" type="boolean" default="0"}
Submissions will be available only to site administrators by default, but can also be allowed for registered users or even to guests without registration.
:::
::

<a id="submission-from_users"></a>

### User Submissions

Allow registered users to create Maps from the front-end.

::settings
:::setting{title="Allowed Roles" type="select_multi"}
Users with the selected roles will be able to make Submissions through the front-end
:::

:::setting{title="Editor Features" type="select_multi"}
What features to offer in the Editor. Important! Uploaded images are added to the Media Library, reading from file does not keep a copy of the file on the server. Whether an individual Meta input is displayed can be set in the Settings &gt; Meta.
:::

:::setting{title="Default Status" type="select"}
This is the initial status of the submitted Map. Note! Publish means that the Map (including any images added) will be _immediately_ visible on your site.
:::

:::setting{title="Default Collection" type="select"}
If specified, user submissions will be automatically added to this Collection.
:::
::

<a id="submission-from_public"></a>

### Public Submissions

This will allow Submissions from **any visitor**, without registration.

::settings
:::setting{title="Allow Public Submissions" type="boolean" default="0"}
Allow _anyone_ to submit Maps to your site, without registration.
:::

:::setting{title="Editor Features" type="select_multi"}
What features to offer in the Editor. Important! Uploaded images are added to the Media Library (see Upload Location below), reading from file does not keep a copy of the file on the server. Whether an individual Meta input is displayed can be set in the Settings &gt; Meta.
:::

:::setting{title="Upload Location" type="select" default="waymark_submission"}
Images uploaded by non-registered users can be stored separately from other Media Library uploads, to aid with moderation. All uploaded images will be stored in a single directory (/waymark_submission) found in the upload root.
:::

:::setting{title="Default Status" type="select"}
This is the initial status of the submitted Map. Note! Publish means that the Map (including any images added) will be _immediately_ visible on your site.
:::

:::setting{title="Default Collection" type="select"}
If specified, user submissions will be automatically added to this Collection.
:::
::

<a id="misc"></a>

## Misc.

### Map Options

Use these options to change how Maps are displayed.

::settings
:::setting{title="Default Centre" type="text" default="51.38436,-68.74923"}
Waymark centres the Map automatically when displaying data. These coordinates (Latitude,Longitude) will be used when there is no data available.
:::

:::setting{title="Map Height" type="text" default="450"}
Specify the desired height of the Map (in pixels). Pro Tip! This will affect all Maps, but you can change the height (and width) of an individual Map through the Shortcode: `[Waymark map_id="1234" map_height="640"]`
:::

:::setting{title="Default Zoom" type="text" default="9"}
Waymark zooms the Map automatically when displaying data. This zoom level (0-18) will be used when there is no data available.
:::

:::setting{title="Image Gallery" type="boolean" default="1"}
Whether to display an image gallery for Markers that have images associated with them. Pro Tip! This will affect all Maps, but you can choose to show/hide the gallery of an individual Map through the shortcode: `[Waymark show_gallery="1"]`
:::

:::setting{title="Overlay Filter" type="boolean" default="1"}
Allow the user to filter which Markers, Lines and Shapes are currently visible on the Map. Pro Tip! This will affect all Maps, but you can choose to show/hide the filter for individual Maps through the shortcode: `[Waymark show_filter="1"]`
:::

:::setting{title="Public Export" type="boolean" default="0"}
Offer visitors the ability to Download all Collection/Map Overlays in the Shortcode Header and on the Map Details page. GeoJSON, GPX and KML formats supported.
:::

:::setting{title="Show Scale" type="boolean" default="0"}
Show a distance scale (km and miles) on the Map.
:::
::

<a id="misc-interaction_options"></a>

### Sleep Options

Waymark Maps will zoom when the user scrolls. This can cause some unexpected/annoying behaviour when scrolling a page. <br /> <br /> **Sleeping** the Map initially and **Waking** upon user interaction (i.e. hovering/clicking/tapping) may create a better experience.

::settings
:::setting{title="Hover Wake Time" type="text" default="2"}
How many seconds before scroll zoom is enabled. 0 seconds will mean no delay (disabling this feature). A large number of seconds like 3600 (an hour) will essentially _disable hover to wake_, meaning the user will need to _click_ to wake.
:::

:::setting{title="Display Message" type="boolean" default="0"}
This message will be displayed by the Map while scroll zoom is disabled.
:::

:::setting{title="Display Message Text" type="text" default="Click or Hover to Wake"}
:::
::

<a id="misc-cluster_options"></a>

### Cluster Options

With Clustering enabled, Markers will be grouped together when they are close together. This can help to reduce clutter on the Map.

::settings
:::setting{title="Marker Clustering" type="boolean" default="0"}
Whether to cluster (stack) Markers that are close together. Pro Tip! This will affect all Maps, but you can also enable/disable clustering through the Shortcode: `[Waymark show_cluster="0"]`
:::

:::setting{title="Cluster Threshold" type="text" default="14"}
Markers will not be clustered above this zoom level.
:::

:::setting{title="Cluster Radius" type="text" default="80"}
The maximum radius that a cluster will cover from the central marker (in pixels). Decreasing will make more, smaller clusters. Default 80.
:::
::

<a id="misc-shortcode_options"></a>

### Shortcode Options

How Maps are embedded into your content using the shortcode.

::settings
:::setting{title="Shortcode Header" type="select" default="1"}
The shortcode header displays the title and link to the Map or Collection. Pro Tip! This will affect all shortcodes, but you can override the setting through the shortcode: `[Waymark map_id="1234" shortcode_header="1"]` (the value must be either 0 or 1).
:::

:::setting{title="Header for Admin" type="select" default="0"}
Use this Setting to always show the Shortcode Header when signed in as admin, useful for quickly navigating to embedded Maps.
:::
::

<a id="misc-elevation_options"></a>

### Elevation Options

Lines with elevation data.

::settings
:::setting{title="Elevation Profile" type="select" default="2"}
Display an interactive elevation profile graph below the Map for Lines that have elevation data. Pro Tip! You can choose to show/hide the elevation graph of an individual Map through the shortcode: `[Waymark map_id="1234" show_elevation="1"]`
:::

:::setting{title="Elevation Units" type="select" default="metric"}
Display elevation data in metric (m/km) or imperial (ft/mi) units.
:::

:::setting{title="Elevation Colour" type="text" default="#b42714"}
The colour of the elevation graph and associated Line.
:::

:::setting{title="Show Initially" type="boolean" default="1"}
Whether to show the elevation profile when the Map loads. If set to No, the user must click on a Line in order to display the elevation data. If there are multiple Lines with elevation data, the one added to the editor first will be the one shown initially.
:::
::

<a id="misc-collection_options"></a>

### Collection Options

How Collections are displayed.

::settings
:::setting{title="Shortcode Method" type="select" default="fetch"}
Whether to load multiple Maps in the Background (uses AJAX to improve page load) when embedding with the Shortcode, or to Embed them within the page. Embedding may be a bad idea for LARGE COLLECTIONS, but can resolve some issues where Collections are not displaying correctly.
:::
::

<a id="misc-editor_options"></a>

### Editor Options

Customising the Map Editor.

::settings
:::setting{title="Confirm Deletion" type="boolean" default="1"}
Whether to show a confirmation dialog before deleting Markers/Lines/Shapes from the Map. Pro Tip! Even if you accidentally delete something, changes are not saved until the "Update" button is clicked.
:::

:::setting{title="Default Basemap" type="select" default="Open Street Map"}
Which Basemap to use as the editor default.
:::
::

<a id="misc-permalinks"></a>

### Permalinks

Customise your Map and Collection URLs.

::settings
:::setting{title="Map Slug" type="text" default="map"}
The URL slug that will be used for links to your Maps, i.e. example.com/\[map-slug\]/example-map/. Only alpha-numeric characters and hyphens (-) are allowed.
:::

:::setting{title="Collection Slug" type="text" default="collection"}
The URL slug that will be used for links to your Collections, i.e. example.com/\[collection-slug\]/example-collection/. Only alpha-numeric characters and hyphens (-) are allowed.
:::
::

<a id="misc-post"></a>

### Post Type

Enable Custom Post Type features.

::settings
:::setting{title="Supports" type="select_multi" default="title"}
Enable or disable various WordPress features of the Map Custom Post Type.
:::
::

<a id="misc-advanced"></a>

### Debug

::settings
:::setting{title="Debug Mode" type="boolean" default="0"}
With debug mode enabled, the plugin will output Map and Settings data in Admin Dashboard. This may come in handy if you need to report a bug. Pro Tip! Check the browser console for Waymark output when signed in as an administrator.
:::
::
