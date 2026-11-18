# atelier-ds

Shared design system for Atelier sites: the blog + portfolio and the Atelier6K demo.
Tokens, base CSS, components, motion helpers, console-style input (keyboard + gamepad) and the underwater background.

**Read [DESIGN.md](DESIGN.md) first.** It is the formula every page follows.

## Use it

Static site (no build step), e.g. Atelier6K:

```bash
npm run vendor -- ~/Projects/Keyboards/atelier-keypad-ds/site   # copies dist/ to site/vendor/atelier-ds/
```

```html
<html lang="en" data-ds-theme="sixk">
<link rel="stylesheet" href="vendor/atelier-ds/atelier-ds.css">
<link rel="stylesheet" href="style.css">   <!-- site rules, using --ds-* tokens -->
<script type="module">
  import { mountHud } from './vendor/atelier-ds/js/hud.js';
  import { createNavigator } from './vendor/atelier-ds/js/input.js';
</script>
```

Site with a build (Astro blog), once this repo is pushed and tagged:

```bash
pnpm add github:AtelierMizumi/atelier-ds#v0.1.0
```

```js
import '@ateliermizumi/atelier-ds/css';
import { createWater } from '@ateliermizumi/atelier-ds/water';
```

Fonts are not bundled: load Barlow Condensed, Be Vietnam Pro and JetBrains Mono.

## Develop

```bash
npm run build      # tokens/tokens.json + src/ -> dist/
npm test           # contrast for every theme, input logic, HUD math, build output
python3 -m http.server 8080   # then open http://localhost:8080/styleguide.html
```

| Path | What |
|---|---|
| `tokens/tokens.json` | source of truth: colors, type, space, shape, motion, z, themes, contrast pairs |
| `src/css/base.css` | element defaults (layer `ds-base`) |
| `src/css/components.css` | `ds-*` components (layer `ds-components`) |
| `src/js/` | `color`, `input`, `motion`, `hud`, `water` modules |
| `dist/` | build output, committed so sites can depend on a tag without building |
| `styleguide.html` | living catalog of everything above |

Adding a theme: add `themes.<name>.color` overrides in tokens.json, run `npm test` (it must pass every contrast pair), then set `data-ds-theme="<name>"` on the site's `<html>`.
