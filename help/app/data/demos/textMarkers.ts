import { textMarkerGeoJson } from "./fixtures";

export const textMarkersCss = `.map-demo--text-markers .waymark-marker-rectangle {
  width: max-content !important;
}
.map-demo--text-markers .waymark-marker-rectangle .waymark-marker-background {
  width: 100% !important;
}
.map-demo--text-markers .waymark-marker-rectangle .waymark-marker-icon {
  padding: 0 5px !important;
}`;

const demo = {
  geojson: textMarkerGeoJson,
  css: textMarkersCss,
};

export default demo;
