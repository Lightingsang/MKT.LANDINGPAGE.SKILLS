#!/usr/bin/env python3
"""Render prompts.md from visual-plan.json.

Reads each scene's broll[] entries with kind == "infographic-cream-paper",
renders a cream-paper editorial prompt via Jinja2 template, writes them
numbered (1.png, 2.png, …) into <workspace>/prompts.md.

Usage:
    python3 render_infographic_prompts.py --workspace <dir>
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

try:
    from jinja2 import Environment, FileSystemLoader
except ImportError:
    print("[render] jinja2 missing — pip install jinja2", file=sys.stderr)
    sys.exit(1)


SCRIPT_DIR = Path(__file__).resolve().parent
TEMPLATES_DIR = SCRIPT_DIR.parent / "assets" / "templates"


HEADER = """# Image prompts — visual-plan b-roll

Cinematic 3D + holographic UI style — Transform Group / Anthropic key-visual aesthetic. Dark navy / space-blue environments with floating holographic glass panels, neon edge-glow, glowing connector beams, numbered annotations, depth-of-field bokeh, volumetric haze. NOT flat infographic, NOT hand-drawn — photoreal 3D scene with composited UI overlays.

**How to use:** copy each prompt below, paste into AI33 / Nano Banana Pro / Midjourney. Save returned image into this same folder with the matching filename (`1.png`, `2.png`, …). HyperFrames editor's `<img onerror>` fallback will auto-render once present.

**Footer:** every image ends with `@tranvanhoang.com` in uppercase letterspaced light-grey type at bottom-center (film credit feel).

**Aspect:** 16:10 by default (AI33 uses `16:9` ≈ 1344×768 since it doesn't support 16:10 natively).
"""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--workspace", "-w", default=".", help="Workspace folder")
    args = ap.parse_args()

    workspace = Path(args.workspace).resolve()
    plan_path = workspace / "visual-plan.json"
    if not plan_path.exists():
        print(f"[render] ERROR: {plan_path} not found. Run plan_visuals.py first.", file=sys.stderr)
        sys.exit(1)

    plan = json.loads(plan_path.read_text())

    env = Environment(
        loader=FileSystemLoader(str(TEMPLATES_DIR)),
        autoescape=False,
        trim_blocks=True,
        lstrip_blocks=True,
    )
    tpl = env.get_template("infographic-prompt.j2")

    out_lines: list[str] = [HEADER]
    count = 0
    brand = plan.get("brand", "claude")
    brand_label_map = {
        "claude":   "CLAUDE, ANTHROPIC",
        "deepseek": "DEEPSEEK, MIT",
        "openai":   "OPENAI, GPT, CHATGPT",
        "gemini":   "GEMINI, GOOGLE",
        "generic":  "AI",
    }
    brand_list = brand_label_map.get(brand, "CLAUDE, ANTHROPIC")

    for scene in plan.get("scenes", []):
        for b in scene.get("broll", []) or []:
            if b.get("kind") != "infographic-cream-paper":
                continue
            count += 1
            fname = b.get("placeholder_filename", f"{count}.png")
            out_lines.append(f"\n---\n\n## {fname} — {b.get('title_vi', 'TODO')}\n")
            out_lines.append(
                f"[Aspect: {b.get('aspect', '16:10')} · Provider gợi ý: AI33 / Nano Banana Pro · "
                f"Visual type: `{b.get('visual_type', 'three-pillar')}` · Metaphor: `{b.get('metaphor', 'custom')}` · "
                f"Scene: {scene.get('num')} ({scene.get('kind')})]\n"
            )
            prompt = tpl.render(
                visual_type=b.get("visual_type", "three-pillar"),
                title_vi=b.get("title_vi", ""),
                subtitle_vi=b.get("subtitle_vi", ""),
                brand_list=brand_list,
                tech_or_symbols="currency/math symbols ($, %, ×, ₫, →)",
                layout_description=b.get("layout_description", ""),
                decorative_elements=b.get("decorative_elements", ""),
                palette_accents=b.get("palette_accents", ["claude-orange", "amber"]),
                metaphor_name=b.get("metaphor", "custom"),
                aspect=b.get("aspect", "16:10"),
            )
            out_lines.append(prompt)

    if count == 0:
        out_lines.append("\n_(No infographic-cream-paper b-roll entries in visual-plan.json. Nothing to render.)_\n")

    out_path = workspace / "prompts.md"
    out_path.write_text("\n".join(out_lines))
    print(f"[render] prompts.md — {count} prompts written to {out_path}")


if __name__ == "__main__":
    main()
