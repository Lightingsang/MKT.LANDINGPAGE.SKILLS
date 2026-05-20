---
name: mkt-hyperframe-luxury-realestate-9-16
description: Build a TikTok/Reels 9:16 short video from a pre-recorded talking-head MP4 using HyperFrames in a **Broker-Creator Punchy aesthetic** — avatar full-frame the entire time (NO split-screen, NO PIP), with bold scale-pop text overlays appearing on top of the talking head at key beats (price drops, brand names, urgency hooks, CTA keywords). Style match: viral Vietnamese real-estate broker TikTok — WHITE text with thick BLACK stroke, RED accent for prices, YELLOW for urgency, Be Vietnam Pro 800-900, big (120-200px). Full-screen b-roll inserts optional between segments. Captions bottom-center TikTok style. USE WHEN user wants real-estate / e-commerce / coach / agency short video with punchy on-screen text overlays + full-frame avatar (NOT editorial luxury PIP, NOT 50/50 split-screen). Replaces the deprecated luxury editorial split-screen pattern.
---

# mkt-hyperframe-luxury-realestate-9-16

Build a TikTok/Reels 9:16 short video from a pre-recorded talking-head MP4 using HyperFrames in a **Broker-Creator Punchy** aesthetic — the dominant pattern for Vietnamese real-estate / coach / commerce TikTok in 2025-2026.

## When to use

- **Real-estate broker / sales** — căn hộ, đất nền, BĐS dự án
- **Coach / consultant** — tư vấn tài chính, đầu tư, life coach
- **Agency / freelance** — pitch dịch vụ, case study
- **E-commerce founder** — review sản phẩm, deal alert
- **Educator** — micro-tip, listicle quick-hit

Anti-fit (use parent `mkt-hyperframe-talking-head-video` or another skill):
- Editorial / luxury hotel / branded residence (use full editorial photo backdrop instead)
- Long-form Youtube (use 16:9 variant)
- Pure listicle without face cam (use slide-deck pattern)

## Core principle — FULL FRAME, NO SPLIT

The previous version of this skill used 50/50 split-screen (top half b-roll, bottom half avatar). **That pattern is deprecated.** The new pattern:

1. **Avatar fills the entire 1080×1920 canvas** the whole video (`object-fit: cover`)
2. **Text overlays punch in on top of the avatar** at sync'd timestamps — short bursts (1-3s each), high density (1 overlay every 3-5s on average)
3. **B-roll inserts** (if any) take over **full-screen** for 2-5s windows, then return to avatar
4. **Captions** stay at bottom-center TikTok style (not in middle, not split)

This matches how Vietnamese broker creators actually shoot — speaker stays on camera, the message is reinforced by aggressive text supers, never by hiding the speaker behind a slide.

## Pipeline overview

```
source.mp4 (HeyGen avatar lip-sync)
  │
  ├─ transcribe + caption groups
  ├─ identify EMPHASIS WORDS in transcript (keywords, prices, brand names, urgency phrases, CTA)
  ├─ CHECKPOINT — user duyệt list emphasis words + timestamps
  ├─ FAN-OUT N text-overlay writers (per emphasis = 1 overlay clip)
  ├─ merge → overlays.json
  ├─ scaffold compositions/overlay-*.html using PUNCH templates
  ├─ scaffold compositions/broll-*.html for optional full-screen b-roll (if user provided assets)
  ├─ scaffold captions.html
  ├─ wire all mounts into index.html (avatar full-frame backdrop layer, overlays z-index 80-90, captions z-index 100)
  ├─ inject design-tokens.css
  ├─ lint
  └─ open Studio preview
```

## Layer stack

```
z-index 100 — Captions (Inter / Be Vietnam Pro 500, bottom-center, rounded pill bg)
z-index 80-90 — Text overlay punches (scale-pop in 0.4s, hold 1-3s, fade-out 0.3s)
z-index 70 — Full-screen b-roll inserts (optional, 2-5s each)
z-index 30 — Header pill / brand mark (optional, top corner)
z-index 1 — #v-source HeyGen avatar (object-fit: cover, full 1080×1920)
```

No split divider. No PIP frame. No split-mount class. Avatar always full-frame.

## 7 Text overlay variants

Each overlay = ONE `<div class="clip overlay-mount" data-composition-src="compositions/overlay-XX.html" data-start="T" data-duration="2.5" data-composition-id="overlay-XX" data-track-index="N" style="z-index: 80;">` in index.html.

