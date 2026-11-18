// Console-style navigation for Atelier sites: keyboard + gamepad (W3C standard mapping),
// with input prompts that follow the device used last. Pure helpers are exported for tests.

/** Vendor family from a Gamepad.id string. */
export function vendorOf(id = '') {
  const s = id.toLowerCase();
  if (/054c|playstation|dualshock|dualsense/.test(s)) return 'ps';
  if (/057e|nintendo|pro controller|joy-con/.test(s)) return 'nintendo';
  return 'xbox';
}

/** Standard mapping: 0 = bottom face, 1 = right face. Nintendo confirms with the right face (A). */
export function faceButtons(vendor) {
  return vendor === 'nintendo' ? { confirm: 1, back: 0 } : { confirm: 0, back: 1 };
}

/** Hold-to-repeat: move at once, wait `delay`, then move every `rate` ms. step() returns -1, 0 or 1. */
export function createRepeater({ delay = 380, rate = 110 } = {}) {
  let dir = 0, next = 0;
  return {
    step(d, t) {
      if (d === 0) { dir = 0; return 0; }
      if (d !== dir) { dir = d; next = t + delay; return d; }
      if (t >= next) { next = t + rate; return d; }
      return 0;
    },
  };
}

/** Keys are handled everywhere when there is no scope, otherwise only when focus is inside it. */
export function inScope(scope, node) {
  if (!scope) return true;
  return !!node && scope.contains(node);
}

const KEYS = {
  ArrowDown: 'next', s: 'next', S: 'next', j: 'next', J: 'next',
  ArrowUp: 'prev', w: 'prev', W: 'prev', k: 'prev', K: 'prev',
  Home: 'first', End: 'last', Escape: 'back',
};

/** Keyboard key to an action name, or null. Digits 1-9 become `jump:<index>`. */
export function keyAction(key) {
  if (KEYS[key]) return KEYS[key];
  if (/^[1-9]$/.test(key)) return `jump:${Number(key) - 1}`;
  return null;
}

/* ------------------------------------------------------------------ icons */
const S = (inner) => `<svg viewBox="0 0 24 24" aria-hidden="true">${inner}</svg>`;
const STROKE = 'fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"';
export const ICONS = {
  updown: S(`<path d="M12 3.5v17M6.5 8.5 12 3l5.5 5.5M6.5 15.5 12 21l5.5-5.5" ${STROKE}/>`),
  enter: S(`<path d="M19 4.5v7a3.5 3.5 0 0 1-3.5 3.5H5.5M10 10l-5 5 5 5" ${STROKE}/>`),
  back: S(`<path d="M9 13.5 4 8.5l5-5M4 8.5h10a5.5 5.5 0 0 1 0 11h-3.5" ${STROKE}/>`),
  dpad: S('<path d="M9 2.5h6v6.5h6.5v6H15v6.5H9V15H2.5V9H9z" fill="currentColor"/><path d="M12 5.5l-1.6 2h3.2zM12 18.5l-1.6-2h3.2z" fill="var(--ds-paper)"/>'),
  letter: (ch, col) => S(`<text x="12" y="12.5" fill="${col}" class="ds-glyph">${ch}</text>`),
  cross: S('<path d="M6 6l12 12M18 6 6 18" fill="none" stroke="#2f6cf6" stroke-width="3.6" stroke-linecap="round"/>'),
  circle: S('<circle cx="12" cy="12" r="6.6" fill="none" stroke="#e5484d" stroke-width="3.4"/>'),
  play: S('<path d="M7 4.5 19 12 7 19.5z" fill="currentColor"/>'),
  pause: S('<path d="M6.5 4.5h4v15h-4zM13.5 4.5h4v15h-4z" fill="currentColor"/>'),
};

export const PROMPTS = {
  kb: { nav: ICONS.updown, confirm: ICONS.enter, back: ICONS.back },
  xbox: { nav: ICONS.dpad, confirm: ICONS.letter('A', '#2e9e3a'), back: ICONS.letter('B', '#e5484d') },
  ps: { nav: ICONS.dpad, confirm: ICONS.cross, back: ICONS.circle },
  nintendo: { nav: ICONS.dpad, confirm: ICONS.letter('A', '#05060f'), back: ICONS.letter('B', '#05060f') },
};

