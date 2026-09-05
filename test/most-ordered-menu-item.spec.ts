import { describe, expect, it } from 'vitest';
import { findMostOrderedMenuItem } from '../src/domain/most-ordered-menu-item.js';

describe('findMostOrderedMenuItem', () => {
  it('finds the most ordered drink during an evening shift', () => {
    const eveningShift = { startsAt: '2026-09-05T18:00:00+07:00', endsAt: '2026-09-05T22:00:00+07:00' };
    const orders = [
      { menuItemId: 'house-coffee', orderedAt: '2026-09-05T18:10:00+07:00', quantity: 2 },
      { menuItemId: 'iced-latte', orderedAt: '2026-09-05T18:30:00+07:00', quantity: 3 },
      { menuItemId: 'iced-latte', orderedAt: '2026-09-05T20:15:00+07:00', quantity: 2 },
      { menuItemId: 'matcha-latte', orderedAt: '2026-09-05T21:00:00+07:00', quantity: 4 },
      { menuItemId: 'iced-latte', orderedAt: '2026-09-05T22:00:00+07:00', quantity: 10 }
    ];

    expect(findMostOrderedMenuItem(orders, eveningShift)).toEqual({ menuItemId: 'iced-latte', orderedQuantity: 5 });
  });

  it('chooses the lexical-smaller menu item ID when quantities are equal', () => {
    const period = { startsAt: '2026-09-05T00:00:00Z', endsAt: '2026-09-06T00:00:00Z' };
    const orders = [
      { menuItemId: 'zest-tea', orderedAt: '2026-09-05T10:00:00Z', quantity: 2 },
      { menuItemId: 'americano', orderedAt: '2026-09-05T11:00:00Z', quantity: 2 }
    ];

    expect(findMostOrderedMenuItem(orders, period)).toEqual({ menuItemId: 'americano', orderedQuantity: 2 });
  });

  it('rejects invalid data and periods with no orders', () => {
    const period = { startsAt: '2026-09-05T00:00:00Z', endsAt: '2026-09-06T00:00:00Z' };
    expect(() => findMostOrderedMenuItem([], period)).toThrow('No menu item orders were found in the reporting period.');
    expect(() => findMostOrderedMenuItem([{ menuItemId: 'coffee', orderedAt: '2026-09-05T10:00:00Z', quantity: 1.5 }], period))
      .toThrow('Order quantity for coffee must be a positive whole number.');
  });
});