| Variant | Style | Typical use | Position |
|---|---|---|---|
| **`punch-white`** | White text + thick black stroke (5-8px), 130-160px Be Vietnam Pro 900 | Headlines, brand names, location | top-center |
| **`punch-red`** | Red `#e63946` text + white stroke (5-8px) + black drop shadow, 150-200px | Prices, big numbers, "MIỄN PHÍ" | top-left or top-center |
| **`punch-yellow`** | Yellow `#f5c518` text + black stroke (5-8px), 140-180px | Urgency, "1 TUẦN", "HÔM NAY" | top or middle |
| **`punch-2line`** | 2-line stacked, WHITE text + black stroke, 110-130px each line | Question / contrast: "Món hời / Bẫy truyền thông?" | bottom-center |
| **`punch-subtle`** | Semi-transparent grey, no stroke, 60-90px, Be Vietnam Pro 600 | Subtitle / clarification under big number | below main punch |
| **`punch-bubble-number`** ⭐ NEW | Row of red `#e63946` circular bubbles, each with white digit centered. Glow ambient (`box-shadow: 0 0 80px rgba(255,210,80,0.5)` warm yellow halo). Bubble diameter 180-220px, white digits 100-130px Be Vietnam Pro 900. Pop-in stagger (each bubble 0.10s after prev). | Listicle countdown: "1 / 2 / 3 lý do mua bây giờ", "3 bước để chốt căn", "Top 3 view đẹp nhất". Pair with `count.wav` or `ting.mp3` × N | middle-center horizontal row |
| **`punch-neon-outline`** ⭐ NEW | Big OUTLINE-ONLY text (transparent fill, `-webkit-text-stroke: 4-6px #ff2d3a` red stroke) + thick red glow `text-shadow: 0 0 20px rgba(255,45,58,0.9), 0 0 40px rgba(255,45,58,0.6)`. Be Vietnam Pro 900 200-280px. Often pairs with smaller red filled label above ("XU HƯỚNG VIDEO BĐS"). | Year reveals ("2026"), trend keywords ("XU HƯỚNG", "PHIÊN BẢN"), large brand stamps. Pair with `Whoosh` or `Laser` SFX | center-of-frame, takes prominence |

### Text fit / overflow safety (MANDATORY)

Be Vietnam Pro 900 at 150-200px overflows 1080px canvas at ~9-10 characters. Without a guard, viral strings like "HỢP LÝ HƠN!", "GIÁ TỐT NHẤT", "VINHOMES CAO XÀ LÁ" tràn cả 2 cạnh và hiện chỉ thấy giữa chữ.

Every overlay punch + b-roll text MUST follow:
- **`max-width: 960px`** on the `.punch` / `.broll-text` element (60px safe margin each side of 1080).
- **`fitText()` JS auto-shrink** runs inside `document.fonts.ready.then(run)` BEFORE the GSAP timeline. Measures `scrollWidth` with `whiteSpace:nowrap` + `maxWidth:none`, drops fontSize by 4px steps until it fits, then restores wrap. Bulletproof regardless of string length / VN diacritics width.
- **`word-break: keep-all`** + **`overflow-wrap: break-word`** instead of `white-space: nowrap` — allows wrap-fallback if even min fontSize (70px) doesn't fit.
- Per-variant `maxFontSize` to pass into `fitText()`:
  | Variant | maxFontSize | minFontSize | Reason |
  |---|---|---|---|
  | punch-white | 170 | 70 | mid heavy |
  | punch-red | 200 | 80 | prices need impact |
  | punch-yellow | 180 | 70 | urgency |
  | punch-2line | 130 | 60 | 2 lines × ~10 chars each |
  | punch-subtle | 90 | 50 | subtitle, never huge |
  | broll-text | 180 | 70 | full-screen, slightly bigger |

Strings longer than ~14 chars at headline weight will end up at 100-130px after fitText — still readable on phone (375px viewport → ~36-45px effective). If a string would shrink below 90px to fit, **split into 2-line variant** (punch-2line) instead — preserves visual impact.

Animation pattern (universal):
```
t=0:    scale 0.7, opacity 0, rotate -3deg
t=0.35: scale 1.05, opacity 1, rotate 0 (overshoot)
t=0.5:  scale 1.0 (settle)
t=duration-0.3: fade-out + scale 0.95
```

