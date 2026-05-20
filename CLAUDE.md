# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

This is **not** an application codebase — it is a **Claude Code skills + agents library** that powers an end-to-end pipeline for shipping Vietnamese-market digital-product sales funnels (research → offer → copy → Next.js landing page → chatbot → email auto-responder → Vercel deploy) and a parallel short-video production pipeline (script → ElevenLabs MP3 → HeyGen avatar → HyperFrames composition).

There is no root `package.json`, no test runner, no lint at this level. "Running the code" means **invoking a slash command** (skill) from the `.claude/skills/` directory inside a Claude Code session. Each generated project lives under [output/](output/) and has its own toolchain (typically Next.js 15 + React 19 + Tailwind 4).

## Repo layout

- [.claude/skills/](.claude/skills/) — 40+ slash-command skills, each a directory containing `SKILL.md` (frontmatter + procedure) and optional `references/`, `templates/`, `evals/`. Skills are the unit of work.
- [.claude/agents/](.claude/agents/) — sub-agent definitions (`mkt-full-video-phase3-packager.md`, `mkt-script-hook-writer.md`) spawned by orchestrator skills for parallel/isolated work.
- [.claude/worktrees/](.claude/worktrees/) — transient git worktrees created by isolated agents, gitignored.
- [output/](output/) — generated artifacts per project (`output/<slug>/...`). Gitignored. **This is where real Next.js projects live** — `cd` into one to run dev/build commands.
- [workspace/](workspace/) — scratch input data (assets, source materials handed to skills).
- [.env](.env) / [.env.example](.env.example) — API keys for ElevenLabs, HeyGen, OpenRouter, Resend, Gemini, OpenAI.

## Two pipelines, one repo

### 1. BIZ pipeline — sales funnel (`biz-*` + `market-research` + `ui-ux-pro-max`)

Documented in detail in [README.md](README.md). The canonical 7-step flow:

```
/market-research → 01-niche-research-report.md (Niche Score /100, Go gate ≥65)
  → /biz-offer-alex-hormozi → 02-offer.{md,json} + 02-conversion-copy.md
  → /biz-sales-page-copy → 04-copy-upgraded.md + 04-copy.json
  → /ui-ux-pro-max → output/<slug>/landing-page/ (Next.js App Router)
  → /biz-nextjs-chatbot-openrouter → app/api/chat + components/ChatWidget
  → /biz-email-setup → app/api/lead + Resend templates (2-stage flow)
  → /biz-setup-sepay-payment → VietQR webhook + Vercel KV lead store
  → /biz-telegram-payment-notify → Telegram bot alerts on paid
  → /biz-admin-leads-dashboard → /admin password-protected lead table
  → /biz-deploy-vercel → live URL (deploy ONCE, after local test)
```

Note: `03-*` prefix is intentionally skipped — `/biz-sales-page-layout` was deprecated 2026-05-14; pipeline goes straight from `02-offer.json` → `/ui-ux-pro-max`.

### 2. MKT video pipeline (`mkt-*` + `heygen-*`)

End-to-end short-form video. Two orientations with parallel skill sets:

- **9:16 portrait** (TikTok/Reels): `mkt-full-video-with-11-hyperframe-heygen` orchestrates `mkt-elevenlabs-tts-to-mp3` (or `mkt-video-script-to-mp3` MiniMax) → `heygen-mp3-to-mp4` → `mkt-hyperframe-talking-head-video` → spawns `mkt-full-video-phase3-packager` sub-agent for parallel scene scaffolding.
- **16:9 landscape** (YouTube): `mkt-full-video-with-11-hyperframe-heygen-16-9` + `mkt-hyperframe-talking-head-video-16-9` + `mkt-plan-short-video-edit-16-9`.

The `mkt-kane-*` family (~15 skills) is a separate creative-strategy toolkit (Kane/Hormozi/Brendan-Kane viral formats: Jenga tension, Visual Metaphor, Untold Stories, GSB research, anti-pattern audit, etc.) — used standalone for ideation, not chained.

## Architectural conventions

