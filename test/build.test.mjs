import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const root = new URL('../', import.meta.url);
const tokens = JSON.parse(readFileSync(new URL('tokens/tokens.json', root)));
execFileSync(process.execPath, ['scripts/build.mjs'], { cwd: root });

const css = readFileSync(new URL('dist/atelier-ds.css', root), 'utf8');

test('dist CSS declares every core color and semantic token', () => {
  for (const k of Object.keys(tokens.core.color)) assert.match(css, new RegExp(`--ds-${k}:`), k);
  for (const k of Object.keys(tokens.semantic)) assert.match(css, new RegExp(`--ds-${k}:\\s*var\\(--ds-`), k);
});

test('dist CSS has a scoped block per theme', () => {
  for (const name of Object.keys(tokens.themes)) {
    if (name === 'atelier') continue;
    assert.match(css, new RegExp(`\\[data-ds-theme="${name}"\\]`), name);
  }
});

test('dist CSS includes base and components layers', () => {
  assert.match(css, /@layer ds-tokens, ds-base, ds-components;/);
  assert.match(css, /@layer ds-base/);
  assert.match(css, /@layer ds-components/);
});

test('dist ships the JS modules, tokens.json and VERSION', () => {
  for (const f of ['js/input.js', 'js/motion.js', 'js/water.js', 'js/hud.js', 'js/color.js', 'tokens.json', 'VERSION']) {
    assert.ok(existsSync(new URL(`dist/${f}`, root)), f);
  }
  assert.equal(readFileSync(new URL('dist/VERSION', root), 'utf8').trim(), tokens.version);
});
