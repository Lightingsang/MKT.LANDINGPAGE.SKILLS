/**
 * TypeOn — command-line / URL typing reveal.
 * Background #0f1419, terminal green #00ff88, monospace.
 * Typing animation: ~1 char per frame at 30fps.
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const CLAMP = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

export type TypeOnProps = {
  typedText: string;
  prompt?: string;
  durationSec: number;
};

export const TypeOn: React.FC<TypeOnProps> = ({ typedText, prompt = '$', durationSec }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const totalFrames = Math.max(1, Math.round(durationSec * fps));
  const exitStart = Math.max(0, totalFrames - Math.round(0.30 * fps));

  const opacityIn = interpolate(frame, [0, 6], [0, 1], CLAMP);
  const opacityOut = interpolate(frame, [exitStart, totalFrames], [1, 0], CLAMP);
  const opacity = Math.min(opacityIn, opacityOut);

  // Typing: start after 0.2s entry, then ~1 char per frame, cap at typedText.length
  const typeStart = Math.round(0.20 * fps);
  const charsToShow = Math.max(0, Math.min(typedText.length, frame - typeStart));
  const visible = typedText.slice(0, charsToShow);

  // Blinking cursor: toggle every 15 frames
  const cursor = Math.floor(frame / 15) % 2 === 0 ? '|' : ' ';

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          top: 300,
          left: '50%',
          transform: 'translateX(-50%)',
          maxWidth: 900,
          padding: '32px 40px',
          background: '#0f1419',
          border: '2px solid #444444',
          borderRadius: 16,
          boxShadow: '0 12px 40px rgba(0,0,0,0.55)',
          fontFamily: 'ui-monospace, Menlo, Consolas, monospace',
          fontWeight: 600,
          fontSize: 70,
          lineHeight: 1.15,
          color: '#00ff88',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
          opacity,
        }}
      >
        <span style={{ color: '#ffffff', opacity: 0.55, marginRight: 16 }}>{prompt}</span>
        <span>{visible}</span>
        <span style={{ color: '#00ff88' }}>{cursor}</span>
      </div>
    </AbsoluteFill>
  );
};
