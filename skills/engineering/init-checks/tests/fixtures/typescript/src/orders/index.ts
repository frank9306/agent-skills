import { charge } from '../payments/index.ts';

export function placeOrder(): string {
  return charge();
}
