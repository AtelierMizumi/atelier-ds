import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { contrast, resolveTheme } from '../src/js/color.js';

const tokens = JSON.parse(readFileSync(new URL('../tokens/tokens.json', import.meta.url)));

test('contrast() matches known WCAG values', () => {
  assert.equal(contrast('#000000', '#FFFFFF').toFixed(1), '21.0');
  assert.equal(contrast('#FFFFFF', '#FFFFFF').toFixed(1), '1.0');
  // order does not matter
  assert.equal(contrast('#F7FBFF', '#030A2A'), contrast('#030A2A', '#F7FBFF'));
});

test('resolveTheme() overrides only the listed colors', () => {
  const base = resolveTheme(tokens, 'atelier');
  const sixk = resolveTheme(tokens, 'sixk');
  assert.equal(base.cyan, '#62E6FF');
  assert.equal(sixk.cyan, '#38D6FF');
  assert.equal(sixk.paper, base.paper);
  assert.throws(() => resolveTheme(tokens, 'nope'));
});

for (const name of Object.keys(tokens.themes)) {
  const c = resolveTheme(tokens, name);
  for (const p of tokens.contrast.pairs) {
    test(`[${name}] ${p.fg} on ${p.bg} >= ${p.min} (${p.use})`, () => {
      const r = contrast(c[p.fg], c[p.bg]);
      assert.ok(r >= p.min, `${p.fg} ${c[p.fg]} on ${p.bg} ${c[p.bg]} is ${r.toFixed(2)}`);
    });
  }
  test(`[${name}] hero menu tints pass over mid water`, () => {
    const { bg, min, values } = tokens.contrast.menuTints;
    for (const v of values) {
      const r = contrast(v, c[bg]);
      assert.ok(r >= min, `${v} is ${r.toFixed(2)}`);
    }
  });
}
