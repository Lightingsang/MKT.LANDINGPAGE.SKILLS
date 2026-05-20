---
name: mkt-plan-short-video-edit-16-9
description: Plan visual thinking slides + b-roll metaphors + tier-letter glyphs + PIP timing cho HyperFrames talking-head + slide video LANDSCAPE 16:9 (1920×1080). Đọc `script.txt` + `transcript.json`, xuất `visual-plan.json` (machine-readable, schema-validated) và `prompts.md` (cream-paper editorial prompts ready cho AI33 / Nano Banana Pro). Mỗi scene mang 1 trong 15 dạng Visual Thinking (Before-After, Mind Map, Flowchart, Matrix 2×2, Venn, Timeline, Pyramid, Comparison Table, Iceberg, Cycle, Funnel, Concept Map, Icon Grid, Number Infographic, 3-Pillar) + 1 metaphor minh họa từ thư viện 25 hình ảnh hand-drawn (đồng hồ cát, broken-chain, robot-orb, heo đất vỡ, cánh cửa mở, ốc sên ↔ tên lửa, gear-chain, gift-box, key-fits-lock, mountain-summit…). Slide chỉ chữ bị reject. Skill chạy GIỮA orchestrator `mkt-full-video-with-11-hyperframe-heygen-16-9` và editor `mkt-hyperframe-talking-head-video-16-9`. USE WHEN user nói "plan visual cho video 16:9", "plan b-roll", "plan slide visual thinking", "lên kế hoạch visual hyperframes", "tạo visual-plan.json", "plan visual thinking video", "infographic plan", "lên plan slide cho video chia sẻ AI", "plan composition cho video keynote", "lên kế hoạch trực quan video editorial". Use this skill BẤT CỨ KHI NÀO user nhắc tới "plan visual" / "plan b-roll" / "lên kế hoạch slide" cho video 16:9 HyperFrames — kể cả khi không nói rõ "visual-plan.json".
---

# mkt-plan-short-video-edit-16-9

Two-layer planner cho slide video 16:9:

1. **Structure layer (15 Visual Thinking types)** — slide layout: Before-After, Mind Map, Flowchart, Matrix 2×2, Venn, Timeline, Pyramid, Comparison Table, Iceberg, Cycle, Funnel, Concept Map, Icon Grid, Number Infographic, 3-Pillar. Driven bởi scene archetype (hook → before-after, problem → icon-grid, solution → 3-pillar, …).
2. **Illustration layer (25 metaphor library)** — hand-drawn cream-paper imagery composed *inside* the structure: đồng hồ cát, broken-chain, robot-orb, heo đất vỡ, ốc sên ↔ tên lửa, lego ghép, bậc thang, key-fits-lock, mountain-summit…

Output JSON consumed by editor `mkt-hyperframe-talking-head-video-16-9` — replaces manual fill at `scenes-outline` checkpoint with a reproducible plan.

## Output

| File | What |
|---|---|
| `visual-plan.json` | Schema-validated. Per scene: `visual_type` (one of 15) + `metaphor` + `tier_letter` + `items[]` + `badges[]` + `pip_events[]`. |
| `prompts.md` | Numbered (1.png, 2.png, …) cream-paper prompts. Each carries the structural directive (Before-After / Pyramid / Funnel / …) + metaphor + Vietnamese title/subtitle. Paste into AI33 / Nano Banana Pro. |
| `scenes.json` (via `apply_plan_to_scenes.py`) | Editor-format shim. |

Schema (1-page summary):

```
{ workspace_slug, total_duration, brand,
  scenes: [{
    id, num, kind, variant, start, end,
    kicker, heading, accent_words[], voiceover_anchor,
    tier_letter,                 // ≤5 chars: "8h" / "0h" / "∞" / "100tr" / "AI"
    items[], badges[],
    broll: [{
      kind: "infographic-cream-paper",
      visual_type,               // 1 of 15 — see references/visual-thinking-types.md
      metaphor,                  // 1 of 25 — see references/visual-thinking-library.md (or "none")
      title_vi, subtitle_vi,
      palette_accents[], layout_description,
      placeholder_filename, aspect
    }],
    pip_events: [{t_in, t_out, trigger}]
  }]
}
```

## Hard requirements

- Every `infographic-cream-paper` b-roll **must** carry both `visual_type` (1 of 15) AND `metaphor` (1 of 25 or `"none"` for pure structural diagrams). Text-only slides reject.
- Tier-letter ≤ 5 chars (numerals/symbols/brand keywords win — see `references/tier-letter-selection-rules.md`).
- PIP windows non-overlapping, ≥ 0.3s gap.
- Vietnamese titles full diacritics. Brand names + math symbols stay English.

## Pipeline

### 1. Detect scenes
Read `script.txt` + `transcript.json` (or `transcript-cleaned.json`). Reuse editor's `detect_scenes.py` if present, else fall back to 5-scene heuristic (hook → problem → solution → recap → cta).

**Listicle support:** scripts với listicle structure (1 hook + N tip + 1 CTA) → produce N+2 scenes. Use `kind: "tip-1"`, `"tip-2"`, …, `"tip-N"` for the body scenes — downstream editor's `generate_root_index.py` mounts them as `compositions/scene-{num}.html` regardless of N (no fs-lesson-1/recap-card collision). Recommended N = 3..7 (10 max).

### 1b. Downstream LLM sub-agent fanout (CONSUMER CONTRACT)

After this planner writes `visual-plan.json`, the orchestrator (`mkt-full-video-with-11-hyperframe-heygen-16-9`) **does NOT call `generate_compositions.py`** (Python Jinja2 generator deprecated). Instead it spawns N parallel `general-purpose` Agents in 1 message — 1 sub-agent per scene — each authoring `compositions/scene-{num}.html` from this skill's `visual-plan.json`.

