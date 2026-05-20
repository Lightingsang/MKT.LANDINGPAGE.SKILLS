---
name: heygen-mp3-to-mp4
description: Convert a single MP3 voiceover file into a single HeyGen avatar lip-sync MP4 video. Single-purpose — no planning, no SRT, no chunking, no Remotion compositing. Hybrid path — REST upload (helper script) + HeyGen MCP for video creation, because the post-2026 MCP no longer exposes an asset-upload tool. Reads avatar look pool (`HEYGEN_AVATAR_LOOKS`) from `.env` and HeyGen API key (`HEYGEN_API_KEY`) for the upload step. USE WHEN user says "tạo video heygen từ mp3", "mp3 to heygen", "heygen mp4 từ audio", "convert mp3 sang heygen video", "tạo avatar video từ file mp3", "lip sync mp3 heygen", "biến mp3 thành video heygen", or any time the user has exactly one MP3 file and wants exactly one HeyGen avatar MP4 out.
---

# HeyGen MP3 → MP4 (Single-Purpose)

Take one MP3 voiceover, return one HeyGen avatar lip-sync MP4. Nothing else.

This skill exists because the existing `heygen-short-video` skill requires a full production plan + SRT + chunked segments — overkill when the user just has a finished voiceover and wants a talking-head video.

## Why hybrid REST + MCP (not MCP-only)

Earlier versions of this skill enforced "MCP only — never call REST." That rule is **no longer feasible** as of the 2026 HeyGen MCP reshape: the MCP server only exposes `create_video_from_avatar`, `get_video`, `create_lipsync`, `list_avatar_looks`, etc. — there is **no asset-upload tool** anymore. To lip-sync from a local MP3 the API still requires either an `audioAssetId` (uploaded asset) or an `audioUrl` (public HTTPS URL). Hosting a public URL is fragile (link rot, leakage), so we use the documented REST upload endpoint via a thin helper, then continue through MCP for video creation, polling, and download.

## Hard constraints

| Constraint | Allowed values |
|---|---|
| Asset upload | REST `POST https://upload.heygen.com/v1/asset` via `scripts/upload_asset.py` (uses `HEYGEN_API_KEY`) |
| Video creation / status / list | **HeyGen MCP only** (`mcp__heygen__create_video_from_avatar`, `mcp__heygen__get_video`) |
| Avatar look ID | One of the IDs in `HEYGEN_AVATAR_LOOKS` env var (comma-separated allowlist) |
| Voice ID (only if MCP path forces TTS) | `HEYGEN_VOICE_ID` from `.env` (no other voice ID is permitted) |
| MP3 duration | ≤ 300 seconds (5 minutes). Fail fast if longer; do **not** auto-split |
| Aspect ratio (MCP enum) | `9:16` default (TikTok / Reels). `16:9` only when parent orchestrator overrides |
| Resolution (MCP enum) | `720p` default (yields 720×1280 for 9:16, 1280×720 for 16:9) |

For MP3 lip-sync the voice type is `audio` and `audioAssetId` is provided — `voiceId` is **not** sent. The voice_id allowlist above only matters if a future MCP signature requires one.

## Inputs

1. **MP3 path** (required) — absolute path to the voiceover file.
2. **Avatar look ID** (optional) — one of the allowed IDs. If omitted, **pick randomly** from the allowed set so visual variety emerges across runs.
3. **Output path** (optional) — defaults to `workspace/heygen-clips/<mp3-stem>/<mp3-stem>_<YYYYMMDD-HHMMSS>.mp4` relative to the project root.
4. **Aspect ratio** (optional) — `9:16` (default) or `16:9`.

## Workflow

Follow these steps in order. Each step has a stop condition; do not proceed past a failed step.

### 0. Auth check (first call only)

The HeyGen MCP server uses OAuth. On a fresh session only `mcp__heygen__authenticate` and `mcp__heygen__complete_authentication` are exposed; the real tools (`create_video_from_avatar`, `get_video`, …) appear **after** auth completes. If the session has none of those tools loaded, call `mcp__heygen__authenticate` and surface the returned authorize URL to the user. They click → browser may show "connection error" on the localhost callback (this is expected) → they paste the full callback URL back, you call `mcp__heygen__complete_authentication`. Once the post-auth tools surface in the deferred-tool list, continue.

### 1. Validate the MP3

```bash
uv run .claude/skills/heygen-mp3-to-mp4/scripts/check_duration.py "<mp3_path>"
```

Prints `OK <seconds>` / `TOO_LONG <seconds>` / `MISSING`. Exit code 0 = OK, non-zero = stop.

If `TOO_LONG`: tell the user the duration and that HeyGen caps a single video at ~5 min, and suggest the existing `heygen-short-video` skill (which chunks). Do not proceed.

### 2. Pick the avatar look

Read `HEYGEN_AVATAR_LOOKS` (comma-separated allowlist):

```bash
HEYGEN_AVATAR_LOOKS=$(
  grep -h '^HEYGEN_AVATAR_LOOKS=' .env.local .env 2>/dev/null \
  | head -1 | cut -d'=' -f2- | tr -d '"' | tr -d "'"
)
echo "$HEYGEN_AVATAR_LOOKS" | tr ',' '\n' | awk 'BEGIN{srand()} {a[NR]=$0} END{print a[int(rand()*NR)+1]}'
```

**Placeholder pitfall** — `claudeclaw-os/.env.local` ships with placeholder stubs (`avatar_look_id_1,avatar_look_id_2`). The real values often live in `~/Documents/GitHub/hoang-ai-marketing/.env`:

```bash
grep '^HEYGEN_AVATAR_LOOKS=' ~/Documents/GitHub/hoang-ai-marketing/.env
```

