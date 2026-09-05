import { describe, expect, it } from 'vitest';
import { calculateBill } from '../src/domain/billing-calculator.js';

describe('calculateBill', () => {
  it('includes service charge and VAT', () => expect(calculateBill(100, 0.1, 0.08)).toEqual({ subtotal: 100, serviceCharge: 10, vat: 8.8, total: 118.8 }));
  it('rounds amounts to two decimal places', () => expect(calculateBill(10.005, 0.1, 0.08)).toEqual({ subtotal: 10.01, serviceCharge: 1, vat: 0.88, total: 11.89 }));
});
