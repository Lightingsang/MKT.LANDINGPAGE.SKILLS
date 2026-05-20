/**
 * SfxTrack.tsx — render one Audio sequence per SFX cue.
 *
 * Each cue: `{ t, file, volume }`. We wrap each in a `<Sequence from={fps*t}>` with
 * a short durationInFrames (1.5s default — long enough for typical SFX one-shot).
 * `volume` clamps to [0, 1]. Files are resolved via `staticFile('sfx/' + file)`.
 */
import React from 'react';
import { Audio, Sequence, staticFile, useVideoConfig } from 'remotion';

export type SfxCue = {
  t: number;
  file: string;
  volume?: number;
};

export type SfxTrackProps = {
  cues: SfxCue[];
  /** seconds — how long each SFX <Audio> sequence stays mounted (default 2.0s) */
  cueWindowSec?: number;
};

export const SfxTrack: React.FC<SfxTrackProps> = ({ cues, cueWindowSec = 2.0 }) => {
  const { fps } = useVideoConfig();
  const cueFrames = Math.max(1, Math.round(cueWindowSec * fps));

  return (
    <>
      {cues.map((cue, i) => {
        const from = Math.max(0, Math.round(cue.t * fps));
        const vol = Math.max(0, Math.min(1, cue.volume ?? 0.3));
        return (
          <Sequence key={`${cue.file}-${i}-${from}`} from={from} durationInFrames={cueFrames}>
            <Audio src={staticFile(`sfx/${cue.file}`)} volume={vol} />
          </Sequence>
        );
      })}
    </>
  );
};