GSAP timeline:
```js
tl.fromTo(el,
  { scale: 0.7, opacity: 0, rotate: -3 },
  { scale: 1.05, opacity: 1, rotate: 0, duration: 0.35, ease: 'back.out(2)' }, 0)
  .to(el, { scale: 1.0, duration: 0.15, ease: 'power2.inOut' }, 0.35)
  .to(el, { opacity: 0, scale: 0.95, duration: 0.30, ease: 'power2.in' }, duration - 0.30);
```

Optional jiggle on hold: tiny ±0.5deg rotate oscillation every 0.8s for energy.

## Text overlay component template

```html
<template id="overlay-XX-template">
  <div data-composition-id="overlay-XX" data-start="0" data-width="1080" data-height="1920">
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@600;800;900&display=swap" rel="stylesheet" />

    <style>
      [data-composition-id="overlay-XX"] {
        width: 100%; height: 100%;
        position: relative; overflow: hidden;
        background: transparent;            /* CRITICAL — let avatar show through */
        font-family: 'Be Vietnam Pro', system-ui, sans-serif;
        pointer-events: none;
      }
      [data-composition-id="overlay-XX"] .punch {
        position: absolute;
        top: 120px;                          /* OR bottom: 380px for bottom variant */
        left: 50%;
        transform: translateX(-50%);
        max-width: 960px;                    /* HARD CAP — 60px safe margin each side of 1080 canvas */
        font-size: 150px;                    /* DEFAULT — auto-shrunk by fitText() below at mount */
        font-weight: 900;
        line-height: 0.95;
        text-transform: uppercase;
        text-align: center;
        word-break: keep-all;                /* keep Vietnamese words intact (NEVER break mid-word) */
        overflow-wrap: break-word;           /* allow wrap at spaces if even fitText min-size không vừa */
        color: #ffffff;                      /* OR #e63946 red, #f5c518 yellow */
        -webkit-text-stroke: 6px #000000;
        paint-order: stroke fill;            /* stroke renders BEHIND fill */
        text-shadow: 0 6px 0 rgba(0,0,0,0.40), 0 10px 24px rgba(0,0,0,0.30);
        will-change: transform, opacity;
      }
    </style>

    <div class="punch">120 TR/M²</div>

    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <script>
      (function() {
        // Auto-shrink font-size until text fits within max-width.
        // Be Vietnam Pro 900 at 150px on 1080 canvas → strings >9 chars often overflow.
        // This guarantees NO horizontal overflow regardless of string length.
        function fitText(el, maxWidth = 960, maxFontSize = 200, minFontSize = 70, step = 4) {
          let fs = maxFontSize;
          el.style.fontSize = fs + 'px';
          // scrollWidth includes overflow even with max-width; we need the natural width.
          // Temporarily strip max-width to measure, then restore.
          const saved = el.style.maxWidth;
          el.style.maxWidth = 'none';
          el.style.whiteSpace = 'nowrap';
          while (el.scrollWidth > maxWidth && fs > minFontSize) {
            fs -= step;
            el.style.fontSize = fs + 'px';
          }
          el.style.maxWidth = saved || (maxWidth + 'px');
          el.style.whiteSpace = '';            // allow wrap fallback if min still overflows
        }

        function run() {
          const root = document.querySelector('[data-composition-id="overlay-XX"]');
          if (!root || !window.gsap) return;
          const el = root.querySelector('.punch');

          // 1. Fit text BEFORE animation — fontSize is finalized so scale-pop animates at correct size.
          //    Per-overlay tuning: pass different maxFontSize for hero (200) vs subtitle (130) etc.
          fitText(el, 960, 200, 70, 4);

          // 2. Animate
          const tl = gsap.timeline({ paused: true });
          window.__timelines = window.__timelines || {};
          window.__timelines['overlay-XX'] = tl;
          const DUR = parseFloat(root.getAttribute('data-duration')) || 2.5;
          tl.fromTo(el,
              { scale: 0.7, opacity: 0, rotate: -3 },
              { scale: 1.05, opacity: 1, rotate: 0, duration: 0.35, ease: 'back.out(2)' }, 0)
            .to(el, { scale: 1.0, duration: 0.15, ease: 'power2.inOut' }, 0.35)
            .to(el, { opacity: 0, scale: 0.95, duration: 0.30, ease: 'power2.in' }, Math.max(0.5, DUR - 0.30));
        }
        if (document.fonts && document.fonts.ready) {
          document.fonts.ready.then(run);     // CRITICAL — fitText() must run AFTER Be Vietnam Pro loads,
                                              //            otherwise measurement uses fallback font width.
        } else { run(); }
      })();
    </script>
  </div>
</template>
```

