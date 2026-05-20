# Logo library

Drop SVG (or PNG) logo files into this folder. Filenames must be ASCII (no spaces, no diacritics, lowercase preferred).

The Phase 3 packager references logos by basename in `overlays.json`, e.g.:

```jsonc
{ "variant": "logo-pill", "logos": [
  { "path": "vinhomes.svg", "label": "VINHOMES" }
] }
```

The `init_project.sh` script symlinks this folder into `<workspace>/remotion-project/public/assets/logos/`, so `staticFile('logos/vinhomes.svg')` works in any workspace.

## Expected files for BĐS pipeline

These are the basenames referenced by the variant catalog. Add the actual SVGs as you acquire them — missing logos render a broken `<img>` tag (visible in DevTools) but don't crash the layout.

### Real-estate brands (chủ đầu tư)
- `vinhomes.svg` — Vinhomes
- `masterise.svg` — Masterise Homes
- `vingroup.svg` — Vingroup
- `sun-group.svg` — Sun Group
- `novaland.svg` — Novaland
- `ecopark.svg` — Ecopark
- `gamuda.svg` — Gamuda Land

### Project pillars (sub-brand)
- `lumiere.svg` — Lumière (Masterise)
- `the-zen-residences.svg` — The Zen Residences

### AI / tools (for non-BĐS videos)
- `claude.svg` — Anthropic Claude
- `gmail.svg` — Gmail
- `slack.svg` — Slack
- `drive.svg` — Google Drive
- `excel.svg` — Microsoft Excel
- `ppt.svg` — PowerPoint

## Sizing guidelines

- **Prefer SVG** (vector — sharp at any zoom).
- If using PNG, render at ≥ 256×256 px (the `LogoPill` component renders at 120 px, but Retina previews and re-encoding for h264 benefit from larger source).
- Logos should have transparent background (the pill container has a black 85% bg behind them).
- Trim whitespace tightly — the component centers the logo in a square box, extra padding makes logos appear smaller than they should.
