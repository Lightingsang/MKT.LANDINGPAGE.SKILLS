#!/usr/bin/env python3
"""
validate.py — schema validator for overlays.json

Usage:
    python3 validate.py path/to/overlays.json

Exit codes:
    0  valid (warnings are non-fatal)
    1  one or more errors found
    2  bad CLI args / file not readable

Stdlib only. No external deps.

Checks:
    * Top-level required keys
    * Each overlay: id pattern, variant in allowed set, t_start/duration bounds, per-variant required props
    * Zoom hooks: type + required peak/low/duration
    * SFX cues: t bounds, file present
    * Warnings: overlay overlap at same z-index, missing recommended fields, etc.

Designed to give deterministic, machine-friendly error messages with full paths
(e.g. `overlays[3].text`) so a sub-agent can fix one item at a time.
"""

from __future__ import annotations

import json
import re
import sys
from typing import Any

ALLOWED_VARIANTS = {
    "punch-white",
    "punch-red",
    "punch-yellow",
    "punch-2line",
    "punch-subtle",
    "logo-pill",
    "logo-pill-single",
    "count-up-money",
    "count-up-number",
    "glitch-text",
    "chip-stack",
    "before-after",
    "type-on",
    "comment-bubble",
}

ALLOWED_ZOOM_TYPES = {"soft2step", "quickpop", "doublepop", "zoomout"}

ALLOWED_AESTHETICS = {"broker_creator"}

OVERLAY_ID_RE = re.compile(r"^(o\d{2,3}|overlay-\d{2,3})$")

# Required keys per overlay variant. Each entry: variant -> (required_fields, optional_fields)
VARIANT_REQS: dict[str, tuple[set[str], set[str]]] = {
    "punch-white":     ({"text"},                 set()),
    "punch-red":       ({"text"},                 set()),
    "punch-yellow":    ({"text"},                 set()),
    "punch-2line":     ({"text"},                 set()),
    "punch-subtle":    ({"text"},                 set()),
    "logo-pill":       ({"logos"},                set()),
    "logo-pill-single":({"logo_path"},            {"label"}),
    "count-up-money":  ({"to"},                   {"from", "prefix", "suffix"}),
    "count-up-number": ({"to"},                   {"from", "suffix"}),
    "glitch-text":     ({"text"},                 set()),
    "chip-stack":      ({"chips"},                set()),
    "before-after":    ({"before_text", "after_text"}, set()),
    "type-on":         ({"typed_text"},           {"prompt"}),
    "comment-bubble":  ({"comment_text"},         {"username"}),
}

# Fields every overlay must have regardless of variant
OVERLAY_COMMON = {"id", "variant", "t_start", "duration"}


def _err(errors: list[str], path: str, msg: str) -> None:
    errors.append(f"  ✗ {path}: {msg}")


def _warn(warnings: list[str], path: str, msg: str) -> None:
    warnings.append(f"  ⚠ {path}: {msg}")


def _is_number(v: Any) -> bool:
    return isinstance(v, (int, float)) and not isinstance(v, bool)


