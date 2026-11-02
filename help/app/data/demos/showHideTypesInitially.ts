import { demoGeoJson } from "./fixtures";

const demo = {
  geojson: demoGeoJson,
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
