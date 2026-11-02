<script setup lang="ts">
import creatingYourFirstMap from "~/data/demos/creatingYourFirstMap";
import drawingARoute from "~/data/demos/drawingARoute";
import elevationProfileColours from "~/data/demos/elevationProfileColours";
import hideLocateButton from "~/data/demos/hideLocateButton";
import hideTooltipTypeLabels from "~/data/demos/hideTooltipTypeLabels";
import hidingMapControls from "~/data/demos/hidingMapControls";
import homeDemo from "~/data/demos/homeDemo";
import markerWithoutBackground from "~/data/demos/markerWithoutBackground";
import markers from "~/data/demos/markers";
import moveTheLocateButton from "~/data/demos/moveTheLocateButton";
import showHideTypesInitially from "~/data/demos/showHideTypesInitially";
import stylingCollection from "~/data/demos/stylingCollection";
import stylingMapHash from "~/data/demos/stylingMapHash";
import stylingMapId from "~/data/demos/stylingMapId";
import stylingMarkers from "~/data/demos/stylingMarkers";
import textMarkers from "~/data/demos/textMarkers";
import usingTheGlobalCallbackFunction from "~/data/demos/usingTheGlobalCallbackFunction";
import waymarkUserConfig from "~/data/waymarkUserConfig";

const props = withDefaults(
  defineProps<{
    demo: string;
    height?: number;
  }>(),
  {
    height: 300,
  },
);

interface TypeVisibility {
  marker?: { hide?: string[] };
  line?: { hide?: string[] };
  shape?: { hide?: string[] };
}

interface DemoEntry {
  geojson: Record<string, any>;
  viewerOptions?: Record<string, any>;
  mapOptions?: Record<string, any>;
  mapId?: string;
  wrapperId?: string;
  canvasClass?: string;
  meta?: Record<string, any>;
  css?: string;
  typeVisibility?: TypeVisibility;
  onReady?: (viewer: Record<string, any>) => void;
  globalCallback?: (viewer: Record<string, any>) => void;
}

const demoData: Record<string, DemoEntry> = {
  "home-demo": {
    ...homeDemo,
    mapId: "waymark-map-dc9b1d",
    wrapperId: "waymark-shortcode-dc9b1d",
    canvasClass: "waymark-map waymark-map-id-1647",
  },
  "hide-locate-button": { geojson: hideLocateButton },
  "hide-tooltip-type-labels": {
    ...hideTooltipTypeLabels,
    mapId: "waymark-map-222f85",
    wrapperId: "waymark-shortcode-222f85",
    canvasClass: "waymark-map",
  },
  "hiding-map-controls": {
    ...hidingMapControls,
    mapId: "waymark-map-1a1f22",
    wrapperId: "waymark-shortcode-1a1f22",
    canvasClass: "waymark-map",
  },
  "marker-without-background": {
    ...markerWithoutBackground,
    mapId: "waymark-map-1a1f22",
    wrapperId: "waymark-shortcode-1a1f22",
    canvasClass: "waymark-map",
  },
  "move-the-locate-button": {
    ...moveTheLocateButton,
    mapId: "waymark-map-1a1f22",
    wrapperId: "waymark-shortcode-1a1f22",
    canvasClass: "waymark-map",
  },
  "elevation-profile-colours": {
    ...elevationProfileColours,
    mapId: "waymark-map-77a2a7",
    wrapperId: "waymark-shortcode-77a2a7",
    canvasClass: "waymark-map waymark-map-id-1647",
  },
  "show-hide-types-initially": {
    ...showHideTypesInitially,
    mapId: "waymark-map-5152f8",
    wrapperId: "waymark-shortcode-5152f8",
    canvasClass: "waymark-map waymark-map-id-1647",
  },
  "text-markers": {
    ...textMarkers,
    mapId: "waymark-map-272e79",
    wrapperId: "waymark-shortcode-272e79",
    canvasClass: "waymark-map waymark-map-id-4697",
  },
  "using-the-global-callback-function": {
    ...usingTheGlobalCallbackFunction,
    mapId: "waymark-map-068d7c",
    wrapperId: "waymark-shortcode-068d7c",
    canvasClass: "waymark-map waymark-map-id-1647",
  },
  "creating-your-first-map": creatingYourFirstMap,
  "drawing-a-route": drawingARoute,
  markers: {
    geojson: markers,
    mapId: "waymark-map-7cd5bb",
    wrapperId: "waymark-shortcode-7cd5bb",
    canvasClass: "waymark-map",
  },
  "styling-map-id": {
    geojson: stylingMapId,
    mapId: "waymark-map-8dfee3",
    wrapperId: "waymark-shortcode-8dfee3",
    canvasClass: "waymark-map waymark-map-id-4028",
  },
  "styling-collection": {
    geojson: stylingCollection,
    viewerOptions: { show_gallery: 0 },
    mapId: "waymark-map-ff12a2",
    wrapperId: "waymark-shortcode-ff12a2",
    canvasClass: "waymark-map waymark-collection-id-27",
  },
  "styling-map-hash": {
    geojson: stylingMapHash,
    viewerOptions: { show_gallery: 0 },
    mapId: "waymark-map-pink_me",
    wrapperId: "waymark-shortcode-pink_me",
    canvasClass: "waymark-map waymark-map-id-4028",
  },
  "styling-markers": {
    geojson: stylingMarkers,
    viewerOptions: { show_gallery: 0 },
    mapId: "waymark-map-beer_markers",
    wrapperId: "waymark-shortcode-beer_markers",
    canvasClass: "waymark-map waymark-map-id-4028",
  },
};

