import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Regression coverage for issue #86.
//
// A front-end viewer whose Map has no `map_init_latlng`/`map_init_zoom` must
// still end up with a loaded Leaflet map before any data is fitted. Leaflet
// queues layers added before the first `setView()`, so a queued Circle has no
// `_map` yet and `Circle.getBounds()` throws on `this._map.layerPointToLatLng`.
// The viewer retries every 100ms, so the error repeats and the container stays
// blank. The Map must fall back to the configured default view, then a world
// view, and always finish with a numeric zoom.

const DEFAULT_CENTRE = [51.38436, -68.74923];
const DEFAULT_ZOOM = 9;

function circleFeature(overrides = {}) {
  return {
    type: "Feature",
    geometry: { type: "Point", coordinates: [-128.152, 50.69] },
    properties: Object.assign(
      {
        type: "blue",
        title: "Circle only",
        description: "",
        radius: 250,
      },
      overrides,
    ),
  };
}

function collection(features = []) {
  return { type: "FeatureCollection", features };
}

function makeContainer(id = "waymark-map") {
  document.body.innerHTML = `<div id="${id}" style="height: 500px; width: 500px;"></div>`;

  const container = document.getElementById(id);
  Object.defineProperty(container, "clientWidth", {
    value: 500,
    configurable: true,
  });
  Object.defineProperty(container, "clientHeight", {
    value: 500,
    configurable: true,
  });

  return container;
}

function makeConfig(mapOptions = {}, viewerOptions = {}) {
  return {
    map_options: Object.assign(
      {
        map_div_id: "waymark-map",
        shape_types: [
          {
            shape_title: "Blue",
            type_key: "blue",
            shape_colour: "#487bd9",
            fill_opacity: "0.5",
            shape_display: "1",
          },
        ],
      },
      mapOptions,
    ),
    viewer_options: Object.assign(
      {
        show_gallery: 0,
        show_filter: 0,
        show_cluster: 0,
        show_elevation: 0,
      },
      viewerOptions,
    ),
  };
}

// The viewer schedules a 100ms hidden-checker. These tests drive the view
// through the public API, so neutralise the interval and keep the assertion
// the only thing that can fail.
function initViewer(config) {
  const viewer = window.Waymark_Map_Factory.viewer();
  const intervalSpy = vi.spyOn(window, "setInterval").mockReturnValue(999999);

  try {
    viewer.init(config);
  } finally {
    intervalSpy.mockRestore();
  }

  return viewer;
}

function findCircle(viewer) {
  let circle = null;

  viewer.map_data.eachLayer((layer) => {
    if (layer instanceof window.Waymark_L.Circle) {
      circle = layer;
    }
  });

  return circle;
}

describe("map view defaults", () => {
  let viewer;

  beforeEach(() => {
    document.body.innerHTML = "";
    window.Waymark = undefined;
  });

  afterEach(() => {
    if (viewer && viewer.map && typeof viewer.map.remove === "function") {
      viewer.map.remove();
    }

    viewer = null;
    window.Waymark = undefined;
    vi.restoreAllMocks();
  });

  it("loads the map before fitting a Circle when no initial view is set", () => {
    makeContainer();
    viewer = initViewer(makeConfig());

    expect(() => viewer.load_json(collection([circleFeature()]))).not.toThrow();

    expect(viewer.map._loaded).toBe(true);

    const circle = findCircle(viewer);

    expect(
      circle,
      "the Circle feature was not added to the data layer",
    ).not.toBe(null);
    expect(circle._map).toBe(viewer.map);
    expect(circle.getBounds().isValid()).toBe(true);
  });

  it("uses the configured map defaults for an empty FeatureCollection", () => {
    makeContainer();
    viewer = initViewer(
      makeConfig({
        map_default_latlng: DEFAULT_CENTRE,
        map_default_zoom: DEFAULT_ZOOM,
      }),
    );

    expect(() => viewer.load_json(collection())).not.toThrow();

    expect(viewer.map._loaded).toBe(true);

    const centre = viewer.map.getCenter();

    expect(centre.lat).toBeCloseTo(DEFAULT_CENTRE[0], 5);
    expect(centre.lng).toBeCloseTo(DEFAULT_CENTRE[1], 5);
    expect(viewer.map.getZoom()).toBe(DEFAULT_ZOOM);
  });

  it("falls back to a world view when no defaults are configured", () => {
    makeContainer();
    viewer = initViewer(makeConfig());

    expect(() => viewer.load_json(collection())).not.toThrow();

    expect(viewer.map._loaded).toBe(true);

    const centre = viewer.map.getCenter();
    const zoom = viewer.map.getZoom();

    expect(Number.isFinite(centre.lat)).toBe(true);
    expect(Number.isFinite(centre.lng)).toBe(true);
    expect(Number.isFinite(zoom)).toBe(true);

    // Documented world fallback.
    expect(centre.lat).toBeCloseTo(0, 5);
    expect(centre.lng).toBeCloseTo(0, 5);
    expect(zoom).toBe(2);
  });

  it("produces a finite zoom when only an initial centre is set", () => {
    makeContainer();
    viewer = initViewer(makeConfig({ map_init_latlng: [50.6539, -128.0094] }));

    expect(() => viewer.load_json(collection())).not.toThrow();

    expect(viewer.map._loaded).toBe(true);

    const centre = viewer.map.getCenter();
    const zoom = viewer.map.getZoom();

    expect(Number.isFinite(zoom)).toBe(true);
    expect(centre.lat).toBeCloseTo(50.6539, 5);
    expect(centre.lng).toBeCloseTo(-128.0094, 5);
  });

  it("keeps map_default_latlng and map_default_zoom through init()", () => {
    makeContainer();
    viewer = initViewer(
      makeConfig({
        map_init_latlng: [50.6539, -128.0094],
        map_init_zoom: 10,
        map_default_latlng: [-33.8688, 151.2093],
        map_default_zoom: 12,
      }),
    );

    expect(viewer.config.map_options.map_default_latlng).toEqual([
      -33.8688, 151.2093,
    ]);
    expect(viewer.config.map_options.map_default_zoom).toBe(12);
  });
});
