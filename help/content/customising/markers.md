---
title: Markers
description: Learn how Waymark Markers are displayed, including icons, markup and CSS customisation.
---

::video-figure{src="/assets/video/markers.mp4" poster="/assets/video/posters/markers.jpg" label="Waymark - Markers" captions="/assets/video/captions/markers.en.vtt"}
::

---

## Example

::map-demo{demo="markers" height="640"}
::

---

## Icons

Every Marker Type can have a unique Icon associated with it, specified as either:

- **Text** – plain alpha-numeric characters. Remember space is very limited! Text will be displayed in the chosen colour.
- **Font** – Choose from a list of [Ion Icons](https://ionic.io/ionicons/v2/cheatsheet.html) or [Font Awesome](https://fontawesome.com/v4.7/cheatsheet/) icons by providing the relevant class name, such as “ion-alert” or “fa-bolt”. The icon will be displayed in the chosen colour.
- **HTML** – Supports custom HTML content, these can be simple [HTML characters](https://html.spec.whatwg.org/multipage/named-characters.html) (e.g. “&amp;bigstar;”), [Unicode symbols](https://symbl.cc/en/) (e.g. “&amp;#9889;”) or more complicated structures. For example you can use this option to specify custom images like so:

```html
<img
  src="https://example.com/waymark-icon.png"
  style="width:24px;height:24px;margin-top:5px"
/>
```

Where the URL points to your desired image. You can adjust the width, height and vertical offset by modifying the style properties as desired. You can see an example of this in the [Text Markers](/examples/text-markers/) guide.

## Markup

```html
<!-- "Photo" Marker with Font Icon -->
<div
  class="waymark-marker waymark-marker-photo waymark-marker-circle waymark-marker-small"
>
  <div class="waymark-marker-background" style="background:#70af00;"></div>
  <i
    style="color:#ffffff;"
    class="waymark-marker-icon waymark-icon-icon ion ion-camera"
  ></i>
</div>

<!-- "Bank" Marker with Text Icon -->
<div
  class="waymark-marker waymark-marker-bank waymark-marker-rectangle waymark-marker-large"
>
  <div class="waymark-marker-background" style="background:#000;"></div>
  <div style="color:#ffffff;" class="waymark-marker-icon waymark-icon-text">
    &dollar;
  </div>
</div>

<!-- "Beer" Marker with HTML Icon -->
<div
  class="waymark-marker waymark-marker-beer waymark-marker-marker waymark-marker-medium"
>
  <div class="waymark-marker-background" style="background:#fbfbfb;"></div>
  <div class="waymark-marker-icon waymark-icon-html">
    <!-- HTML Input goes here -->
    &#127866;
  </div>
</div>
```

---

## CSS

All Icon content can be modified using CSS.

```css
/* Adjust Ionic Icon size */
.waymark-marker .waymark-icon-icon.ion::before {
  font-size: 18px !important;
}
/* Adjust Font Awesome Icon size */
.waymark-marker .waymark-icon-icon.fa::before {
  font-size: 18px !important;
}
/* Adjust "Photo" Marker Icon size */
.waymark-marker-photo .waymark-icon-icon.ion::before {
  font-size: 18px !important;
}
/* Add a border to all Circle Markers */
.waymark-marker-circle .waymark-marker-background {
  border: 1px solid #000 !important;
}
/* Adjust Text Icon size */
.waymark-marker .waymark-icon-text {
  font-size: 18px !important;
}
/* Adjust only "Photo" Marker Text Icon size */
.waymark-marker-photo .waymark-icon-text {
  font-size: 18px !important;
}
```

Use your browser’s inspector to dig for Type class names (more info here ).
