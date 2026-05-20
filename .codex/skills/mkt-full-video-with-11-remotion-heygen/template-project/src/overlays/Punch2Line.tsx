/**
 * Punch2Line — 2-line compound concepts.
 * White, fontSize 130 fit, white-space: pre-line. Use `\n` in text for hard break.
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { useFitTextSize, textShadowStroke } from '../utils/fit-text';
import { scalePopEnvelope } from './_anim';

export type Punch2LineProps = {
  text: string;
  durationSec: number;
};

export const Punch2Line: React.FC<Punch2LineProps> = ({ text, durationSec }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const env = scalePopEnvelope(frame, fps, durationSec);

  // Fit to widest line individually so font size is bounded by the longest line.
  const lines = text.split('\n');
  const widest = lines.reduce((acc, l) => (l.length > acc.length ? l : acc), '');
  const fontSize = useFitTextSize({
    text: widest,
    maxWidth: 960,
    maxFontSize: 130,
    minFontSize: 60,
    fontWeight: 900,
  });

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
          fontFamily: "'Be Vietnam Pro', system-ui, sans-serif",
          fontWeight: 900,
          fontSize,
          lineHeight: 0.95,
          textAlign: 'center',
          textTransform: 'uppercase',
          color: '#ffffff',
          whiteSpace: 'pre-line',
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
