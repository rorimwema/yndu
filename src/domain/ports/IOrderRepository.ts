import { Order } from '../aggregates/Order/Order.ts';
import { OrderId } from '../value-objects/branded.ts';

export interface IOrderRepository {
  save(order: Order): Promise<void>;
  findById(id: OrderId): Promise<Order | null>;
  findByUserId(userId: string): Promise<Order[]>;
}
