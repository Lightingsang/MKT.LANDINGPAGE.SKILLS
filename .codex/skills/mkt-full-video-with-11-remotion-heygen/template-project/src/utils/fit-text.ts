/**
 * fit-text.ts — measure text width via canvas and pick the largest font-size that fits a max width.
 *
 * Why: Be Vietnam Pro 900 at 170-200px overflows the 1080 canvas at ~9-10 chars. Vietnamese
 * diacritics (Ạ Ầ Ầ Ữ) add extra horizontal space. Without a guard, viral strings like
 * "HỢP LÝ HƠN!", "GIÁ TỐT NHẤT" tràn 2 cạnh và viewer chỉ thấy giữa chữ.
 *
 * Strategy:
 *   1. Use OffscreenCanvas (Remotion's chromium runtime supports it) to measure pixel width.
 *   2. Binary-step from maxFs down to minFs.
 *   3. Return the largest size where measured width ≤ maxWidth.
 *
 * Use as a React hook (`useFitTextSize`) inside any overlay component that needs overflow guard.
 * The hook is pure / deterministic — only `text + fontFamily + fontWeight + maxWidth + maxFs + minFs`
 * affect output, so Remotion's render cache works correctly across all frames of a Sequence.
 */

import { useMemo } from 'react';

export type FitTextOptions = {
  text: string;
  maxWidth: number;
  maxFontSize: number;
  minFontSize: number;
  fontFamily?: string;
  fontWeight?: number | string;
  step?: number;
  /** letter-spacing in px applied to measurement (matches CSS) */
  letterSpacing?: number;
};

const DEFAULT_FONT_FAMILY = "'Be Vietnam Pro', system-ui, sans-serif";
const DEFAULT_FONT_WEIGHT = 900;
const DEFAULT_STEP = 4;

let _ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null = null;

function getMeasureContext(): CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null {
  if (_ctx) return _ctx;
  if (typeof OffscreenCanvas !== 'undefined') {
    const oc = new OffscreenCanvas(2048, 64);
    const c = oc.getContext('2d');
    if (c) {
      _ctx = c;
      return c;
    }
  }
  if (typeof document !== 'undefined') {
    const cv = document.createElement('canvas');
    cv.width = 2048;
    cv.height = 64;
    const c = cv.getContext('2d');
    if (c) {
      _ctx = c;
      return c;
    }
  }
  return null;
}

/**
 * Measure the rendered width of `text` at given font settings.
 * Returns pixel width. Returns a rough estimate if no canvas context is available.
 */
export function measureTextWidth(
  text: string,
  fontSize: number,
  fontFamily: string = DEFAULT_FONT_FAMILY,
  fontWeight: number | string = DEFAULT_FONT_WEIGHT,
  letterSpacing = 0,
): number {
  const ctx = getMeasureContext();
  if (!ctx) {
    // Fallback rough estimate: each glyph ~ 0.6 em width for heavy display fonts
    return text.length * fontSize * 0.62 + (text.length - 1) * letterSpacing;
  }
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  const m = ctx.measureText(text);
  return m.width + Math.max(0, (text.length - 1) * letterSpacing);
}

/**
 * Pure function: find the largest font size in steps of `step` that fits within `maxWidth`.
 * Memoized via `useFitTextSize` for React.
 */
export function fitText({
  text,
  maxWidth,
  maxFontSize,
  minFontSize,
  fontFamily = DEFAULT_FONT_FAMILY,
  fontWeight = DEFAULT_FONT_WEIGHT,
  step = DEFAULT_STEP,
  letterSpacing = 0,
}: FitTextOptions): number {
  if (!text) return maxFontSize;
  let fs = maxFontSize;
  while (fs > minFontSize) {
    const w = measureTextWidth(text, fs, fontFamily, fontWeight, letterSpacing);
    if (w <= maxWidth) return fs;
    fs -= step;
  }
  return minFontSize;
}

/**
 * React hook — memoizes the fitted font size.
 * Returns a number (px).
 */
export function useFitTextSize(opts: FitTextOptions): number {
  return useMemo(
    () => fitText(opts),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      opts.text,
      opts.maxWidth,
      opts.maxFontSize,
      opts.minFontSize,
      opts.fontFamily,
      opts.fontWeight,
      opts.step,
      opts.letterSpacing,
    ],
  );
}

/**
 * 8-direction text-shadow stroke string. We avoid `-webkit-text-stroke` because
 * it visually breaks Vietnamese diacritics like Ạ Ầ at heavy weights — the stroke
 * crops the dot/accent above the letter.
 *
 * Pass a stroke color + half-width; returns a `text-shadow` value that paints a
 * solid outline plus an optional drop shadow.
 */
export function textShadowStroke(
  halfWidth = 3,
  color = '#000000',
  dropShadow = '0 6px 0 rgba(0,0,0,0.40), 0 10px 24px rgba(0,0,0,0.30)',
): string {
  const w = halfWidth;
  const dirs: [number, number][] = [
    [-w, -w],
    [-w, 0],
    [-w, w],
    [0, -w],
    [0, w],
    [w, -w],
    [w, 0],
    [w, w],
  ];
  const stroke = dirs.map(([x, y]) => `${x}px ${y}px 0 ${color}`).join(', ');
  return dropShadow ? `${stroke}, ${dropShadow}` : stroke;
}