/* ------------------------------------------------------------------ runtime */
// Icons above are static strings; labels come from the caller, so escape them.
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
/**
 * Wire a list of items to keyboard + gamepad navigation.
 * @param {object} o
 * @param {HTMLElement[]} o.items   focusable elements in order
 * @param {(i:number)=>void} o.onSelect
 * @param {(i:number)=>void} [o.onConfirm]
 * @param {()=>void} [o.onBack]
 * @param {()=>void} [o.onStart]
 * @param {HTMLElement} [o.prompts]  element whose content becomes the prompt row
 * @param {{nav:string,confirm:string,back:string}} [o.labels]
 * @param {()=>boolean} [o.enabled]  return false to ignore input (e.g. during an intro)
 * @param {Element} [o.scope]        handle keys only while focus is inside this element (long, scrolling pages)
 * @param {boolean} [o.hoverSelects=true]  false when selecting is expensive (e.g. it loads a 3D model)
 */
export function createNavigator(o) {
  const items = o.items;
  const labels = o.labels || { nav: 'Select', confirm: 'Open', back: 'Back' };
  const enabled = o.enabled || (() => true);
  let cur = 0, mode = '', raf = 0;
  const rep = createRepeater();
  const held = {};

  const select = (i, focus = true) => {
    cur = (i + items.length) % items.length;
    o.onSelect(cur);
    if (focus) items[cur].focus({ preventScroll: true });
  };
  const setMode = (m) => {
    if (m === mode || !o.prompts) { mode = m; return; }
    mode = m;
    const p = PROMPTS[m];
    o.prompts.innerHTML = ['nav', 'confirm', 'back']
      .map((k) => `<span class="ds-prompt"><i class="ds-btn-round">${p[k]}</i><b>${esc(labels[k])}</b></span>`).join('');
  };
  setMode('kb');

  const hoverSelects = o.hoverSelects !== false;
  items.forEach((el, i) => {
    if (hoverSelects) el.addEventListener('mouseenter', () => select(i, false));
    el.addEventListener('focus', () => { if (cur !== i) select(i, false); });
  });
  // Back goes to the first item unless the site handles it.
  const back = () => { if (o.onBack) o.onBack(); else select(0); };

  const onKey = (e) => {
    setMode('kb');
    if (!enabled() || !inScope(o.scope, document.activeElement)) return;
    const a = keyAction(e.key);
    if (!a) return;
    e.preventDefault();
    if (a === 'next') select(cur + 1);
    else if (a === 'prev') select(cur - 1);
    else if (a === 'first') select(0);
    else if (a === 'last') select(items.length - 1);
    else if (a === 'back') back();
    else if (a.startsWith('jump:')) { const n = Number(a.slice(5)); if (n < items.length) select(n); }
  };
  addEventListener('keydown', onKey);

  const poll = (t) => {
    let pads = [];
    try { pads = navigator.getGamepads ? [...navigator.getGamepads()].filter(Boolean) : []; } catch { pads = []; }
    const p = pads[0];
    if (p) {
      const v = vendorOf(p.id), fb = faceButtons(v);
      const down = (i) => !!p.buttons[i]?.pressed;
      const ay = p.axes[1] || 0;
      const dir = down(13) || ay > 0.55 ? 1 : down(12) || ay < -0.55 ? -1 : 0;
      const edge = (k, on) => { const was = held[k]; held[k] = on; return on && !was; };
      if (p.buttons.some((b) => b.pressed) || Math.abs(ay) > 0.55) setMode(v);
      if (enabled()) {
        const m = rep.step(dir, t);
        if (m) select(cur + m);
        if (edge('ok', down(fb.confirm))) o.onConfirm?.(cur);
        if (edge('no', down(fb.back))) back();
        if (edge('start', down(9))) o.onStart?.();
      }
    }
    raf = requestAnimationFrame(poll);
  };
  raf = requestAnimationFrame(poll);

  return {
    get index() { return cur; },
    get mode() { return mode; },
    select,
    destroy() { removeEventListener('keydown', onKey); cancelAnimationFrame(raf); },
  };
}
