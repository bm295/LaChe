import { Injectable, NotFoundException } from '@nestjs/common';
import { InMemoryMenuRepository } from '../adapters/persistence/in-memory-menu.repository.js';
import { BillSummary, calculateBill } from '../domain/billing-calculator.js';

@Injectable()
export class RestaurantService {
  public constructor(private readonly menuRepository: InMemoryMenuRepository) {}
  public calculateBill(subtotal: number): BillSummary { return calculateBill(subtotal, 0.1, 0.08); }
  public async getMenuItem(id: string) {
    const item = await this.menuRepository.findById(id);
    if (!item) throw new NotFoundException(`Menu item ${id} was not found.`);
    return item;
  }
}
