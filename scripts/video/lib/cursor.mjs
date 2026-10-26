// Fake pointer, click ring and fake caret for the video recorder.
//
// Playwright does not paint a cursor into a recording. This module injects a
// fixed-position overlay into every document in the recording context, then
// follows the real mouse with `page.mouse.move(..., { steps })`. The overlay
// therefore traces the same smooth path a real pointer would.
//
// The deterministic reset in `tests/e2e/fixtures.js` disables every transition
// with `* { transition: none !important }`. The click ring and highlight fade
// use id-scoped rules with `!important`, which have higher specificity than the
// universal selector, so the short transitions still run. `verifyOverlays`
// checks the computed style rather than assuming it works.
"use strict";

const CURSOR_ID = "waymark-video-cursor";
const CARET_ID = "waymark-video-caret";

/**
 * Injected into every document in the recording context before the first
 * navigation. It must be self-contained: the function is serialised by
 * Playwright and cannot close over module scope.
 */
function installVideoCursor() {
  const STYLE_ID = "waymark-video-cursor-style";
  const ROOT_ID = "waymark-video-cursor";
  const CSS = `
    html,
    body,
    body * {
      cursor: none !important;
    }

    #waymark-video-cursor {
      position: fixed;
      left: 0;
      top: 0;
      width: 0;
      height: 0;
      z-index: 2147483647;
      pointer-events: none !important;
      opacity: 0;
    }

    #waymark-video-cursor.is-visible {
      opacity: 1;
    }

    #waymark-video-cursor.is-hidden {
      opacity: 0 !important;
    }

    #waymark-video-cursor .waymark-video-cursor-dot {
      position: absolute;
      left: -8px;
      top: -8px;
      box-sizing: border-box;
      width: 16px;
      height: 16px;
      border: 3px solid #ffffff;
      border-radius: 50%;
      background: #111111;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.45);
    }

    #waymark-video-cursor .waymark-video-cursor-ring {
      position: absolute;
      left: 0;
      top: 0;
      box-sizing: border-box;
      width: 24px;
      height: 24px;
      margin: -12px 0 0 -12px;
      border: 3px solid rgba(37, 99, 235, 0.95);
      border-radius: 50%;
      background: rgba(37, 99, 235, 0.12);
      transform: scale(0.35);
      opacity: 0.85;
      transition:
        transform 360ms cubic-bezier(0.22, 1, 0.36, 1),
        opacity 360ms ease-out !important;
    }

    #waymark-video-cursor .waymark-video-cursor-ring.is-active {
      transform: scale(2.1);
      opacity: 0;
    }
  `;

  function install() {
    if (!document.body || document.getElementById(ROOT_ID)) {
      return;
    }

    if (!document.getElementById(STYLE_ID)) {
      const style = document.createElement("style");
      style.id = STYLE_ID;
      style.textContent = CSS;
      (document.head || document.documentElement).appendChild(style);
    }

    const root = document.createElement("div");
    root.id = ROOT_ID;
    root.setAttribute("aria-hidden", "true");

    const dot = document.createElement("span");
    dot.className = "waymark-video-cursor-dot";
    root.appendChild(dot);

    document.body.appendChild(root);

    let visible = false;

    function place(event) {
      root.style.transform = `translate(${event.clientX}px, ${event.clientY}px)`;
      root.classList.remove("is-hidden");

      if (!visible) {
        visible = true;
        root.classList.add("is-visible");
      }
    }

    function pulse() {
      const ring = document.createElement("span");
      ring.className = "waymark-video-cursor-ring";
      root.appendChild(ring);

      requestAnimationFrame(function () {
        ring.classList.add("is-active");
      });

      window.setTimeout(function () {
        ring.remove();
      }, 420);
    }

    document.addEventListener("mousemove", place, { passive: true });
    document.addEventListener("mousedown", pulse, true);
    document.addEventListener("mouseup", pulse, true);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", install, { once: true });
  } else {
    install();
  }
}

/**
 * Install the pointer overlay in every document opened by a context.
 *
 * @param {import("@playwright/test").BrowserContext} context
 */
export async function installCursor(context) {
  await context.addInitScript(installVideoCursor);
}

/**
 * Hide the pointer overlay without moving the real mouse. The next pointer move
 * removes the hidden class, so the overlay reappears normally.
 *
 * @param {import("@playwright/test").Page} page
 */
export async function hideCursor(page) {
  await page
    .evaluate((id) => {
      const root = document.getElementById(id);
      if (root) {
        root.classList.add("is-hidden");
      }
    }, CURSOR_ID)
    .catch(() => {});
}

