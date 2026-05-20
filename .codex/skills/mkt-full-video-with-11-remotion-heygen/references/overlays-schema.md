# overlays.json — JSON schema (v1)

The single contract that drives the Remotion composition. `Root.tsx` reads this file via `calculateMetadata` and renders the composition with the embedded fps/width/height/duration.

`scripts/validate.py` enforces this schema deterministically.

## Top-level shape

```jsonc
{
  "$schema": "overlays-v1",         // optional, informational
  "aesthetic": "broker_creator",    // ONLY allowed value
  "slug": "cap-may-xai-claude",     // optional
  "video_duration": 77.36,          // seconds, must equal voiceover.mp3 duration (ffprobe)
  "fps": 30,
  "width": 1080,
  "height": 1920,
  "assets": {
    "source_video": "source.mp4",   // path relative to public/assets/
    "voiceover": "voiceover.mp3",
    "captions": "caption-groups.json" // optional separate file
  },
  "overlays": [ /* see "Per-variant fields" */ ],
  "zoom_hooks": [ /* see "Zoom hooks" */ ],
  "sfx_cues": [ /* see "SFX cues" */ ],   // optional
  "caption_groups": [ /* inline caption groups, alternative to assets.captions */ ]
}
```

## Common overlay fields (all variants)

```jsonc
{
  "id": "o01",           // ^o\d{2,3}$ or ^overlay-\d{2,3}$, unique
  "variant": "punch-white",  // one of 14 allowed values (see ALLOWED_VARIANTS)
  "t_start": 0.05,       // seconds from video start, >= 0, < video_duration
  "duration": 2.5        // seconds, > 0, t_start + duration <= video_duration (warn only)
}
```

## Per-variant fields

### `punch-white` / `punch-red` / `punch-yellow` / `punch-2line` / `punch-subtle` / `glitch-text`

```jsonc
{ "id": "o01", "variant": "punch-white", "t_start": 0.05, "duration": 2.5,
  "text": "5 CẤP" }
```

`punch-2line` accepts `\n` in `text` for line break (renderer uses `white-space: pre-line`).

### `logo-pill`

```jsonc
{ "id": "o07", "variant": "logo-pill", "t_start": 20.65, "duration": 2.5,
  "logos": [
    { "path": "gmail.svg",  "label": "GMAIL" },
    { "path": "drive.svg",  "label": "DRIVE" },
    { "path": "slack.svg",  "label": "SLACK" }
  ] }
```

- `logos` is a non-empty array (typically 2-4).
- `path` is relative to `public/assets/logos/`. Bare filenames (`gmail.svg`) are auto-prefixed with `logos/`.
- `label` is optional.

### `logo-pill-single`

```jsonc
{ "id": "o17", "variant": "logo-pill-single", "t_start": 33.28, "duration": 2.0,
  "logo_path": "masterise.svg", "label": "MASTERISE" }
```

### `count-up-money`

```jsonc
{ "id": "o16", "variant": "count-up-money", "t_start": 59.58, "duration": 2.8,
  "from": 5, "to": 15, "prefix": "$", "suffix": "K" }
```

- `to` required, `from` defaults to 0. Final formatted text: `{prefix}{Math.round(animValue)}{suffix}`.

### `count-up-number`

```jsonc
{ "id": "o09", "variant": "count-up-number", "t_start": 30.61, "duration": 2.0,
  "from": 0, "to": 5, "suffix": "TIẾNG/TUẦN" }
```

### `chip-stack`

```jsonc
{ "id": "o11", "variant": "chip-stack", "t_start": 35.51, "duration": 3.5,
  "chips": ["VINHOMES", "MASTERISE", "SUN GROUP"] }
```

- Non-empty string array. Warns if > 5 chips.

### `before-after`

```jsonc
{ "id": "o15", "variant": "before-after", "t_start": 50.38, "duration": 2.5,
  "before_text": "ROYAL CITY", "after_text": "MATRIX ONE" }
```

### `type-on`

```jsonc
{ "id": "o20", "variant": "type-on", "t_start": 70.0, "duration": 3.0,
  "typed_text": "claude code --install", "prompt": "$" }
```

### `comment-bubble`

```jsonc
{ "id": "o21", "variant": "comment-bubble", "t_start": 76.21, "duration": 1.8,
  "username": "@user", "comment_text": "BLOOM em gửi inbox" }
```

