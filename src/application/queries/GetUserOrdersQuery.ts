import { OrderStatus } from '../../domain/aggregates/Order/Order.ts';
import { UserId } from '../../domain/value-objects/branded.ts';

export interface GetUserOrdersQuery {
  userId: UserId;
  status?: OrderStatus;
  fromDate?: Date;
  toDate?: Date;
  limit: number;
  offset: number;
}

export interface UserOrderDto {
  id: string;
  status: OrderStatus;
  totalPrice: string;
  itemCount: number;
  deliveryDate: string;
  slotType: 'SAME_DAY' | 'NEXT_DAY';
  canCancel: boolean;
  canReorder: boolean;
}
