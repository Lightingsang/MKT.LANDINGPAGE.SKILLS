# Punch Text Effects — GSAP Implementations

All effects use GSAP 3.14.2 (already CDN-loaded in HF compositions via `<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>`).

These are the OPPOSITE of the deprecated luxury editorial 1.2-1.8s fades — they are FAST (0.30-0.45s in, 0.20-0.35s out) and POPPY (back-out easing with overshoot). Anything slower reads as sluggish on the broker-creator aesthetic.

The HF runtime calls these on scene-enter (when the clip becomes active). Pattern: a single IIFE inside `<script>` at the bottom of each composition, runs once on font-load and sets up a paused GSAP timeline registered to `window.__timelines[composition-id]`. The HF runtime then scrubs the timeline against the parent timeline.

---

## Boilerplate — every composition script block

```js
(function() {
  function run() {
    const root = document.querySelector('[data-composition-id="overlay-XX"]');
    if (!root || !window.gsap) return;
    const el = root.querySelector('.punch');      // or .stack, .line, etc.
    const tl = gsap.timeline({ paused: true });
    window.__timelines = window.__timelines || {};
    window.__timelines['overlay-XX'] = tl;
    const DUR = parseFloat(root.getAttribute('data-duration')) || 2.5;

    /* effect timeline goes here */
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(run);
  else run();
})();
```

