const routeGeoJson: Record<string, any> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        type: "green",
        title: "Coastal Route",
        image_large_url: "/assets/img/UNADJUSTEDNONRAW_thumb_15b3-1024x683.jpg",
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [-127.490044, 50.722499, 6.1692],
          [-127.48996, 50.722377, 7.1844],
          [-127.501465, 50.719707, 37.409785],
          [-127.494706, 50.709003, 46.205591],
          [-127.501252, 50.703929, 71.6696],
          [-127.5075, 50.705963, 98.5332],
          [-127.515473, 50.707054, 111.6168],
          [-127.522843, 50.706909, 106.402321],
          [-127.529084, 50.706172, 124.904],
          [-127.538392, 50.706951, 153.624831],
          [-127.56617, 50.707614, 225.9616],
          [-127.592232, 50.711753, 252.49748],
          [-127.616036, 50.70618, 287.211341],
          [-127.632233, 50.702014, 328.234347],
          [-127.643227, 50.700073, 319.462],
          [-127.658722, 50.701271, 332.4244],
          [-127.681191, 50.699935, 331.741902],
          [-127.703034, 50.702693, 336.723367],
          [-127.727105, 50.702068, 297.8668],
          [-127.747864, 50.700134, 301.319337],
          [-127.768166, 50.695793, 259.8384],
          [-127.787728, 50.696575, 229.512592],
          [-127.797646, 50.695388, 221.443684],
          [-127.826592, 50.700431, 217.17628],
          [-127.861825, 50.70354, 225.54192],
          [-127.882279, 50.703491, 242.5708],
          [-127.896401, 50.708847, 307.049025],
          [-127.906479, 50.706424, 302.633804],
          [-127.919503, 50.699317, 279.6244],
          [-127.935647, 50.691577, 263.173868],
          [-127.949013, 50.688556, 285.443755],
          [-127.960312, 50.682987, 245.673606],
          [-127.972184, 50.679122, 192.676],
          [-127.990235, 50.679363, 141.526447],
          [-128.004456, 50.684394, 139.554936],
          [-128.008683, 50.674041, 152.221438],
          [-128.013413, 50.66698, 141.4812],
          [-128.01413, 50.661819, 70.529989],
          [-128.014588, 50.657245, 46.054445],
          [-128.013047, 50.65562, 17.778],
          [-128.025315, 50.660713, 15.5668],
          [-128.052063, 50.662647, 21.814275],
          [-128.081803, 50.672645, 72.278602],
          [-128.113877, 50.67852, 76.485162],
          [-128.150498, 50.668865, 39.2744],
          [-128.189789, 50.670688, 22.4768],
          [-128.207703, 50.682876, 36.9392],
          [-128.228486, 50.685787, 33.2836],
          [-128.244385, 50.685283, 22.0752],
          [-128.257538, 50.685497, 32.601163],
          [-128.262635, 50.698856, 89.477827],
          [-128.277543, 50.712783, 95.14898],
          [-128.304795, 50.731555, 64.370676],
          [-128.305573, 50.747241, 50.869045],
          [-128.30922, 50.762599, 48.8356],
          [-128.31041, 50.777851, 61.572],
          [-128.335907, 50.777832, 2.8048],
          [-128.35112, 50.781803, 24.373706],
          [-128.37114, 50.784297, 31.208],
          [-128.374604, 50.78458, 51.5744],
          [-128.385376, 50.782543, 35.031875],
          [-128.39914, 50.774585, 12.361424],
          [-128.418366, 50.771335, 36.3768],
          [-128.427887, 50.776737, 30.953684],
          [-128.427659, 50.777851, 37.5916],
          [-128.425431, 50.782047, 56.1076],
        ],
      },
    },
  ],
};

