import routeMap, { routeMapMeta } from "./routeMap";

function addRefreshControl(waymark: Record<string, any>) {
  const jQuery = (window as any).jQuery;

  if (!jQuery) {
    return;
  }

  const container = jQuery(
    ".leaflet-bottom.leaflet-right",
    waymark.jq_map_container,
  );

  const button = jQuery("<div />")
    .addClass("waymark-refresh leaflet-bar leaflet-control")
    .html(
      '<a title="Reset Map"><span class="ion ion-android-refresh" style="cursor:pointer;margin-top:5px;font-size:20px"></span></a>',
    )
    .on("click", function () {
      waymark.reset_map_view();
    });

  container.prepend(button);
}

const demo = {
  geojson: routeMap,
  meta: routeMapMeta,
  globalCallback: addRefreshControl,
};

export default demo;