def validate_overlay(o: Any, idx: int, video_duration: float, errors: list[str], warnings: list[str]) -> None:
    path = f"overlays[{idx}]"
    if not isinstance(o, dict):
        _err(errors, path, f"must be an object, got {type(o).__name__}")
        return

    # Common required fields
    missing = OVERLAY_COMMON - set(o.keys())
    if missing:
        _err(errors, path, f"missing required keys: {sorted(missing)}")

    oid = o.get("id")
    if oid and not (isinstance(oid, str) and OVERLAY_ID_RE.match(oid)):
        _err(errors, f"{path}.id", f"invalid id '{oid}' (must match {OVERLAY_ID_RE.pattern})")

    variant = o.get("variant")
    if variant not in ALLOWED_VARIANTS:
        _err(errors, f"{path}.variant", f"unknown variant '{variant}' (allowed: {sorted(ALLOWED_VARIANTS)})")
        return  # can't check variant-specific fields if variant is invalid

    t_start = o.get("t_start")
    duration = o.get("duration")
    if not _is_number(t_start) or t_start < 0:
        _err(errors, f"{path}.t_start", f"must be a non-negative number, got {t_start!r}")
    if not _is_number(duration) or duration <= 0:
        _err(errors, f"{path}.duration", f"must be a positive number, got {duration!r}")

    if _is_number(t_start) and _is_number(duration):
        if t_start >= video_duration:
            _err(errors, f"{path}.t_start", f"{t_start} >= video_duration {video_duration} — overlay starts after video ends")
        if t_start + duration > video_duration + 0.05:
            _warn(warnings, path, f"t_start+duration ({t_start + duration:.2f}) overflows video_duration ({video_duration:.2f})")

    # Variant-specific required fields
    req, opt = VARIANT_REQS[variant]
    missing_var = req - set(o.keys())
    if missing_var:
        _err(errors, path, f"variant '{variant}' missing required fields: {sorted(missing_var)}")

    # Per-variant type checks
    if variant == "logo-pill":
        logos = o.get("logos")
        if not isinstance(logos, list) or len(logos) == 0:
            _err(errors, f"{path}.logos", "must be a non-empty array")
        else:
            for li, logo in enumerate(logos):
                if not isinstance(logo, dict) or "path" not in logo:
                    _err(errors, f"{path}.logos[{li}]", "must be an object with required 'path' string")

    if variant == "chip-stack":
        chips = o.get("chips")
        if not isinstance(chips, list) or len(chips) == 0:
            _err(errors, f"{path}.chips", "must be a non-empty array of strings")
        elif not all(isinstance(c, str) for c in chips):
            _err(errors, f"{path}.chips", "all chips must be strings")
        elif len(chips) > 6:
            _warn(warnings, f"{path}.chips", f"{len(chips)} chips — recommended max 5 for visual clarity")

    if variant in {"count-up-money", "count-up-number"}:
        to_v = o.get("to")
        if not _is_number(to_v):
            _err(errors, f"{path}.to", f"must be a number, got {to_v!r}")
        if "from" in o and not _is_number(o["from"]):
            _err(errors, f"{path}.from", f"must be a number, got {o['from']!r}")


def validate_zoom_hook(h: Any, idx: int, video_duration: float, errors: list[str], warnings: list[str]) -> None:
    path = f"zoom_hooks[{idx}]"
    if not isinstance(h, dict):
        _err(errors, path, f"must be an object, got {type(h).__name__}")
        return
    if "t" not in h or "type" not in h:
        _err(errors, path, "missing required keys: 't' and/or 'type'")
        return
    t = h.get("t")
    htype = h.get("type")
    if not _is_number(t) or t < 0:
        _err(errors, f"{path}.t", f"must be a non-negative number, got {t!r}")
    if htype not in ALLOWED_ZOOM_TYPES:
        _err(errors, f"{path}.type", f"unknown type '{htype}' (allowed: {sorted(ALLOWED_ZOOM_TYPES)})")
        return
    if _is_number(t) and t > video_duration:
        _warn(warnings, path, f"t={t} > video_duration={video_duration}")

    if htype in {"soft2step", "quickpop", "doublepop"}:
        peak = h.get("peak")
        if not _is_number(peak):
            _err(errors, f"{path}.peak", f"required for type '{htype}', got {peak!r}")
        else:
            if peak < 1.0:
                _err(errors, f"{path}.peak", f"peak {peak} < 1.0 (use type 'zoomout' for scale < 1)")
            elif peak > 1.15:
                _warn(warnings, f"{path}.peak", f"peak {peak} > 1.15 — looks unnatural (recommended 1.04-1.10)")
    elif htype == "zoomout":
        low = h.get("low")
        dur = h.get("duration")
        if not _is_number(low):
            _err(errors, f"{path}.low", f"required for type 'zoomout', got {low!r}")
        elif low >= 1.0:
            _err(errors, f"{path}.low", f"low {low} >= 1.0 (use 'soft2step'/'quickpop'/'doublepop' for scale > 1)")
        if not _is_number(dur) or dur <= 0:
            _err(errors, f"{path}.duration", f"required positive number for type 'zoomout', got {dur!r}")


