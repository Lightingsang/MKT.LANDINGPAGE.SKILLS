/**
 * CommentBubble — CTA social comment.
 * White 95% rounded bubble, bottom 360px, scale-pop + slight bounce shadow.
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { useFitTextSize } from '../utils/fit-text';
import { scalePopEnvelope } from './_anim';

export type CommentBubbleProps = {
  username?: string;
  commentText: string;
  durationSec: number;
};

export const CommentBubble: React.FC<CommentBubbleProps> = ({
  username = '@user',
  commentText,
  durationSec,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const env = scalePopEnvelope(frame, fps, durationSec, {
    overshoot: 1.08,
    entryDur: 0.40,
    rotateFrom: -2,
  });
  const commentFs = useFitTextSize({
    text: commentText,
    maxWidth: 720,
    maxFontSize: 80,
    minFontSize: 44,
    fontWeight: 900,
  });

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          bottom: 360,
          left: '50%',
          transform: `translateX(-50%) scale(${env.scale}) rotate(${env.rotate}deg)`,
          transformOrigin: 'center bottom',
          opacity: env.opacity,
          maxWidth: 800,
          padding: '32px 48px',
          background: 'rgba(255,255,255,0.95)',
          borderRadius: 40,
          boxShadow: '0 16px 48px rgba(0,0,0,0.45)',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          willChange: 'transform, opacity',
        }}
      >
        <div
          style={{
            fontFamily: "'Be Vietnam Pro', system-ui, sans-serif",
            fontWeight: 800,
            fontSize: 48,
            color: '#666666',
            lineHeight: 1,
          }}
        >
          {username}
        </div>
        <div
          style={{
            fontFamily: "'Be Vietnam Pro', system-ui, sans-serif",
            fontWeight: 900,
            fontSize: commentFs,
            color: '#000000',
            lineHeight: 1.05,
            textTransform: 'uppercase',
            wordBreak: 'keep-all',
            overflowWrap: 'break-word',
          }}
        >
          {commentText}
        </div>
      </div>
    </AbsoluteFill>
  );
};