## Index.html scaffold (avatar full-frame + overlays)

```html
<div data-composition-id="root" data-start="0" data-width="1080" data-height="1920">
  <video id="v-source" data-start="0" data-duration="60.0" data-track-index="0"
         src="source.mp4" muted playsinline></video>
  <audio id="a-source" data-start="0" data-duration="60.0" data-track-index="1" data-volume="1"
         src="source.mp4"></audio>

  <!-- SFX (punchy — camera-flash, búng tay, ting, whoosh, laser, discord) -->
  <audio id="sfx-01" data-start="0.11" data-duration="0.6" data-track-index="20" data-volume="0.35" src="sfx/camera-flash.mp3"></audio>
  <!-- ... -->

  <!-- Header pill (optional) -->
  <div id="header-pill" class="clip header-pill"
       data-start="0" data-duration="60.0" data-track-index="3">
    <div class="dot"></div>
    <div class="label">VINHOMES CAO XÀ LÁ • MỞ BÁN</div>
  </div>

  <!-- Brand mark footer (optional) -->
  <div id="brand-mark" class="clip brand-mark"
       data-start="0" data-duration="60.0" data-track-index="2">@masterise.homes</div>

  <!-- TEXT OVERLAY PUNCHES — N divs, each one a single emphasis moment -->
  <div class="clip overlay-mount" data-composition-src="compositions/overlay-01.html"
       data-start="0.11" data-duration="2.50" data-composition-id="overlay-01"
       data-track-index="50" style="z-index: 80;"></div>
  <div class="clip overlay-mount" data-composition-src="compositions/overlay-02.html"
       data-start="3.20" data-duration="2.00" data-composition-id="overlay-02"
       data-track-index="51" style="z-index: 81;"></div>
  <!-- ... 10-20 overlays per video typical -->

  <!-- FULL-SCREEN B-ROLL INSERTS (optional, sparse) -->
  <div class="clip broll-mount" data-composition-src="compositions/broll-01.html"
       data-start="24.00" data-duration="3.50" data-composition-id="broll-01"
       data-track-index="70" style="z-index: 70;"></div>

  <!-- CAPTIONS LAST (bottom-center, z-index 100) -->
  <div class="clip captions-mount" data-composition-src="compositions/captions.html"
       data-start="0" data-duration="60.0" data-composition-id="captions"
       data-track-index="60" style="z-index: 100;"></div>
</div>
```

CSS for `#v-source` — **always full-frame**:
```css
#v-source {
  position: absolute; top: 0; left: 0;
  width: 100%; height: 100%;
  object-fit: cover;
  object-position: center 22%;     /* face slightly above geometric center */
  z-index: 1;
  will-change: transform;
}
```

NO `goSplit()` / `goFull()` GSAP functions. NO `.split-mount` class. NO `#split-divider`. Avatar is the constant backdrop.

## Avatar zoom hooks — RHYTHM RULE

**Hard rule: max 4s gap between zooms.** Every emphasis word in the transcript MUST have a zoom hook. Pair every zoom with the corresponding text-overlay punch + SFX at the same `t`. A 60s video typically has 15-20 zoom hooks (1 every ~3s avg, max 4s gap).

3 zoom types — all subtle, peaks 1.04-1.10 (NEVER ≥ 1.15):

| Type | Pattern | Duration | Use for |
|---|---|---|---|
| `soft2step` | 1.0 → mid (~1.05) → peak → 1.0 | ~1.10s | MAJOR moments — brand, price, CTA (4-5x/video) |
| `quickpop` | 1.0 → peak → 1.0 fast | ~0.78s | Medium emphasis — locations, numbers, good points |
| `doublepop` | 1.0 → peak → 1.0 → peak → 1.0 | ~1.08s | Urgency / list reveal — 2x tap (1-2x/video) |

Peak guide:
- `1.04-1.05` filler / bridge zoom (keeps rhythm under 4s gap)
- `1.06-1.07` medium emphasis
- `1.08-1.10` MAJOR (brand reveal, price drop, CTA) — max 4-5x per video

Pattern (subtle, ambient, sync với speech beat):

