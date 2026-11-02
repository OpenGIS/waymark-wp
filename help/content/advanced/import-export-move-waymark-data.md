---
title: Import/Export/Move Waymark Data
description: As Waymark uses the WordPress Custom Post Type system, it is possible to move Waymark data between WordPress sites.
---

::callout{type="warning" title="Back-Up!"}
Always perform a full back-up of your site before performing these steps.
::

## Maps

Waymark stores Maps as Custom Post Types (custom post type ID `waymark_map`). These can be exported using the inbuilt `WordPress > Admin > Tools > Import/Export` feature by selecting “Maps” from the Export list.

## Settings

To copy all of the Waymark Settings, copy the `Waymark_Settings` item from the following wp_options database table to your new database (after Waymark has been activated):

```sql
SELECT option_value
FROM wp_options
WHERE option_name = 'Waymark_Settings'
```

::callout{type="info" title="Note"}
Your database may be using a different wp_table prefix.
::

## Images

Images are stored in the Media Library and should also be able to be Imported/Exported using the `WordPress > Admin > Tools > Import/Export` feature.

However, as Waymark stores links to Images as URLs a search/replace on the WordPress `wp_postmeta` database table will need to be performed to update these:

```sql
UPDATE wp_postmeta
SET meta_value = replace(meta_value,'***OLD_SITE_URL***','***NEW_SITE_URL***')
WHERE meta_key = 'waymark_map_data';
```

::callout{type="info" title="Note"}
Your database may be using a different wp_ table prefix.
::
