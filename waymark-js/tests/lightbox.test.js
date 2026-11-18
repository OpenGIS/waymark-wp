import { describe, it, expect, beforeEach } from "vitest";

function makeItems(count = 1) {
  const items = [];

  for (let i = 0; i < count; i++) {
    items.push({
      url: `https://example.com/image-${i}.jpg`,
      alt: `Image ${i}`,
      title: `Title ${i}`,
      href: `https://example.com/full-${i}.jpg`,
    });
  }

  return items;
}

function makeLightbox(config = {}) {
  const lightbox = new window.Waymark_Lightbox();
  lightbox.init(config);
  return lightbox;
}

function getDialog() {
  return document.querySelector("dialog.waymark-lightbox");
}

describe("Waymark_Lightbox", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    document.documentElement.classList.remove("waymark-lightbox-open");
  });

  it("reports support when the dialog API is available", () => {
    const lightbox = makeLightbox();

    expect(lightbox.is_supported()).toBe(true);
  });

  it("does not open or create a dialog without items", () => {
    const lightbox = makeLightbox();

    expect(lightbox.open([], 0)).toBe(false);
    expect(getDialog()).toBe(null);
  });

  it("does not open or create a dialog for an out-of-range index", () => {
    const lightbox = makeLightbox();

    expect(lightbox.open(makeItems(1), 1)).toBe(false);
    expect(getDialog()).toBe(null);
  });

  it("creates one dialog and reflects the first item", () => {
    const lightbox = makeLightbox();
    const items = makeItems(1);

    expect(lightbox.open(items, 0)).toBe(true);

    expect(document.querySelectorAll("dialog.waymark-lightbox").length).toBe(1);

    const dialog = getDialog();
    const image = dialog.querySelector(".waymark-lightbox-image");

    expect(dialog.open).toBe(true);
    expect(image.getAttribute("src")).toBe(items[0].url);
    expect(image.getAttribute("alt")).toBe(items[0].alt);
    expect(dialog.querySelector(".waymark-lightbox-count").textContent).toBe(
      "1 of 1",
    );
    expect(
      document.documentElement.classList.contains("waymark-lightbox-open"),
    ).toBe(true);
    expect(dialog.classList.contains("waymark-lightbox-single")).toBe(true);

    // A second open reuses the same element.
    lightbox.open(items, 0);
    expect(document.querySelectorAll("dialog.waymark-lightbox").length).toBe(1);
  });

  it("wraps next, prev and show_index within the item list", () => {
    const lightbox = makeLightbox();
    lightbox.open(makeItems(3), 0);

    const title = () =>
      getDialog().querySelector(".waymark-lightbox-title").textContent;

    lightbox.next();
    expect(title()).toBe("Title 1");

    lightbox.next();
    expect(title()).toBe("Title 2");

    lightbox.next();
    expect(title()).toBe("Title 0");

    lightbox.prev();
    expect(title()).toBe("Title 2");

    lightbox.show_index(3);
    expect(lightbox.index).toBe(0);

    lightbox.show_index(-1);
    expect(lightbox.index).toBe(2);
  });

  it("closes and restores focus to the opener", () => {
    const lightbox = makeLightbox();
    const opener = document.createElement("button");
    opener.textContent = "Open image";
    document.body.appendChild(opener);
    opener.focus();

    lightbox.open(makeItems(1), 0);

    const dialog = getDialog();
    expect(dialog.open).toBe(true);

    lightbox.close();

    expect(dialog.open).toBe(false);
    expect(
      document.documentElement.classList.contains("waymark-lightbox-open"),
    ).toBe(false);
    expect(document.activeElement).toBe(opener);
  });

  it("points the full-size link at the current item", () => {
    const lightbox = makeLightbox();
    const items = makeItems(2);
    lightbox.open(items, 0);

    const dialog = getDialog();
    const link = dialog.querySelector(".waymark-lightbox-full");

    expect(link.getAttribute("href")).toBe(items[0].href);
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.textContent).toBe("View full size");

    lightbox.next();
    expect(link.getAttribute("href")).toBe(items[1].href);
  });

  it("shows prev and next when there is more than one item", () => {
    const lightbox = makeLightbox();
    lightbox.open(makeItems(2), 0);

    expect(getDialog().classList.contains("waymark-lightbox-single")).toBe(
      false,
    );
  });

  it("inserts feature text as text, not HTML", () => {
    const lightbox = makeLightbox();
    const payload = "<b>bold</b> & <i>italic</i>";

    lightbox.open(
      [{ url: "https://example.com/a.jpg", alt: payload, title: payload }],
      0,
    );

    const dialog = getDialog();
    const title = dialog.querySelector(".waymark-lightbox-title");
    const image = dialog.querySelector(".waymark-lightbox-image");

    expect(title.textContent).toBe(payload);
    expect(title.children.length).toBe(0);
    expect(image.getAttribute("alt")).toBe(payload);
  });

  it("closes when the backdrop is clicked", () => {
    const lightbox = makeLightbox();
    lightbox.open(makeItems(1), 0);

    const dialog = getDialog();
    dialog.dispatchEvent(new window.Event("click"));

    expect(dialog.open).toBe(false);
    expect(
      document.documentElement.classList.contains("waymark-lightbox-open"),
    ).toBe(false);
  });

  it("applies translated viewer labels from the language config", () => {
    const lightbox = makeLightbox({
      language: {
        label_image_viewer: "Visualiseur",
        label_view_image: "Voir l'image",
      },
    });

    lightbox.open(makeItems(1), 0);

    expect(getDialog().getAttribute("aria-label")).toBe("Visualiseur");
    expect(lightbox.strings.label_view_image).toBe("Voir l'image");
  });

  it("steps with the arrow keys", () => {
    const lightbox = makeLightbox();
    lightbox.open(makeItems(2), 0);

    const dialog = getDialog();

    dialog.dispatchEvent(
      new window.KeyboardEvent("keydown", { key: "ArrowRight" }),
    );
    expect(lightbox.index).toBe(1);

    dialog.dispatchEvent(
      new window.KeyboardEvent("keydown", { key: "ArrowLeft" }),
    );
    expect(lightbox.index).toBe(0);
  });

  it("calls on_navigate with the item and index when moving next", () => {
    const calls = [];
    const lightbox = makeLightbox({
      on_navigate: (item, index) => calls.push([item, index]),
    });
    const items = makeItems(2);
    lightbox.open(items, 0);

    lightbox.next();

    expect(calls.length).toBe(1);
    expect(calls[0][0]).toBe(items[1]);
    expect(calls[0][1]).toBe(1);
  });

  it("calls on_navigate when moving prev and wraps backwards", () => {
    const calls = [];
    const lightbox = makeLightbox({
      on_navigate: (item, index) => calls.push([item, index]),
    });
    const items = makeItems(3);
    lightbox.open(items, 0);

    lightbox.prev();

    expect(calls.length).toBe(1);
    expect(calls[0][0]).toBe(items[2]);
    expect(calls[0][1]).toBe(2);
  });

  it("does not call on_navigate when opening", () => {
    let count = 0;
    const lightbox = makeLightbox({
      on_navigate: () => {
        count++;
      },
    });

    lightbox.open(makeItems(2), 0);
    lightbox.show_index(1);

    expect(count).toBe(0);
  });

  it("works without an on_navigate callback", () => {
    const lightbox = makeLightbox();
    lightbox.open(makeItems(2), 0);

    expect(() => {
      lightbox.next();
      lightbox.prev();
    }).not.toThrow();
  });
});
