#!/usr/bin/env python3
"""Generate storyboard.html from visual-plan.json — one card per scene, cream-paper editorial style.

Standalone HTML (no external deps). Open in any browser. Use for plan review
before approving handoff to editor.

Usage:
    python3 build_storyboard.py --workspace <dir>
"""
from __future__ import annotations

import argparse
import html
import json
import sys
from pathlib import Path


VARIANT_LABEL = {
    "tier-row": "Tier row (before / after)",
    "chats-stack": "Chats stack (multi-AI fail rows)",
    "hero-orb": "Hero orb (3 spec rings)",
    "counter-row": "Counter row (headline metric)",
    "terminal-row": "Terminal row (typing CTA)",
    "stats-3-card": "Stats 3-card",
    "compare-2-col": "2-column compare",
    "embedded-infographic": "Embedded infographic (image-only)",
}

VISUAL_TYPE_LABEL = {
    "before-after": "Before / After",
    "mind-map": "Mind Map",
    "flowchart": "Flowchart",
    "matrix-2x2": "Matrix 2×2",
    "venn": "Venn Diagram",
    "timeline": "Timeline",
    "pyramid": "Pyramid",
    "comparison-table": "Comparison Table",
    "iceberg": "Iceberg",
    "cycle": "Cycle",
    "funnel": "Funnel",
    "concept-map": "Concept Map",
    "icon-grid": "Icon Grid",
    "number-infographic": "Number Infographic",
    "three-pillar": "3-Pillar",
}

KIND_COLOR = {
    "hook": ("#67e8f9", "#0c4a6e"),       # cyan
    "problem": ("#fb923c", "#7c2d12"),    # orange
    "fail": ("#fb923c", "#7c2d12"),
    "pivot": ("#a78bfa", "#3b0764"),      # violet
    "solution": ("#a78bfa", "#3b0764"),
    "differentiator": ("#a3e635", "#365314"),
    "proof": ("#a3e635", "#365314"),
    "result": ("#a3e635", "#365314"),
    "recap": ("#a3e635", "#365314"),       # lime
    "cta": ("#f0abfc", "#701a75"),        # pink
}


def render_pip_bar(scene_start: float, scene_end: float, pip_events: list[dict], total: float) -> str:
    """Render a horizontal scene-timeline with PIP windows shaded."""
    span = max(0.001, scene_end - scene_start)
    bars = []
    for ev in pip_events or []:
        left_pct = max(0.0, (ev["t_in"] - scene_start) / span * 100)
        width_pct = max(1.0, (ev["t_out"] - ev["t_in"]) / span * 100)
        trigger = ev.get("trigger", "pip")
        bars.append(
            f'<div class="pip-window" style="left:{left_pct:.1f}%; width:{width_pct:.1f}%" '
            f'title="{html.escape(trigger)} · {ev["t_in"]:.2f}s → {ev["t_out"]:.2f}s"></div>'
        )
    bars_html = "".join(bars) or '<div class="pip-empty">no PIP window</div>'
    return f"""
        <div class="timeline">
          <div class="timeline-meta">
            <span>{scene_start:.2f}s</span>
            <span class="timeline-duration">{span:.2f}s</span>
            <span>{scene_end:.2f}s</span>
          </div>
          <div class="timeline-bar">{bars_html}</div>
        </div>
    """


