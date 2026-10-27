// Target outline for the video recorder.
//
// The outline is a fixed-position element measured from the target's
// `getBoundingClientRect()`, so it never affects layout. It fades in and out
// with an id-scoped `!important` transition, which beats the deterministic
// `* { transition: none !important }` reset on specificity.
//
// One visual language is used everywhere: a green outline, a dark definition
// ring, a soft halo and a drop shadow. `highlight: null` means no outline. Each
// scene owns its outline
// state: a scene with a highlight draws or updates it after its action, and a
// scene without one clears it. Re-applying the same selector only moves the
// rectangle, so consecutive scenes never fade the outline out and back in.
"use strict";

const HIGHLIGHT_ID = "waymark-video-highlight";
const STYLE_ID = "waymark-video-highlight-style";
const FADE_MS = 140;

const CSS = `
  #waymark-video-highlight {
    position: fixed;
    z-index: 2147483646;
    box-sizing: border-box;
    pointer-events: none !important;
    border: 3px solid rgba(13, 215, 13, 0.95);
    border-radius: 6px;
    box-shadow:
      0 0 0 1px rgba(0, 0, 0, 0.45),
      0 0 0 4px rgba(13, 215, 13, 0.18),
      0 8px 24px rgba(0, 0, 0, 0.28);
    opacity: 0;
    transition: opacity ${FADE_MS}ms ease-out !important;
  }

  #waymark-video-highlight.is-visible {
    opacity: 1;
  }
`;

/**
 * Draw or update the outline around a target.
 *
 * Re-applying the selector that is already outlined only repositions the
 * existing element. The element is replaced (and faded back in) only when the
 * selector changes or the page has navigated since the last call.
 *
 * @param {import("@playwright/test").Page} page
 * @param {{ selector: string, pad?: number }} highlight
 */
export async function showHighlight(page, highlight) {
  const { selector, pad = 8 } = highlight;
  const locator = page.locator(selector).first();

  await locator.waitFor({ state: "visible", timeout: 15000 });

  const rect = await locator.evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    return {
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
    };
  });

  if (!rect.width && !rect.height) {
    throw new Error(`Cannot highlight "${selector}": the target has no size.`);
  }

  await page.evaluate(
    ({
      rect: bounds,
      pad: padding,
      selector: target,
      styleId,
      elementId,
      css,
    }) => {
      if (!document.getElementById(styleId)) {
        const style = document.createElement("style");
        style.id = styleId;
        style.textContent = css;
        (document.head || document.documentElement).appendChild(style);
      }

      let element = document.getElementById(elementId);
      let created = false;

      if (element && element.dataset.highlightSelector !== target) {
        // The selector changed (or the page was replaced): drop the old outline
        // and build a fresh one so it fades in around the new target.
        element.remove();
        element = null;
      }

      if (!element) {
        element = document.createElement("div");
        element.id = elementId;
        element.setAttribute("aria-hidden", "true");
        element.dataset.highlightSelector = target;
        document.body.appendChild(element);
        created = true;
      }

      element.style.left = `${bounds.x - padding}px`;
      element.style.top = `${bounds.y - padding}px`;
      element.style.width = `${bounds.width + padding * 2}px`;
      element.style.height = `${bounds.height + padding * 2}px`;

      if (created || !element.classList.contains("is-visible")) {
        requestAnimationFrame(() => {
          element.classList.add("is-visible");
        });
      }
    },
    {
      rect,
      pad: Number(pad),
      selector,
      styleId: STYLE_ID,
      elementId: HIGHLIGHT_ID,
      css: CSS,
    },
  );
}

/**
 * Keep an already-drawn outline on its target while the page is still moving.
 *
 * A Leaflet popup autoPan, an explicit scroll or a late layout pass can move
 * the target after an action has returned. The outline is fixed in viewport
 * coordinates, so it is repositioned on every animation frame until the
 * target's rounded rectangle has held still for `quietMs`. Following the
 * target means the outline never has to jump to a corrected position once the
 * motion ends.
 *
 * @param {import("@playwright/test").Page} page
 * @param {{ selector: string, pad?: number }} highlight
 * @param {{ quietMs?: number, timeoutMs?: number }} [options]
 * @returns {Promise<{ tracked: boolean, stable: boolean, elapsed: number, rect: { x: number, y: number, width: number, height: number } | null }>}
 */
