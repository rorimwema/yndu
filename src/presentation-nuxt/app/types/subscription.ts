/**
 * Subscription Types
 * Type definitions for subscription functionality
 */

export type SubscriptionFrequency = 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
export type SubscriptionBoxSize = 'SMALL' | 'MEDIUM' | 'LARGE';
export type DeliveryDay = 'TUESDAY' | 'FRIDAY';
export type PaymentMode = 'WEEKLY' | 'MONTHLY' | 'PER_DELIVERY';
export type SubscriptionStatus = 'ACTIVE' | 'PAUSED' | 'CANCELLED' | 'EXPIRED';
export type ModificationType = 'PLAN' | 'BILLING_CYCLE' | 'DELIVERY_SLOT' | 'ITEMS';

export interface SubscriptionPlan {
  id: string;
  name: string;
  frequency: SubscriptionFrequency;
  boxSize: SubscriptionBoxSize;
  basePrice: number;
  discountPercentage: number;
  description: string;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  deliveryDay: DeliveryDay;
  paymentMode: PaymentMode;
  status: SubscriptionStatus;
  startDate: string;
  nextDeliveryDate: string;
  address: SubscriptionAddress;
  items?: SubscriptionItem[];
  totalWeeklyPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionAddress {
  label: string;
  street: string;
  apartment?: string;
  neighborhood: string;
  city: string;
  instructions?: string;
}

export interface SubscriptionItem {
  produceId: string;
  name: string;
  quantity: number;
  slots: number;
  weight: number;
  image: string;
}

export interface SubscriptionDelivery {
  id: string;
  subscriptionId: string;
  scheduledDate: string;
  status: 'SCHEDULED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  items: SubscriptionItem[];
  deliveredAt?: string;
}

export interface CreateSubscriptionInput {
  frequency: SubscriptionFrequency;
  boxSize: SubscriptionBoxSize;
  deliveryDay: DeliveryDay;
  paymentMode: PaymentMode;
  address: SubscriptionAddress;
  items?: SubscriptionItem[];
}

export interface SubscriptionPricing {
  basePrice: number;
  frequencyDiscount: number;
  paymentModeDiscount: number;
  finalPrice: number;
  weeklyEquivalent: number;
}

export const BOX_SIZE_CONFIG = {
  SMALL: {
    name: 'Small Box',
    slots: 12,
    basePrice: 1500,
    description: 'Perfect for individuals or couples',
    weightEstimate: '~3kg of produce',
    idealFor: ['1-2 people', 'Weekly cooking', 'Trying us out'],
  },
  MEDIUM: {
    name: 'Medium Box',
    slots: 20,
    basePrice: 2500,
    description: 'Great for small families',
    weightEstimate: '~5kg of produce',
    idealFor: ['3-4 people', 'Active cooks', 'Weekly meals'],
  },
  LARGE: {
    name: 'Large Box',
    slots: 30,
    basePrice: 3500,
    description: 'For larger families or plant-based households',
    weightEstimate: '~7.5kg of produce',
    idealFor: ['5+ people', 'Vegetarian/Vegan', 'Batch cooking'],
  },
} as const;

export const FREQUENCY_CONFIG = {
  WEEKLY: {
    label: 'Weekly',
    description: 'Delivered every week',
    discount: 0,
    deliveriesPerMonth: 4,
  },
  BIWEEKLY: {
    label: 'Bi-Weekly',
    description: 'Delivered every 2 weeks',
    discount: 5,
    deliveriesPerMonth: 2,
  },
  MONTHLY: {
    label: 'Monthly',
    description: 'Delivered once a month',
    discount: 10,
    deliveriesPerMonth: 1,
  },
} as const;

export const DELIVERY_DAY_CONFIG = {
  TUESDAY: {
    label: 'Tuesday',
    description: 'Morning delivery (9:00 AM - 1:00 PM)',
    timeRange: '9:00 AM - 1:00 PM',
  },
  FRIDAY: {
    label: 'Friday',
    description: 'Afternoon delivery (2:00 PM - 6:00 PM)',
    timeRange: '2:00 PM - 6:00 PM',
  },
} as const;

export const PAYMENT_MODE_CONFIG = {
  WEEKLY: {
    label: 'Pay Weekly',
    description: 'Billed every week before delivery',
    discount: 0,
  },
  MONTHLY: {
    label: 'Pay Monthly',
    description: 'Billed once per month (save 5%)',
    discount: 5,
  },
  PER_DELIVERY: {
    label: 'Pay Per Delivery',
    description: 'Pay as you go, no commitment',
    discount: 0,
  },
} as const;

// Subscription Management Types

export interface PauseRecord {
  startDate: string;
  endDate?: string;
  reason: string;
  createdAt: string;
}

export interface SubscriptionDeliverySlot {
  date: string;
  type: 'SAME_DAY' | 'NEXT_DAY';
}

export interface SubscriptionPricing {
  amount: number;
  currency: string;
}

export interface SubscriptionDetail {
  id: string;
  userId: string;
  planName: string;
  planDescription?: string;
  planPrice: SubscriptionPricing;
  billingCycle: SubscriptionFrequency;
  status: SubscriptionStatus;
  deliverySlot: SubscriptionDeliverySlot;
  deliveryAddressId: string;
  items: SubscriptionItem[];
  currentPeriodStart: string;
  currentPeriodEnd: string;
  nextBillingDate: string;
  pauseHistory: PauseRecord[];
  version: number;
}

export interface ModifySubscriptionInput {
  modificationType: ModificationType;
  newPlanName?: string;
  newPlanPriceCents?: number;
  newBillingCycle?: SubscriptionFrequency;
  newDeliveryDate?: string;
  newItems?: SubscriptionItem[];
}

export interface SubscriptionApiResponse<T> {
  data?: T;
  error?: string;
  code?: string;
}
