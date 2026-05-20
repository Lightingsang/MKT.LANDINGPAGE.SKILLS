/**
 * Captions.tsx — TikTok-style bottom pill.
 *
 * Reads caption groups `{ start, end, text }[]` and shows the current group whose
 * window contains the current playhead time. Bottom-center, black 78% pill,
 * Be Vietnam Pro 600, 60px.
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';

export type CaptionGroup = {
  text: string;
  start: number;
  end: number;
};

export type CaptionsProps = {
  groups: CaptionGroup[];
};

export const Captions: React.FC<CaptionsProps> = ({ groups }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const active = groups.find((g) => t >= g.start && t <= g.end);
  if (!active) return null;

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 280,
          display: 'flex',
          justifyContent: 'center',
          padding: '0 60px',
        }}
      >
        <div
          style={{
            display: 'inline-block',
            padding: '18px 32px',
            background: 'rgba(0, 0, 0, 0.78)',
            borderRadius: 20,
            color: '#ffffff',
            fontFamily: "'Be Vietnam Pro', system-ui, sans-serif",
            fontWeight: 600,
            fontSize: 60,
            lineHeight: 1.15,
            textAlign: 'center',
            maxWidth: 960,
            wordBreak: 'keep-all',
            textShadow: '0 2px 6px rgba(0,0,0,0.4)',
          }}
        >
          {active.text}
        </div>
      </div>
    </AbsoluteFill>
  );
};
