/**
 * GraphQL Type Definitions
 * Based on the Yndu GraphQL Federation Schema
 */

// ============ Scalars ============
export type Money = number;
export type DateTime = string;

// ============ Enums ============
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
export type SlotType = 'SAME_DAY' | 'NEXT_DAY';
export type BoxSize = 'SMALL' | 'MEDIUM' | 'LARGE';
export type PaymentType = 'mpesa' | 'card';
export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'discover';

// ============ Inventory Types ============
export interface MoneyAmount {
    amount: number;
    currency: string;
}

export interface Quantity {
    value: number;
    unit: string;
}

export interface ProduceItem {
    id: string;
    name: string;
    nameSw: string;
    category: string;
    unitPrice: MoneyAmount;
    availableQuantity: Quantity;
    imageUrl?: string;
    description?: string;
}

export interface ProductCategory {
    id: string;
    name: string;
    nameSw: string;
}

// ============ Order Types ============
export interface OrderItem {
    id: string;
    produceId: string;
    produce: ProduceItem;
    quantity: number;
    unit: string;
    linePrice: MoneyAmount;
}

export interface Order {
    id: string;
    userId: string;
    items: OrderItem[];
    totalPrice: MoneyAmount;
    status: OrderStatus;
    deliveryDate: DateTime;
    slotType: SlotType;
    deliveryAddress?: Address;
    createdAt: DateTime;
    updatedAt: DateTime;
}

export interface CartItem {
    produceId: string;
    quantity: number;
}

export interface Cart {
    id: string;
    userId: string;
    items: CartItem[];
    totalPrice: MoneyAmount;
}

// ============ User Profile Types ============
export interface UserProfile {
    firstName: string;
    lastName: string;
    preferredLanguage: 'en' | 'sw';
    dateOfBirth?: DateTime;
    avatar?: string;
}

export interface UserProfileData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    preferredLanguage: 'en' | 'sw';
    dateOfBirth?: DateTime;
    avatar?: string;
    createdAt: DateTime;
}

// ============ Address Types ============
export interface Address {
    id: string;
    label: string;
    fullName: string;
    phone: string;
    street: string;
    city: string;
    zone: string;
    coordinates?: {
        latitude: number;
        longitude: number;
    };
    isDefault: boolean;
    instructions?: string;
}

export interface AddressInput {
    label: string;
    fullName: string;
    phone: string;
    street: string;
    city: string;
    zone: string;
    isDefault?: boolean;
    instructions?: string;
}

// ============ Payment Method Types ============
export interface PaymentMethod {
    id: string;
    type: PaymentType;
    label: string;
    last4?: string;
    brand?: CardBrand;
    phoneNumber?: string;
    expiryMonth?: number;
    expiryYear?: number;
    isDefault: boolean;
}

export interface MpesaInput {
    phoneNumber: string;
    label?: string;
}

export interface CardInput {
    cardNumber: string;
    expiryMonth: number;
    expiryYear: number;
    cvv: string;
    cardholderName: string;
    label?: string;
}

// ============ Notification Preferences ============
export interface NotificationPreferences {
    orderUpdates: {
        sms: boolean;
        email: boolean;
        push: boolean;
    };
    promotions: {
        sms: boolean;
        email: boolean;
        push: boolean;
    };
    deliveryNotifications: {
        sms: boolean;
        email: boolean;
        push: boolean;
    };
}

// ============ User Types ============
export interface User {
    id: string;
    email: string;
    phone: string;
    profile: UserProfile;
    addresses: Address[];
    paymentMethods?: PaymentMethod[];
    notificationPreferences?: NotificationPreferences;
    createdAt: DateTime;
}

// ============ Auth Types ============
export interface AuthPayload {
    token: string;
    user: User;
    expiresAt: DateTime;
}

export interface LoginInput {
    email: string;
    password: string;
}

export interface RegisterInput {
    email: string;
    password: string;
    phone: string;
    firstName: string;
    lastName: string;
}

export interface ChangePasswordInput {
    oldPassword: string;
    newPassword: string;
}

// ============ Delivery Types ============
export interface DeliverySlot {
    date: DateTime;
    slotType: SlotType;
    isAvailable: boolean;
    price: MoneyAmount;
}

// ============ GraphQL Response Types ============
export interface GraphQLError {
    message: string;
    path?: string[];
    extensions?: {
        code?: string;
        [key: string]: unknown;
    };
}

export interface GraphQLResponse<T> {
    data?: T;
    errors?: GraphQLError[];
}

// ============ Query Variables Types ============
export interface GetProductByIdVariables {
    id: string;
}

export interface GetProductsVariables {
    category?: string;
    search?: string;
    limit?: number;
    offset?: number;
}

export interface GetOrderByIdVariables {
    id: string;
    userId: string;
} // Fixed inconsistent definition

export interface GetUserOrdersVariables {
    userId: string;
    limit?: number;
    offset?: number;
}

export interface PlaceOrderInput {
    items: Array<{
        produceId: string;
        quantity: number;
    }>;
    deliveryDate: DateTime;
    slotType: SlotType;
    addressId: string;
    boxSize: BoxSize;
}

export interface UpdateOrderStatusVariables {
    orderId: string;
    status: OrderStatus;
}

export interface CancelOrderVariables {
    orderId: string;
    reason?: string;
}

export interface AddToCartVariables {
    produceId: string;
    quantity: number;
}

export interface RemoveFromCartVariables {
    cartItemId: string;
    quantity?: number; // Added optional quantity
}

export interface UpdateCartItemVariables {
    cartItemId: string;
    quantity: number;
}
