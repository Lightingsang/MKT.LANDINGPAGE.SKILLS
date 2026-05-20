# Broker-Creator Punchy — Text Overlay Variants

Each text overlay is a complete HF composition wrapped in `<template id="overlay-XX-template">`. Drop CSS vars from `design-tokens.css` `:root` block into each `<style>`. All variants assume canvas `1080 × 1920` (9:16 portrait, HF default), avatar full-frame underneath at z-index 1, overlay mount at z-index 80-90.

**Critical rule**: composition root `<div>` must use `data-composition-id="..."` attribute, and ALL CSS selectors must match it as **attribute selector** `[data-composition-id="..."]`, NOT id selector `#...`. HF runtime strips the `id` attribute on mount; `#id` selector fails silently → invisible composition.

---

## 1. `punch-white` — Headlines, brand names, locations

Big white text with thick black stroke, top-center default. Hold 1.5-3s, fade out.

```html
<template id="overlay-punch-white-template">
  <div data-composition-id="overlay-punch-white" data-start="0" data-width="1080" data-height="1920">
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@600;800;900&display=swap" rel="stylesheet" />
    <style>
      [data-composition-id="overlay-punch-white"] {
        width: 100%; height: 100%;
        position: relative; overflow: hidden;
        background: transparent;
        pointer-events: none;
        font-family: 'Be Vietnam Pro', system-ui, sans-serif;
      }
      [data-composition-id="overlay-punch-white"] .punch {
        position: absolute;
        top: 120px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 150px;
        font-weight: 900;
        line-height: 0.95;
        text-transform: uppercase;
        text-align: center;
        white-space: nowrap;
        color: #ffffff;
        -webkit-text-stroke: 7px #000;
        paint-order: stroke fill;
        text-shadow:
          0 6px 0 rgba(0,0,0,0.40),
          0 10px 24px rgba(0,0,0,0.30);
        will-change: transform, opacity;
      }
    </style>
    <div class="punch">VINHOMES CAO XÀ LÁ</div>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <script>
      (function() {
        function run() {
          const root = document.querySelector('[data-composition-id="overlay-punch-white"]');
          if (!root || !window.gsap) return;
          const el = root.querySelector('.punch');
          const tl = gsap.timeline({ paused: true });
          window.__timelines = window.__timelines || {};
          window.__timelines['overlay-punch-white'] = tl;
          const DUR = parseFloat(root.getAttribute('data-duration')) || 2.5;
          tl.fromTo(el,
              { scale: 0.7, opacity: 0, rotate: -3 },
              { scale: 1.08, opacity: 1, rotate: 0, duration: 0.35, ease: 'back.out(2)' }, 0)
            .to(el, { scale: 1.0, duration: 0.15, ease: 'power2.inOut' }, 0.35)
            .to(el, { opacity: 0, scale: 0.95, duration: 0.30, ease: 'power2.in' }, Math.max(0.5, DUR - 0.30));
        }
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(run);
        else run();
      })();
    </script>
  </div>
</template>
```

Variations: change `top:` to `bottom: 380px` for bottom-center placement. Reduce `font-size` to 110px if text exceeds 2-3 words.

---

## 2. `punch-red` — Prices, big numbers, urgency dollars

Red `#e63946` text with white stroke. Use for THE PRICE moment — 1 per video typical.

