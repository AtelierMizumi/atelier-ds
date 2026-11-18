import { test } from 'node:test';
import assert from 'node:assert/strict';
import { moonFraction, moonPath } from '../src/js/hud.js';

const NEW = Date.UTC(2000, 0, 6, 18, 14);
const DAY = 864e5;

test('moonFraction() is 0 at the reference new moon and ~0.5 half a month later', () => {
  assert.ok(moonFraction(new Date(NEW)) < 1e-9);
  assert.ok(Math.abs(moonFraction(new Date(NEW + 14.765294 * DAY)) - 0.5) < 1e-6);
  assert.ok(moonFraction(new Date(NEW - DAY)) > 0.9); // before the reference wraps, never negative
});

test('moonPath() mirrors the lit side once the moon wanes', () => {
  assert.equal(moonPath(0.2).mirror, false);
  assert.equal(moonPath(0.7).mirror, true);
  assert.match(moonPath(0.5).d, /^M0,-11 A11,11/);
});
