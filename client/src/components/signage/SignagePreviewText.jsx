import { useRef, useState, useLayoutEffect, useEffect } from "react";
import {
  useSignage,
  getBoardBounds,
  clampTextCenterInBoard,
  normalizeHexColor,
  DEFAULT_SIGNAGE_FONT,
  INITIAL_PRINTED_TEXT_BOX_WIDTH_IN,
  INITIAL_PRINTED_TEXT_BOX_HEIGHT_IN,
  printedTextBoxCanvasPxFromInches,
} from "../../context/SignageContext";
import {
  canvasPxWidthFromMeasureDom,
  tightWidthCanvasPx,
  computeClampedTextBoxSizePx,
  computePrintedBoxInches,
  computeGlyphExtentInchesFromVisibleRect,
  computeDimensionLabelInches,
  formatInchesLabel,
} from "./signagePreviewTextDimensions";
import DimensionLineAnnotation from "./DimensionLineAnnotation";
import SignageTextResizeHandle from "./SignageTextResizeHandle";
import { getSignageOpenTypeFontUrl } from "../../utils/fontLoader";
import {
  loadSignageOpenTypeFont,
  measureSignageTextWithOpenType,
} from "../../utils/signageOpenTypeMeasure";

export default function SignagePreviewText({
  displayPosition,
  scale,
  hasSize,
  canvasLeft,
  canvasTop,
  cw,
  ch,
  isEditable = true,
  isDragging,
  onTextMouseDown,
  onTouchStart,
  onResizeHandleMouseDown,
  onResizeHandleTouchStart,
}) {
  const {
    textContent,
    selectedFont,
    selectedTextColor,
    selectedSize,
    textSize,
    userTextScale,
    disableInitialPrintedBoxSizing,
    effectiveFontSize,
    effectiveTextSize,
    textBoxWidth,
    textBoxHeight,
    setTextBoxWidth,
    setTextBoxHeight,
    setTextExtentInches,
    setContentMinSize,
    textWidthInches,
    textHeightInches,
    boardClampRect,
  } = useSignage();

  const textMeasureRef = useRef(null);
  const visibleTextRef = useRef(null);
  /** Rendered glyph size in preview CSS px (union with logical box for chrome / dimensions / handle). */
  const [glyphScreenCssPx, setGlyphScreenCssPx] = useState({ w: 0, h: 0 });
  const [baseBoxHeightState, setBaseBoxHeightState] = useState(
    (textSize?.height ?? 60) * (userTextScale ?? 1)
  );
  /** String advance width in canvas px at `effectiveFontSize` (from hidden measure node). */
  const [stringWidthCanvasAtEffFont, setStringWidthCanvasAtEffFont] = useState(0);

  const displayText = (textContent?.trim() || "Hello").replace(/\n/g, " ").trim() || "Hello";

  const b = getBoardBounds(cw, ch);
  const rawCenterX = displayPosition.x != null ? displayPosition.x : b.left + b.width / 2;
  const rawCenterY = displayPosition.y != null ? displayPosition.y : b.top + b.height * 0.72;
  const { x: centerX, y: centerY } = clampTextCenterInBoard(
    boardClampRect,
    rawCenterX,
    rawCenterY,
    textBoxWidth,
    textBoxHeight,
    ch,
    cw
  );
  const textLeftPx = hasSize ? canvasLeft + centerX * scale : null;
  const textTopPx = hasSize ? canvasTop + centerY * scale : null;
  const textBoxWidthPx = hasSize ? (effectiveTextSize?.width ?? 250) * scale : 0;
  const textBoxHeightPx = hasSize ? (effectiveTextSize?.height ?? 60) * scale : 0;

  const { widthIn: boxWidthIn, heightIn: boxHeightIn } = computePrintedBoxInches(
    textBoxWidth,
    textBoxHeight,
    boardClampRect.width,
    boardClampRect.height
  );

  const baseBoxHeight = baseBoxHeightState;

  useLayoutEffect(() => {
    const m = textMeasureRef.current;
    if (!m || !scale || scale <= 0) {
      setStringWidthCanvasAtEffFont(0);
      return;
    }
    const w = canvasPxWidthFromMeasureDom(m.getBoundingClientRect().width, scale);
    if (!Number.isFinite(w) || w <= 0) return;
    setStringWidthCanvasAtEffFont((prev) => {
      const rounded = Math.round(w * 100) / 100;
      return Math.abs(prev - rounded) < 0.25 ? prev : rounded;
    });
  }, [displayText, selectedFont, effectiveFontSize, scale]);

  // Scale font with box height, but never wider than the logical text box (canvas px).
  const fontScaleFromHeight = baseBoxHeight > 0 ? textBoxHeight / baseBoxHeight : 1;
  const fontScaleFromWidth =
    stringWidthCanvasAtEffFont > 0 && textBoxWidth > 0
      ? textBoxWidth / stringWidthCanvasAtEffFont
      : Number.POSITIVE_INFINITY;
  const fontScaleFromBox = Math.min(fontScaleFromHeight, fontScaleFromWidth);
  const scaledFontSize = hasSize
    ? effectiveFontSize * fontScaleFromBox * scale
    : effectiveFontSize;

  const fontMatchesDefault =
    selectedFont === DEFAULT_SIGNAGE_FONT ||
    (typeof selectedFont === "string" && selectedFont.includes("BlackMango-Bold"));

  const useInitialPrintedBox =
    !disableInitialPrintedBoxSizing &&
    displayText === "Hello" &&
    fontMatchesDefault &&
    (userTextScale ?? 1) === 1 &&
    selectedSize === "medium";

  useLayoutEffect(() => {
    if (!useInitialPrintedBox || !scale || scale <= 0) return;
    const bw = boardClampRect.width;
    const bh = boardClampRect.height;
    if (!(bw > 0 && bh > 0)) return;

    const { widthPx, heightPx } = printedTextBoxCanvasPxFromInches(
      INITIAL_PRINTED_TEXT_BOX_WIDTH_IN,
      INITIAL_PRINTED_TEXT_BOX_HEIGHT_IN,
      bw,
      bh
    );
    const newW = Math.max(1, Math.min(widthPx, bw));
    const newH = Math.max(1, Math.min(heightPx, bh));
    if (import.meta.env.DEV) {
      console.log("[SignagePreviewText] initial printed box (canvas px)", {
        newW,
        newH,
        targetIn: {
          w: INITIAL_PRINTED_TEXT_BOX_WIDTH_IN,
          h: INITIAL_PRINTED_TEXT_BOX_HEIGHT_IN,
        },
      });
    }
    setBaseBoxHeightState(newH);
    setTextBoxWidth(newW);
    setTextBoxHeight(newH);
    setContentMinSize(newW, newH);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- preview `scale` is CSS-only; omit so the inch seed is not reset on window resize
  }, [
    useInitialPrintedBox,
    setTextBoxWidth,
    setTextBoxHeight,
    setContentMinSize,
    boardClampRect.width,
    boardClampRect.height,
  ]);

  const disableSizingPrevRef = useRef(false);
  useEffect(() => {
    if (disableInitialPrintedBoxSizing && !disableSizingPrevRef.current) {
      setBaseBoxHeightState(textBoxHeight);
    }
    disableSizingPrevRef.current = disableInitialPrintedBoxSizing;
  }, [disableInitialPrintedBoxSizing, textBoxHeight]);

  useEffect(() => {
    if (useInitialPrintedBox || !scale || scale <= 0) return;
    if (disableInitialPrintedBoxSizing) return;
    const bw = boardClampRect.width;
    const bh = boardClampRect.height;
    if (!(bw > 0 && bh > 0)) return;

    let cancelled = false;

    const measureDomWidthCanvasPx = () => {
      if (!textMeasureRef.current) return null;
      const rect = textMeasureRef.current.getBoundingClientRect();
      return canvasPxWidthFromMeasureDom(rect.width, scale);
    };

    const applyMeasuredWidth = (measuredWCanvas, source, extra = {}) => {
      if (cancelled || measuredWCanvas == null || !Number.isFinite(measuredWCanvas)) return;
      const tightW = tightWidthCanvasPx(measuredWCanvas);
      const clamped = computeClampedTextBoxSizePx(tightW, bw, bh);
      if (import.meta.env.DEV) {
        console.log("[SignagePreviewText] text box from measure", {
          source,
          measuredStringWidth: measuredWCanvas,
          tightWidth: tightW,
          boxWidthAfterBoardClamp: clamped.width,
          boxHeightAfterBoardClamp: clamped.height,
          ...extra,
          preview: displayText.length > 48 ? `${displayText.slice(0, 48)}…` : displayText,
        });
      }
      setBaseBoxHeightState(clamped.height);
      setTextBoxWidth(clamped.width);
      setTextBoxHeight(clamped.height);
      setContentMinSize(clamped.width, clamped.height);
    };

    const fontUrl = getSignageOpenTypeFontUrl(selectedFont);
    if (fontUrl) {
      loadSignageOpenTypeFont(fontUrl)
        .then((font) => {
          if (cancelled) return;
          const { width, height } = measureSignageTextWithOpenType(
            font,
            displayText,
            effectiveFontSize
          );
          applyMeasuredWidth(width, "opentype", { openTypeHeightPx: height });
        })
        .catch((err) => {
          if (import.meta.env.DEV) {
            console.warn("[SignagePreviewText] OpenType measure failed, using DOM", err);
          }
          if (cancelled) return;
          applyMeasuredWidth(measureDomWidthCanvasPx(), "dom");
        });
    } else {
      applyMeasuredWidth(measureDomWidthCanvasPx(), "dom");
    }

    return () => {
      cancelled = true;
    };
  }, [
    useInitialPrintedBox,
    displayText,
    selectedFont,
    effectiveFontSize,
    scale,
    setTextBoxWidth,
    setTextBoxHeight,
    setContentMinSize,
    boardClampRect.width,
    boardClampRect.height,
    disableInitialPrintedBoxSizing,
  ]);

  useLayoutEffect(() => {
    const el = visibleTextRef.current;
    if (!el || !scale || scale <= 0) {
      setGlyphScreenCssPx({ w: 0, h: 0 });
      setTextExtentInches(null, null);
      return;
    }
    const r = el.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) {
      setGlyphScreenCssPx({ w: 0, h: 0 });
      setTextExtentInches(null, null);
      return;
    }
    setGlyphScreenCssPx({ w: r.width, h: r.height });
    const visibleWCanvasPx = r.width / scale;
    const visibleHCanvasPx = r.height / scale;
    const { widthIn, heightIn } = computeGlyphExtentInchesFromVisibleRect(
      r.width,
      r.height,
      scale,
      boardClampRect.width,
      boardClampRect.height
    );
    if (import.meta.env.DEV) {
      console.log("[SignagePreviewText] visible glyph (canvas px → in)", {
        widthCanvasPx: visibleWCanvasPx,
        heightCanvasPx: visibleHCanvasPx,
        widthIn,
        heightIn,
        textBoxWidthContext: textBoxWidth,
      });
    }
    setTextExtentInches(widthIn, heightIn);
  }, [
    displayText,
    selectedFont,
    scaledFontSize,
    textBoxWidth,
    textBoxHeight,
    scale,
    boardClampRect.width,
    boardClampRect.height,
    setTextExtentInches,
  ]);

  const { labelWidthIn, labelHeightIn } = useInitialPrintedBox
    ? { labelWidthIn: boxWidthIn, labelHeightIn: boxHeightIn }
    : computeDimensionLabelInches(
        textWidthInches,
        textHeightInches,
        boxWidthIn,
        boxHeightIn
      );

  const dimFontSize = Math.max(10, Math.round(10 * scale));
  const dimGap = Math.max(6, Math.round(6 * scale));
  const widthLabel = formatInchesLabel(labelWidthIn);
  const heightLabel = formatInchesLabel(labelHeightIn);
  const verticalDimWidth = Math.max(28, Math.round(24 * scale));

  // When the logical box is smaller than drawn glyphs (e.g. tiny target print area), expand the
  // preview chrome so dimension lines and the resize handle sit outside the ink, not through it.
  const minChromePx = Math.max(52, Math.round(48 * Math.min(scale, 1.35)));
  const chromeWidthPx = Math.max(textBoxWidthPx, glyphScreenCssPx.w, minChromePx);
  const chromeHeightPx = Math.max(textBoxHeightPx, glyphScreenCssPx.h, minChromePx);

  // Narrow boxes (e.g. one letter): width label is wider than the box — use a centered track so
  // the dimension line does not paint over the glyph. Extra top margin clears descenders / shadow.
  const isVeryShortText = displayText.length <= 3;
  const horizontalDimTrackWidth = Math.max(
    chromeWidthPx,
    dimFontSize * 15,
    Math.round(104 * scale)
  );
  const horizontalDimMarginTop =
    dimGap +
    (isVeryShortText || chromeHeightPx < dimFontSize * 3.5
      ? Math.round(dimFontSize * 1.15 + 10 * scale)
      : Math.round(4 * scale));
  const verticalDimExtraGap =
    chromeWidthPx > 0 && chromeWidthPx < dimFontSize * 10 ? Math.round(8 * scale) : 0;

  return (
    <>
      <div
        ref={textMeasureRef}
        aria-hidden
        style={{
          position: "absolute",
          left: -9999,
          top: 0,
          visibility: "hidden",
          pointerEvents: "none",
          fontFamily: selectedFont ? `${selectedFont}, Georgia, serif` : "Georgia, serif",
          fontSize: (effectiveFontSize || 0) * (scale || 1),
          fontWeight: "bold",
          whiteSpace: "nowrap",
          display: "inline-block",
          lineHeight: 0.85,
        }}
      >
        {displayText}
      </div>
      <div
        className="absolute overflow-visible"
        style={{
          left: hasSize ? canvasLeft : "50%",
          top: hasSize ? canvasTop : "65%",
          width: hasSize ? cw * scale : "40%",
          height: hasSize ? ch * scale : "55%",
          transform: hasSize ? undefined : "translate(-50%, -50%)",
          zIndex: 9999,
          pointerEvents: "none",
        }}
      >
        <div className="relative w-full h-full min-h-0 min-w-0">
          <div
            className="absolute touch-none overflow-visible min-w-0"
            style={{
              left: hasSize && textLeftPx != null ? textLeftPx - canvasLeft : "50%",
              top: hasSize && textTopPx != null ? textTopPx - canvasTop : "50%",
              transform: "translate(-50%, -50%)",
              width: chromeWidthPx > 0 ? chromeWidthPx : undefined,
              height: chromeHeightPx > 0 ? chromeHeightPx : undefined,
              minWidth: chromeWidthPx > 0 ? chromeWidthPx : undefined,
              minHeight: chromeHeightPx > 0 ? chromeHeightPx : undefined,
              pointerEvents: "none",
            }}
          >
            <div
              data-text-id="text-0"
              data-text-content={displayText}
              onMouseDown={onTextMouseDown}
              onTouchStart={onTouchStart}
              className="relative w-full h-full box-border m-0 p-0"
              style={{
                display: "grid",
                placeItems: "center",
                minWidth: 0,
                cursor: isEditable ? (isDragging ? "grabbing" : "grab") : "default",
                fontFamily: selectedFont ? `${selectedFont}, Georgia, serif` : "Georgia, serif",
                fontSize: scaledFontSize,
                fontWeight: "bold",
                color:
                  selectedTextColor && selectedTextColor !== "transparent"
                    ? normalizeHexColor(selectedTextColor)
                    : "#1a1a1a",
                whiteSpace: "nowrap",
                textAlign: "center",
                pointerEvents: isEditable ? "auto" : "none",
              }}
            >
              {/*
                Glow on a wrapper only: inherited textShadow inflates getBoundingClientRect on the
                measured span and makes inch labels huge vs. what you see on the board.
              */}
              <span
                className="inline-flex max-w-full"
                style={{
                  filter:
                    "drop-shadow(0 0 7px #fff) drop-shadow(2px 2px 4px rgba(0,0,0,0.42))",
                }}
              >
                <span
                  ref={visibleTextRef}
                  style={{
                    display: "inline-block",
                    lineHeight: 0.85,
                    padding: 0,
                    margin: 0,
                    verticalAlign: "middle",
                    maxWidth: "100%",
                    transform: "translateY(-0.07em)",
                    textShadow: "none",
                  }}
                >
                  {displayText}
                </span>
              </span>
              {isEditable && chromeWidthPx > 0 && chromeHeightPx > 0 && (
                <SignageTextResizeHandle
                  scale={scale}
                  onMouseDown={onResizeHandleMouseDown}
                  onTouchStart={onResizeHandleTouchStart}
                />
              )}
            </div>

            <div
              className="absolute flex justify-center pointer-events-none"
              style={{
                left: "50%",
                transform: "translateX(-50%)",
                top: "100%",
                marginTop: horizontalDimMarginTop,
                width: horizontalDimTrackWidth,
                fontFamily: "system-ui, -apple-system, sans-serif",
              }}
            >
              <div className="w-full max-w-full">
                <DimensionLineAnnotation
                  orientation="horizontal"
                  label={widthLabel}
                  fontSize={dimFontSize}
                />
              </div>
            </div>

            <div
              className="absolute top-0 bottom-0 flex items-stretch pointer-events-none w-max"
              style={{
                left: "100%",
                marginLeft: dimGap + verticalDimExtraGap,
                minWidth: verticalDimWidth,
                fontFamily: "system-ui, -apple-system, sans-serif",
              }}
            >
              <DimensionLineAnnotation
                orientation="vertical"
                label={heightLabel}
                fontSize={dimFontSize}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
