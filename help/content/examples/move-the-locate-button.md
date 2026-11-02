---
title: Move the Locate Button
description: Use jQuery to move the locate button.
---

```
Waymark marker_centre="54.526814,-3.017289" marker_type="camp"
```

::map-demo{demo="move-the-locate-button" height="300"}
::

```js
// Once the page has loaded
jQuery(document).ready(function () {
  // Get the containers
  const shortcodes = jQuery(".waymark-shortcode");

  // Each
  shortcodes.each(function () {
    const shortcode = jQuery(this);
    const locateButton = jQuery(".leaflet-control-locate", shortcode);
    const topLeftControl = jQuery(".leaflet-top.leaflet-left", shortcode);

    // Move locate button to the top left corner
    topLeftControl.append(locateButton);
  });
});
```
