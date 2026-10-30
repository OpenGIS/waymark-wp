import { describe, it, expect, beforeEach } from "vitest";

const harmful = "<i>Fish & 'Chips'</i>";

function expectEscaped(value) {
  expect(value).not.toContain("<i>");
  expect(value).toContain("&lt;i&gt;");
  expect(value).toContain("&amp;");
  expect(value).toContain("'Chips'");
  expect(value).not.toContain("&#039;");
}

describe("i18n output escaping", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    delete window.Waymark_L.locales.waymark;
  });

  it("escapes the editor lat/lng label in the info content", () => {
    const editor = window.Waymark_Map_Factory.editor();

    editor.config = {
      marker_data_defaults: {},
      map_options: { marker_types: [] },
      editor_options: { confirm_delete: "0" },
      language: {
        marker_latlng_label: harmful,
        object_label_marker: "Marker",
        object_type_label_marker: "Marker type:",
        object_title_placeholder_marker: "Marker title",
        object_description_placeholder_marker: "Marker description",
        object_image_placeholder: "Image URL",
        action_upload_image: "Upload Image",
        action_edit_marker: "Edit Marker",
        action_edit_done: "Finish editing",
        action_duplicate_marker: "Duplicate Marker",
        action_delete_marker: "Delete Marker",
        action_delete_confirm_marker:
          "Are you sure you want to delete this Marker?",
      },
    };

    const layer = {
      feature: {
        properties: {
          title: "",
          description: "",
          image_large_url: "",
          type: "",
        },
        geometry: { coordinates: [1.234567, 2.345678] },
      },
    };

    const content = editor.build_content("marker", layer.feature, layer);
    const latlng = content.find(".waymark-marker-info-latlng").html();

    expectEscaped(latlng);
  });

  it("escapes the plural label passed to the layer control", () => {
    const viewer = window.Waymark_Map_Factory.viewer();
    const overlays = [];

    viewer.config = {
      viewer_options: { show_filter: "1" },
      language: { object_label_marker_plural: harmful },
    };
    viewer.mode = "view";
    viewer.map = {};
    viewer.marker_parent_group = {};
    viewer.marker_sub_groups = { t1: {} };
    viewer.get_type = () => ({
      type_key: "t1",
      marker_title: "Marker",
      marker_colour: "red",
      icon_colour: "#000",
    });
    viewer.layer_control = {
      addTo() {},
      removeLayer() {},
      addOverlay(group, label) {
        overlays.push(label);
      },
    };

    const layer = {
      feature: { properties: { type: "t1" } },
      addTo() {},
    };

    viewer.add_to_group("marker", layer);

    const parent_label = overlays.find((label) => label.startsWith("<b>"));
    expect(parent_label).toBeDefined();
    expectEscaped(parent_label);
  });

  it("escapes the type title rendered by type_to_text", () => {
    const viewer = window.Waymark_Map_Factory.viewer();

    const html = viewer.type_to_text("line", {
      line_title: harmful,
      line_colour: "#000",
    });

    expectEscaped(html);
  });

  it("escapes the type title in the Untitled fallback", () => {
    const viewer = window.Waymark_Map_Factory.viewer();
    viewer.config = { language: { object_label_marker: "Marker" } };

    const content = viewer.build_overlay_content(
      {
        properties: {
          title: "",
          description: "",
          image_large_url: "",
          type: "t1",
        },
      },
      "marker",
      {
        marker_title: harmful,
        type_key: "t1",
        marker_colour: "red",
        icon_colour: "#000",
      },
    );

    expect(content).toContain("Untitled");
    expectEscaped(content);
  });

  it("escapes the elevation labels registered as the locale", () => {
    const viewer = window.Waymark_Map_Factory.viewer();

    viewer.config = {
      viewer_options: {
        show_elevation: true,
        elevation_colour: "#b42714",
        elevation_units: "metric",
      },
      map_options: { map_width: 500, map_div_id: "waymark-map" },
      language: {
        label_total_length: harmful,
        label_max_elevation: harmful,
        label_min_elevation: harmful,
        label_ascent: harmful,
        label_descent: harmful,
      },
    };
    viewer.map = { on() {} };
    viewer.jq_map_container = jQuery("<div />");
    viewer.debug = () => {};

    const original_elevation = window.Waymark_L.control.elevation;
    window.Waymark_L.control.elevation = () => ({
      addTo: () => ({ on() {}, clear() {} }),
    });

    try {
      viewer.setup_elevation();
    } finally {
      window.Waymark_L.control.elevation = original_elevation;
    }

    const locale = window.Waymark_L.locales.waymark;

    expectEscaped(locale["Total Length: "]);
    expectEscaped(locale["Max Elevation: "]);
    expectEscaped(locale["Min Elevation: "]);
    expectEscaped(locale["Total Ascent: "]);
    expectEscaped(locale["Total Descent: "]);
  });
});
