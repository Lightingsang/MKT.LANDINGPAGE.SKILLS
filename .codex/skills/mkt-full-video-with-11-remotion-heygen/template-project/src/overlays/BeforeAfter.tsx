/**
 * BeforeAfter — A → B transformation.
 * BEFORE strikethrough opacity 0.5, arrow "→" middle, AFTER red bold.
 * Sequential reveal: BEFORE 0-6, arrow 6-9, AFTER scale-pop 9-15.
 */
import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
} from 'remotion';
import { useFitTextSize, textShadowStroke } from '../utils/fit-text';

const CLAMP = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

export type BeforeAfterProps = {
  beforeText: string;
  afterText: string;
  durationSec: number;
};

export const BeforeAfter: React.FC<BeforeAfterProps> = ({
  beforeText,
  afterText,
  durationSec,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const totalFrames = Math.max(1, Math.round(durationSec * fps));
  const exitStart = Math.max(0, totalFrames - Math.round(0.30 * fps));
  const containerOpacityOut = interpolate(frame, [exitStart, totalFrames], [1, 0], CLAMP);

  // Three-stage reveal
  const beforeOpacity = interpolate(frame, [0, 6], [0, 0.5], CLAMP);
  const arrowOpacity = interpolate(frame, [6, 9], [0, 1], CLAMP);
  const arrowScale = interpolate(frame, [6, 9], [0, 1], {
    ...CLAMP,
    easing: Easing.out(Easing.poly(2)),
  });
  const afterOpacity = interpolate(frame, [9, 15], [0, 1], CLAMP);
  const afterScale = interpolate(frame, [9, 15], [0.7, 1.0], {
    ...CLAMP,
    easing: Easing.back(2),
  });

  // Each side fits to half-width (about 380 each, leaving room for arrow + gaps)
  const beforeFs = useFitTextSize({
    text: beforeText,
    maxWidth: 380,
    maxFontSize: 130,
    minFontSize: 50,
    fontWeight: 900,
  });
  const afterFs = useFitTextSize({
    text: afterText,
    maxWidth: 380,
    maxFontSize: 130,
    minFontSize: 50,
    fontWeight: 900,
  });

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          top: 200,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 40,
          maxWidth: 1000,
          opacity: containerOpacityOut,
        }}
      >
        {/* BEFORE */}
        <div
          style={{
            fontFamily: "'Be Vietnam Pro', system-ui, sans-serif",
            fontWeight: 900,
            fontSize: beforeFs,
            color: '#ffffff',
            textDecoration: 'line-through',
            textDecorationThickness: 8,
            textTransform: 'uppercase',
            lineHeight: 1,
            wordBreak: 'keep-all',
            textShadow: textShadowStroke(3, '#000000'),
            opacity: beforeOpacity,
          }}
        >
          {beforeText}
        </div>
        {/* Arrow */}
        <div
          style={{
            fontFamily: "'Be Vietnam Pro', system-ui, sans-serif",
            fontWeight: 900,
            fontSize: 130,
            color: '#ffd60a',
            lineHeight: 1,
            opacity: arrowOpacity,
            transform: `scale(${arrowScale})`,
            textShadow: textShadowStroke(3, '#000000'),
          }}
        >
          →
        </div>
        {/* AFTER */}
        <div
          style={{
            fontFamily: "'Be Vietnam Pro', system-ui, sans-serif",
            fontWeight: 900,
            fontSize: afterFs,
            color: '#e63946',
            textTransform: 'uppercase',
            lineHeight: 1,
            wordBreak: 'keep-all',
            textShadow: textShadowStroke(3, '#000000'),
            opacity: afterOpacity,
            transform: `scale(${afterScale})`,
          }}
        >
          {afterText}
        </div>
      </div>
    </AbsoluteFill>
  );
};
