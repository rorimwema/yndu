import { GetUserOrdersQuery, UserOrderDto } from '../queries/GetUserOrdersQuery.ts';

export interface IQueryHandler<Q, R> {
  execute(query: Q): Promise<R>;
}

export class GetUserOrdersHandler implements IQueryHandler<GetUserOrdersQuery, UserOrderDto[]> {
  constructor(private db: unknown) {}

  async execute(query: GetUserOrdersQuery): Promise<UserOrderDto[]> {
    let dbQuery = this.db('orders')
      .where('user_id', query.userId)
      .orderBy('placed_at', 'desc')
      .limit(query.limit)
      .offset(query.offset);

    if (query.status) {
      dbQuery = dbQuery.where('status', query.status);
    }

    if (query.fromDate) {
      dbQuery = dbQuery.where('delivery_date', '>=', query.fromDate);
    }

    if (query.toDate) {
      dbQuery = dbQuery.where('delivery_date', '<=', query.toDate);
    }

    const rows = await dbQuery;

    return rows.map((row: Record<string, unknown>) => ({
      id: row.id,
      status: row.status,
      totalPrice: formatKES(row.total_price_cents),
      itemCount: row.items?.length || 0,
      deliveryDate: formatDate(row.delivery_date),
      slotType: row.slot_type,
      canCancel: ['PENDING', 'CONFIRMED'].includes(row.status),
      canReorder: row.status === 'DELIVERED',
    }));
  }
}

function formatKES(cents: number): string {
  return `KES ${(cents / 100).toFixed(2)}`;
}

function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-KE');
}
