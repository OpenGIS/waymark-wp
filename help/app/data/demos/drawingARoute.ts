const drawingARoute = {
  viewerOptions: {
    show_gallery: 0,
  },
  geojson: {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {
          description:
            "type=green\ntitle=Our Walk\ndescription=<p>This is the route we took on our walk over the Thames.</p>",
        },
        geometry: {
          type: "LineString",
          coordinates: [
            [-0.078278, 51.50506],
            [-0.076131, 51.504286],
            [-0.074348, 51.507024],
            [-0.07263, 51.506717],
          ],
        },
      },
      {
        type: "Feature",
        properties: {
          description:
            'type=photo\nimage_thumbnail_url=/assets/img/1024px-Tower_Bridge_at_Dawn-450x450.jpg\nimage_medium_url=/assets/img/1024px-Tower_Bridge_at_Dawn-700x467.jpg\nimage_large_url=/assets/img/1024px-Tower_Bridge_at_Dawn.jpg\nimage_full_url=/assets/img/1024px-Tower_Bridge_at_Dawn.jpg\ndescription=<p><a href="https://commons.wikimedia.org/wiki/File:Tower_Bridge_at_Dawn.jpg">Fuzzypiggy</a>, <a href="https://creativecommons.org/licenses/by-sa/3.0">CC BY-SA 3.0</a>, via Wikimedia Commons</p>\ntitle=Tower Bridge',
        },
        geometry: {
          type: "Point",
          coordinates: [-0.075341, 51.505538],
        },
      },
    ],
  },
};

export default drawingARoute;
