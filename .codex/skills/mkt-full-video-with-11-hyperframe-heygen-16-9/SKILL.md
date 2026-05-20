---
name: mkt-full-video-with-11-hyperframe-heygen-16-9
description: End-to-end LANDSCAPE 16:9 (1920×1080) talking-head + slide knowledge video pipeline. Orchestrator 3 phase ghép `mkt-elevenlabs-tts-to-mp3` + `heygen-mp3-to-mp4` + HyperFrames để ra MP4 dạng "podcast keynote" — HeyGen avatar trong floating frame bo tròn bên phải (claude-orange border), slide modern AI / Claude editorial bên trái, có PIP zoom-out moments (slide full-screen, avatar shrink xuống corner thumbnail), breathing zoom + beat-driven punch-in trên avatar, optional cream-paper hand-drawn editorial infographic ở root layer (KHÔNG embed trong composition). Phase 3 fan-out N parallel LLM sub-agents (1 per scene) để author composition HTML từ visual-plan.json — không dùng Python template generator. Hỗ trợ listicle 6+ scenes (tip-1..tip-N) với scene-{num}.html naming. Resume mode: nếu MP3 + source.mp4 đã tồn tại thì skip Phase 1 + 2, vào thẳng Phase 3. USE WHEN user nói "tạo video 16:9", "video ngang", "video landscape", "podcast keynote video", "talking head + slide video", "slide + avatar layout", "make a landscape AI video", "Claude editorial video pipeline", "video kiến thức 16:9", "video chia sẻ kiến thức ngang", "video keynote AI", "16-9 short video", "video YouTube ngang từ script", "tạo video knowledge AI dạng ngang", "plan lại video 16:9", "redo phase 3 video keynote". Dùng skill này BẤT CỨ KHI NÀO user nhắc tới video landscape / 16:9 / podcast keynote / slide+avatar — kể cả khi không gọi tên HyperFrames hay HeyGen — vì 99% case đó là pipeline này. KHÁC với sibling `mkt-full-video-with-11-hyperframe-heygen` (sibling là 9:16 vertical TikTok/Reels/Shorts; skill này là 16:9 landscape keynote).
---

# mkt-full-video-with-11-hyperframe-heygen-16-9

End-to-end orchestrator: **script → final MP4 16:9 (1920×1080) podcast-keynote**.

Output là 1 file MP4 1920×1080 dạng "talking-head + slide" — HeyGen avatar trong floating rounded frame bên phải (claude-orange brand border), slide nội dung modern AI / Claude editorial bên trái, có PIP zoom-out moments khi slide cần full-screen emphasis. Compositions auto-bake các pattern dưới đây — không cần edit thủ công.

## Auto-baked patterns (Phase 3 output)

Mọi video orchestrator-generated đều tự động có:

1. **Per-scene composition HTML** — authored by **parallel LLM sub-agents** (1 sub-agent per scene, fanned out in 1 message), NOT by Python templates:
   - Output: `compositions/scene-1.html` … `compositions/scene-N.html` (1 file per scene, unique filename for any N)
   - Each sub-agent reads its scene block từ `visual-plan.json` + reference docs (`references/composition-patterns.md`, `slide-design-tokens.md`, `infographic-prompt-template.md`) rồi author HTML/CSS/GSAP từ scratch — pick the right pattern for that scene's specific metaphor, don't lock to 5 fixed archetypes
   - Why LLM not Python: HyperFrames có vô số visual thinking pattern (before-after, hub-and-spokes, two-clock-comparison, three-tier-comparison, scroll-tape, hero-orb-spec-trio, terminal-mock, gift-box…). Python generator chỉ biết 5 archetype fixed → boring, không adapt được scene-specific metaphor như "scroll-tape-wasted" hoặc "right-tool-vehicles". LLM authoring per scene đủ creative để phục vụ design intent.
   - Brand logos auto-attach: orchestrator passes brand context (`claude` / `chatgpt` / `gemini` / `claude-code`) cho sub-agent, sub-agent reference logos ở `assets/logos/` và embed vào composition khi pattern cần (orb glow, tool-badge pill, fail-row icon)

2. **"Hybrid Hook" visual zoom strategy** trên `.avatar-breathing` (Phase 3e via `generate_root_index.py`):
   - HOOK scene: slow ramp **1.0 → 1.10** over scene duration (drama build)
   - HOOK→BODY: snap reset **1.10 → 1.0** (release tension)
   - BODY scenes: **1.06 punch beats** at PIP-IN events (rhythm)
   - CTA scene: gentle **1.0 → 1.04** push (close)
   - Replaces flat "breathing yoyo" — mỗi scene archetype có chuyển động zoom riêng

3. **Cream-paper b-roll PIP-swap layer** (split-labor architecture — IMPORTANT):
   - HTML composition (slide-mount) carries **DATA / TIER-LETTERS / ITEMS / BADGES / TITLE / brand logos** — always on
   - `<img class="broll-image">` cream-paper editorial illustration carries **METAPHOR / EMOTION** — full stage 1920×1080, fades in during PIP windows of its scene, fades out otherwise
   - Each layer says **1 nửa thông điệp** khác nhau (HTML = "WHAT", image = "WHY/FEELS")
   - **CRITICAL:** image lives ONLY at root layer (`<img id="broll-N">` in `index.html`). Composition HTML must NOT embed `<div class="image-slot">` — that bóp 16:9 image vào ô nhỏ → xấu. Compositions là DATA-only layer.
   - Image source: planner skill writes `prompts.md` → user generates `1.png`-`N.png` qua AI33/Nano Banana Pro hoặc `mkt-broll-image`
   - Full stage 1920×1080, `object-fit: contain`, cream `#F0EEE6` letterbox blends invisibly

4. **Avatar frame brand-colored border** (Phase 3e via `generate_root_index.py`):
   - SPLIT default state: claude-orange `#d97757` 3px solid + 6px halo + 80px outer glow (warm brand frame, KHÔNG dùng white border)
   - PIP state: violet `#a78bfa` 3px solid + 6px halo + 60px glow (emphasis cue khi avatar shrink)
   - Override per brand: nếu user pick `chatgpt`/`gemini`/`claude-code` brand emphasis, generator dùng matching accent

5. **Captions overlay** (default ON when `compositions/captions.html` exists):
   - Bottom-center pill at `bottom: 100px`, Inter 600 38px white on dark violet-bordered pill
   - Phrase-by-phrase fade in/out (0.18s), hard `tl.set` kill at end of each chunk
   - Generated by `generate_captions.py` from constant Jinja template + per-video `captions.json` (or Whisper segments fallback)
   - Auto-mounted by `generate_root_index.py` at z-index 28; disable with `--no-captions`
   - See Phase 3e Step 2 below

6. **YT subscribe lower-third** at last 3s (default ON):
   - Composition `yt-lower-third.html` mounted ở `data-start = total_duration - 3.0s`
   - Slide-in animation + Subscribe button press + Subscribed state swap
   - z-index 60 (above all layers), `pointer-events: none`
   - Channel name + subscriber count baked into `compositions/yt-lower-third.html` (edit nếu user muốn rename)
   - Disable: `generate_root_index.py --no-yt-lower-third`. Custom duration: `--yt-lower-third-duration 4.5`

**Tất cả 5 pattern đều auto-baked** — orchestrator không cần thêm step. User chỉ cần render `1.png`-`N.png` (Phase 3.5) thì split-labor mới fully visible. Nếu skip image gen, video vẫn play đẹp với HTML compositions thuần (image layer ở opacity 0).

