# Visual Thinking — 15 slide-structure types

This is the **structure layer** of the planner. Every scene's b-roll picks ONE of these 15 types. The type drives how the slide is laid out (HyperFrame variant + image-gen prompt). The illustration layer (`metaphor` from `visual-thinking-library.md`) is composed inside the chosen structure.

Brain processes images 60K× faster than text. Each type maps a content beat (hook / problem / pivot / solution / proof / cta) to a structure that respects how the eye reads.

---

## How to pick

1. Read the scene's spoken beat → match to **WHEN TO USE** column.
2. Look up the **archetype mapping table** at the bottom — every scene archetype has 1-2 default types.
3. Override only when content demands (e.g. CTA scene with 3 outputs → swap default Icon Grid to 3-Pillar).

| # | Type | Vietnamese | Best for |
|---|---|---|---|
| 1 | `before-after` | Trước-Sau | Hook with contrast, value pitch, time-savings |
| 2 | `mind-map` | Sơ đồ tư duy | Topic overview, opening / closing recap |
| 3 | `flowchart` | Sơ đồ quy trình | Multi-step process, decision logic |
| 4 | `matrix-2x2` | Ma trận 2×2 | Classification, prioritization (Eisenhower, SWOT) |
| 5 | `venn` | Sơ đồ Venn | Overlap of 2-3 concepts |
| 6 | `timeline` | Dòng thời gian | Roadmap, history, day-in-the-life |
| 7 | `pyramid` | Kim tự tháp | Hierarchy, layered knowledge (Maslow, Bloom) |
| 8 | `comparison-table` | Bảng so sánh | Multi-row × multi-column compare |
| 9 | `iceberg` | Mô hình tảng băng | Surface symptom vs root cause |
| 10 | `cycle` | Vòng tuần hoàn | Repeating loop (PDCA, lifecycle) |
| 11 | `funnel` | Phễu | Filtering, conversion, AIDA |
| 12 | `concept-map` | Sơ đồ khái niệm | Labelled relationship network |
| 13 | `icon-grid` | Lưới biểu tượng | 4-9 parallel items |
| 14 | `number-infographic` | Số liệu nổi bật | Headline metric, proof |
| 15 | `three-pillar` | 3 cột song song | 3 USPs, value props |

---

## 1. `before-after` — Trước / Sau

**When:** hook contrast, value pitch, "tôi đã từng X, giờ Y", productivity savings.
**HyperFrame variant:** `tier-row` (2 rows side-by-side).
**Layout:** vertical split 50/50. LEFT = old/pain (muted palette: rose, slate). RIGHT = new/solution (vivid palette: lime, cyan). Center arrow + delta label.
**Metaphor candidates:** `dong-ho-cat`, `oc-sen-ten-lua`, `light-bulb-off-on`, `sleeping-vs-working`, `coc-day-tran`, `heo-dat-vo-ket-sat`.
**Text budget:** 1 title + 2 column labels + 1 delta. ≤25 chars per side.

## 2. `mind-map` — Sơ đồ tư duy

**When:** broad-topic overview, opening, closing recap of "everything we covered".
**HyperFrame variant:** `embedded-infographic` (image-only) — too dense for native HTML composition at 1920×1080.
**Layout:** central node (the topic) → 4-6 radial branches → optional second-level leaves.
**Metaphor candidates:** `network-graph`, `tree-grow`.
**Text budget:** 1 center label + 4-6 branch labels (1-2 words each).

## 3. `flowchart` — Sơ đồ quy trình

**When:** "step 1 → step 2 → step 3", decision logic, automation pipeline.
**HyperFrame variant:** `hero-orb` with arrow chain, OR `embedded-infographic`.
**Layout:** horizontal chain of 3-5 boxes connected by arrows. Optional decision diamond for branches.
**Metaphor candidates:** `gear-chain`, `ong-nuoc-flow`, `lego-ghep`.
**Text budget:** 1 title + 3-5 step labels (≤3 words each).

## 4. `matrix-2x2` — Ma trận 2×2

**When:** Eisenhower, SWOT, BCG, "high/low × X/Y".
**HyperFrame variant:** `embedded-infographic` (4-quadrant grid hard to render in glass-card style).
**Layout:** 2×2 grid. Top-right = winner quadrant (highlighted). Axes labelled.
**Metaphor candidates:** none typical — abstract grid.
**Text budget:** 2 axis labels + 4 quadrant labels (≤4 words each).

## 5. `venn` — Sơ đồ Venn

**When:** "X vs Y, what they share", overlap of 2-3 concepts.
**HyperFrame variant:** `embedded-infographic`.
**Layout:** 2 or 3 overlapping circles. Intersections labelled.
**Metaphor candidates:** `but-mau-ket-not` (2 pens crossed = blend).
**Text budget:** circle labels (≤4 words) + intersection labels (≤4 words).

## 6. `timeline` — Dòng thời gian

**When:** roadmap, day-in-the-life, 30-day challenge, history.
**HyperFrame variant:** `counter-row` (horizontal bar with milestones) OR `embedded-infographic`.
**Layout:** horizontal axis, 3-5 milestones marked, each with date + 1-line label.
**Metaphor candidates:** `bac-thang`, `mountain-summit`, `tree-grow`.
**Text budget:** 1 title + 3-5 milestone labels (≤6 words each).

## 7. `pyramid` — Kim tự tháp

