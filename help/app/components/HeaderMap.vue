<script setup lang="ts">
type LeafletHandler = {
  disable?: () => void;
};

type WaymarkMap = {
  remove: () => void;
  [key: string]: unknown;
};

type WaymarkViewer = {
  init: (config: Record<string, unknown>) => void;
  country_code_to_bounds: () => { getCenter: () => unknown };
  setup_hidden_checker?: () => void;
  map?: WaymarkMap;
};

type WaymarkFactory = {
  viewer: () => WaymarkViewer;
  instances: unknown[];
};

const TILE_LAYER = {
  layer_name: "OpenStreetMap",
  layer_url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?r=1",
  layer_attribution:
    '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  layer_max_zoom: "17",
};

const INITIAL_ZOOM = 8;
const FACTORY_TIMEOUT = 10000;
const HANDLERS = [
  "dragging",
  "scrollWheelZoom",
  "doubleClickZoom",
  "boxZoom",
  "touchZoom",
  "keyboard",
  "tap",
];

const canvasId = useId();
const canvasRef = ref<HTMLElement | null>(null);

let factory: WaymarkFactory | null = null;
let viewer: WaymarkViewer | null = null;
let timerId: ReturnType<typeof setTimeout> | null = null;
let startedAt = 0;
let disposed = false;
let warned = false;

function findFactory(): WaymarkFactory | null {
  if (typeof window === "undefined") {
    return null;
  }

  return (
    (window as unknown as { Waymark_Map_Factory?: WaymarkFactory })
      .Waymark_Map_Factory ?? null
  );
}

function warnOnce(message: string) {
  if (warned) {
    return;
  }

  warned = true;
  console.warn(`HeaderMap: ${message} Background map disabled.`);
}

function disableInteractions(instance: WaymarkViewer) {
  const map = instance.map;

  if (!map) {
    return;
  }

  for (const name of HANDLERS) {
    const handler = map[name] as LeafletHandler | undefined;

    if (handler && typeof handler.disable === "function") {
      handler.disable();
    }
  }
}

function stripControls() {
  const canvas = canvasRef.value;

  if (!canvas) {
    return;
  }

  canvas
    .querySelectorAll<HTMLElement>(".leaflet-control")
    .forEach((control) => {
      if (!control.classList.contains("leaflet-control-attribution")) {
        control.remove();
      }
    });
}

function cleanup() {
  if (!viewer) {
    return;
  }

  try {
    viewer.map?.remove();
  } catch {
    // The map may already have been torn down with the page.
  }

  if (factory) {
    const index = factory.instances.indexOf(viewer);

    if (index !== -1) {
      factory.instances.splice(index, 1);
    }
  }

  viewer = null;
}

function start(mapFactory: WaymarkFactory) {
  factory = mapFactory;

  if (disposed) {
    return;
  }

  try {
    viewer = mapFactory.viewer();
    // The decorative header map is always visible, so the hidden-check interval
    // is unnecessary; it would also race with editor demos over the global
    // `Waymark` reference, which the editor replaces with an instance that lacks
    // `reset_map_view`.
    viewer.setup_hidden_checker = () => {};
    viewer.init({
      map_options: {
        map_div_id: canvasId,
        tile_layers: [TILE_LAYER],
        map_height: null,
        map_init_zoom: INITIAL_ZOOM,
        map_init_latlng: viewer.country_code_to_bounds().getCenter(),
      },
    });
    disableInteractions(viewer);
    stripControls();
  } catch (error) {
    warnOnce(error instanceof Error ? error.message : String(error));
    cleanup();
    return;
  }

  if (disposed) {
    cleanup();
  }
}

function poll() {
  if (disposed) {
    return;
  }

  const mapFactory = findFactory();

  if (mapFactory) {
    start(mapFactory);
    return;
  }

  if (Date.now() - startedAt > FACTORY_TIMEOUT) {
    warnOnce("the Waymark viewer did not load.");
    return;
  }

  timerId = setTimeout(poll, 100);
}

onMounted(() => {
  const mapFactory = findFactory();

  if (mapFactory) {
    start(mapFactory);
    return;
  }

  startedAt = Date.now();
  timerId = setTimeout(poll, 100);
});

onBeforeUnmount(() => {
  disposed = true;

  if (timerId) {
    clearTimeout(timerId);
    timerId = null;
  }

  cleanup();
});
</script>

<template>
  <div class="background-map background-map--invert">
    <div :id="canvasId" ref="canvasRef" class="background-map__canvas" />
  </div>
</template>
