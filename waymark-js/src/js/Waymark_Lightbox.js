/*
	==================================
	=========== LIGHTBOX =============
	==================================
*/

function Waymark_Lightbox() {
  // Defaults let the primitive work before Waymark_Lang strings exist.
  this.strings = {
    action_close: "Close",
    action_previous_image: "Previous image",
    action_next_image: "Next image",
    label_view_full_size: "View full size",
    label_view_image: "View image",
    label_image_viewer: "Image viewer",
    label_image_count: "%1$s of %2$s",
  };

  this.config = {};
  this.items = [];
  this.index = 0;
  this.dialog = null;
  this.trigger = null;
  this.supported = null;

  this.init = function (user_config = {}) {
    this.config = user_config || {};

    var language = this.config.language || {};

    // Read defensively so slice 1 stands alone until translated keys arrive.
    this.strings = {
      action_close: language.action_close || "Close",
      action_previous_image: language.action_previous_image || "Previous image",
      action_next_image: language.action_next_image || "Next image",
      label_view_full_size: language.label_view_full_size || "View full size",
      label_view_image: language.label_view_image || "View image",
      label_image_viewer: language.label_image_viewer || "Image viewer",
      label_image_count: language.label_image_count || "%1$s of %2$s",
    };

    this.items = [];
    this.index = 0;
    this.dialog = null;
    this.trigger = null;
  };

  this.is_supported = function () {
    if (this.supported !== null) {
      return this.supported;
    }

    try {
      this.supported =
        typeof window.HTMLDialogElement !== "undefined" &&
        typeof document.createElement("dialog").showModal === "function";
    } catch (error) {
      this.supported = false;
    }

    return this.supported;
  };

  this.open = function (items, index) {
    // Let the plain link proceed where the dialog API is unavailable.
    if (!this.is_supported()) {
      return false;
    }

    if (!items || !items.length) {
      return false;
    }

    var start_index = Number(index);

    if (
      !Number.isInteger(start_index) ||
      start_index < 0 ||
      start_index >= items.length
    ) {
      return false;
    }

    if (!this.dialog) {
      this.build_dialog();
    }

    var was_open = this.dialog.open;

    this.items = items;

    if (!was_open) {
      this.trigger = document.activeElement;
    }

    this.show_index(start_index);

    if (!was_open) {
      this.dialog.showModal();
    }

    // Focus the labelled dialog itself so assistive tech announces it rather
    // than landing on the first control.
    this.dialog.focus();
    document.documentElement.classList.add("waymark-lightbox-open");

    return true;
  };

  this.show_index = function (index) {
    if (!this.dialog || !this.items.length) {
      return;
    }

    var count = this.items.length;
    var next_index = Number(index);

    if (!Number.isFinite(next_index)) {
      next_index = 0;
    }

    next_index = ((Math.trunc(next_index) % count) + count) % count;
    this.index = next_index;

    var item = this.items[next_index] || {};
    var url = item.url || "";

    var image = this.dialog.querySelector(".waymark-lightbox-image");
    image.src = url;
    image.alt = item.alt || "";

    this.dialog.querySelector(".waymark-lightbox-title").textContent =
      item.title || "";

    this.dialog.querySelector(".waymark-lightbox-count").textContent =
      this.format_count(next_index + 1, count);

    var full = this.dialog.querySelector(".waymark-lightbox-full");
    var href = item.href || url;

    // Never allow a non-HTTP href out of the primitive.
    if (/^https?:\/\//i.test(href)) {
      full.href = href;
      this.dialog.classList.remove("waymark-lightbox-no-full");
    } else {
      full.removeAttribute("href");
      this.dialog.classList.add("waymark-lightbox-no-full");
    }

    this.dialog.classList.toggle("waymark-lightbox-single", count < 2);
  };

  this.prev = function () {
    if (!this.items.length) {
      return;
    }

    this.show_index(this.index - 1);
  };

  this.next = function () {
    if (!this.items.length) {
      return;
    }

    this.show_index(this.index + 1);
  };

  this.close = function () {
    if (!this.dialog || !this.dialog.open) {
      return;
    }

    this.dialog.close();
  };

  this.format_count = function (current, total) {
    return String(this.strings.label_image_count)
      .replace("%1$s", String(current))
      .replace("%2$s", String(total));
  };

  this.build_dialog = function () {
    var dialog = document.createElement("dialog");
    dialog.className = "waymark-lightbox";
    dialog.setAttribute("tabindex", "-1");
    dialog.setAttribute("aria-label", this.strings.label_image_viewer);

    var close = document.createElement("button");
    close.type = "button";
    close.className = "waymark-lightbox-close";
    close.textContent = "\u00d7";
    close.setAttribute("aria-label", this.strings.action_close);

    var prev = document.createElement("button");
    prev.type = "button";
    prev.className = "waymark-lightbox-prev";
    prev.textContent = "\u2039";
    prev.setAttribute("aria-label", this.strings.action_previous_image);

    var next = document.createElement("button");
    next.type = "button";
    next.className = "waymark-lightbox-next";
    next.textContent = "\u203a";
    next.setAttribute("aria-label", this.strings.action_next_image);

    var figure = document.createElement("figure");
    figure.className = "waymark-lightbox-figure";

    var image = document.createElement("img");
    image.className = "waymark-lightbox-image";
    image.alt = "";

    var caption = document.createElement("figcaption");
    caption.className = "waymark-lightbox-caption";
    caption.setAttribute("aria-live", "polite");

    var title = document.createElement("span");
    title.className = "waymark-lightbox-title";

    var count = document.createElement("span");
    count.className = "waymark-lightbox-count";

    var full = document.createElement("a");
    full.className = "waymark-lightbox-full";
    full.target = "_blank";
    full.rel = "noopener noreferrer";
    full.textContent = this.strings.label_view_full_size;

    caption.appendChild(title);
    caption.appendChild(count);
    caption.appendChild(full);

    figure.appendChild(image);
    figure.appendChild(caption);

    dialog.appendChild(close);
    dialog.appendChild(prev);
    dialog.appendChild(figure);
    dialog.appendChild(next);

    close.addEventListener("click", () => {
      this.close();
    });

    prev.addEventListener("click", () => {
      this.prev();
    });

    next.addEventListener("click", () => {
      this.next();
    });

    // The dialog element is the backdrop area when its box is sized to content
    // with no padding, so a click landing on it means a backdrop click.
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) {
        this.close();
      }
    });

    dialog.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        this.prev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        this.next();
      }
    });

    // Every close path converges here: Esc, close button, backdrop and calls
    // to close() all end with this event.
    dialog.addEventListener("close", () => {
      document.documentElement.classList.remove("waymark-lightbox-open");

      if (
        this.trigger &&
        this.trigger.isConnected &&
        typeof this.trigger.focus === "function"
      ) {
        this.trigger.focus();
      }

      this.trigger = null;
    });

    document.body.appendChild(dialog);

    this.dialog = dialog;
  };
}