/**
 * Move the real mouse, which drives the overlay through its `mousemove`
 * listener. Coordinates are clamped to the viewport.
 *
 * @param {import("@playwright/test").Page} page
 * @param {number} x
 * @param {number} y
 * @param {{ steps?: number }} [options]
 * @returns {Promise<{ x: number, y: number }>}
 */
export async function moveCursorTo(page, x, y, options = {}) {
  const viewport = page.viewportSize() ?? { width: 1280, height: 720 };
  const clampedX = Math.max(0, Math.min(viewport.width - 1, Number(x)));
  const clampedY = Math.max(0, Math.min(viewport.height - 1, Number(y)));

  await page.mouse.move(clampedX, clampedY, { steps: options.steps ?? 20 });

  return { x: clampedX, y: clampedY };
}

/**
 * Bring an element to the centre of the viewport when it is not already fully
 * visible, then wait for layout to settle. The top inset accounts for the
 * sticky WordPress admin bar, which overlays the top of the viewport without
 * appearing in the element's own box.
 *
 * @param {import("@playwright/test").Page} page
 * @param {import("@playwright/test").Locator} locator
 * @param {((measure: () => Promise<object | null>) => Promise<void>) | undefined} settle
 */
async function centreElementIfNeeded(page, locator, settle) {
  const scrolled = await locator.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const adminBar = document.getElementById("wpadminbar");
    const topInset = adminBar
      ? Math.max(0, adminBar.getBoundingClientRect().bottom)
      : 0;
    const viewportHeight =
      window.innerHeight || document.documentElement.clientHeight;

    if (rect.top >= topInset && rect.bottom <= viewportHeight) {
      return false;
    }

    element.scrollIntoView({ block: "center", inline: "nearest" });
    return true;
  });

  if (!scrolled) {
    return;
  }

  const measure = async () => {
    const box = await locator.boundingBox();
    if (!box) {
      return null;
    }
    return {
      x: Math.round(box.x),
      y: Math.round(box.y),
      width: Math.round(box.width),
      height: Math.round(box.height),
    };
  };

  if (typeof settle === "function") {
    await settle(measure);
    return;
  }

  await page.evaluate(
    () =>
      new Promise((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(resolve));
      }),
  );
}

/**
 * Move the pointer to the centre of a locator.
 *
 * @param {import("@playwright/test").Page} page
 * @param {string} selector
 * @param {{ steps?: number, timeout?: number, centre?: boolean, settle?: (measure: () => Promise<object | null>) => Promise<void> }} [options]
 * @returns {Promise<{ x: number, y: number }>}
 */
export async function moveCursorToSelector(page, selector, options = {}) {
  const locator = page.locator(selector).first();
  await locator.waitFor({
    state: "visible",
    timeout: options.timeout ?? 15000,
  });

  if (options.centre) {
    await centreElementIfNeeded(page, locator, options.settle);
  } else {
    await locator.scrollIntoViewIfNeeded();
  }

  const box = await locator.boundingBox();
  if (!box) {
    throw new Error(
      `Cannot move the cursor: "${selector}" has no bounding box.`,
    );
  }

  return moveCursorTo(
    page,
    box.x + box.width / 2,
    box.y + box.height / 2,
    options,
  );
}

/**
 * Apply a scenario `cursor` field.
 *
 * @param {import("@playwright/test").Page} page
 * @param {{ to?: string, x?: number, y?: number }} cursor
 * @returns {Promise<{ x: number, y: number }>}
 */
export async function applyCursor(page, cursor) {
  if (cursor && typeof cursor.to === "string") {
    return moveCursorToSelector(page, cursor.to);
  }

  if (cursor && Number.isFinite(cursor.x) && Number.isFinite(cursor.y)) {
    return moveCursorTo(page, cursor.x, cursor.y);
  }

  throw new Error(
    'Cursor must be { "to": "<selector>" } or { "x": <number>, "y": <number> }.',
  );
}

/**
 * Move the pointer over a selector, then click it with Playwright's normal
 * actionability checks. The real mouse events drive the overlay ring.
 *
 * @param {import("@playwright/test").Page} page
 * @param {string} selector
 * @param {{ centre?: boolean, settle?: (measure: () => Promise<object | null>) => Promise<void> }} [options]
 */