def validate_sfx_cue(c: Any, idx: int, video_duration: float, errors: list[str], warnings: list[str]) -> None:
    path = f"sfx_cues[{idx}]"
    if not isinstance(c, dict):
        _err(errors, path, f"must be an object, got {type(c).__name__}")
        return
    if "t" not in c or "file" not in c:
        _err(errors, path, "missing required keys: 't' and/or 'file'")
        return
    t = c.get("t")
    f = c.get("file")
    if not _is_number(t) or t < 0:
        _err(errors, f"{path}.t", f"must be a non-negative number, got {t!r}")
    if not isinstance(f, str) or not f:
        _err(errors, f"{path}.file", f"must be a non-empty string, got {f!r}")
    elif "/" in f:
        _warn(warnings, f"{path}.file", "file should be just a basename (no path); init_project.sh resolves sfx/ for you")
    vol = c.get("volume", 0.3)
    if not _is_number(vol) or not (0.0 <= vol <= 1.0):
        _err(errors, f"{path}.volume", f"must be number in [0,1], got {vol!r}")
    if _is_number(t) and t > video_duration:
        _warn(warnings, path, f"t={t} > video_duration={video_duration}")


def detect_overlap_warnings(overlays: list[dict], warnings: list[str]) -> None:
    """Warn when two overlays overlap in time (potentially fighting for z-index 80)."""
    # Sort by t_start
    sortable = []
    for i, o in enumerate(overlays):
        t = o.get("t_start")
        d = o.get("duration")
        if _is_number(t) and _is_number(d):
            sortable.append((t, t + d, i, o.get("id", f"#{i}"), o.get("variant", "?")))
    sortable.sort()
    for i in range(len(sortable) - 1):
        a_start, a_end, a_idx, a_id, a_var = sortable[i]
        b_start, b_end, b_idx, b_id, b_var = sortable[i + 1]
        if b_start < a_end - 0.05:
            _warn(
                warnings,
                f"overlays[{a_idx}]+overlays[{b_idx}]",
                f"{a_id} ({a_var}) overlaps {b_id} ({b_var}) at t={b_start:.2f}s — same z-index 80 may visually conflict",
            )


