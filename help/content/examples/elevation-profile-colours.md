---
title: Elevation Profile Colours
description: You can adjust the elevation profile colours with CSS.
---

Ensure the elevation profile is set to display; either in [Settings](/customising/settings/), or through the Shortcode:

```
Waymark map_id="1647" show_elevation="1"
```

The following CSS illustrates how to target different elements:

```css
div.waymark-container .elevation-control.elevation .axis text {
  fill: red !important;
}
div.waymark-container .elevation-control.elevation .axis path,
div.waymark-container .elevation-control.elevation .axis line {
  stroke: green !important;
}
div.waymark-container .elevation-control.elevation .grid .tick line {
  stroke: blue !important;
}
div.waymark-container .elevation-control.elevation .background {
  background-color: pink !important;
}
div.waymark-container .waymark-elevation .elevation-control.elevation .area {
  fill: purple !important;
}
div.waymark-elevation-container .elevation-control.elevation .area {
  stroke: orange !important;
}
```

Lines with active Elevation Profiles have a white border around them, this is white by default and can be changed like so:

```css
div.waymark-container .elevation-polyline {
  filter: drop-shadow(1px 1px 0 orange) drop-shadow(-1px -1px 0 orange)
    drop-shadow(1px -1px 0 orange) drop-shadow(-1px 1px 0 orange);
}
```

::map-demo{demo="elevation-profile-colours" height="640"}
::