export async function clickWithCursor(page, selector, options = {}) {
  const point = await moveCursorToSelector(page, selector, options);
  const locator = page.locator(selector).first();

  // Some controls reveal themselves on hover and hide the element that was
  // targeted. Leaflet's layers toggle is the canonical example: moving onto
  // it expands the control and sets `display: none` on the toggle itself. If
  // that happens, click the real coordinates instead of waiting for an
  // element that can never become visible again.
  const visible = await locator.isVisible().catch(() => false);
  if (!visible) {
    await page.mouse.click(point.x, point.y);
    return point;
  }

  try {
    await locator.click({ timeout: 5000 });
  } catch {
    await page.mouse.click(point.x, point.y);
  }

  return point;
}

/**
 * Position a fake caret at the end of the field's current text. The native
 * caret is hidden by the deterministic reset, so this element is the visible
 * typing beat.
 *
 * @param {import("@playwright/test").Page} page
 * @param {string} selector
 */
export async function showCaret(page, selector) {
  const locator = page.locator(selector).first();
  await locator.waitFor({ state: "visible", timeout: 15000 });

  const geometry = await locator.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    const value =
      typeof element.value === "string"
        ? element.value
        : (element.textContent ?? "");

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (context) {
      context.font = [
        style.fontStyle,
        style.fontWeight,
        style.fontSize,
        style.fontFamily,
      ].join(" ");
    }

    const textWidth = context ? context.measureText(value).width : 0;
    const paddingLeft = Number.parseFloat(style.paddingLeft) || 0;
    const paddingTop = Number.parseFloat(style.paddingTop) || 0;
    const scrollLeft = Number(element.scrollLeft) || 0;
    const lineHeight =
      Number.parseFloat(style.lineHeight) || rect.height - paddingTop * 2;

    return {
      left: Math.max(
        rect.left,
        Math.min(
          rect.right - 2,
          rect.left + paddingLeft + textWidth - scrollLeft,
        ),
      ),
      top: rect.top + paddingTop,
      height: Math.max(12, Math.min(rect.height - paddingTop, lineHeight)),
    };
  }, undefined);

  await page.evaluate(({ left, top, height }) => {
    let caret = document.getElementById("waymark-video-caret");

    if (!caret) {
      const style = document.createElement("style");
      style.id = "waymark-video-caret-style";
      style.textContent =
        "#waymark-video-caret{" +
        "position:fixed;" +
        "z-index:2147483645;" +
        "pointer-events:none !important;" +
        "width:2px;" +
        "background:#111111;" +
        "box-shadow:0 0 0 1px rgba(255,255,255,0.8);" +
        "}";
      (document.head || document.documentElement).appendChild(style);

      caret = document.createElement("div");
      caret.id = "waymark-video-caret";
      caret.setAttribute("aria-hidden", "true");
      document.body.appendChild(caret);
    }

    caret.style.left = `${left}px`;
    caret.style.top = `${top}px`;
    caret.style.height = `${height}px`;
    caret.style.display = "block";
  }, geometry);
}

/**
 * Remove the fake caret at the end of a scene.
 *
 * @param {import("@playwright/test").Page} page
 */
export async function clearCaret(page) {
  await page
    .evaluate(() => {
      const caret = document.getElementById("waymark-video-caret");
      if (caret) {
        caret.remove();
      }
    })
    .catch(() => {});
}

/**
 * Report the computed state of the injected pointer and caret overlays. Used by
 * the verification run to prove that the specificity override works against
 * the deterministic reset.
 *
 * @param {import("@playwright/test").Page} page
 */
export async function inspectOverlays(page) {
  return page.evaluate(() => {
    const cursor = document.getElementById("waymark-video-cursor");
    const ring = cursor?.querySelector(".waymark-video-cursor-ring");
    const caret = document.getElementById("waymark-video-caret");
    const rootStyle = cursor ? window.getComputedStyle(cursor) : null;
    const ringStyle = ring ? window.getComputedStyle(ring) : null;
    const caretStyle = caret ? window.getComputedStyle(caret) : null;

    return {
      cursor: cursor
        ? {
            exists: true,
            position: rootStyle?.position,
            zIndex: rootStyle?.zIndex,
            pointerEvents: rootStyle?.pointerEvents,
          }
        : { exists: false },
      ring: ring
        ? {
            exists: true,
            transitionDuration: ringStyle?.transitionDuration,
            transitionProperty: ringStyle?.transitionProperty,
          }
        : { exists: false },
      caret: caret
        ? {
            exists: true,
            position: caretStyle?.position,
            zIndex: caretStyle?.zIndex,
          }
        : { exists: false },
    };
  });
}

export { CURSOR_ID, CARET_ID };
