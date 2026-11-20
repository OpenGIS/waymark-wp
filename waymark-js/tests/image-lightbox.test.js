import { describe, it, expect, beforeEach, vi } from "vitest";

function makeFeature(properties, coordinates = [-85.038, 49.4595]) {
  return {
    type: "Feature",
    geometry: { type: "Point", coordinates },
    properties,
  };
}

function makeViewer() {
  return window.Waymark_Map_Factory.viewer();
}

function makeGalleryViewer() {
  const viewer = makeViewer();

  viewer.init({
    viewer_options: { show_gallery: 1, show_cluster: 0 },
    map_options: { map_init_latlng: [49.4595, -85.038], map_init_zoom: 16 },
  });

  return viewer;
}

function galleryThumbnails() {
  return document.querySelectorAll(".waymark-gallery-container .waymark-image");
}

function getDialog() {
  return document.querySelector("dialog.waymark-lightbox");
}

function clickAnchor(anchor, options = {}) {
  const event = new window.MouseEvent("click", {
    bubbles: true,
    cancelable: true,
    button: 0,
    ...options,
  });

  anchor.dispatchEvent(event);

  return event;
}

describe("Popup image lightbox", () => {
  beforeEach(() => {
    document.body.innerHTML =
      '<div id="waymark-map" style="height: 500px; width: 500px;"></div>';

    const container = document.getElementById("waymark-map");
    Object.defineProperty(container, "clientWidth", { value: 500 });
    Object.defineProperty(container, "clientHeight", { value: 500 });
  });

  it("renders a lazy image inside the full-size anchor", () => {
    const viewer = makeViewer();
    viewer.init();

    const content = viewer.build_content("marker", {
      properties: {
        image_large_url: "https://example.com/large.jpg",
        image_medium_url: "https://example.com/medium.jpg",
      },
    });

    const anchor = content.find(".waymark-info-image_large_url a");
    const image = anchor.find("img");

    expect(anchor.length).toBe(1);
    expect(anchor.attr("href")).toBe("https://example.com/large.jpg");
    expect(anchor.attr("target")).toBe("_blank");
    expect(anchor.attr("rel")).toBe("noopener noreferrer");

    expect(image.length).toBe(1);
    expect(image.attr("src")).toBe("https://example.com/medium.jpg");
    expect(image.attr("loading")).toBe("lazy");
  });

  it("falls back to the large URL when the medium URL is unsafe", () => {
    const viewer = makeViewer();
    viewer.init();

    const content = viewer.build_content("marker", {
      properties: {
        image_large_url: "https://example.com/large.jpg",
        image_medium_url: "javascript:alert(1)",
      },
    });

    const image = content.find(".waymark-info-image_large_url a img");

    expect(image.attr("src")).toBe("https://example.com/large.jpg");
  });

  it("marks a missing image as no-image with no anchor", () => {
    const viewer = makeViewer();
    viewer.init();

    const content = viewer.build_content("marker", {
      properties: { title: "No image" },
    });

    expect(content.find(".waymark-no-image").length).toBe(1);
    expect(content.find("a").length).toBe(0);
  });

  it("marks an unsafe image as no-image with no anchor", () => {
    const viewer = makeViewer();
    viewer.init();

    const content = viewer.build_content("marker", {
      properties: { image_large_url: "javascript:alert(1)" },
    });

    expect(content.find(".waymark-no-image").length).toBe(1);
    expect(content.find("a").length).toBe(0);
  });

  it("collects every safe feature image in draw order", () => {
    const viewer = makeViewer();
    viewer.init();

    viewer.load_json({
      type: "FeatureCollection",
      features: [
        makeFeature({
          title: "Marker",
          image_large_url: "https://example.com/marker.jpg",
        }),
        {
          type: "Feature",
          geometry: {
            type: "MultiLineString",
            coordinates: [
              [
                [-85.01, 49.46],
                [-85.02, 49.47],
              ],
            ],
          },
          properties: {
            title: "Line",
            image_large_url: "https://example.com/line.jpg",
          },
        },
        makeFeature({
          title: "Shape",
          radius: 100,
          image_large_url: "https://example.com/shape.jpg",
        }),
        makeFeature({ title: "No image" }),
        makeFeature({
          title: "Unsafe",
          image_large_url: "javascript:alert(1)",
        }),
      ],
    });

    const items = viewer.get_lightbox_images();

    expect(items.length).toBe(3);
    expect(items.map((item) => item.title)).toEqual([
      "Marker",
      "Line",
      "Shape",
    ]);
    expect(items.map((item) => item.url)).toEqual([
      "https://example.com/marker.jpg",
      "https://example.com/line.jpg",
      "https://example.com/shape.jpg",
    ]);
  });

  it("carries a plain-text description on each lightbox item", () => {
    const viewer = makeViewer();
    viewer.init();

    viewer.load_json({
      type: "FeatureCollection",
      features: [
        makeFeature({
          title: "Marker",
          image_large_url: "https://example.com/marker.jpg",
          description: "<p>Tidal <b>crossing</b> &amp; sea stacks.</p>",
        }),
        makeFeature({
          title: "No description",
          image_large_url: "https://example.com/plain.jpg",
        }),
      ],
    });

    const items = viewer.get_lightbox_images();

    expect(items.length).toBe(2);
    expect(items[0].description).toBe("Tidal crossing & sea stacks.");
    expect(items[1].description).toBe("");
  });

  it("returns no items without map data", () => {
    const viewer = makeViewer();
    viewer.init();
    viewer.map_data = undefined;

    expect(viewer.get_lightbox_images()).toEqual([]);
  });

  it("resolves the index by layer, then by feature, then to -1", () => {
    const viewer = makeViewer();

    const firstLayer = {};
    const secondLayer = {};
    const firstFeature = {};
    const secondFeature = {};

    const items = [
      { layer: firstLayer, feature: firstFeature },
      { layer: secondLayer, feature: secondFeature },
    ];

    // Layer identity wins over feature identity.
    expect(viewer.get_lightbox_index(items, secondLayer, firstFeature)).toBe(1);

    // Falls back to feature identity when the layer is unknown.
    expect(viewer.get_lightbox_index(items, {}, secondFeature)).toBe(1);

    expect(viewer.get_lightbox_index(items, {}, {})).toBe(-1);
  });

  it("does not open the dialog for an unmatched lookup", () => {
    const viewer = makeViewer();
    const lightbox = new window.Waymark_Lightbox();
    lightbox.init();

    const items = [{ url: "https://example.com/marker.jpg" }];
    const index = viewer.get_lightbox_index(items, {}, {});

    expect(index).toBe(-1);
    expect(lightbox.open(items, index)).toBe(false);

    const dialog = getDialog();
    expect(dialog === null || dialog.open === false).toBe(true);
  });

  it("opens the dialog on a plain click", () => {
    const viewer = makeViewer();
    viewer.init();

    viewer.load_json({
      type: "FeatureCollection",
      features: [
        makeFeature({
          title: "Marker",
          image_large_url: "https://example.com/marker.jpg",
        }),
      ],
    });

    const layer = viewer.map_data.getLayers()[0];
    const content = viewer.build_content("marker", layer.feature, layer);
    document.body.appendChild(content.get(0));

    const anchor = content.find(".waymark-info-image_large_url a").get(0);
    const event = clickAnchor(anchor);

    const dialog = getDialog();

    expect(dialog).not.toBe(null);
    expect(dialog.open).toBe(true);
    expect(event.defaultPrevented).toBe(true);
  });

  it("leaves a modified click to the browser", () => {
    const viewer = makeViewer();
    viewer.init();

    viewer.load_json({
      type: "FeatureCollection",
      features: [
        makeFeature({
          title: "Marker",
          image_large_url: "https://example.com/marker.jpg",
        }),
      ],
    });

    const layer = viewer.map_data.getLayers()[0];
    const content = viewer.build_content("marker", layer.feature, layer);
    document.body.appendChild(content.get(0));

    const anchor = content.find(".waymark-info-image_large_url a").get(0);
    const event = clickAnchor(anchor, { metaKey: true });

    const dialog = getDialog();

    expect(event.defaultPrevented).toBe(false);
    expect(dialog === null || dialog.open === false).toBe(true);
  });

  it("renders a special-character title as literal text", () => {
    const viewer = makeViewer();
    viewer.init();

    const title = "<Rock> & Roll";

    viewer.load_json({
      type: "FeatureCollection",
      features: [
        makeFeature({
          title: title,
          image_large_url: "https://example.com/marker.jpg",
        }),
      ],
    });

    const layer = viewer.map_data.getLayers()[0];
    const content = viewer.build_content("marker", layer.feature, layer);

    const image = content.find(".waymark-info-image_large_url a img");
    expect(image.attr("alt")).toBe(title);

    const items = viewer.get_lightbox_images();
    expect(viewer.lightbox.open(items, 0)).toBe(true);

    const lightboxTitle = getDialog().querySelector(".waymark-lightbox-title");
    expect(lightboxTitle.textContent).toBe(title);
    expect(lightboxTitle.children.length).toBe(0);
    expect(getDialog().querySelector(".waymark-lightbox-image").alt).toBe(
      title,
    );
  });

  it("hides the full-size link for a non-HTTP href", () => {
    const lightbox = new window.Waymark_Lightbox();
    lightbox.init();

    expect(
      lightbox.open(
        [
          {
            url: "https://example.com/image.jpg",
            href: "javascript:alert(1)",
          },
        ],
        0,
      ),
    ).toBe(true);

    const dialog = getDialog();
    const full = dialog.querySelector(".waymark-lightbox-full");

    expect(dialog.classList.contains("waymark-lightbox-no-full")).toBe(true);
    expect(full.hasAttribute("href")).toBe(false);
  });
});

