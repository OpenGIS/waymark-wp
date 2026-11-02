---
title: Styling With CSS Selectors
description: WordPress and Waymark add meaningful Class names to certain HTML elements.
---

This enables very granular control over how Maps, Collections, Shortcodes and even specific Markers are displayed with CSS.

## Map Details

Maps in Waymark use the `waymark_map` [custom post type](https://developer.wordpress.org/plugins/post-types/registering-custom-post-types/). In WordPress every post has a unique ID, for example this page has an ID of 4089. We can target this page only by writing a CSS selector that uses one of many helpful [class names](https://developer.wordpress.org/reference/functions/body_class/) that WordPress adds to the HTML `<body>` element:

```css
/* Target Map Details page of a specific Map by ID */
body.postid-4089 {
  border: 10px solid red;
}
```

You can also target by post type, for example to style the Map Details page we can style using the WordPress custom post type of `waymark_map` :

```css
/* Target the Waymark Map on *every* Map Details page */
body.single-waymark_map .waymark-map {
  /* Your rules... */
}
```

## Shortcodes

### Maps

Waymark adds some helpful class names to the Shortcode and Map Container. When embedding a Map for example:

```html
<!-- Waymark creates a Hash unless one is provided using map_hash -->
<div
  id="waymark-shortcode-d21a75"
  data-shortcode_hash="d21a75"
  class="waymark-shortcode waymark-container"
>
  <!-- Map -->
  <div
    id="waymark-map-d21a75"
    class="waymark-map waymark-map-id-4028 waymark-map-container waymark-has-cluster waymark-has-gallery"
  >
    <!-- Leaflet ... -->
  </div>

  <!-- Elevation -->
  <div id="waymark-elevation-d21a75" class="waymark-elevation">
    <!-- Leaflet Elevation ... -->
  </div>
</div>
```

Waymark adds a class name containing the Map ID to all Shortcodes, so to target **all** Maps of a certain Map by ID:

```
Waymark map_id="4028"
```

```css
/* Every Shortcode of a particular Map */
.waymark-map.waymark-map-id-4028 {
  border: 10px solid blue;
}
```

::map-demo{demo="styling-map-id" height="640"}
::

More details on styling the Elevation profile can be found in [Elevation Profile Colours](/examples/elevation-profile-colours/).

### Collections

WordPress adds the `tax-waymark_collection` class name to the Collection archive page, so to target a particular Map when shown on the Collection archive page only:

```css
/* A particular Map on the Collection archive page */
body.tax-waymark_collection .waymark-map-id-4071 {
  /* Your rules... */
}
```

When embedded using the Shortcode, the Map has a class name containing the Collection ID. For example:

```html
<!-- There's that map_hash again! -->
<div id="waymark-shortcode-de2540" class="waymark-shortcode waymark-container">
  <!-- Map -->
  <div
    id="waymark-map-de2540"
    class="waymark-map waymark-collection-id-27 waymark-map-container"
  >
    <!-- Leaflet... -->
  </div>
</div>
```

This can be used to style a specific Collection by it’s ID:

```
Waymark collection_id="27"
```

```css
/* A particular Collection Shortcode */
.waymark-map.waymark-collection-id-27 {
  border: 10px solid green;
}
```

::map-demo{demo="styling-collection" height="640"}
::

### Map Hash

You can pass a unique `map_hash` Shortcode parameter, which will be added to the Shortcode container (as an ID, instead of a class name):

```
Waymark map_id="4028" map_hash="pink_me"
```

```css
/* Target using a unique Map Hash provided through the Shortcode */
#waymark-shortcode-pink_me {
  border: 10px solid pink;
}
```

::map-demo{demo="styling-map-hash" height="640"}
::

## Markers

Every Marker Type has a stable internal key, created when the Type is added. The key is used in CSS classes and Shortcodes, and it does not change when the display label is translated or edited. Each time the Marker is displayed on the Map, this key is added to the HTML for the Marker like this:

```html
<!-- Not just beer... waymark-marker-[your_type_key] -->
<div
  class="waymark-marker waymark-marker-beer waymark-marker-marker waymark-marker-medium"
>
  <div class="waymark-marker-background" style="background:#fbfbfb;"></div>

  <!-- Using the "beer" Ionic Font Icon -->
  <i
    style="color:#754423;"
    class="waymark-marker-icon waymark-icon-icon ion ion-beer"
  ></i>
</div>
```

```
Waymark collection_id="27" map_hash="beer_markers"
```

```css
/* Target by Overlay Type key */
#waymark-map-beer_markers .waymark-marker-beer {
  border: 10px solid orange;
  border-radius: 50%;
}
```

::map-demo{demo="styling-markers" height="640"}
::
