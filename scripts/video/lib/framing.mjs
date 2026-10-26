// Shared element framing for the video recorder.
//
// Click, hover, scroll and cursor placement all need the same guarantee: the
// target is fully inside the viewport that the sticky WordPress admin bar
// leaves visible. This module measures that inset, skips scrolling for an
// already-visible target and verifies the result of any scroll it performs, so
// a clipped frame fails the take instead of reaching the encode.
"use strict";

const ADMIN_BAR_SELECTOR = "#wpadminbar";
const BLOCKS = new Set(["center", "start", "end"]);

/**
 * Default settle when a caller does not supply one: wait for two animation
 * frames so the browser has applied the new scroll position.
 *
 * @param {import("@playwright/test").Page} page
 */
async function settleFrames(page) {
  await page.evaluate(
    () =>
      new Promise((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(resolve));
      }),
  );
}

/**
 * Measure an element and the inset viewport in one evaluate. The admin bar is
 * measured live, so the helper also works on pages without one (the inset is
 * then zero).
 *
 * @param {import("@playwright/test").Locator} locator
 * @returns {Promise<{ top: number, bottom: number, height: number, topInset: number, viewportHeight: number, scrollY: number, fullyVisible: boolean }>}
 */
async function measure(locator) {
  return locator.evaluate((element, barSelector) => {
    const rect = element.getBoundingClientRect();
    const adminBar = document.querySelector(barSelector);
    const topInset = adminBar
      ? Math.max(0, adminBar.getBoundingClientRect().bottom)
      : 0;
    const viewportHeight =
      window.innerHeight || document.documentElement.clientHeight;

    return {
      top: rect.top,
      bottom: rect.bottom,
      height: rect.height,
      topInset,
      viewportHeight,
      scrollY: window.scrollY,
      fullyVisible: rect.top >= topInset && rect.bottom <= viewportHeight,
    };
  }, ADMIN_BAR_SELECTOR);
}

/**
 * Scroll an element into the inset viewport. Native `scrollIntoView` handles
 * nested scroll containers; the follow-up `scrollBy` corrects the offset so
 * `start` clears the admin bar, `end` clears the bottom edge and `center`
 * centres inside the visible band rather than the full viewport.
 *
 * @param {import("@playwright/test").Locator} locator
 * @param {"center" | "start" | "end"} block
 */
async function scrollIntoInset(locator, block) {
  await locator.evaluate(
    (element, { block: requested, barSelector }) => {
      element.scrollIntoView({ block: requested, inline: "nearest" });

      const rect = element.getBoundingClientRect();
      const adminBar = document.querySelector(barSelector);
      const topInset = adminBar
        ? Math.max(0, adminBar.getBoundingClientRect().bottom)
        : 0;
      const viewportHeight =
        window.innerHeight || document.documentElement.clientHeight;

      let delta;
      if (requested === "start") {
        delta = rect.top - topInset;
      } else if (requested === "end") {
        delta = rect.bottom - viewportHeight;
      } else {
        delta = rect.top + rect.height / 2 - (topInset + viewportHeight) / 2;
      }

      // Round the target scroll position in the direction that keeps the
      // requested edge inside the inset viewport. Sub-pixel layout offsets
      // would otherwise leave a `start` target a fraction above the admin bar
      // after the browser rounds the scroll position.
      const target = window.scrollY + delta;
      const next =
        requested === "start"
          ? Math.floor(target)
          : requested === "end"
            ? Math.ceil(target)
            : Math.round(target);

      if (next !== window.scrollY) {
        window.scrollTo(0, next);
      }
    },
    { block, barSelector: ADMIN_BAR_SELECTOR },
  );
}

/**
 * Ensure a locator is fully inside the viewport below the admin bar.
 *
 * A target that is already fully visible is not scrolled. Otherwise it is
 * scrolled into view, the caller's settle routine runs, and the result is
 * measured again. A target that is still clipped throws, naming the selector
 * and both edges, unless `allowPartial` is set: that downgrades the failure to
 * a warning so a deliberately tall target can be filmed with a clamped pointer.
 *
 * @param {import("@playwright/test").Page} page
 * @param {import("@playwright/test").Locator} locator
 * @param {{
 *   selector?: string,
 *   sceneId?: string,
 *   block?: "center" | "start" | "end",
 *   allowPartial?: boolean,
 *   settle?: (measure: () => Promise<object | null>) => Promise<void>,
 * }} [options]
 * @returns {Promise<{ scrolled: boolean, initial: object, final: object }>}
 */
export async function ensureVisible(page, locator, options = {}) {
  const block = options.block ?? "center";
  if (!BLOCKS.has(block)) {
    throw new Error(
      `"block" must be "center", "start" or "end", received "${block}".`,
    );
  }

  const selector =
    typeof options.selector === "string" && options.selector !== ""
      ? options.selector
      : "(unknown)";
  const sceneId = options.sceneId ?? "?";
  const allowPartial = options.allowPartial === true;

  const initial = await measure(locator);
  if (initial.fullyVisible) {
    return { scrolled: false, initial, final: initial };
  }

  await scrollIntoInset(locator, block);

  const measureBox = async () => {
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

  if (typeof options.settle === "function") {
    await options.settle(measureBox);
  } else {
    await settleFrames(page);
  }

  const final = await measure(locator);
  if (final.fullyVisible) {
    return { scrolled: true, initial, final };
  }

  if (allowPartial) {
    console.warn(
      `[video] WARNING: Scene "${sceneId}": target "${selector}" is taller ` +
        `than the viewport; the pointer will be clamped.`,
    );
    return { scrolled: true, initial, final };
  }

  throw new Error(
    `Target "${selector}" is still clipped after scrolling ` +
      `(top ${Math.round(final.top)}px, bottom ${Math.round(
        final.bottom,
      )}px, viewport ${Math.round(final.topInset)}–${Math.round(
        final.viewportHeight,
      )}px). If the target is genuinely taller than the viewport, set ` +
      `"allowPartial": true on the scene.`,
  );
}