```html
<template id="overlay-punch-red-template">
  <div data-composition-id="overlay-punch-red" data-start="0" data-width="1080" data-height="1920">
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@800;900&display=swap" rel="stylesheet" />
    <style>
      [data-composition-id="overlay-punch-red"] {
        width: 100%; height: 100%;
        position: relative; overflow: hidden;
        background: transparent;
        pointer-events: none;
        font-family: 'Be Vietnam Pro', system-ui, sans-serif;
      }
      [data-composition-id="overlay-punch-red"] .punch {
        position: absolute;
        top: 160px;
        left: 80px;
        font-size: 180px;
        font-weight: 900;
        line-height: 0.92;
        text-transform: uppercase;
        white-space: nowrap;
        color: #e63946;
        -webkit-text-stroke: 7px #ffffff;
        paint-order: stroke fill;
        text-shadow:
          0 6px 0 rgba(0,0,0,0.40),
          0 12px 28px rgba(0,0,0,0.45);
        will-change: transform, opacity;
      }
      [data-composition-id="overlay-punch-red"] .punch .unit {
        font-size: 0.55em;
        margin-left: 0.1em;
        color: #ffffff;
        -webkit-text-stroke: 5px #e63946;
      }
    </style>
    <div class="punch">120<span class="unit">TR/M²</span></div>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <script>
      (function() {
        function run() {
          const root = document.querySelector('[data-composition-id="overlay-punch-red"]');
          if (!root || !window.gsap) return;
          const el = root.querySelector('.punch');
          const tl = gsap.timeline({ paused: true });
          window.__timelines = window.__timelines || {};
          window.__timelines['overlay-punch-red'] = tl;
          const DUR = parseFloat(root.getAttribute('data-duration')) || 3.0;
          tl.fromTo(el,
              { scale: 0.5, opacity: 0, rotate: -6, y: -30 },
              { scale: 1.10, opacity: 1, rotate: 0, y: 0, duration: 0.40, ease: 'back.out(2.4)' }, 0)
            .to(el, { scale: 1.0, duration: 0.18, ease: 'power2.inOut' }, 0.40)
            .to(el, { rotate: 1.5, duration: 0.20, ease: 'sine.inOut', yoyo: true, repeat: 5 }, 0.6)
            .to(el, { opacity: 0, scale: 0.92, duration: 0.30, ease: 'power2.in' }, Math.max(0.7, DUR - 0.30));
        }
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(run);
        else run();
      })();
    </script>
  </div>
</template>
```

The `.jiggle` rotation oscillation (line `tl.to(el, { rotate: 1.5, ... yoyo: true, repeat: 5 })`) adds urgency-feeling energy. Drop it if too aggressive.

---

## 3. `punch-yellow` — Urgency keywords ("1 TUẦN", "HÔM NAY")

Yellow `#f5c518` text with black stroke. Use for time-pressure moments.

```html
<template id="overlay-punch-yellow-template">
  <div data-composition-id="overlay-punch-yellow" data-start="0" data-width="1080" data-height="1920">
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@800;900&display=swap" rel="stylesheet" />
    <style>
      [data-composition-id="overlay-punch-yellow"] {
        width: 100%; height: 100%;
        position: relative; overflow: hidden;
        background: transparent;
        pointer-events: none;
        font-family: 'Be Vietnam Pro', system-ui, sans-serif;
      }
      [data-composition-id="overlay-punch-yellow"] .punch {
        position: absolute;
        top: 200px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 160px;
        font-weight: 900;
        line-height: 0.95;
        text-transform: uppercase;
        text-align: center;
        white-space: nowrap;
        color: #f5c518;
        -webkit-text-stroke: 6px #000;
        paint-order: stroke fill;
        text-shadow:
          0 6px 0 rgba(0,0,0,0.40),
          0 10px 24px rgba(0,0,0,0.30);
        will-change: transform, opacity;
      }
    </style>
    <div class="punch">1 TUẦN NỮA</div>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <script>
      (function() {
        function run() {
          const root = document.querySelector('[data-composition-id="overlay-punch-yellow"]');
          if (!root || !window.gsap) return;
          const el = root.querySelector('.punch');
          const tl = gsap.timeline({ paused: true });
          window.__timelines = window.__timelines || {};
          window.__timelines['overlay-punch-yellow'] = tl;
          const DUR = parseFloat(root.getAttribute('data-duration')) || 2.5;
          tl.fromTo(el,
              { scale: 0.7, opacity: 0, rotate: 4 },
              { scale: 1.06, opacity: 1, rotate: 0, duration: 0.35, ease: 'back.out(2)' }, 0)
            .to(el, { scale: 1.0, duration: 0.15, ease: 'power2.inOut' }, 0.35)
            .to(el, { opacity: 0, scale: 0.95, duration: 0.30, ease: 'power2.in' }, Math.max(0.5, DUR - 0.30));
        }
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(run);
        else run();
      })();
    </script>
  </div>
</template>
```