const demoFeatures: Record<string, any>[] = [
  {
    geometry: {
      type: "Point",
      coordinates: [-127.497046, 50.720265],
    },
    type: "Feature",
    properties: {
      title: "Fish & Chips",
      type: "food",
    },
  },
  {
    geometry: {
      type: "Point",
      coordinates: [-127.490137, 50.722642],
    },
    type: "Feature",
    properties: {
      title: "Harbour Café",
      type: "beer",
    },
  },
  {
    geometry: {
      type: "Point",
      coordinates: [-127.49136, 50.703742],
    },
    type: "Feature",
    properties: {
      title: "Road Closed",
      type: "alert",
      image_thumbnail_url:
        "/assets/img/UNADJUSTEDNONRAW_thumb_15b9-150x150.jpg",
      image_medium_url: "/assets/img/UNADJUSTEDNONRAW_thumb_15b9-300x200.jpg",
      image_large_url: "/assets/img/UNADJUSTEDNONRAW_thumb_15b9-1024x683.jpg",
      description: "Active forestry road. Proceed with caution.",
    },
  },
  {
    geometry: {
      type: "Point",
      coordinates: [-128.009734, 50.6558],
    },
    type: "Feature",
    properties: {
      title: "The Old Inn",
      type: "beer",
      image_thumbnail_url:
        "/assets/img/49ECEB41-21DB-48D9-BCC0-FFA7FCD56448_1_105_c-450x450.jpeg",
      image_medium_url:
        "/assets/img/49ECEB41-21DB-48D9-BCC0-FFA7FCD56448_1_105_c-300x225.jpeg",
      image_large_url:
        "/assets/img/49ECEB41-21DB-48D9-BCC0-FFA7FCD56448_1_105_c.jpeg",
      description: "Good food and drink after a long day out.",
    },
  },
  {
    geometry: {
      type: "Point",
      coordinates: [-127.865839, 50.704503],
    },
    type: "Feature",
    properties: {
      title: "Cliff Camp",
      type: "camp",
      image_thumbnail_url:
        "/assets/img/UNADJUSTEDNONRAW_thumb_14db-150x150.jpg",
      image_medium_url: "/assets/img/UNADJUSTEDNONRAW_thumb_14db-300x224.jpg",
      image_large_url: "/assets/img/UNADJUSTEDNONRAW_thumb_14db-1024x766.jpg",
    },
  },
  {
    geometry: {
      type: "Point",
      coordinates: [-127.73941, 50.702546],
    },
    type: "Feature",
    properties: {
      title: "Old Cairn",
      type: "photo",
      image_thumbnail_url:
        "/assets/img/UNADJUSTEDNONRAW_thumb_15a3-150x150.jpg",
      image_medium_url: "/assets/img/UNADJUSTEDNONRAW_thumb_15a3-300x200.jpg",
      image_large_url: "/assets/img/UNADJUSTEDNONRAW_thumb_15a3-1024x683.jpg",
    },
  },
  {
    geometry: {
      type: "Point",
      coordinates: [-128.072176, 50.666553],
    },
    type: "Feature",
    properties: {
      title: "Landslip",
      type: "alert",
      description: "Track blocked. Use the marked diversion.",
    },
  },
  {
    geometry: {
      type: "Point",
      coordinates: [-128.250425, 50.685576],
    },
    type: "Feature",
    properties: {
      title: "Trailhead",
      type: "information",
      description: "Foot access only beyond this point.",
    },
  },
  {
    geometry: {
      type: "Point",
      coordinates: [-128.274522, 50.673944],
    },
    type: "Feature",
    properties: {
      title: "Sandy Bay",
      type: "photo",
      image_thumbnail_url:
        "/assets/img/UNADJUSTEDNONRAW_thumb_15e1-150x150.jpg",
      image_medium_url: "/assets/img/UNADJUSTEDNONRAW_thumb_15e1-300x200.jpg",
      image_large_url: "/assets/img/UNADJUSTEDNONRAW_thumb_15e1-1024x683.jpg",
    },
  },
  {
    geometry: {
      type: "Point",
      coordinates: [-128.013468, 50.656086],
    },
    type: "Feature",
    properties: {
      title: "Viewpoint",
      type: "photo",
      image_thumbnail_url:
        "/assets/img/9F43CC56-C8E1-49F2-93D8-A62E69AB4A4A-700x525.jpeg",
      image_medium_url:
        "/assets/img/9F43CC56-C8E1-49F2-93D8-A62E69AB4A4A-768x576.jpeg",
      image_large_url:
        "/assets/img/9F43CC56-C8E1-49F2-93D8-A62E69AB4A4A-1024x768.jpeg",
    },
  },
  {
    geometry: {
      type: "Point",
      coordinates: [-128.425455, 50.782008],
    },
    type: "Feature",
    properties: {
      title: "Lighthouse",
      type: "photo",
      image_thumbnail_url:
        "/assets/img/BF4ECCB4-10AD-4B31-80B2-FED86215FB85_1_105_c-450x450.jpeg",
      image_medium_url:
        "/assets/img/BF4ECCB4-10AD-4B31-80B2-FED86215FB85_1_105_c-300x225.jpeg",
      image_large_url:
        "/assets/img/BF4ECCB4-10AD-4B31-80B2-FED86215FB85_1_105_c.jpeg",
    },
  },
  {
    geometry: {
      type: "Point",
      coordinates: [-128.36134, 50.783908],
    },
    type: "Feature",
    properties: {
      title: "Wildlife",
      type: "photo",
      image_thumbnail_url:
        "/assets/img/A2301CA1-5C06-4FB3-A85D-304682727C30_1_105_c-450x450.jpeg",
      image_medium_url:
        "/assets/img/A2301CA1-5C06-4FB3-A85D-304682727C30_1_105_c-300x225.jpeg",
      image_large_url:
        "/assets/img/A2301CA1-5C06-4FB3-A85D-304682727C30_1_105_c.jpeg",
    },
  },
  {
    geometry: {
      type: "Point",
      coordinates: [-127.844853, 50.702166],
    },
    type: "Feature",
    properties: {
      title: "Still Lake",
      type: "photo",
      image_thumbnail_url:
        "/assets/img/UNADJUSTEDNONRAW_thumb_16e9-150x150.jpg",
      image_medium_url: "/assets/img/UNADJUSTEDNONRAW_thumb_16e9-300x200.jpg",
      image_large_url: "/assets/img/UNADJUSTEDNONRAW_thumb_16e9-1024x683.jpg",
    },
  },
];

