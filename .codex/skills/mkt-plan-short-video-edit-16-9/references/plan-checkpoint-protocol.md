# Plan checkpoint protocol

How the LLM running this skill (Claude in conversation) presents `visual-plan.json` to Hoàng for approval, handles revision requests, and finalizes.

## Step 1 — Run `plan_visuals.py` to produce scaffold

```bash
python3 .claude/skills/mkt-plan-short-video-edit-16-9/scripts/plan_visuals.py \
  --workspace workspace/content/YYYY-MM-DD/<slug>/ \
  --brand claude
```

Output: `visual-plan.json` (validated, with default metaphors + tier-letters per archetype).

## Step 2 — Render `prompts.md`

```bash
python3 .claude/skills/mkt-plan-short-video-edit-16-9/scripts/render_infographic_prompts.py \
  --workspace workspace/content/YYYY-MM-DD/<slug>/
```

Output: `prompts.md` with full cream-paper editorial prompts numbered 1.png, 2.png, …

## Step 3 — Present plan summary to Hoàng (NOT raw JSON)

Use this template. Keep it tight — Hoàng reads on Telegram.

```markdown
## Visual plan ready — duyệt giúp anh

**Workspace:** `<workspace>`
**Total:** <D>s · <N> scenes · <K> b-roll metaphors

### Scene 1 · HOOK (0.07–13.73s) → tier-row
- Tier-letter: **8h → 0h** (rose ↔ lime)
- Items trước: ✍️ Soạn email · 📚 Đọc tài liệu · 📊 Tổng hợp báo cáo
- Items sau: 📝 Bản nháp · 📧 Email sẵn · ✓ Sẵn sàng
- B-roll: **đồng hồ cát đầy↔vơi** (1.png, 16:10, palette rose+lime+amber)
- PIP: không (hook scene)

### Scene 2 · PROBLEM (13.73–27.37s) → chats-stack
- Tier-letter: **3×** (purple)
- Fail rows: ChatGPT — đứt mạch · Gemini — phải nhắc lại
- B-roll: **broken-chain** (2.png, palette orange+slate)
- PIP: 15.13 → 18.63s (broken-chain stamp shake)

### Scene 3 · SOLUTION (27.37–47.75s) → hero-orb
- Specs: ∞ Nhớ cuộc trò chuyện · 100tr Đọc tài liệu · 8h Tự bấm máy
- B-roll: **robot-orb-with-tasks** (3.png, palette violet+cyan+claude-orange)
- PIP: 28.77 → 32.77s + 34.37 → 38.87s (2 windows, long scene)

### Scene 4 · RECAP (47.75–53.80s) → counter-row
- Tier-letter: **15h** (lime)
- Counter: 40 → 25 tiếng/tuần · +2 khách hàng mới
- B-roll: **heo đất vỡ vs két sắt** (4.png, palette lime+amber+rose)
- PIP: 49.15 → 52.65s (counter reveal)

### Scene 5 · CTA (53.80–60.68s) → terminal-row
- Tier-letter: **AI** (pink)
- Gifts: 🤖 Cách dùng tool · ⚡ Prompt + quy trình
- B-roll: **gift-box-open** (5.png, palette pink+amber+lime)
- PIP: 54.40 → 57.80s (typing animation)

**Reply:**
- `OK` → write final files + handoff to editor
- `đổi scene N metaphor sang <X>` → patch + re-render
- `đổi tier-letter scene N thành <Y>` → patch
- `đổi heading scene N thành "<Z>"` → patch
- `gộp scene N+M` / `tách scene N` → re-outline
```

## Step 4 — Handle revisions

For each kind of revision, edit `visual-plan.json` directly via the Edit tool, then re-run `render_infographic_prompts.py` to regenerate `prompts.md`.

### "đổi scene 3 metaphor sang ốc sên"

1. Edit `visual-plan.json`:
   - Find `scenes[2].broll[0]`
   - Set `metaphor: "oc-sen-ten-lua"`
   - Update `title_vi`, `subtitle_vi`, `layout_description`, `decorative_elements` from `references/visual-thinking-library.md` entry
   - Update `palette_accents` to match new metaphor
2. Re-run `render_infographic_prompts.py`
3. Re-print summary (just the changed scene)

### "đổi tier-letter scene 4 thành 25"

1. Edit `visual-plan.json`:
   - Find `scenes[3].tier_letter`
   - Set to `"25"` (verify ≤5 chars)
2. No prompt re-render needed (tier-letter is in HTML, not in prompt)
3. Re-print summary

### "tăng PIP scene 3 lên 5 giây"

1. Edit `visual-plan.json`:
   - Find `scenes[2].pip_events`
   - Adjust `t_out` by +1.5s (verify still ≤ scene end - 0.3s)
2. Re-print

### "gộp scene 4+5"

1. Edit `visual-plan.json`:
   - Combine scenes[3] + scenes[4]: take scenes[3].start as new start, scenes[4].end as new end
   - Pick the more dominant kind (usually `cta` wins)
   - Merge `items[]` and `badges[]`, dedupe
   - Pick ONE metaphor (usually CTA's `gift-box-open`)
   - Re-derive `pip_events`
   - Renumber remaining scenes
2. Re-run `render_infographic_prompts.py`
3. Re-print summary

## Step 5 — Approve → finalize

User says `OK`:

```bash
# Re-validate (already done by plan_visuals.py, but no harm)
python3 .claude/skills/mkt-plan-short-video-edit-16-9/scripts/plan_visuals.py \
  --workspace <ws> --dry-run > /dev/null

# Generate scenes.json for editor backward-compat
python3 .claude/skills/mkt-plan-short-video-edit-16-9/scripts/apply_plan_to_scenes.py \
  --workspace <ws>
```

Then announce handoff:

```markdown
## Plan duyệt xong. Sang editor.

`visual-plan.json` ✓
`prompts.md` ✓ (<K> b-roll prompts ready cho AI33/Nano Banana Pro)
`scenes.json` ✓ (editor-compatible)

Sang editor `mkt-hyperframe-talking-head-video-16-9`:
- scaffold_project.py sẽ skip manual content fill (đã có scenes.json)
- generate_compositions.py render 5 compositions
- generate_root_index.py wire SPLIT↔PIP timeline
- lint + preview
```

## Anti-patterns in checkpoint UX

- **Don't paste raw JSON to Hoàng** — unreadable on Telegram. Always summary.
- **Don't ask multi-question revisions in one round** — pick the one most-pressing change first.
- **Don't auto-approve** — even if `--auto` flag, surface 3-line digest so Hoàng can intercept.
- **Don't skip prompt re-render after metaphor swap** — the old prompt sticks in `prompts.md` and confuses image gen.
- **Don't drift from validated schema** — every edit must keep `visual-plan.json` schema-valid. Re-run validator (call `plan_visuals.py --dry-run` against the edited file via a small loader script if needed).
