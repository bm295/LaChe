import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { InMemoryMenuRepository } from '../adapters/persistence/in-memory-menu.repository.ts';
import { BillSummary, calculateBill } from '../domain/billing-calculator.ts';
import { IngredientAvailability, calculateMaximumPortions } from '../domain/batch-size-calculator.ts';
import { findMostOrderedMenuItem, MenuItemOrder, MostOrderedMenuItem, ReportingPeriod } from '../domain/most-ordered-menu-item.ts';
import { AvailableTableGroup, findAvailableTableGroups, TableConnection, TableSnapshot } from '../domain/available-table-groups.ts';

@Injectable()
export class RestaurantService {
  public constructor(@Inject(InMemoryMenuRepository) private readonly menuRepository: InMemoryMenuRepository) {}
  public calculateBill(subtotal: number, discountRate = 0, maximumDiscount = 0): BillSummary { return calculateBill(subtotal, 0.1, 0.08, discountRate, maximumDiscount); }
  public calculateMaximumPortions(ingredients: IngredientAvailability[]): number {
    return calculateMaximumPortions(ingredients);
  }
  public findMostOrderedMenuItem(orders: MenuItemOrder[], reportingPeriod: ReportingPeriod): MostOrderedMenuItem {
    return findMostOrderedMenuItem(orders, reportingPeriod);
  }
  public findAvailableTableGroups(tables: readonly TableSnapshot[], connections: readonly TableConnection[]): AvailableTableGroup[] {
    return findAvailableTableGroups(tables, connections);
  }
  public async getMenuItem(id: string) {
    const item = await this.menuRepository.findById(id);
    if (!item) throw new NotFoundException(`Menu item ${id} was not found.`);
    return item;
  }
}
