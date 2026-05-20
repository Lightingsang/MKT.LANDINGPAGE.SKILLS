# Tier-letter selection rules

The tier-letter is the glowing glyph in the centre of glass cards (tier-row, hero-orb spec rows, recap counter, CTA terminal). It's the single biggest visual hook on the slide — viewers see it before they read the heading.

## Hard cap: 5 characters

Glass card width budget at 1200px composition × tier-row glyph slot = ~140px wide. Anything over 5 chars either tràn or shrinks to unreadable. Keep it ≤ 5.

## Priority ranking — what wins

1. **Numerals with units** (best). `8h`, `0h`, `15h`, `100`, `100tr`, `2x`, `40`, `25`. The unit gives instant context.
2. **Math/symbol glyphs**. `∞`, `×`, `→`, `%`, `+`, `−`, `?`, `✓`, `✗`. Universal, language-agnostic.
3. **Brand keywords**. `AI`, `GPT`, `MCP`, `RAG`. Short, uppercase, ≤4 chars typically.
4. **Time units in Vietnamese style**. `8h` (giờ), `8s` (giây), `30d` (ngày), `1tr` (triệu), `100tr`. Mixes numeral + 1 char unit.
5. **Single Vietnamese letter** (last resort). `B` for "Bạn", `A` for "Anh". Use only when scene is personal direct-address.

## Anti-patterns — never do these

- **Whole words**: `CLAUDE`, `TỰ ĐỘNG`, `GIAO VIỆC`. Tràn card. Use them in items[] or kicker, not as tier-letter.
- **Sentences**: `8h thành 0h`. Pick ONE side and put the other in items.
- **Emoji-only**: `🤖`. Emoji belongs in items[].icon, not tier-letter. Tier-letter is text-glyph only.
- **Non-ASCII without diacritic intent**: `Ặ`. Looks like junk on glass card.
- **Ambiguous units**: `100`. Add unit: `100tr` (trang) or `100K` (token).

## Pattern → tier-letter rules of thumb

| Composition variant | Tier-letter purpose | Examples from production |
|---|---|---|
| `tier-row` (hook before/after) | 2 letters: one per row | `8h` (before, rose) ↔ `0h` (after, lime) |
| `tier-row` (problem) | 1 letter — the failure delta | `3×` (số lần phải nhắc lại), `?` (câu hỏi treo) |
| `chats-stack` (problem) | NO tier-letter — stamp + chat rows carry it | (skip) |
| `hero-orb` (solution) | 3 spec letters | `∞` (memory) · `100tr` (read length) · `8h` (auto-run) |
| `counter-row` (recap) | 1 letter — the headline number | `15h` (savings/week), `+2` (clients) |
| `terminal-row` (cta) | 1 letter — the comment keyword | `AI`, `GPT`, `MCP` |
| `stats-3-card` | 3 letters — one per stat | `100K` · `99%` · `8s` |
| `compare-2-col` | 2 letters — one per column | `Y` · `N` (or branded `OPENAI` · `CLAUDE` if cap permits) |

## Worked examples from production project `loi-ich-claude-ai`

| Scene | Kind | Picked tier-letter | Why |
|---|---|---|---|
| 1 | hook | `8h` / `0h` | Numerals + time unit. Encodes the whole BEFORE/AFTER in 4 chars total. |
| 2 | problem | `3×` | Number + multiplier symbol. Captures "phải nhắc lại 3 lần". |
| 3 | solution | `∞` / `100tr` / `8h` | Three differentiated specs. Symbol + numeral-unit combos. |
| 4 | recap | `15h` | Headline metric. Numeral + unit. |
| 5 | cta | `AI` | Brand keyword. Matches comment keyword exactly. |

## Brand consistency

If `brand: claude` in plan, tier-letters in solution/spec scenes can hint at Claude differentiators (`200K` for context window, `MCP` for tooling). For `deepseek`, hint at price (`$0.02`). For `openai`, hint at GPT versions (`GPT-5`, but trim if needed: `GPT5`).

## When in doubt

Pick the **strongest number** in the scene's spoken voiceover. If user said "tiết kiệm được 15 tiếng một tuần" → `15h`. If user said "đọc 100 trang một lần" → `100tr`. The tier-letter should match what the avatar's mouth is saying at that moment so the PIP zoom-in feels earned.
