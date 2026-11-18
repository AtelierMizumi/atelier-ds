// WCAG 2.x relative luminance and contrast ratio, plus theme resolution for tokens.json.

const channel = (v) => {
  const c = v / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

export function luminance(hex) {
  const h = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => channel(parseInt(h.slice(i, i + 2), 16)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a, b) {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}

/** Core colors with one theme's overrides applied. Throws on an unknown theme. */
export function resolveTheme(tokens, name) {
  const theme = tokens.themes[name];
  if (!theme) throw new Error(`Unknown theme "${name}"`);
  return { ...tokens.core.color, ...(theme.color || {}) };
}