## Differences from 9:16 sibling skill

| | `mkt-full-video-with-11-hyperframe-heygen` (9:16) | **`-16-9` (this skill)** |
|---|---|---|
| Aspect | 1080×1920 portrait | **1920×1080 landscape** |
| Layout | Avatar fullscreen + caption strip + b-roll cuts | **Slide pane left (1200) + avatar floating frame right (540×880)** |
| Caption mount | Yes (TikTok-style word-by-word) | **No captions by default** (slide carries the message visually) |
| PIP mechanic | None | **SPLIT ↔ PIP transitions** — slide expands to 1920, avatar shrinks to 320×420 corner |
| Avatar motion | Static fullscreen | **Breathing yoyo + scene-start punch-in** |
| Slide style | Variant-based mockups (post-stack, ai-window, app-card…) | **LLM-authored per-scene compositions + modern AI palette + cream-paper b-roll at root layer** |
| Composition author | Python templates | **N parallel LLM sub-agents (1 per scene)** |
| Render | TikTok/Reels/Shorts | **Podcast keynote / YouTube knowledge / LinkedIn** |
| HeyGen render | 720×1280 portrait | **720×1280 portrait STILL** (cropped via `object-position: center 25%` into landscape avatar frame — not 1280×720!) |

Pick this skill cho mọi landscape knowledge video. Pick sibling cho mọi vertical short-form.

## Khi nào dùng

- User có script tiếng Việt (60–150s) muốn ra video knowledge dạng **podcast keynote landscape**
- User muốn output có "feel" Claude AI / Anthropic editorial: dark slide bg, neon-glow tier-letter, glass card, cream-paper infographic ở root layer
- Topic chia sẻ kiến thức / case study / before-after / tool comparison / **listicle 5+ tips** — phù hợp slide-driven, hỗ trợ N scene tuỳ ý (3, 5, 7, 10…)
- Kênh đăng: YouTube ngang, LinkedIn video, podcast clip, embed website
- User đã có MP3 + source.mp4 sẵn và muốn replan Phase 3 → orchestrator skip Phase 1+2, vào thẳng Phase 3

Không dùng skill này nếu:
- User cần TikTok/Reels/Shorts vertical → dùng sibling 9:16
- Script > 5000 ký tự → split semantic trước
- Topic visual-heavy thuần (montage, music video) — skill này tối ưu cho talking-head + slide

## Pipeline overview

```
Script (Vietnamese, ≤ 5000 chars)
    │
    ▼
[Phase 0.5 Resume detection — nếu voiceover.mp3 + source.mp4 đã tồn tại → skip Phase 1+2]
    │
    ▼
Phase 1 ── mkt-elevenlabs-tts-to-mp3 ─────► voiceover.mp3
    │                                          │
    │                              CHECKPOINT #1 — user nghe + duyệt MP3
    │                                          │
    │                                          ▼ (OK)
Phase 2 ── heygen-mp3-to-mp4 ─────────────► source.mp4 (720×1280 portrait, lip-synced)
    │                                          (KHÔNG render 1280×720)
    │
    ▼
Phase 3a ── transcribe (Whisper) → voiceover.srt + transcript.json
Phase 3b ── plan_visuals.py → visual-plan.json + prompts.md
              (planner skill: mkt-plan-short-video-edit-16-9)
              CHECKPOINT #2 — user duyệt plan
    │
    ▼ (LLM customizes visual-plan.json per-scene metaphor/tier-letter/items)
    │
Phase 3c ── apply_plan_to_scenes.py → scenes.json (editor-compatible)
Phase 3d ── 🔥 FAN OUT N parallel LLM sub-agents (1 per scene) 🔥
              → compositions/scene-1.html … scene-N.html
              (each sub-agent: read visual-plan scene block + references → author HTML/CSS/GSAP)
Phase 3e ── scaffold_project.py (sfx/ + logos/ + avatar.jpg + yt-lower-third.html)
            generate_root_index.py → index.html (1920×1080, mounts scene-N.html, broll layer, PIP, SFX, brand-mark, claude-orange avatar border)
Phase 3f ── lint + preview (Studio @ http://localhost:3002)
            (optional Phase 3.5: gen 1.png-N.png cream-paper qua AI33/Nano)
    │
    ▼
User duyệt preview Studio → "render" → npx hyperframes render → out.mp4 1920×1080
```

**Checkpoints:**
- **#1 MP3 voiceover** — orchestrator gate (skip nếu resume mode).
- **#2 Visual plan** — Phase 3b gate (skip được nếu `auto_scenes=true`).
- **Render gate** — user confirm trong Studio rồi mới render.

## Inputs

| Input | Required | Format / ví dụ |
|---|---|---|
| Topic | Yes | Tiêu đề ngắn ("Lợi ích Claude AI", "5 mẹo tiết kiệm Claude token") |
| Brand emphasis | Yes | `claude` / `chatgpt` / `gemini` / `claude-code` / `generic` — quyết định accent palette + logo + avatar border color |
| Script text | Yes (trừ resume mode) | File `.txt`/`.md` hoặc inline. Tiếng Việt. ≤ 5000 ký tự |
| Output slug | No | Auto-derive từ topic. Lowercase, ASCII, dash. |
| Number of scenes | No | Default 5 (Hook / Problem / Solution / Recap / CTA). Có thể 3–10 tuỳ độ dài. **Listicle 5+ tip OK** — fanout 1 sub-agent per tip + 1 hook + 1 CTA. |
| Avatar look | No | 1 ID lấy từ `HEYGEN_AVATAR_LOOKS` env. Random nếu không chọn. |
| Infographic mode | No | `now` (gen ảnh ngay qua `mkt-broll-image`) / `scaffold` (chỉ ghi `prompts.md`, user gen tay sau) / `none`. Default `scaffold`. |
| `auto_scenes` | No | Default `false`. `true` để skip scenes-outline checkpoint. |
| `start_at` | No | `phase_1` (default) / `phase_2` / `phase_3`. Resume entry point. |
| `skip_phase_1` / `skip_phase_2` | No | Boolean shortcut for resume mode (alternative to `start_at=phase_3`). |

## Workspace layout

```
workspace/content/YYYY-MM-DD/<slug>/
├── script.txt                  # Phase 0 — clean text user cung cấp
├── script-tagged.txt           # Phase 1a — script + ElevenLabs v3 audio tags ([excited], [sigh]…)
├── voiceover.mp3               # Phase 1b
├── voiceover.srt               # Phase 3a (Whisper)
├── voiceover_segments.json     # Phase 3a (word-level segments)
├── source.mp4                  # Phase 2 (720×1280 portrait — DO NOT render landscape)
├── transcript.json             # Phase 3a (whisper words)
├── transcript-cleaned.json     # Phase 3a (manual fix typos)
├── scenes-outline.json         # Phase 3b — pre-checkpoint outline
├── visual-plan.json            # Phase 3b — full machine-readable plan (planner output)
├── scenes.json                 # Phase 3c — editor-compatible flatten of visual-plan
├── prompts.md                  # Phase 3b — cream-paper editorial prompts (1 per scene)
├── 1.png  2.png  ... N.png     # Phase 3.5 — cream infographic images (1 per scene), root broll layer
├── captions.json               # Phase 3e (optional) — orchestrator-curated [{text,start,end},...]; falls back to voiceover_segments.json if missing
├── compositions/
│   ├── scene-1.html            # Phase 3d — LLM-authored, 1200×1080 native landscape
│   ├── scene-2.html            # 1 file per scene, regardless of N
│   ├── ...
│   ├── scene-N.html
│   ├── captions.html           # Phase 3e — generated from captions.html.j2 + captions.json (or Whisper segments)
│   └── yt-lower-third.html     # Phase 3e — auto-copied from skill assets
├── assets/
│   └── logos/                  # Phase 3e — auto-copied (claude.png, chatgpt.png, gemini.jpg, claude-code.png)
├── sfx/                        # Phase 3e — 6 default SFX
└── index.html                  # Phase 3e — Root composition 1920×1080
```

