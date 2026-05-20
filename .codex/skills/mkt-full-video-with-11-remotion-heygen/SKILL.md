---
name: mkt-full-video-with-11-remotion-heygen
description: End-to-end short-video pipeline (Vietnamese broker BĐS, TikTok/Reels 9:16) — script → MP4 via **Remotion** (React component templates), replacing the HyperFrames-based equivalent. 3 phase orchestrator — (1) TTS via `mkt-elevenlabs-tts-to-mp3` or `mkt-video-script-to-mp3` (MiniMax), (2) checkpoint user duyệt MP3, (3) **PARALLEL** HeyGen lip-sync background agent + Phase 3 Remotion packager foreground agent (transcribe + identify emphasis + checkpoint #2 outline + writes 1 single `overlays.json` + opens Remotion Studio). Aesthetic locked broker-creator — avatar full-frame + 14 React overlay variants (PunchWhite/Red/Yellow/2Line/Subtle, LogoPill/Single, CountUpMoney/Number, GlitchText, ChipStack, BeforeAfter, TypeOn, CommentBubble) + 4-type zoom palette + SFX. Template-based — AI picks variants per emphasis word, doesn't write per-video TSX. USE WHEN user says "tạo video bđs remotion", "remotion video pipeline", "remotion react component video", "script to remotion mp4", "video broker creator remotion", "remotion heygen pipeline", "react component video bđs", hoặc đã có script + (optional) b-roll/logos và muốn ra MP4 9:16 via Remotion (not HyperFrames).
---

# mkt-full-video-with-11-remotion-heygen

End-to-end orchestrator: **script → final TikTok/Reels MP4 9:16 via Remotion**.

3 phase, 2 user checkpoints:
1. **MP3 checkpoint** (orchestrator) — user duyệt voiceover sau Phase 1
2. **Overlays-outline checkpoint** (Phase 3 sub-agent) — user duyệt danh sách overlay + timestamps + variants trước khi finalize JSON

Replaces `mkt-full-video-with-11-hyperframe-heygen` for projects where the user prefers a React/TypeScript codebase, prefers code review-friendly artifacts, or wants to render via the Remotion CLI / Remotion Lambda instead of HyperFrames runtime.

## Khi nào dùng

- Script Việt/Anh ≤ 5000 ký tự muốn ra video TikTok hoàn chỉnh
- Có (optional) ảnh b-roll, logos brand
- Project tương thích Remotion (CLI / Lambda / Remotion Studio review)
- Muốn JSON-driven content (1 file `overlays.json` thay vì N HTML files)

**Không dùng nếu:**
- User explicitly muốn HyperFrames → dùng `mkt-full-video-with-11-hyperframe-heygen`
- Đã có MP3 → `heygen-mp3-to-mp4`
- Đã có MP4 talking-head → spawn Phase 3 packager directly với mp4 sẵn
- Script > 5000 ký tự → split semantic

## Pipeline overview

```
Script
   │
   ▼
Phase 1  ── TTS (elevenlabs | minimax) ──► voiceover.mp3
   │
   ▼  CHECKPOINT #1 — user duyệt MP3
   │  OK
   ▼
─── Fire 2 agents PARALLEL (1 message) ────────────────────────────────
   │
   ├─ Phase 2 (BACKGROUND) ── heygen-mp3-to-mp4 ──► source.mp4 (3-10 min)
   │
   └─ Phase 3 (FOREGROUND) ── mkt-full-video-phase3-remotion-packager
              │  audio_source = voiceover.mp3 (audio ≡ source.mp4)
              │  source_mp4_pending = true
              │
              ├─ transcribe voiceover.mp3 + clean + group captions
              ├─ identify emphasis words (brand, prices, urgency, CTA, lists, ...)
              ├─ pick variant per emphasis (from references/variant-catalog.md)
              ├─ CHECKPOINT #2 — user duyệt overlays-outline.json
              ├─ finalize overlays.json with full props
              ├─ run scripts/validate.py — fix errors
              ├─ run scripts/init_project.sh <workspace> — symlink farm + npm install (1x)
              ├─ WAIT for source.mp4 (joins HeyGen background)
              └─ echo Studio URL — DON'T auto-open browser
   │
   ▼
User duyệt Studio preview → `render` → `npx remotion render Root renders/...`
```

Wall-clock savings: HeyGen render (~3-10 min) overlaps với transcribe + outline + checkpoint review (~1-3 min). Tổng pipeline ~5 min thay vì ~8.

## Inputs

| Param | Required | Format |
|---|---|---|
| Script text | Yes | File path `.txt`/`.md` hoặc inline. ≤ 5000 ký tự |
| Slug | No | Auto-derive 5 từ đầu script. Lowercase ASCII dash |
| B-roll list | No | `[{path, purpose}]` — ASCII filenames |
| Logos brand | No | Path(s) tới SVG/PNG logo files for `logo-pill` / `logo-pill-single` variants |
| `tts_provider` | No | `elevenlabs` (default) hoặc `minimax` |
| `voice_id` override | No | CLI `--voice_id <id>`. Default từ `.env` |
| `auto_overlays` | No | Skip checkpoint #2. Default `false` |
| `project_folder` | No | BĐS mode — auto-resolve b-roll |
| `brand_palette` | No | JSON override `{ "accent": "#d97757", ... }` |

## Workspace layout (post-init)

```
workspace/content/YYYY-MM-DD/<slug>/
├── script.txt
├── voiceover.mp3                  # Phase 1
├── source.mp4                     # Phase 2
├── transcript.json                # Phase 3 (Whisper raw)
├── transcript-cleaned.json        # Phase 3 (typo fix)
├── caption-groups.json            # Phase 3 (3-5 words/group)
├── overlays-outline.json          # Pre-checkpoint preview
├── overlays.json                  # FINAL — drives Remotion composition
├── broll/                         # User-provided images (ASCII filenames)
├── sfx-bds/                       # 14-file BĐS SFX library (ASCII rename)
└── remotion-project/              # Symlink farm to template-project
    ├── src/  →  <skill>/template-project/src
    ├── node_modules/  →  shared
    ├── package.json  →  shared
    ├── public/assets/
    │   ├── voiceover.mp3       (symlink)
    │   ├── source.mp4          (symlink)
    │   ├── overlays.json       (symlink)
    │   ├── caption-groups.json (symlink)
    │   ├── logos/              (symlink → skill assets/logos)
    │   ├── sfx/                (symlink → workspace sfx-bds)
    │   └── broll/              (symlink → workspace broll)
    └── renders/
```

## Workflow

### Step 0 — Setup

1. Validate `len(script) ≤ 5000`. Vượt → stop, yêu cầu split.
2. Derive slug (5 từ đầu → lowercase ASCII dash) nếu thiếu.
3. **BĐS mode detect**: `project_folder` set HOẶC user nhắc "video bđs", brand BĐS (Vinhomes/Masterise/Sun/Lumière) → b-roll resolve tới folder. Validate folder + b-roll files tồn tại với ASCII filenames.
4. **TTS provider**: default `elevenlabs`. Validate api key trong `.env`.
5. Tạo `workspace/content/YYYY-MM-DD/<slug>/`. Save `script.txt`.
6. **Fire 2 copy ops song song** (1 message, 2 Bash `run_in_background:true`):
   - Copy b-roll → `broll/` (ASCII rename).
   - Copy 14-file SFX library → `<workspace>/sfx-bds/` từ `workspace/assets/01_Sound Bất động sản/`.
7. Báo user: workspace path, provider, b-roll count, SFX count, logos available.

### Step 1 — Phase 1: Script → MP3

```bash
# ElevenLabs (default, voice Hoàng)
uv run .claude/skills/mkt-elevenlabs-tts-to-mp3/scripts/text_to_mp3.py \
  --file workspace/content/YYYY-MM-DD/<slug>/script.txt \
  -o workspace/content/YYYY-MM-DD/<slug>/voiceover.mp3

# MiniMax (alternative)
uv run .claude/skills/mkt-video-script-to-mp3/scripts/text_to_mp3.py \
  --file <script-path> -o <out.mp3>
```

Filename **inviolable**: `voiceover.mp3`. Check duration ≤ 300s (HeyGen cap).

### Step 2 — CHECKPOINT #1: user nghe MP3

```markdown
## Voiceover ready
**File:** workspace/content/YYYY-MM-DD/<slug>/voiceover.mp3
**Duration:** <X>s · **Size:** <Y>MB · **Provider:** <elevenlabs|minimax>

Reply:
- `OK` / `tiếp` → chạy Phase 2
- `regen` + lý do → tweak voice và regen
- `sửa script` + nội dung → save lại rerun Phase 1
```

**Stop. Đợi user.**

### Step 3 — Phase 2 + Phase 3 PARALLEL (1 message, 2 concurrent agents)

Sau CHECKPOINT #1 OK, fire **2 agents trong 1 message**. Transcribe trên `voiceover.mp3` (audio identical to source.mp4 vì HeyGen chỉ lip-sync) → tiết kiệm 1-3 min.

**Agent A — HeyGen runner (`run_in_background: true`)**

```
subagent_type: general-purpose
run_in_background: true
prompt: |
  Invoke skill `heygen-mp3-to-mp4` với:
  - mp3: workspace/content/YYYY-MM-DD/<slug>/voiceover.mp3
  - output: workspace/content/YYYY-MM-DD/<slug>/source.mp4

  Theo skill: pick avatar từ HEYGEN_AVATAR_LOOKS, upload MP3 via HeyGen REST helper,
  generate lip-sync 9:16 720×1280 via HeyGen MCP, poll ≤ 10 min, download.
  Filename `source.mp4` inviolable.
```

**Agent B — Phase 3 Remotion packager (foreground)**

```
subagent_type: mkt-full-video-phase3-remotion-packager
prompt: |
  Workspace: workspace/content/YYYY-MM-DD/<slug>/
  Slug: <slug>
  Script: <full text>
  B-roll: [...]
  Logos: [...]
  auto_overlays: false
  brand_palette: null
  audio_source: voiceover.mp3
  source_mp4_pending: true

  Run Phase 3 packaging per your agent definition.
  Skill folder for templates + variant catalog:
    .claude/skills/mkt-full-video-with-11-remotion-heygen/

  Return Studio URL (don't auto-open browser).
```

### Step 4 — Hand off

```markdown
## Pipeline DONE — preview ready
**Workspace:** workspace/content/YYYY-MM-DD/<slug>/
**Phase 1 (<provider>):** voiceover.mp3 — <D>s, <S>MB
**Phase 2 (HeyGen):** source.mp4 — <D>s, <S>MB
**Phase 3:** <N> overlays, <K> zoom hooks, <S>/6 SFX cues, <C> caption groups
**Studio:** http://localhost:3000  (open in browser yourself)

Mở Studio, scrub timeline. Nói `render` khi OK →
  cd workspace/content/YYYY-MM-DD/<slug>/remotion-project
  npx remotion render Root renders/<slug>-draft.mp4 --crf 28
  # or for final
  npx remotion render Root renders/<slug>-final.mp4 --crf 18
```

**Stop.** Không auto-render. Không auto-open browser.

## Critical orchestration rules

1. **2 checkpoints, 1 orchestrator gate** — Orchestrator stop ở MP3 only. Outline checkpoint do Phase 3 quản. Render gate ở Studio.
2. **Path conventions inviolable** — `voiceover.mp3`, `source.mp4`, `overlays.json`, `caption-groups.json`. Template expects exact names via `staticFile()`.
3. **HeyGen MCP only** — không curl `https://api.heygen.com/`.
4. **Voice ID trong `.env`, không hard-code.** Override per-call qua `--voice_id`.
5. **Script length hard cap 5000** — fail fast Step 0.
6. **MP3 duration ≤ 300s** — HeyGen single-video cap.
7. **Preview-first** — Phase 3 echo Studio URL, KHÔNG auto-open browser, KHÔNG auto-render.
8. **Phase 3 isolation** — sub-agent context riêng, parent skill body + variant catalog load vào sub-agent.
9. **Phase 2 + 3 parallel kickoff** — Sau CHECKPOINT #1, fire HeyGen background + Phase 3 foreground trong 1 message.
10. **Avatar full-frame always** — `<Avatar>` is full 1080×1920, object-fit cover. KHÔNG split-screen, KHÔNG PIP.
11. **Template files are READ-ONLY for sub-agent.** Sub-agent writes JSON only, never edits `.tsx` files.
12. **One Remotion project per workspace** — `remotion-project/` symlink farm, `node_modules` shared across all workspaces (saves 150MB × N).

## Visual style — broker_creator (LOCKED)

| Tiêu chí | Spec |
|---|---|
| Avatar layout | FULL FRAME 1080×1920 (object-fit cover, z-index 1) |
| Visual driver | 12-20 React overlay components |
| Variants (14) | PunchWhite, PunchRed, PunchYellow, Punch2Line, PunchSubtle, LogoPill, LogoPillSingle, CountUpMoney, CountUpNumber, GlitchText, ChipStack, BeforeAfter, TypeOn, CommentBubble |
| Text style | Be Vietnam Pro 900 + 8-direction text-shadow stroke (NOT -webkit-text-stroke; breaks Vietnamese diacritics) |
| Color palette | White + Red `#e63946` + Yellow `#ffd60a` + Black stroke |
| Animation | `Easing.back(2)` 0.35s scale-pop entry + exit fade |
| Zoom palette | 4 types (soft2step / quickpop / doublepop / zoomout), peaks 1.04-1.10 |
| Captions | bottom 280px, Be Vietnam Pro 600 60px, black 78% pill |
| Text overflow | `useFitTextSize()` hook + canvas measure + step-down |
| fps / canvas | 30 / 1080×1920 |

See [`references/variant-catalog.md`](references/variant-catalog.md) for variant decisions.
See [`references/overlays-schema.md`](references/overlays-schema.md) for JSON schema.

## SFX library — BĐS broker-creator (14 file)

Source: `workspace/assets/01_Sound Bất động sản/`. Step 0 auto-copy to `<workspace>/sfx-bds/` with ASCII rename. `init_project.sh` symlinks `sfx-bds/` → `public/assets/sfx/`.

| File | Trigger | Cap/video |
|---|---|---|
| `camera-shutter.wav` | hook opener, reveal | 2 |
| `ground-crack.wav` | pain agitation climax | 1 |
| `collapse.wav` | phá vỡ định kiến / twist | 1 |
| `giant-foot.m4a` | authority entrance brand reveal | 1 |
| `build-up.wav` | 2-4s pre-reveal (pair with impact) | 2 |
| `count.wav` | "1, 2, 3" listicle | 2 |
| `pop.wav` | text overlay punch (most common) | 6 |
| `ui-tap.wav` | tap highlight | 4 |
| `film-burn.wav` | cinematic cut | 2 |
| `glitch.wav` | before/after transition | 2 |
| `cyber-1.wav` / `cyber-2.wav` | ROI / data reveal (persona "đầu tư") | 2 |
| `digital-device.wav` | FOMO notify / CTA chime | 2 |
| `scifi-monitor.wav` | dashboard reveal | 1 |

**Budget: max 6 cues/video.** Combo rules in `mkt-full-video-with-11-hyperframe-heygen/SKILL.md` SFX section apply identically here.

## Failure modes

| Symptom | Hành động |
|---|---|
| Script > 5000 | Stop, yêu cầu split semantic |
| TTS API fail | Check `<PROVIDER>_API_KEY` trong `.env` |
| MP3 > 300s | Stop, chunking |
| HeyGen render fail | `mcp__heygen__get_current_user` credits check |
| HeyGen timeout Phase 3 stall > 15 min ở Step 9 wait | Kill HeyGen agent, re-spawn |
| `overlays.json` validation fail | `validate.py` prints errors with full JSON path — fix one at a time |
| `npm install` fail | Check Node ≥ 18, `npm doctor` |
| Studio shows "overlays.json not found" | `init_project.sh` chưa chạy — run it |
| Logo missing 404 | `assets/logos/` chưa có SVG — add file matching `overlays.json` path |
| Text tràn canvas | `useFitTextSize` đã handle. Nếu vẫn tràn — check `maxFontSize` not lowered, `maxWidth` not above 960 |
| Avatar render black | Check `source.mp4` symlink target exists, `ffprobe source.mp4` valid |
| Captions blank | `caption-groups.json` symlink missing in `public/assets/` |
| Render slow / OOM | Lower `--concurrency` (default `null`/auto), drop CRF, ensure no other Chromium running |

## References

- **TTS A** — `.claude/skills/mkt-elevenlabs-tts-to-mp3/SKILL.md` (default voice Hoàng)
- **TTS B** — `.claude/skills/mkt-video-script-to-mp3/SKILL.md` (MiniMax)
- **HeyGen** — `.claude/skills/heygen-mp3-to-mp4/SKILL.md`
- **Phase 3 sub-agent** — `.claude/agents/mkt-full-video-phase3-remotion-packager.md`
- **Remotion best practices** — `.claude/skills/remotion-best-practices/SKILL.md` (load via Skill tool when working on Remotion code)
- **Variant catalog (decision guide)** — [`references/variant-catalog.md`](references/variant-catalog.md)
- **JSON schema (worked examples)** — [`references/overlays-schema.md`](references/overlays-schema.md)
- **Golden sample** — [`references/examples/cap-may-xai-claude.overlays.json`](references/examples/cap-may-xai-claude.overlays.json) (21 overlays + 34 zoom hooks + 6 SFX, 77.36s)
- **SFX assets BĐS** — `workspace/assets/01_Sound Bất động sản/` (14 file)
- **HyperFrames equivalent (for comparison)** — `.claude/skills/mkt-full-video-with-11-hyperframe-heygen/SKILL.md`
- **HF visual aesthetic source** — `.claude/skills/mkt-hyperframe-luxury-realestate-9-16/SKILL.md`
