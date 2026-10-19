import type { RestaurantTable } from './table.ts';

export type TableSnapshot = Readonly<Pick<RestaurantTable, 'number' | 'area' | 'capacity' | 'status'>>;

/** An explicit, undirected permission to join two tables. */
export interface TableConnection {
  readonly from: number;
  readonly to: number;
}

export interface AvailableTableGroup {
  tableNumbers: number[];
  totalCapacity: number;
}

export class InvalidTableLayoutError extends Error {}

/**
 * Finds connected components containing only available tables in O(V + E).
 * Connections are authoritative; sharing an area does not imply adjacency.
 * A component is a candidate group, not a guarantee that every table can be
 * joined simultaneously. Input objects and table statuses are never changed.
 */
export function findAvailableTableGroups(
  tables: readonly TableSnapshot[],
  connections: readonly TableConnection[]
): AvailableTableGroup[] {
  const { byNumber, neighbors } = validateAndBuildTableGraph(tables, connections);
  const visited = new Set<number>();
  const groups: AvailableTableGroup[] = [];
  for (const table of tables) {
    if (table.status !== 'available' || visited.has(table.number)) continue;

    const group: AvailableTableGroup = { tableNumbers: [], totalCapacity: 0 };
    const stack = [table.number];
    visited.add(table.number);
    while (stack.length > 0) {
      const number = stack.pop()!;
      group.tableNumbers.push(number);
      group.totalCapacity += byNumber.get(number)!.capacity;
      if (!Number.isSafeInteger(group.totalCapacity)) {
        throw new InvalidTableLayoutError('Group capacity exceeds the safe integer range.');
      }
      for (const neighbor of neighbors.get(number)!) {
        if (!visited.has(neighbor) && byNumber.get(neighbor)!.status === 'available') {
          visited.add(neighbor);
          stack.push(neighbor);
        }
      }
    }
    groups.push(group);
  }
  return groups;
}

function validateAndBuildTableGraph(
  tables: readonly TableSnapshot[],
  connections: readonly TableConnection[]
): { byNumber: ReadonlyMap<number, TableSnapshot>; neighbors: ReadonlyMap<number, readonly number[]> } {
  if (!Array.isArray(tables) || !Array.isArray(connections)) {
    throw new InvalidTableLayoutError('Tables and connections must be arrays.');
  }

  const byNumber = new Map<number, TableSnapshot>();
  const neighbors = new Map<number, number[]>();
  for (const table of tables) {
    if (!table || !Number.isSafeInteger(table.number) || table.number <= 0 ||
        typeof table.area !== 'string' || !table.area.trim() ||
        !Number.isSafeInteger(table.capacity) || table.capacity <= 0 ||
        !['available', 'reserved', 'occupied'].includes(table.status)) {
      throw new InvalidTableLayoutError('Each table requires a positive whole-number number and capacity, an area, and a valid status.');
    }
    if (byNumber.has(table.number)) {
      throw new InvalidTableLayoutError(`Duplicate table number: ${table.number}.`);
    }
    byNumber.set(table.number, table);
    neighbors.set(table.number, []);
  }

  for (const connection of connections) {
    if (!connection || !byNumber.has(connection.from) || !byNumber.has(connection.to)) {
      throw new InvalidTableLayoutError('Each connection must reference two existing tables.');
    }
    neighbors.get(connection.from)!.push(connection.to);
    neighbors.get(connection.to)!.push(connection.from);
  }
  return { byNumber, neighbors };
}
