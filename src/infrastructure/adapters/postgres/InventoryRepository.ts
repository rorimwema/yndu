import { IInventoryRepository } from '../../../domain/ports/IInventoryRepository.ts';
import {
  ProduceCategory,
  ProduceItem,
} from '../../../domain/aggregates/ProduceItem/ProduceItem.ts';
import { ProduceItemId } from '../../../domain/value-objects/branded.ts';
import { Money } from '../../../domain/value-objects/Money.ts';
import { Quantity } from '../../../domain/value-objects/Quantity.ts';

interface KnexDB {
  (table: string): KnexDB;
  where: (...args: unknown[]) => KnexDB;
  whereIn: (column: string, values: unknown[]) => KnexDB;
  first: () => Promise<Record<string, unknown> | undefined>;
  insert: (data: Record<string, unknown>) => KnexDB;
  onConflict: (column: string) => { merge: () => Promise<void> };
  update: (data: Record<string, unknown>) => Promise<void>;
}

export class PostgresInventoryRepository implements IInventoryRepository {
  constructor(private db: KnexDB) {}

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

    return rows.map((row: Record<string, unknown>) => this.fromRow(row));
  }

  async findAll(): Promise<ProduceItem[]> {
    const rows = await this.db('produce_items').where('is_active', true);
    return rows.map((row: Record<string, unknown>) => this.fromRow(row));
  }

  async findByIds(ids: string[]): Promise<ProduceItem[]> {
    if (!ids.length) return [];
    const rows = await this.db('produce_items')
      .whereIn('id', ids)
      .where('is_active', true);
    return rows.map((row: Record<string, unknown>) => this.fromRow(row));
  }

  async updateQuantity(id: ProduceItemId, quantity: number): Promise<void> {
    await this.db('produce_items')
      .where('id', id)
      .update({ available_quantity: quantity, updated_at: new Date() });
  }

  async deactivate(id: ProduceItemId): Promise<void> {
    await this.db('produce_items')
      .where('id', id)
      .update({ is_active: false, updated_at: new Date() });
  }

  private fromRow(row: Record<string, unknown>): ProduceItem {
    const seasonStart = row.season_start ? new Date(row.season_start) : undefined;
    const seasonEnd = row.season_end ? new Date(row.season_end) : undefined;

    return new ProduceItem({
      id: row.id as ProduceItemId,
      name: row.name,
      nameSw: row.name_sw,
      category: row.category as ProduceCategory,
      unitPrice: Money.fromCents(row.unit_price_cents),
      availableQuantity: Quantity.kilograms(row.available_quantity),
      reorderThreshold: Quantity.kilograms(row.reorder_threshold || 0),
      isSeasonal: row.is_seasonal || false,
      seasonStart: seasonStart ?? undefined,
      seasonEnd: seasonEnd ?? undefined,
      imageUrl: row.image_url,
    });
  }
}