def render_scene(scene: dict, total: float) -> str:
    kind = scene["kind"]
    bg, fg = KIND_COLOR.get(kind, ("#cbd5e1", "#0f172a"))
    broll = (scene.get("broll") or [{}])[0]
    visual_type = broll.get("visual_type", "")
    visual_label = VISUAL_TYPE_LABEL.get(visual_type, visual_type)
    metaphor = broll.get("metaphor", "—")
    placeholder = broll.get("placeholder_filename", "")
    palette = " · ".join(broll.get("palette_accents", []))

    items_html = "".join(
        f'<div class="item"><span class="item-icon">{html.escape(it["icon"])}</span>'
        f'<span class="item-label">{html.escape(it["label"])}</span></div>'
        for it in scene.get("items", [])
    ) or '<div class="empty">— no items —</div>'

    badges_html = "".join(
        f'<div class="badge badge-{html.escape(b["color"])}">'
        f'<span class="badge-icon">{html.escape(b["icon"])}</span>'
        f'<span class="badge-num">{html.escape(b["num"])}</span>'
        f'<span class="badge-label">{html.escape(b["label"])}</span></div>'
        for b in scene.get("badges", [])
    ) or '<div class="empty">— no badges —</div>'

    accents = " · ".join(scene.get("accent_words", []) or ["—"])

    voiceover = scene.get("voiceover_anchor", "")
    voiceover_html = (
        f'<blockquote class="voiceover">"{html.escape(voiceover)}"</blockquote>'
        if voiceover else ""
    )

    layout_desc = broll.get("layout_description", "")
    decor = broll.get("decorative_elements", "")

    return f"""
    <article class="scene" id="scene-{scene['num']}" style="--kind-bg:{bg}; --kind-fg:{fg}">
      <header class="scene-head">
        <div class="scene-num">{scene['num']}</div>
        <div class="scene-meta">
          <span class="scene-kind">{html.escape(kind.upper())}</span>
          <span class="scene-time">{scene['start']:.2f}s – {scene['end']:.2f}s</span>
          <span class="scene-variant">→ HyperFrame <code>{html.escape(scene['variant'])}</code></span>
        </div>
      </header>

      <div class="scene-body">
        <div class="left-col">
          <div class="kicker">{html.escape(scene.get('kicker', '') or '—')}</div>
          <h2 class="heading">{html.escape(scene.get('heading', '') or '—')}</h2>
          <div class="accent-line"><span class="muted">accent words:</span> {html.escape(accents)}</div>

          <div class="tier-letter-block">
            <div class="tier-letter-label">Tier-letter</div>
            <div class="tier-letter">{html.escape(scene.get('tier_letter', '—'))}</div>
          </div>

          <div class="block">
            <div class="block-title">Items ({len(scene.get('items', []))})</div>
            <div class="items">{items_html}</div>
          </div>

          <div class="block">
            <div class="block-title">Badges ({len(scene.get('badges', []))})</div>
            <div class="badges">{badges_html}</div>
          </div>

          {voiceover_html}
        </div>

        <div class="right-col">
          <div class="visual-type-block">
            <div class="vt-tag">VISUAL THINKING TYPE</div>
            <div class="vt-name">{html.escape(visual_label)}</div>
            <div class="vt-key"><code>{html.escape(visual_type)}</code></div>
          </div>

          <div class="broll-card">
            <div class="broll-head">
              <div class="broll-filename">{html.escape(placeholder)}</div>
              <div class="broll-aspect">{html.escape(broll.get('aspect', '16:10'))}</div>
            </div>
            <div class="broll-image-slot">
              <img src="{html.escape(placeholder)}"
                   alt="{html.escape(broll.get('title_vi', ''))}"
                   onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
              <div class="broll-pending">
                <div class="pending-icon">🖼️</div>
                <div class="pending-text">{html.escape(placeholder)} chưa render<br><span class="muted">paste prompt từ prompts.md vào AI33 / Nano Banana Pro</span></div>
              </div>
            </div>
            <div class="broll-meta">
              <div class="metaphor-line"><span class="muted">metaphor:</span> <code>{html.escape(metaphor)}</code></div>
              <div class="palette-line"><span class="muted">palette:</span> {html.escape(palette)}</div>
            </div>
            <h3 class="broll-title">{html.escape(broll.get('title_vi', ''))}</h3>
            <div class="broll-subtitle">{html.escape(broll.get('subtitle_vi', ''))}</div>
            {f'<details class="layout-details"><summary>Layout sketch</summary><div class="layout-text">{html.escape(layout_desc)}</div></details>' if layout_desc else ''}
            {f'<details class="decor-details"><summary>Decorative elements</summary><div class="decor-text">{html.escape(decor)}</div></details>' if decor else ''}
          </div>

          <div class="block">
            <div class="block-title">PIP timing ({len(scene.get('pip_events', []))} window{"s" if len(scene.get('pip_events', [])) != 1 else ""})</div>
            {render_pip_bar(scene['start'], scene['end'], scene.get('pip_events', []), total)}
          </div>
        </div>
      </div>
    </article>
    """