describe("Description to text", () => {
  beforeEach(() => {
    document.body.innerHTML =
      '<div id="waymark-map" style="height: 500px; width: 500px;"></div>';

    const container = document.getElementById("waymark-map");
    Object.defineProperty(container, "clientWidth", { value: 500 });
    Object.defineProperty(container, "clientHeight", { value: 500 });
  });

  function makeInitialisedViewer() {
    const viewer = makeViewer();
    viewer.init();
    return viewer;
  }

  it("separates paragraphs and decodes entities", () => {
    const viewer = makeInitialisedViewer();

    expect(
      viewer.description_to_text(
        "<p>First paragraph.</p><p>Second &amp; third.</p>",
      ),
    ).toBe("First paragraph. Second & third.");
  });

  it("turns line breaks into spaces", () => {
    const viewer = makeInitialisedViewer();

    expect(viewer.description_to_text("<p>Line one<br>Line two</p>")).toBe(
      "Line one Line two",
    );
  });

  it("passes plain text through with whitespace collapsed and trimmed", () => {
    const viewer = makeInitialisedViewer();

    expect(
      viewer.description_to_text("  Plain \n text\t with   spaces  "),
    ).toBe("Plain text with spaces");
  });

  it("returns an empty string for missing input", () => {
    const viewer = makeInitialisedViewer();

    expect(viewer.description_to_text(undefined)).toBe("");
    expect(viewer.description_to_text(null)).toBe("");
    expect(viewer.description_to_text("")).toBe("");
  });

  it("strips an allowed link down to its text", () => {
    const viewer = makeInitialisedViewer();
    const text = viewer.description_to_text(
      '<a href="https://example.com">Link</a>',
    );

    expect(text).toBe("Link");
    expect(text).not.toMatch(/[<>]/);
  });
});

