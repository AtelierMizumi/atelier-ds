import { test } from 'node:test';
import assert from 'node:assert/strict';
import { vendorOf, faceButtons, createRepeater, keyAction, inScope } from '../src/js/input.js';

test('vendorOf() reads the vendor from gamepad ids', () => {
  assert.equal(vendorOf('DualSense Wireless Controller (STANDARD GAMEPAD Vendor: 054c Product: 0ce6)'), 'ps');
  assert.equal(vendorOf('Pro Controller (STANDARD GAMEPAD Vendor: 057e Product: 2009)'), 'nintendo');
  assert.equal(vendorOf('Xbox Wireless Controller (STANDARD GAMEPAD Vendor: 045e Product: 0b13)'), 'xbox');
  assert.equal(vendorOf('Some generic pad'), 'xbox');
});

test('faceButtons() swaps confirm and back on Nintendo layouts', () => {
  assert.deepEqual(faceButtons('xbox'), { confirm: 0, back: 1 });
  assert.deepEqual(faceButtons('ps'), { confirm: 0, back: 1 });
  assert.deepEqual(faceButtons('nintendo'), { confirm: 1, back: 0 });
});

test('createRepeater() moves once, waits, then repeats at the rate', () => {
  const r = createRepeater({ delay: 380, rate: 110 });
  assert.equal(r.step(1, 0), 1);      // first press moves at once
  assert.equal(r.step(1, 100), 0);    // still inside the delay
  assert.equal(r.step(1, 379), 0);
  assert.equal(r.step(1, 381), 1);    // delay passed
  assert.equal(r.step(1, 450), 0);    // inside the rate
  assert.equal(r.step(1, 492), 1);    // rate passed
  assert.equal(r.step(0, 500), 0);    // released
  assert.equal(r.step(-1, 510), -1);  // new direction moves at once
});

test('inScope() is true without a scope and only inside one when given', () => {
  const inside = {}, outside = {};
  const scope = { contains: (n) => n === inside };
  assert.equal(inScope(null, outside), true);
  assert.equal(inScope(scope, inside), true);
  assert.equal(inScope(scope, outside), false);
  assert.equal(inScope(scope, null), false);
});

test('keyAction() maps keys to actions', () => {
  assert.equal(keyAction('ArrowDown'), 'next');
  assert.equal(keyAction('s'), 'next');
  assert.equal(keyAction('j'), 'next');
  assert.equal(keyAction('ArrowUp'), 'prev');
  assert.equal(keyAction('W'), 'prev');
  assert.equal(keyAction('Home'), 'first');
  assert.equal(keyAction('End'), 'last');
  assert.equal(keyAction('Escape'), 'back');
  assert.equal(keyAction('3'), 'jump:2');
  assert.equal(keyAction('x'), null);
});
