---
title: Using the Global Callback Function
description: Adding a “Refresh” button to the Map.
---

Clicking on the “Refresh” icon located bottom right of the Map will reset the Map’s view so all Overlays on the Map are visible.

::map-demo{demo="using-the-global-callback-function" height="640"}
::

To achieve this, we add the Waymark Shortcode to our page:

```
Waymark map_id="1647"
```

We then need to define the callback function, `waymark_loaded_callback`. This accepts a single argument, which is the Waymark Map instance. It will be called once the Map has loaded.

Once defined on your page (accessible in the global scope), we can use the instance object to perform additional actions. In this case, we are adding a button with a click event listener:

```js
//Our callback function
function waymark_loaded_callback(Waymark) {
  //Get the container
  let container = jQuery(
    ".leaflet-bottom.leaflet-right",
    Waymark.jq_map_container,
  );

  //Create a button
  let button = jQuery("<div />")
    .addClass("waymark-refresh leaflet-bar leaflet-control")
    .html(
      '<a title="Reset Map"><span class="ion ion-android-refresh" style="cursor:pointer;margin-top:5px;font-size:20px"></span></a>',
    )
    .on("click", function () {
      //Reset view when clicked
      Waymark.reset_map_view();
    });

  //Add to page
  container.prepend(button);
}
```
