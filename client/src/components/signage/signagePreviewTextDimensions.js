import {
  textBoxWidthPxToInches,
  textBoxHeightPxToInches,
  textBoxHeightPxForAspectWidthPx,
  signageTextHeightInchesForWidthInches,
  SIGNAGE_TEXT_ASPECT_H_PER_W,
  signageTextPrintableWidthPx,
} from "../../context/SignageContext";

/** DOM measure width → canvas px width (divide by preview CSS scale). */
export function canvasPxWidthFromMeasureDom(domWidth, previewScale) {
  return domWidth / previewScale;
}

/** Smallest integer canvas px width that fits measured text. */
export function tightWidthCanvasPx(measuredWCanvas) {
  return Math.max(1, Math.ceil(measuredWCanvas));
}

/**
 * Board aspect factor used with SIGNAGE_TEXT_ASPECT_H_PER_W for height-from-width.
 */
export function boardAspectK(boardWidthPx, boardHeightPx) {
  const bw = Math.max(1, boardWidthPx || 1);
  const bh = Math.max(1, boardHeightPx || 1);
  return (bh / bw) * SIGNAGE_TEXT_ASPECT_H_PER_W;
}

/**
 * Clamp measured text width into max board box; returns canvas px width and height.
 *
 * @param {number | null | undefined} contentHeightPx — when set (canvas px, same space as
 *   `tightW`), height follows measured line / ink instead of the 90×26 aspect-from-width
 *   rule, so auto-sized boxes are not taller than the type.
 */
export function computeClampedTextBoxSizePx(
  tightW,
  boardWidthPx,
  boardHeightPx,
  contentHeightPx
) {
  const bw = Math.max(1, boardWidthPx || 1);
  const bh = Math.max(1, boardHeightPx || 1);
  const maxWpx = Math.max(1, Math.floor(signageTextPrintableWidthPx(bw)));
  const maxHpx = bh;
  const k = boardAspectK(boardWidthPx, boardHeightPx);
  let cap = 1;
  if (tightW > maxWpx) cap = Math.min(cap, maxWpx / tightW);
  let newW = Math.max(1, Math.ceil(tightW * cap));
  const useContentH =
    contentHeightPx != null && Number.isFinite(contentHeightPx) && contentHeightPx > 0;
  const aspectHeight = (w) =>
    Math.max(1, Math.ceil(textBoxHeightPxForAspectWidthPx(w, bw, bh)));
  let newH = useContentH
    ? Math.max(1, Math.min(maxHpx, Math.ceil(contentHeightPx)))
    : aspectHeight(newW);

  if (!useContentH && newH > maxHpx) {
    newH = maxHpx;
    newW = Math.max(1, Math.ceil(k > 0 ? newH / k : newW));
  } else if (useContentH && newH > maxHpx) {
    newH = maxHpx;
  }
  if (newW > maxWpx) {
    newW = maxWpx;
    newH = useContentH
      ? Math.max(1, Math.min(maxHpx, Math.ceil(contentHeightPx)))
      : aspectHeight(newW);
    if (!useContentH && newH > maxHpx) {
      newH = maxHpx;
      newW = Math.max(1, Math.ceil(k > 0 ? newH / k : newW));
    }
  }
  if (maxWpx > 0 && newW >= maxWpx - 1.5) {
    newW = maxWpx;
    newH = useContentH
      ? Math.max(1, Math.min(maxHpx, Math.ceil(contentHeightPx)))
      : aspectHeight(newW);
    if (!useContentH && newH > maxHpx) {
      newH = maxHpx;
      newW = Math.max(1, Math.ceil(k > 0 ? newH / k : newW));
    }
  }
  return { width: newW, height: newH };
}

/** Physical width (in) for the text box from canvas px width vs painted board width. */
export function computeBoxWidthInches(textBoxWidthCanvasPx, boardClampWidthPx) {
  if (!(boardClampWidthPx > 0)) return null;
  return textBoxWidthPxToInches(
    textBoxWidthCanvasPx,
    signageTextPrintableWidthPx(boardClampWidthPx)
  );
}

