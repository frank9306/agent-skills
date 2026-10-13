import assert from 'node:assert/strict';
import test from 'node:test';
import { placeOrder } from '../../src/orders/index.ts';

test('an order uses the payment capability', () => {
  assert.equal(placeOrder(), 'paid');
});
