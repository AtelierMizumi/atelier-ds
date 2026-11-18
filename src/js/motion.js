// Motion helpers that follow the DS tokens. All of them respect prefers-reduced-motion
// and animate only transform/opacity (plus mask on the one hero sweep).

export const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

const css = (name, el = document.documentElement) => getComputedStyle(el).getPropertyValue(`--ds-motion-${name}`).trim();
const ms = (v) => (v.endsWith('ms') ? parseFloat(v) : parseFloat(v) * 1000);
export const token = {
  get instant() { return ms(css('instant') || '80ms'); },
  get quick() { return ms(css('quick') || '180ms'); },
  get base() { return ms(css('base') || '260ms'); },
  get emph() { return ms(css('emph') || '480ms'); },
  get hero() { return ms(css('hero') || '760ms'); },
  get stagger() { return ms(css('stagger') || '55ms'); },
  get snap() { return css('ease-snap') || 'cubic-bezier(.2,.9,.25,1.25)'; },
  get out() { return css('ease-out') || 'cubic-bezier(.05,.7,.1,1)'; },
  get inout() { return css('ease-inout') || 'cubic-bezier(.65,0,.35,1)'; },
};

/** Items slide in along the lean, one after another. */
export function cascade(els, { delay = 0, from = -60 } = {}) {
  if (reduced()) return;
  [...els].forEach((el, i) => el.animate(
    [{ opacity: 0, transform: `translateX(${from}px) skewX(-12deg)` }, { opacity: 1 }],
    { duration: token.base, delay: delay + i * token.stagger, easing: token.snap, fill: 'backwards' }));
}

/** Short brightness flash on confirm. */
export function press(el) {
  if (reduced()) return;
  el.animate([{ filter: 'brightness(1)' }, { filter: 'brightness(2.2)' }, { filter: 'brightness(1)' }], { duration: 280, easing: 'ease-out' });
}

/** Restart the slab wipe on a `.ds-wipe` container (used when content inside it is swapped). */
export function wipe(container) {
  if (reduced()) return;
  container.classList.remove('is-wiping');
  void container.offsetWidth;
  container.classList.add('is-wiping');
}

/** Shared element: move `el` onto `target` along an arc, then call done(). */
export function flyTo(el, target, { duration = 560, done } = {}) {
  const a = el.getBoundingClientRect(), b = target.getBoundingClientRect();
  const dx = b.left + b.width / 2 - (a.left + a.width / 2);
  const dy = b.top + b.height / 2 - (a.top + a.height / 2);
  const s = b.width / a.width;
  if (reduced()) { done?.(); return; }
  const anim = el.animate([
    { transform: 'none' },
    { transform: `translate(${dx * 0.45}px,${dy * 0.7}px) scale(${0.2 + s}) rotate(-14deg)`, offset: 0.55 },
    { transform: `translate(${dx}px,${dy}px) scale(${s})` },
  ], { duration, easing: 'cubic-bezier(.65,0,.25,1)', fill: 'forwards' });
  anim.onfinish = () => {
    done?.();
    target.animate([{ transform: 'scale(1.35)' }, { transform: 'scale(.92)', offset: 0.6 }, { transform: 'scale(1)' }], { duration: 260, easing: 'ease-out' });
  };
}

/**
 * Clock wipe: a screen-wide hand sweeps 360° from `fromDeg` around (cx, cy) and reveals what is under `layer`
 * by masking it away. `hand` is a `.ds-sweep` element. Resolves when done.
 */
export function sweepReveal(layer, hand, { cx, cy, fromDeg = 0, duration, onProgress } = {}) {
  return new Promise((resolve) => {
    if (reduced()) { layer.hidden = true; resolve(); return; }
    const d = duration || token.hero;
    const bar = hand.firstElementChild;
    Object.assign(hand.style, { left: `${cx}px`, top: `${cy}px`, display: 'block' });
    const inout = (t) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);
    const t0 = performance.now();
    const step = (t) => {
      const k = Math.min(1, (t - t0) / d), sweep = inout(k) * 360, ang = fromDeg + sweep;
      bar.style.transform = `rotate(${ang - 90}deg)`;
      const m = `conic-gradient(from ${fromDeg}deg at ${cx}px ${cy}px, transparent 0deg ${sweep}deg, #000 ${sweep}deg 360deg)`;
      layer.style.webkitMaskImage = m; layer.style.maskImage = m;
      onProgress?.(k, ang);
      if (k < 1) { requestAnimationFrame(step); return; }
      layer.hidden = true; layer.style.maskImage = layer.style.webkitMaskImage = '';
      hand.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160 }).onfinish = () => { hand.style.display = 'none'; };
      resolve();
    };
    requestAnimationFrame(step);
  });
}
