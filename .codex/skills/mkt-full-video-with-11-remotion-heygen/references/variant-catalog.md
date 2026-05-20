# Variant catalog — picking the right overlay variant

Decision guide for the Phase 3 packager (and humans) when mapping an emphasis word/phrase from the transcript to one of the 14 overlay variants.

## Decision tree

```
Is it money or a price?
  └── Animated count? → count-up-money
  └── Static reveal? → punch-red

Is it a time-saving (X TIẾNG/PHÚT/NGÀY)?
  └── Animated count? → count-up-number
  └── Static reveal? → punch-yellow

Is it a brand/tool name with a known logo?
  └── 2-4 logos side by side? → logo-pill
  └── 1 hero logo with label? → logo-pill-single
  └── No logo asset available? → punch-white (text only)

Is it a 2-line compound concept? (vd "TAY MƠ → KIẾN TRÚC SƯ", "GMAIL · DRIVE · SLACK")
  → punch-2line

Is it a list of 3-5 short items? (vd "3 lý do", "5 amenity")
  → chip-stack

Is it a transformation A → B?
  → before-after

Is it a command, URL, or terminal-style reveal? (vd "/install", "claude.ai")
  → type-on

Is it a CTA / social comment? (vd "BLOOM", "comment 1 em gửi")
  → comment-bubble

Is it the CLIMAX reveal of the video?
  → glitch-text

Is it a descriptive subtitle / background label?
  → punch-subtle

Default emphasis (level names, brand text without logo, generic punch):
  → punch-white
```

## Per-variant quick-reference

### `punch-white` — default emphasis (15-50% of overlays in a typical video)
- **Use for:** level names ("CẤP 1"), generic brand text, listicle headers, anchors
- **Props:** `{ text: string }`
- **Color:** `#ffffff` + 8-direction black stroke
- **Position:** top-center, top: 120px
- **Typical fontSize after fit:** 130-170 px

### `punch-red` — money / climax
- **Use for:** price drops ("$5-15K"), big reveals where money is implied
- **Props:** `{ text: string }`
- **Color:** `#e63946` + heavy black stroke + drop shadow
- **Position:** top-center, top: 120px
- **Typical fontSize after fit:** 150-200 px
- **Combo:** pair with `cyber-1.wav` or `ground-crack.wav` SFX

### `punch-yellow` — urgency / time
- **Use for:** "1 TUẦN", "HÔM NAY", "5 PHÚT", deadline phrases
- **Props:** `{ text: string }`
- **Color:** `#ffd60a` + black stroke
- **Animation:** mid-pulse adds urgency feel

### `punch-2line` — 2-line compound
- **Use for:** 2 contrasting concepts ("TAY MƠ → KIẾN TRÚC SƯ"), tool stacks ("GMAIL · DRIVE · SLACK"), questions ("CẤP MẤY?\nBÌNH LUẬN")
- **Props:** `{ text: string }` — use `\n` for line break
- **Position:** top-center
- **Typical fontSize after fit:** 100-130 px

### `punch-subtle` — descriptive subtitle
- **Use for:** softer labels under big numbers, "Người mới chơi", "Đi pha cà phê", "Đám mây"
- **Props:** `{ text: string }`
- **Color:** white 85% opacity, lighter weight 600
- **Position:** bottom 380px (above captions at bottom 280px)
- **Animation:** fade-in + y-shift, NO scale pop

### `logo-pill` — brand logo strip
- **Use for:** tool stacks with available SVG assets ("Gmail / Drive / Slack")
- **Props:** `{ logos: { path: string; label?: string }[] }`
- **Container:** black 85% pill, white 4px border
- **Logos:** 120px each, optional label below
- **Stagger:** 0.1s between logo fade-ins
- **Logo path resolution:** if it doesn't start with `logos/` or `/`, prefix is added (so `gmail.svg` → `logos/gmail.svg`)

### `logo-pill-single` — solo brand hero
- **Use for:** ONE brand reveal (chủ đầu tư: "MASTERISE", "VINGROUP")
- **Props:** `{ logo_path: string; label?: string }`
- **Logo size:** 280px square + 100px label below

### `count-up-money` — animated $ count
- **Use for:** revealed prices with animated count-up effect
- **Props:** `{ from?: number; to: number; prefix?: string; suffix?: string }` (default from=0)
- **Color:** red + heavy stroke + shake on settle
- **Format:** `{prefix}{Math.round(animValue)}{suffix}` — e.g. `from=0 to=15 prefix='$' suffix='K'` → counts "$0K → $15K"

