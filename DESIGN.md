# Atelier design system: the formula

Version 0.1.0 · 2026-11-18 · applies to **every Atelier site**: the blog + portfolio (`blog.minhthuan.dev`), the Atelier6K demo, and any future project page.

This file is the authority. Site-specific specs (for example the blog's home-menu spec in `ateliermizumi.github.io/docs/rebuild/2026-11-18-midnight-atelier-design-formula.md`) may add detail but may not contradict it.

Evidence labels: **[src]** from a cited source (§13), **[measured]** computed by `npm test`, **[decision]** agreed with the author, **[proposal]** recommended, not yet agreed.

---

## 1. Goal

**The most satisfying site to use.** Every input answers at once, every screen reads at a glance, one memorable moment per visit, nothing slows reading.

| Feel | Target | Check |
|---|---|---|
| Instant | visual response in the next frame; action feedback ≤ 100 ms | DevTools Performance, INP < 200 ms |
| Smooth | 60 fps on hero scenes on a mid laptop | frame chart |
| Legible | text ≥ 4.5:1, large display ≥ 3:1 against the real pixels behind it | `npm test` + screenshot check |
| Learnable | a newcomer names the site and picks a destination in 5 s | 5-second test, 5 people |
| Controllable | mouse, touch, keyboard, gamepad, screen reader all reach everything | §9 checklist |
| Memorable | one signature moment per visit | critique |
| Calm when reading | long-form pages: no tilt on body text, no ambient motion, no 3D JS | Lighthouse, bundle check |

## 2. Concept and the ten rules

**Concept: underwater at midnight, looking up at a sunlit surface.** [decision] Each site is a workshop at the bottom of the sea. Water, bubbles, caustic light, moon and clock come from this. Inspired by Persona 3 Reload's water-and-bubbles UI [src: Automaton]; we take principles only, never Atlus characters, logos or assets.

1. **One concept drives every visual.** If an element does not come from water/midnight, cut it.
2. **Depth in one hue.** Blues from void to cyan; richness from tonal steps, light and motion.
3. **One warm accent, small, meaningful.** Red marks only *where you are* or *what is live*. Never stripes, never through text. [decision]
4. **Two worlds per hero.** A high-key paper/white layer against the deep scene.
5. **Everything leans the same way.** One tilt for rotated blocks, one skew for slabs and badges (§3.3).
6. **Text over water always gets help:** plate, hard shadow or scrim, chosen by the contrast table.
7. **Motion answers people.** Ambient motion is slow and peripheral; fast motion only follows an input or a navigation.
8. **One object carries each transition.** Hand an object across screens (clock → HUD, slab → heading); do not cross-fade unrelated screens.
9. **Game-grade input, web-grade access.** Console navigation that never breaks Tab, screen readers or touch.
10. **Reading pages are calm.** Spectacle lives on hubs and showcases; long-form pages are typography first.

## 3. Foundations

### 3.1 Color

Core tokens (`tokens/tokens.json`, CSS `--ds-<name>`):

| Token | Default | Atelier6K theme | Role |
|---|---|---|---|
| `void` | `#030A2A` | `#030B26` | page ground |
| `navy` | `#061A6E` | `#061541` | raised surfaces, hard shadows |
| `deep` | `#0A2BB0` | `#0D2F8F` | deep water, dark strokes on paper |
| `sea` | `#1D7BFF` | same | mid water |
| `cyan` | `#62E6FF` | `#38D6FF` | light: links, badges, lines, bubbles |
| `mist` | `#CFE4FF` | same | secondary text |
| `muted` | `#9DB8DB` | same | captions, meta |
| `paper` | `#F7FBFF` | same | white layer, slabs, round buttons |
| `ink` | `#05060F` | same | text on paper and on light |
| `warm` | `#FF2D2D` | same | the only accent |
| `pink` | `#FF7AD0` | same | edge behind the selected wedge only |
| `good` / `warn` / `bad` | `#5FF2C4` / `#FFD65A` / `#FF5F87` | same | status only, never decoration |

Semantic aliases (use these in site CSS): `bg`, `bg-raised`, `text`, `text-2`, `text-3`, `light`, `accent`, `on-light`, `on-paper`, `edge`, `shadow`, `link`.

Contrast is a test, not an opinion: `test/contrast.test.mjs` checks 15 pairs plus the hero menu tints for **every** theme and fails the build if any drops below its minimum [measured]. Key results: paper on void 18.7, mist on void 15.0, cyan on void 13.2, warm on void 5.2, paper on mid water 6.4, paper on bright water 3.2 (large text only).

Rules:
- A new theme may only override core colors; it must pass the same tests.
- Status colors appear as badges with ink text, never as text on void for long copy.
- No decorative gradients; gradients only where water supplies them.

### 3.2 Typography

| Role | Face | Use |
|---|---|---|
| Display | Barlow Condensed 800/900 italic | headings, menu, HUD, numerals |
| Body | Be Vietnam Pro 400/600/800 | running text, UI copy (Vietnamese + English) |
| Mono | JetBrains Mono 400/700 | time, counts, code, labels |

Scale tokens: `display-xl`, `display-l`, `display-m`, `h1`, `h2`, `h3`, `title`, `lede`, `body`, `small`, `meta` (fluid `clamp()` values in tokens.json).

- Display is italic, tight (−0.01 to −0.03em), uppercase only for menu items and numerals.
- Body: 16–18 px, line-height 1.6, measure ≤ 68 characters.
- Every face must render Vietnamese diacritics at every weight used. Names in display type are written without diacritics where the author asked (`MINH THUAN`). [decision]
- Kinetic type splits by **words**, never letters, and keeps one accessible text node [src: Roselli; GSAP SplitText].
- Atelier6K previously used Saira Extra Condensed + Barlow Semi Condensed; it moves to the shared faces. [decision: base + theme]

### 3.3 Shape, space, elevation

- **Tilt** `--ds-shape-tilt: -9deg` rotates hero blocks (menus). **Skew** `--ds-shape-skew: -12deg` slants slabs, status badges and stripes. Never mix other angles.
- **Slant** 12 px parallelogram offset; **cut** 28 px clipped corner for embeds and panels.
- **Radius 0** everywhere except round input buttons (full circle). No pills, no rounded cards.
- **Elevation is drawn, not blurred:** hard shadows `3px 3px 0` (text, buttons) and `8px 8px 0` (slab headings, cyan). Plates over water use 72% void + 10 px backdrop blur + 1 px cyan inner line.
- **Space scale** 4 · 8 · 12 · 16 · 24 · 32 · 48 · 72 · 112 px (`--ds-space-1..9`). Sections are separated by 72 px; related items by 8–16 px.
- **Layering** (`--ds-z-*`): water 0, scrim 1, layer 2, fx 4, ui 6, util 7, overlay 20, transition 21, flying 22.

### 3.4 Layout

- Container: max 1180 px, gutter `max(16px, (100vw − 1180px) / 2)`; respect safe-area insets on fixed elements.
- Corners are fixed homes across a site: brand top-left, HUD top-right, description + prompts bottom-right, utilities (replay, pause) bottom-left. Elements never swap corners between pages.
- Breakpoint 760 px: hero menus go to a row or stack, HUD compacts, prompts shrink to 26 px.
- Grids collapse to one column below 760 px; nothing scrolls the page sideways except code and tables inside their own scroller.

### 3.5 Iconography

- 24-unit grid, 20-unit live area, stroke 3.2, round caps and joins; solid only for D-pad and play/pause.
- Inline SVG only; never font glyphs (they sit off-center). [decision]
- Round input buttons: 32 px (26 px mobile), one glyph each, paper fill, `2px 2px 0` navy shadow.
- Prompt sets follow the device used last (keyboard, Xbox, PlayStation, Nintendo) (§8). Console colors appear only inside prompt circles.

### 3.6 Imagery and illustration

- **Screenshots and renders:** shown on navy, never with soft shadows; captions say what the image proves.
- **Character / hero art:** original or licensed only. Style: high-key white render, black ink line (outer ≈ 2× inner), 2-tone cyan cel shading, floating hair/cloth. Deliver layered (`body`, `hair`, `cloth`, `shading`, `line`) PNG/WebP with alpha for parallax. Third-party art (Atlus, Azur Lane) never ships. [decision]
- **3D:** `model-viewer` for product models (Atelier6K), three.js for scenes. Toon look: `MeshToonMaterial` + 2–3 step `gradientMap` (nearest filtering), inverted-hull outlines; test screen-space outline passes first, they can blur [src: three.js].
- **Pixel art** is allowed only for genuine pixel sources (`image-rendering: pixelated`).

### 3.7 Data visualization

- Charts are SVG, drawn in tokens: grid `muted` at 22%, primary series `paper`, comparison series `cyan`, threshold lines `warn`, the live/selected point `warm`.
- Labels in body face 12 px; units always shown; one sentence under the chart says what it shows.
- Interactive demos (for example Atelier6K's rapid-trigger plot) live on a plate with a cyan left border.

### 3.8 Water and effects

`js/water.js` (`createWater`): Voronoi caustics with ~1 px anti-aliased lines and a second cel tone, hard-edged light shafts at ≤ 16%, rising bubbles. DPR capped at 1.5. Pauses when hidden, off screen, paused by the viewer, or under reduced motion; draws one static frame first. No `floor()` posterize (it bands). Pages that do not need WebGL use the CSS `.ds-sea` gradient with faint slanted bands.

## 4. Motion

### 4.1 Principles (UX in Motion vocabulary) [src: Willenskomer]

| Principle | Use |
|---|---|
| Easing | every move; only the quartz second-hand tick is linear |
| Offset & delay | list entry, 55 ms stagger |
| Parenting | wedge, edge, cursor move with their item |
| Transformation | second hand → screen-wide hand; slab → heading |
| Masking | sweep reveal (conic mask) |
| Cloning / shared element | dial → HUD clock; selected card → page heading |
| Dimensionality | tilt, overlap, hard shadows |
| Parallax | art layers ≤ 8 px on pointer [proposal] |

Game feel [src: practitioner guides]: anticipation before big moves, overshoot then settle, feedback within 50–100 ms, no screen shake on the web.

### 4.2 Tokens

| Token | Value | Use |
|---|---|---|
| `instant` | 80 ms | press, hover color |
| `quick` | 180 ms | selection, cursor, prompt swap |
| `base` | 260 ms | item entry, pop |
| `emph` | 480 ms | page transition, flight |
| `hero` | 760 ms | sweep reveal |
| `stagger` | 55 ms | lists |
| `ease-snap` | `cubic-bezier(.2,.9,.25,1.25)` | selections, entries |
| `ease-out` | `cubic-bezier(.05,.7,.1,1)` | entering (M3 emphasized decelerate per secondary sources) |
| `ease-inout` | `cubic-bezier(.65,0,.35,1)` | wipes, flights |
| `repeat-delay` / `repeat-rate` | 380 / 110 ms | held navigation |

### 4.3 Moments catalog

| Moment | Where | Spec |
|---|---|---|
| Intro (first visit only) [proposal] | hubs | clock finds the viewer's time (1.5 s) → quartz ticks (0.65 s) → sweep reveal (0.76 s) → dial flies into the HUD (0.56 s); skippable |
| Page transition | all pages | ≤ 480 ms; View Transitions where supported, plain navigation otherwise; HUD persists |
| Content swap | showcases | slab wipe across the stage (`.ds-wipe`, 480 ms) when the subject changes (Atelier6K revisions) |
| Selection | menus, lists, TOC | wedge 200 ms + cursor 180 ms, then cursor bob 0.9 s |
| Confirm | anywhere | 280 ms brightness flash, then act |
| Hover | links, buttons | color/underline only, ≤ 80 ms; no movement on body links |
| Ambient | hubs | caustics + bubbles; pause control required |

### 4.4 Implementation

- Animate `transform` and `opacity`; `clip-path`/`filter`/`mask` only for short, small or one-off moments [src: web.dev].
- WAAPI/CSS by default; GSAP only where a site already uses it. One library per site.
- `js/motion.js` exports `cascade`, `press`, `wipe`, `flyTo`, `sweepReveal`, `token`, `reduced`.
- Cross-document view transitions are opt-in per site (`@view-transition { navigation: auto; }`); Astro `transition:persist` keeps the canvas, but CSS animations restart on persisted elements [src: Astro docs]. Firefox lacked cross-document transitions at the time of the source [src: caniuse].
- No animation blocks input; menus are focusable the moment they are visible.

### 4.5 Reduced motion and pausing

- `prefers-reduced-motion: reduce`: intros end instantly with a 150 ms fade, no cascade, static water, no cursor bob. Base CSS shortens all CSS animations to 1 ms.
- Looping ambient content gets a visible pause (`createWater({ pauseButton })`), remembered per viewer (SC 2.2.2) [src: W3C].

## 5. Content and voice

- Vietnamese on the blog, English on Atelier6K; never mix within a sentence except technical terms.
- Labels say what happens: "Mở", "Về", "Open", "Back", "View the board". Navigation section names may stay English uppercase.
- Counts and dates are real and generated, never typed by hand.
- Errors say what went wrong and how to fix it, without apology.

## 6. Components

All in `src/css/components.css` with the `ds-` prefix. States listed are required.

| Component | Class | States / variants | Notes |
|---|---|---|---|
| Skip link | `.ds-skip` | focus | first element in `<body>` |
| Top bar | `.ds-top`, `.ds-brand` | nav `aria-current` | brand: display word + light-on-ink tag |
| HUD | `.ds-hud` + `[data-hud=date|day|time|phase|clock|moon]` | `--compact` | `mountHud()` fills it; red tick under the plate |
| Hero menu | `.ds-menu`, `.ds-menu__item`, `.ds-menu__note` | `.is-on` / `aria-current`, `--tilt`, `--row` | per-item `--c` tint and `--x` offset; tints from tokens.contrast.menuTints |
| Slab heading | `.ds-slab` | | paper slab, skewed, cyan hard shadow |
| Kicker / lede / sub | `.ds-kicker`, `.ds-lede`, `.ds-sub` | | |
| Plate | `.ds-plate` | | text over water |
| Paper box | `.ds-paper` | | small facts on dark (counts) |
| Cut panel | `.ds-cut`, `.ds-panel` | | embeds (KiCanvas, iframes), section backdrops |
| Button | `.ds-btn` | hover, active, focus, `aria-pressed`, `--light` | slanted, mono label |
| Round button | `.ds-btn-round` | | one SVG glyph |
| Prompts | `.ds-prompts` > `.ds-prompt` | device sets | filled by `createNavigator()` |
| Chip | `.ds-chip` | `--ghost` | tags, categories |
| Status | `.ds-status` | `--good`, `--warn`, `--bad` | ink on status color |
| Ledger | `.ds-ledger` | | status + finding rows |
| Specs | `.ds-specs` | | `dl` of key facts |
| Callout | `.ds-callout[data-label]` | `--tip`, `--warn`, `--danger` | maps to Chirpy `.prompt-*` |
| Gallery | `.ds-gallery` | | figures with captions |
| TOC | `.ds-toc` | `aria-current` with red cursor | articles |
| Pager | `.ds-pager` | | previous/next post |
| Field | `.ds-field` | focus, `aria-invalid`, `.ds-error` | |
| Utilities | `.ds-util` | | replay, pause (bottom-left) |
| Scrim | `.ds-scrim` | `--sx`, `--sy` | darkens water under menus |
| Wipe / sweep | `.ds-wipe.is-wiping`, `.ds-sweep` | | transitions |
| Water bg | `.ds-sea` (+ canvases) | | CSS fallback built in |

Adding a component: write its states and contrast pairs first, add it to the styleguide, then to this table.

## 7. Page types

| Page | Job | Signature | Required parts | Must not |
|---|---|---|---|---|
| **Hub** (blog home) | pick a destination | intro clock + hero menu over water + white character layer | HUD, menu, prompts, description, utilities (replay, pause) | bury content below the fold; autoplay sound |
| **Product showcase** (Atelier6K) | understand and explore one object | 3D model stage + revision menu + slab wipe on switch | top bar, HUD, menu (`--row` on mobile), stage, specs, sections with slab headings | load every heavy embed at once (load on demand) |
| **Project detail** | see what it is, why, proof | hero render/clip, specs, status ledger | specs, gallery, links to source | marketing copy without evidence |
| **Listing / archive / tags** | scan and choose | year or tag headings as slabs, rows with chips | dates in mono, counts | cards in a grid of identical boxes |
| **Article** | read and learn | calm: none beyond HUD + TOC cursor | TOC, callouts, figures with captions, pager | tilt on body, ambient motion, 3D JS |
| **About** | who and how to reach | one portrait or art, short facts as specs | contact as selectable text | a timeline of buzzwords |
| **404 / empty / error** | recover | a still water scene with one line and the menu | link home, the menu | jokes that hide the fix |
| **Loading** | hold attention | clock or a single bubble rising; real progress if known | skip control after 1 s | spinners with no meaning |

## 8. Interaction and input

| Device | Navigate | Confirm | Back | Other |
|---|---|---|---|---|
| Keyboard | ↑↓, W/S, J/K; Home/End; 1–9 jump | Enter, Space | Esc | Tab and Shift+Tab always work |
| Mouse | hover selects | click | browser back | |
| Touch | tap | tap | browser back | targets ≥ 44 px |
| Gamepad (W3C standard mapping) | D-pad 12/13, left stick Y ±0.55 | button 0 (1 on Nintendo) | button 1 (0 on Nintendo) | 9 Start: replay intro |

`js/input.js` → `createNavigator({ items, onSelect, onConfirm, onBack, onStart, prompts, labels, enabled })`. Pure helpers (`vendorOf`, `faceButtons`, `createRepeater`, `keyAction`) are unit-tested. Vendor from `gamepad.id` (`054c` Sony, `057e` Nintendo, else Xbox) [src: W3C Gamepad for mapping]. Verified by the author with a real pad. The Gamepad API may be blocked inside cross-origin iframes (artifact viewers).

Focus: in menus, focus selects and the wedge + cursor is the indicator; elsewhere a 3 px cyan outline. After an intro, focus moves to the first menu item without scrolling.

## 9. Accessibility checklist (every page)

- [ ] `npm test` passes for the site's theme; screenshots checked where text sits on water.
- [ ] Skip link; landmarks (`header`, `nav`, `main`, `footer`); one `h1`.
- [ ] Keyboard reaches everything; intro skippable; no traps.
- [ ] Reduced motion path; pause for any loop > 5 s.
- [ ] Touch targets ≥ 44 px; works at 200% zoom and 320 px width.
- [ ] Screen reader: menu labels read once, descriptions `aria-live="polite"`, decorative canvases `aria-hidden`.
- [ ] `lang` set; diacritics render.
- [ ] Sound off by default with a visual twin for every cue.

## 10. Performance budget

| Item | Budget |
|---|---|
| Long-form pages | 0 KB 3D JS; LCP < 2.0 s (Lighthouse mobile) |
| DS CSS | ≤ 25 KB raw (current build prints its size) |
| DS JS used on a page | ≤ 30 KB raw excluding three.js / model-viewer |
| Hubs | text + menu visible before any canvas; WebGL after first paint |
| Frame time | ≤ 16 ms at 1440 × 900 with DPR cap 1.5 |
| Heavy embeds | loaded only when their section or revision opens |

Record Lighthouse and bundle sizes under each site's `docs/…/evidence/`.

## 11. Sound [proposal]

Off by default; one toggle; `AudioContext` started on a gesture; synthesized, < 120 ms, low: move tick, confirm "bloop", back thud. No cue without a visual twin [src: UI sound guides].

## 12. Distribution, theming, versioning

- **Source of truth:** this repo (`~/Projects/Tools/atelier-ds`). `npm run build` → `dist/` (`atelier-ds.css`, `js/*.js`, `tokens.json`, `VERSION`).
- **Sites with a build (Astro blog):** depend on a git tag, e.g. `pnpm add github:AtelierMizumi/atelier-ds#v0.1.0` (after the repo is pushed), import `@ateliermizumi/atelier-ds/css`.
- **Static sites (Atelier6K):** `npm run vendor -- <site>` copies `dist/` into `<site>/vendor/atelier-ds/` with a README naming the version. Never edit the vendored copy.
- **Theme:** set `data-ds-theme="<name>"` on `<html>`. A theme overrides core colors only and must pass the contrast tests.
- **Site CSS** goes in its own file loaded after the DS and uses `--ds-*` tokens; cascade layers keep DS rules lower priority than site rules.
- **Versioning:** semver. Patch: fixes. Minor: new tokens/components. Major: renamed tokens/classes. Each release notes changes in `CHANGELOG.md`.
- **Fonts:** sites load Barlow Condensed, Be Vietnam Pro, JetBrains Mono (Google Fonts or self-hosted); the DS does not load fonts itself.

## 13. Sources

- Automaton, P3R UI: https://automaton-media.com/en/news/20240207-26873/
- UX in Motion: https://uxmag.com/articles/creating-usability-with-motion-the-ux-in-motion-manifesto
- web.dev animations: https://web.dev/articles/animations-guide
- Astro view transitions: https://docs.astro.build/en/guides/view-transitions ; caniuse: https://caniuse.com/cross-document-view-transitions
- WCAG 2.3.3: https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions
- W3C Gamepad: https://www.w3.org/TR/gamepad/
- three.js toon outlines: https://threejs.org/docs/pages/ToonOutlinePassNode.html
- Text splitting: https://adrianroselli.com/2026/02/you-know-what-just-dont-split-words-into-letters.html
- Game feel (weak, practitioner): https://www.gameanalytics.com/blog/squeezing-more-juice-out-of-your-game-design
- UI sound: https://www.awwwards.com/being-smart-with-sound.html

## 14. Open items

1. Original/licensed character art for hub heroes.
2. Intro on first visit only (proposal).
3. Publish the repo and tag v0.1.0 (needs the author's go-ahead).
4. Blog: apply the DS during the Astro rebuild; map Chirpy callouts to `.ds-callout`.
5. Sound and parallax after the above.
