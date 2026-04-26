import opentype from "opentype.js";

const parsedFontCache = new Map();

function resolveFontFetchUrl(url) {
  if (!url || typeof url !== "string") return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (typeof window !== "undefined" && window.location?.origin) {
    const path = url.startsWith("/") ? url : `/${url}`;
    return `${window.location.origin}${path}`;
  }
  return url;
}

/**
 * Load and parse a font file for metrics (cached by resolved URL).
 * @param {string} url - Root-relative `/fonts/...` or absolute URL
 */
export async function loadSignageOpenTypeFont(url) {
  const fetchUrl = resolveFontFetchUrl(url);
  if (!fetchUrl) throw new Error("Invalid font URL");
  if (parsedFontCache.has(fetchUrl)) return parsedFontCache.get(fetchUrl);
  const res = await fetch(fetchUrl);
  if (!res.ok) throw new Error(`Font fetch failed: ${res.status} ${fetchUrl}`);
  const buffer = await res.arrayBuffer();
  const font = opentype.parse(buffer);
  parsedFontCache.set(fetchUrl, font);
  return font;
}

/**
 * Text metrics in **CSS px** at `fontSizePx` (same units as `Font.getAdvanceWidth` / canvas `measureText`).
 *
 * - **width**: advance width (matches `measureText().width` per OpenType.js docs).
 * - **height**: ink bounding-box height from glyph outlines; falls back to em-box × lineHeightFactor.
 *
 * @param {object} font - Parsed OpenType.js font
 * @param {string} text
 * @param {number} fontSizePx
 * @param {{ lineHeightFactor?: number }} [opts] — align with preview `lineHeight` (default 0.85)
 */
export function measureSignageTextWithOpenType(font, text, fontSizePx, opts = {}) {
  const lineHeightFactor = opts.lineHeightFactor ?? 0.85;
  const size = Number(fontSizePx) || 0;
  if (!text || size <= 0) return { width: 0, height: 0 };

  const width = font.getAdvanceWidth(text, size);

  const path = font.getPath(text, 0, 0, size);
  const bb = path.getBoundingBox();
  const inkW = Math.abs(bb.x2 - bb.x1);
  const inkH = Math.abs(bb.y2 - bb.y1);

  const upm = font.unitsPerEm || 1000;
  const emH = ((font.ascender - font.descender) / upm) * size;
  /** Prefer glyph ink height so auto-sized boxes match visible type (em×lineHeight is much looser). */
  const height =
    inkH > 0.5 ? inkH : emH * lineHeightFactor;

  return {
    width: Math.max(width, inkW),
    height,
  };
}

/**
 * One-line line-box height in **user units (same as fontSize)**, like Illustrator’s typographic
 * bounds: prefer OS/2 sTypo ascender/descender, else hhea ascender/descender.
 * See Illustrator “Character” / first-line em box, not sub-pixel DOM layout.
 */
export function getTypographicLineHeightPx(font, fontSizePx) {
  const s = Number(fontSizePx) || 0;
  if (!s || !font) return 0;
  const upem = font.unitsPerEm || 1000;
  const os2 = font.tables?.os2;
  let asc = font.ascender;
  let desc = font.descender;
  if (os2?.sTypoAscender != null && os2?.sTypoDescender != null) {
    asc = os2.sTypoAscender;
    desc = os2.sTypoDescender;
  }
  return ((asc - desc) / upem) * s;
}

/**
 * Illustrator-style type metrics: horizontal advance + typographic line height (no lineHeight CSS fudge).
 * All values are in the same “canvas logical px” space as `fontSizePx`.
 */
export function measureSignageTypographicCanvasPx(font, text, fontSizePx) {
  const size = Number(fontSizePx) || 0;
  if (!text || !font || size <= 0) {
    return { widthPx: 0, heightPx: 0 };
  }
  const widthPx = font.getAdvanceWidth(text, size);
  const heightPx = getTypographicLineHeightPx(font, size);
  return { widthPx, heightPx };
}