`YYYY-MM-DD` = ngày hôm nay (UTC+7).

## Workflow

### Step 0 — Setup + resume detection

1. Validate `len(script_text) <= 5000` (skip nếu resume mode + không có script input). Vượt → stop.
2. Derive slug từ topic nếu thiếu.
3. Tạo `workspace/content/YYYY-MM-DD/<slug>/`. Save `script.txt` (skip nếu resume + script đã tồn tại).
4. Pick brand accent palette (xem `references/slide-design-tokens.md`).
5. **Resume detection** — kiểm tra workspace:
   - Nếu `voiceover.mp3` + `source.mp4` đều tồn tại VÀ user không request rerun → set `start_at=phase_3`. Báo: "MP3 + source.mp4 đã có. Skip Phase 1+2. Bắt đầu Phase 3."
   - Nếu chỉ có `voiceover.mp3` → set `start_at=phase_2`. Báo: "MP3 đã có. Skip Phase 1. Bắt đầu Phase 2 (HeyGen)."
   - Nếu chưa có gì → `start_at=phase_1`. Báo: "Workspace tạo tại `<folder>`. Bắt đầu Phase 1 — ElevenLabs TTS."
6. User có thể override resume detection bằng input flag (e.g., `start_at=phase_3` để force skip).

### Step 1 — Phase 1: Script → MP3 (ElevenLabs)

Skip if `start_at=phase_2` or `phase_3`.

Phase này tách thành 2 sub-step:
- **1a — Audio-tag enrichment**: orchestrator (LLM) đọc `script.txt`, chèn ElevenLabs v3 audio tags (`[excited]`, `[curious]`, `[sigh]`, …) khớp với content emotion, ghi `script-tagged.txt`. KHÔNG chạy script tự động — LLM tự làm vì cần map tone-per-câu.
- **1b — TTS render**: gọi `mkt-elevenlabs-tts-to-mp3` trên `script-tagged.txt`. Sub-skill đã default `model_id=eleven_v3` nên nhận tag inline.

#### 1a — Sinh `script-tagged.txt`

