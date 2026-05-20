/**
 * Avatar.tsx — full-frame talking-head backdrop with zoom hooks.
 *
 * The HeyGen MP4 fills 1080x1920 (object-fit: cover). It's anchored at center 22%
 * (face slightly above geometric center). The hook-driven scale is applied on top.
 *
 * We use Remotion's `<OffthreadVideo>` (re-exported by `remotion`) which works in
 * both Studio preview and headless renders. We mute it because the canonical audio
 * track comes from `voiceover.mp3` (HeyGen audio is identical, this prevents double).
 */
import React from 'react';
import { AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { computeAvatarScale, type ZoomHook } from './zoom-hooks';

export type AvatarProps = {
  /** path relative to public/assets/ (e.g. 'source.mp4') */
  src: string;
  zoomHooks: ZoomHook[];
};

export const Avatar: React.FC<AvatarProps> = ({ src, zoomHooks }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = computeAvatarScale(frame, fps, zoomHooks);

  return (
    <AbsoluteFill
      style={{
        overflow: 'hidden',
        transformOrigin: 'center 22%',
        transform: `scale(${scale})`,
        backgroundColor: '#000',
        willChange: 'transform',
      }}
    >
      <OffthreadVideo
        src={staticFile(src)}
        muted
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center 22%',
        }}
      />
    </AbsoluteFill>
  );
};
