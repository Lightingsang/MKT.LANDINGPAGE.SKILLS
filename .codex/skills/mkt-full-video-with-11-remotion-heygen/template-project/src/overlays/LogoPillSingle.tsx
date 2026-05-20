/**
 * LogoPillSingle — 1 big logo + 1 label (solo brand reveal).
 * Position: top: 200, vertical flex. Logo 280px + label 100px.
 */
import React from 'react';
import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { scalePopEnvelope } from './_anim';
import { textShadowStroke } from '../utils/fit-text';

export type LogoPillSingleProps = {
  logoPath: string;
  label?: string;
  durationSec: number;
};

export const LogoPillSingle: React.FC<LogoPillSingleProps> = ({
  logoPath,
  label,
  durationSec,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const env = scalePopEnvelope(frame, fps, durationSec, { entryDur: 0.40 });

  const src =
    logoPath.startsWith('logos/') || logoPath.startsWith('/')
      ? logoPath
      : `logos/${logoPath}`;

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          top: 200,
          left: '50%',
          transform: `translateX(-50%) scale(${env.scale}) rotate(${env.rotate}deg)`,
          transformOrigin: 'center top',
          opacity: env.opacity,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 24,
          willChange: 'transform, opacity',
        }}
      >
        <Img
          src={staticFile(src)}
          style={{
            width: 280,
            height: 280,
            objectFit: 'contain',
            filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.45))',
          }}
        />
        {label ? (
          <div
            style={{
              fontFamily: "'Be Vietnam Pro', system-ui, sans-serif",
              fontWeight: 800,
              fontSize: 100,
              color: '#ffffff',
              textTransform: 'uppercase',
              textShadow: textShadowStroke(3, '#000000'),
              letterSpacing: 1,
            }}
          >
            {label}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
