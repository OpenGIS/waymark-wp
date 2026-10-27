// Self-contained title and end cards for the video recorder.
//
// A card is a typographic 1280x720 overlay rendered over the page itself, not
// an ffmpeg overlay. It lives in a full-viewport shadow root so WordPress admin
// CSS cannot reach it and its own styles cannot leak into the page. The Open GIS
// mark is read from the plugin's vendored SVG and inlined, so the overlay has no
// images, webfonts or external references and makes no network requests. Every
// value comes from the scenario and is escaped before it reaches the document.
"use strict";

import { readFileSync } from "node:fs";

const CARD_HOST_ID = "waymark-card-overlay";
const CARD_MARKER = "waymarkCard";

const TYPE_STACK =
  'ui-monospace, "SFMono-Regular", "SF Mono", Menlo, Consolas, "Liberation Mono", monospace';

// A deterministic 64x64 dither tile. Every pixel is the brand field with a
// green offset of at most one level, so the field stops being a perfectly flat
// patch without changing its perceived colour. It is embedded as a data URI to
// keep the card offline. The tile is stable run to run; the build also applies
// a temporal chroma stabiliser to the opening card only, because the capture
// encoder can still vary a near-black field's chroma between frames.
const CARD_TEXTURE =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAIAAAAlC+aJAAAFVUlEQVR42o2aUY7jMAxD+03x/uddYGe3E0d8TIBB0Qma2LElkqL8+czn489Hfz+/3/X/+8/F7/W5XJnLLdef+XLl51PnF52P2t/3KErj/vwdj9hTvA6py+RuT7wNQ+Pdnny7qPMJOt9Ka0r/XkDnPOZ8pevjdK7u9UFKU5nz9j3KbdVvT4jrsqPjCJ69fnF+t7hSWlfx5uznOz1fZ3DeYuT7PQy5I3vO4BleuTnHvm6RUxQp/Wue+qxACNmzY33vtc5b9pBzzl5pUXf63uL7NlyczLGtTsvZEzFm8w6bvZAD4TopJgld/u2AUlhrwasX1BpG2rHhGqJaAem19rP2UNck3mNoLcakt+oAsknAsJlT42oH7fdnR4AKUFwpTfdW3LZLKSq0sPX2ZWf/bbgbuOeNi/Mmnoq0unMgslJc/riIhhvDnVoJR2ktzu8dRXFyRNi0e5scAvUqYUKMK4EcUnqZCDiTwKqA0ualO3oaoGCAO7XS63b79Tc6d8Mpv5UgIean9w4QnG3OGqDw/qrDjFGo3TX2slgwT85peQyspzQtpwVSVSVx6j8X84LdYsBJqJC+2IM5KVNB/BBka/3NF0ad0N0r8QXpJc5gJeASQJYSCcaS4/rXUNZ8xRUBNyt5rb2AagbE3N6NuxZS0h4DzNWjnKijx2qsDajG8i4pC0FGop0VWjFIDAXdpCiN4nxP+jqNzF+bmFVr8IF9m4S/u9CJZbHrhuccGAg1c1BOqqHEAU0Wg0+0MMuh22fmF1cO39QWkdfwe9XSbJLBo6R2f3PAnPtFNpI3oVRMTrIV3sBoLAyu24WFM1XiU4ndbFTpKVxjbVDo/9cXErsGMXCJaClztlAj9SHA8UJNgWVLhRoxROwKRgIh4N+6SMwDhxrdACwA3agZiUaIeqJw2hUmGW2364f7aRaDbwwcs1Jw3R/XsCEE/7kLBaDZsepsHY3hSSzmFyX/PNmEz46VkjtksERdDTKnwsMQ4uIRtQsag0NvgGoDrZCmoueoZsXG3z1WYHUy3Hv6mmsageajUrO8/Eb2TNHiesUsmcRm8kDjhxyQqe7ldT6ty7Jv81NIlM4FGVVvKmPiBH1qyPqJCP0kxUg1Rc4yEHOsELK9LpCHsWlVfDXz6w2bSE5are+MP5X5yduJq2hOvlgelI7WGwmE3miZxKOaMCyS2NkuIBbFgWI9IJZKBdpinyLq1t6lnFQGzSrQJvneQ1qIHDWzUyu2QwTl/64fikVAY71STrtNKy6ICV4F7mopxAZg/bDXu/2r1IJ32iLyqGnrS/NUUHPHOMx5SW6K6rkByjZD4kaWdKqcqAP068xpjeQnq8xJb700UQiOqB1f6kR0ZL06ecWeMJfIMaGLeRxJUNyFuNepewcFJU5RAQKrq/exNwPMC/DNVt6AiVmaSMUCK6rusTs40AEbqshitWXgmjcsrqcDNVMb9wY4+TV39eJMTRcF/fCKagDohQSmxXXMgYKMXfaRcHpTWCmlVgQP9xNbehJhSh3ikpR+Z7OSVDbT8/dLgAvxIb5+dInEY9yfPu9yhs1bSnSNTlGhBLKkzJzMWqXTNG8K0aM/YBaPrhs6qelZYnfYCe6Ut9WNdqfecG70sXVpPp1APclyZLOfsXOpyAx1tKoj8sYDdjprIihZzIIvnqTRh89jTq3lVHubejp4NyB73vgosxscvSLpx5hiL6OfeqWjWO95TTuEaNNL17Zom+jgmtlNtf1KADj74Kvrca95IsVYDYppKArPIg0jymXhIAB71d6MFrp3MlE1/sUHha9jNUWphLCGAyjUqPST3h72lQ1a5nLLH24jsGoYOROAAAAAAElFTkSuQmCC";

