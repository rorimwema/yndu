import { ProduceItem } from '../aggregates/ProduceItem/ProduceItem';
import { ProduceItemId } from '../value-objects/branded';

export interface IInventoryRepository {
  save(item: ProduceItem): Promise<void>;
  findById(id: ProduceItemId): Promise<ProduceItem | null>;
  findByCategory(category: string): Promise<ProduceItem[]>;
  findAll(): Promise<ProduceItem[]>;
}
