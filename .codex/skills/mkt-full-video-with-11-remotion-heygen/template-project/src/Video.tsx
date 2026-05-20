/**
 * Video.tsx — root composition.
 *
 * Layer stack (z-index):
 *   100 captions
 *   80  overlay punches (one Sequence each)
 *   1   avatar (full-frame backdrop, transform: scale via zoom hooks)
 *
 * Audio:
 *   voiceover.mp3 — full duration, primary audio
 *   sfx/* — short Sequences per cue
 */
import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from 'remotion';
import type { OverlaysData } from './types';
import { renderOverlay } from './overlays';
import { Avatar } from './Avatar';
import { Captions, type CaptionGroup } from './Captions';
import { SfxTrack } from './SfxTrack';

export type VideoProps = {
  data: OverlaysData;
  captionGroups?: CaptionGroup[];
};

export const Video: React.FC<VideoProps> = ({ data, captionGroups }) => {
  const { fps } = useVideoConfig();
  const groups = captionGroups ?? data.caption_groups ?? [];

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {/* Layer 1: avatar (full-frame) */}
      <AbsoluteFill style={{ zIndex: 1 }}>
        <Avatar src={data.assets.source_video} zoomHooks={data.zoom_hooks} />
      </AbsoluteFill>

      {/* Layer 80: text overlays — one Sequence per entry */}
      {data.overlays.map((overlay) => {
        const from = Math.max(0, Math.round(overlay.t_start * fps));
        const durFrames = Math.max(1, Math.round(overlay.duration * fps));
        const element = renderOverlay(overlay);
        if (!element) return null;
        return (
          <Sequence
            key={overlay.id}
            from={from}
            durationInFrames={durFrames}
            layout="none"
            name={`${overlay.variant}: ${overlay.id}`}
          >
            <AbsoluteFill style={{ zIndex: 80 }}>{element}</AbsoluteFill>
          </Sequence>
        );
      })}

      {/* Layer 100: captions */}
      <AbsoluteFill style={{ zIndex: 100 }}>
        <Captions groups={groups} />
      </AbsoluteFill>

      {/* Primary audio: voiceover */}
      <Audio src={staticFile(data.assets.voiceover)} />

      {/* SFX cues */}
      {data.sfx_cues && data.sfx_cues.length > 0 ? <SfxTrack cues={data.sfx_cues} /> : null}
    </AbsoluteFill>
  );
};
