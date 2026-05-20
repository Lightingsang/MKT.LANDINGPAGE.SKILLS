/**
 * CountUpNumber — time-savings number with suffix label below.
 * Yellow #ffd60a, number 180 + suffix 60% smaller, vertical stack.
 */
import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from 'remotion';
import { useFitTextSize, textShadowStroke } from '../utils/fit-text';
import { scalePopEnvelope } from './_anim';

const CLAMP = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

export type CountUpNumberProps = {
  from?: number;
  to: number;
  suffix?: string;
  durationSec: number;
};

export const CountUpNumber: React.FC<CountUpNumberProps> = ({
  from = 0,
  to,
  suffix = '',
  durationSec,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const env = scalePopEnvelope(frame, fps, durationSec, {
    overshoot: 1.06,
    entryDur: 0.30,
  });

  const fEntryEnd = Math.round(0.30 * fps);
  const fCountEnd = fEntryEnd + Math.round(0.80 * fps);
  const animValue = interpolate(frame, [fEntryEnd, fCountEnd], [from, to], CLAMP);
  const number = Math.round(animValue);

  const numStr = String(Math.max(Math.abs(from), Math.abs(to)));
  const numFontSize = useFitTextSize({
    text: numStr,
    maxWidth: 960,
    maxFontSize: 180,
    minFontSize: 90,
    fontWeight: 900,
  });
  const suffixFontSize = Math.round(numFontSize * 0.6);

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          top: 120,
          left: '50%',
          transform: `translateX(-50%) scale(${env.scale}) rotate(${env.rotate}deg)`,
          transformOrigin: 'center top',
          opacity: env.opacity,
          maxWidth: 960,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
          willChange: 'transform, opacity',
        }}
      >
        <div
          style={{
            fontFamily: "'Be Vietnam Pro', system-ui, sans-serif",
            fontWeight: 900,
            fontSize: numFontSize,
            lineHeight: 0.95,
            textAlign: 'center',
            color: '#ffd60a',
            fontVariantNumeric: 'tabular-nums',
            textShadow: textShadowStroke(4, '#000000'),
          }}
        >
          {number}
        </div>
        {suffix ? (
          <div
            style={{
              fontFamily: "'Be Vietnam Pro', system-ui, sans-serif",
              fontWeight: 900,
              fontSize: suffixFontSize,
              lineHeight: 1,
              textAlign: 'center',
              textTransform: 'uppercase',
              color: '#ffd60a',
              wordBreak: 'keep-all',
              textShadow: textShadowStroke(3, '#000000'),
            }}
          >
            {suffix}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
