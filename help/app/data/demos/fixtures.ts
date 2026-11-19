import publishedGeoJsonRaw from "~~/public/assets/geo/port-hardy-to-cape-scott.geojson?raw";

const publishedGeoJson: Record<string, any> = JSON.parse(publishedGeoJsonRaw);
const publishedFeatures: Record<string, any>[] = publishedGeoJson.features;

const isRoute = (feature: Record<string, any>) =>
  feature.geometry?.type === "LineString";

const routeFeatures: Record<string, any>[] = publishedFeatures.filter(isRoute);
const publishedMarkers: Record<string, any>[] = publishedFeatures.filter(
  (feature) => !isRoute(feature),
);

const markerByTitle = (title: string): Record<string, any> => {
  const marker = publishedMarkers.find(
    (feature) => feature.properties?.title === title,
  );

  if (!marker) {
    throw new Error(`Missing published marker: ${title}`);
  }

  return marker;
};

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

const routeGeoJson: Record<string, any> = {
  type: "FeatureCollection",
  features: routeFeatures,
};

const demoGeoJson: Record<string, any> = publishedGeoJson;

const markersGeoJson: Record<string, any> = {
  type: "FeatureCollection",
  features: [...routeFeatures, ...publishedMarkers, testMarker, waymarkMarker],
};

const stylingGeoJson: Record<string, any> = {
  type: "FeatureCollection",
  features: [
    ...routeFeatures,
    markerByTitle("Harbour Café"),
    markerByTitle("The Old Inn"),
    thirdBeerMarker,
    markerByTitle("Lighthouse"),
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
