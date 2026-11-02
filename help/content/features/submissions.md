---
title: Submissions
description: Allow registered users, or guests to create Maps from the front-end of your site.
---

You can control who can Submit Maps, what editor features are available and whether submissions should be approved before they are published.

## Editor Features

The full Editor and Meta inputs are available.

### Drawing

Drawing tools for Markers, Lines and Shapes. Each can be given a title, description, image and Type.

Types can be enabled for Submissions individually in <em>Settings &gt; [Markers/Lines/Shapes]</em>.

### Image Upload

Uploaded images are added to the WordPress Media Library and location meta data will be used if detected (EXIF).

Images uploaded by guests can be stored separately from other Media Library uploads, to aid with moderation. If enabled, images uploaded by guests will be stored in a single directory found in the upload root (i.e. uploads/waymark_submission).

### Read from File

GPX, KML and GeoJSON supported. Reading from file does not keep a copy of the file on the server.

### Title

Allows the Map title to be set during Submission. If disabled a random title will be generated.

### Meta

Submissions support Meta. Whether an individual Meta input is displayed can be set in <em>Settings &gt; Meta</em>.

::submission-demo
::

## Settings

Submissions can be enabled and configured in <em> Settings &gt; Submissions. </em>

Submissions can either by accepted from registered users (selectable by role) only, or publicly (i.e. no account necessary).

Settings are available for user submissions and public submissions separately.

::docs-figure{src="/assets/img/Screen-Shot-2021-11-08-at-1.54.52-PM-656x1024.png" srcset="/assets/img/Screen-Shot-2021-11-08-at-1.54.52-PM-656x1024.png 656w, /assets/img/Screen-Shot-2021-11-08-at-1.54.52-PM-448x700.png 448w, /assets/img/Screen-Shot-2021-11-08-at-1.54.52-PM-768x1199.png 768w, /assets/img/Screen-Shot-2021-11-08-at-1.54.52-PM-983x1536.png 983w, /assets/img/Screen-Shot-2021-11-08-at-1.54.52-PM.png 1100w" alt="" sizes="(max-width: 656px) 100vw, 656px" :width="656" :height="1024"}
::

---

## Add to Your Site

Display using the Waymark Shortcode.

```
Waymark content="submission"
```

## Feedback

This feature was a large undertaking, so please let me know what you think by…

- Creating a new [support topic](https://wordpress.org/support/plugin/waymark/#new-topic-0) on the WordPress plugin directory.
- Creating a [GitHub issue](https://github.com/OpenGIS/waymark-wp/issues/new).
