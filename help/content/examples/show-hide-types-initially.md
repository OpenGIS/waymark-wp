---
title: Show/Hide Types Initially
---

Individual Overlay Types can now be Shown/Hidden initially using the Shortcode, overriding the “Show Initially” Setting for each. Use the `hide_marker`, `show_marker`, `hide_line`, `show_line`, `hide_shape`, `show_shape` Shortcode parameters, providing one or multiple (comma separated) Type Keys. For example:

::callout{type="info" title="Note"}
Type Keys are stable internal identifiers, not translated labels. Translating or editing a Type label does not change its key.
::

```
Waymark map_id="1647" hide_marker="photo,alert" hide_line="green"
```

::map-demo{demo="show-hide-types-initially" height="640"}
::
