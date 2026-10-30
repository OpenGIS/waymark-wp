import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";

describe("5. Customise", () => {
  let editor;

  beforeEach(() => {
    // Setup the DOM
    document.body.innerHTML =
      '<div id="waymark-map" style="height: 500px; width: 500px;"></div>';

    // Mock clientHeight/clientWidth for Leaflet
    const container = document.getElementById("waymark-map");
    Object.defineProperty(container, "clientWidth", { value: 500 });
    Object.defineProperty(container, "clientHeight", { value: 500 });
  });

  afterEach(() => {
    // Clean up global callback
    delete window.waymark_loaded_callback;
  });

  describe("Localization", () => {
    it("should use custom language strings", () => {
      editor = window.Waymark_Map_Factory.editor();

      const config = {
        language: {
          action_fullscreen_activate: "Plein écran",
          error_geocoder: "Rien trouvé.",
        },
      };

      editor.init(config);

      expect(editor.config.language.action_fullscreen_activate).toBe(
        "Plein écran",
      );
      expect(editor.config.language.error_geocoder).toBe("Rien trouvé.");

      // Verify default strings are still present
      expect(editor.config.language.action_zoom_in).toBe("Zoom in");
    });
  });

  describe("Styling", () => {
    it("should apply type classes to markers", () => {
      editor = window.Waymark_Map_Factory.editor();

      editor.init({
        map_options: {
          marker_types: [
            {
              marker_title: "Pub",
              marker_colour: "#70af00",
            },
          ],
        },
      });

      editor.load_json({
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: { type: "pub" },
            geometry: { type: "Point", coordinates: [-85.038, 49.4595] },
          },
        ],
      });

      const marker = document.querySelector(".waymark-marker-pub");
      expect(marker).toBeTruthy();

      const background = marker.querySelector(".waymark-marker-background");
      expect(background.style.background).toBe("rgb(112, 175, 0)"); // #70af00
    });
  });

  describe("Interaction", () => {
    it("should expose the Leaflet map object", () => {
      editor = window.Waymark_Map_Factory.editor();
      editor.init();

      expect(editor.map).toBeDefined();
      // Check if it's a Leaflet map (has methods like getZoom)
      expect(typeof editor.map.getZoom).toBe("function");
    });

    it("should allow jQuery interaction with map container", () => {
      editor = window.Waymark_Map_Factory.editor();
      editor.init();

      const map_container = jQuery("#waymark-map");
      map_container.addClass("oh-canada");

      expect(
        document.getElementById("waymark-map").classList.contains("oh-canada"),
      ).toBe(true);
    });
  });

  describe("Callback Function", () => {
    it("should execute global callback on initialization", () => {
      const callbackSpy = vi.fn();
      window.waymark_loaded_callback = callbackSpy;

      editor = window.Waymark_Map_Factory.editor();
      editor.init();

      expect(callbackSpy).toHaveBeenCalledTimes(1);
      expect(callbackSpy).toHaveBeenCalledWith(editor);
    });
  });
});
