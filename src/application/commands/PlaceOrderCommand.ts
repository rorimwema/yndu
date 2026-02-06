import { UserId, AddressId, ProduceItemId } from '../../domain/value-objects/branded';
import { Quantity } from '../../domain/value-objects/Quantity';

export interface OrderItemCommand {
  produceId: ProduceItemId;
  quantity: Quantity;
}

export interface PlaceOrderCommand {
  userId: UserId;
  items: OrderItemCommand[];
  deliveryAddressId: AddressId;
  preferredDeliveryDate: Date;
  isSubscription: boolean;
  subscriptionFrequency?: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
}