CSS = """
:root {
  --cream: #F0EEE6;
  --cream-2: #E8E5DA;
  --slate: #1f2937;
  --slate-2: #475569;
  --muted: #94a3b8;
  --line: #d6d3c8;
  --accent: #d97706;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  background: var(--cream);
  color: var(--slate);
  line-height: 1.55;
}
header.page-head {
  padding: 32px 48px 24px;
  border-bottom: 1px solid var(--line);
  background: linear-gradient(180deg, var(--cream-2) 0%, var(--cream) 100%);
}
.page-head h1 {
  margin: 0 0 8px;
  font-family: 'Tiempos Headline', 'Iowan Old Style', Georgia, serif;
  font-size: 32px;
  font-weight: 700;
}
.page-head .meta {
  color: var(--slate-2);
  font-size: 14px;
}
.page-head .meta code { background: rgba(0,0,0,0.05); padding: 1px 6px; border-radius: 3px; }
.scenes-grid { padding: 32px 48px 48px; display: flex; flex-direction: column; gap: 32px; }

.scene {
  background: white;
  border: 1px solid var(--line);
  border-left: 6px solid var(--kind-bg);
  border-radius: 6px;
  padding: 24px 28px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}
.scene-head {
  display: flex; align-items: center; gap: 16px;
  padding-bottom: 16px; margin-bottom: 20px;
  border-bottom: 1px dashed var(--line);
}
.scene-num {
  flex-shrink: 0;
  width: 56px; height: 56px;
  display: flex; align-items: center; justify-content: center;
  background: var(--kind-bg); color: var(--kind-fg);
  font-family: 'Tiempos Headline', Georgia, serif;
  font-size: 28px; font-weight: 700;
  border-radius: 50%;
}
.scene-meta { display: flex; flex-wrap: wrap; gap: 8px 18px; align-items: baseline; }
.scene-kind { font-weight: 700; font-size: 13px; letter-spacing: 0.08em; color: var(--kind-fg); }
.scene-time { color: var(--slate-2); font-variant-numeric: tabular-nums; }
.scene-variant { color: var(--muted); font-size: 13px; }
.scene-variant code { background: rgba(0,0,0,0.05); padding: 1px 6px; border-radius: 3px; }

.scene-body { display: grid; grid-template-columns: 1.1fr 1.3fr; gap: 32px; }
@media (max-width: 1100px) { .scene-body { grid-template-columns: 1fr; } }

.kicker { font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted); margin-bottom: 4px; }
.heading {
  margin: 0 0 8px;
  font-family: 'Tiempos Headline', Georgia, serif;
  font-size: 22px; line-height: 1.25; font-weight: 600;
}
.accent-line { font-size: 13px; color: var(--slate-2); margin-bottom: 18px; }

.tier-letter-block {
  display: flex; flex-direction: column; align-items: flex-start;
  background: var(--cream-2); border-radius: 6px;
  padding: 14px 20px; margin-bottom: 18px;
  border: 1px solid var(--line);
}
.tier-letter-label { font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--muted); }
.tier-letter {
  font-family: 'Tiempos Headline', Georgia, serif;
  font-size: 56px; font-weight: 700; line-height: 1; color: var(--accent);
  letter-spacing: -0.02em;
}

.block { margin-bottom: 16px; }
.block-title { font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--muted); margin-bottom: 6px; }

.items { display: flex; flex-direction: column; gap: 4px; }
.item { display: flex; align-items: center; gap: 10px; padding: 6px 10px; background: var(--cream-2); border-radius: 4px; font-size: 14px; }
.item-icon { font-size: 18px; width: 24px; text-align: center; }
.item-label { color: var(--slate); }

.badges { display: flex; flex-wrap: wrap; gap: 8px; }
.badge {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 6px 10px; border-radius: 999px;
  font-size: 13px; line-height: 1;
  background: var(--cream-2); border: 1px solid var(--line);
}
.badge-icon { font-size: 14px; }
.badge-num { font-weight: 700; }
.badge-label { color: var(--slate-2); font-size: 12px; }
.badge-orange { background: #ffedd5; border-color: #fdba74; }
.badge-green { background: #dcfce7; border-color: #86efac; }
.badge-purple { background: #ede9fe; border-color: #c4b5fd; }
.badge-cyan { background: #cffafe; border-color: #67e8f9; }
.badge-lime { background: #ecfccb; border-color: #bef264; }
.badge-rose { background: #ffe4e6; border-color: #fda4af; }
.badge-pink { background: #fce7f3; border-color: #f9a8d4; }
.badge-amber { background: #fef3c7; border-color: #fcd34d; }
.badge-violet { background: #ede9fe; border-color: #c4b5fd; }
.badge-slate { background: #e2e8f0; border-color: #94a3b8; }

.voiceover {
  margin: 18px 0 0; padding: 12px 16px;
  border-left: 3px solid var(--accent); background: rgba(217,119,6,0.06);
  font-style: italic; color: var(--slate-2); font-size: 14px;
}

.visual-type-block {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 1px solid #f59e0b;
  border-radius: 6px;
  padding: 14px 20px;
  margin-bottom: 18px;
}
.vt-tag { font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: #92400e; font-weight: 700; }
.vt-name { font-family: 'Tiempos Headline', Georgia, serif; font-size: 24px; font-weight: 700; color: #78350f; line-height: 1.2; margin-top: 2px; }
.vt-key { font-size: 12px; color: #92400e; margin-top: 4px; }
.vt-key code { background: rgba(120,53,15,0.1); padding: 1px 6px; border-radius: 3px; }

.broll-card {
  border: 1px solid var(--line);
  border-radius: 6px;
  padding: 16px;
  background: var(--cream);
  margin-bottom: 16px;
}
.broll-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 10px; font-size: 12px; color: var(--muted); }
.broll-filename { font-family: 'JetBrains Mono', Menlo, monospace; }
.broll-image-slot {
  position: relative;
  background: var(--cream-2);
  border: 1px dashed var(--line);
  border-radius: 4px;
  aspect-ratio: 16 / 10;
  margin-bottom: 12px;
  overflow: hidden;
}
.broll-image-slot img { width: 100%; height: 100%; object-fit: cover; display: block; }
.broll-pending {
  position: absolute; inset: 0;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  text-align: center; padding: 16px;
}
.pending-icon { font-size: 36px; opacity: 0.4; margin-bottom: 6px; }
.pending-text { font-size: 13px; color: var(--slate-2); }
.broll-meta { display: flex; flex-wrap: wrap; gap: 4px 16px; margin-bottom: 8px; font-size: 12px; }
.broll-meta code { background: rgba(0,0,0,0.05); padding: 1px 6px; border-radius: 3px; font-family: 'JetBrains Mono', Menlo, monospace; }
.broll-title {
  margin: 6px 0 4px;
  font-family: 'Tiempos Headline', Georgia, serif;
  font-size: 16px; font-weight: 600;
}
.broll-subtitle { font-size: 13px; color: var(--slate-2); margin-bottom: 8px; }
details { margin-top: 8px; font-size: 12px; }
details summary { cursor: pointer; color: var(--accent); font-weight: 600; }
.layout-text, .decor-text { padding: 8px 0; color: var(--slate-2); line-height: 1.55; }

.timeline { margin-top: 6px; }
.timeline-meta { display: flex; justify-content: space-between; font-size: 11px; color: var(--muted); font-variant-numeric: tabular-nums; margin-bottom: 4px; }
.timeline-duration { font-weight: 600; color: var(--slate-2); }
.timeline-bar { position: relative; height: 28px; background: var(--cream-2); border-radius: 4px; border: 1px solid var(--line); overflow: hidden; }
.pip-window {
  position: absolute; top: 0; bottom: 0;
  background: linear-gradient(180deg, rgba(217,119,6,0.6) 0%, rgba(217,119,6,0.4) 100%);
  border-left: 2px solid var(--accent);
  border-right: 2px solid var(--accent);
}
.pip-empty { display: flex; align-items: center; justify-content: center; height: 100%; font-size: 12px; color: var(--muted); }

.empty { color: var(--muted); font-size: 13px; font-style: italic; }
.muted { color: var(--muted); }
code { font-family: 'JetBrains Mono', Menlo, monospace; }
"""