`data-duration` is read from the root `<div>` (HF copies the mount's `data-duration` onto the composition root) — let GSAP know when to fade out so the punch doesn't linger past its clip window.

---

## 1. `scale-pop-in` — Default punch entrance

The base effect for every punch overlay. Scale from 0.7 → 1.05 (overshoot) → 1.0 (settle). Pairs with slight rotation for energy.

```js
tl.fromTo(el,
    { scale: 0.7, opacity: 0, rotate: -3 },
    { scale: 1.05, opacity: 1, rotate: 0, duration: 0.35, ease: 'back.out(2)' }, 0)
  .to(el,
    { scale: 1.0, duration: 0.15, ease: 'power2.inOut' }, 0.35)
  .to(el,
    { opacity: 0, scale: 0.95, duration: 0.30, ease: 'power2.in' }, Math.max(0.5, DUR - 0.30));
```

Parameters:
- `back.out(2)` overshoot: tweak to `back.out(2.4)` for extra punch (red/yellow variants), `back.out(1.6)` for subtle.
- Initial `rotate: -3` to `+4`: pick sign + magnitude per variant to add micro-variety across consecutive punches.
- Initial `scale: 0.7`: drop to `0.5` for prices (more dramatic), raise to `0.85` for subtle.

---

## 2. `pop-in-with-jiggle` — Price urgency variant

Adds a tiny rotation oscillation on hold for sustained energy. Use on `punch-red` price drops where the number stays on screen 2+ seconds.

```js
tl.fromTo(el,
    { scale: 0.5, opacity: 0, rotate: -6, y: -30 },
    { scale: 1.10, opacity: 1, rotate: 0, y: 0, duration: 0.40, ease: 'back.out(2.4)' }, 0)
  .to(el, { scale: 1.0, duration: 0.18, ease: 'power2.inOut' }, 0.40)
  .to(el, { rotate: 1.5, duration: 0.20, ease: 'sine.inOut', yoyo: true, repeat: 5 }, 0.60)
  .to(el, { opacity: 0, scale: 0.92, duration: 0.30, ease: 'power2.in' }, Math.max(0.7, DUR - 0.30));
```

The `yoyo: true, repeat: 5` adds 6 half-cycles of ±1.5° wobble over the hold period.

---

## 3. `slide-in-fade` — Subtle clarification

For `punch-subtle` under-titles. No scale animation — just slide from left + fade.

```js
tl.fromTo(el,
    { opacity: 0, x: -20 },
    { opacity: 1, x: 0, duration: 0.50, ease: 'power3.out' }, 0)
  .to(el, { opacity: 0, x: -10, duration: 0.30, ease: 'power2.in' }, Math.max(0.6, DUR - 0.30));
```

---

## 4. `stack-stagger` — Two-line question reveal

For `punch-2line` Q/contrast layouts. Each line pops separately with 0.30s stagger.

```js
const lines = root.querySelectorAll('.line');
tl.fromTo(lines[0],
    { scale: 0.7, opacity: 0, rotate: -2 },
    { scale: 1.05, opacity: 1, rotate: 0, duration: 0.35, ease: 'back.out(2)' }, 0)
  .to(lines[0], { scale: 1.0, duration: 0.15, ease: 'power2.inOut' }, 0.35)
  .fromTo(lines[1],
    { scale: 0.7, opacity: 0, rotate: 2 },
    { scale: 1.05, opacity: 1, rotate: 0, duration: 0.35, ease: 'back.out(2)' }, 0.30)
  .to(lines[1], { scale: 1.0, duration: 0.15, ease: 'power2.inOut' }, 0.65)
  .to(lines, { opacity: 0, scale: 0.95, duration: 0.30, ease: 'power2.in' }, Math.max(0.8, DUR - 0.30));
```

Notice rotate sign flips between lines (-2 then +2) — creates a "see-saw" effect that pulls the eye between the contrasting halves.

---

## 5. `broll-fade-in-out` — Full-screen b-roll insert

For optional b-roll compositions. Image fades in, text overlays on top scale-pop, all fade out together.

```js
const img = root.querySelector('.img');
const punch = root.querySelector('.punch');
tl.fromTo(img,
    { opacity: 0 },
    { opacity: 1, duration: 0.35, ease: 'power2.out' }, 0)
  .fromTo(punch,
    { scale: 0.7, opacity: 0, rotate: -2 },
    { scale: 1.05, opacity: 1, rotate: 0, duration: 0.40, ease: 'back.out(2)' }, 0.30)
  .to(punch, { scale: 1.0, duration: 0.15 }, 0.70)
  .to([img, punch], { opacity: 0, duration: 0.30, ease: 'power2.in' }, Math.max(0.8, DUR - 0.30));
```

The CSS `@keyframes kb` continuous ken-burns runs independently — no GSAP needed for the slow zoom.

---

## Avatar zoom hooks (parent timeline in index.html)

Subtle punch-in on the avatar at emphasis beats. Lives in the parent index.html's `<script>` block, NOT inside a composition. Goes after the existing tl setup.

```js
// Transform-origin so zoom centers around the face
gsap.set("#v-source", { transformOrigin: "center 30%" });

const ZOOM_HOOKS = [
  { t: 0.11,  peak: 1.18, dur: 0.65 },  // opening brand hook
  { t: 5.51,  peak: 1.12, dur: 0.55 },  // reveal moment
  { t: 24.48, peak: 1.15, dur: 0.70 },  // brand stamp
  { t: 34.63, peak: 1.20, dur: 0.70 },  // price drop (use HARD peak for prices)
  { t: 43.08, peak: 1.10, dur: 0.55 },  // punchline
  { t: 55.89, peak: 1.18, dur: 0.70 },  // CTA
  // ... 6-10 hooks per video, pair each with a text-overlay punch at same timestamp
];

ZOOM_HOOKS.forEach(({ t, peak, dur }) => {
  const inDur = dur * 0.4;
  const outDur = dur * 0.6;
  tl.to("#v-source", { scale: peak, duration: inDur, ease: "power3.out" }, t);
  tl.to("#v-source", { scale: 1.0,  duration: outDur, ease: "power2.inOut" }, t + inDur);
});
```

**Peak guidance**:
- `1.05-1.08` — soft, ambient breathing or supporting beats
- `1.10-1.12` — medium, value reveals
- `1.15-1.18` — strong, brand reveals & headline beats
- `1.18-1.22` — hard, prices and CTA only (use sparingly, 2-3x per video max)

Pair every zoom hook with a text-overlay punch at the same `t` for maximum impact.

---

## SFX timing pattern (parent timeline)

For each punch + zoom moment, lay an SFX layer:

```html
<audio id="sfx-01" data-start="0.11" data-duration="0.6"
       data-track-index="20" data-volume="0.35"
       src="sfx/camera-flash.mp3"></audio>
<audio id="sfx-02" data-start="5.51" data-duration="0.7"
       data-track-index="21" data-volume="0.28"
       src="sfx/Whoosh sound effect (1).mp3"></audio>
<audio id="sfx-03" data-start="24.48" data-duration="0.9"
       data-track-index="22" data-volume="0.32"
       src="sfx/Laser.mp3"></audio>
<audio id="sfx-04" data-start="34.63" data-duration="0.6"
       data-track-index="23" data-volume="0.30"
       src="sfx/camera-flash.mp3"></audio>
<audio id="sfx-05" data-start="43.08" data-duration="0.5"
       data-track-index="24" data-volume="0.26"
       src="sfx/búng tay.mp3"></audio>
<audio id="sfx-06" data-start="55.89" data-duration="1.2"
       data-track-index="25" data-volume="0.36"
       src="sfx/Discord Notification - Sound Effect.mp3"></audio>
```

Volume range `0.22-0.36`. Don't mask voiceover.

SFX palette mapping:
- `camera-flash` → reveals (brand, price)
- `búng tay` → punchline snap
- `Laser` → big stamp moment (1x per video max)
- `ting` → number / highlight ping
- `Whoosh` → transitions / urgency push
- `Discord Notification` → CTA chime (1x per video at end)

---

## Common pitfalls (and how to avoid)

1. **Easing too soft** → looks editorial / sluggish. Use `back.out(2)` minimum; `back.out(2.4)` for prices. Avoid `power3.inOut` for entrance (save for the slow editorial style).

2. **Scale start too high** (e.g., 0.9 → 1.0) → no perceptible pop. Drop start to 0.6-0.7 for noticeable scale change.

3. **No rotation variety** → mechanical feel when overlays pile up. Alternate rotate signs across consecutive overlays (-3, +4, -2, +5, ...).

4. **Holding too long** → viewer reads it twice. Match `DUR` to what speaker says — when speaker moves to next thought, fade out.

5. **Overlapping punches** → mess. Two punches at the same z-index can collide if positions overlap. Use different `top:` / `bottom:` per consecutive punch, or stagger so they don't co-exist on screen.

6. **GSAP target not found** → silent fail. Always wrap in `if (!root || !window.gsap) return;` and use `document.fonts.ready.then(run)` so fonts and DOM are ready.

7. **`paused: true` missing** → timeline auto-plays at composition load, ignoring parent scrub. Always `gsap.timeline({ paused: true })`.

8. **Forgetting to register `window.__timelines[id] = tl`** → HF runtime can't find it → animation doesn't run during render. Always register.
