---
title: Text Markers
---

## Marker Settings

::docs-figure{src="/assets/img/Screenshot-2025-06-27-at-10.48.22%20AM-700x587.png" srcset="/assets/img/Screenshot-2025-06-27-at-10.48.22%20AM-700x587.png 700w, /assets/img/Screenshot-2025-06-27-at-10.48.22%20AM-1024x858.png 1024w, /assets/img/Screenshot-2025-06-27-at-10.48.22%20AM-768x644.png 768w, /assets/img/Screenshot-2025-06-27-at-10.48.22%20AM.png 1062w" alt="" sizes="(max-width: 700px) 100vw, 700px" :width="700" :height="587" class="text-markers-screenshot"}
::

```
Waymark map_id="4697"
```

::map-demo{demo="text-markers" height="640"}
::

## CSS Rules

```css
/* All Rectangle Markers */
.waymark-marker-rectangle {
  width: max-content !important;
}
.waymark-marker-rectangle .waymark-marker-background {
  width: 100% !important;
}
.waymark-marker-rectangle .waymark-marker-icon {
  padding: 0 5px !important;
}
```
