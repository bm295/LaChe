export interface MenuItemOrder {
  /** Stable menu ID, e.g. "house-coffee" or a database UUID. */
  menuItemId: string;
  /** ISO-8601 timestamp at which the order was accepted. */
  orderedAt: string;
  /** Number of portions of this item on the order line. */
  quantity: number;
}

export interface ReportingPeriod {
  /** Inclusive ISO-8601 timestamp. */
  startsAt: string;
  /** Exclusive ISO-8601 timestamp. */
  endsAt: string;
}

export interface MostOrderedMenuItem {
  menuItemId: string;
  orderedQuantity: number;
}

/**
 * Finds the best-selling menu item for one shift, day, or week.
 *
 * This is the production form of the frequency-counting algorithm: a Map
 * supports unbounded string menu IDs and each order line can contain multiple
 * portions. Orders outside [startsAt, endsAt) are ignored. A lexical ID tie
 * break makes reports deterministic until the business defines another rule.
 */
export function findMostOrderedMenuItem(
  orders: MenuItemOrder[],
  reportingPeriod: ReportingPeriod
): MostOrderedMenuItem {
  const startsAt = parseTimestamp(reportingPeriod.startsAt, 'Reporting period start');
  const endsAt = parseTimestamp(reportingPeriod.endsAt, 'Reporting period end');

  if (startsAt >= endsAt) {
    throw new Error('Reporting period start must be before its end.');
  }

  const countByMenuItemId = new Map<string, number>();

  for (const order of orders) {
    validateOrder(order);
    const orderedAt = parseTimestamp(order.orderedAt, `Order time for ${order.menuItemId}`);

    if (orderedAt >= startsAt && orderedAt < endsAt) {
      countByMenuItemId.set(order.menuItemId, (countByMenuItemId.get(order.menuItemId) ?? 0) + order.quantity);
    }
  }

  let result: MostOrderedMenuItem | undefined;
  for (const [menuItemId, orderedQuantity] of countByMenuItemId) {
    if (!result || orderedQuantity > result.orderedQuantity ||
      (orderedQuantity === result.orderedQuantity && menuItemId.localeCompare(result.menuItemId) < 0)) {
      result = { menuItemId, orderedQuantity };
    }
  }

  if (!result) {
    throw new Error('No menu item orders were found in the reporting period.');
  }

  return result;
}

function validateOrder(order: MenuItemOrder): void {
  if (!order.menuItemId.trim()) {
    throw new Error('Menu item ID is required.');
  }
  if (!Number.isInteger(order.quantity) || order.quantity <= 0) {
    throw new Error(`Order quantity for ${order.menuItemId} must be a positive whole number.`);
  }
}

function parseTimestamp(value: string, label: string): number {
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) {
    throw new Error(`${label} must be a valid ISO-8601 timestamp.`);
  }
  return timestamp;
}
