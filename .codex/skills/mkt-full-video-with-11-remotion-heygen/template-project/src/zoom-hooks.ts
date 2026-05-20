/**
 * zoom-hooks.ts — frame-driven avatar zoom helpers.
 *
 * Each function returns a `scale` multiplier (≥ 1.0 typically) that should be applied
 * to the avatar's `transform: scale(...)`. The avatar's overall scale is the PRODUCT of
 * all active hook contributions — `computeAvatarScale()` handles that fan-in.
 *
 * Peaks must stay 1.04 - 1.10. >1.15 kills the natural look (looks like a glitch).
 *
 * 4 hook types (mapping to the HF-era convention):
 *   - soft2step  — 1.0 → mid → peak → 1.0 over ~1.2s, 2-stage easing (MAJOR moments)
 *   - quickpop   — 1.0 → peak → 1.0 over ~0.78s, back.out entry (medium emphasis)
 *   - doublepop  — soft2step but with 2 peaks ~0.55s apart (urgency double-tap)
 *   - zoomout    — 1.0 → low (e.g. 0.97) → 1.0 over `duration` (cinematic breath)
 */

import { interpolate, Easing } from 'remotion';

/* ── interpolation defaults ──────────────────────────────────────────────── */
const CLAMP = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

/* ── back.out approximation ─────────────────────────────────────────────────
 * GSAP's `back.out(s)` is an easing where t' = ((t-1)^2 * ((s+1)(t-1) + s) + 1).
 * Remotion uses cubic-bezier easings. `Easing.back(1.6)` is the closest match. */
const EASE_BACK_OUT = Easing.back(1.6);
const EASE_POWER2_OUT = Easing.out(Easing.poly(2));
const EASE_POWER2_IN_OUT = Easing.inOut(Easing.poly(2));

/* ── individual hook contributions ───────────────────────────────────────── */

/**
 * Soft 2-step: 1.0 → mid (~55% of way) → peak → 1.0.
 * Duration ~1.2s. Use for MAJOR moments: brand reveals, price drops, CTA.
 */
export function zoomSoft2Step(
  frame: number,
  fps: number,
  tStart: number,
  peak: number,
): number {
  const f0 = Math.round(tStart * fps);
  const fMid = f0 + Math.round(0.30 * fps); // peak-mid plateau begins
  const fPeak = f0 + Math.round(0.55 * fps);
  const fEnd = f0 + Math.round(1.20 * fps);

  if (frame < f0 || frame > fEnd) return 1.0;

  const mid = 1.0 + (peak - 1.0) * 0.55;

  if (frame <= fMid) {
    return interpolate(frame, [f0, fMid], [1.0, mid], { ...CLAMP, easing: EASE_POWER2_OUT });
  }
  if (frame <= fPeak) {
    return interpolate(frame, [fMid, fPeak], [mid, peak], { ...CLAMP, easing: EASE_POWER2_IN_OUT });
  }
  return interpolate(frame, [fPeak, fEnd], [peak, 1.0], { ...CLAMP, easing: EASE_POWER2_IN_OUT });
}

/**
 * Quick pop: 1.0 → peak → 1.0 fast (~0.78s) with back.out entry.
 * Most common — medium emphasis + rhythm filler.
 */
export function zoomQuickPop(
  frame: number,
  fps: number,
  tStart: number,
  peak: number,
): number {
  const f0 = Math.round(tStart * fps);
  const fPeak = f0 + Math.round(0.28 * fps);
  const fEnd = f0 + Math.round(0.78 * fps);

  if (frame < f0 || frame > fEnd) return 1.0;

  if (frame <= fPeak) {
    return interpolate(frame, [f0, fPeak], [1.0, peak], { ...CLAMP, easing: EASE_BACK_OUT });
  }
  return interpolate(frame, [fPeak, fEnd], [peak, 1.0], { ...CLAMP, easing: EASE_POWER2_IN_OUT });
}

/**
 * Double pop: 2 quick peaks ~0.55s apart. Use sparingly (1-2x/video) for urgency / list reveal.
 */
export function zoomDoublePop(
  frame: number,
  fps: number,
  tStart: number,
  peak: number,
): number {
  // First pop
  const f0 = Math.round(tStart * fps);
  const fPeak1 = f0 + Math.round(0.18 * fps);
  const fValley = f0 + Math.round(0.40 * fps);
  const fPeak2 = f0 + Math.round(0.55 * fps);
  const fEnd = f0 + Math.round(1.08 * fps);

  if (frame < f0 || frame > fEnd) return 1.0;

  if (frame <= fPeak1) {
    return interpolate(frame, [f0, fPeak1], [1.0, peak], { ...CLAMP, easing: EASE_BACK_OUT });
  }
  if (frame <= fValley) {
    return interpolate(frame, [fPeak1, fValley], [peak, 1.0], { ...CLAMP, easing: EASE_POWER2_IN_OUT });
  }
  if (frame <= fPeak2) {
    return interpolate(frame, [fValley, fPeak2], [1.0, peak], { ...CLAMP, easing: EASE_BACK_OUT });
  }
  return interpolate(frame, [fPeak2, fEnd], [peak, 1.0], { ...CLAMP, easing: EASE_POWER2_IN_OUT });
}

/**
 * Zoom-out breath: 1.0 → low (e.g. 0.97) → 1.0 over `duration` seconds.
 * Use for cinematic exhale moments between hooks.
 */
export function zoomOutBreath(
  frame: number,
  fps: number,
  tStart: number,
  low: number,
  duration: number,
): number {
  const f0 = Math.round(tStart * fps);
  const fMid = f0 + Math.round((duration / 2) * fps);
  const fEnd = f0 + Math.round(duration * fps);

  if (frame < f0 || frame > fEnd) return 1.0;

  if (frame <= fMid) {
    return interpolate(frame, [f0, fMid], [1.0, low], { ...CLAMP, easing: EASE_POWER2_IN_OUT });
  }
  return interpolate(frame, [fMid, fEnd], [low, 1.0], { ...CLAMP, easing: EASE_POWER2_IN_OUT });
}

/* ── public types ────────────────────────────────────────────────────────── */

export type ZoomHookType = 'soft2step' | 'quickpop' | 'doublepop' | 'zoomout';

export type ZoomHook =
  | { t: number; type: 'soft2step'; peak: number }
  | { t: number; type: 'quickpop'; peak: number }
  | { t: number; type: 'doublepop'; peak: number }
  | { t: number; type: 'zoomout'; low: number; duration: number };

/**
 * Compute avatar's overall scale at `frame` by multiplying contributions from all
 * active zoom hooks. Hooks that don't overlap `frame` return 1.0 and don't affect product.
 */
export function computeAvatarScale(frame: number, fps: number, hooks: ZoomHook[]): number {
  let scale = 1.0;
  for (const h of hooks) {
    let contrib = 1.0;
    if (h.type === 'soft2step') {
      contrib = zoomSoft2Step(frame, fps, h.t, h.peak);
    } else if (h.type === 'quickpop') {
      contrib = zoomQuickPop(frame, fps, h.t, h.peak);
    } else if (h.type === 'doublepop') {
      contrib = zoomDoublePop(frame, fps, h.t, h.peak);
    } else if (h.type === 'zoomout') {
      contrib = zoomOutBreath(frame, fps, h.t, h.low, h.duration);
    }
    // Multiply contributions (1.0 baseline doesn't change scale)
    scale *= contrib;
  }
  return scale;
}
