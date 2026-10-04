import { describe, expect, it } from 'vitest';
import { calculateBill } from '../src/domain/billing-calculator.js';

describe('calculateBill', () => {
  it('includes service charge and VAT', () => expect(calculateBill(100, 0.1, 0.08)).toEqual({ subtotal: 100, discount: 0, serviceCharge: 10, vat: 8.8, total: 118.8 }));
  it('rounds amounts to two decimal places', () => expect(calculateBill(10.005, 0.1, 0.08)).toEqual({ subtotal: 10.01, discount: 0, serviceCharge: 1, vat: 0.88, total: 11.89 }));
  it('implements the capped discount scenario, taxing the discounted amount', () => {
    expect(calculateBill(1000000, 0.1, 0.08, 0.2, 100000)).toEqual({
      subtotal: 1000000, discount: 100000, serviceCharge: 90000, vat: 79200, total: 1069200
    });
  });
  it.each([
    [200000, 0.2, 100000, 40000, 190080],
    [500000, 0.2, 100000, 100000, 475200],
    [100000, 0, 100000, 0, 118800],
    [100000, 0.2, 0, 0, 118800],
    [100000, 1, 200000, 100000, 0],
    [0, 0.2, 100000, 0, 0]
  ])('handles subtotal %s, rate %s and cap %s', (subtotal, rate, cap, discount, total) => {
    expect(calculateBill(subtotal, 0.1, 0.08, rate, cap)).toMatchObject({ discount, total });
  });
  it.each([
    [-1, 0.2, 100], [NaN, 0.2, 100], [Infinity, 0.2, 100],
    [100, -0.1, 100], [100, 1.1, 100], [100, NaN, 100],
    [100, Infinity, 100], [100, 0.2, -1], [100, 0.2, NaN], [100, 0.2, Infinity]
  ])('rejects invalid subtotal %s, rate %s or cap %s', (subtotal, rate, cap) => {
    expect(() => calculateBill(subtotal, 0.1, 0.08, rate, cap)).toThrow();
  });
});