This means:
- Each scene block in `visual-plan.json` must be **self-contained enough** for an isolated sub-agent to author its composition without coordination — full kicker, heading, accent_words, tier_letter, items, badges, broll metaphor with `layout_description`, `pip_events` with relative+absolute timing.
- Default metaphor "robot-orb-with-tasks" should be replaced (by orchestrator LLM hand-edit) with scene-specific metaphor (`scroll-tape-wasted`, `edit-regenerate-loop`, `projects-vault-shared-knowledge`, `right-tool-for-job-vehicles`, `pacific-vs-vietnam-timezone`, …) before fanout — generic metaphor → boring composition.
- `metaphor` and `layout_description` fields are read directly into the sub-agent prompt; richer descriptions → better compositions.
- Image lives at ROOT layer only (`<img id="broll-N">` in index.html). Composition HTML must NOT embed `image-slot`. The sub-agent prompt should explicitly forbid embedded image-slots.

### 2. Pick `visual_type` per scene (THE NEW STEP)
Look up `references/visual-thinking-types.md` archetype map. Default per archetype:

| Archetype | Default `visual_type` | Fallback |
|---|---|---|
| hook | `before-after` | `number-infographic` |
| problem / fail | `icon-grid` | `iceberg` |
| pivot | `before-after` | `flowchart` |
| solution | `three-pillar` | `flowchart` |
| differentiator | `comparison-table` | `venn` |
| proof / result | `number-infographic` | `comparison-table` |
| recap | `number-infographic` | `mind-map` |
| cta | `icon-grid` | `three-pillar` |

### 3. Pick `metaphor` from library
`references/visual-thinking-library.md` — 25 hand-drawn entries. Choose one whose imagery sits naturally inside the chosen `visual_type` (e.g. before-after + `dong-ho-cat`, three-pillar + `robot-orb-with-tasks`, number-infographic + `heo-dat-vo-ket-sat`). Set `"none"` only when pure structural diagram is more legible (e.g. `comparison-table` of feature checks).

### 4. Derive tier-letter, items, badges
See `references/tier-letter-selection-rules.md`. Numerals + units win (`8h`, `100tr`, `15h`). Symbols OK (`∞`, `→`, `×`). ≤ 5 chars hard cap.

### 5. Compute PIP events
1 window per scene by default: `t_in = scene_start + 1.4s`, `t_out = t_in + 3.5s` (capped 0.3s before scene end). Long solution scenes (≥ 12s) get 2 windows. Hook gets none.

### 6. Render `prompts.md`
`render_infographic_prompts.py` walks `visual-plan.json`, injects `visual_type` directive at top of each prompt, then layers metaphor + decorative elements + palette. Result is paste-ready cream-paper editorial prompt.

## Checkpoint with user

After `plan_visuals.py` runs, present a markdown summary (NOT raw JSON) — see `references/plan-checkpoint-protocol.md`. Format:

```markdown
### Scene 1 · HOOK (0.07–13.73s)
- Visual type: **before-after** → HyperFrame `tier-row`
- Tier-letter: **8h → 0h** (rose ↔ lime)
- Metaphor: **đồng hồ cát đầy↔vơi** (1.png)
- PIP: không (hook scene)

### Scene 3 · SOLUTION (27.37–47.75s)
- Visual type: **three-pillar** → HyperFrame `hero-orb`
- Specs: ∞ Nhớ trò chuyện · 100tr Đọc tài liệu · 8h Tự bấm máy
- Metaphor: **robot-orb-with-tasks** (3.png)
- PIP: 28.77→32.77s + 34.37→38.87s
```

User reply patterns:
- `OK` → finalize + handoff editor
- `đổi scene N visual sang funnel` → patch `visual_type`
- `đổi scene N metaphor sang ốc sên` → patch `metaphor` + re-render `prompts.md`
- `đổi tier-letter scene N thành 25` → patch `tier_letter`
- `gộp scene N+M` → re-outline

## Files

```
mkt-plan-short-video-edit-16-9/
├── SKILL.md
├── scripts/
│   ├── plan_visuals.py                      ← MAIN. --workspace <dir>
│   ├── render_infographic_prompts.py        ← visual-plan.json → prompts.md
│   └── apply_plan_to_scenes.py              ← visual-plan.json → scenes.json (editor shim)
├── assets/templates/
│   ├── visual-plan.schema.json              ← JSON Schema (visual_type + metaphor required)
│   └── infographic-prompt.j2                ← Jinja: structural directive + metaphor + palette
└── references/
    ├── visual-thinking-types.md             ← 15 structural types (THE primary lens)
    ├── visual-thinking-library.md           ← 25 metaphor entries (illustration layer)
    ├── tier-letter-selection-rules.md       ← Glyph picker
    ├── scene-archetype-pattern-mapping.md   ← Archetype → variant + metaphor decision tree
    └── plan-checkpoint-protocol.md          ← Summary template + revision handlers
```

## Worked example

Production project `loi-ich-claude-ai`:

| Scene | Kind | `visual_type` | Metaphor | Tier | HyperFrame variant |
|---|---|---|---|---|---|
| 1 | hook | `before-after` | `dong-ho-cat` | 8h / 0h | tier-row |
| 2 | problem | `icon-grid` | `broken-chain` | 3× | chats-stack |
| 3 | solution | `three-pillar` | `robot-orb-with-tasks` | ∞ / 100tr / 8h | hero-orb |
| 4 | recap | `number-infographic` | `heo-dat-vo-ket-sat` | 15h | counter-row |
| 5 | cta | `icon-grid` | `gift-box-open` | AI | terminal-row |

That's the gold standard — given `script.txt` + `transcript.json` for that project, `plan_visuals.py --workspace .` should re-derive this table.
