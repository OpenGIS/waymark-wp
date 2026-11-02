const demo = {
  geojson: {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {
          type: "camp",
          title: "Marker with no Type label!",
        },
        geometry: {
          type: "Point",
          coordinates: ["-3.017289", "54.526814"],
        },
      },
    ],
  },
  css: `.map-demo--hide-tooltip-type-labels .leaflet-tooltip-pane .waymark-type-label {
  display: none;
}`,
};

export default demo;
