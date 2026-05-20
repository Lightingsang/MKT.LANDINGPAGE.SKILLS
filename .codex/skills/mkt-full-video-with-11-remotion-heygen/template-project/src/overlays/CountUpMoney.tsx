/**
 * CountUpMoney — animated money number (e.g. $5-15K).
 * Red #e63946 with thick black stroke, fontSize 200 fit.
 * Animation: scale-pop entry, then numerical count-up from `from` → `to` over ~0.8s, then shake hint.
 */
import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from 'remotion';
import { useFitTextSize, textShadowStroke } from '../utils/fit-text';
import { scalePopEnvelope, shakeX } from './_anim';

const CLAMP = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

export type CountUpMoneyProps = {
  from?: number;
  to: number;
  prefix?: string;
  suffix?: string;
  durationSec: number;
};

export const CountUpMoney: React.FC<CountUpMoneyProps> = ({
  from = 0,
  to,
  prefix = '',
  suffix = '',
  durationSec,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const env = scalePopEnvelope(frame, fps, durationSec, {
    overshoot: 1.08,
    entryDur: 0.30,
  });

  // Count-up window: from frame ~8 (entry-end) to entry-end + 24 frames (~0.8s)
  const fEntryEnd = Math.round(0.30 * fps);
  const fCountEnd = fEntryEnd + Math.round(0.80 * fps);
  const animValue = interpolate(frame, [fEntryEnd, fCountEnd], [from, to], CLAMP);
  const display = `${prefix}${Math.round(animValue)}${suffix}`;

  // Final formatted string for sizing (use the longest possible)
  const measureStr = `${prefix}${Math.max(Math.abs(from), Math.abs(to))}${suffix}`;
  const fontSize = useFitTextSize({
    text: measureStr,
    maxWidth: 960,
    maxFontSize: 200,
    minFontSize: 90,
    fontWeight: 900,
  });

  // Shake after count-up settles
  const shake = shakeX(frame, fps, durationSec * 0.45, 10);

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          top: 120,
          left: '50%',
          transform: `translateX(calc(-50% + ${shake}px)) scale(${env.scale}) rotate(${env.rotate}deg)`,
          transformOrigin: 'center top',
          opacity: env.opacity,
          maxWidth: 960,
          fontFamily: "'Be Vietnam Pro', system-ui, sans-serif",
          fontWeight: 900,
          fontSize,
          lineHeight: 0.95,
          textAlign: 'center',
          textTransform: 'uppercase',
          color: '#e63946',
          fontVariantNumeric: 'tabular-nums',
          wordBreak: 'keep-all',
          textShadow: textShadowStroke(
            4,
            '#000000',
            '0 8px 0 rgba(0,0,0,0.50), 0 12px 32px rgba(0,0,0,0.45)',
          ),
          willChange: 'transform, opacity',
        }}
      >
        {display}
      </div>
    </AbsoluteFill>
  );
};