---

## 4. `punch-2line` — Question / contrast stacked text

2-line stacked layout for contrast questions like "Món hời / Bẫy truyền thông?". Lines reveal staggered by 0.2s.

```html
<template id="overlay-punch-2line-template">
  <div data-composition-id="overlay-punch-2line" data-start="0" data-width="1080" data-height="1920">
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@800;900&display=swap" rel="stylesheet" />
    <style>
      [data-composition-id="overlay-punch-2line"] {
        width: 100%; height: 100%;
        position: relative; overflow: hidden;
        background: transparent;
        pointer-events: none;
        font-family: 'Be Vietnam Pro', system-ui, sans-serif;
      }
      [data-composition-id="overlay-punch-2line"] .stack {
        position: absolute;
        bottom: 380px;
        left: 0; right: 0;
        text-align: center;
      }
      [data-composition-id="overlay-punch-2line"] .line {
        display: block;
        font-size: 120px;
        font-weight: 900;
        line-height: 1.05;
        text-transform: none;
        color: #ffffff;
        -webkit-text-stroke: 6px #000;
        paint-order: stroke fill;
        text-shadow:
          0 5px 0 rgba(0,0,0,0.40),
          0 8px 20px rgba(0,0,0,0.30);
        will-change: transform, opacity;
        white-space: nowrap;
      }
      [data-composition-id="overlay-punch-2line"] .line + .line {
        margin-top: 14px;
      }
    </style>
    <div class="stack">
      <span class="line">Món hời?</span>
      <span class="line">Bẫy truyền thông?</span>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <script>
      (function() {
        function run() {
          const root = document.querySelector('[data-composition-id="overlay-punch-2line"]');
          if (!root || !window.gsap) return;
          const lines = root.querySelectorAll('.line');
          const tl = gsap.timeline({ paused: true });
          window.__timelines = window.__timelines || {};
          window.__timelines['overlay-punch-2line'] = tl;
          const DUR = parseFloat(root.getAttribute('data-duration')) || 3.0;
          tl.fromTo(lines[0],
              { scale: 0.7, opacity: 0, rotate: -2 },
              { scale: 1.05, opacity: 1, rotate: 0, duration: 0.35, ease: 'back.out(2)' }, 0)
            .to(lines[0], { scale: 1.0, duration: 0.15, ease: 'power2.inOut' }, 0.35)
            .fromTo(lines[1],
              { scale: 0.7, opacity: 0, rotate: 2 },
              { scale: 1.05, opacity: 1, rotate: 0, duration: 0.35, ease: 'back.out(2)' }, 0.30)
            .to(lines[1], { scale: 1.0, duration: 0.15, ease: 'power2.inOut' }, 0.65)
            .to(lines, { opacity: 0, scale: 0.95, duration: 0.30, ease: 'power2.in' }, Math.max(0.8, DUR - 0.30));
        }
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(run);
        else run();
      })();
    </script>
  </div>
</template>
```

---

## 5. `punch-subtle` — Clarification / subtitle under main punch

Semi-transparent white, smaller, no text-stroke. Pairs with `punch-red` or `punch-yellow` directly above.

