import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { InMemoryMenuRepository } from '../adapters/persistence/in-memory-menu.repository.js';
import { BillSummary, calculateBill } from '../domain/billing-calculator.js';
import { IngredientAvailability, calculateMaximumPortions } from '../domain/batch-size-calculator.js';
import { findMostOrderedMenuItem, MenuItemOrder, MostOrderedMenuItem, ReportingPeriod } from '../domain/most-ordered-menu-item.js';

@Injectable()
export class RestaurantService {
  public constructor(@Inject(InMemoryMenuRepository) private readonly menuRepository: InMemoryMenuRepository) {}
  public calculateBill(subtotal: number): BillSummary { return calculateBill(subtotal, 0.1, 0.08); }
  public calculateMaximumPortions(ingredients: IngredientAvailability[]): number {
    return calculateMaximumPortions(ingredients);
  }
  public findMostOrderedMenuItem(orders: MenuItemOrder[], reportingPeriod: ReportingPeriod): MostOrderedMenuItem {
    return findMostOrderedMenuItem(orders, reportingPeriod);
  }
  public async getMenuItem(id: string) {
    const item = await this.menuRepository.findById(id);
    if (!item) throw new NotFoundException(`Menu item ${id} was not found.`);
    return item;
  }
}
