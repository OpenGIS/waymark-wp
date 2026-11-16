import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Regression coverage for the jQuery Migrate warnings and runtime errors
// reported in issue #83: deprecated event shorthands, attr-based `selected`
// handling, shared data-defaults mutation and an unguarded `getRadius()` call
// in the Editable event handlers.

const language = {
  action_edit_line: "Edit line",
  action_edit_done: "Finish editing",
  action_duplicate_marker: "Duplicate marker",
  action_duplicate_line: "Duplicate line",
  action_delete_marker: "Delete marker",
  action_delete_line: "Delete line",
  action_delete_confirm_marker: "Delete this marker?",
  action_delete_confirm_line: "Delete this line?",
  object_type_label_marker: "Marker type:",
  object_type_label_line: "Line type:",
  object_title_placeholder_marker: "Marker title",
  object_title_placeholder_line: "Line title",
  object_description_placeholder_marker: "Marker description",
  object_description_placeholder_line: "Line description",
  object_image_placeholder: "Image URL",
  action_upload_image: "Upload image",
  marker_latlng_label: "Lat,Lng",
  no_direction: "No direction",
  show_direction: "Show direction",
  reverse_direction: "Reverse direction",
  add_line_title: "Draw a line",
  add_photo_title: "Upload image",
  add_marker_title: "Place a marker",
  add_rectangle_title: "Draw a rectangle",
  add_polygon_title: "Draw a polygon",
  add_circle_title: "Draw a circle",
  upload_file_title: "Read from file",
  action_search_placeholder: "Search...",
  error_geocoder: "Nothing found.",
};

const markerTypes = [
  { type_key: "food", marker_title: "Food" },
  { type_key: "water", marker_title: "Water" },
];

const lineTypes = [
  { type_key: "trail", line_title: "Trail" },
  { type_key: "road", line_title: "Road" },
];

function makeConfig() {
  return {
    map_options: {
      debug_mode: 0,
      marker_types: markerTypes,
      line_types: lineTypes,
      shape_types: [],
    },
    editor_options: { confirm_delete: "0", data_div_id: "waymark-data" },
    marker_type_defaults: {
      marker_title: "Marker",
      marker_shape: "marker",
      marker_size: "medium",
      marker_colour: "#b42714",
      marker_icon: "fa-star",
      icon_type: "font",
      icon_colour: "white",
    },
    line_type_defaults: {
      line_title: "Line",
      line_colour: "#b42714",
      line_weight: "2",
      line_opacity: "0.7",
    },
    shape_type_defaults: {
      shape_title: "Shape",
      shape_colour: "red",
      fill_opacity: "0.4",
    },
    marker_data_defaults: {
      title: undefined,
      type: undefined,
      image_thumbnail_url: undefined,
      image_medium_url: undefined,
      image_large_url: undefined,
      description: undefined,
    },
    line_data_defaults: {
      type: undefined,
      title: undefined,
      image_thumbnail_url: undefined,
      image_medium_url: undefined,
      image_large_url: undefined,
      description: undefined,
      direction: undefined,
    },
    shape_data_defaults: {
      type: undefined,
      title: undefined,
      image_thumbnail_url: undefined,
      image_medium_url: undefined,
      image_large_url: undefined,
      description: undefined,
    },
    language,
  };
}

function markerFeature(overrides = {}) {
  return {
    type: "Feature",
    geometry: { type: "Point", coordinates: [-1.5, 52.5] },
    properties: Object.assign(
      {
        title: "A marker",
        description: "",
        image_large_url: "",
        type: "food",
      },
      overrides,
    ),
  };
}

function lineFeature(overrides = {}) {
  return {
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: [
        [-1.5, 52.5],
        [-1.4, 52.6],
      ],
    },
    properties: Object.assign(
      {
        title: "A line",
        description: "",
        image_large_url: "",
        type: "trail",
        direction: "",
      },
      overrides,
    ),
  };
}

function layerStub(feature) {
  return {
    feature,
    on: vi.fn(),
    setStyle: vi.fn(),
    setIcon: vi.fn(),
    editEnabled: vi.fn(() => false),
    enableEdit: vi.fn(),
    disableEdit: vi.fn(),
    closePopup: vi.fn(),
  };
}

function makeEditor() {
  const editor = window.Waymark_Map_Factory.editor();
  editor.config = makeConfig();
  editor.map_was_edited = vi.fn();

  return editor;
}

function buildContent(editor, layerType, feature, layer) {
  const content = editor.build_content(
    layerType,
    feature,
    layer || layerStub(feature),
  );
  document.body.appendChild(content[0]);

  return content;
}

// Minimal map/DOM surface needed by init_done(), so the Editable handlers it
// registers can be captured and invoked directly without a live Leaflet map.
function installRecordingMap(editor) {
  const handlers = {};

  editor.jq_map_container = jQuery('<div id="waymark-map" />');
  document.body.appendChild(editor.jq_map_container[0]);

  editor.jq_data_container = jQuery('<textarea id="waymark-data" />');
  document.body.appendChild(editor.jq_data_container[0]);

  editor.map = {
    on: vi.fn((eventName, handler) => {
      handlers[eventName] = handler;
    }),
    removeLayer: vi.fn(),
  };

  editor.map_data = {
    addData: vi.fn(),
  };

  editor.init_done();

  return handlers;
}

