/**
 * Admin Types
 * Type definitions for admin panel data structures
 * These types are designed to match expected backend API responses
 */

// ============ Orders ============
export interface OrderCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  price: number;
  unit: string;
}

export interface OrderRider {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'ASSIGNED'
  | 'DISPATCHED'
  | 'DELIVERED'
  | 'CANCELLED';

export interface Order {
  id: string;
  customer: OrderCustomer;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  priority: boolean;
  createdAt: string;
  updatedAt?: string;
  deliveryAddress: string;
  deliverySlot: string;
  rider: OrderRider | null;
  notes?: string;
}

// ============ Customers ============
export type CustomerType = 'individual' | 'b2b';
export type LoyaltyTier = 'bronze' | 'silver' | 'gold' | 'platinum';
export type CustomerStatus = 'active' | 'inactive';
export type PaymentTerms = 'net30' | 'net60' | 'immediate' | 'prepaid';

export interface CustomerBase {
  id: string;
  type: CustomerType;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  location: string;
  orders: number;
  totalSpent: number;
  lastOrder: string;
  joinedAt: string;
  status: CustomerStatus;
}

export interface IndividualCustomer extends CustomerBase {
  type: 'individual';
  loyaltyTier: LoyaltyTier;
  favoriteProducts: string[];
}

export interface B2BCustomer extends CustomerBase {
  type: 'b2b';
  businessType: string;
  contactPerson: string;
  paymentTerms: PaymentTerms;
  monthlyVolume: number;
  contractEnd?: string;
}

export type Customer = IndividualCustomer | B2BCustomer;

// ============ Products ============
export type ProductStatus = 'active' | 'low-stock' | 'out-of-stock' | 'draft';

export interface Product {
  id: string;
  name: string;
  nameSw: string; // Swahili name
  category: string;
  description: string;
  price: number;
  discountPrice: number | null;
  discountPercent: number;
  stock: number;
  unit: string;
  status: ProductStatus;
  images: string[];
  sku: string;
  featured: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface ProductCategory {
  id: string;
  label: string;
  count: number;
}

// ============ Inventory ============
export type StockTrend = 'up' | 'down' | 'stable';

export interface InventoryItem {
  id: string;
  name: string;
  nameSw: string;
  category: string;
  sku: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  unitCost: number;
  lastRestocked: string;
  supplier: string;
  supplierId: string;
  trend: StockTrend;
  weeklyUsage: number;
  daysUntilEmpty: number;
}

export interface RestockRecord {
  id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  unit: string;
  date: string;
  supplierId: string;
  supplier: string;
  cost: number;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  email?: string;
  items: number;
  lastDelivery: string;
  reliability: number;
}

// ============ Analytics ============
export type TrendDirection = 'up' | 'down';

export interface AnalyticsMetric {
  title: string;
  value: string | number;
  change: string;
  changeType: TrendDirection;
  subtitle: string;
}

export interface TopProduct {
  rank: number;
  name: string;
  sales: number;
  change: number;
}

export interface TopCustomer {
  id: string;
  name: string;
  avatar?: string;
  orders: number;
  totalSpent: number;
}

export interface SalesByCategory {
  category: string;
  sales: number;
  color: string;
}

export interface SalesByLocation {
  city: string;
  orders: number;
  percentage: number;
}

// ============ Campaigns / Box Bundles ============
export type CampaignStatus = 'active' | 'draft' | 'expired';

export interface Campaign {
  id: string;
  name: string;
  description: string;
  products: string[]; // Product IDs
  originalPrice: number;
  campaignPrice: number;
  discount: number;
  status: CampaignStatus;
  startDate: string | null;
  endDate: string | null;
  subscribers: number;
}

// ============ Riders / Logistics ============
export type RiderStatus = 'active' | 'busy' | 'offline';

export interface Rider {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  status: RiderStatus;
  location: string;
  capacity: number;
  assigned: number;
}

// ============ Dashboard Stats ============
export interface DashboardStats {
  totalRevenue: number;
  totalSales: number;
  totalOrders: number;
  netProfit: number;
  pendingOrders: number;
  inTransitOrders: number;
  deliveredToday: number;
  delayedOrders: number;
}

// ============ API Response Wrappers ============
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}
