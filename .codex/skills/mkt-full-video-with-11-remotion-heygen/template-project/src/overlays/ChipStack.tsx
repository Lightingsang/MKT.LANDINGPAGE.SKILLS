/**
 * ChipStack — vertical stack of 3-5 chips.
 * Each chip: white 95% bg, 3px black border, 80px tall, 60px black text.
 * Stagger fade-in from left (x: -40 → 0).
 */
import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
} from 'remotion';

const CLAMP = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

export type ChipStackProps = {
  chips: string[];
  durationSec: number;
};

export const ChipStack: React.FC<ChipStackProps> = ({ chips, durationSec }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const totalFrames = Math.max(1, Math.round(durationSec * fps));
  const exitStart = Math.max(0, totalFrames - Math.round(0.30 * fps));
  const containerOpacityOut = interpolate(frame, [exitStart, totalFrames], [1, 0], CLAMP);

  // Stagger 4.5 frames = 0.15s between chips
  const STAGGER = 5;

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          top: 220,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
          opacity: containerOpacityOut,
        }}
      >
        {chips.map((chip, i) => {
          const f0 = i * STAGGER;
          const fIn = f0 + 8;
          const opacity = interpolate(frame, [f0, fIn], [0, 1], CLAMP);
          const x = interpolate(frame, [f0, fIn], [-40, 0], {
            ...CLAMP,
            easing: Easing.out(Easing.poly(2)),
          });
          return (
            <div
              key={`${chip}-${i}`}
              style={{
                padding: '16px 48px',
                background: 'rgba(255,255,255,0.95)',
                border: '3px solid #000000',
                borderRadius: 50,
                boxShadow: '0 8px 24px rgba(0,0,0,0.30)',
                fontFamily: "'Be Vietnam Pro', system-ui, sans-serif",
                fontWeight: 800,
                fontSize: 60,
                color: '#000000',
                lineHeight: 1,
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
                opacity,
                transform: `translateX(${x}px)`,
              }}
            >
              {chip}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
