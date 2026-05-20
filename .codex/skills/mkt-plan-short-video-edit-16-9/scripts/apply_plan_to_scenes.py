#!/usr/bin/env python3
"""Backward-compat shim: convert visual-plan.json → scenes.json (editor format).

The editor skill `mkt-hyperframe-talking-head-video-16-9` expects scenes.json
with this shape (see its scaffold_project.py):

    { "total_duration": float, "scenes": [{ ...per-archetype content... }] }

Each scene's `content` dict is per-archetype (hook → before_letter/after_letter,
problem → fail_rows, solution → specs, recap → from_value/to_value, cta → gifts).

This shim reads the planner's visual-plan.json and projects each scene into the
editor's expected schema using the planner's tier_letter, items, badges, broll.

Usage:
    python3 apply_plan_to_scenes.py --workspace <dir>
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path


def project_content(scene: dict) -> dict:
    """Translate planner scene → editor's per-archetype content dict."""
    kind = scene.get("kind", "hook")
    items = scene.get("items", [])
    tier = scene.get("tier_letter", "")
    badges = scene.get("badges", [])

    if kind == "hook":
        # Use first 3 items as before_items; afters are derived from
        # last items if present, else a generic positive set.
        before_items = items[:3] if items else []
        after_items = items[3:6] if len(items) > 3 else [
            {"icon": "📝", "label": "Bản nháp"},
            {"icon": "📧", "label": "Email sẵn"},
            {"icon": "✓",  "label": "Sẵn sàng"},
        ]
        # Hook tier_letter often encodes "before glyph"; pull "after" from badges if a green/lime badge present.
        before_letter = tier or "?"
        after_letter = "0h"
        for b in badges:
            if b.get("color") in ("green", "lime") and b.get("num"):
                after_letter = str(b["num"])
                break
        return {
            "before_letter": before_letter,
            "before_label": "⚡ TRƯỚC ĐÂY",
            "before_items": before_items,
            "after_letter": after_letter,
            "after_label": "✓ HÔM NAY",
            "after_items": after_items,
        }

    if kind in ("problem", "fail"):
        # Two AI fail rows (sensible defaults) — planner items become broken-text annotation.
        broken = ", ".join(i.get("label", "") for i in items[:2]) or "Đứt mạch · phải nhắc lại"
        return {
            "eyebrow_color": "orange",
            "user_text": "Câu hỏi/yêu cầu khó",
            "fail_rows": [
                {"name": "CHATGPT", "av": "gpt", "av_letter": "G", "text": "Phản hồi không đạt — đứt mạch"},
                {"name": "GEMINI",  "av": "gem", "av_letter": "✦", "text": "Cần thêm context — phải nhắc lại"},
            ],
            "broken_text": broken,
        }

    if kind in ("solution", "differentiator", "pivot"):
        # Specs: 3 entries from items (or fall back to defaults).
        specs_src = items if len(items) >= 3 else [
            {"icon": "🧠", "label": "Nhớ cuộc trò chuyện dài"},
            {"icon": "📄", "label": "Đọc tài liệu một lần"},
            {"icon": "🌙", "label": "Tự bấm máy thay mình"},
        ]
        specs = []
        spec_letters = ["∞", "100tr", "8h"]
        for i, it in enumerate(specs_src[:3]):
            specs.append({
                "letter": spec_letters[i] if i < len(spec_letters) else "✓",
                "title": it.get("label", ""),
                "sub": "",
                "icon": it.get("icon", "✓"),
            })
        return {
            "eyebrow_color": "violet",
            "orb_label": "CLAUDE AI · giao việc → tự chạy",
            "task_items": items[:4] if items else [],
            "ingest_tag": "📦 Tài liệu dài → 🤖 ingest 1 lần",
            "specs": specs,
        }

    if kind in ("recap", "result", "proof"):
        # Recap counter: pull from_value / to_value from badges if numeric.
        from_value = "40"
        to_value = "25"
        for b in badges:
            num = str(b.get("num", "")).replace("h", "")
            if num.isdigit():
                # Heuristic: first numeric is delta; assume 40 → 40-delta if delta < 30.
                d = int(num)
                if d < 30:
                    to_value = str(40 - d)
                    break
        return {
            "eyebrow_color": "lime",
            "big_letter": tier or "15h",
            "counter_label": "Giờ làm / tuần",
            "from_value": from_value,
            "to_value": to_value,
            "unit": "tiếng",
            "clients": [
                {"av": "N", "title": "Khách mới #1", "sub": "SIGNED · tháng sau"},
                {"av": "T", "title": "Khách mới #2", "sub": "SIGNED · 0 hire thêm"},
            ],
            "delta_text": "−15h/tuần · +2 client · 0 hire",
        }

    if kind == "cta":
        keyword = tier or "AI"
        gifts = []
        for it in items[:2]:
            gifts.append({
                "icon": it.get("icon", "🎁"),
                "title": it.get("label", "Gift"),
                "tag": "FREE",
            })
        if not gifts:
            gifts = [
                {"icon": "🤖", "title": "Cách dùng tool<br/>làm việc thay mình", "tag": "FREE"},
                {"icon": "⚡", "title": "Prompt + quy trình<br/>giao việc cụ thể", "tag": "FREE"},
            ]
        return {
            "eyebrow_color": "pink",
            "big_letter": keyword,
            "keyword": keyword,
            "avatar_letter": "B",
            "gifts": gifts,
            "cta_text": f"👇 LƯU VIDEO · COMMENT {keyword} 👇",
        }

    return {}


def visual_plan_to_scenes_json(plan: dict) -> dict:
    out_scenes = []
    for s in plan.get("scenes", []):
        kind = s.get("kind", "hook")
        # Editor uses "kind: lesson" generic; we keep planner's specific kind
        # since editor's resolve_kind() handles either. Use heading + kicker as-is.
        accent_words = s.get("accent_words", [])
        out_scene = {
            "num": s.get("num"),
            "kind": kind,
            "start": s.get("start"),
            "end": s.get("end"),
            "kicker": s.get("kicker", ""),
            "heading": s.get("heading", ""),
            "accent_words": accent_words,
            "mockup_variant": s.get("variant", "tier-row"),
            "variant": s.get("variant", "tier-row"),
            "brollEnd": round(float(s.get("end", 0)) - 2.6, 2),
            "hasBreath": True,
            "content": project_content(s),
            "badges": s.get("badges", []),
            "pip_events": [
                {"in": e.get("t_in"), "out": e.get("t_out")} for e in s.get("pip_events", [])
            ],
        }
        out_scenes.append(out_scene)
    return {
        "total_duration": plan.get("total_duration", 0),
        "scenes": out_scenes,
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--workspace", "-w", default=".", help="Workspace folder")
    args = ap.parse_args()

    workspace = Path(args.workspace).resolve()
    plan_path = workspace / "visual-plan.json"
    if not plan_path.exists():
        print(f"[apply] ERROR: {plan_path} not found. Run plan_visuals.py first.", file=sys.stderr)
        sys.exit(1)

    plan = json.loads(plan_path.read_text())
    out = visual_plan_to_scenes_json(plan)
    out_path = workspace / "scenes.json"
    out_path.write_text(json.dumps(out, ensure_ascii=False, indent=2))
    print(f"[apply] scenes.json — {len(out['scenes'])} scenes (editor-compatible format).")


if __name__ == "__main__":
    main()
