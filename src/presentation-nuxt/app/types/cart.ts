/**
 * Cart Types
 * Type definitions for the shopping cart functionality
 */

export interface CartItem {
    id: string;
    productId: string;
    name: string;
    price: number;
    quantity: number;
    weight: number;
    image: string;
    unit: string;
}

export interface CartState {
    items: CartItem[];
    isOpen: boolean;
}

export interface CartTotals {
    subtotal: number;
    delivery: number;
    total: number;
}

export interface AddToCartInput {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    weight: number;
    image: string;
    unit: string;
}

export interface BoxCartItem extends CartItem {
    type: 'box';
    size: 'SMALL' | 'MEDIUM' | 'LARGE';
    contents: BoxContentItem[];
}

export interface BoxContentItem {
    produceId: string;
    name: string;
    quantity: number;
    weight: number;
}

export type CartItemType = CartItem | BoxCartItem;