```js
gsap.set("#v-source", { transformOrigin: "center 22%" });

function zoomSoft2Step(t, peak) {
  const mid = 1.0 + (peak - 1.0) * 0.55;
  tl.to("#v-source", { scale: mid,  duration: 0.30, ease: "power2.out" }, t);
  tl.to("#v-source", { scale: peak, duration: 0.25, ease: "power2.inOut" }, t + 0.30);
  tl.to("#v-source", { scale: 1.0,  duration: 0.55, ease: "power2.inOut" }, t + 0.65);
}
function zoomQuickPop(t, peak) {
  tl.to("#v-source", { scale: peak, duration: 0.28, ease: "back.out(1.6)" }, t);
  tl.to("#v-source", { scale: 1.0,  duration: 0.50, ease: "power2.inOut" }, t + 0.28);
}
function zoomDoublePop(t, peak) {
  tl.to("#v-source", { scale: peak, duration: 0.18, ease: "back.out(1.8)" }, t);
  tl.to("#v-source", { scale: 1.0,  duration: 0.22, ease: "power2.inOut" }, t + 0.18);
  tl.to("#v-source", { scale: peak, duration: 0.18, ease: "back.out(1.8)" }, t + 0.55);
  tl.to("#v-source", { scale: 1.0,  duration: 0.35, ease: "power2.inOut" }, t + 0.73);
}

// Sample 60s video — 19 hooks, NO gap > 4s
const ZOOM_HOOKS = [
  { t: 0.11,  type: "soft2step", peak: 1.08 }, // MAJOR brand
  { t: 3.79,  type: "quickpop",  peak: 1.05 }, // filler emphasis
  { t: 7.00,  type: "quickpop",  peak: 1.05 },
  { t: 10.44, type: "doublepop", peak: 1.05 }, // list reveal
  // ... target avg every 3s, never gap > 4s ...
  { t: 55.89, type: "soft2step", peak: 1.10 }, // MAJOR CTA
];

ZOOM_HOOKS.forEach(({ t, type, peak }) => {
  if (type === "soft2step")       zoomSoft2Step(t, peak);
  else if (type === "quickpop")   zoomQuickPop(t, peak);
  else if (type === "doublepop")  zoomDoublePop(t, peak);
});
```

## Full-screen b-roll insert (optional)

When user provides b-roll photos/videos and an insert moment is editorially strong, scaffold a full-screen composition that takes over briefly:

```html
<template id="broll-01-template">
  <div data-composition-id="broll-01" data-start="0" data-width="1080" data-height="1920">
    <style>
      [data-composition-id="broll-01"] {
        width: 100%; height: 100%;
        position: relative; overflow: hidden;
        background: #000;
      }
      [data-composition-id="broll-01"] .broll-img {
        position: absolute; inset: 0;
        width: 100%; height: 100%;
        object-fit: cover;
        animation: kb 6s ease-in-out infinite alternate;
      }
      @keyframes kb {
        from { transform: scale(1.04); }
        to   { transform: scale(1.12); }
      }
      [data-composition-id="broll-01"] .broll-text {
        position: absolute; bottom: 380px; left: 50%;
        transform: translateX(-50%);
        max-width: 960px;                   /* HARD CAP — same as overlay punch */
        text-align: center;
        font-family: 'Be Vietnam Pro', sans-serif;
        font-size: 140px; font-weight: 900;  /* DEFAULT — auto-shrunk by fitText() if needed */
        line-height: 0.95;
        word-break: keep-all;
        overflow-wrap: break-word;
        text-transform: uppercase;
        color: #fff;
        -webkit-text-stroke: 6px #000;
        paint-order: stroke fill;
        text-shadow: 0 8px 24px rgba(0,0,0,0.5);
      }
    </style>
    <img class="broll-img" src="../broll/facade.jpg" alt="" />
    <div class="broll-text">LUMIÈRE BLOOM</div>

    <script>
      // Same auto-fit as overlay punch — guard against horizontal overflow on long strings.
      (function(){
        function fitText(el, maxWidth, maxFs, minFs, step){
          let fs = maxFs; el.style.fontSize = fs+'px';
          const saved = el.style.maxWidth;
          el.style.maxWidth = 'none'; el.style.whiteSpace = 'nowrap';
          while (el.scrollWidth > maxWidth && fs > minFs) { fs -= step; el.style.fontSize = fs+'px'; }
          el.style.maxWidth = saved || (maxWidth+'px'); el.style.whiteSpace = '';
        }
        function run(){
          const el = document.querySelector('[data-composition-id="broll-01"] .broll-text');
          if (el) fitText(el, 960, 180, 70, 4);
        }
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(run); else run();
      })();
    </script>
  </div>
</template>
```

