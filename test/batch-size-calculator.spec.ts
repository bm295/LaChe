import { describe, expect, it } from 'vitest';
import { calculateMaximumPortions } from '../src/domain/batch-size-calculator.js';

describe('calculateMaximumPortions', () => {
  it('calculates portions from recipe requirements, pack sizes, and pack counts', () => {
    expect(calculateMaximumPortions([
      { ingredientName: 'A', unitsRequiredPerPortion: 2, packCount: 3, unitsPerPack: 24 },
      { ingredientName: 'B', unitsRequiredPerPortion: 3, packCount: 2, unitsPerPack: 36 }
    ])).toBe(24);
  });

  it('uses the ingredient with the fewest possible portions', () => {
    expect(calculateMaximumPortions([
      { ingredientName: 'Coffee', unitsRequiredPerPortion: 2, packCount: 1, unitsPerPack: 24 },
      { ingredientName: 'Milk', unitsRequiredPerPortion: 3, packCount: 1, unitsPerPack: 36 }
    ])).toBe(12);
  });

  it('returns zero when an ingredient is out of stock', () => {
    expect(calculateMaximumPortions([
      { ingredientName: 'Coffee', unitsRequiredPerPortion: 2, packCount: 0, unitsPerPack: 24 }
    ])).toBe(0);
  });

  it('rejects missing, negative, and fractional quantities', () => {
    expect(() => calculateMaximumPortions([])).toThrow('At least one ingredient is required.');
    expect(() => calculateMaximumPortions([{ ingredientName: 'Coffee', unitsRequiredPerPortion: 2.5, packCount: 1, unitsPerPack: 24 }]))
      .toThrow('Ingredient Coffee must use positive whole-number recipe and pack quantities.');
    expect(() => calculateMaximumPortions([{ ingredientName: 'Coffee', unitsRequiredPerPortion: 2, packCount: -1, unitsPerPack: 24 }]))
      .toThrow('Ingredient Coffee must use a non-negative whole-number pack count.');
  });
});