describe("Gallery lightbox", () => {
  beforeEach(() => {
    document.body.innerHTML =
      '<div id="waymark-map" style="height: 500px; width: 500px;"></div>';

    const container = document.getElementById("waymark-map");
    Object.defineProperty(container, "clientWidth", { value: 500 });
    Object.defineProperty(container, "clientHeight", { value: 500 });
  });

  function makeGalleryFeature(title, thumbUrl, largeUrl, coordinates) {
    return makeFeature(
      {
        title: title,
        image_thumbnail_url: thumbUrl,
        image_large_url: largeUrl,
      },
      coordinates,
    );
  }

  it("zooms, opens the popup and opens the dialog at the clicked image", () => {
    const viewer = makeGalleryViewer();

    viewer.load_json({
      type: "FeatureCollection",
      features: [
        makeGalleryFeature(
          "Marker",
          "https://example.com/marker-thumb.jpg",
          "https://example.com/marker-large.jpg",
        ),
      ],
    });

    const marker = viewer.map_data.getLayers()[0];
    const setView = vi.spyOn(viewer.map, "setView");
    const openPopup = vi.spyOn(marker, "openPopup");

    const thumbnail = galleryThumbnails()[0];
    expect(thumbnail).toBeDefined();

    clickAnchor(thumbnail);

    expect(setView).toHaveBeenCalledWith(marker.getLatLng(), 16);
    expect(openPopup).toHaveBeenCalled();

    const dialog = getDialog();
    expect(dialog).not.toBe(null);
    expect(dialog.open).toBe(true);
    expect(dialog.querySelector(".waymark-lightbox-image").src).toBe(
      "https://example.com/marker-large.jpg",
    );
  });

  it("opens the dialog at the clicked image's index", () => {
    const viewer = makeGalleryViewer();

    viewer.load_json({
      type: "FeatureCollection",
      features: [
        makeGalleryFeature(
          "First",
          "https://example.com/first-thumb.jpg",
          "https://example.com/first-large.jpg",
        ),
        makeGalleryFeature(
          "Second",
          "https://example.com/second-thumb.jpg",
          "https://example.com/second-large.jpg",
        ),
        makeGalleryFeature(
          "Third",
          "https://example.com/third-thumb.jpg",
          "https://example.com/third-large.jpg",
        ),
      ],
    });

    const thumbnails = galleryThumbnails();
    expect(thumbnails.length).toBe(3);

    clickAnchor(thumbnails[1]);

    const dialog = getDialog();
    expect(dialog.open).toBe(true);
    expect(dialog.querySelector(".waymark-lightbox-image").src).toBe(
      "https://example.com/second-large.jpg",
    );
  });

  it("still zooms and opens the popup when the layer is not in map data", () => {
    const viewer = makeGalleryViewer();

    const marker = window.L.marker([49.4595, -85.038]);
    marker.feature = makeGalleryFeature(
      "Orphan",
      "https://example.com/orphan-thumb.jpg",
      "https://example.com/orphan-large.jpg",
    );
    marker.bindPopup("Popup");
    marker.addTo(viewer.map);

    viewer.add_to_gallery(marker);
    viewer.render_gallery();

    const setView = vi.spyOn(viewer.map, "setView");
    const openPopup = vi.spyOn(marker, "openPopup");

    const thumbnail = galleryThumbnails()[0];
    expect(thumbnail).toBeDefined();

    clickAnchor(thumbnail);

    expect(setView).toHaveBeenCalledWith(marker.getLatLng(), 16);
    expect(openPopup).toHaveBeenCalled();

    const dialog = getDialog();
    expect(dialog === null || dialog.open === false).toBe(true);
  });

  it("pans to a marker and opens its popup", () => {
    const viewer = makeViewer();
    viewer.init();

    const marker = window.L.marker([49.46, -85.04]);
    marker.bindPopup("Popup");
    marker.addTo(viewer.map);

    const panTo = vi.spyOn(viewer.map, "panTo");
    const openPopup = vi.spyOn(marker, "openPopup");

    viewer.sync_map_to_lightbox({ layer: marker });

    expect(panTo).toHaveBeenCalledWith(marker.getLatLng(), {
      animate: false,
    });
    expect(openPopup).toHaveBeenCalled();
  });

  it("fits the map to a polyline's bounds", () => {
    const viewer = makeViewer();
    viewer.init();

    const line = window.L.polyline([
      [49.46, -85.04],
      [49.47, -85.03],
    ]);
    line.addTo(viewer.map);

    const fitBounds = vi.spyOn(viewer.map, "fitBounds");
    const zoom = viewer.map.getZoom();

    viewer.sync_map_to_lightbox({ layer: line });

    expect(fitBounds).toHaveBeenCalledWith(
      line.getBounds(),
      expect.objectContaining({
        animate: false,
        maxZoom: zoom,
      }),
    );
  });

  it("does nothing without an item or layer", () => {
    const viewer = makeViewer();
    viewer.init();

    const panTo = vi.spyOn(viewer.map, "panTo");
    const fitBounds = vi.spyOn(viewer.map, "fitBounds");

    expect(() => {
      viewer.sync_map_to_lightbox(undefined);
      viewer.sync_map_to_lightbox({});
    }).not.toThrow();

    expect(panTo).not.toHaveBeenCalled();
    expect(fitBounds).not.toHaveBeenCalled();
  });

  it("uses the feature title as the thumbnail alt text", () => {
    const viewer = makeGalleryViewer();

    viewer.load_json({
      type: "FeatureCollection",
      features: [
        makeGalleryFeature(
          "Marker",
          "https://example.com/marker-thumb.jpg",
          "https://example.com/marker-large.jpg",
        ),
      ],
    });

    const image = galleryThumbnails()[0].querySelector("img");
    expect(image).not.toBe(null);
    expect(image.getAttribute("alt")).toBe("Marker");
  });
});