**When:** Maslow, Bloom, levels of mastery, foundation → peak.
**HyperFrame variant:** `embedded-infographic`.
**Layout:** triangle stacked 3-5 tiers. Wide base = fundamentals, narrow peak = mastery.
**Metaphor candidates:** `bac-thang`, `mountain-summit`.
**Text budget:** 1 title + 3-5 tier labels.

## 8. `comparison-table` — Bảng so sánh

**When:** "Claude vs GPT-5 vs Gemini" feature-by-feature, pros/cons.
**HyperFrame variant:** `compare-2-col` (for 2 columns) OR `embedded-infographic` (for 3+).
**Layout:** rows = criteria, columns = options. Use ✓ / ✗ / values.
**Metaphor candidates:** `scale-tilt`, `key-fits-lock`.
**Text budget:** column headers + 4-6 rows × 2-3 cols.

## 9. `iceberg` — Tảng băng

**When:** "what people see vs what's underneath", root-cause analysis, hidden cost.
**HyperFrame variant:** `embedded-infographic`.
**Layout:** waterline horizontal. ABOVE = visible symptom (smaller, ~20%). BELOW = invisible cause (larger, ~80%).
**Metaphor candidates:** none typical — abstract.
**Text budget:** 1 above-line label + 3-5 below-line labels.

## 10. `cycle` — Vòng tuần hoàn

**When:** PDCA, product lifecycle, build-measure-learn, daily ritual.
**HyperFrame variant:** `embedded-infographic`.
**Layout:** circular arrow loop with 3-5 nodes on the ring.
**Metaphor candidates:** `gear-chain` (closed loop variant), `tree-grow` (seasonal cycle).
**Text budget:** 3-5 stage labels.

## 11. `funnel` — Phễu

**When:** AIDA, conversion funnel, filtering, "100 leads → 10 customers".
**HyperFrame variant:** `embedded-infographic` OR `stats-3-card` for 3-stage.
**Layout:** trapezoid stack narrowing top to bottom. Each tier with count + label.
**Metaphor candidates:** none typical.
**Text budget:** 3-5 tier labels with numbers.

## 12. `concept-map` — Sơ đồ khái niệm

**When:** complex relationship network, "X causes Y because Z".
**HyperFrame variant:** `embedded-infographic` (too dense for native HTML).
**Layout:** like mind-map but EVERY edge is labelled with the relationship verb.
**Metaphor candidates:** `network-graph`.
**Text budget:** 5-8 nodes + edge verbs.

## 13. `icon-grid` — Lưới biểu tượng

**When:** 4-9 parallel features, tools, options, items.
**HyperFrame variant:** `tier-row` items section, `chats-stack`, `terminal-row`.
**Layout:** evenly-spaced grid 2×2, 3×3, or 2×3. Each cell = icon + 1-line label.
**Metaphor candidates:** `lego-ghep`, `robot-orb-with-tasks`.
**Text budget:** N icon-labels (≤3 words each).

## 14. `number-infographic` — Số liệu nổi bật

**When:** proof scene, headline metric, "X% improvement", testimonial number.
**HyperFrame variant:** `counter-row`, `stats-3-card`.
**Layout:** ONE huge number (font 200pt+) + small icon + 1-line label below. Number font 3-4× the label font.
**Metaphor candidates:** `paper-stack-100`, `scale-tilt`, `heo-dat-vo-ket-sat`.
**Text budget:** the number (≤5 chars) + ≤8-word label.

## 15. `three-pillar` — 3 cột

**When:** 3 USPs, 3 reasons, 3 differentiators. Default for solution scene.
**HyperFrame variant:** `hero-orb` (orb + 3 spec rows), `stats-3-card`.
**Layout:** 3 equal vertical columns, each with icon + tier-letter + 1-line label.
**Metaphor candidates:** `robot-orb-with-tasks`, `gift-box-open` (opens to 3 cards).
**Text budget:** 3 column labels (≤4 words) + 3 tier-letters.

---

## Archetype → default visual type

| Scene archetype | Default `visual_type` | Fallback | HyperFrame variant |
|---|---|---|---|
| `hook` | `before-after` | `number-infographic` | `tier-row` |
| `problem` / `fail` | `icon-grid` | `iceberg` | `chats-stack` |
| `pivot` | `before-after` | `flowchart` | `tier-row` / `compare-2-col` |
| `solution` | `three-pillar` | `flowchart` | `hero-orb` |
| `differentiator` | `comparison-table` | `venn` | `compare-2-col` |
| `proof` / `result` | `number-infographic` | `comparison-table` | `counter-row` / `stats-3-card` |
| `recap` | `number-infographic` | `mind-map` | `counter-row` |
| `cta` | `icon-grid` | `three-pillar` | `terminal-row` |

---

## Golden rules

1. **One main idea per slide.** If the type can't fit it in ≤25% text, the type is wrong — try a simpler one.
2. **Color palette stays in 2-3 hues across the video.** Each type colors with its archetype palette (hook = cyan/lime, problem = orange/rose, solution = violet, recap = lime, cta = pink). Don't repeat adjacent.
3. **One icon family per video.** Lucide / Phosphor / hand-drawn — pick one. Don't mix.
4. **Numbers are 3-4× the body font.** A `number-infographic` slide where the number is the same size as the label fails its own purpose.
5. **First and last slides carry the most weight.** Hook decides if they stay; CTA decides if they act.
