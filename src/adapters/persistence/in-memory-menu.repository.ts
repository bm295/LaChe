import { Injectable } from '@nestjs/common';
import { MenuItem, MenuRepository } from '../../application/ports/menu.repository.js';

@Injectable()
export class InMemoryMenuRepository implements MenuRepository {
  private readonly items = new Map<string, MenuItem>([['house-coffee', { id: 'house-coffee', name: 'House Coffee', price: 4.5 }]]);
  public async findById(id: string): Promise<MenuItem | undefined> { return this.items.get(id); }
}