PREVIEW_CSS = """
.preview-section {
  padding: 32px 48px;
  background: #0a0e1a;
  color: #e2e8f0;
  border-bottom: 1px solid var(--line);
}
.preview-section h2 {
  margin: 0 0 16px;
  font-family: 'Tiempos Headline', Georgia, serif;
  font-size: 22px;
  color: #f8fafc;
}
.preview-section .preview-meta {
  font-size: 13px; color: #94a3b8; margin-bottom: 16px;
}
.preview-section .preview-meta code { background: rgba(255,255,255,0.08); padding: 1px 6px; border-radius: 3px; color: #cbd5e1; }
.stage-wrap {
  position: relative;
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
}
.stage {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #1e293b;
  display: grid;
  grid-template-columns: 1200fr 720fr;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0,0,0,0.4);
}
.slide-pane {
  background: var(--cream);
  color: var(--slate);
  padding: 4% 5%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  overflow: hidden;
}
.slide-pane .slide-kicker {
  font-size: 1.1cqw;
  letter-spacing: 0.18em; text-transform: uppercase;
  color: var(--accent); font-weight: 700; margin-bottom: 0.6cqw;
}
.slide-pane .slide-heading {
  font-family: 'Tiempos Headline', Georgia, serif;
  font-size: 2.4cqw; line-height: 1.15; font-weight: 700;
  color: var(--slate); margin: 0 0 1.2cqw;
}
.slide-pane .slide-tier {
  font-family: 'Tiempos Headline', Georgia, serif;
  font-size: 8cqw; line-height: 1; font-weight: 700;
  color: var(--accent); letter-spacing: -0.03em;
  text-shadow: 0 0 30px rgba(217,119,6,0.3);
  margin-bottom: 1cqw;
}
.slide-pane .slide-items {
  display: flex; flex-direction: column; gap: 0.6cqw;
}
.slide-pane .slide-item {
  display: flex; align-items: center; gap: 0.8cqw;
  font-size: 1.4cqw; color: var(--slate-2);
}
.slide-pane .slide-item-icon { font-size: 1.7cqw; }
.slide-pane .slide-broll {
  position: absolute;
  right: 4%; bottom: 6%;
  width: 38%; aspect-ratio: 16/10;
  background: var(--cream-2); border: 1px dashed var(--line);
  border-radius: 4px;
  background-size: cover; background-position: center;
  display: flex; align-items: center; justify-content: center;
  font-size: 1cqw; color: var(--muted);
}
.slide-pane .slide-badges {
  position: absolute; top: 5%; right: 5%;
  display: flex; flex-direction: column; gap: 0.4cqw;
}
.slide-pane .slide-badge {
  display: inline-flex; align-items: center; gap: 0.4cqw;
  padding: 0.5cqw 0.9cqw; border-radius: 999px;
  background: white; border: 1px solid var(--line);
  font-size: 1cqw; box-shadow: 0 2px 6px rgba(0,0,0,0.06);
}
.slide-pane .slide-badge .b-num { font-weight: 700; color: var(--accent); }

.avatar-pane {
  position: relative;
  background: #000;
  overflow: hidden;
  transition: all 0.4s ease-out;
}
.avatar-pane video {
  width: 100%; height: 100%; object-fit: cover; display: block;
  background: #000;
}
.avatar-pane .pane-label {
  position: absolute; top: 12px; left: 12px;
  padding: 4px 10px; background: rgba(0,0,0,0.55);
  border-radius: 999px; font-size: 11px; color: #cbd5e1;
  letter-spacing: 0.08em; text-transform: uppercase;
  pointer-events: none;
}

/* PIP mode: avatar shrinks to corner of slide pane */
.stage.pip-active .slide-pane { grid-column: 1 / span 2; }
.stage.pip-active .avatar-pane {
  position: absolute;
  bottom: 4%; right: 3%;
  width: 22%; aspect-ratio: 1;
  border-radius: 50%;
  border: 4px solid var(--accent);
  box-shadow: 0 12px 32px rgba(0,0,0,0.4), 0 0 30px rgba(217,119,6,0.3);
  z-index: 10;
}

/* Scene info bar above stage */
.scene-info-bar {
  display: flex; align-items: baseline; gap: 16px; flex-wrap: wrap;
  padding: 12px 16px; margin-bottom: 12px;
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
  border-radius: 4px;
}
.scene-info-bar .si-num {
  font-family: 'Tiempos Headline', Georgia, serif; font-size: 24px; font-weight: 700;
  color: #fbbf24;
}
.scene-info-bar .si-kind {
  font-weight: 700; letter-spacing: 0.08em; font-size: 12px;
  padding: 2px 10px; border-radius: 3px;
}
.scene-info-bar .si-time { font-variant-numeric: tabular-nums; color: #94a3b8; font-size: 13px; }
.scene-info-bar .si-vt { color: #fbbf24; font-size: 13px; font-weight: 600; }
.scene-info-bar .si-vt code { background: rgba(251,191,36,0.15); padding: 1px 6px; border-radius: 3px; color: #fbbf24; }
.scene-info-bar .si-meta { color: #cbd5e1; font-size: 13px; }
.scene-info-bar .si-pip-on {
  margin-left: auto; padding: 4px 10px; border-radius: 999px;
  background: var(--accent); color: white; font-weight: 700; font-size: 11px;
  letter-spacing: 0.1em; opacity: 0; transition: opacity 0.2s;
}
.scene-info-bar.pip-mode .si-pip-on { opacity: 1; }

/* Master timeline below stage */
.master-timeline {
  margin-top: 16px;
  display: flex; flex-direction: column; gap: 6px;
}
.master-bar {
  position: relative; height: 36px;
  background: rgba(255,255,255,0.04); border-radius: 4px;
  display: flex; overflow: hidden;
}
.scene-block {
  flex: 1; border-right: 1px solid rgba(255,255,255,0.1);
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; color: #cbd5e1; font-weight: 600; cursor: pointer;
  transition: background 0.2s;
  position: relative;
}
.scene-block:last-child { border-right: none; }
.scene-block:hover { background: rgba(251,191,36,0.15); }
.scene-block.current { background: rgba(251,191,36,0.25); color: #fbbf24; }
.scene-block .pip-hint {
  position: absolute; bottom: 2px; left: 0; right: 0;
  height: 3px; background: rgba(217,119,6,0.5);
}
.master-cursor {
  position: absolute; top: 0; bottom: 0; width: 2px;
  background: #fbbf24; box-shadow: 0 0 8px rgba(251,191,36,0.8);
  pointer-events: none; transition: left 0.05s linear;
}
.master-meta {
  display: flex; justify-content: space-between;
  font-size: 11px; color: #94a3b8; font-variant-numeric: tabular-nums;
}
.preview-help {
  margin-top: 12px; padding: 10px 14px;
  background: rgba(251,191,36,0.08); border: 1px solid rgba(251,191,36,0.25);
  border-radius: 4px; font-size: 12px; color: #fde68a;
}
"""


