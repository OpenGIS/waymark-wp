import routeMap, { routeMapMeta } from "./routeMap";

const demo = {
  geojson: routeMap,
  meta: routeMapMeta,
  typeVisibility: {
    marker: {
      hide: ["photo", "alert"],
    },
    line: {
      hide: ["green"],
    },
  },
};

export default demo;
