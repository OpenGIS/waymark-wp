<script setup lang="ts">
import submissionsEditor from "~/data/demos/submissionsEditor";
import waymarkUserConfig from "~/data/waymarkUserConfig";

const baseURL = useRuntimeConfig().app.baseURL;
const MAP_ID = "waymark-map";
const DATA_ID = "waymark-data";
const DEMO_SECURITY = "waymark-docs-demo";

const status = ref<"loading" | "ready" | "error">("loading");

let disposed = false;
let pollTimer: ReturnType<typeof setTimeout> | null = null;
let editor: Record<string, any> | null = null;
let resizeHandler: (() => void) | null = null;
const observers: MutationObserver[] = [];

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

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
        reject(new Error("The Waymark editor library did not load."));
        return;
      }

      pollTimer = setTimeout(check, 100);
    };

    check();
  });
}

function trackMutationObservers() {
  const NativeObserver = window.MutationObserver;

  function TrackedObserver(callback: MutationCallback) {
    const observer = new NativeObserver(callback);

    observers.push(observer);

    return observer;
  }

  TrackedObserver.prototype = NativeObserver.prototype;
  (window as any).MutationObserver = TrackedObserver;

  return () => {
    (window as any).MutationObserver = NativeObserver;
  };
}

function installResizeHandler(instance: Record<string, any>) {
  instance.handle_resize = function () {
    const self = instance;

    resizeHandler = () => {
      if (disposed || !self.jq_map_container) {
        return;
      }

      self.config.map_options.map_height = self.jq_map_container.height();
      self.config.map_options.map_width = self.jq_map_container.width();

      if (typeof self.size_gallery === "function") {
        self.size_gallery();
      }
    };

    window.addEventListener("resize", resizeHandler);
  };
}

onMounted(async () => {
  await nextTick();

  try {
    const factory = await waitForFactory();

    if (disposed) {
      return;
    }

    document
      .querySelectorAll(".waymark-input.waymark-input-map_data")
      .forEach((element) => {
        element.id = DATA_ID;
      });

    (window as any).waymark_security = DEMO_SECURITY;

    const config = resolveAssetStrings(clone(waymarkUserConfig), baseURL);
    const demoConfig = resolveAssetStrings(clone(submissionsEditor), baseURL);

    Object.assign(config.map_options, demoConfig.map_options);
    Object.assign(config.viewer_options, demoConfig.viewer_options);
    Object.assign(config.editor_options, demoConfig.editor_options);
    config.map_options.map_div_id = MAP_ID;

    const instance = factory.editor();

    if (!instance) {
      throw new Error("The Waymark editor could not be created.");
    }

    editor = instance;
    installResizeHandler(instance);

    const restoreMutationObserver = trackMutationObservers();

    try {
      instance.init(config);
      instance.load_done();
    } finally {
      restoreMutationObserver();
    }

    instance.jq_map_container?.addClass("waymark-disable-title");
    instance.jq_map_container?.addClass("waymark-disable-meta");

    status.value = "ready";
  } catch (error) {
    status.value = "error";
    console.error(error);
  }
});

onBeforeUnmount(() => {
  disposed = true;

  if (pollTimer) {
    clearTimeout(pollTimer);
    pollTimer = null;
  }

  if (resizeHandler) {
    window.removeEventListener("resize", resizeHandler);
    resizeHandler = null;
  }

  observers.forEach((observer) => observer.disconnect());
  observers.length = 0;

  if (editor?.map && typeof editor.map.remove === "function") {
    editor.map.remove();
  }

  const factory = (window as any).Waymark_Map_Factory;

  if (factory?.instances && Array.isArray(factory.instances)) {
    const index = factory.instances.indexOf(editor);

    if (index !== -1) {
      factory.instances.splice(index, 1);
    }
  }

  const container = document.getElementById(MAP_ID);

  if (container) {
    (window as any).jQuery?.(container).removeData("Waymark");
    container.innerHTML = "";
  }

  const data = document.getElementById(DATA_ID);

  if (data instanceof HTMLTextAreaElement) {
    data.value = "";
  }

  if ((window as any).waymark_security === DEMO_SECURITY) {
    delete (window as any).waymark_security;
  }

  editor = null;
});
</script>

<template>
  <div id="waymark-submission" class="map-demo submission-demo">
    <div class="map-demo__frame">
      <div
        :id="MAP_ID"
        class="waymark-submission waymark-map map-demo__canvas"
        style="height: 640px"
        role="application"
        aria-label="Waymark submission editor demo"
      />

      <textarea
        :id="DATA_ID"
        class="waymark-input waymark-input-map_data"
        name="map_data"
        aria-hidden="true"
        tabindex="-1"
        style="display: none"
      />

      <p v-if="status === 'loading'" class="map-demo__status">
        Loading editor…
      </p>
      <p
        v-else-if="status === 'error'"
        class="map-demo__status map-demo__status--error"
      >
        The editor could not be loaded.
      </p>
    </div>
  </div>
</template>
