export type TableStatus = 'available' | 'reserved' | 'occupied';

export class RestaurantTable {
  public status: TableStatus = 'available';
  public constructor(public readonly number: number, public readonly area: string, public readonly capacity: number) {}
  public reserve(): void { this.status = 'reserved'; }
  public occupy(): void { this.status = 'occupied'; }
  public release(): void { this.status = 'available'; }
}
