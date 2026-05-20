/**
 * PunchRed — money / climax red emphasis.
 * Color #e63946, fontSize 200 fit, scale-pop heavier + post-settle shake.
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { useFitTextSize, textShadowStroke } from '../utils/fit-text';
import { scalePopEnvelope, shakeX } from './_anim';

export type PunchRedProps = {
  text: string;
  durationSec: number;
};

export const PunchRed: React.FC<PunchRedProps> = ({ text, durationSec }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const env = scalePopEnvelope(frame, fps, durationSec, {
    overshoot: 1.08,
    entryDur: 0.32,
  });
  const fontSize = useFitTextSize({
    text,
    maxWidth: 960,
    maxFontSize: 200,
    minFontSize: 80,
    fontWeight: 900,
  });
  // Light shake hint after settle (~0.55s after start)
  const shake = shakeX(frame, fps, 0.55, 8);

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
          wordBreak: 'keep-all',
          overflowWrap: 'break-word',
          textShadow: textShadowStroke(
            4,
            '#000000',
            '0 8px 0 rgba(0,0,0,0.50), 0 12px 32px rgba(0,0,0,0.40)',
          ),
          willChange: 'transform, opacity',
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};
