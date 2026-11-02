---
title: Marker Without Background
---

```
Waymark marker_centre="54.526814,-3.017289" marker_type="camp"
```

::map-demo{demo="marker-without-background" height="300"}
::

```css
/* Hide Background */
.waymark-marker-camp .waymark-marker-background {
  display: none !important;
}

/* Change Icon Colour */
.waymark-marker-camp .waymark-marker-icon {
  color: #a43233 !important;
}

/* Increase Icon Size */
.waymark-marker-camp .waymark-marker-icon::before {
  font-size: 20px !important;
}
```
