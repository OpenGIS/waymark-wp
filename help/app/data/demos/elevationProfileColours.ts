import routeMap, { routeMapMeta } from "./routeMap";

const css = `.map-demo--elevation-profile-colours .elevation-control.elevation .axis text {
  fill: red !important;
}
.map-demo--elevation-profile-colours .elevation-control.elevation .axis path,
.map-demo--elevation-profile-colours .elevation-control.elevation .axis line {
  stroke: green !important;
}
.map-demo--elevation-profile-colours .elevation-control.elevation .grid .tick line {
  stroke: blue !important;
}
.map-demo--elevation-profile-colours .elevation-control.elevation .background {
  background-color: pink !important;
}
.map-demo--elevation-profile-colours .waymark-elevation .elevation-control.elevation .area {
  fill: purple !important;
}
.map-demo--elevation-profile-colours .waymark-elevation-container .elevation-control.elevation .area {
  stroke: orange !important;
}
.map-demo--elevation-profile-colours .elevation-polyline {
  filter: drop-shadow(1px 1px 0 orange) drop-shadow(-1px -1px 0 orange)
    drop-shadow(1px -1px 0 orange) drop-shadow(-1px 1px 0 orange);
}`;

const demo = {
  geojson: routeMap,
  meta: routeMapMeta,
  css,
  viewerOptions: {
    show_elevation: "1",
  },
};

export default demo;
