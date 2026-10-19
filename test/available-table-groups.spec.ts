import { describe, expect, it } from 'vitest';
import { findAvailableTableGroups, InvalidTableLayoutError, TableSnapshot } from '../src/domain/available-table-groups.ts';
import { RestaurantTable, TableStatus } from '../src/domain/table.ts';

const table = (number: number, status: TableStatus = 'available', capacity = 2): TableSnapshot =>
  ({ number, area: 'Dining room', capacity, status });

describe('findAvailableTableGroups', () => {
  it('groups connected available tables and sums their capacities', () => {
    expect(findAvailableTableGroups([table(1), table(2, 'available', 4), table(3)], [{ from: 2, to: 1 }]))
      .toEqual([{ tableNumbers: [1, 2], totalCapacity: 6 }, { tableNumbers: [3], totalCapacity: 2 }]);
  });

  it.each(['occupied', 'reserved'] as const)('%s tables break connections between available tables', (status) => {
    expect(findAvailableTableGroups([table(1), table(2, status), table(3)], [{ from: 1, to: 2 }, { from: 2, to: 3 }]))
      .toEqual([{ tableNumbers: [1], totalCapacity: 2 }, { tableNumbers: [3], totalCapacity: 2 }]);
  });

  it('visits each table once with cycles, duplicate edges and self connections', () => {
    const groups = findAvailableTableGroups([table(1), table(2), table(3)], [
      { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 1 }, { from: 1, to: 2 }, { from: 1, to: 1 }
    ]);
    expect(groups).toHaveLength(1);
    expect(groups[0].tableNumbers.sort()).toEqual([1, 2, 3]);
    expect(groups[0].totalCapacity).toBe(6);
  });

  it('returns no groups for an empty layout or no available tables', () => {
    expect(findAvailableTableGroups([], [])).toEqual([]);
    expect(findAvailableTableGroups([table(1, 'occupied'), table(2, 'reserved')], [])).toEqual([]);
  });

  it('does not infer connections from matching areas', () => {
    expect(findAvailableTableGroups([table(1), table(2)], [])).toHaveLength(2);
  });

  it('preserves frozen inputs and live table statuses across repeated calls', () => {
    const liveTable = new RestaurantTable(1, 'Dining room', 2);
    const tables = Object.freeze([Object.freeze(liveTable), Object.freeze(table(2))]);
    const connections = Object.freeze([Object.freeze({ from: 1, to: 2 })]);
    expect(findAvailableTableGroups(tables, connections)).toEqual(findAvailableTableGroups(tables, connections));
    expect(liveTable.status).toBe('available');
    expect(connections).toEqual([{ from: 1, to: 2 }]);
  });

  it('uses the current layout and table statuses on each call', () => {
    const middleTable = new RestaurantTable(2, 'Dining room', 4);
    const tables = [table(1), middleTable, table(3)];
    const connections = [{ from: 1, to: 2 }, { from: 2, to: 3 }];
    expect(findAvailableTableGroups(tables, connections)).toEqual([
      { tableNumbers: [1, 2, 3], totalCapacity: 8 }
    ]);

    middleTable.occupy();
    expect(findAvailableTableGroups(tables, connections)).toEqual([
      { tableNumbers: [1], totalCapacity: 2 }, { tableNumbers: [3], totalCapacity: 2 }
    ]);

    middleTable.release();
    expect(findAvailableTableGroups(tables, [])).toEqual([
      { tableNumbers: [1], totalCapacity: 2 },
      { tableNumbers: [2], totalCapacity: 4 },
      { tableNumbers: [3], totalCapacity: 2 }
    ]);
  });

  it('rejects duplicate numbers and connections to missing tables', () => {
    expect(() => findAvailableTableGroups([table(1), table(1)], [])).toThrow(InvalidTableLayoutError);
    expect(() => findAvailableTableGroups([table(1)], [{ from: 1, to: 2 }])).toThrow(InvalidTableLayoutError);
  });

  it('validates connections even when no tables are available', () => {
    expect(() => findAvailableTableGroups([table(1, 'occupied')], [{ from: 1, to: 99 }]))
      .toThrow('Each connection must reference two existing tables.');
    expect(() => findAvailableTableGroups([], [{ from: 1, to: 2 }]))
      .toThrow('Each connection must reference two existing tables.');
  });

  it.each([
    { number: 0 }, { number: 1.5 }, { capacity: -1 }, { capacity: 2.5 }, { area: '' }, { status: 'unknown' }
  ])('rejects invalid table data: %j', (invalid) => {
    expect(() => findAvailableTableGroups([{ ...table(1), ...invalid } as TableSnapshot], [])).toThrow(InvalidTableLayoutError);
  });

  it('handles a long chain without recursive stack overflow', () => {
    const tables = Array.from({ length: 15000 }, (_, index) => table(index + 1));
    const connections = tables.slice(1).map((current) => ({ from: current.number - 1, to: current.number }));
    const groups = findAvailableTableGroups(tables, connections);
    expect(groups).toHaveLength(1);
    expect(groups[0].tableNumbers).toHaveLength(15000);
    expect(groups[0].totalCapacity).toBe(30000);
  });

  it('rejects capacity totals beyond the safe integer range', () => {
    expect(() => findAvailableTableGroups([table(1, 'available', Number.MAX_SAFE_INTEGER), table(2)], [{ from: 1, to: 2 }]))
      .toThrow(InvalidTableLayoutError);
  });
});
