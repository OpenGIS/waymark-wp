const creatingYourFirstMap = {
  viewerOptions: {
    show_gallery: 0,
  },
  geojson: {
    type: "FeatureCollection",
    features: [
      {
        geometry: {
          type: "Point",
          coordinates: [-0.075341, 51.505538],
        },
        type: "Feature",
        properties: {
          type: "photo",
          title: "Tower Bridge",
          description:
            '<p><a href="https://commons.wikimedia.org/wiki/File:Tower_Bridge_at_Dawn.jpg">Fuzzypiggy</a>, <a href="https://creativecommons.org/licenses/by-sa/3.0">CC BY-SA 3.0</a>, via Wikimedia Commons</p>',
          image_thumbnail_url:
            "/assets/img/1024px-Tower_Bridge_at_Dawn-450x450.jpg",
          image_medium_url:
            "/assets/img/1024px-Tower_Bridge_at_Dawn-700x467.jpg",
          image_large_url: "/assets/img/1024px-Tower_Bridge_at_Dawn.jpg",
          image_full_url: "/assets/img/1024px-Tower_Bridge_at_Dawn.jpg",
        },
      },
    ],
  },
};

export default creatingYourFirstMap;