```html
<template id="overlay-punch-subtle-template">
  <div data-composition-id="overlay-punch-subtle" data-start="0" data-width="1080" data-height="1920">
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@500;600&display=swap" rel="stylesheet" />
    <style>
      [data-composition-id="overlay-punch-subtle"] {
        width: 100%; height: 100%;
        position: relative; overflow: hidden;
        background: transparent;
        pointer-events: none;
        font-family: 'Be Vietnam Pro', system-ui, sans-serif;
      }
      [data-composition-id="overlay-punch-subtle"] .subtle {
        position: absolute;
        top: 380px;
        left: 80px;
        font-size: 80px;
        font-weight: 600;
        line-height: 1.02;
        color: rgba(255, 255, 255, 0.95);
        -webkit-text-stroke: 3px #000;
        paint-order: stroke fill;
        text-shadow: 0 3px 12px rgba(0, 0, 0, 0.35);
        will-change: transform, opacity;
        max-width: 920px;
      }
    </style>
    <div class="subtle">Vinhomes Cao Xà Lá</div>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <script>
      (function() {
        function run() {
          const root = document.querySelector('[data-composition-id="overlay-punch-subtle"]');
          if (!root || !window.gsap) return;
          const el = root.querySelector('.subtle');
          const tl = gsap.timeline({ paused: true });
          window.__timelines = window.__timelines || {};
          window.__timelines['overlay-punch-subtle'] = tl;
          const DUR = parseFloat(root.getAttribute('data-duration')) || 2.5;
          tl.fromTo(el,
              { opacity: 0, x: -20 },
              { opacity: 1, x: 0, duration: 0.50, ease: 'power3.out' }, 0)
            .to(el, { opacity: 0, x: -10, duration: 0.30, ease: 'power2.in' }, Math.max(0.6, DUR - 0.30));
        }
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(run);
        else run();
      })();
    </script>
  </div>
</template>
```

---

## 6. Full-screen b-roll insert (optional)

Used sparingly (1-3 per 60s video) when an actual photo/video b-roll makes editorial sense. Takes over the full 1080×1920 canvas at z-index 70 for 2-5s. Optionally overlay a punch text on top of the b-roll.

```html
<template id="broll-01-template">
  <div data-composition-id="broll-01" data-start="0" data-width="1080" data-height="1920">
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@800;900&display=swap" rel="stylesheet" />
    <style>
      [data-composition-id="broll-01"] {
        width: 100%; height: 100%;
        position: relative; overflow: hidden;
        background: #000;
        font-family: 'Be Vietnam Pro', system-ui, sans-serif;
      }
      [data-composition-id="broll-01"] .img {
        position: absolute; inset: 0;
        width: 100%; height: 100%;
        object-fit: cover;
        animation: kb 6s ease-in-out infinite alternate;
        will-change: transform;
      }
      @keyframes kb {
        from { transform: scale(1.04); }
        to   { transform: scale(1.12); }
      }
      [data-composition-id="broll-01"] .scrim {
        position: absolute; inset: 0;
        background: linear-gradient(180deg,
          rgba(0,0,0,0.45) 0%,
          rgba(0,0,0,0.15) 35%,
          rgba(0,0,0,0.15) 65%,
          rgba(0,0,0,0.55) 100%);
        pointer-events: none;
      }
      [data-composition-id="broll-01"] .punch {
        position: absolute;
        bottom: 420px;
        left: 0; right: 0;
        text-align: center;
        font-size: 140px;
        font-weight: 900;
        line-height: 0.95;
        text-transform: uppercase;
        color: #ffffff;
        -webkit-text-stroke: 7px #000;
        paint-order: stroke fill;
        text-shadow: 0 8px 24px rgba(0,0,0,0.5);
        will-change: transform, opacity;
      }
    </style>
    <img class="img" src="../broll/facade.jpg" alt="" />
    <div class="scrim"></div>
    <div class="punch">LUMIÈRE BLOOM</div>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <script>
      (function() {
        function run() {
          const root = document.querySelector('[data-composition-id="broll-01"]');
          if (!root || !window.gsap) return;
          const img = root.querySelector('.img');
          const punch = root.querySelector('.punch');
          const tl = gsap.timeline({ paused: true });
          window.__timelines = window.__timelines || {};
          window.__timelines['broll-01'] = tl;
          const DUR = parseFloat(root.getAttribute('data-duration')) || 3.5;
          tl.fromTo(img, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'power2.out' }, 0)
            .fromTo(punch,
              { scale: 0.7, opacity: 0, rotate: -2 },
              { scale: 1.05, opacity: 1, rotate: 0, duration: 0.40, ease: 'back.out(2)' }, 0.30)
            .to(punch, { scale: 1.0, duration: 0.15 }, 0.70)
            .to([img, punch], { opacity: 0, duration: 0.30, ease: 'power2.in' }, Math.max(0.8, DUR - 0.30));
        }
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(run);
        else run();
      })();
    </script>
  </div>
</template>
```

