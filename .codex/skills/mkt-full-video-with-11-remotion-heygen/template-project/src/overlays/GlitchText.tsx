/**
 * GlitchText — climax reveal with RGB-split glitch.
 * Renders 3 stacked layers: main red + red-shifted clone + cyan-shifted clone.
 * Animation: scale-pop entry, then 4 jitter frames, then exit fade.
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { useFitTextSize, textShadowStroke } from '../utils/fit-text';
import { scalePopEnvelope, glitchJitter } from './_anim';

export type GlitchTextProps = {
  text: string;
  durationSec: number;
};

export const GlitchText: React.FC<GlitchTextProps> = ({ text, durationSec }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const env = scalePopEnvelope(frame, fps, durationSec, {
    overshoot: 1.08,
    entryDur: 0.30,
  });
  const fontSize = useFitTextSize({
    text,
    maxWidth: 960,
    maxFontSize: 200,
    minFontSize: 80,
    fontWeight: 900,
  });

  // Glitch jitter starts right after settle (~0.45s)
  const jitter = glitchJitter(frame, fps, 0.45);

  const baseLayer: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    fontFamily: "'Be Vietnam Pro', system-ui, sans-serif",
    fontWeight: 900,
    fontSize,
    lineHeight: 0.95,
    textAlign: 'center',
    textTransform: 'uppercase',
    wordBreak: 'keep-all',
  };

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          top: 120,
          left: '50%',
          transform: `translateX(calc(-50% + ${jitter}px)) scale(${env.scale}) rotate(${env.rotate}deg)`,
          transformOrigin: 'center top',
          opacity: env.opacity,
          maxWidth: 960,
          width: 960,
          height: fontSize * 1.2,
          willChange: 'transform, opacity',
        }}
      >
        {/* Red-shifted clone */}
        <div
          style={{
            ...baseLayer,
            transform: 'translateX(-6px)',
            color: '#ff2d3a',
            mixBlendMode: 'screen',
            opacity: 0.85,
          }}
        >
          {text}
        </div>
        {/* Cyan-shifted clone */}
        <div
          style={{
            ...baseLayer,
            transform: 'translateX(6px)',
            color: '#00d4ff',
            mixBlendMode: 'screen',
            opacity: 0.85,
          }}
        >
          {text}
        </div>
        {/* Main layer */}
        <div
          style={{
            ...baseLayer,
            color: '#e63946',
            textShadow: textShadowStroke(4, '#000000'),
          }}
        >
          {text}
        </div>
      </div>
    </AbsoluteFill>
  );
};
