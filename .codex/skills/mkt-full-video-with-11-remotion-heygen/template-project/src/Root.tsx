/**
 * Root.tsx — composition registry.
 *
 * One composition `Root` reads:
 *   public/assets/overlays.json     — main schema (required)
 *   public/assets/caption-groups.json — optional caption groups
 *
 * We use `calculateMetadata` so that:
 *   - the composition picks up live edits to overlays.json without re-bundle
 *   - fps/width/height/duration come from the JSON itself (single source of truth)
 *   - we can fetch the captions JSON sibling and merge it into props
 *
 * Fallback: if `overlays.json` is missing (e.g. studio opened before init_project.sh ran),
 * we render a stub composition so the studio still loads with a helpful error message.
 */
import React from 'react';
import { Composition, staticFile, AbsoluteFill } from 'remotion';
import type { CalculateMetadataFunction } from 'remotion';
import type { OverlaysData } from './types';
import type { CaptionGroup } from './Captions';
import { Video, type VideoProps } from './Video';

const FALLBACK_DATA: OverlaysData = {
  aesthetic: 'broker_creator',
  video_duration: 5.0,
  fps: 30,
  width: 1080,
  height: 1920,
  assets: {
    source_video: 'source.mp4',
    voiceover: 'voiceover.mp3',
  },
  overlays: [],
  zoom_hooks: [],
  sfx_cues: [],
};

const MissingAssets: React.FC = () => (
  <AbsoluteFill
    style={{
      backgroundColor: '#1a1a1a',
      color: '#fff',
      fontFamily: 'system-ui, sans-serif',
      padding: 80,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 32,
      textAlign: 'center',
    }}
  >
    <div style={{ fontSize: 80, fontWeight: 900 }}>overlays.json not found</div>
    <div style={{ fontSize: 36, maxWidth: 800, lineHeight: 1.4 }}>
      Run <code style={{ background: '#333', padding: '4px 12px', borderRadius: 6 }}>
        scripts/init_project.sh &lt;workspace&gt;
      </code>{' '}
      to symlink workspace assets into <code>public/assets/</code>.
    </div>
  </AbsoluteFill>
);

const calculateRootMetadata: CalculateMetadataFunction<VideoProps> = async ({ props, abortSignal }) => {
  let data: OverlaysData = FALLBACK_DATA;
  let captionGroups: CaptionGroup[] | undefined = props.captionGroups;

  // 1. Prefer inputProps (CLI: `--props=overlays.json`). When `data.overlays` has
  //    items it means the caller already passed real data, so skip the fetch.
  if (props.data && Array.isArray(props.data.overlays) && props.data.overlays.length > 0) {
    data = props.data;
    console.log('[Root] using inputProps data with', data.overlays.length, 'overlays, duration', data.video_duration);
  } else {
    // 2. Fallback: Studio mode — fetch from public/ via staticFile.
    const overlaysUrl = staticFile('assets/overlays.json');
    console.log('[Root] fetching overlays.json from:', overlaysUrl);
    try {
      const res = await fetch(overlaysUrl, { signal: abortSignal });
      console.log('[Root] overlays.json status:', res.status);
      if (res.ok) {
        data = (await res.json()) as OverlaysData;
        console.log('[Root] loaded overlays.json with', data.overlays?.length, 'overlays, duration', data.video_duration);
      }
    } catch (err) {
      console.error('[Root] fetch overlays.json failed:', err);
    }
  }

  if (!captionGroups) {
    try {
      const captionsUrl = staticFile('assets/caption-groups.json');
      const res = await fetch(captionsUrl, { signal: abortSignal });
      if (res.ok) {
        captionGroups = (await res.json()) as CaptionGroup[];
      }
    } catch {
      // Captions optional
    }
  }

  // Pull dimensions / fps / duration from the loaded JSON (or fallback)
  const fps = data.fps || 30;
  const width = data.width || 1080;
  const height = data.height || 1920;
  const durationInFrames = Math.max(1, Math.ceil((data.video_duration || 5) * fps));

  return {
    durationInFrames,
    fps,
    width,
    height,
    props: { data, captionGroups },
  };
};

const RootComponent: React.FC<VideoProps> = (props) => {
  if (props.data.overlays.length === 0 && props.data.video_duration === FALLBACK_DATA.video_duration) {
    return <MissingAssets />;
  }
  return <Video {...props} />;
};

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Root"
      component={RootComponent}
      // Defaults — overridden by calculateMetadata once overlays.json loads.
      durationInFrames={FALLBACK_DATA.video_duration * FALLBACK_DATA.fps}
      fps={FALLBACK_DATA.fps}
      width={FALLBACK_DATA.width}
      height={FALLBACK_DATA.height}
      defaultProps={{
        data: FALLBACK_DATA,
        captionGroups: undefined,
      }}
      calculateMetadata={calculateRootMetadata}
    />
  );
};