**Critical**: image filename `../broll/facade.jpg` must be **ASCII only**, NOT Vietnamese diacritic-laden (e.g., `Ảnh facade.jpg` returns 404 at render time).

---

## Index.html mount snippet

```html
<!-- Main scaffold -->
<div data-composition-id="root" data-start="0" data-width="1080" data-height="1920">
  <video id="v-source" data-start="0" data-duration="60.0" data-track-index="0"
         src="source.mp4" muted playsinline></video>
  <audio id="a-source" data-start="0" data-duration="60.0" data-track-index="1" data-volume="1"
         src="source.mp4"></audio>

  <!-- SFX -->
  <audio id="sfx-01" data-start="0.11" data-duration="0.6" data-track-index="20"
         data-volume="0.35" src="sfx/camera-flash.mp3"></audio>
  <!-- ... more SFX ... -->

  <!-- Text overlays — one mount per emphasis moment -->
  <div class="clip overlay-mount" data-composition-src="compositions/overlay-01-punch-white.html"
       data-start="0.11" data-duration="2.50" data-composition-id="overlay-01-punch-white"
       data-track-index="50" style="z-index: 80;"></div>
  <div class="clip overlay-mount" data-composition-src="compositions/overlay-02-punch-red.html"
       data-start="3.20" data-duration="3.00" data-composition-id="overlay-02-punch-red"
       data-track-index="51" style="z-index: 81;"></div>
  <!-- ... 10-20 overlays per video typical ... -->

  <!-- Optional full-screen b-roll inserts -->
  <div class="clip broll-mount" data-composition-src="compositions/broll-01.html"
       data-start="24.00" data-duration="3.50" data-composition-id="broll-01"
       data-track-index="70" style="z-index: 70;"></div>

  <!-- Captions LAST -->
  <div class="clip captions-mount" data-composition-src="compositions/captions.html"
       data-start="0" data-duration="60.0" data-composition-id="captions"
       data-track-index="60" style="z-index: 100;"></div>
</div>
```

CSS inside index.html `<style>`:

```css
/* Avatar always full-frame */
#v-source {
  position: absolute; top: 0; left: 0;
  width: 100%; height: 100%;
  object-fit: cover;
  object-position: center 22%;
  z-index: 1;
  will-change: transform;
}

/* Mount classes — force size lock */
.overlay-mount,
.broll-mount {
  position: absolute !important;
  top: 0 !important; left: 0 !important;
  width: 1080px !important; height: 1920px !important;
  overflow: hidden !important;
}
```

No `.split-mount`, no `#split-divider`, no `goSplit()`/`goFull()` GSAP functions.

---

## Density guidelines

- **High density (typical broker creator)**: 1 text-overlay every 3-5s → 12-20 overlays in 60s video
- **Medium density**: 1 every 5-8s → 8-12 overlays
- **Low density**: 1 every 8-12s → 5-8 overlays (when avatar performance is strong and over-supering would distract)

Match what the speaker emphasizes — if they pause + raise pitch on a number, that's a punch-red moment. If they list 3 things, that's 3 separate `punch-white` overlays stacked over time. If they ask a contrasting question, that's a `punch-2line`.

## Color allocation per video (typical)

| Variant | Uses per video |
|---|---|
| `punch-white` | 6-10 (most common — headlines, brand, location) |
| `punch-red` | 1-3 (THE price, THE big offer) |
| `punch-yellow` | 1-3 (urgency moments) |
| `punch-2line` | 1-2 (question / contrast / cliffhanger) |
| `punch-subtle` | 2-4 (clarifications under main punches) |
| `broll-01..03` | 0-3 (only when real assets justify) |

If color-allocation feels off, palette-swap by reading the script:
- More numbers/prices? More red.
- More urgency/deadline? More yellow.
- Pure storytelling / introduction? Mostly white.

Don't use all 5 colors evenly — that reads as chaotic. Pick 2-3 dominant colors per video.