Use sparingly: 1-3 inserts in a 60s video, 2-5s each. Too many and the avatar disappears from view.

### B-roll context-matching rule (MANDATORY)

**Quality over quantity. Empty avatar moments are BETTER than mismatched b-roll inserts.**

Every b-roll insert MUST match what the speaker is saying at that EXACT timestamp. Decision rule before inserting any b-roll:

1. Open `transcript-cleaned.json`. Find the word(s) spoken during the proposed b-roll window (`data-start` to `data-start + data-duration`).
2. Ask: **does the b-roll image visually represent the spoken meaning?** Be strict.
3. If YES → insert. If NO → DO NOT insert (skip — let avatar carry the moment).

**Categorical rules:**

| Spoken context | Insert? | Image type that fits |
|---|---|---|
| Brand name reveal (project / developer) | YES | Exterior / facade / overview drone |
| Location / land / address ("đất vàng", "lõi Nguyễn Trãi") | YES | Drone aerial / overview / map context |
| Tower count / structure ("10 tòa", "8 tòa căn hộ") | YES | Architecture / facade showing buildings |
| Premium positioning ("hàng hiệu", "cao cấp") | YES | Lobby / business-lounge / library / premium amenity |
| Interior / unit reference ("một căn", "căn hộ") | YES | Interior shot (living room / bedroom / kitchen) |
| Amenity reference ("bể bơi", "phòng gym", "khu vui chơi") | YES | The specific amenity shown |
| **Price / pricing / comparison** ("120tr/m²", "so với Royal City", "hợp lý hơn") | **NO** | Price info has no visual referent — skip |
| **Historical / past** ("ba mươi năm trước", "ngày xưa") | **NO** unless we have old photos | Modern shots NEVER fit historical context |
| **CTA / call-to-action** ("Bình luận BLOOM", "inbox em") | **NO** | Focus on avatar/CTA overlay, no b-roll |
| **Generic intro / brand tease** ("Cái tên ai cũng biết") | **NO** | Let hook breathe with avatar |
| **Abstract concepts** ("hợp lý", "tốt nhất", "khởi điểm") | **NO** | No visual referent |

**Common mismatch traps to AVOID:**
- Showing INTERIOR during PRICE COMPARISON (4br living shot at "so với Royal City") → REMOVE
- Showing GYM/PLAYGROUND during PRICING ("giá khởi điểm tốt nhất") → REMOVE
- Showing CLUBHOUSE during TOWER COUNT ("8 tòa") → SWAP to architecture/facade
- Showing LOBBY during LAND TALK ("đất vàng cuối cùng") → SWAP to overview/drone
- Showing MODERN renders during HISTORICAL talk → REMOVE entirely

**Workflow when scaffolding b-rolls:**
1. Read full transcript first. Tag each spoken moment with its context category from the table above.
2. List available images. Tag each by content category.
3. Match images to ONLY the moments where context fits. Skip mismatches — do NOT fill silence with random b-roll for "variety".
4. Typical 60s broker-creator video ends up with 5-10 b-roll inserts totaling 12-25s, NOT 30s. That's correct.
5. If target b-roll duration (e.g., "50% of video") cannot be reached with matching content, **reduce target rather than insert mismatches**.

### B-roll layout — full-screen takeover DEFAULT (HARD RULE)

