---
title: Documentation
description: Everything you need to build maps with Waymark for WordPress.
---

Guides, tutorials and examples for building maps with Waymark.

## Demo

:::map-demo{demo="home-demo" height="450"}
:::

## Getting Started

::video-grid
:::video-figure{src="/assets/video/getting-started.mp4" poster="/assets/video/posters/getting-started.jpg" caption="Getting Started" captions="/assets/video/captions/getting-started.en.vtt"}
:::
:::video-figure{src="/assets/video/using-the-editor.mp4" poster="/assets/video/posters/using-the-editor.jpg" caption="Using the Editor" captions="/assets/video/captions/using-the-editor.en.vtt"}
:::
:::video-figure{src="/assets/video/using-types.mp4" poster="/assets/video/posters/using-types.jpg" caption="Using Types" captions="/assets/video/captions/using-types.en.vtt"}
:::
:::video-figure{src="/assets/video/changing-basemaps.mp4" poster="/assets/video/posters/changing-basemaps.jpg" caption="Changing Basemaps" captions="/assets/video/captions/changing-basemaps.en.vtt"}
:::
:::video-figure{src="/assets/video/using-collections.mp4" poster="/assets/video/posters/using-collections.jpg" caption="Using Collections" captions="/assets/video/captions/using-collections.en.vtt"}
:::
:::video-figure{src="/assets/video/adding-map-meta.mp4" poster="/assets/video/posters/adding-map-meta.jpg" caption="Adding Map Meta" captions="/assets/video/captions/adding-map-meta.en.vtt"}
:::
::

## Shortcodes

The `[Waymark]` Shortcode can be passed the following parameters.

| Parameter          | Value              | Description                                                                                                                                                                                                                                                                                                                                                         |
| ------------------ | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `map_id`           | Map ID             | Display a single Map. You can create Maps (and obtain Map IDs) in _WP Admin > Waymark > Maps_.                                                                                                                                                                                                                                                                      |
| `collection_id`    | Collection ID      | Display all Maps in a Collection. You can create Collections (and obtain Collection IDs) in _WP Admin > Waymark > Collections_.                                                                                                                                                                                                                                     |
| `map_centre`       | Latitude,Longitude | The initial centre coordinates of the Map. By default Waymark centres the Map so all Data is visible.                                                                                                                                                                                                                                                               |
| `map_zoom`         | 0-18               | The initial zoom of the Map. By default Waymark zooms the Map so all Data is visible.                                                                                                                                                                                                                                                                               |
| `basemap`          | Basemap Name       | Which Basemap to display when the Map first loads (instead of the default). The value must match a Basemap Name listed in _Waymark Settings > Maps > Basemaps_.                                                                                                                                                                                                     |
| `map_height`       | Number of pixels   | Specify the desired height of the Map. The default can be changed in _Waymark Settings > Maps > Misc._                                                                                                                                                                                                                                                              |
| `map_width`        | Number of pixels   | Specify the desired width of the Map.                                                                                                                                                                                                                                                                                                                               |
| `shortcode_header` | 0 or 1             | Whether to display the Shortcode Header (if Meta exists for the Map). The default can be changed in _Waymark Settings > Maps > Shortcodes_                                                                                                                                                                                                                          |
| `show_gallery`     | 0 or 1             | Whether to display an image gallery for Markers that have images associated with them. The default can be changed in _Waymark Settings > Maps > Misc._                                                                                                                                                                                                              |
| `show_filter`      | 0 or 1             | Whether to display the Overlay Filter. This enables visitors to filter for which Markers, Lines and Shapes are currently visible on the Map. The default can be changed in _Waymark Settings > Maps > Misc._                                                                                                                                                        |
| `show_cluster`     | 0 or 1             | Whether to cluster (stack) Markers that are close together. The default can be changed in _Waymark Settings > Maps > Clustering_                                                                                                                                                                                                                                    |
| `show_elevation`   | 0 or 1             | Display an interactive elevation profile graph below the Map for Lines that have elevation data. The default can be changed in _Waymark Settings > Elevation_                                                                                                                                                                                                       |
| `map_hash`         | Alpha-numeric text | By default, Waymark adds a unique ID to the Shortcode HTML container like this: `waymark-shortcode-23a60b`. When you provide a Map Hash the ID will become: `waymark-shortcode-maphash`. This can be useful if you are adding multiple occurrences of the same Waymark Shortcode on a single page which will cause a “Map container is already initialized.” error. |
| `max_zoom`         | 1-18               | Providing a maximum zoom level will prevent the Map from being zoomed in further than this.                                                                                                                                                                                                                                                                         |
| `elevation_units`  | metric or imperial | This will override the Waymark > Elevation > Elevation Units option.                                                                                                                                                                                                                                                                                                |

## Tutorials

- [Creating Your First Map](/tutorials/creating-your-first-map/)
- [Drawing a Route](/tutorials/drawing-a-route/)

## Customising

- [Settings](/customising/settings/)
- [Markers](/customising/markers/)
- [Styling With CSS Selectors](/customising/styling-with-css-selectors/)

## Features

- [Submissions](/features/submissions/)

### Code Examples

- [Text Markers](/examples/text-markers/)
- [Show/Hide Types Initially](/examples/show-hide-types-initially/)
- [Hiding Map Controls](/examples/hiding-map-controls/)
- [Hide Locate Button](/examples/hide-locate-button/)
- [Move the Locate Button](/examples/move-the-locate-button/)
- [Marker Without Background](/examples/marker-without-background/)
- [Hide Tooltip Type Labels](/examples/hide-tooltip-type-labels/)
- [Elevation Profile Colours](/examples/elevation-profile-colours/)

## Advanced

- [Debug Mode](/advanced/debug-mode/)
- [Import/Export/Move Waymark Data](/advanced/import-export-move-waymark-data/)
- [Using the Global Callback Function](/advanced/using-the-global-callback-function/)

## User Examples

- [Association Franc-Comtoise du Chemin de Compostelle – eGuide](https://www.af-ccc.fr/eguide/)
- [Cres & Lošinj Trail – Lošinj Trail 2025](https://clt.remarkable.events/losinj-trail-en/)
- [hikingTICINO](https://www.hikingticino.com/wanderungen/category-wanderung/)
- [Horizontes – PT281](https://horizontes.pt/pt281/)
- [Iggy's Hikes – Staze na Medvednici](https://www.iggyshikes.com/staze-na-medvednici/)
- [Il Cammino del Lago Maggiore – Le 11 tappe](https://www.camminolagomaggiore.it/11-tappe-cammino-lago-maggiore/)
- [Merritt Mountain Bike Association – Iron Mountain](https://merrittbike.ca/our-trails/iron-mountain/)
- [The Island Walk – Island Walk Map](https://theislandwalk.ca/island-walk-map/)
- [Trekkaholic – Trekking al lago Bianco in Alpe Veglia](https://www.trekkaholic.it/piemonte/trekking-lago-bianco-alpe-veglia/)
- [Via Apsyrtides](https://viaapsyrtides.hr/stage-1/)
- [Zadar Archipelago – Interactive Map](https://zadar-archipelago.hr/interactive-map/)
- [Zagorje Outdoor – Konjička staza broj 10](https://zagorjeoutdoor.hr/sl/ride_staza/konjicka-staza-broj-10/)
