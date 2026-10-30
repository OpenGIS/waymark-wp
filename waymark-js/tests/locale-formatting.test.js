import { describe, it, expect, beforeEach, afterEach } from "vitest";

describe("locale-aware number formatting", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    window.Waymark_L.numberLocale = null;
  });

  afterEach(() => {
    window.Waymark_L.numberLocale = null;
  });

  it("formats numbers with the configured locale", () => {
    const viewer = window.Waymark_Map_Factory.viewer();
    viewer.config = { locale: "de-DE" };

    expect(viewer.format_number(12.34, 2)).toBe("12,34");
    expect(viewer.format_number(1234, 0)).toBe("1.234");
  });

  it("formats elevation numbers with the waymark locale", () => {
    window.Waymark_L.numberLocale = "de-DE";

    expect(window.Waymark_L.formatNumber(12.34, 2)).toBe("12,34");
    expect(window.Waymark_L.formatNumber(1234, 0)).toBe("1.234");
  });

  it("merges the top-level locale from the user config", () => {
    document.body.innerHTML =
      '<div id="waymark-map" style="height: 500px; width: 500px;"></div>';

    const container = document.getElementById("waymark-map");
    Object.defineProperty(container, "clientWidth", { value: 500 });
    Object.defineProperty(container, "clientHeight", { value: 500 });

    const viewer = window.Waymark_Map_Factory.viewer();

    viewer.init({
      locale: "de-DE",
      map_options: { marker_types: [{ marker_title: "Pub" }] },
    });

    expect(viewer.config.locale).toBe("de-DE");
  });

  it("formats coordinate strings and numbers with the configured locale", () => {
    const viewer = window.Waymark_Map_Factory.viewer();
    viewer.config = { locale: "de-DE" };

    expect(viewer.format_coordinate("54.526814", 6)).toBe("54,526814");
    expect(viewer.format_coordinate(54.526814, 6)).toBe("54,526814");
    expect(viewer.format_coordinate("not-a-number", 6)).toBe("not-a-number");
  });

  it("passes localised elevation units to the control", () => {
    const viewer = window.Waymark_Map_Factory.viewer();
    const original_elevation = window.Waymark_L.control.elevation;
    let captured = null;

    const base_config = {
      locale: "en-GB",
      viewer_options: {
        show_elevation: true,
        elevation_colour: "#b42714",
        elevation_div_id: "waymark-elevation",
      },
      map_options: { map_width: 500, map_div_id: "waymark-map" },
      language: {
        label_total_length: "Total Length:",
        label_max_elevation: "Max Elevation:",
        label_min_elevation: "Min Elevation:",
        label_ascent: "Total Ascent:",
        label_descent: "Total Descent:",
        label_altitude: "Altitude",
        label_download: "Download",
        label_unit_km: "km",
        label_unit_m: "m",
        label_unit_mi: "mi",
        label_unit_ft: "ft",
      },
    };

    window.Waymark_L.control.elevation = (options) => {
      captured = options;

      return { addTo: () => ({ on() {}, clear() {} }) };
    };

    try {
      viewer.config = {
        ...base_config,
        viewer_options: {
          ...base_config.viewer_options,
          elevation_units: "imperial",
        },
      };
      viewer.map = { on() {} };
      viewer.jq_map_container = jQuery("<div />");
      viewer.debug = () => {};
      viewer.setup_elevation();

      expect(captured.imperial).toBe(true);
      expect(captured.xLabel).toBe("mi");
      expect(captured.yLabel).toBe("ft");

      viewer.config = {
        ...base_config,
        viewer_options: {
          ...base_config.viewer_options,
          elevation_units: "metric",
        },
      };
      viewer.map = { on() {} };
      viewer.jq_map_container = jQuery("<div />");
      viewer.setup_elevation();

      expect(captured.imperial).toBeUndefined();
      expect(captured.xLabel).toBe("km");
      expect(captured.yLabel).toBe("m");
    } finally {
      window.Waymark_L.control.elevation = original_elevation;
      window.Waymark_L.locales.waymark = undefined;
    }
  });
});
