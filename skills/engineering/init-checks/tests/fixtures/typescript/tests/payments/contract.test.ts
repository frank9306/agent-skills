import assert from 'node:assert/strict';
import test from 'node:test';
import { charge } from '../../src/payments/index.ts';

test('the public payment capability charges', () => {
  assert.equal(charge(), 'paid');
});