def render_preview_section(plan: dict, source_mp4: str | None) -> str:
    """Live preview: source.mp4 plays at avatar pane, slide pane reflects current scene."""
    scenes_data = []
    for s in plan["scenes"]:
        b = (s.get("broll") or [{}])[0]
        scenes_data.append({
            "num": s["num"],
            "kind": s["kind"],
            "variant": s["variant"],
            "start": s["start"],
            "end": s["end"],
            "kicker": s.get("kicker", ""),
            "heading": s.get("heading", ""),
            "tier_letter": s.get("tier_letter", ""),
            "items": s.get("items", []),
            "badges": s.get("badges", []),
            "visual_type": b.get("visual_type", ""),
            "visual_type_label": VISUAL_TYPE_LABEL.get(b.get("visual_type", ""), ""),
            "metaphor": b.get("metaphor", ""),
            "broll_image": b.get("placeholder_filename", ""),
            "broll_title": b.get("title_vi", ""),
            "broll_subtitle": b.get("subtitle_vi", ""),
            "pip_events": s.get("pip_events", []),
            "kind_color": KIND_COLOR.get(s["kind"], ("#cbd5e1", "#0f172a"))[0],
            "kind_fg": KIND_COLOR.get(s["kind"], ("#cbd5e1", "#0f172a"))[1],
        })

    scenes_json = json.dumps(scenes_data, ensure_ascii=False)
    total = plan["total_duration"]

    # Master timeline scene blocks (proportional widths)
    blocks = ""
    for sd in scenes_data:
        width_pct = (sd["end"] - sd["start"]) / total * 100
        pip_hint = '<span class="pip-hint"></span>' if sd["pip_events"] else ""
        blocks += (
            f'<div class="scene-block" data-scene-num="{sd["num"]}" '
            f'style="flex: {width_pct:.4f}; background: linear-gradient(180deg, {sd["kind_color"]}30 0%, transparent 100%)" '
            f'onclick="seekToScene({sd["num"]})">'
            f'{sd["num"]}. {html.escape(sd["kind"])}{pip_hint}'
            f'</div>'
        )

    video_html = (
        f'<video id="previewVideo" src="{html.escape(source_mp4)}" controls preload="metadata" playsinline></video>'
        if source_mp4 else
        '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#475569;font-size:13px;text-align:center;padding:16px">source.mp4 không có trong workspace<br><span style="opacity:0.7">Phase 2 (HeyGen) chưa chạy</span></div>'
    )

    return f"""
<section class="preview-section">
  <h2>Live preview · video + slide composition (1920×1080 stage, scaled)</h2>
  <div class="preview-meta">
    Avatar pane: <code>720×1080</code> right ·
    Slide pane: <code>1200×1080</code> left ·
    PIP mode: avatar shrinks to corner during PIP windows
  </div>

  <div class="stage-wrap">
    <div class="scene-info-bar" id="sceneInfo">
      <span class="si-num" id="siNum">—</span>
      <span class="si-kind" id="siKind"></span>
      <span class="si-time" id="siTime"></span>
      <span class="si-vt" id="siVt"></span>
      <span class="si-meta" id="siMeta"></span>
      <span class="si-pip-on">PIP MODE</span>
    </div>

    <div class="stage" id="stage">
      <div class="slide-pane" id="slidePane">
        <div class="slide-kicker" id="slKicker"></div>
        <h3 class="slide-heading" id="slHeading"></h3>
        <div class="slide-tier" id="slTier"></div>
        <div class="slide-items" id="slItems"></div>
        <div class="slide-broll" id="slBroll">b-roll pending</div>
        <div class="slide-badges" id="slBadges"></div>
      </div>
      <div class="avatar-pane">
        <span class="pane-label">talking-head · 720×1080</span>
        {video_html}
      </div>
    </div>

    <div class="master-timeline">
      <div class="master-bar" id="masterBar">
        {blocks}
        <div class="master-cursor" id="masterCursor" style="left: 0%"></div>
      </div>
      <div class="master-meta">
        <span id="curTime">0.00s</span>
        <span>{total:.2f}s total</span>
      </div>
    </div>

    <div class="preview-help">
      Click vào scene block ở timeline để jump. Các vạch cam dưới scene = PIP windows. Khi video chạy vào 1 PIP window → avatar shrink về góc dưới phải dạng tròn. Chi tiết từng scene xem cards bên dưới.
    </div>
  </div>
</section>

<script>
const SCENES = {scenes_json};
const TOTAL = {total};
const video = document.getElementById('previewVideo');
const stage = document.getElementById('stage');
const sceneInfo = document.getElementById('sceneInfo');
const masterCursor = document.getElementById('masterCursor');
const curTimeEl = document.getElementById('curTime');

function findScene(t) {{
  for (const s of SCENES) if (t >= s.start && t < s.end) return s;
  return SCENES[SCENES.length - 1];
}}

function inPipWindow(t, scene) {{
  for (const ev of (scene.pip_events || [])) {{
    if (t >= ev.t_in && t < ev.t_out) return true;
  }}
  return false;
}}

function renderSlide(scene) {{
  document.getElementById('slKicker').textContent = scene.kicker || '';
  document.getElementById('slHeading').textContent = scene.heading || '';
  document.getElementById('slTier').textContent = scene.tier_letter || '';
  document.getElementById('slItems').innerHTML = (scene.items || []).map(it =>
    `<div class="slide-item"><span class="slide-item-icon">${{it.icon}}</span><span>${{it.label}}</span></div>`
  ).join('');
  document.getElementById('slBadges').innerHTML = (scene.badges || []).map(b =>
    `<div class="slide-badge"><span>${{b.icon}}</span><span class="b-num">${{b.num}}</span><span style="color:#64748b;font-size:0.85em">${{b.label}}</span></div>`
  ).join('');
  const broll = document.getElementById('slBroll');
  if (scene.broll_image) {{
    broll.style.backgroundImage = `url("${{scene.broll_image}}")`;
    broll.textContent = '';
    // Test load — fall back to label if 404
    const test = new Image();
    test.onerror = () => {{
      broll.style.backgroundImage = '';
      broll.textContent = `${{scene.broll_image}} (chưa có)`;
    }};
    test.src = scene.broll_image;
  }}

  // Header bar
  document.getElementById('siNum').textContent = scene.num;
  const siKind = document.getElementById('siKind');
  siKind.textContent = scene.kind.toUpperCase();
  siKind.style.background = scene.kind_color;
  siKind.style.color = scene.kind_fg;
  document.getElementById('siTime').textContent = `${{scene.start.toFixed(2)}}s – ${{scene.end.toFixed(2)}}s`;
  document.getElementById('siVt').innerHTML = `${{scene.visual_type_label}} <code>${{scene.visual_type}}</code>`;
  document.getElementById('siMeta').textContent = `→ HyperFrame ${{scene.variant}} · metaphor: ${{scene.metaphor}}`;

  // Master timeline highlight
  document.querySelectorAll('.scene-block').forEach(el => {{
    el.classList.toggle('current', parseInt(el.dataset.sceneNum) === scene.num);
  }});
}}

function update(t) {{
  const scene = findScene(t);
  renderSlide(scene);
  const pip = inPipWindow(t, scene);
  stage.classList.toggle('pip-active', pip);
  sceneInfo.classList.toggle('pip-mode', pip);
  masterCursor.style.left = (t / TOTAL * 100) + '%';
  curTimeEl.textContent = t.toFixed(2) + 's';
}}

function seekToScene(num) {{
  const s = SCENES.find(x => x.num === num);
  if (s && video) {{ video.currentTime = s.start + 0.05; video.play(); }}
  else if (s) {{ update(s.start + 0.05); }}
}}

if (video) {{
  video.addEventListener('timeupdate', () => update(video.currentTime));
  video.addEventListener('loadedmetadata', () => update(0));
  video.addEventListener('seeked', () => update(video.currentTime));
}}
update(0);
</script>
"""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--workspace", "-w", default=".", help="Workspace folder")
    ap.add_argument("--out", default="storyboard.html", help="Output filename (default: storyboard.html)")
    ap.add_argument("--video", default="source.mp4", help="Talking-head MP4 filename to embed (default: source.mp4)")
    args = ap.parse_args()

    workspace = Path(args.workspace).resolve()
    plan_path = workspace / "visual-plan.json"
    if not plan_path.exists():
        print(f"[storyboard] ERROR: {plan_path} not found. Run plan_visuals.py first.", file=sys.stderr)
        sys.exit(1)

    plan = json.loads(plan_path.read_text())
    source_mp4 = args.video if (workspace / args.video).exists() else None
    preview_html = render_preview_section(plan, source_mp4)
    scenes_html = "\n".join(render_scene(s, plan["total_duration"]) for s in plan["scenes"])

    nav_html = " · ".join(
        f'<a href="#scene-{s["num"]}">{s["num"]}. {html.escape(s["kind"])}</a>'
        for s in plan["scenes"]
    )

    out = f"""<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8">
<title>Storyboard · {html.escape(plan['workspace_slug'])}</title>
<style>{CSS}{PREVIEW_CSS}</style>
</head>
<body>
<header class="page-head">
  <h1>Storyboard · {html.escape(plan['workspace_slug'])}</h1>
  <div class="meta">
    Brand: <code>{html.escape(plan.get('brand', '—'))}</code> ·
    Total: {plan['total_duration']:.2f}s ·
    {len(plan['scenes'])} scenes ·
    Schema: <code>{html.escape(plan.get('schema_version', '?'))}</code>
    {' · video: <code>' + html.escape(source_mp4) + '</code>' if source_mp4 else ' · <span style="color:#dc2626">no source.mp4</span>'}
  </div>
  <div class="meta" style="margin-top:8px">{nav_html}</div>
</header>
{preview_html}
<main class="scenes-grid">
{scenes_html}
</main>
</body>
</html>
"""
    out_path = workspace / args.out
    out_path.write_text(out)
    print(f"[storyboard] {out_path} written ({len(plan['scenes'])} scenes, {len(out)} bytes, video: {source_mp4 or 'none'})")


if __name__ == "__main__":
    main()
