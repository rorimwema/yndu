import { ProduceItem } from '../aggregates/ProduceItem/ProduceItem.ts';
import { ProduceItemId } from '../value-objects/branded.ts';

export interface IInventoryRepository {
  save(item: ProduceItem): Promise<void>;
  findById(id: ProduceItemId): Promise<ProduceItem | null>;
  findByCategory(category: string): Promise<ProduceItem[]>;
  findAll(): Promise<ProduceItem[]>;
  findByIds(ids: string[]): Promise<ProduceItem[]>;
  updateQuantity(id: ProduceItemId, quantity: number): Promise<void>;
  deactivate(id: ProduceItemId): Promise<void>;
}
