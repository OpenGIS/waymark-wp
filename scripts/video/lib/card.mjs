// Self-contained title and end cards for the video recorder.
//
// A card is a typographic 1280x720 frame rendered into the page itself, not an
// ffmpeg overlay. The Open GIS mark is read from the plugin's vendored SVG and
// inlined, so the document has no images, webfonts or external references and
// the recorder can set it into the timeline like any other scene. Every value
// comes from the scenario and is escaped before it reaches the document.
"use strict";

import { readFileSync } from "node:fs";

const CARD_MARKER = "waymarkCard";

const TYPE_STACK =
  'ui-monospace, "SFMono-Regular", "SF Mono", Menlo, Consolas, "Liberation Mono", monospace';

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
 * Render a card as a complete HTML document.
 *
 * The eyebrow sits at roughly 38% of the frame height: a fixed top padding
 * keeps that position stable when the subtitle wraps, while the remaining
 * space below stays generous. A newline in the subtitle is rendered as a line
 * break. All measurements are for the fixed 1280x720 recording viewport.
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

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${title}</title>
<style>
  html,
  body {
    margin: 0;
    height: 100%;
    background: #000b00;
    overflow: hidden;
  }

  body {
    font-family: ${TYPE_STACK};
    -webkit-font-smoothing: antialiased;
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
</head>
<body>
<main class="card">
${eyebrowMarkup}
<div class="card-rule" role="presentation"></div>
<h1 class="card-title">${title}</h1>
${subtitleMarkup}
<footer class="card-footer">${PRODUCT_NAME}</footer>
</main>
</body>
</html>
`;
}

/**
 * Put a card into the page without navigating. `setContent` leaves `page.url()`
 * untouched, so the document issues no request and the request guard stays
 * inactive. A card already on screen is left alone to avoid a repaint.
 *
 * @param {import("@playwright/test").Page} page
 * @param {{ eyebrow?: string, title: string, subtitle?: string }} card
 * @returns {Promise<boolean>} whether the card was rendered
 */
export async function showCard(page, card) {
  const key = cardKey(card);

  const current = await page
    .evaluate(
      (attribute) => document.documentElement?.dataset?.[attribute] ?? null,
      CARD_MARKER,
    )
    .catch(() => null);

  if (current === key) {
    await page.evaluate(() => document.fonts.ready.then(() => undefined));
    return false;
  }

  await page.setContent(renderCard(card), { waitUntil: "load" });

  await page.evaluate(
    ({ attribute, value }) => {
      document.documentElement.dataset[attribute] = value;
      return document.fonts.ready.then(() => undefined);
    },
    { attribute: CARD_MARKER, value: key },
  );

  return true;
}

/**
 * Whether the current document is a card rendered by `showCard`.
 *
 * @param {import("@playwright/test").Page} page
 * @returns {Promise<boolean>}
 */
export async function isCardPage(page) {
  return page
    .evaluate(
      (attribute) => Boolean(document.documentElement?.dataset?.[attribute]),
      CARD_MARKER,
    )
    .catch(() => false);
}
