/**
 * LogoPill — horizontal brand logo strip (1-4 logos).
 * Container: black 85% pill, white 4px border, padding, top: 120.
 * Each logo: 120px Img + optional 32px label.
 * Animation: container scale-pop, individual logos stagger fade-in.
 */
import React from 'react';
import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
} from 'remotion';
import { scalePopEnvelope } from './_anim';

const CLAMP = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

export type LogoPillItem = {
  /** path relative to public/assets/logos/ (or absolute under public/) */
  path: string;
  /** optional label rendered below the logo */
  label?: string;
};

export type LogoPillProps = {
  logos: LogoPillItem[];
  durationSec: number;
};

export const LogoPill: React.FC<LogoPillProps> = ({ logos, durationSec }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const env = scalePopEnvelope(frame, fps, durationSec, { entryDur: 0.40 });

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          top: 120,
          left: '50%',
          transform: `translateX(-50%) scale(${env.scale}) rotate(${env.rotate}deg)`,
          transformOrigin: 'center top',
          opacity: env.opacity,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 32,
          padding: '24px 40px',
          background: 'rgba(0,0,0,0.85)',
          borderRadius: 60,
          border: '4px solid #ffffff',
          boxShadow: '0 12px 40px rgba(0,0,0,0.45)',
          willChange: 'transform, opacity',
        }}
      >
        {logos.map((logo, i) => {
          // Stagger each logo: 0.1s = 3 frames offset after container settles
          const f0 = Math.round(0.35 * fps) + i * 3;
          const itemOpacity = interpolate(frame, [f0, f0 + 6], [0, 1], CLAMP);
          const itemScale = interpolate(frame, [f0, f0 + 6], [0.6, 1.0], {
            ...CLAMP,
            easing: Easing.out(Easing.poly(2)),
          });
          // Resolve path: if it doesn't start with 'logos/' or '/', prefix with 'logos/'
          const src =
            logo.path.startsWith('logos/') || logo.path.startsWith('/')
              ? logo.path
              : `logos/${logo.path}`;
          return (
            <div
              key={`${logo.path}-${i}`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12,
                opacity: itemOpacity,
                transform: `scale(${itemScale})`,
              }}
            >
              <Img
                src={staticFile(src)}
                style={{
                  width: 120,
                  height: 120,
                  objectFit: 'contain',
                }}
              />
              {logo.label ? (
                <div
                  style={{
                    fontFamily: "'Be Vietnam Pro', system-ui, sans-serif",
                    fontWeight: 700,
                    fontSize: 32,
                    color: '#ffffff',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}
                >
                  {logo.label}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
