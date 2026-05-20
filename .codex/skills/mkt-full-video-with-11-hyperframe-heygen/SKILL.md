---
name: mkt-full-video-with-11-hyperframe-heygen
description: End-to-end short-video pipeline — script (Việt/Anh) ra MP4 TikTok/Reels 9:16. Orchestrator 3 phase ghép skill có sẵn — (1) TTS via `mkt-elevenlabs-tts-to-mp3` (default, voice Hoàng) hoặc `mkt-video-script-to-mp3` (MiniMax), (2) checkpoint user duyệt MP3, (3) **PARALLEL** — HeyGen lip-sync background agent + Phase 3 packager foreground agent (transcribe voiceover.mp3 + identify emphasis + checkpoint #2 + fan-out N text-overlay writers + scaffold + wait for source.mp4 + preview Studio). Wall-clock ~5 min thay vì ~8 vì transcribe + outline + user review overlap với HeyGen render 3-10 min. Aesthetic là **broker-creator punchy** — avatar full-frame + 12-20 text overlay punch (white/red/yellow stroke đen) + 3-type zoom palette (soft2step/quickpop/doublepop, peaks 1.05-1.10) + b-roll full-screen sparse + 14-file BĐS SFX library. **BĐS mode** — pass `project_folder` để auto-resolve b-roll. USE WHEN user nói "tạo full video từ script", "script to tiktok video", "pipeline full video heygen + hyperframe", "video bđs dự án X", "kịch bản ra video tiktok", "chạy video bất động sản", hoặc có sẵn 1 script + (optional) ảnh b-roll và muốn ra MP4 9:16 đóng gói.
---

# mkt-full-video-with-11-hyperframe-heygen

End-to-end orchestrator: **script → final TikTok/Reels MP4 9:16**.

3 phase, 2 user checkpoints:
1. **MP3 checkpoint** (orchestrator) — user duyệt voiceover sau Phase 1
2. **Overlays-outline checkpoint** (Phase 3 sub-agent) — user duyệt danh sách text overlay + timestamps trước khi fan-out writers. Skip nếu `auto_overlays=true`.

## Khi nào dùng

- Script Việt/Anh ≤ 5000 ký tự muốn ra video TikTok hoàn chỉnh
- Có sẵn (optional) ảnh b-roll kèm mục đích
- Muốn đi 1 mạch từ kịch bản tới preview Studio

**Không dùng nếu:**
- Đã có MP3 → dùng thẳng `heygen-mp3-to-mp4`
- Đã có MP4 talking-head → dùng thẳng `mkt-hyperframe-talking-head-video`
- HeyGen tự đọc text (không qua TTS provider) → `heygen-script-to-mp4`
- Script > 5000 ký tự → split semantic rồi gọi từng segment

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
   └─ Phase 3 (FOREGROUND) ── mkt-full-video-phase3-packager
              │  audio_source = voiceover.mp3 (audio ≡ source.mp4)
              │  source_mp4_pending = true
              │
              ├─ transcribe voiceover.mp3 + clean + group captions
              ├─ identify emphasis words (brand, prices, urgency, CTA)
              ├─ CHECKPOINT #2 — user duyệt overlays outline
              ├─ FAN-OUT N text-overlay writers parallel (1 per emphasis)
              ├─ scaffold overlay-*.html + optional broll-*.html + captions
              ├─ wire root index.html (avatar full-frame + zoom hooks + SFX)
              ├─ WAIT for source.mp4 (joins HeyGen background)
              └─ lint + preview Studio
   │
   ▼
User duyệt preview → `render` → final MP4
```
Wall-clock savings: HeyGen render (~3-10 min) overlaps với transcribe + outline + user checkpoint review (~1-3 min). Tổng pipeline ~5 min thay vì ~8.

## Inputs

| Param | Required | Format |
|---|---|---|
| Script text | Yes | File path `.txt`/`.md` hoặc inline. ≤ 5000 ký tự |
| Slug | No | Auto-derive 5 từ đầu script. Lowercase ASCII dash |
| B-roll list | No | `[{path, purpose}]` (filenames phải ASCII — no dấu Việt!) |
| `tts_provider` | No | `elevenlabs` (default) hoặc `minimax`. User nói "dùng minimax" → set |
| `voice_id` override | No | CLI `--voice_id <id>`. Default từ `.env` |
| `header_label` | No | Pill text trên top, vd `"VINHOMES CAO XÀ LÁ"` |
| `footer_handle` | No | Brand mark text dưới, vd `"@linh.aloha"` |
| `auto_overlays` | No | Skip checkpoint #2. Default `false` |
| `project_folder` | No | **BĐS mode trigger.** Path tới folder asset BĐS |
| `brand_palette` | No | JSON override `{ "accent": "#d97757", ... }` per brand |

**BĐS mode** (khi `project_folder` set): b-roll resolve relative tới folder + **SFX library 14 file** (auto-copy từ `workspace/assets/01_Sound Bat dong san/` → `<workspace>/sfx/` với ASCII filename rename). Xem [SFX library — BĐS broker-creator](#sfx-library--bđs-broker-creator-14-file) bên dưới.

## Workspace layout

```
workspace/content/YYYY-MM-DD/<slug>/
├── script.txt
├── voiceover.mp3                  # Phase 1
├── source.mp4                     # Phase 2
├── broll/                         # ASCII filenames!
├── transcript-cleaned.json        # Phase 3
├── caption-groups.json
├── overlays-outline.json          # pre-checkpoint
├── overlays/                      # fan-out per-overlay JSON
├── overlays.json                  # merged
├── compositions/
│   ├── overlay-01..N.html         # text overlay punches
│   ├── broll-01..M.html           # optional full-screen b-roll
│   └── captions.html
├── sfx/                           # 14 file ASCII-rename từ assets/01_Sound Bat dong san/
├── renders/
└── index.html                     # avatar full-frame + zoom hooks + SFX + N mounts
```

## Workflow

### Step 0 — Setup

1. Validate `len(script) ≤ 5000`. Vượt → stop, yêu cầu split.
2. Derive slug (5 từ đầu → lowercase ASCII dash) nếu thiếu.
3. **BĐS mode detect**: nếu user pass `project_folder` HOẶC nhắc "video bđs", "dự án X", brand name BĐS phổ biến (Vinhomes/Masterise/Sun/Lumière) → b-roll resolve tới `project_folder`. Validate folder + b-roll files tồn tại với ASCII filenames.
4. **TTS provider**: default `elevenlabs`. Validate api key trong `.env`.
5. Tạo `workspace/content/YYYY-MM-DD/<slug>/`. Save `script.txt`.
6. **Fire 2 copy ops song song** (1 message, 2 Bash calls `run_in_background:true`):
   - Copy b-roll → `broll/` (ASCII rename).
   - Copy 14-file SFX library → `<workspace>/sfx/` (ASCII rename theo bảng [SFX library](#sfx-library--bđs-broker-creator-14-file)) từ `workspace/assets/01_Sound Bat dong san/`.
7. Báo user: workspace path, provider, b-roll count, **SFX count + tên file đã rename**.

### Step 1 — Phase 1: Script → MP3

```bash
# ElevenLabs (default)
uv run .claude/skills/mkt-elevenlabs-tts-to-mp3/scripts/text_to_mp3.py \
  --file workspace/content/YYYY-MM-DD/<slug>/script.txt \
  -o workspace/content/YYYY-MM-DD/<slug>/voiceover.mp3

# MiniMax (alternative)
uv run .claude/skills/mkt-video-script-to-mp3/scripts/text_to_mp3.py \
  --file <script-path> -o <out.mp3>
```

Filename **inviolable**: `voiceover.mp3`. Check duration ≤ 300s (HeyGen cap).

### Step 2 — CHECKPOINT #1: user nghe MP3

Báo user format:
```markdown
## Voiceover ready
**File:** workspace/content/YYYY-MM-DD/<slug>/voiceover.mp3
**Duration:** <X>s · **Size:** <Y>MB · **Provider:** <elevenlabs|minimax>

Reply:
- `OK` / `tiếp` → chạy Phase 2
- `regen` + lý do → tweak voice settings và regen
- `sửa script` + nội dung → save script mới rerun Phase 1
```

**Stop. Đợi user.**

### Step 3 — Phase 2 + Phase 3 PARALLEL (1 message, 2 concurrent agents)

Sau CHECKPOINT #1 OK, fire **2 agents trong 1 message** để overlap HeyGen render (3-10 min) với transcribe + outline + checkpoint #2 (~30-90s + user review time). Tiết kiệm 1-3 min wall-clock vì audio của `source.mp4` ≡ `voiceover.mp3` (HeyGen chỉ lip-sync, không đổi audio) → transcribe có thể chạy trên `voiceover.mp3` ngay, không cần đợi HeyGen.

**Agent A — HeyGen runner (`run_in_background: true`)**

```
subagent_type: general-purpose
run_in_background: true
prompt: |
  Invoke skill `heygen-mp3-to-mp4` với:
  - mp3: workspace/content/YYYY-MM-DD/<slug>/voiceover.mp3
  - output: workspace/content/YYYY-MM-DD/<slug>/source.mp4

  Theo skill: pick avatar từ HEYGEN_AVATAR_LOOKS, upload MP3 via HeyGen MCP,
  generate lip-sync 9:16 720×1280, poll ≤ 10 min, download to source.mp4.
  Filename `source.mp4` inviolable. Return khi file tồn tại trên disk.
```

**Agent B — Phase 3 packager (foreground)**

```
subagent_type: mkt-full-video-phase3-packager
prompt: |
  Workspace: workspace/content/YYYY-MM-DD/<slug>/
  Slug: <slug>
  Script: <full text>
  B-roll: [{path: "...", purpose: "..."}, ...]
  auto_overlays: false
  header_label: "<eg VINHOMES CAO XÀ LÁ>"
  footer_handle: "<eg @linh.aloha>"
  brand_palette: null
  audio_source: voiceover.mp3  # transcribe THIS (HeyGen chưa xong source.mp4)
  source_mp4_pending: true     # Đợi source.mp4 trước preview ở Step 9

  Run Phase 3 packaging per your agent definition. Sub-skill
  `mkt-hyperframe-luxury-realestate-9-16/SKILL.md` là source of truth cho
  visual / animation / SFX / overflow guard / gotchas.

  Return Studio URL.
```

Phase 3 sub-agent: transcribe + outline + checkpoint #2 + fan-out N writers parallel + scaffold concurrent với HeyGen render. Trước `npx hyperframes preview` (Step 9), sub-agent waits `source.mp4` xuất hiện (`until [ -f source.mp4 ]; do sleep 10; done`).

Orchestrator chỉ relay user replies tới Phase 3 sub-agent (foreground) khi đang active. HeyGen agent chạy autonomous trong background, returns notification khi xong. Nếu HeyGen fail (credit hết / MCP disconnect), Phase 3 sẽ stall ở Step 10 wait — kill HeyGen agent + re-run thủ công.

### Step 4 — Hand off

```markdown
## Pipeline DONE — preview ready
**Workspace:** workspace/content/YYYY-MM-DD/<slug>/
**Phase 1 (<provider>):** voiceover.mp3 — <D>s, <S>MB
**Phase 2 (HeyGen):** source.mp4 — avatar <id>, <D>s, <S>MB
**Phase 3:** <N> text overlay punches, <M> b-roll inserts, <K> caption groups, <S>/6 SFX cues fired, <Z> zoom hooks
**Studio:** http://localhost:3002

Mở browser scrub timeline. Nói `render` khi OK → MP4 1080×1920 30fps.
```

**Stop.** Không auto-render.

## Critical orchestration rules

1. **2 checkpoints, 1 orchestrator gate** — Orchestrator stop ở MP3 only. Overlays-outline checkpoint do Phase 3 quản. Render gate ở Studio do user.
2. **Path conventions inviolable** — `voiceover.mp3`, `source.mp4`. HF expect đúng tên.
3. **HeyGen MCP only** — không curl `https://api.heygen.com/`.
4. **Voice ID trong `.env`, không hard-code.** Override per-call qua `--voice_id`.
5. **Script length hard cap 5000** — fail fast Step 0.
6. **MP3 duration ≤ 300s** — HeyGen single-video cap.
7. **Preview-first** — Phase 3 KHÔNG auto-render. User gate ở Studio.
8. **Phase 3 isolation** — sub-agent context riêng, parent skill body + references load vào sub-agent.
8b. **Phase 2 + 3 parallel kickoff** — Sau CHECKPOINT #1, fire HeyGen background agent + Phase 3 foreground agent trong 1 message. Phase 3 transcribe trên `voiceover.mp3` (audio identical to source.mp4) và wait source.mp4 trước preview Step 9.
9. **BĐS mode** — `project_folder` set → b-roll resolve tới folder. Không cho override trừ khi explicit.
10. **Avatar full-frame always** — Avatar object-fit:cover, z-index 1, full 1080×1920 canvas. KHÔNG split-screen, KHÔNG PIP. Text overlay punch trên avatar.

## Visual style — broker_creator

| Tiêu chí | Spec |
|---|---|
| Avatar layout | FULL FRAME 1080×1920 (object-fit cover, z-index 1, NO split-screen, NO PIP) |
| Visual driver | 12-20 text overlay punches |
| Text style | Be Vietnam Pro 900 + thick black stroke |
| Color palette | White + Red + Yellow + Black stroke |
| Animation | back.out(2.0) 0.35s scale-pop |
| B-roll | Full-screen insert sparse 1-3x |
| SFX kit | **14 files BĐS** — impact (collapse/ground-crack/giant-foot) + build (build-up/count) + text-pop (pop/ui-tap/camera-shutter) + transition (film-burn/glitch) + tech (cyber-1/cyber-2/digital-device/scifi-monitor) |
| Zoom palette | 3 types (soft2step/quickpop/doublepop), peaks 1.05-1.10 |
| Captions | bottom 280 TikTok pill black |
| Sub-skill | `mkt-hyperframe-luxury-realestate-9-16` |

## SFX library — BĐS broker-creator (14 file)

Source: `workspace/assets/01_Sound Bat dong san/` (folder gốc có dấu Việt + space). Step 0 auto-copy 14 file vào `<workspace>/sfx/` với ASCII rename theo bảng dưới. HyperFrames refs phải dùng tên đã rename (ASCII, no-space, lowercase).

### Mapping rename

| Source filename | Renamed (ASCII) | Bytes |
|---|---|---|
| `12120 collapsing building.wav` | `collapse.wav` | 1.57 MB |
| `Build Up.WAV` | `build-up.wav` | 860 KB |
| `Camera Shutter.WAV` | `camera-shutter.wav` | 156 KB |
| `Cyber 11-1.WAV` | `cyber-1.wav` | 356 KB |
| `Cyber 13-3.WAV` | `cyber-2.wav` | 504 KB |
| `Digital device.WAV` | `digital-device.wav` | 188 KB |
| `Film Burn.WAV` | `film-burn.wav` | 119 KB |
| `Glitch Sound.WAV` | `glitch.wav` | 115 KB |
| `Ground Crack.WAV` | `ground-crack.wav` | 877 KB |
| `Pop.WAV` | `pop.wav` | 115 KB |
| `Sci-fi Monitor.WAV` | `scifi-monitor.wav` | 180 KB |
| `Sound foot giant.m4a` | `giant-foot.m4a` | 1.77 MB |
| `UI sound.WAV` | `ui-tap.wav` | 131 KB |
| `Unobtrusive count.WAV` | `count.wav` | 451 KB |

### When-to-use cheat-sheet

| Group | File | Trigger moment trong script | Cap (max/video) |
|---|---|---|---|
| **Impact** | `collapse.wav` | Phá vỡ định kiến / "quên định nghĩa cũ" / reveal twist (KHÔNG nghĩa đen "nhà sập") | 1 |
| **Impact** | `ground-crack.wav` | Pain agitation cực mạnh: giá tăng / hết quỹ căn / đối thủ chốt mất | 1 |
| **Impact** | `giant-foot.m4a` | Authority entrance — reveal chủ đầu tư (Masterise, Vingroup, Sun) bước vào | 1 |
| **Build** | `build-up.wav` | 2-4s trước reveal lớn (giá, view, mặt bằng). LUÔN pair với impact phía sau | 2 |
| **Count** | `count.wav` | Đếm: "1, 2, 3 lý do" / "120→125→130tr/m²". Vol ngầm, không lấn voiceover | 2 |
| **Text-pop** | `pop.wav` | Text overlay nhỏ: tên phân khu, diện tích, số PN, bullet tiện ích | 6 |
| **UI** | `ui-tap.wav` | Tap highlight mặt bằng / khoanh tiện ích / icon brand | 4 |
| **UI** | `camera-shutter.wav` | Chuyển ảnh render → ảnh thực; cú "chụp" reveal view | 2 |
| **Transition** | `film-burn.wav` | Cut scene cinematic: drone → mặt bằng → căn hộ mẫu | 2 |
| **Transition** | `glitch.wav` | Before/after: Cao Xà Lá xưa vs Vinhomes mới; quy hoạch then-now | 2 |
| **Tech** | `cyber-1.wav` | Reveal số liệu ROI / % tăng giá / yield cho thuê (vol ≤ 30%) | 2 |
| **Tech** | `cyber-2.wav` | Variant nhẹ hơn cyber-1, hiển thị bảng so sánh giá | 2 |
| **Tech** | `digital-device.wav` | Notification FOMO: "khách book cọc" / "căn vừa bị giữ" | 2 |
| **Tech** | `scifi-monitor.wav` | Reveal dashboard / biểu đồ tăng giá khu vực 5Y | 1 |

### Combo rules (apply trong overlays-outline checkpoint)

- **Total budget**: max 6 SFX firings/video (60s). Quá noise → viewer scroll.
- **Build → Reveal chain**: `build-up.wav` (3s tail) bắt buộc kết thúc bằng 1 impact SFX (`ground-crack` / `collapse` / `giant-foot` / `camera-shutter`). Không cho build-up nối text-pop nhẹ.
- **No-double impact**: chỉ chọn 1 trong 3 impact files mỗi video. Không xếp chồng 2 impact gần nhau (< 4s).
- **Text-pop pairing**: mỗi overlay punch-white/punch-red có thể pair `pop.wav` HOẶC `ui-tap.wav` — không cả hai.
- **Tech cluster persona-gated**: `cyber-*` + `scifi-monitor` + `digital-device` chỉ dùng cho persona "đầu tư trẻ" / "ROI buyer". Persona "ở thật" giữ vol 0 hoặc bỏ.
- **CTA outro**: nếu video chốt bằng CTA "BLOOM gửi inbox" / "comment 1" — có thể dùng `digital-device.wav` 1x làm chime notification.

## Failure modes

| Symptom | Hành động |
|---|---|
| Script > 5000 | Stop, yêu cầu split semantic |
| TTS API fail | Check `<PROVIDER>_API_KEY` trong `.env`, hoặc swap provider |
| MP3 > 300s | Stop, suggest chunking |
| HeyGen MCP not connected | `claude mcp list` verify |
| HeyGen render fail | Check credits qua `mcp__heygen__get_current_user` |
| HeyGen background agent timeout (Phase 3 stall ở Step 9 wait > 15 min) | Kill HeyGen agent. Check credits / MCP. Re-spawn HeyGen agent thủ công với cùng `voiceover.mp3` → khi source.mp4 land, Phase 3 sẽ tiếp tục |
| Phase 3 sub-agent fail | Re-run Phase 3 standalone bằng sub-skill |
| `project_folder` không tồn tại | Stop, in path + `ls workspace/data/` |
| B-roll filename Vietnamese | Stop, rename ASCII trước khi tiếp |
| SFX folder `workspace/assets/01_Sound Bat dong san/` thiếu | Stop, in path. User cần restore folder hoặc giảm SFX cues về 4 file legacy |
| SFX file 404 ở render | Filename còn space/uppercase WAV → rename theo bảng ASCII trong [SFX library](#sfx-library--bđs-broker-creator-14-file) |
| Text overlay tràn 2 cạnh canvas (vd "HỢP LÝ HƠN!" cụt) | Thiếu `max-width: 960px` + `fitText()` trong overlay-XX.html. Sub-skill template đã có guard; nếu sub-agent skip, mở overlay-XX.html sửa: thêm `max-width: 960px`, `word-break: keep-all`, gọi `fitText(el, 960, 200, 70, 4)` trong `document.fonts.ready.then(run)` BEFORE GSAP timeline |
| Render output đen top-half | Check CSS selector (phải `[data-composition-id="..."]`, không `#id`) |

## Example — BĐS mode

User:
> Chạy video BĐS Vinhomes Cao Xà Lá. Project: `workspace/data/cao-xa-la/`. Script: "Cao Xà Lá — tên ai cũng biết, tuần sau gọi khác… Bình luận BLOOM em gửi inbox."
> B-roll (ASCII): facade.jpg, architecture.jpg, main-entrance.jpg, overview.jpg

Pipeline:
1. **Step 0** — detect BĐS mode. Set `aesthetic=broker_creator`. Validate folder + 4 b-roll ASCII filenames. Slug `cao-xa-la-bloom`. Báo user OK.
2. **Step 1** — ElevenLabs (voice Hoàng) → `voiceover.mp3` ~60s.
3. **Step 2 — CHECKPOINT #1** — user `OK`.
4. **Step 3 PARALLEL** — Trong 1 message fire 2 agents:
   - HeyGen runner (background) bắt đầu lip-sync `voiceover.mp3` → `source.mp4` (~3-10 min)
   - Phase 3 packager (foreground) transcribe `voiceover.mp3`, identify ~15 emphasis words (Cao Xà Lá, tên khác, 3 nhà máy, đất vàng, Masterise, 10 tòa, 120 TR/M², Royal City, Matrix One, hợp lý hơn, 1 tuần, giá tốt nhất, bảng giá, BLOOM…), checkpoint #2 outline → user `OK` → fan-out 15 overlay writers + 3 b-roll inserts (architecture/facade/main-entrance) → scaffold → lint
   - Phase 3 wait `source.mp4` xuất hiện (thường lúc này HeyGen đã xong vì user mất ~1 min review checkpoint #2) → preview
5. **Step 4** — Studio URL trả về orchestrator. User `render` → final MP4.

Total ~5 phút wall-clock.

## What this skill does NOT do

- KHÔNG viết script (dùng `mkt-create-script-*` trước)
- KHÔNG handle script > 5000 ký tự (split semantic)
- KHÔNG chunk MP3 (single-clip; > 300s → `heygen-short-video`)
- KHÔNG auto-render MP4 (user gate ở Studio)
- KHÔNG handle Phase 3 internals (delegate sub-agent)
- KHÔNG override hard constraints của sub-skills (avatar allowlist, MCP-only, font, etc.)

## References

- **TTS A** — `.claude/skills/mkt-elevenlabs-tts-to-mp3/SKILL.md` (default voice Hoàng)
- **TTS B** — `.claude/skills/mkt-video-script-to-mp3/SKILL.md` (MiniMax)
- **HeyGen** — `.claude/skills/heygen-mp3-to-mp4/SKILL.md`
- **HF broker-creator** — `.claude/skills/mkt-hyperframe-luxury-realestate-9-16/SKILL.md` (visual / animation / SFX / overflow guard / gotchas — source of truth)
- **Phase 3 sub-agent** — `.claude/agents/mkt-full-video-phase3-packager.md`
- **SFX assets BĐS** — `workspace/assets/01_Sound Bat dong san/` (14 file gốc; xem [SFX library](#sfx-library--bđs-broker-creator-14-file) bảng rename + mapping when-to-use)
- **Reference project** — `workspace/content/2026-05-16/cao-xa-la-bloom/` (golden sample broker-creator output)
