import { describe, it, expect } from "vitest";

function markerType(overrides = {}) {
  return Object.assign(
    {
      marker_title: "Marker",
      marker_shape: "marker",
      marker_size: "medium",
      marker_colour: "#b42714",
      marker_icon: "fa-star",
      icon_type: "font",
      icon_colour: "white",
    },
    overrides,
  );
}

function makeMap(types, aliases = {}) {
  const map = window.Waymark_Map_Factory.viewer();

  map.config = {
    map_options: { marker_types: types },
    marker_type_defaults: markerType(),
    marker_data_defaults: { type: undefined },
    type_aliases: { marker: aliases, line: {}, shape: {} },
    language: {},
  };

  return map;
}

function buildLineEditor(types, aliases = {}) {
  const editor = window.Waymark_Map_Factory.editor();

  editor.config = {
    map_options: { line_types: types },
    type_aliases: { marker: {}, line: aliases, shape: {} },
    line_type_defaults: {
      line_title: "Line",
      line_colour: "#b42714",
      line_weight: "2",
      line_opacity: "0.7",
    },
    line_data_defaults: {},
    editor_options: { confirm_delete: "0" },
    language: {},
  };

  const feature = {
    properties: {
      title: "",
      description: "",
      image_large_url: "",
      type: "trailaccess",
      direction: "",
    },
  };

  const content = editor.build_content("line", feature, {});
  document.body.appendChild(content[0]);

  return content;
}

describe("stable overlay type keys", () => {
  it("resolves an explicit type_key independently of the title", () => {
    const map = makeMap([
      markerType({ marker_title: "Trail Access", type_key: "trail_access" }),
    ]);

    const type = map.get_type("marker", "trail_access");

    expect(type.type_key).toBe("trail_access");

    // A translated or edited title must not change the resolved key
    map.config.map_options.marker_types[0].marker_title = "Access";

    const renamed_type = map.get_type("marker", "trail_access");

    expect(renamed_type.type_key).toBe("trail_access");
    expect(renamed_type.marker_title).toBe("Access");
  });

  it("resolves a legacy alias to the canonical type", () => {
    const map = makeMap(
      [markerType({ marker_title: "Trail Access", type_key: "trail_access" })],
      { trailaccess: "trail_access" },
    );

    expect(map.resolve_type_key("marker", "trailaccess")).toBe("trail_access");

    const type = map.get_type("marker", "trailaccess");

    expect(type.type_key).toBe("trail_access");
    expect(type.marker_title).toBe("Trail Access");
  });

  it("uses the explicit key as the editor option value", () => {
    const content = buildLineEditor(
      [
        {
          line_title: "Trail Access",
          type_key: "trail_access",
          line_colour: "#b42714",
          line_weight: "2",
          line_opacity: "0.7",
        },
      ],
      { trailaccess: "trail_access" },
    );

    const option = content
      .find(".waymark-info-type option")
      .filter(function () {
        return jQuery(this).text() === "Trail Access";
      });

    expect(option.val()).toBe("trail_access");
    expect(option.attr("selected")).toBe("selected");
  });

  it("falls back to the title when a legacy key has no explicit key", () => {
    const map = makeMap([
      markerType({ marker_title: "Photo" }),
      markerType({ marker_title: "Trail Access" }),
    ]);

    const type = map.get_type("marker", "trail_access");

    expect(type.marker_title).toBe("Trail Access");
    expect(type.type_key).toBe("trailaccess");
  });

  it("defaults the type heading to the first configured type", () => {
    const map = makeMap([
      markerType({
        marker_title: "Trail Access",
        type_key: "trail_access",
        marker_colour: "#123456",
      }),
      markerType({
        marker_title: "Photo",
        type_key: "photo",
        marker_colour: "#654321",
      }),
    ]);

    const heading = map.build_type_heading("marker");

    expect(heading).toContain("Trail Access");
    expect(heading).toContain("#123456");
    expect(heading).toContain("waymark-marker-trail_access");
    expect(heading).not.toContain("Photo");

    const explicit = map.build_type_heading("marker", "photo");

    expect(explicit).toContain("Photo");
    expect(explicit).toContain("#654321");
    expect(explicit).toContain("waymark-marker-photo");
  });

  it("keeps type_aliases from the user config through init()", () => {
    document.body.innerHTML =
      '<div id="waymark-map" style="height: 500px; width: 500px;"></div>';

    const container = document.getElementById("waymark-map");
    Object.defineProperty(container, "clientWidth", { value: 500 });
    Object.defineProperty(container, "clientHeight", { value: 500 });

    const map = window.Waymark_Map_Factory.viewer();

    map.init({
      map_options: {
        map_div_id: "waymark-map",
        map_init_zoom: 10,
        map_init_latlng: [50.6539, -128.0094],
        marker_types: [
          markerType({
            marker_title: "Trail Access",
            type_key: "trail_access",
          }),
        ],
      },
      type_aliases: {
        marker: { trailaccess: "trail_access" },
        line: {},
        shape: {},
      },
    });

    expect(map.config.type_aliases.marker.trailaccess).toBe("trail_access");
    expect(map.resolve_type_key("marker", "trailaccess")).toBe("trail_access");
    expect(map.get_type("marker", "trailaccess").type_key).toBe("trail_access");
  });
});
