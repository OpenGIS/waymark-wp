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
  css: `.map-demo--marker-without-background .waymark-marker-camp .waymark-marker-background {
  display: none !important;
}
.map-demo--marker-without-background .waymark-marker-camp .waymark-marker-icon {
  color: #a43233 !important;
}
.map-demo--marker-without-background .waymark-marker-camp .waymark-marker-icon::before {
  font-size: 20px !important;
}`,
};

export default demo;