def validate(data: Any) -> tuple[list[str], list[str]]:
    errors: list[str] = []
    warnings: list[str] = []

    if not isinstance(data, dict):
        errors.append(f"  ✗ root: must be a JSON object, got {type(data).__name__}")
        return errors, warnings

    # Required top-level keys
    top_required = {"aesthetic", "video_duration", "fps", "width", "height", "assets", "overlays", "zoom_hooks"}
    missing_top = top_required - set(data.keys())
    if missing_top:
        errors.append(f"  ✗ root: missing required keys: {sorted(missing_top)}")

    aesthetic = data.get("aesthetic")
    if aesthetic not in ALLOWED_AESTHETICS:
        _err(errors, "aesthetic", f"unknown aesthetic '{aesthetic}' (allowed: {sorted(ALLOWED_AESTHETICS)})")

    video_duration = data.get("video_duration", 0)
    if not _is_number(video_duration) or video_duration <= 0:
        _err(errors, "video_duration", f"must be a positive number, got {video_duration!r}")
        video_duration = float("inf")  # so per-overlay checks won't all fail

    fps = data.get("fps")
    if not _is_number(fps) or fps <= 0:
        _err(errors, "fps", f"must be a positive number, got {fps!r}")
    elif fps not in (24, 25, 30, 60):
        _warn(warnings, "fps", f"non-standard fps {fps} — typical values are 24/25/30/60")

    width = data.get("width")
    height = data.get("height")
    if not _is_number(width) or width <= 0:
        _err(errors, "width", f"must be a positive number, got {width!r}")
    if not _is_number(height) or height <= 0:
        _err(errors, "height", f"must be a positive number, got {height!r}")
    if _is_number(width) and _is_number(height) and (width, height) != (1080, 1920):
        _warn(warnings, "width/height", f"({width}x{height}) — broker-creator default is 1080×1920 (9:16)")

    # Assets
    assets = data.get("assets")
    if not isinstance(assets, dict):
        _err(errors, "assets", "must be an object")
    else:
        for k in ("source_video", "voiceover"):
            v = assets.get(k)
            if not isinstance(v, str) or not v:
                _err(errors, f"assets.{k}", f"must be a non-empty string, got {v!r}")

    # Overlays
    overlays = data.get("overlays", [])
    if not isinstance(overlays, list):
        _err(errors, "overlays", "must be an array")
    else:
        seen_ids: set[str] = set()
        for i, o in enumerate(overlays):
            validate_overlay(o, i, float(video_duration), errors, warnings)
            if isinstance(o, dict):
                oid = o.get("id")
                if isinstance(oid, str):
                    if oid in seen_ids:
                        _err(errors, f"overlays[{i}].id", f"duplicate id '{oid}'")
                    seen_ids.add(oid)
        detect_overlap_warnings([o for o in overlays if isinstance(o, dict)], warnings)

    # Zoom hooks
    hooks = data.get("zoom_hooks", [])
    if not isinstance(hooks, list):
        _err(errors, "zoom_hooks", "must be an array")
    else:
        for i, h in enumerate(hooks):
            validate_zoom_hook(h, i, float(video_duration), errors, warnings)
        # Rhythm warning: gap > 4s
        ts = sorted([h["t"] for h in hooks if isinstance(h, dict) and _is_number(h.get("t"))])
        for i in range(len(ts) - 1):
            gap = ts[i + 1] - ts[i]
            if gap > 4.0:
                _warn(warnings, "zoom_hooks", f"gap of {gap:.1f}s between t={ts[i]:.2f} and t={ts[i + 1]:.2f} (rule: ≤ 4s)")

    # SFX cues (optional)
    sfx = data.get("sfx_cues", [])
    if sfx:
        if not isinstance(sfx, list):
            _err(errors, "sfx_cues", "must be an array")
        else:
            if len(sfx) > 6:
                _warn(warnings, "sfx_cues", f"{len(sfx)} cues — recommended max 6 per 60s video to avoid noise")
            for i, c in enumerate(sfx):
                validate_sfx_cue(c, i, float(video_duration), errors, warnings)

    return errors, warnings


def main(argv: list[str]) -> int:
    if len(argv) != 2:
        print("Usage: validate.py <path-to-overlays.json>", file=sys.stderr)
        return 2
    path = argv[1]
    try:
        with open(path, "r", encoding="utf-8") as fh:
            data = json.load(fh)
    except FileNotFoundError:
        print(f"ERROR: file not found: {path}", file=sys.stderr)
        return 2
    except json.JSONDecodeError as e:
        print(f"ERROR: invalid JSON: {e}", file=sys.stderr)
        return 1
    except OSError as e:
        print(f"ERROR: cannot read file: {e}", file=sys.stderr)
        return 2

    errors, warnings = validate(data)

    if warnings:
        print("Warnings:")
        for w in warnings:
            print(w)
    if errors:
        print(f"\nErrors ({len(errors)}):")
        for e in errors:
            print(e)
        print(f"\nVALIDATION FAILED — {len(errors)} error(s), {len(warnings)} warning(s)")
        return 1

    print(f"\nVALIDATION OK — 0 errors, {len(warnings)} warning(s)")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
