/**
 * PunchSubtle — descriptive labels above captions.
 * Semi-transparent white, fontSize 90 fit, fade-in + y-shift (no scale pop).
 * Position: bottom 380px (above captions at bottom 280px).
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';
import { useFitTextSize, textShadowStroke } from '../utils/fit-text';

const CLAMP = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

export type PunchSubtleProps = {
  text: string;
  durationSec: number;
};

export const PunchSubtle: React.FC<PunchSubtleProps> = ({ text, durationSec }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const totalFrames = Math.max(1, Math.round(durationSec * fps));
  const exitStart = Math.max(0, totalFrames - Math.round(0.30 * fps));

  const opacityIn = interpolate(frame, [0, 10], [0, 1], {
    ...CLAMP,
    easing: Easing.out(Easing.poly(2)),
  });
  const opacityOut = interpolate(frame, [exitStart, totalFrames], [1, 0], CLAMP);
  const opacity = Math.min(opacityIn, opacityOut);

  const y = interpolate(frame, [0, 10], [16, 0], {
    ...CLAMP,
    easing: Easing.out(Easing.poly(2)),
  });

  const fontSize = useFitTextSize({
    text,
    maxWidth: 960,
    maxFontSize: 90,
    minFontSize: 50,
    fontWeight: 600,
  });

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          bottom: 380,
          left: '50%',
          transform: `translateX(-50%) translateY(${y}px)`,
          opacity,
          maxWidth: 960,
          fontFamily: "'Be Vietnam Pro', system-ui, sans-serif",
          fontWeight: 600,
          fontSize,
          lineHeight: 1.05,
          textAlign: 'center',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.85)',
          wordBreak: 'keep-all',
          overflowWrap: 'break-word',
          textShadow: textShadowStroke(2, '#000000', '0 4px 14px rgba(0,0,0,0.45)'),
          willChange: 'transform, opacity',
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};