### `count-up-number` — animated time/quantity
- **Use for:** time savings ("5 TIẾNG/TUẦN"), counts ("3 LÝ DO")
- **Props:** `{ from?: number; to: number; suffix?: string }`
- **Layout:** number on top, suffix (60% size) below — vertical stack
- **Color:** yellow + black stroke

### `glitch-text` — climax reveal
- **Use for:** ONE-PER-VIDEO climax moment ("HẠ TẦNG", "2026")
- **Props:** `{ text: string }`
- **Color:** red main + red-shifted clone + cyan-shifted clone (RGB-split)
- **Animation:** scale-pop entry + 4 frames of jitter at peak
- **Combo:** pair with `ground-crack.wav` or `collapse.wav` SFX

### `chip-stack` — vertical list
- **Use for:** 3-5 short list items ("Vinhomes", "Masterise", "Sun Group")
- **Props:** `{ chips: string[] }`
- **Per-chip:** white 95% bg, 3px black border, 60px black text, 80px tall
- **Animation:** staggered fade-in from left (0.15s offset)

### `before-after` — A → B
- **Use for:** transformations ("ROYAL CITY → MATRIX ONE", "BAO CẤP → CAO XÀ LÁ")
- **Props:** `{ before_text: string; after_text: string }`
- **BEFORE:** white strikethrough, opacity 0.5
- **Arrow:** yellow "→"
- **AFTER:** red bold, scale-pop reveal

### `type-on` — terminal typing
- **Use for:** commands, URLs ("https://claude.ai/code", `/install`, `claude code`)
- **Props:** `{ typed_text: string; prompt?: string }` (default prompt=`$`)
- **Background:** `#0f1419` dark terminal, 2px gray border
- **Font:** ui-monospace 70px
- **Color:** green text `#00ff88` + blinking cursor

### `comment-bubble` — CTA social comment
- **Use for:** call-to-action mimicking a TikTok/Instagram comment (vd "BLOOM em gửi inbox")
- **Props:** `{ username?: string; comment_text: string }` (default username=`@user`)
- **Background:** white 95% rounded bubble
- **Layout:** username gray small + comment_text black big

## Logo brand mapping (BĐS)

Place SVG files under `<skill>/assets/logos/`. The Phase 3 packager will reference them by basename in `overlays.json`.

| Topic | File | Brand |
|---|---|---|
| Real estate (chủ đầu tư) | `vinhomes.svg` | Vinhomes |
| | `masterise.svg` | Masterise Homes |
| | `vingroup.svg` | Vingroup parent |
| | `sun-group.svg` | Sun Group |
| | `novaland.svg` | Novaland |
| | `ecopark.svg` | Ecopark |
| | `gamuda.svg` | Gamuda Land |
| Project name pillars | `lumiere.svg` | Lumière (Masterise) |
| | `the-zen-residences.svg` | The Zen Residences |
| Tools / AI | `claude.svg` | Anthropic Claude |
| | `gmail.svg` | Gmail |
| | `slack.svg` | Slack |
| | `drive.svg` | Google Drive |
| | `excel.svg` | Microsoft Excel |
| | `ppt.svg` | PowerPoint |

These are placeholder names — user adds the actual SVG files. The variant components fall back to a blank Img tag if the file is missing (404 will appear in DevTools but the layout won't crash).

## Density rules

For a 60-90s video, aim for:
- **12-20 total overlays** (1 every 3-5s avg)
- **3-6 unique variants** per video (don't use all 14 in one video — picks lose impact)
- **1-2 hero variants max** — glitch-text, logo-pill-single, count-up-money should be rare and reserved for climax moments
- **5-10 punch-white** as anchor — they carry the rhythm
- **No two adjacent overlays of the same variant within 5s** (visual repetition fatigue)

## SFX pairing cheat-sheet

| Variant | Typical SFX | Volume |
|---|---|---|
| punch-white | `pop.wav` or `ui-tap.wav` (alternate) | 0.30 |
| punch-red | `cyber-1.wav` (data) or `ground-crack.wav` (climax) | 0.30-0.40 |
| punch-yellow | `pop.wav` or `count.wav` | 0.30 |
| punch-2line | `glitch.wav` (if transition) or none | 0.30 |
| count-up-money | `cyber-1.wav` + `pop.wav` on settle | 0.30 |
| count-up-number | `count.wav` | 0.20 |
| logo-pill | `giant-foot.m4a` (authority entrance) | 0.35 |
| glitch-text | `ground-crack.wav` or `collapse.wav` | 0.40 |
| chip-stack | `count.wav` (per-chip) | 0.20 |
| before-after | `glitch.wav` | 0.30 |
| comment-bubble | `digital-device.wav` (chime) | 0.30 |