const LOGO_PATH = new URL(
  "../../../assets/img/ogis-logo-white.svg",
  import.meta.url,
);

const BRAND_NAME = "Open GIS";
const PRODUCT_NAME = "Waymark";

/**
 * Escape a value for use in HTML text or a quoted attribute.
 *
 * @param {string} value
 * @returns {string}
 */
function escapeHTML(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Render a subtitle, turning each newline into a line break. Every segment is
 * escaped separately, so a break cannot bypass escaping. A space follows each
 * break so the extracted text content still reads as one continuous sentence.
 *
 * @param {string} value
 * @returns {string}
 */
function renderSubtitle(value) {
  return String(value)
    .split(/\r?\n/)
    .map((line) => escapeHTML(line))
    .join("<br> ");
}

/**
 * Inline the vendored Open GIS mark with an accessible name. The SVG is read
 * from disk at render time rather than copied into this module, so the brand
 * source stays the single authority. No external reference is added.
 *
 * @returns {string}
 */
function inlineLogo() {
  const svg = readFileSync(LOGO_PATH, "utf8").trim();
  const openingEnd = svg.indexOf(">");

  if (!svg.startsWith("<svg") || openingEnd === -1) {
    throw new Error(`The Open GIS logo is not a valid SVG: ${LOGO_PATH}`);
  }

  const openingTag = svg
    .slice(0, openingEnd + 1)
    .replace(/^<svg\b/, '<svg role="img" class="card-logo"')
    .replace(/\s+aria-hidden="[^"]*"/g, "");

  return `${openingTag}<title>${BRAND_NAME}</title>${svg.slice(openingEnd + 1)}`;
}

/**
 * A stable key for one card's content, used to skip a redundant re-render when
 * the recorded pre-warm already put the same card on screen.
 *
 * @param {{ eyebrow?: string, title: string, subtitle?: string }} card
 * @returns {string}
 */
function cardKey(card) {
  return JSON.stringify({
    eyebrow: card.eyebrow ?? "",
    title: card.title,
    subtitle: card.subtitle ?? "",
  });
}

/**
 * Render the contents of a card's shadow root: its styles and markup.
 *
 * The overlay host is fixed to the viewport, so the shadow root fills the same
 * 1280x720 frame the old stand-alone document did. The eyebrow sits at roughly
 * 38% of the frame height: a fixed top padding keeps that position stable when
 * the subtitle wraps, while the remaining space below stays generous. A newline
 * in the subtitle is rendered as a line break. All measurements are for the
 * fixed 1280x720 recording viewport.
 *
 * @param {{ eyebrow?: string, title: string, subtitle?: string }} card
 * @returns {string}
 */
export function renderCard(card) {
  if (!card || typeof card !== "object" || Array.isArray(card)) {
    throw new Error("A card must be an object.");
  }

  if (typeof card.title !== "string" || card.title.trim() === "") {
    throw new Error('A card requires a non-empty string "title".');
  }

  const title = escapeHTML(card.title);
  const eyebrow =
    typeof card.eyebrow === "string" && card.eyebrow.trim() !== ""
      ? escapeHTML(card.eyebrow)
      : "";
  const subtitle =
    typeof card.subtitle === "string" && card.subtitle.trim() !== ""
      ? renderSubtitle(card.subtitle)
      : "";

  const eyebrowMarkup = eyebrow
    ? `<div class="card-eyebrow">${inlineLogo()}<span>${eyebrow}</span></div>`
    : "";
  const subtitleMarkup = subtitle
    ? `<p class="card-subtitle">${subtitle}</p>`
    : "";

  return `<style>
  :host {
    position: fixed;
    inset: 0;
    z-index: 2147483647;
    display: block;
    margin: 0;
    background-color: #000b00;
    background-image: url("${CARD_TEXTURE}");
    background-repeat: repeat;
    background-size: 64px 64px;
    overflow: hidden;
    font-family: ${TYPE_STACK};
    -webkit-font-smoothing: antialiased;
    color-scheme: dark;
  }

  .card {
    position: relative;
    box-sizing: border-box;
    height: 100%;
    padding: 274px 128px 96px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .card-eyebrow {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 0;
    font-size: 14px;
    font-weight: 500;
    line-height: 22px;
    letter-spacing: 0.18em;
    color: #e8f5ea;
  }

  .card-logo {
    display: block;
    width: 40px;
    height: 40px;
    flex: none;
    fill: #ffffff;
    shape-rendering: geometricPrecision;
  }

  .card-rule {
    width: 140px;
    height: 3px;
    margin: 20px 0 28px;
    background: #0dd70d;
    flex: none;
  }

  .card-title {
    margin: 0;
    max-width: 1024px;
    font-size: 88px;
    font-weight: 600;
    line-height: 1.05;
    color: #e8f5ea;
    overflow-wrap: break-word;
  }

  .card-subtitle {
    margin: 30px 0 0;
    max-width: 54ch;
    font-size: 22px;
    font-weight: 400;
    line-height: 1.5;
    color: #eeeeee;
    text-wrap: balance;
    overflow-wrap: break-word;
  }

  .card-footer {
    position: absolute;
    left: 128px;
    bottom: 56px;
    font-size: 14px;
    font-weight: 500;
    line-height: 1.4;
    letter-spacing: 0.12em;
    color: #9bb0a3;
  }
</style>
<main class="card">
${eyebrowMarkup}
<div class="card-rule" role="presentation"></div>
<h1 class="card-title">${title}</h1>
${subtitleMarkup}
<footer class="card-footer">${PRODUCT_NAME}</footer>
</main>
`;
}

/**
 * Put a card over the page without navigating. The overlay is a fixed
 * full-viewport host with a shadow root, so the real document stays loaded and
 * painted underneath and `page.url()` keeps pointing at it. A following `goto`
 * to that URL is therefore a no-op. The overlay issues no request, so the
 * request guard stays inactive. A card already on screen is left alone to avoid
 * a repaint.
 *
 * @param {import("@playwright/test").Page} page
 * @param {{ eyebrow?: string, title: string, subtitle?: string }} card
 * @returns {Promise<boolean>} whether the card was rendered
 */
export async function showCard(page, card) {
  const key = cardKey(card);

  const current = await page
    .evaluate((id) => {
      const host = document.getElementById(id);
      return host?.dataset?.[CARD_MARKER] ?? null;
    }, CARD_HOST_ID)
    .catch(() => null);

  if (current === key) {
    await page.evaluate(() => document.fonts.ready.then(() => undefined));
    return false;
  }

  await page.evaluate(
    ({ id, marker, value, markup }) => {
      document.getElementById(id)?.remove();

      const host = document.createElement("div");
      host.id = id;
      host.dataset[marker] = value;

      const shadow = host.attachShadow({ mode: "open" });
      shadow.innerHTML = markup;
      (document.body ?? document.documentElement).appendChild(host);

      return document.fonts.ready.then(
        () =>
          new Promise((resolve) => {
            requestAnimationFrame(() => requestAnimationFrame(resolve));
          }),
      );
    },
    {
      id: CARD_HOST_ID,
      marker: CARD_MARKER,
      value: key,
      markup: renderCard(card),
    },
  );

  return true;
}

/**
 * Remove the card overlay, revealing the page underneath. Returns whether an
 * overlay was present.
 *
 * @param {import("@playwright/test").Page} page
 * @returns {Promise<boolean>}
 */
export async function hideCard(page) {
  return page
    .evaluate((id) => {
      const host = document.getElementById(id);
      if (!host) {
        return false;
      }
      host.remove();
      return true;
    }, CARD_HOST_ID)
    .catch(() => false);
}