(Optional deep-dive: `references/elevenlabs-audio-tags.md` if it exists in the skill folder — currently inline-only. Don't `Read` this path blindly without verifying first; if missing, the inline summary below is enough.) Tóm tắt cốt lõi:

- Brand voice của Hoàng (`K7ewtjKRNtwwt3lKQ6M0`) — giọng nam Việt midrange, conversational. Hợp với `[excited]`, `[curious]`, `[sigh]`, `[chuckles]`, `[sarcastic]`, `[whispers]` (vừa phải). **Tránh** `[shouts]`, `[crying]`, `[sings]`, sound-effect tag (`[applause]`, `[gunshot]`…) — SFX dùng file rời ở composition layer.
- Density: 1 tag mỗi 8–15s. 60s script ≈ 4–8 tag tổng. Quá nhiều → giật-giật.
- Default mapping theo scene archetype:
  - **Hook** → `[curious]` mở câu hỏi → `[excited]` payoff số liệu
  - **Problem / Fail** → `[sigh]` admit fail + `[sarcastic]` callout
  - **Solution / Mechanism** → `[curious]` setup + `[excited]` reveal
  - **Recap** → `[chuckles]` warm close + CAPS keyword emphasis
  - **CTA** → `[excited]` (đơn lẻ, không stack)
- Punctuation hint: `…` ellipsis cho pause weight trước reveal, `CAPS` 1–2 keyword/câu cho emphasis.
- KHÔNG paraphrase, không thêm/bớt câu — chỉ chèn tag + đổi case keyword + thêm `…`.

Save vào `workspace/content/YYYY-MM-DD/<slug>/script-tagged.txt`.

#### 1b — Render MP3 từ `script-tagged.txt`

```bash
uv run .claude/skills/mkt-elevenlabs-tts-to-mp3/scripts/text_to_mp3.py \
  --file workspace/content/YYYY-MM-DD/<slug>/script-tagged.txt \
  -o    workspace/content/YYYY-MM-DD/<slug>/voiceover.mp3
```

Check duration:

```bash
uv run .claude/skills/heygen-mp3-to-mp4/scripts/check_duration.py \
  workspace/content/YYYY-MM-DD/<slug>/voiceover.mp3
```

`TOO_LONG` (>300s) → stop.

### Step 2 — CHECKPOINT #1: user nghe MP3

Skip if `start_at=phase_2` or `phase_3`.

```markdown
## Voiceover ready — duyệt giúp mình

**File:** `workspace/content/YYYY-MM-DD/<slug>/voiceover.mp3`
**Duration:** <X.X>s
**Voice:** ElevenLabs Brand Voice của Hoàng (model `eleven_v3`)
**Audio tags:** <list các tag đã chèn>

Reply:
- **`OK`** → Phase 2 (HeyGen avatar 16:9 portrait-source)
- **`regen`** → tweak voice settings — giữ nguyên tag
- **`đổi tags`** → instruction → patch `script-tagged.txt` rồi rerun TTS
- **`sửa script`** + nội dung mới → rerun toàn bộ Phase 1
```

**Stop tool calls.** Đợi user.

### Step 3 — Phase 2: MP3 → HeyGen MP4 (auto)

Skip if `start_at=phase_3`.

**Critical 16:9 quirk:** vẫn render HeyGen ở **720×1280 portrait** (aspectRatio=`9:16` + resolution=`720p`). Lý do:
- Avatar frame trong layout này là 540×880 (portrait-ish) khi SPLIT, và 320×420 khi PIP — cả 2 đều closer to portrait than landscape.
- HeyGen render avatar 9:16 portrait có headroom đủ để `object-fit: cover; object-position: center 25%` crop chuẩn.
- Render 1280×720 landscape sẽ ra avatar có 2 dải đen hoặc face quá nhỏ → bad.

**Step 3.0 — OAuth check (first call mỗi session):** HeyGen MCP chỉ expose `mcp__heygen__authenticate` + `complete_authentication` cho đến khi auth complete. Nếu các tool video (`create_video_from_avatar`, `get_video`) chưa có trong deferred-tool list, gọi `mcp__heygen__authenticate`, paste authorize URL cho user, đợi callback. Sau auth, các tool thật mới load.

**Step 3.1 — Upload MP3 (REST helper):** MCP **không expose** `upload_asset` nữa. Dùng helper:

```bash
uv run .claude/skills/heygen-mp3-to-mp4/scripts/upload_asset.py \
  workspace/content/YYYY-MM-DD/<slug>/voiceover.mp3
# → prints "OK <asset_id>" on stdout
```

Helper resolves `HEYGEN_API_KEY` từ (in order): `--key-file` → env var → `.env.local` → `.env` → `~/Documents/GitHub/hoang-ai-marketing/.env`. Placeholder stubs (`your_*`) auto-skipped.

**Step 3.2 — Pick avatar look** từ `HEYGEN_AVATAR_LOOKS`:

```bash
HEYGEN_AVATAR_LOOKS=$(
  grep -h '^HEYGEN_AVATAR_LOOKS=' .env.local .env 2>/dev/null \
  | head -1 | cut -d'=' -f2- | tr -d '"' | tr -d "'"
)
# Fallback nếu placeholder (avatar_look_id_1,…) hoặc empty:
[[ "$HEYGEN_AVATAR_LOOKS" == avatar_look_id_* || -z "$HEYGEN_AVATAR_LOOKS" ]] && \
  HEYGEN_AVATAR_LOOKS=$(grep '^HEYGEN_AVATAR_LOOKS=' ~/Documents/GitHub/hoang-ai-marketing/.env | cut -d'=' -f2-)
echo "$HEYGEN_AVATAR_LOOKS" | tr ',' '\n' | awk 'BEGIN{srand()} {a[NR]=$0} END{print a[int(rand()*NR)+1]}'
```

**Step 3.3 — Generate via MCP** (new schema — `aspectRatio` + `resolution`, NOT `dimension`):

```yaml
# mcp__heygen__create_video_from_avatar input
avatarId:      <picked from allowlist>
audioAssetId:  <from step 3.1>
aspectRatio:   "9:16"    # portrait-source — KHÔNG đổi sang 16:9
resolution:    "720p"    # → 720×1280
title:         "<slug>-16-9-<timestamp>"
```

Returns `{video_id, status: "waiting"}`.

**Step 3.4 — Poll status** với `mcp__heygen__get_video` mỗi 10–15s. Status: `waiting` / `processing` → keep polling; `completed` → grab `video_url`; `failed` → surface `failure_message`.

**zsh trap:** trong polling loop bash/zsh, KHÔNG dùng tên biến `status` (read-only trong zsh — script crash với "read-only variable"). Dùng `vstate`, `phase`, hoặc `ready`.

**Step 3.5 — Download** về workspace:

```bash
uv run .claude/skills/heygen-mp3-to-mp4/scripts/download_video.py \
  "<video_url>" workspace/content/YYYY-MM-DD/<slug>/source.mp4
```

Báo user 1 dòng: "Phase 2 done — source.mp4 (avatar `<id>`, <D>s, portrait crop ready). Sang Phase 3…"

**Không stop ở đây.**

### Step 4 — Phase 3: Visual planning + LLM-authored slide compositions

Phase 3 là phần "smart" của orchestrator — tách thành 6 sub-step. **Phase 3d (LLM fanout) là điểm khác biệt lớn nhất** so với mọi pipeline video khác.

#### 4a — Transcribe & scene outline

```bash
# Word-level transcript via Whisper. The mkt-ai-video-extract-srt-segment skill
# delegates to heygen-short-video's transcribe_mp3.py — call that path directly
# (the wrapper "extract.py" mentioned in some old docs DOES NOT exist).
uv run .claude/skills/heygen-short-video/scripts/transcribe_mp3.py \
  workspace/content/YYYY-MM-DD/<slug>/voiceover.mp3 \
  --language vi --model base
# Output: voiceover.srt + voiceover_segments.json
```

**Then flatten** `voiceover_segments.json` (nested: `[{id, start, end, text, words: [...]}, ...]`) into the **flat** `transcript.json` (`[{word, start, end}, ...]`) that the planner expects. Without this conversion, `plan_visuals.py` fails with `FileNotFoundError: Neither transcript-cleaned.json nor transcript.json found`:

```bash
python3 -c "
import json, sys
src = 'workspace/content/YYYY-MM-DD/<slug>/voiceover_segments.json'
dst = 'workspace/content/YYYY-MM-DD/<slug>/transcript.json'
segs = json.load(open(src))
words = [w for s in segs for w in s['words']]
json.dump(words, open(dst, 'w'), ensure_ascii=False, indent=2)
print(f'flattened {len(segs)} segments → {len(words)} words → {dst}')
"
```

Optionally save a manually-cleaned copy as `transcript-cleaned.json` (planner prefers cleaned over raw). For TTS-generated voiceovers Whisper often mangles numbers (`94%` → `chỉ mít tư vấn trăm`) and brand names (`AI OS` → `AIOS`). The cleaned version is only used for scene-boundary timing inside the planner — display strings come from the original `script.txt`, so manual cleanup is optional unless you need exact word-level captions.

Build `scenes-outline.json` — orchestrator (LLM) reads `transcript-cleaned.json` + `script.txt`, decides scene boundaries based on script structure (hook → tips/sections → CTA). Listicle script với 5 mẹo → 7 scenes (1 hook + 5 tips + 1 CTA). Knowledge video với 1 chính luận → 5 scenes (hook/problem/solution/recap/cta).

```json
[
  {"num": 1, "kind": "hook",  "start": 0.0,   "end": 22.62, "kicker": "...", "heading": "...", "variant": "tier-row-before-after"},
  {"num": 2, "kind": "tip-1", "start": 22.62, "end": 41.04, "kicker": "MẸO 1 · ...", "heading": "...", "variant": "chats-stack"},
  {"num": 3, "kind": "tip-2", "start": 41.04, "end": 58.86, "kicker": "MẸO 2 · ...", "heading": "...", "variant": "counter-row"},
  ... (tip-3, tip-4, tip-5) ...
  {"num": 7, "kind": "cta",   "start": 136.6, "end": 148.78, "kicker": "...", "heading": "...", "variant": "comment-terminal"}
]
```

`kind` có thể là bất cứ tên nào (`hook`, `problem`, `solution`, `tip-1`..`tip-N`, `recap`, `cta`, `intro`, `mid-rolling`…). Generator dùng `scene-{num}.html` filename — không có collision dù N=10.

`variant` ↔ pattern hint trong `references/composition-patterns.md` (sub-agent có thể adapt/blend theo metaphor):

| `variant` hint | Pattern khởi điểm | Khi dùng |
|---|---|---|
| `tier-row-before-after` | tier-row × 2 (before red/rose + after lime/green) | Hook so sánh trước/sau |
| `chats-stack` | chat-row stack + broken-chain stamp | Problem / fail / objection / Edit-Regen demo |
| `hero-orb-spec-trio` | hero-row với orb + 3 tier-row spec | Solution / mechanism / vault central + spokes |
| `counter-row` | tier-letter + strike-line counter + client-rows | Result / number proof / "X tin = Y token" |
| `comment-terminal` | tier-letter + macOS terminal mock + gift-rows | CTA |
| `stats-3card` | 3 column stats landing-style | Knowledge intro / timezone advantage / 3-fact reveal |
| `comparison-2col` | 2 cột Yes/Yes chip | "When to use which" / Haiku vs Sonnet vs Opus |
| `two-clock-comparison` | 2 đồng hồ + conic-gradient arc | Timezone, time-comparison |
| `three-tier-comparison` | 3 cards comparison | Right tool for job / 3 vehicle tiers |

Sub-agent được khuyến khích **adapt** pattern khi metaphor đòi hỏi — đó là LLM authoring's strength so với Python templates.

#### 4b — Visual planning (call planner skill)

Call `mkt-plan-short-video-edit-16-9`. Outputs `visual-plan.json` (machine-readable plan với tier-letters + b-roll metaphors + items/badges + PIP events) + `prompts.md` (cream-paper editorial prompts ready cho AI33).

```bash
python3 .claude/skills/mkt-plan-short-video-edit-16-9/scripts/plan_visuals.py \
  --workspace workspace/content/YYYY-MM-DD/<slug>/ --brand <brand>
python3 .claude/skills/mkt-plan-short-video-edit-16-9/scripts/render_infographic_prompts.py \
  --workspace workspace/content/YYYY-MM-DD/<slug>/
```

**🛑 MANDATORY customization step — do NOT skip:** the planner produces `visual-plan.json` with **generic placeholder content** ("Soạn email / Đọc tài liệu / Tổng hợp báo cáo" items, "8h vs 0h" hourglass tier-letters, "robot-orb-with-tasks" metaphor). These are scaffolding only — they have nothing to do with the actual script. If you spawn sub-agents directly off the raw planner output, every scene comes out generic and disconnected from content. The fix is a 1-pass orchestrator edit before sub-agent fanout.

For each scene in `visual-plan.json`, override these 5 fields with content drawn from `script.txt`:
- `tier_letter` — the symbolic display letter (e.g., `94%`, `OS`, `+45%`, `30h`, `$5.2B`, `3`, `AI`) — pulled from the scene's payoff number / keyword
- `accent_words` — keywords to gradient-highlight inside the heading (`["94%", "6%", "AI OS"]`)
- `items[]` — 2–4 list rows of `{icon, label}` reflecting the scene's actual bullet points (NOT "Soạn email")
- `badges[]` — 1–2 corner chips of `{color, icon, label, num, pos}` for proof/risk numbers
- `broll[0]` — the cream-paper b-roll spec: `metaphor` (slug like `scroll-tape-burn-vs-return`), `title_vi`, `subtitle_vi`, `layout_description` (concrete drawing instructions in VN), `decorative_elements`, `palette_accents`. Use a Python heredoc with the full overrides dict and dump back to `visual-plan.json`.

Then **re-run `render_infographic_prompts.py`** to regenerate `prompts.md` from the customized plan. Skipping this regen leaves stale generic prompts in `prompts.md`.

#### 4c — CHECKPOINT #2: user duyệt visual plan

Present plan summary (NOT raw JSON) cho user — see `mkt-plan-short-video-edit-16-9/references/plan-checkpoint-protocol.md`. User reply:
- `OK` → tiếp Phase 3d
- `đổi scene N metaphor sang <X>` / `đổi tier-letter scene N thành <Y>` → patch `visual-plan.json` + re-render `prompts.md`
- `đổi scene N variant X` → swap variant
- `merge scene N+M` / `split scene N` → re-outline
- `xem prompt N` → paste prompt scene N

Skip nếu `auto_scenes=true`. Once approved, call planner's `apply_plan_to_scenes.py`:

```bash
python3 .claude/skills/mkt-plan-short-video-edit-16-9/scripts/apply_plan_to_scenes.py \
  --workspace workspace/content/YYYY-MM-DD/<slug>/
```

Output: `scenes.json` với editor-compatible structure.

#### 4d — 🔥 LLM SUB-AGENT FANOUT (composition authoring) 🔥

**Đây là core của Phase 3.** Spawn N parallel `general-purpose` sub-agents — 1 per scene — trong **1 message** (single message với N Agent tool calls để chúng chạy concurrent).

**KHÔNG dùng `generate_compositions.py`** (Python Jinja2 generator) — script đó deprecated. Lý do:
- Python generator chỉ biết 5 archetype fixed (hook/problem/solution/recap/cta) → boring, không adapt scene-specific metaphor
- Listicle 6+ scene gây filename collision (nhiều tip cùng map về `recap-card.html` → ghi đè nhau)
- LLM authoring per scene cho phép sub-agent pick best pattern + creative tweaks (vehicle tiers, two-clock, vault+spokes…) tùy metaphor
- Memory feedback: "HyperFrames compositions must be LLM-generated, not Python-templated"

**Sub-agent prompt template** (1 per scene, customize per scene):

```
Write the HyperFrames composition HTML for scene {N} ({kind} — {brief content title}).

Output file:
`/Users/tonyhoang/Documents/GitHub/claudeclaw-os/workspace/content/YYYY-MM-DD/<slug>/compositions/scene-{N}.html`

SCENE BRIEF — read full data từ `<workspace>/visual-plan.json` (your block = `scenes[{N-1}]`):
- num: {N}, kind: {kind}, variant hint: {variant}
- duration: {start}–{end}s ({duration}s total)
- kicker: "{kicker}"
- heading: "{heading}"
- accent_words: {accent_words}
- tier_letter: "{tier_letter}"
- items: {items count + brief}
- badges: {badges count + brief}
- broll metaphor: {metaphor description} (image lives at root layer `#broll-{N}`, NOT inside this composition)
- PIP-IN windows: {PIP events with absolute timestamps + relative seconds}

READ these references FIRST (mandatory — pattern code in composition-patterns.md is copy-paste production-tested):
- `/Users/tonyhoang/Documents/GitHub/claudeclaw-os/.claude/skills/mkt-full-video-with-11-hyperframe-heygen-16-9/references/composition-patterns.md` (8 production-shipped patterns — pick the best fit, adapt freely)
- `/Users/tonyhoang/Documents/GitHub/claudeclaw-os/.claude/skills/mkt-full-video-with-11-hyperframe-heygen-16-9/references/slide-design-tokens.md` (palette + typography + glass card + tier-letter spec)

HARD REQUIREMENTS:
- 1200×1080 viewport · landscape · pure black BG (#000)
- `<template id="scene-{N}-template">` wrapper (HF requires template wrapper)
- Root: `<div data-composition-id="scene-{N}" data-start="0" data-width="1200" data-height="1080">`
- All CSS scoped: `[data-composition-id="scene-{N}"] .selector {}` — never bare class selectors at file root
- GSAP via window.gsap (no imports). Register: `window.__timelines["scene-{N}"] = tl;`
- Use `R = '[data-composition-id="scene-{N}"]'` const in JS, then `R + ' .word'` style selectors
- No `!important` anywhere
- Inter + JetBrains Mono Google fonts (preconnect + link tags)
- Accent palette: pick from {recommended for this scene's kind/metaphor}
- Title: wrap accent_words in `<span class="word grad-{accent}">...</span>` for gradient highlight
- DATA layer ONLY — do NOT embed `<div class="image-slot">` or `<img src="../{N}.png">` inside this composition. Cream-paper image lives at ROOT level (#broll-{N} in index.html), fades full-stage 1920×1080 during PIP windows.
- GSAP timeline duration ≈ scene duration (with 0.5s buffer); register all motion to `tl`

Style language: Claude AI editorial · modern AI dark theme · glass cards (rgba(15,20,30,0.55) + 1.5px accent border + backdrop-filter blur) · Inter 800 title 68–110px / line-height 0.96 / letter-spacing -0.035em · JetBrains Mono eyebrow 16px / 0.22em / uppercase + dot 8px brand-color glow · tier-letter font-weight 900 + text-shadow accent glow.

Pick the right pattern for this scene's metaphor — don't be generic. Adapt freely (e.g., "hero-orb" can become "vault + 5 spokes", "stats-3card" can become "two-clock-comparison").

Report back with: chosen pattern, accent palette, 1-line confirmation of file written. Under 100 words.
```

Spawn 7 (or N) sub-agents trong 1 message:

```python
# Pseudo-code for orchestrator
parallel_spawn([
    Agent(prompt=scene_brief(1, ...)),
    Agent(prompt=scene_brief(2, ...)),
    Agent(prompt=scene_brief(3, ...)),
    ...
    Agent(prompt=scene_brief(N, ...)),
])
# All run concurrent. Wait for all to finish. Each writes 1 file.
```

After all sub-agents return, verify `compositions/scene-1.html` … `compositions/scene-N.html` exist.

#### 4e — Scaffold project + captions + write `index.html`

```bash
# 1. Copy sfx/, logos/, avatar.jpg, yt-lower-third.html into workspace
python3 .claude/skills/mkt-hyperframe-talking-head-video-16-9/scripts/scaffold_project.py \
  --workspace workspace/content/YYYY-MM-DD/<slug>/

# 2. Render captions overlay from constant Jinja template + captions.json (or
#    Whisper segments fallback). Style is fixed across videos — only the data
#    array changes — so this is pure template injection, not LLM authoring.
uv run .claude/skills/mkt-hyperframe-talking-head-video-16-9/scripts/generate_captions.py \
  --workspace workspace/content/YYYY-MM-DD/<slug>/

# 3. Generate root index.html (mounts scene-N.html, broll layer, PIP, SFX,
#    brand-mark, AND auto-detects compositions/captions.html → mounts at z-28)
python3 .claude/skills/mkt-hyperframe-talking-head-video-16-9/scripts/generate_root_index.py \
  --workspace workspace/content/YYYY-MM-DD/<slug>/ \
  --brand-handle "@hoanglearnaiautomation" \
  --brand-label "HOANG · LEARN AI"
# Use --no-captions to disable the overlay even when captions.html exists.
```

**Captions source order** (first match wins inside `generate_captions.py`):

1. `workspace/captions.json` — orchestrator-curated. Format: `[{"text": "...", "start": s, "end": s}, ...]`. Use this when you want clean script-derived text (e.g. Vietnamese where Whisper mangles numbers + brand names — `94%` → "chỉ mít tư vấn trăm", `AI OS` → `AIOS`). Build by either:
   - Spawning a 1-shot sub-agent to align `script.txt` chunks (3–8 words each) against Whisper segment timings (proportional distribution by char count), OR
   - Hand-editing after the auto-fallback pass below

2. `workspace/voiceover_segments.json` — raw Whisper output (auto-fallback). Each segment becomes one caption block as-is. Acceptable for English / first-pass review; replace with curated `captions.json` before the final render.

**Style is constant** — Inter 600 38px, dark pill (rgba(0,0,0,0.78) + violet border #a78bfa), bottom-center of stage at `bottom: 100px`, fade in/out 0.18s + hard `tl.set` kill at end. Lives at z-index 28 (above slide-mount z-20, below avatar-frame z-30). Edit `assets/templates/captions.html.j2` if the design language ever changes — never hand-write the per-video `compositions/captions.html`.

`generate_root_index.py` always uses `compositions/scene-{num}.html` as composition src — matches the LLM sub-agent output filenames. No legacy kind→fs-lesson-1/recap-card mapping.

Avatar frame border: claude-orange `#d97757` (SPLIT) + violet `#a78bfa` (PIP). Override per `--brand` flag if user picks chatgpt/gemini/claude-code.

Auto-baked into root index.html:
- `[data-composition-id="root"]` 1920×1080
- `#slide-bg` (black) z-index 5
- `#heygen-bg` (right pane warm side-light) z-index 9
- `#avatar-frame` (SPLIT default 540×880 at (1290, 100)) z-index 30 với claude-orange border
- `<video #v-source>` + `<audio #a-source>` (source.mp4)
- 6 `<audio>` SFX
- `#brand-mark` top-left
- `<img id="broll-1>` … `<img id="broll-N>` cream-paper b-roll layer (full 1920×1080, opacity 0 default, fade in during PIP)
- N `<div class="clip slide-mount" data-composition-src="compositions/scene-{N}.html">`
- GSAP timeline với `goPIP(t)` / `goSplit(t)` helpers, PIP_EVENTS array, hybrid hook zoom strategy

#### 4f — (Optional) Infographic gen

Nếu user chọn `infographic mode = now` (hoặc reply `retry` ở image-gen step):

```bash
# Parse prompts.md, fan out parallel calls to generate.py
python3 .claude/skills/image-post-creator/scripts/generate.py \
  '<PROMPT_<2K_CHARS>' \
  -o workspace/content/YYYY-MM-DD/<slug>/N.png \
  -ar 16:9 -p ai33 --size 2K -v
```

**Note:** orchestrator có thể spawn parallel image gen (7 PNG cùng lúc) qua ThreadPoolExecutor wrapper. AI33 thỉnh thoảng trả `temporary_model_error` — retry sau 1-2 phút hoặc fallback `-p nano` (Gemini Flash Image với GEMINI_API_KEY).

Nếu `infographic mode = scaffold` (default): chỉ ghi `prompts.md`, root broll layer ở opacity 0. User render ảnh sau khi xem preview, refresh Studio để thấy.

#### 4g — Lint + preview

```bash
npx hyperframes lint  # Must report 0 errors
npx hyperframes preview workspace/content/YYYY-MM-DD/<slug>/
# Studio opens at http://localhost:3002
```

Common warnings: `composition_self_attribute_selector` (non-blocking authoring style note — can ignore).

### Step 5 — Hand off

```markdown
## Full video pipeline DONE — preview ready

**Workspace:** `workspace/content/YYYY-MM-DD/<slug>/`

**Phase 1 (ElevenLabs):** voiceover.mp3 — <D1>s
**Phase 2 (HeyGen):** source.mp4 — avatar `<id>`, <D2>s portrait
**Phase 3 (HyperFrames):** <N> scenes via LLM fanout, 6 SFX, <K> cream-paper b-roll PNGs

**Studio:** http://localhost:3002

Mở browser scrub timeline. Reply **`render`** → mình chạy `npx hyperframes render` xuất MP4 1920×1080 30fps.
```

**Stop.** User confirm rồi mới render.

```bash
npx hyperframes render workspace/content/YYYY-MM-DD/<slug>/index.html \
  -o workspace/content/YYYY-MM-DD/<slug>/out.mp4 \
  --width 1920 --height 1080 --fps 30
```

## Visual language (the unique selling point)

Skill này có 1 cái khác biệt so với mọi short-video pipeline khác — **slide design ngôn ngữ riêng**, không dùng Tailwind/Lucide như landing skill, mà hand-CSS scoped per composition (LLM sub-agent author từ `references/composition-patterns.md` snippets).

Đọc `references/slide-design-tokens.md` cho palette + typography. Tóm tắt:
- BG: `#000` slide pane (pure black), `#0a0e18` avatar frame inner
- Modern AI palette: `--violet:#a78bfa` `--cyan:#67e8f9` `--pink:#f0abfc` `--lime:#a3e635` `--orange:#fb923c` `--rose:#fb7185`
- Brand orange (Claude editorial): `#d97757` (avatar frame border default)
- Map mỗi accent → scene archetype (Hook=cyan/lime hoặc rose/lime, Fail=orange/rose, Pivot=violet, Diff=cyan/lime, Result=lime, CTA=pink hoặc claude-orange)
- Typography: Inter (400–900) body/title, JetBrains Mono (400–700) code/eyebrow, Instrument Serif italic decorative
- Eyebrow chip: JetBrains Mono 16px / 700 / 0.22em / UPPERCASE + dot 8px brand-color với 12px glow
- Title spec: Inter 800, 68–110px, line-height 0.96, letter-spacing -0.035em. Wrap keyword bằng `.grad-<accent>` cho gradient highlight
- Glass card spec: `background: rgba(15,20,30,0.55); border: 1.5px solid rgba(<accent>,0.30); border-radius: 18-22px; backdrop-filter: blur(14-20px); box-shadow: 0 0 28-36px rgba(<accent>,0.10), inset 0 1px 0 rgba(255,255,255,0.04);`
- Tier-letter spec: `font-weight: 900; font-size: 56-140px; letter-spacing: -0.04em; text-shadow: 0 0 28px <accent>, 0 0 12px <accent>;`

Cream-paper editorial infographic (root broll layer) dùng cùng design language Claude AI marketing — palette `#F0EEE6` background, dark slate text, hand-drawn line art. Đọc `references/infographic-prompt-template.md`.

## PIP mechanics

Đọc `references/architecture.md` cho code-level deep dive. Tóm tắt:

- **SPLIT default state**: avatar 540×880 floating right at `(1290, 100)` với claude-orange `#d97757` border (3px solid + 6px halo + 80px outer glow), slide-mount 1200 wide.
- **PIP state**: avatar 320×420 bottom-right at `(1540, 600)` với violet `#a78bfa` border (3px solid + 6px halo + 60px glow), slide-mount expand 1920 (cream-paper b-roll image fades in full stage).
- **GSAP helpers**: `goPIP(t)` / `goSplit(t)` với `overwrite: 'auto'`.
- **Breathing**: hybrid hook strategy — Hook scene slow ramp 1.0→1.10, Body 1.06 punch beats at PIP-IN, CTA gentle 1.0→1.04.
- **PIP trigger rule**: chỉ trigger ở **emphasis beats** (default = mỗi tier-letter reveal moment). 1-2 PIP per scene là sweet spot. 7 scenes × 1.5 average = ~10 PIP events là max trước khi feel busy.
- **PIP hold duration**: 2.5–4s là sweet spot.

## Cream-paper b-roll integration (root layer)

`<img>` mount ở ROOT `index.html`, KHÔNG trong composition:

```html
<!-- In index.html, at root level (z-index 25, between slide-mount z-20 and avatar-frame z-30) -->
<img class="broll-image" id="broll-1" src="1.png" alt="scene-1 b-roll"
     data-scene-num="1" data-scene-start="0.00" data-scene-end="22.62">
<img class="broll-image" id="broll-2" src="2.png" alt="scene-2 b-roll"
     data-scene-num="2" data-scene-start="22.62" data-scene-end="41.04">
... (1 per scene)

<style>
.broll-image {
  position: absolute; top: 0; left: 0;
  width: 1920px; height: 1080px;
  object-fit: contain; object-position: center;
  opacity: 0;  /* default hidden */
  z-index: 25;
  pointer-events: none;
  background: #F0EEE6;  /* cream letterbox */
}
</style>

<script>
// GSAP fade in/out at PIP windows
PIP_EVENTS.forEach(e => {
  const n = sceneOf(e.in);
  tl.to(`#broll-${n}`, { opacity: 1, duration: 0.35 }, e.in);
  tl.to(`#broll-${n}`, { opacity: 0, duration: 0.35 }, e.out);
});
</script>
```

Khi file tồn tại → fade in full stage trong PIP. Khi missing → opacity 0 (no flicker, no broken-image icon).

`prompts.md` format y hệt landing skill (xem `references/infographic-prompt-template.md`).

Aspect default `16:9` (AI33 không hỗ trợ 16:10).

## Pacing & PIP cadence guidance

| Scene archetype | Recommended variant | PIP trigger | Cream-paper metaphor (root broll) |
|---|---|---|---|
| **Hook** (0–14s) | `tier-row-before-after` | Khi tier-letter reveal scale-up | Scroll-tape wasted, hourglass before-after, contrast scene |
| **Problem / Fail** (14–28s) | `chats-stack` (broken-chain stamp) | Khi broken-chain stamp shake | 4-bubble fail thread vs 1-bubble fix |
| **Tip / Mechanism** (per tip ~18–28s) | `chats-stack` / `counter-row` / `hero-orb-spec-trio` / `tier-row` / `stats-3card` (pick per metaphor) | Tại tier-letter reveal | Scene-specific (vault+spokes, vehicle tiers, two-clock, gift-box…) |
| **Result / Recap** (48–54s) | `counter-row` | Khi counter `to` value scale-in | Strike-line counter, before-after savings |
| **CTA** (54–60s) | `comment-terminal` | Khi terminal "claude" type-in xong | Gift-box open + 2 cards FREE |

**N scene total:**
- 3 scenes ~30–40s (rapid-fire)
- 5 scenes ~60s (sweet spot)
- 7 scenes ~90–150s (listicle 5 tip + hook + CTA — phải giảm motion density)
- 10 scenes ~150–250s (deep-dive tutorial — strict pacing)

## Output checklist before render

- [ ] `npx hyperframes lint` — 0 errors (warnings OK)
- [ ] `voiceover.mp3` duration ≥ tổng `data-duration` của scenes
- [ ] Mỗi `slide-mount` có `data-start` + `data-duration`
- [ ] `source.mp4` portrait 720×1280 (KHÔNG 1280×720)
- [ ] 6 SFX file paths tồn tại trong `sfx/`
- [ ] `prompts.md` tồn tại nếu có infographic slot
- [ ] `index.html` slide-mount **KHÔNG có `!important`** trên `width`
- [ ] PIP_EVENTS không overlap (mỗi block in/out tách rời ≥ 0.3s)
- [ ] `compositions/scene-1.html` … `compositions/scene-N.html` đều có `[data-composition-id="scene-{N}"]` + `window.__timelines["scene-{N}"]` register
- [ ] **Compositions KHÔNG embed `image-slot`** — cream-paper image chỉ ở root broll layer
- [ ] Avatar frame border = claude-orange (KHÔNG white)
- [ ] Brand mark ở top-left, không che slide content
- [ ] Avatar `object-position: center 25%` — face không bị crop trán

## Common pitfalls

| Pitfall | Fix |
|---|---|
| Sub-agent embed `<div class="image-slot">` trong composition | KHÔNG. Image lives at ROOT level only (`<img id="broll-N">` in index.html). Composition là DATA layer. Sub-agent prompt phải nói rõ "do NOT embed image-slot". |
| Gọi `generate_compositions.py` (Python Jinja2) | DEPRECATED. Always use parallel LLM sub-agent fanout (Phase 3d). Python generator collapses to 5 archetypes → boring + listicle filename collision. |
| Listicle 6+ scene gây fs-lesson-1 collision | Phase 3d's LLM fanout writes `scene-{num}.html` per scene — no collision. `generate_root_index.py` mounts scene-{num}.html for ALL scenes regardless of kind. |
| `!important` trên `slide-mount > [data-composition-id]` width | Xoá `!important`, để `width: 100%` thường — GSAP cần animate parent `.slide-mount` width. |
| HeyGen render 1280×720 landscape | Vẫn render 720×1280 portrait — landscape avatar frame crop từ portrait source. |
| Avatar face bị crop trán | `object-position: center 25%` (default), tweak 20%–30% nếu HeyGen avatar khác height. |
| White avatar frame border | Default phải là claude-orange `#d97757` (3px solid + 6px halo + 80px outer glow) — không phải `rgba(255,255,255,0.08)`. |
| PIP cyan glow conflict với split-mode glow | Add `overwrite: 'auto'` vào mọi tween chỉnh `boxShadow` của `#avatar-frame`. |
| Tailwind / Lucide icons trong composition HTML | KHÔNG dùng — composition HyperFrames hand-CSS scoped per `[data-composition-id]`. Tailwind/Lucide chỉ dùng trong landing skill. |
| Emoji icons trong tier-row item | OK ở compositions video (vẫn render đúng trong Chromium HF). |
| `data-duration` thiếu → lint fail | Mọi `<video>`, `<audio>`, `<div class="clip slide-mount">`, `<div class="clip brand-mark">` phải có `data-duration`. |
| `window.__timelines` register sai key | Phải khớp `data-composition-id` của root div trong template — `window.__timelines["scene-N"]` cho `data-composition-id="scene-N"`. |
| PIP_EVENTS overlap | Tách ≥ 0.3s giữa 1 `out` event và `in` event tiếp theo. |
| Planner default metaphor "robot-orb-with-tasks" cho mọi scene | Generic — orchestrator phải hand-edit `visual-plan.json` per scene để fill metaphor scene-specific (scroll-tape-wasted, edit-regenerate-loop, projects-vault-shared-knowledge, right-tool-vehicles, pacific-vs-vietnam-timezone…) trước khi spawn sub-agents. |
| AI33 `temporary_model_error` khi gen PNG | Retry sau 1-2 phút, hoặc fallback `-p nano` (GEMINI_API_KEY). 7 PNG parallel via ThreadPoolExecutor. Real key thường ở `~/Documents/GitHub/hoang-ai-marketing/.env`. |
| HeyGen MCP báo "tool not found" cho `upload_asset` / `generate_avatar_video` / `get_avatar_video_status` | Old MCP names — đã bỏ. Dùng `scripts/upload_asset.py` (REST) cho upload, `mcp__heygen__create_video_from_avatar` để gen, `mcp__heygen__get_video` để poll. Xem `heygen-mp3-to-mp4` SKILL đã update. |
| HeyGen MCP chỉ expose `authenticate` / `complete_authentication` | Chưa OAuth. Gọi `mcp__heygen__authenticate` → paste URL cho user → user authorize → callback URL paste lại → `mcp__heygen__complete_authentication`. Sau đó video tools mới load. |
| `HEYGEN_AVATAR_LOOKS=avatar_look_id_1,avatar_look_id_2` (placeholder) | `.env.local` ship với stub. Real values ở `~/Documents/GitHub/hoang-ai-marketing/.env`. Helper `upload_asset.py` auto-fallback; nếu pick avatar tay, cần grep marketing repo trước. |
| `plan_visuals.py` báo `Neither transcript-cleaned.json nor transcript.json found` | Whisper output là `voiceover_segments.json` (nested). Phải flatten thành `transcript.json` (flat `[{word,start,end}]`) — xem Phase 3a code snippet. |
| `extract.py` không tồn tại trong `mkt-ai-video-extract-srt-segment/scripts/` | Skill này chỉ có `SKILL.md`, nó delegate sang `heygen-short-video/scripts/transcribe_mp3.py`. Gọi path đó trực tiếp. |
| zsh polling loop crash với `read-only variable: status` | `$status` là read-only trong zsh. Dùng tên khác: `vstate`, `phase`, `ready`. |
| `cd workspace/...` rồi command sau báo "no such file or directory" | `cd` trong Bash tool persist cwd qua các call sau. Dùng absolute path hoặc đặt `cd` + command trong cùng 1 Bash call (chained `&&`). |
| References path mismatch (`references/elevenlabs-audio-tags.md` thiếu) | Skill viết theo aspirational structure; 1 số reference doc chưa tạo. Inline summary trong SKILL đã đủ; verify path tồn tại trước khi `Read`, đừng giả định. |

## What this skill does NOT do

- KHÔNG viết script — dùng `mkt-create-script-storytelling-video` / `mkt-create-script-short-video` trước
- KHÔNG handle script > 5000 chars
- KHÔNG chunk MP3 — single-clip ≤ 300s
- KHÔNG auto-render MP4 cuối — user gate ở Studio
- KHÔNG tự gen infographic ảnh trừ khi user chọn `infographic mode = now`
- KHÔNG dùng Tailwind/Lucide trong compositions (hand-CSS only)
- **KHÔNG dùng `generate_compositions.py`** (Python Jinja2 generator deprecated)
- **KHÔNG embed image-slot trong composition** (image ở root broll layer only)
- KHÔNG override hard constraint của sub-skill (avatar allowlist từ `HEYGEN_AVATAR_LOOKS`, locked ElevenLabs brand voice ID, no-chunking single-clip ≤300s)

## References

- `references/elevenlabs-audio-tags.md` — Phase 1a tag enrichment guide (voice compatibility, scene→tag mapping, anti-patterns)
- `references/architecture.md` — root composition + slide-mount + avatar-frame + GSAP timeline patterns (SPLIT↔PIP / breathing / punch-in / PIP scheduling)
- `references/slide-design-tokens.md` — palette + typography + glass card + tier-letter + eyebrow chip spec
- `references/composition-patterns.md` — 8 reusable section archetypes for landscape 1200×1080 (ready-to-paste HTML+CSS+GSAP snippets — sub-agent reference này)
- `references/infographic-prompt-template.md` — cream-paper editorial style mapped to 7 video beat archetypes
- `references/troubleshooting.md` — common Phase 3 issues
- `references/render-checklist.md` — pre-render verification

Sub-skills:
- `mkt-elevenlabs-tts-to-mp3` — Phase 1 (script-tagged.txt → voiceover.mp3 via `text_to_mp3.py`)
- `heygen-mp3-to-mp4` — Phase 2 (REST `upload_asset.py` → MCP `create_video_from_avatar` → MCP `get_video` → REST `download_video.py`; render 720×1280 portrait via aspectRatio=`9:16` + resolution=`720p`)
- Whisper transcribe — Phase 3a uses `heygen-short-video/scripts/transcribe_mp3.py` directly (the `mkt-ai-video-extract-srt-segment` skill is a doc-only wrapper that delegates here)
- `mkt-plan-short-video-edit-16-9` — Phase 3b `plan_visuals.py` + `render_infographic_prompts.py` + `apply_plan_to_scenes.py` (planner needs flat `transcript.json`, not nested `voiceover_segments.json`)
- `mkt-hyperframe-talking-head-video-16-9` — Phase 3e `scaffold_project.py` + `generate_captions.py` (Jinja template `assets/templates/captions.html.j2` injected with `captions.json` or Whisper segments) + `generate_root_index.py` (auto-mounts captions when `compositions/captions.html` exists; disable with `--no-captions`). NOT `generate_compositions.py` — Python Jinja2 scene templater is deprecated; LLM sub-agent fanout owns Phase 3d composition authoring
- `image-post-creator` — Phase 3.5 PNG gen (AI33 / Nano Banana Pro)

Reference production projects (canonical 16:9 architectures):
- `/Users/tonyhoang/Documents/GitHub/claudeclaw-os/workspace/content/2026-05-09/5-meo-tiet-kiem-claude-token/` — listicle 7-scene, LLM fanout, scene-{num}.html naming, claude-orange border
- `/Users/tonyhoang/Documents/GitHub/claudeclaw-os/workspace/content/2026-05-08/loi-ich-claude-ai/` — original 5-scene production project