If the value matches `^(your_|avatar_look_id_|placeholder)`, treat it as missing and fall back to the marketing-repo `.env`. If both are placeholder/missing, stop and ask the user to fill in real IDs.

Tell the user which avatar look you picked before continuing — they may want to override.

### 3. Upload the MP3 as a HeyGen asset (REST)

```bash
uv run .claude/skills/heygen-mp3-to-mp4/scripts/upload_asset.py "<mp3_path>"
# → prints "OK <asset_id>" on success
```

The helper handles the `X-Api-Key` header, picks the right `Content-Type` for the audio extension, and resolves `HEYGEN_API_KEY` in this order: `--key-file` flag → `HEYGEN_API_KEY` env → `.env.local` → `.env` → `~/Documents/GitHub/hoang-ai-marketing/.env`. Placeholder stubs (`your_*`) are skipped automatically.

Capture the asset_id printed on stdout.

### 4. Generate the avatar video (MCP)

Call **`mcp__heygen__create_video_from_avatar`** with the new schema (the old `dimension: {width, height}` shape is gone — the tool now takes `aspectRatio` enum + `resolution` enum):

```yaml
avatarId:       <picked from allowlist>
audioAssetId:   <from step 3>
aspectRatio:    "9:16"    # or "16:9" when parent overrides
resolution:     "720p"    # 720p · 1080p · 4k
title:          "<mp3-stem>-<timestamp>"
```

Capture the returned `video_id` (status will be `waiting` initially).

**Why audio (not text):** lip-sync from an existing MP3 requires HeyGen to consume the audio directly. Sending a `script` + `voiceId` here would switch HeyGen into TTS mode and ignore the uploaded MP3 entirely.

### 5. Poll until completed

Call **`mcp__heygen__get_video`** with the `video_id` every ~10–15 seconds. Statuses:

- `waiting` / `processing` / `pending` → keep polling
- `completed` → grab `video_url` from the response and proceed
- `failed` → stop, surface `failure_message` to the user

Cap the wait at ~10 minutes; if still processing, tell the user and let them decide.

**zsh quirk for poll loops** — the variable name `status` is read-only in zsh. If you write `status=$(…)` in a polling loop the script crashes with `read-only variable: status`. Use a different name (`vstate`, `phase`, `ready`).

### 6. Download the MP4

```bash
uv run .claude/skills/heygen-mp3-to-mp4/scripts/download_video.py "<video_url>" "<output_path>"
```

Plain HTTPS download of the URL HeyGen returned — not an API call to create or modify a video.

### 7. Report back

Tell the user three things in one short reply:

- output path of the MP4
- which avatar look was used
- duration & file size of the result

## Example

User: `tạo video heygen từ mp3 workspace/audio/episode-3.mp3`

You:
1. Auth check → if HeyGen tools present, skip; else `mcp__heygen__authenticate` + complete OAuth flow.
2. `check_duration.py workspace/audio/episode-3.mp3` → `OK 87.4`
3. Random pick from `HEYGEN_AVATAR_LOOKS` (e.g. `66e75e22e6584bbdaa56a19088286dc8`). Say so.
4. `upload_asset.py workspace/audio/episode-3.mp3` → `OK 36922ca92326480f8dbb0f57fae1a144`
5. `mcp__heygen__create_video_from_avatar(avatarId=…, audioAssetId=…, aspectRatio="9:16", resolution="720p", title="episode-3-…")` → `video_id: 874793a8…`
6. Poll `mcp__heygen__get_video` every ~15s until `completed` → grab `video_url`
7. `download_video.py <url> workspace/heygen-clips/episode-3/episode-3_20260510-143022.mp4`
8. Report path, look ID, duration.

## What this skill deliberately does NOT do

- Does not write/transcribe SRT (that's `mkt-ai-video-extract-srt-segment`).
- Does not plan visuals, b-roll, segments (that's `mkt-plan-short-video-edit-16-9`).
- Does not chunk MP3 (that's `heygen-short-video` with `split_audio.py`).
- Does not compose with Remotion or HyperFrames (that's the parent orchestrator).

If the user wants any of the above, point them at the right skill instead of expanding this one.

## Failure modes & messages

| Symptom | What to tell the user |
|---|---|
| MP3 file missing | `MP3 không tìm thấy ở <path>. Kiểm tra lại đường dẫn.` |
| MP3 > 300s | `MP3 dài <X>s, vượt giới hạn 5 phút của HeyGen. Dùng skill heygen-short-video (có chunking) thay thế.` |
| HeyGen MCP not authenticated | Surface `mcp__heygen__authenticate` URL, ask user to authorize, then `mcp__heygen__complete_authentication`. |
| `HEYGEN_API_KEY` not found / placeholder | `Không tìm thấy HEYGEN_API_KEY. Helper đã thử .env.local, .env, và ~/Documents/GitHub/hoang-ai-marketing/.env. Bạn cần thêm key thật (không phải stub your_*) vào 1 trong các file đó.` |
| `HEYGEN_AVATAR_LOOKS` is placeholder (`avatar_look_id_1,…`) | Same fallback as the API key — read from marketing repo, or ask user to fill in real avatar IDs. |
| HeyGen returns failed | `HeyGen render failed: <failure_message>. Có thể avatar look bị xoá hoặc audio asset không hợp lệ.` |
| Out of credits | Surface the error from HeyGen — there is no MCP `get_remaining_credits` exposed in this server version. Direct user to https://app.heygen.com/billing. |
| Tool name not found (`upload_asset` / `generate_avatar_video` / `get_avatar_video_status`) | Old MCP names — replaced by REST upload + `create_video_from_avatar` + `get_video`. Update any caller still using the old names. |
