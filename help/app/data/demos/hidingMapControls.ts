const demo = {
  geojson: {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { type: "camp" },
        geometry: {
          type: "Point",
          coordinates: ["-3.017289", "54.526814"],
        },
      },
    ],
  },
  css: `.map-demo--hiding-map-controls .waymark-map .leaflet-control-locate,
.map-demo--hiding-map-controls .waymark-map .leaflet-control-layers,
.map-demo--hiding-map-controls .waymark-map .leaflet-control-fullscreen,
.map-demo--hiding-map-controls .waymark-map .leaflet-control-zoom {
  display: none;
}`,
};

export default demo;
