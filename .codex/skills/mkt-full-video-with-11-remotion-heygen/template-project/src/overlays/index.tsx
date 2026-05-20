/**
 * overlays/index.ts — registry + OverlayEntry type union.
 *
 * Each overlay in `overlays.json` has a `variant` string. The registry maps that string
 * to a React component. `Video.tsx` reads each entry, wraps it in a <Sequence>, and
 * mounts the matching component.
 *
 * Adding a new variant:
 *   1. Create `src/overlays/MyVariant.tsx` exporting `MyVariant` component
 *   2. Add `'my-variant'` to `OverlayVariant` union below
 *   3. Add registry mapping below
 *   4. Add the case in the `renderOverlay()` switch
 *   5. Update `scripts/validate.py` ALLOWED_VARIANTS
 *   6. Update `references/variant-catalog.md`
 */
import React from 'react';

import { PunchWhite } from './PunchWhite';
import { PunchRed } from './PunchRed';
import { PunchYellow } from './PunchYellow';
import { Punch2Line } from './Punch2Line';
import { PunchSubtle } from './PunchSubtle';
import { LogoPill, type LogoPillItem } from './LogoPill';
import { LogoPillSingle } from './LogoPillSingle';
import { CountUpMoney } from './CountUpMoney';
import { CountUpNumber } from './CountUpNumber';
import { GlitchText } from './GlitchText';
import { ChipStack } from './ChipStack';
import { BeforeAfter } from './BeforeAfter';
import { TypeOn } from './TypeOn';
import { CommentBubble } from './CommentBubble';

export type OverlayVariant =
  | 'punch-white'
  | 'punch-red'
  | 'punch-yellow'
  | 'punch-2line'
  | 'punch-subtle'
  | 'logo-pill'
  | 'logo-pill-single'
  | 'count-up-money'
  | 'count-up-number'
  | 'glitch-text'
  | 'chip-stack'
  | 'before-after'
  | 'type-on'
  | 'comment-bubble';

/** Common fields every overlay carries. */
type OverlayBase = {
  id: string;
  t_start: number;
  duration: number;
};

/** Discriminated union — each variant has typed props. */
export type OverlayEntry =
  | (OverlayBase & { variant: 'punch-white'; text: string })
  | (OverlayBase & { variant: 'punch-red'; text: string })
  | (OverlayBase & { variant: 'punch-yellow'; text: string })
  | (OverlayBase & { variant: 'punch-2line'; text: string })
  | (OverlayBase & { variant: 'punch-subtle'; text: string })
  | (OverlayBase & { variant: 'logo-pill'; logos: LogoPillItem[] })
  | (OverlayBase & { variant: 'logo-pill-single'; logo_path: string; label?: string })
  | (OverlayBase & {
      variant: 'count-up-money';
      from?: number;
      to: number;
      prefix?: string;
      suffix?: string;
    })
  | (OverlayBase & { variant: 'count-up-number'; from?: number; to: number; suffix?: string })
  | (OverlayBase & { variant: 'glitch-text'; text: string })
  | (OverlayBase & { variant: 'chip-stack'; chips: string[] })
  | (OverlayBase & { variant: 'before-after'; before_text: string; after_text: string })
  | (OverlayBase & { variant: 'type-on'; typed_text: string; prompt?: string })
  | (OverlayBase & { variant: 'comment-bubble'; username?: string; comment_text: string });

export const ALLOWED_VARIANTS: OverlayVariant[] = [
  'punch-white',
  'punch-red',
  'punch-yellow',
  'punch-2line',
  'punch-subtle',
  'logo-pill',
  'logo-pill-single',
  'count-up-money',
  'count-up-number',
  'glitch-text',
  'chip-stack',
  'before-after',
  'type-on',
  'comment-bubble',
];

/**
 * Render a single overlay entry. Caller is responsible for wrapping in <Sequence>.
 * Returns null if variant is unrecognized.
 */
export function renderOverlay(entry: OverlayEntry): React.ReactElement | null {
  switch (entry.variant) {
    case 'punch-white':
      return <PunchWhite text={entry.text} durationSec={entry.duration} />;
    case 'punch-red':
      return <PunchRed text={entry.text} durationSec={entry.duration} />;
    case 'punch-yellow':
      return <PunchYellow text={entry.text} durationSec={entry.duration} />;
    case 'punch-2line':
      return <Punch2Line text={entry.text} durationSec={entry.duration} />;
    case 'punch-subtle':
      return <PunchSubtle text={entry.text} durationSec={entry.duration} />;
    case 'logo-pill':
      return <LogoPill logos={entry.logos} durationSec={entry.duration} />;
    case 'logo-pill-single':
      return (
        <LogoPillSingle
          logoPath={entry.logo_path}
          label={entry.label}
          durationSec={entry.duration}
        />
      );
    case 'count-up-money':
      return (
        <CountUpMoney
          from={entry.from}
          to={entry.to}
          prefix={entry.prefix}
          suffix={entry.suffix}
          durationSec={entry.duration}
        />
      );
    case 'count-up-number':
      return (
        <CountUpNumber
          from={entry.from}
          to={entry.to}
          suffix={entry.suffix}
          durationSec={entry.duration}
        />
      );
    case 'glitch-text':
      return <GlitchText text={entry.text} durationSec={entry.duration} />;
    case 'chip-stack':
      return <ChipStack chips={entry.chips} durationSec={entry.duration} />;
    case 'before-after':
      return (
        <BeforeAfter
          beforeText={entry.before_text}
          afterText={entry.after_text}
          durationSec={entry.duration}
        />
      );
    case 'type-on':
      return (
        <TypeOn typedText={entry.typed_text} prompt={entry.prompt} durationSec={entry.duration} />
      );
    case 'comment-bubble':
      return (
        <CommentBubble
          username={entry.username}
          commentText={entry.comment_text}
          durationSec={entry.duration}
        />
      );
    default:
      return null;
  }
}

// Re-export individual components for direct use / tests
export {
  PunchWhite,
  PunchRed,
  PunchYellow,
  Punch2Line,
  PunchSubtle,
  LogoPill,
  LogoPillSingle,
  CountUpMoney,
  CountUpNumber,
  GlitchText,
  ChipStack,
  BeforeAfter,
  TypeOn,
  CommentBubble,
};
export type { LogoPillItem };
