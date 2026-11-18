// HUD: date, weekday, time, analog mini clock and moon phase. Markup contract in DESIGN.md §6.2.

const pad = (n) => String(n).padStart(2, '0');

/** Moon age as a 0..1 fraction of the synodic month (0 = new, 0.5 = full). */
export function moonFraction(date = new Date()) {
  const days = (date - Date.UTC(2000, 0, 6, 18, 14)) / 864e5;
  return ((days / 29.530588853) % 1 + 1) % 1;
}

export const MOON_NAMES = {
  en: ['New moon', 'Waxing crescent', 'First quarter', 'Waxing gibbous', 'Full moon', 'Waning gibbous', 'Last quarter', 'Waning crescent'],
  vi: ['Trăng non', 'Trăng lưỡi liềm đầu tháng', 'Bán nguyệt đầu tháng', 'Trăng khuyết đầu tháng', 'Trăng tròn', 'Trăng khuyết cuối tháng', 'Bán nguyệt cuối tháng', 'Trăng lưỡi liềm cuối tháng'],
};

/** SVG path for the lit part of a moon of radius r centred at 0,0. */
export function moonPath(f, r = 11) {
  const rx = Math.abs(Math.cos(2 * Math.PI * f)) * r;
  const crescent = f < 0.25 || f > 0.75;
  return { d: `M0,${-r} A${r},${r} 0 0 1 0,${r} A${rx},${r} 0 0 ${crescent ? 0 : 1} 0,${-r}Z`, mirror: f >= 0.5 };
}

export const CLOCK_SVG = `<svg class="ds-hud__clock" viewBox="-100 -100 200 200" aria-hidden="true">
<circle r="97" fill="var(--ds-paper)"/><circle r="86" fill="none" stroke="var(--ds-mist)" stroke-width="14"/>
<g data-h><path d="M-6 8 L0 -46 L6 8 Z" fill="var(--ds-deep)"/></g>
<g data-m><path d="M-4.5 10 L0 -78 L4.5 10 Z" fill="var(--ds-ink)"/></g>
<g data-s><line y1="18" y2="-88" stroke="var(--ds-accent)" stroke-width="5"/></g>
<circle r="9" fill="var(--ds-ink)"/></svg>`;

export const MOON_SVG = `<svg class="ds-hud__moon" viewBox="-12 -12 24 24" aria-hidden="true">
<circle r="11" fill="var(--ds-deep)"/><path data-lit fill="var(--ds-mist)"/></svg>`;

/**
 * Fill a `.ds-hud` element and keep it live.
 * Children it looks for (all optional): [data-hud=date|day|time|phase|clock|moon].
 */
export function mountHud(root, { locale = 'en', tick = 1000 } = {}) {
  const q = (k) => root.querySelector(`[data-hud="${k}"]`);
  const clockHost = q('clock'), moonHost = q('moon');
  if (clockHost && !clockHost.querySelector('svg')) clockHost.innerHTML = CLOCK_SVG;
  if (moonHost && !moonHost.querySelector('svg')) moonHost.innerHTML = MOON_SVG;
  const rot = (sel, a) => clockHost?.querySelector(sel)?.setAttribute('transform', `rotate(${a})`);
  const render = () => {
    const n = new Date();
    const set = (k, v) => { const el = q(k); if (el) el.textContent = v; };
    set('date', `${pad(n.getMonth() + 1)}/${pad(n.getDate())}`);
    set('day', n.toLocaleDateString(locale, { weekday: 'short' }).toUpperCase().replace('.', ''));
    set('time', `${pad(n.getHours())}:${pad(n.getMinutes())}`);
    const f = moonFraction(n);
    set('phase', (MOON_NAMES[locale] || MOON_NAMES.en)[Math.round(f * 8) % 8]);
    const lit = moonHost?.querySelector('[data-lit]');
    if (lit) { const m = moonPath(f); lit.setAttribute('d', m.d); lit.setAttribute('transform', m.mirror ? 'scale(-1,1)' : ''); }
    const min = n.getMinutes() + n.getSeconds() / 60;
    rot('[data-s]', n.getSeconds() * 6); rot('[data-m]', min * 6); rot('[data-h]', ((n.getHours() % 12) + min / 60) * 30);
  };
  render();
  const id = setInterval(render, tick);
  return { render, stop: () => clearInterval(id) };
}