## Zoom hooks

```jsonc
{ "t": 0.05,  "type": "soft2step", "peak": 1.09 }
{ "t": 3.79,  "type": "quickpop",  "peak": 1.05 }
{ "t": 75.04, "type": "doublepop", "peak": 1.07 }
{ "t": 32.80, "type": "zoomout",   "low":  0.97, "duration": 0.55 }
```

- `type ∈ { soft2step, quickpop, doublepop, zoomout }`
- For `soft2step/quickpop/doublepop`: `peak` required, must be ≥ 1.0. Warn if > 1.15 (unnatural).
- For `zoomout`: `low < 1.0` required + `duration > 0`.
- Rhythm rule (warn): gaps > 4s between consecutive hooks.

## SFX cues (optional)

```jsonc
{ "t": 0.05,  "file": "camera-shutter.wav", "volume": 0.30 }
{ "t": 71.50, "file": "ground-crack.wav",   "volume": 0.40 }
```

- `file` is basename only — resolved as `staticFile('sfx/' + file)`. Don't include path separators.
- `volume ∈ [0, 1]`, default 0.3.
- Warn if > 6 cues per video (noise threshold).

## Caption groups (inline alternative)

If you don't have a separate `caption-groups.json`, you can inline them into `overlays.json` under top-level `caption_groups`:

```jsonc
"caption_groups": [
  { "text": "Bạn đang ở cấp mấy", "start": 0.05, "end": 1.19 },
  { "text": "khi xài Claude? Hôm nay", "start": 1.19, "end": 2.22 }
]
```

In practice the Phase 3 packager always writes a separate `caption-groups.json` and references it from `assets.captions`. Both forms are accepted; the file form takes priority.

## Worked example — minimal 5-overlay video (10s)

```json
{
  "$schema": "overlays-v1",
  "aesthetic": "broker_creator",
  "slug": "vinhomes-bloom",
  "video_duration": 10.0,
  "fps": 30,
  "width": 1080,
  "height": 1920,
  "assets": {
    "source_video": "source.mp4",
    "voiceover": "voiceover.mp3",
    "captions": "caption-groups.json"
  },
  "overlays": [
    { "id": "o01", "variant": "punch-white",     "t_start": 0.10, "duration": 2.0, "text": "VINHOMES" },
    { "id": "o02", "variant": "punch-yellow",    "t_start": 2.50, "duration": 2.0, "text": "1 TUẦN" },
    { "id": "o03", "variant": "count-up-money",  "t_start": 4.80, "duration": 2.2, "from": 0, "to": 120, "suffix": "TR/M²" },
    { "id": "o04", "variant": "before-after",    "t_start": 7.20, "duration": 2.0, "before_text": "ROYAL CITY", "after_text": "BLOOM" },
    { "id": "o05", "variant": "comment-bubble",  "t_start": 9.00, "duration": 1.0, "username": "@user", "comment_text": "BLOOM em gửi inbox" }
  ],
  "zoom_hooks": [
    { "t": 0.10, "type": "soft2step", "peak": 1.08 },
    { "t": 2.50, "type": "quickpop",  "peak": 1.05 },
    { "t": 4.80, "type": "soft2step", "peak": 1.10 },
    { "t": 7.20, "type": "doublepop", "peak": 1.07 },
    { "t": 9.00, "type": "quickpop",  "peak": 1.06 }
  ],
  "sfx_cues": [
    { "t": 0.10, "file": "camera-shutter.wav", "volume": 0.30 },
    { "t": 4.80, "file": "cyber-1.wav",        "volume": 0.30 },
    { "t": 9.00, "file": "digital-device.wav", "volume": 0.30 }
  ]
}
```

## Error messages (validator output)

The validator prints errors with full JSON path so a sub-agent can fix one at a time:

```
Errors (2):
  ✗ overlays[3]: variant 'logo-pill' missing required fields: ['logos']
  ✗ overlays[7].variant: unknown variant 'punch-magenta' (allowed: ['before-after', 'chip-stack', ...])
```

Warnings are non-fatal (exit 0) but recommended to address:

```
Warnings:
  ⚠ zoom_hooks: gap of 5.2s between t=12.30 and t=17.50 (rule: ≤ 4s)
  ⚠ sfx_cues: 8 cues — recommended max 6 per 60s video to avoid noise
```