const baseURL = useRuntimeConfig().app.baseURL;
const resolvedDemoData = resolveAssetStrings(demoData, baseURL);

const demoEntry = computed(() => resolvedDemoData[props.demo]);
const generatedMapId = `waymark-map-${useId()}`;
const mapId = computed(() => demoEntry.value?.mapId ?? generatedMapId);
const showElevation = computed(() =>
  Boolean(demoEntry.value?.viewerOptions?.show_elevation),
);
const elevationId = computed(() => {
  if (!showElevation.value) {
    return null;
  }

  return mapId.value.replace("waymark-map-", "waymark-elevation-");
});
const status = ref<"loading" | "ready" | "error">("loading");

let viewer: Record<string, any> | null = null;
let pollTimer: ReturnType<typeof setTimeout> | null = null;
let disposed = false;

function waitForFactory(): Promise<Record<string, any>> {
  return new Promise((resolve, reject) => {
    const startedAt = Date.now();

    const check = () => {
      if (disposed) {
        return;
      }

      const factory = (window as any).Waymark_Map_Factory;

      if (factory) {
        resolve(factory);
        return;
      }

      if (Date.now() - startedAt > 15000) {
        reject(new Error("The Waymark map library did not load."));
        return;
      }

      pollTimer = setTimeout(check, 100);
    };

    check();
  });
}

onMounted(async () => {
  await nextTick();

  try {
    const factory = await waitForFactory();

    if (disposed) {
      return;
    }

    const demo = resolvedDemoData[props.demo];

    if (!demo) {
      throw new Error(`Unknown map demo: ${props.demo}`);
    }

    const config = resolveAssetStrings(
      JSON.parse(JSON.stringify(waymarkUserConfig)),
      baseURL,
    );
    Object.assign(config.map_options, demo.mapOptions ?? {});
    config.map_options.map_div_id = mapId.value;
    config.map_options.map_height = props.height;
    Object.assign(config.viewer_options, demo.viewerOptions ?? {});

    if (elevationId.value) {
      config.viewer_options.elevation_div_id = elevationId.value;
    }

    const instance = factory.viewer();

    if (!instance) {
      throw new Error("The Waymark viewer could not be created.");
    }

    applyTypeVisibility(instance, config, demo.typeVisibility);

    if (demo.globalCallback) {
      (window as any).waymark_loaded_callback = demo.globalCallback;
    }

    viewer = instance;
    instance.init(config);
    instance.load_json(JSON.parse(JSON.stringify(demo.geojson)));
    instance.load_done();
    demo.onReady?.(instance);

    status.value = "ready";
  } catch (error) {
    status.value = "error";
    console.error(error);
  }
});

function applyTypeVisibility(
  instance: Record<string, any>,
  config: Record<string, any>,
  visibility?: TypeVisibility,
) {
  const apply = (
    types: Record<string, any>[] | undefined,
    titleKey: string,
    displayKey: string,
    hidden: string[] | undefined,
  ) => {
    if (!Array.isArray(types) || !hidden?.length) {
      return;
    }

    types.forEach((type) => {
      const key = instance.make_key(type[titleKey]);

      if (hidden.includes("*") || hidden.includes(key)) {
        type[displayKey] = 0;
      }
    });
  };

  apply(
    config.map_options.marker_types,
    "marker_title",
    "marker_display",
    visibility?.marker?.hide,
  );
  apply(
    config.map_options.line_types,
    "line_title",
    "line_display",
    visibility?.line?.hide,
  );
  apply(
    config.map_options.shape_types,
    "shape_title",
    "shape_display",
    visibility?.shape?.hide,
  );
}

onBeforeUnmount(() => {
  disposed = true;

  if (pollTimer) {
    clearTimeout(pollTimer);
    pollTimer = null;
  }

  if (viewer?.map && typeof viewer.map.remove === "function") {
    viewer.map.remove();
  }

  const factory = (window as any).Waymark_Map_Factory;

  if (factory?.instances && Array.isArray(factory.instances)) {
    const index = factory.instances.indexOf(viewer);

    if (index !== -1) {
      factory.instances.splice(index, 1);
    }
  }

  const container = document.getElementById(mapId.value);

  if (container) {
    container.innerHTML = "";
  }

  if (elevationId.value) {
    const elevation = document.getElementById(elevationId.value);

    if (elevation) {
      elevation.innerHTML = "";
    }
  }

  if (
    demoEntry.value?.globalCallback &&
    (window as any).waymark_loaded_callback === demoEntry.value.globalCallback
  ) {
    delete (window as any).waymark_loaded_callback;
  }

  viewer = null;
});
</script>

<template>
  <div class="map-demo" :class="`map-demo--${demo}`">
    <MapMeta v-if="demoEntry?.meta" :meta="demoEntry.meta" />

    <component :is="'style'" v-if="demoEntry?.css" v-html="demoEntry.css" />

    <div :id="demoEntry?.wrapperId" class="map-demo__frame">
      <div
        :id="mapId"
        class="map-demo__canvas"
        :class="demoEntry?.canvasClass"
        :style="{ height: `${height}px` }"
        role="application"
        aria-label="Interactive map demo"
      />

      <div v-if="elevationId" :id="elevationId" class="map-demo__elevation" />

      <p v-if="status === 'loading'" class="map-demo__status">Loading map…</p>
      <p
        v-else-if="status === 'error'"
        class="map-demo__status map-demo__status--error"
      >
        The map could not be loaded.
      </p>
    </div>
  </div>
</template>
