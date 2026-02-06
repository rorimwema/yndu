import { IInventoryRepository } from '../../../domain/ports/IInventoryRepository';
import { ProduceItem, ProduceCategory } from '../../../domain/aggregates/ProduceItem/ProduceItem';
import { ProduceItemId } from '../../../domain/value-objects/branded';
import { Money } from '../../../domain/value-objects/Money';
import { Quantity } from '../../../domain/value-objects/Quantity';

export class PostgresInventoryRepository implements IInventoryRepository {
  constructor(private db: any) {}

  async save(item: ProduceItem): Promise<void> {
    await this.db('produce_items')
      .insert({
        id: item.id,
        name: item.name,
        name_sw: item.nameSw,
        category: item.category,
        unit_price_cents: item.unitPrice.amount,
        available_quantity: item.availableQuantity.value,
        unit: item.availableQuantity.unit,
        reorder_threshold: item.reorderThreshold.value,
      })
      .onConflict('id')
      .merge();
  }

  async findById(id: ProduceItemId): Promise<ProduceItem | null> {
    const row = await this.db('produce_items').where('id', id).first();
    if (!row) return null;

    return this.fromRow(row);
  }

  async findByCategory(category: string): Promise<ProduceItem[]> {
    const rows = await this.db('produce_items')
      .where('category', category)
      .where('is_active', true);

    return rows.map((row: any) => this.fromRow(row));
  }

  async findAll(): Promise<ProduceItem[]> {
    const rows = await this.db('produce_items').where('is_active', true);
    return rows.map((row: any) => this.fromRow(row));
  }

  private fromRow(row: any): ProduceItem {
    return new ProduceItem({
      id: row.id as ProduceItemId,
      name: row.name,
      nameSw: row.name_sw,
      category: row.category as ProduceCategory,
      unitPrice: Money.fromCents(row.unit_price_cents),
      availableQuantity: new Quantity(row.available_quantity, row.unit),
      reorderThreshold: new Quantity(row.reorder_threshold, row.unit),
      isSeasonal: row.is_seasonal,
      seasonStart: row.season_start ? new Date(row.season_start) : undefined,
      seasonEnd: row.season_end ? new Date(row.season_end) : undefined,
      imageUrl: row.image_url,
    });
  }
}