**Artifact-first.** Every skill writes structured files. The `.md` is human-readable; the `.json` is the machine-parseable contract for downstream skills. If a skill didn't write its file, it didn't run. Downstream skills read the file from disk — they do **not** depend on conversation history. This is what makes pipelines resumable mid-flow.

**Numbered-prefix output.** Files in `output/<slug>/` are prefixed by step number (`01-`, `02-`, `04-`...) so the pipeline state is self-documenting from a directory listing.

**Checkpoint user duyệt.** Skills do **not** auto-chain. After offer/copy/landing-page steps the user reviews and explicitly invokes the next skill. Orchestrator skills (`mkt-full-video-with-11-hyperframe-heygen*`) embed checkpoints inside themselves.

**Sub-agent isolation.** Heavy parallel work is delegated via the `Agent` tool to definitions in `.claude/agents/` — e.g., `mkt-full-video-phase3-packager` fans out N concurrent scene-writer agents to keep the parent context clean.

**Companion `*-workspace/` skills.** A `<skill>-workspace/iteration-N/` sibling directory is the rolling working space for that skill's in-progress drafts. Treat as scratch — the canonical artifact lands in `output/<slug>/`.

## Working with generated Next.js projects

Each `output/<slug>/landing-page/` (or similar) is an independent Next.js 15 + React 19 + Tailwind 4 project. To run:

```bash
cd output/<slug>/landing-page
npm install
npm run dev      # localhost:3000
npm run build
npm run lint
```

Generated projects already include `@vercel/kv` for the Sepay payment + admin-dashboard lead store. Env vars expected in `.env.local`:
- `OPENROUTER_API_KEY` — chatbot
- `SMTP_HOST` + `SMTP_PORT` + `SMTP_SECURE` + `SMTP_USER` + `SMTP_PASS` + `MAIL_FROM` + `OWNER_EMAIL` — email (provider-agnostic via nodemailer: Gmail / Resend SMTP / SendGrid / Brevo / Mailgun / Zoho / custom)
- `KV_*` (4 vars from Vercel KV/Upstash) — lead store
- `SEPAY_*` — payment webhook
- `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` — payment notifications
- `ADMIN_PASSWORD` — `/admin` access

**Deploy ONCE at the end** (after chatbot + email + payment + telegram + admin all wired and tested locally) via `/biz-deploy-vercel`. Re-deploying multiple times across the pipeline is the anti-pattern this design is built to avoid.

## Repo-level env vars (vs project-level)

`.env` at the repo root holds keys for **skills that run inside Claude Code itself** (not deployed): `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID` (Hoàng's brand voice), `HEYGEN_API_KEY`, `HEYGEN_AVATAR_LOOKS`, optional `GEMINI_API_KEY`, optional `OPENAI_API_KEY`. The video skills read these directly. Generated landing pages have their own separate `.env.local` for runtime keys.

## Vietnamese-market hard requirements

These are non-negotiable across the BIZ pipeline (see also `memory/feedback_*.md` and `memory/MEMORY.md`):

- **Customer-facing copy is Vietnamese**, xưng anh/chị. Keep English only for terms naturally used in VN (AI, Zalo, app, Premium→Cao Cấp, FAQ→Câu hỏi thường gặp, Bonus→Quà tặng kèm, etc.).
- **Every landing page must have a lead form** with 3 fields: tên / SĐT / email. SĐT validated by `^(0|\+84)[0-9]{9}$`.
- **Mobile-first responsive** — test at 375px, 768px, 1440px. VN traffic skews mobile.
- **VND charm pricing** (X99K), 3-tier decoy structure for offers.
- **Email auto-responder is 2-stage**: pre-payment slim confirmation + post-payment full onboarding (separate triggers — form submit vs payment webhook).

## Memory system

Persistent context lives in `/Users/tonyhoang/.claude/projects/-Users-tonyhoang-Documents-GitHub-BIZ-MKT-OS/memory/` (not in this repo) — indexed by `MEMORY.md`. It records prior project state (niche scores, ongoing campaigns), feedback (deprecated skills, copy preferences), and references. Already loaded into the system prompt when working in this repo.
