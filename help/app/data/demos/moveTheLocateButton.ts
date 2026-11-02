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
  onReady(waymark: Record<string, any>) {
    const jQuery = (window as any).jQuery;

    if (!jQuery) {
      return;
    }

    const locateButton = jQuery(
      ".leaflet-control-locate",
      waymark.jq_map_container,
    );
    const topLeftControl = jQuery(
      ".leaflet-top.leaflet-left",
      waymark.jq_map_container,
    );

    topLeftControl.append(locateButton);
  },
};

export default demo;