describe("editor console regressions", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    window.Waymark = undefined;
    window.layer = undefined;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    window.Waymark = undefined;
    window.layer = undefined;
  });

  describe("deprecated jQuery shorthands", () => {
    it("builds marker and line content without .change() or .hover()", () => {
      const editor = makeEditor();
      const changeSpy = vi.spyOn(jQuery.fn, "change");
      const hoverSpy = vi.spyOn(jQuery.fn, "hover");

      const markerContent = buildContent(editor, "marker", markerFeature());
      const lineContent = buildContent(editor, "line", lineFeature());

      expect(markerContent.find(".waymark-info-type")).toHaveLength(1);
      expect(lineContent.find(".waymark-line-direction")).toHaveLength(1);
      expect(changeSpy).not.toHaveBeenCalled();
      expect(hoverSpy).not.toHaveBeenCalled();
    });

    it("selects a type preview with .prop() and never removes a selected attribute", () => {
      const editor = makeEditor();
      const feature = markerFeature({ type: "food" });
      const layer = layerStub(feature);
      const removeAttrSpy = vi.spyOn(jQuery.fn, "removeAttr");
      const content = buildContent(editor, "marker", feature, layer);
      const select = content.find(".waymark-info-type select");

      expect(select.val()).toBe("food");

      content.find('.waymark-overlay-wrap[title="Water"]').trigger("click");

      expect(feature.properties.type).toBe("water");
      expect(select.val()).toBe("water");
      expect(layer.setIcon).toHaveBeenCalledTimes(1);
      expect(editor.map_was_edited).toHaveBeenCalledTimes(1);

      const waterOption = select.find('option[value="water"]');
      expect(waterOption.prop("selected")).toBe(true);
      expect(select.find("option[selected]")).toHaveLength(0);

      const selectedAttrCalls = removeAttrSpy.mock.calls.filter(
        (call) => call[0] === "selected",
      );
      expect(selectedAttrCalls).toEqual([]);
    });

    it("boots the editor and toolbar without deprecated shorthands", () => {
      document.body.innerHTML =
        '<div id="waymark-map" style="height: 500px; width: 500px;"></div>';

      const container = document.getElementById("waymark-map");
      Object.defineProperty(container, "clientWidth", { value: 500 });
      Object.defineProperty(container, "clientHeight", { value: 500 });

      const changeSpy = vi.spyOn(jQuery.fn, "change");
      const hoverSpy = vi.spyOn(jQuery.fn, "hover");

      const editor = window.Waymark_Map_Factory.editor();
      editor.init();

      expect(changeSpy).not.toHaveBeenCalled();
      expect(hoverSpy).not.toHaveBeenCalled();

      editor.map.remove();
    });
  });

  describe("editable event handlers", () => {
    it("does not add circle or rectangle properties to shared shape defaults", () => {
      const editor = makeEditor();
      const handlers = installRecordingMap(editor);
      const circle = window.Waymark_L.circle([52.5, -1.5], { radius: 120 });
      const rectangle = window.Waymark_L.rectangle([
        [52.4, -1.6],
        [52.6, -1.4],
      ]);

      handlers["editable:drawing:commit"]({ layer: circle });
      handlers["editable:drawing:commit"]({ layer: rectangle });

      expect(editor.config.shape_data_defaults).not.toHaveProperty("radius");
      expect(editor.config.shape_data_defaults).not.toHaveProperty("rectangle");

      expect(editor.map_data.addData).toHaveBeenCalledTimes(2);
      expect(editor.map_was_edited).toHaveBeenCalledTimes(2);

      // The committed copies still carry the circle/rectangle markers.
      const circleData = editor.map_data.addData.mock.calls[0][0];
      const rectangleData = editor.map_data.addData.mock.calls[1][0];
      expect(circleData.properties.radius).toBe(120);
      expect(rectangleData.properties.rectangle).toBe(true);
    });

    it("updates the radius when a circle is edited", () => {
      const editor = makeEditor();
      const handlers = installRecordingMap(editor);
      const circle = window.Waymark_L.circle([52.5, -1.5], { radius: 50 });
      circle.feature = {
        type: "Feature",
        properties: editor.get_data_defaults("shape"),
      };
      circle.setRadius(200);

      expect(() =>
        handlers["editable:editing"]({ layer: circle }),
      ).not.toThrow();

      expect(circle.feature.properties.radius).toBe(200);
      expect(editor.map_was_edited).toHaveBeenCalledTimes(1);
    });

    it("edits polygon and polyline features without calling getRadius()", () => {
      const editor = makeEditor();
      const handlers = installRecordingMap(editor);

      const polygon = window.Waymark_L.polygon([
        [52.4, -1.6],
        [52.6, -1.6],
        [52.5, -1.4],
      ]);
      polygon.feature = {
        type: "Feature",
        properties: Object.assign(editor.get_data_defaults("shape"), {
          radius: 30,
        }),
      };

      const polyline = window.Waymark_L.polyline([
        [52.5, -1.5],
        [52.6, -1.4],
      ]);
      polyline.feature = {
        type: "Feature",
        properties: editor.get_data_defaults("line"),
      };

      expect(() =>
        handlers["editable:editing"]({ layer: polygon }),
      ).not.toThrow();
      expect(() =>
        handlers["editable:editing"]({ layer: polyline }),
      ).not.toThrow();

      expect(editor.map_was_edited).toHaveBeenCalledTimes(2);
    });
  });
});
