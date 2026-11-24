// Pricing rules shared by the cart (browser) and order creation (server).

export const FREE_SHIPPING_LIMIT = 500;
export const SHIPPING_FEE = 49.9;

export function shippingFor(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_LIMIT ? 0 : SHIPPING_FEE;
}

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}
