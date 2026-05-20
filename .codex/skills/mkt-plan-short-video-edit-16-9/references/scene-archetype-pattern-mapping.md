# Scene archetype → variant → metaphor mapping

Decision tree — given a scene archetype, pick composition variant + suggested metaphors + PIP timing.

## Default 5-scene knowledge skeleton

| # | Archetype (kind) | Variant | Suggested metaphors | PIP cadence |
|---|---|---|---|---|
| 1 | `hook` | `tier-row` | `dong-ho-cat`, `sleeping-vs-working`, `light-bulb-off-on` | None (establish SPLIT in viewer's mind) |
| 2 | `problem` / `fail` | `chats-stack` | `broken-chain`, `gear-jam`, `coc-day-tran` | 1 window @ stamp shake |
| 3 | `solution` / `differentiator` | `hero-orb` | `robot-orb-with-tasks`, `ong-nuoc-flow`, `gear-chain`, `network-graph` | 2 windows (long scene) |
| 4 | `recap` / `result` / `proof` | `counter-row` | `heo-dat-vo-ket-sat`, `scale-tilt`, `paper-stack-100` | 1 window @ counter reveal |
| 5 | `cta` | `terminal-row` | `gift-box-open`, `key-fits-lock` | 1 short window @ typing |

## Override decision tree

### Hook is NOT before/after
If hook is a single bold claim (no contrast):
- Variant: `hero-orb` with single hero metaphor
- Metaphor: `light-bulb-off-on` (insight moment), `mountain-summit` (bold goal)
- OR keep `tier-row` but empty `before_items`, all content in `after_items`

### Problem is NOT multi-AI
If problem is a single point of pain (not "tried X, tried Y"):
- Variant: `tier-row` (before = problem, after = "still no answer")
- Metaphor: `gear-jam`, `coc-day-tran` (overflow)
- Reserve `chats-stack` for genuine multi-tool fail

### Solution has 4+ specs
`hero-orb` template renders 3 spec rows. For 4+:
- Consolidate similar specs (merge memory + context = "context retention")
- OR use `stats-3-card` if specs are number-heavy

### Pivot scene (separate from solution)
Some scripts have a distinct "tôi đổi cách làm" pivot moment before the solution unfolds. Add as a 6th scene type:
- Variant: `compare-2-col` or `tier-row`
- Metaphor: `nga-ba-duong`, `but-mau-ket-not`, `light-bulb-off-on`

### Differentiator scene (vs competitor)
"Khác chỗ nào? Cùng tool, khác cách dùng":
- Variant: `compare-2-col` (Yes/Yes chips)
- Metaphor: `scale-tilt`, `key-fits-lock`, `but-mau-ket-not`

### Proof scene (testimonial / number)
"Một tuần đầu mình tiết kiệm 15 tiếng…":
- Variant: `counter-row` or `stats-3-card`
- Metaphor: `paper-stack-100`, `scale-tilt`, `tree-grow`

### CTA is NOT comment-keyword
"Save this" / "DM me" / "Follow":
- Replace `keyword` with the actual CTA word (≤4 chars: `SAVE`, `DM`, `JOIN`)
- Metaphor: `gift-box-open` works for almost any CTA

## Variant rotation rule

Each variant has a distinct accent color. **Don't assign the same eyebrow color to two adjacent scenes** — viewers can't feel transitions otherwise.

Default rotation:
```
Hook (cyan/lime) → Problem (orange/rose) → Solution (violet) → Recap (lime) → CTA (pink)
```

If you swap variants, keep the color rotation. Example: hook → tier-row but solution → compare-2-col → still alternate violet vs cyan.

## Metaphor adjacency rules

- **Don't repeat the same metaphor in adjacent scenes** (visual fatigue).
- **Don't use 2 hourglass-style metaphors in one video** (`dong-ho-cat` AND `oc-sen-ten-lua` together = redundant time motif).
- **Container metaphors (`heo-dat-vo-ket-sat`, `coc-day-tran`, `gift-box-open`) can co-exist** — they read as different "boxes" semantically.
- **Flow metaphors (`ong-nuoc-flow`, `gear-chain`, `network-graph`) — pick ONE per video** unless the video is specifically about pipeline architecture.

## Cadence guidance per total duration

| Total | Scene count | Notes |
|---|---|---|
| 30–40s | 3 scenes | Hook + Solution + CTA. Skip problem & recap. |
| 45–60s | 5 scenes (default) | Full skeleton. |
| 60–90s | 5–7 scenes | Insert pivot before solution; insert proof before recap. |
| 90–120s | 7 scenes | Full skeleton + pivot + proof. Reduce motion density per scene to avoid overwhelm. |
| > 120s | Refactor | Skill is tuned for short-form. Long-form needs different pacing. |