**Default = `full-screen` takeover.** B-roll image fills 1080×1920, avatar disappears for the brief insert window (2-5s), then returns. This is the canonical broker-creator b-roll pattern — see template in [Full-screen b-roll insert](#full-screen-b-roll-insert-optional) above.

**Use sparingly:** 1-3 inserts per 60s video, 2-5s each. Total b-roll airtime ~ 6-15s of a 60s video (10-25%). Avatar carries the rest. Too many = avatar disappears, viewer loses anchor.

**FORBIDDEN layouts:**
- ❌ **top-strip** (image at `top: 0`) — covers the face of a close-up talking head. NEVER use.
- ❌ **Persistent bottom-strip held > 50% of video** — user explicitly rejected this; the rendered output ends up looking like a split-screen aesthetic instead of broker-creator punchy. If you find yourself wanting > 3 bottom-strips, switch to full-screen takeover instead.
- ❌ **Side-strip / PIP / split-screen** — these are different aesthetics, not broker-creator.

**OPTIONAL — `bottom-strip` for "show while speaking" moments (rare, max 1-2 per video):**

Only use bottom-strip when speaker is actively **referencing something visual while still on camera** (e.g., "nhìn vào mặt bằng tầng này" → speaker stays in shot, mặt bằng appears below). For pure b-roll inserts (brand reveal, drone shot, amenity tease), use full-screen takeover instead.

If bottom-strip is justified, spec:
```css
[data-composition-id="broll-XX"] {
  width: 100%; height: 100%;
  position: relative; overflow: hidden;
  background: transparent;             /* avatar visible top 60% */
}
[data-composition-id="broll-XX"] .strip {
  position: absolute;
  left: 0; bottom: 0;
  width: 1080px;
  height: 768px;                       /* 40% of 1920 max */
  overflow: hidden;
  background: #000;
  box-shadow: 0 -12px 32px rgba(0,0,0,0.55);
}
```
Animation: `gsap.fromTo(strip, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.40, ease: 'power3.out' })`.

**Decision flowchart when scaffolding each b-roll:**
1. Does speaker reference a visual *while needing to stay on camera*? → `bottom-strip` (max 1-2 per video).
2. Pure brand/location/amenity reveal? → `full-screen takeover`. **Default.**
3. Speaker face must remain visible the entire video without any b-roll? → skip the insert.

**Detection / verification:** Run `npx hyperframes snapshot` at b-roll timestamps before full render — confirm full-screen inserts replace avatar cleanly and bottom-strip (if used) doesn't crop the face.

## SFX rules

Punchy is on-brand for this aesthetic. Use the full kit:
- `camera-flash.mp3` — opening hook + price/brand reveal
- `búng tay.mp3` — punchline snap
- `Laser.mp3` — brand stamp (1 use per video)
- `ting.mp3` — number/highlight ping
- `Whoosh sound effect (1).mp3` — transition / list reveal
- `Discord Notification - Sound Effect.mp3` — CTA chime (1 use per video at end)

Pair each text-overlay punch with an SFX of matching intensity. Volume range 0.22-0.36; don't mask voiceover.

## Captions

Bottom-center TikTok style — pill background black 80% opacity, white text Be Vietnam Pro 600, 56-64px. NO Inter Tight 300 cream-on-charcoal (too sophisticated for this aesthetic).

```css
.caption-stage { position: absolute; left: 0; right: 0; bottom: 280px; text-align: center; }
.caption-group {
  display: inline-block;
  padding: 18px 32px;
  background: rgba(0, 0, 0, 0.78);
  border-radius: 20px;
  color: #fff;
  font-family: 'Be Vietnam Pro', sans-serif;
  font-weight: 600;
  font-size: 60px;
  line-height: 1.15;
  text-shadow: 0 2px 6px rgba(0,0,0,0.4);
}
```

## Design tokens

```css
/* Punch overlay palette — high-contrast, NOT luxury */
--punch-white:   #ffffff;
--punch-red:     #e63946;
--punch-yellow:  #f5c518;
--punch-stroke:  #000000;
--punch-shadow:  rgba(0, 0, 0, 0.40);

/* Caption */
--caption-bg:    rgba(0, 0, 0, 0.78);
--caption-ink:   #ffffff;

/* Brand pill (optional header) */
--pill-bg:       rgba(20, 20, 19, 0.78);
--pill-border:   rgba(255, 255, 255, 0.18);
--pill-dot:      #d97757;        /* claude-orange, swap per brand */
--pill-ink:      #faf9f5;

/* Typography */
--font-display:  'Be Vietnam Pro', system-ui, sans-serif;

/* Sizes */
--punch-xl:      180px;          /* prices, top-line hooks */
--punch-lg:      150px;          /* brand names, locations */
--punch-md:      120px;          /* 2-line questions */
--punch-sm:      90px;           /* subtitle below big number */

/* Stroke widths */
--stroke-heavy:  7px;            /* big text */
--stroke-medium: 5px;            /* medium text */
--stroke-light:  3px;            /* smaller subtitle */
```

## Critical HyperFrames gotchas (learned the hard way)

These are non-negotiable; ignore them and the render comes out BLACK:

1. **CSS selectors MUST use attribute pattern, NOT id pattern.**
   HyperFrames runtime strips the `id` attribute from composition root divs when mounting (to prevent collisions across multiple instances). So `#overlay-01 { ... }` doesn't match anything → no styles → invisible. **Always use `[data-composition-id="overlay-01"] { ... }`** even though the lint warns about it. The lint suggestion to use `#id` is misleading — follow the working template pattern instead.

2. **Asset filenames must be ASCII-only** (no Vietnamese diacritics).
   `broll/Ảnh facade dự án.jpg` returns 404 at render time. Rename to `broll/facade.jpg` or similar before referencing.

3. **Inline SVG elements must have explicit `fill="none"` attribute**, not just CSS `fill: none`.
   Chrome's render path doesn't always cascade CSS `fill` into SVG children. Add `fill="none"` directly to every `<rect>`, `<path>`, `<circle>`, `<line>` that needs no fill.

4. **Composition root div must have `data-width="1080" data-height="1920"` attributes** (HyperFrames uses them for sizing), AND CSS `width: 100%; height: 100%; position: relative; overflow: hidden;`.

5. **Mount class needs CSS to lock dimensions** in some cases. If overlays appear cut off, add:
   ```css
   .overlay-mount, .broll-mount {
     position: absolute !important;
     top: 0 !important; left: 0 !important;
     width: 1080px !important; height: 1920px !important;
     overflow: hidden !important;
   }
   ```

6. **`<template>` wrapper required** — every composition file must wrap its root div in `<template id="overlay-XX-template">...</template>`. HF clones the template content when mounting.

7. **GSAP timeline pattern** — `paused: true`, register via `window.__timelines['composition-id'] = tl;` inside `document.fonts.ready.then(run)` guard. HF runtime plays the timeline scrubbed against the parent timeline.

8. **Text overflow is the #1 visible defect** — Be Vietnam Pro 900 at 150-200px overflows 1080 canvas at ~10 chars. EVERY `.punch` and `.broll-text` element MUST: (a) have `max-width: 960px`, (b) drop `white-space: nowrap` in favor of `word-break: keep-all; overflow-wrap: break-word`, (c) call `fitText(el, 960, maxFs, minFs, 4)` inside `document.fonts.ready.then(run)` BEFORE the GSAP timeline. See "Text fit / overflow safety" section above for full snippet + per-variant fontSize table. Without this, viral strings like "HỢP LÝ HƠN!", "GIÁ TỐT NHẤT", "VINHOMES CAO XÀ LÁ" tràn 2 cạnh và viewer chỉ thấy giữa chữ.

## Workspace layout

```
workspace/content/YYYY-MM-DD/<slug>/
├── script.txt
├── voiceover.mp3
├── source.mp4
├── broll/                       # User-provided images (ASCII filenames!)
├── transcript.json
├── transcript-cleaned.json
├── caption-groups.json
├── overlays-outline.json        # NEW — list of emphasis moments + style
├── overlays/                    # Per-overlay content JSON (kicker text, style variant, position)
├── overlays.json                # Merged
├── compositions/
│   ├── overlay-01.html          (one per emphasis moment, 10-20 typical)
│   ├── overlay-02.html
│   ├── ...
│   ├── broll-01.html            (optional, 1-3 max)
│   └── captions.html
├── sfx/                         # camera-flash, búng tay, ting, whoosh, laser, discord
└── index.html
```

## Output contract

Same as parent skill: preview-ready HyperFrames project, openable via Studio (typically `http://localhost:3002`), lint-clean (0 errors; warnings about `composition_self_attribute_selector` are SAFE to ignore — that pattern is required by HF runtime). User reviews, then explicitly invokes `npx hyperframes render -q draft -o renders/<slug>-draft.mp4` for review draft, then `-q standard` or `-q high` for final.

## What this skill does NOT do

- Doesn't replace the orchestrator `mkt-full-video-with-11-hyperframe-heygen` — invoked BY it (Phase 3 routing)
- Doesn't transcribe — that's Phase 2/3 packager
- Doesn't render the final MP4 — user gate at preview Studio
- Doesn't auto-pick text-overlay timestamps — user reviews the emphasis list at the checkpoint and can tweak before fan-out

## References

- `references/design-tokens.css` — full palette + typography spec for this aesthetic
- `references/variants.md` — 5 text overlay variants + b-roll insert template, full HTML/CSS
- `references/text-effects.md` — scale-pop-in + jiggle + fade-out GSAP code; avatar zoom hook code