const testMarker: Record<string, any> = {
  geometry: {
    type: "Point",
    coordinates: [-127.56617, 50.707614, 225.9616],
  },
  type: "Feature",
  properties: {
    title: "Text Marker",
    type: "test",
  },
};

const waymarkMarker: Record<string, any> = {
  geometry: {
    type: "Point",
    coordinates: [-127.990235, 50.679363, 141.526447],
  },
  type: "Feature",
  properties: {
    title: "Waymark",
    type: "waymark",
  },
};

const thirdBeerMarker: Record<string, any> = {
  geometry: {
    type: "Point",
    coordinates: [-127.865839, 50.704503],
  },
  type: "Feature",
  properties: {
    title: "The Boathouse",
    type: "beer",
    image_thumbnail_url: "/assets/img/UNADJUSTEDNONRAW_thumb_14db-150x150.jpg",
    image_medium_url: "/assets/img/UNADJUSTEDNONRAW_thumb_14db-300x224.jpg",
    image_large_url: "/assets/img/UNADJUSTEDNONRAW_thumb_14db-1024x766.jpg",
  },
};

const demoGeoJson: Record<string, any> = {
  type: "FeatureCollection",
  features: [routeGeoJson.features[0], ...demoFeatures],
};

const markersGeoJson: Record<string, any> = {
  type: "FeatureCollection",
  features: [
    routeGeoJson.features[0],
    ...demoFeatures,
    testMarker,
    waymarkMarker,
  ],
};

const stylingGeoJson: Record<string, any> = {
  type: "FeatureCollection",
  features: [
    routeGeoJson.features[0],
    demoFeatures[1],
    demoFeatures[3],
    thirdBeerMarker,
    demoFeatures[10],
  ],
};

const textMarkerGeoJson: Record<string, any> = {
  type: "FeatureCollection",
  features: [testMarker],
};

export {
  routeGeoJson,
  demoGeoJson,
  markersGeoJson,
  stylingGeoJson,
  textMarkerGeoJson,
};