export async function trackHighlight(page, highlight, options = {}) {
  const { selector, pad = 8 } = highlight;
  const quietMs = options.quietMs ?? 160;
  const timeoutMs = options.timeoutMs ?? 2000;

  return page.evaluate(
    ({
      selector: target,
      pad: padding,
      quietMs: quiet,
      timeoutMs: timeout,
      elementId,
    }) =>
      new Promise((resolve) => {
        const element = document.getElementById(elementId);

        if (!element) {
          resolve({ tracked: false, stable: false, elapsed: 0, rect: null });
          return;
        }

        const startedAt = performance.now();
        let lastKey = null;
        let lastChangeAt = startedAt;
        let latest = null;

        function step() {
          const now = performance.now();
          const targetElement = document.querySelector(target);

          if (targetElement) {
            const bounds = targetElement.getBoundingClientRect();

            if (bounds.width || bounds.height) {
              const key = [
                Math.round(bounds.x),
                Math.round(bounds.y),
                Math.round(bounds.width),
                Math.round(bounds.height),
              ].join(",");

              if (key !== lastKey) {
                lastKey = key;
                lastChangeAt = now;
              }

              latest = {
                x: bounds.x,
                y: bounds.y,
                width: bounds.width,
                height: bounds.height,
              };

              element.style.left = `${bounds.x - padding}px`;
              element.style.top = `${bounds.y - padding}px`;
              element.style.width = `${bounds.width + padding * 2}px`;
              element.style.height = `${bounds.height + padding * 2}px`;
            }
          }

          const stable = now - lastChangeAt >= quiet;

          if (stable || now - startedAt >= timeout) {
            resolve({
              tracked: Boolean(latest),
              stable,
              elapsed: now - startedAt,
              rect: latest,
            });
            return;
          }

          requestAnimationFrame(step);
        }

        requestAnimationFrame(step);
      }),
    {
      selector,
      pad: Number(pad),
      quietMs,
      timeoutMs,
      elementId: HIGHLIGHT_ID,
    },
  );
}

/**
 * Fade out and remove the outline. Safe to call when no outline exists.
 *
 * @param {import("@playwright/test").Page} page
 * @param {{ fade?: boolean }} [options]
 */
export async function clearHighlight(page, options = {}) {
  const fade = options.fade ?? true;

  const existed = await page
    .evaluate((elementId) => {
      const element = document.getElementById(elementId);
      if (!element) {
        return false;
      }
      element.classList.remove("is-visible");
      return true;
    }, HIGHLIGHT_ID)
    .catch(() => false);

  if (fade && existed) {
    await page.waitForTimeout(FADE_MS + 20).catch(() => {});
  }

  await page
    .evaluate((elementId) => {
      const element = document.getElementById(elementId);
      if (element) {
        element.remove();
      }
    }, HIGHLIGHT_ID)
    .catch(() => {});
}

/**
 * Read the computed style of the injected outline. Used by the verification run
 * to prove that the fade survives the deterministic transition reset.
 *
 * @param {import("@playwright/test").Page} page
 */
export async function inspectHighlight(page) {
  return page.evaluate((elementId) => {
    const element = document.getElementById(elementId);
    if (!element) {
      return { exists: false };
    }

    const style = window.getComputedStyle(element);

    return {
      exists: true,
      position: style.position,
      zIndex: style.zIndex,
      pointerEvents: style.pointerEvents,
      transitionProperty: style.transitionProperty,
      transitionDuration: style.transitionDuration,
      opacity: style.opacity,
    };
  }, HIGHLIGHT_ID);
}

export { HIGHLIGHT_ID };
