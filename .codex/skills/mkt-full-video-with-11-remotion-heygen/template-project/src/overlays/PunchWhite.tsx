/**
 * PunchWhite — generic white-stroke emphasis.
 * Use for: level names, brand names, generic punch words.
 * Color #ffffff, font 170 (fit to maxWidth 960), top-center.
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { useFitTextSize, textShadowStroke } from '../utils/fit-text';
import { scalePopEnvelope } from './_anim';

export type PunchWhiteProps = {
  text: string;
  durationSec: number;
};

export const PunchWhite: React.FC<PunchWhiteProps> = ({ text, durationSec }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const env = scalePopEnvelope(frame, fps, durationSec);
  const fontSize = useFitTextSize({
    text,
    maxWidth: 960,
    maxFontSize: 170,
    minFontSize: 70,
    fontWeight: 900,
  });

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          top: 120,
          left: '50%',
          // Anchor at top-left of bbox via translate(-50%, 0), then animate transforms
          transform: `translateX(-50%) scale(${env.scale}) rotate(${env.rotate}deg)`,
          transformOrigin: 'center top',
          opacity: env.opacity,
          maxWidth: 960,
          fontFamily: "'Be Vietnam Pro', system-ui, sans-serif",
          fontWeight: 900,
          fontSize,
          lineHeight: 0.95,
          textAlign: 'center',
          textTransform: 'uppercase',
          color: '#ffffff',
          wordBreak: 'keep-all',
          overflowWrap: 'break-word',
          textShadow: textShadowStroke(4, '#000000'),
          willChange: 'transform, opacity',
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};
