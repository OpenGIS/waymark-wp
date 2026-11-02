---
title: Hiding Map Controls
description: 'Waymark’s Map Interface is built using <a href="https://leafletjs.com/">Leaflet JS</a>.'
---

Controls can be hidden using CSS rules.

```
Waymark marker_centre="54.526814,-3.017289" marker_type="camp"
```

::map-demo{demo="hiding-map-controls" height="300"}
::

```css
/* This will hide the Controls on *all* Maps */
.waymark-map .leaflet-control-locate,
.waymark-map .leaflet-control-layers,
.waymark-map .leaflet-control-fullscreen,
.waymark-map .leaflet-control-zoom {
  display: none;
}
```