/** Physical height (in) from box width using signage aspect rule. */
export function computeBoxHeightInchesFromWidth(boxWidthInches) {
  if (boxWidthInches == null) return null;
  return signageTextHeightInchesForWidthInches(boxWidthInches);
}

/** Pair { widthIn, heightIn } for the printed box from context text box size. */
export function computePrintedBoxInches(
  textBoxWidthCanvasPx,
  textBoxHeightCanvasPx,
  boardClampWidthPx,
  boardClampHeightPx
) {
  const wIn = computeBoxWidthInches(textBoxWidthCanvasPx, boardClampWidthPx);
  const bh = Number(boardClampHeightPx);
  const th = Number(textBoxHeightCanvasPx);
  const hIn =
    Number.isFinite(th) &&
    th > 0 &&
    Number.isFinite(bh) &&
    bh > 0
      ? textBoxHeightPxToInches(th, bh)
      : computeBoxHeightInchesFromWidth(wIn);
  return { widthIn: wIn, heightIn: hIn };
}

/**
 * Glyph bounds in inches from the visible span’s getBoundingClientRect (CSS px),
 * using the same px→in mapping as width/height for the painted board.
 * Height is no longer forced to the 90×26″ pricing aspect — it matches actual glyph height.
 */
export function computeGlyphExtentInchesFromVisibleRect(
  visibleWidthCssPx,
  visibleHeightCssPx,
  previewScale,
  boardClampWidthPx,
  boardClampHeightPx
) {
  if (!previewScale || previewScale <= 0) {
    return { widthIn: null, heightIn: null };
  }
  const wCanvas = visibleWidthCssPx / previewScale;
  const hCanvas = visibleHeightCssPx / previewScale;
  const wIn =
    visibleWidthCssPx > 0 && boardClampWidthPx > 0
      ? textBoxWidthPxToInches(wCanvas, signageTextPrintableWidthPx(boardClampWidthPx))
      : null;
  const hIn =
    visibleHeightCssPx > 0 && boardClampHeightPx > 0
      ? textBoxHeightPxToInches(hCanvas, boardClampHeightPx)
      : null;
  return { widthIn: wIn, heightIn: hIn };
}

/**
 * Map typographic width/height (canvas px, same space as board) to physical inches on the sign.
 * Matches a fixed artboard: full board width/height in px ↔ boundary inches (8′ × 8′).
 */
export function typographicCanvasPxToInches(
  widthCanvasPx,
  heightCanvasPx,
  boardClampWidthPx,
  boardClampHeightPx
) {
  const wIn = textBoxWidthPxToInches(
    widthCanvasPx,
    signageTextPrintableWidthPx(boardClampWidthPx)
  );
  const hIn = textBoxHeightPxToInches(heightCanvasPx, boardClampHeightPx);
  return { widthIn: wIn, heightIn: hIn };
}

/**
 * Dimension lines: prefer Illustrator-style OpenType advance + sTypo line height when present;
 * else logical print box; else glyph / aspect fallbacks.
 */
export function computeDimensionLabelInches(
  textWidthInches,
  textHeightInches,
  boxWidthIn,
  boxHeightIn,
  typoWidthIn = null,
  typoHeightIn = null
) {
  if (
    typoWidthIn != null &&
    typoHeightIn != null &&
    Number.isFinite(typoWidthIn) &&
    Number.isFinite(typoHeightIn) &&
    typoWidthIn > 0 &&
    typoHeightIn > 0
  ) {
    return { labelWidthIn: typoWidthIn, labelHeightIn: typoHeightIn };
  }
  const labelWidthIn =
    boxWidthIn != null && Number.isFinite(boxWidthIn) && boxWidthIn > 0
      ? boxWidthIn
      : textWidthInches;
  const labelHeightIn =
    boxHeightIn != null && Number.isFinite(boxHeightIn) && boxHeightIn > 0
      ? boxHeightIn
      : textHeightInches != null && Number.isFinite(textHeightInches)
        ? textHeightInches
        : labelWidthIn != null
          ? signageTextHeightInchesForWidthInches(labelWidthIn)
          : null;
  return { labelWidthIn, labelHeightIn };
}

export function formatInchesLabel(v) {
  if (v == null || !Number.isFinite(Number(v))) return "—";
  return `${Math.round(Number(v))} in`;
}
