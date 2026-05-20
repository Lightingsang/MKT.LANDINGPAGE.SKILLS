/**
 * PunchYellow — urgency / time savings / CTA.
 * Color #ffd60a, fontSize 180 fit, slight mid pulse 1.08→1.0→1.04→1.0.
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { useFitTextSize, textShadowStroke } from '../utils/fit-text';
import { scalePopEnvelope } from './_anim';

export type PunchYellowProps = {
  text: string;
  durationSec: number;
};

export const PunchYellow: React.FC<PunchYellowProps> = ({ text, durationSec }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const env = scalePopEnvelope(frame, fps, durationSec, {
    overshoot: 1.08,
    rotateFrom: 5,
  });
  const fontSize = useFitTextSize({
    text,
    maxWidth: 960,
    maxFontSize: 180,
    minFontSize: 70,
    fontWeight: 900,
  });

  // Pulse after settle: 1.0 → 1.04 → 1.0 around 0.9s
  const pulseStart = Math.round(0.9 * fps);
  const pulseEnd = Math.round(1.2 * fps);
  let pulse = 1.0;
  if (frame >= pulseStart && frame <= pulseEnd) {
    const t = (frame - pulseStart) / (pulseEnd - pulseStart);
    pulse = 1.0 + Math.sin(t * Math.PI) * 0.04;
  }

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          top: 120,
          left: '50%',
          transform: `translateX(-50%) scale(${env.scale * pulse}) rotate(${env.rotate}deg)`,
          transformOrigin: 'center top',
          opacity: env.opacity,
          maxWidth: 960,
          fontFamily: "'Be Vietnam Pro', system-ui, sans-serif",
          fontWeight: 900,
          fontSize,
          lineHeight: 0.95,
          textAlign: 'center',
          textTransform: 'uppercase',
          color: '#ffd60a',
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
