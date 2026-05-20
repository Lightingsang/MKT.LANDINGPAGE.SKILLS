/**
 * _anim.ts — shared animation helpers for overlay variants.
 *
 * Per-Sequence frame convention: `useCurrentFrame()` returns 0 at sequence start.
 * Every overlay computes `localFrame = useCurrentFrame()` and operates relative to that.
 *
 * Universal envelope (matches the HF GSAP timeline pattern):
 *   t=0       scale 0.7, opacity 0, rotate -3deg
 *   t=0.35s   scale 1.05, opacity 1, rotate 0  (overshoot)
 *   t=0.50s   scale 1.0
 *   t=dur-0.30s   begin fade-out + scale 1.0 → 0.95 over 0.30s
 */

import { interpolate, Easing } from 'remotion';

const CLAMP = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

export const EASE_BACK_OUT = Easing.back(2);
export const EASE_POWER2_IN = Easing.in(Easing.poly(2));
export const EASE_POWER2_IN_OUT = Easing.inOut(Easing.poly(2));

export type EnvelopeOptions = {
  /** entry overshoot peak (default 1.05) */
  overshoot?: number;
  /** entry rotate degrees (default -3) */
  rotateFrom?: number;
  /** exit scale endpoint (default 0.95) */
  exitScale?: number;
  /** entry duration (s) (default 0.35) */
  entryDur?: number;
  /** settle duration (s) (default 0.15) */
  settleDur?: number;
  /** exit duration (s) (default 0.30) */
  exitDur?: number;
};

export type EnvelopeValues = {
  /** scale multiplier on the element */
  scale: number;
  /** opacity 0..1 */
  opacity: number;
  /** rotate degrees */
  rotate: number;
  /** convenience prebuilt transform string */
  transform: string;
};

/**
 * Compute scale/opacity/rotate for the universal scale-pop envelope.
 *
 * @param frame    local frame (0 at Sequence start)
 * @param fps      video fps
 * @param durSec   total Sequence duration (seconds)
 */
export function scalePopEnvelope(
  frame: number,
  fps: number,
  durSec: number,
  opts: EnvelopeOptions = {},
): EnvelopeValues {
  const overshoot = opts.overshoot ?? 1.05;
  const rotateFrom = opts.rotateFrom ?? -3;
  const exitScale = opts.exitScale ?? 0.95;
  const entryDur = opts.entryDur ?? 0.35;
  const settleDur = opts.settleDur ?? 0.15;
  const exitDur = opts.exitDur ?? 0.30;

  const fEntryEnd = Math.round(entryDur * fps);
  const fSettleEnd = fEntryEnd + Math.round(settleDur * fps);
  const fTotal = Math.max(1, Math.round(durSec * fps));
  const fExitStart = Math.max(fSettleEnd, fTotal - Math.round(exitDur * fps));

  // Opacity: fade in over 5 frames, then fade out at exit
  const opacityIn = interpolate(frame, [0, 5], [0, 1], CLAMP);
  const opacityOut = interpolate(frame, [fExitStart, fTotal], [1, 0], CLAMP);
  const opacity = Math.min(opacityIn, opacityOut);

  // Scale: entry overshoot → settle → exit
  let scale: number;
  if (frame < fEntryEnd) {
    scale = interpolate(frame, [0, fEntryEnd], [0.7, overshoot], {
      ...CLAMP,
      easing: EASE_BACK_OUT,
    });
  } else if (frame < fSettleEnd) {
    scale = interpolate(frame, [fEntryEnd, fSettleEnd], [overshoot, 1.0], {
      ...CLAMP,
      easing: EASE_POWER2_IN_OUT,
    });
  } else if (frame < fExitStart) {
    scale = 1.0;
  } else {
    scale = interpolate(frame, [fExitStart, fTotal], [1.0, exitScale], {
      ...CLAMP,
      easing: EASE_POWER2_IN,
    });
  }

  // Rotate: from rotateFrom → 0 during entry
  const rotate = interpolate(frame, [0, fEntryEnd], [rotateFrom, 0], {
    ...CLAMP,
    easing: EASE_BACK_OUT,
  });

  const transform = `translate(-50%, -50%) scale(${scale}) rotate(${rotate}deg)`;
  return { scale, opacity, rotate, transform };
}

/**
 * Quick horizontal shake — useful for money / price reveal moments.
 * Returns a translateX in px for the given frame window after `tShakeStart`.
 */
export function shakeX(frame: number, fps: number, tShakeStart: number, amp = 8): number {
  const f0 = Math.round(tShakeStart * fps);
  const cycle = Math.round(0.10 * fps); // ~3 frames per oscillation @ 30fps
  if (frame < f0) return 0;
  const fIn = frame - f0;
  if (fIn > cycle * 6) return 0;
  // 3 oscillations: -amp, +amp, -amp/2, +amp/2, 0
  const phase = Math.floor(fIn / cycle);
  if (phase === 0) return -amp;
  if (phase === 1) return amp;
  if (phase === 2) return -amp / 2;
  if (phase === 3) return amp / 2;
  return 0;
}

/**
 * Glitch jitter — short RGB-split-friendly translateX micro jitters at peak.
 * Returns translateX (px) at the given frame.
 */
export function glitchJitter(frame: number, fps: number, tStart: number): number {
  const f0 = Math.round(tStart * fps);
  if (frame < f0) return 0;
  const fIn = frame - f0;
  if (fIn > 8) return 0;
  // 1-frame jitters: -8, +8, -4, +4, 0, ...
  const seq = [-8, 8, -4, 4, 0, 0, 0, 0];
  return seq[fIn] ?? 0;
}
