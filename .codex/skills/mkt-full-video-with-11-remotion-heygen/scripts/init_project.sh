#!/usr/bin/env bash
# init_project.sh — initialize a Remotion project for a workspace.
#
# What it does:
#   1. Install Remotion deps in skill's template-project ONCE (~150MB, shared node_modules).
#   2. Create <workspace>/remotion-project/ as a symlink farm pointing at the template.
#   3. Symlink workspace assets (source.mp4, voiceover.mp3, overlays.json, captions, sfx)
#      into <workspace>/remotion-project/public/assets/.
#   4. Symlink logo library from skill assets/logos/ into public/assets/logos/.
#
# Usage:
#   scripts/init_project.sh <workspace-path>
#
# After it finishes:
#   cd <workspace>/remotion-project && npm start     # studio
#   cd <workspace>/remotion-project && npx remotion render Root renders/draft.mp4

set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <workspace-path>" >&2
  exit 2
fi

WORKSPACE="$(cd "$1" 2>/dev/null && pwd || true)"
if [[ -z "$WORKSPACE" || ! -d "$WORKSPACE" ]]; then
  echo "ERROR: workspace path '$1' does not exist" >&2
  exit 1
fi

# Skill directory — parent of scripts/
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
TEMPLATE="$SKILL_DIR/template-project"

if [[ ! -d "$TEMPLATE" ]]; then
  echo "ERROR: template-project not found at $TEMPLATE" >&2
  exit 1
fi

# ── Step 1: ensure deps installed (one-time, shared) ─────────────────────────
if [[ ! -d "$TEMPLATE/node_modules/remotion" ]]; then
  echo "→ Installing Remotion dependencies (one-time, ~2 min, ~150MB)..."
  (cd "$TEMPLATE" && npm install --no-audit --no-fund --loglevel=error)
  echo "✓ Dependencies installed."
else
  echo "✓ Remotion deps already installed in $TEMPLATE/node_modules"
fi

# ── Step 2: create symlink farm in workspace ────────────────────────────────
REMO="$WORKSPACE/remotion-project"
mkdir -p "$REMO/public/assets"

# Core project files:
# - src/ MUST be COPIED (not symlinked) — Remotion's bundler resolves the entry file
#   through symlinks back to the template-project root, then bundles its (empty) public/
#   instead of the workspace's. Copying src/ keeps each workspace's bundle root local.
# - package.json / tsconfig.json / remotion.config.ts COPIED for the same reason.
# - node_modules SYMLINKED (heavy ~150MB, deps are stable per skill).
echo "→ Copying template source into workspace (so bundler sees local public/)..."
rm -rf "$REMO/src"
cp -R "$TEMPLATE/src" "$REMO/src"
for f in package.json tsconfig.json remotion.config.ts; do
  if [[ -f "$TEMPLATE/$f" ]]; then
    rm -f "$REMO/$f"  # remove any existing symlink/file before copy
    cp "$TEMPLATE/$f" "$REMO/$f"
  fi
done
# node_modules COPIED (not symlinked). Remotion's bundler walks node_modules
# to determine project root; with a symlink, it resolves back to template-project
# and uses template-project/public/ (empty) instead of workspace's. Copying makes
# the workspace fully self-contained at the cost of ~150MB disk per workspace.
# Uses cp -al on Linux/Mac to hard-link files where possible (fast, low disk).
if [[ -L "$REMO/node_modules" || -e "$REMO/node_modules" ]]; then rm -rf "$REMO/node_modules"; fi
echo "→ Copying node_modules (~150MB, ~5s with hard-links)..."
# -R recursive, -L follow symlinks (in template's deps), -p preserve perms
cp -R "$TEMPLATE/node_modules" "$REMO/node_modules"

# ── Step 3: symlink workspace data into public/assets/ ──────────────────────
echo "→ Linking workspace assets into public/assets/..."

# Core data files COPIED (not symlinked). Remotion's static file server
# does not follow symlinks for public/ assets — fetches return 404. Hard copy
# guarantees the bundler sees the real bytes. JSON files are tiny; MP3 + MP4
# are the largest at ~5-40MB combined per workspace.
for f in voiceover.mp3 source.mp4 overlays.json caption-groups.json; do
  SRC="$WORKSPACE/$f"
  DST="$REMO/public/assets/$f"
  if [[ -f "$SRC" ]]; then
    if [[ -L "$DST" || -e "$DST" ]]; then rm -f "$DST"; fi
    cp "$SRC" "$DST"
    echo "   ✓ $f"
  else
    echo "   ⚠ $f not found at $SRC (Phase 3 packager may not have run yet)"
  fi
done

# ── Step 4: logos (from skill assets) — copy not symlink ────────────────────
LOGO_SRC="$SKILL_DIR/assets/logos"
LOGO_DST="$REMO/public/assets/logos"
if [[ -d "$LOGO_SRC" ]]; then
  if [[ -L "$LOGO_DST" || -e "$LOGO_DST" ]]; then rm -rf "$LOGO_DST"; fi
  cp -R "$LOGO_SRC" "$LOGO_DST"
  LOGO_COUNT=$(find "$LOGO_DST" -maxdepth 1 -type f \( -name '*.svg' -o -name '*.png' -o -name '*.jpg' \) 2>/dev/null | wc -l | tr -d ' ')
  echo "   ✓ logos/ ($LOGO_COUNT files)"
fi

# ── Step 5: SFX (workspace/sfx-bds or workspace/sfx) — copy not symlink ─────
for sfx_candidate in sfx-bds sfx; do
  if [[ -d "$WORKSPACE/$sfx_candidate" ]]; then
    SFX_DST="$REMO/public/assets/sfx"
    if [[ -L "$SFX_DST" || -e "$SFX_DST" ]]; then rm -rf "$SFX_DST"; fi
    cp -R "$WORKSPACE/$sfx_candidate" "$SFX_DST"
    SFX_COUNT=$(find "$SFX_DST" -maxdepth 1 -type f 2>/dev/null | wc -l | tr -d ' ')
    echo "   ✓ sfx/ ← $sfx_candidate/ ($SFX_COUNT files)"
    break
  fi
done

# ── Step 6: optional b-roll — copy not symlink ──────────────────────────────
if [[ -d "$WORKSPACE/broll" ]]; then
  BROLL_DST="$REMO/public/assets/broll"
  if [[ -L "$BROLL_DST" || -e "$BROLL_DST" ]]; then rm -rf "$BROLL_DST"; fi
  cp -R "$WORKSPACE/broll" "$BROLL_DST"
  BROLL_COUNT=$(find "$BROLL_DST" -maxdepth 1 -type f 2>/dev/null | wc -l | tr -d ' ')
  echo "   ✓ broll/ ($BROLL_COUNT files)"
fi

# ── Done ────────────────────────────────────────────────────────────────────
mkdir -p "$REMO/renders"

cat <<EOF

✓ Remotion project ready at:
    $REMO

Next:
    cd "$REMO"
    npm start                                       # Studio preview (localhost:3000)
    npx remotion render Root renders/draft.mp4       # Render draft (~CRF 28)
    npx remotion render Root renders/final.mp4 --crf 18   # Render final

Make sure overlays.json passes validation first:
    python3 "$SKILL_DIR/scripts/validate.py" "$WORKSPACE/overlays.json"
EOF
