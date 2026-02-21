/**
 * Admin Store (Pinia)
 * Centralized state management for admin panel
 * Ready for backend API integration
 */
import { defineStore } from 'pinia';
import type {
  Campaign,
  Customer,
  DashboardStats,
  InventoryItem,
  Order,
  OrderStatus,
  PaginatedResponse as _PaginatedResponse,
  Product,
  Rider,
} from '~/types/admin';

interface AdminState {
  // Dashboard
  stats: DashboardStats | null;
  statsLoading: boolean;

  // Orders
  orders: Order[];
  ordersLoading: boolean;
  ordersTotal: number;
  ordersPage: number;

  // Customers
  customers: Customer[];
  customersLoading: boolean;
  customersTotal: number;

  // Products
  products: Product[];
  productsLoading: boolean;

  // Inventory
  inventory: InventoryItem[];
  inventoryLoading: boolean;

  // Campaigns
  campaigns: Campaign[];
  campaignsLoading: boolean;

  // Riders
  riders: Rider[];
  ridersLoading: boolean;
}

export const useAdminStore = defineStore('admin', {
  state: (): AdminState => ({
    stats: null,
    statsLoading: false,

    orders: [],
    ordersLoading: false,
    ordersTotal: 0,
    ordersPage: 1,

    customers: [],
    customersLoading: false,
    customersTotal: 0,

    products: [],
    productsLoading: false,

    inventory: [],
    inventoryLoading: false,

    campaigns: [],
    campaignsLoading: false,

    riders: [],
    ridersLoading: false,
  }),

  getters: {
    pendingOrders: (state) => state.orders.filter((o) => o.status === 'pending'),
    activeRiders: (state) => state.riders.filter((r) => r.status === 'active'),
    lowStockItems: (state) => state.inventory.filter((i) => i.currentStock <= i.minStock),
    outOfStockProducts: (state) => state.products.filter((p) => p.status === 'out-of-stock'),
  },

  actions: {
    // ============ Dashboard ============
    async fetchDashboardStats() {
      this.statsLoading = true;
      try {
        const response = await $fetch<{
          totalRevenue: number;
          totalSales: number;
          totalOrders: number;
          netProfit: number;
          pendingOrders: number;
          inTransitOrders: number;
          deliveredToday: number;
          delayedOrders: number;
        }>('/api/admin/dashboard/stats');
        this.stats = response;
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        this.statsLoading = false;
      }
    },

    // ============ Orders ============
    async fetchOrders(page = 1, status?: OrderStatus) {
      this.ordersLoading = true;
      try {
        const params = new URLSearchParams({
          limit: '50',
          offset: String((page - 1) * 50),
        });
        if (status) params.append('status', status);

        const response = await $fetch<{
          orders: Order[];
          pagination: { limit: number; offset: number; total: number };
        }>(`/api/orders?${params}`);

        this.orders = response.orders;
        this.ordersTotal = response.pagination.total;
        this.ordersPage = page;
        console.log('fetchOrders successful');
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        this.ordersLoading = false;
      }
    },

    async updateOrderStatus(orderId: string, status: OrderStatus) {
      try {
        await $fetch(`/api/orders/${orderId}/status`, {
          method: 'PUT',
          body: { status },
        });

        const order = this.orders.find((o) => o.id === orderId);
        if (order) {
          order.status = status;
        }
      } catch (error) {
        console.error('Failed to update order status:', error);
        throw error;
      }
    },

    assignRiderToOrder(orderId: string, riderId: string) {
      try {
        // TODO: Replace with actual API call
        // await $fetch(`/api/admin/orders/${orderId}/assign`, {
        //   method: 'POST',
        //   body: { riderId }
        // });

        const order = this.orders.find((o) => o.id === orderId);
        const rider = this.riders.find((r) => r.id === riderId);
        if (order && rider) {
          order.rider = {
            id: rider.id,
            name: rider.name,
            phone: rider.phone,
            avatar: rider.avatar,
          };
          order.status = 'dispatched';
          rider.assigned++;
        }
      } catch (error) {
        console.error('Failed to assign rider:', error);
        throw error;
      }
    },

    // ============ Customers ============
    async fetchCustomers(_type?: 'individual' | 'b2b') {
      this.customersLoading = true;
      try {
        // Our API doesn't currently filter by type exactly, but we fetch from /api/users
        const response = await $fetch<{
          users: Customer[];
          total: number;
        }>('/api/users');

        this.customers = response.users;
        this.customersTotal = response.total;
      } catch (error) {
        console.error('Failed to fetch customers:', error);
      } finally {
        this.customersLoading = false;
      }
    },

    // ============ Products ============
    async fetchProducts(category?: string) {
      this.productsLoading = true;
      try {
        const params = category ? `?category=${category}` : '';
        const response = await $fetch<{ items: unknown[] }>(`/api/inventory${params}`);

        this.products = response.items.map((p) => ({
          id: p.id,
          name: p.name,
          category: p.category,
          price: p.unitPrice.amount,
          stock: p.availableQuantity.value,
          status: p.availableQuantity.value > 0 ? 'active' : 'out-of-stock',
          sales: 0,
          image: p.imageUrl,
        }));
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        this.productsLoading = false;
      }
    },

    async updateProduct(productId: string, updates: Partial<Product>) {
      try {
        // Map frontend typical Product updates to backend inventory update schema
        const backendUpdates: Record<string, unknown> = {};
        if (updates.name) backendUpdates.name = updates.name;
        if (updates.price) backendUpdates.unitPriceCents = updates.price;
        if (updates.stock !== undefined) backendUpdates.availableQuantity = updates.stock;
        if (updates.image) backendUpdates.imageUrl = updates.image;

        await $fetch(`/api/inventory/${productId}`, {
          method: 'PUT',
          body: backendUpdates,
        });

        const product = this.products.find((p) => p.id === productId);
        if (product) {
          Object.assign(product, updates);
        }
      } catch (error) {
        console.error('Failed to update product:', error);
        throw error;
      }
    },

    // ============ Inventory ============
    async fetchInventory() {
      this.inventoryLoading = true;
      try {
        const response = await $fetch<{ items: unknown[] }>('/api/inventory');
        this.inventory = response.items.map((i) => ({
          id: i.id,
          name: i.name,
          sku: i.id.substring(0, 8).toUpperCase(),
          category: i.category,
          currentStock: i.availableQuantity.value,
          minStock: i.reorderThreshold?.value || 10,
          unit: i.availableQuantity.unit,
          lastRestocked: new Date().toISOString().split('T')[0],
          trend: 'stable',
        }));
      } catch (error) {
        console.error('Failed to fetch inventory:', error);
      } finally {
        this.inventoryLoading = false;
      }
    },

    async restockItem(itemId: string, quantity: number, _supplierId: string) {
      try {
        const item = this.inventory.find((i) => i.id === itemId);
        if (!item) throw new Error('Item not found');

        const newQuantity = item.currentStock + quantity;
        await $fetch(`/api/inventory/${itemId}/quantity`, {
          method: 'PATCH',
          body: { quantity: newQuantity }, // Our API expects absolute quantity, not diff
        });

        item.currentStock = newQuantity;
        item.lastRestocked = new Date().toISOString().split('T')[0];
        item.trend = 'up';
      } catch (error) {
        console.error('Failed to restock item:', error);
        throw error;
      }
    },

    // ============ Campaigns ============
    fetchCampaigns() {
      this.campaignsLoading = true;
      try {
        // Not implemented in backend yet, keeping mock empty
        this.campaigns = [];
      } catch (error) {
        console.error('Failed to fetch campaigns:', error);
      } finally {
        this.campaignsLoading = false;
      }
    },

    // ============ Riders ============
    async fetchRiders() {
      this.ridersLoading = true;
      try {
        const response = await $fetch<Rider[]>('/api/admin/riders');
        this.riders = response;
      } catch (error) {
        console.error('Failed to fetch riders:', error);
      } finally {
        this.ridersLoading = false;
      }
    },
  },
});
