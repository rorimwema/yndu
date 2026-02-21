<script setup lang="ts">
import {
  DollarSign,
  ShoppingCart,
  Package,
  TrendingUp,
  BarChart3,
  LineChart as LineChartIcon
} from 'lucide-vue-next';

// Page meta
useSeoMeta({
  title: 'Admin Dashboard | Yndu',
  description: 'Manage your Yndu business operations',
});

definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth',
});

// Admin store
const adminStore = useAdminStore();

// Helper functions
function formatCurrency(amount: number): string {
  return 'KSh ' + amount.toLocaleString('en-KE');
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Default avatar for customers without one
const defaultAvatar = 'https://ui-avatars.com/api/?background=random&name=User';

// KPI Stats - computed from admin store
const kpiStats = computed(() => {
  if (!adminStore.stats) {
    return [
      { title: 'Total Revenue', value: '—', icon: DollarSign, trend: 'up' as const, trendValue: '—' },
      { title: 'Total Sales', value: '—', icon: ShoppingCart, trend: 'up' as const, trendValue: '—' },
      { title: 'Total Orders', value: '—', icon: Package, trend: 'up' as const, trendValue: '—' },
      { title: 'Net Profit', value: '—', icon: TrendingUp, trend: 'up' as const, trendValue: '—' },
    ];
  }
  return [
    {
      title: 'Total Revenue',
      value: formatCurrency(adminStore.stats.totalRevenue),
      icon: DollarSign,
      trend: 'up' as const,
      trendValue: '+12.5%',
    },
    {
      title: 'Total Sales',
      value: adminStore.stats.totalSales.toLocaleString('en-KE'),
      icon: ShoppingCart,
      trend: 'up' as const,
      trendValue: '+8.2%',
    },
    {
      title: 'Total Orders',
      value: adminStore.stats.totalOrders.toLocaleString('en-KE'),
      icon: Package,
      trend: 'up' as const,
      trendValue: '+15.3%',
    },
    {
      title: 'Net Profit',
      value: formatCurrency(adminStore.stats.netProfit),
      icon: TrendingUp,
      trend: 'up' as const,
      trendValue: '+5.7%',
    },
  ];
});

// Data table configuration
const tableColumns = [
  { key: 'client', label: 'Client Name' },
  { key: 'date', label: 'Date' },
  { key: 'price', label: 'Price' },
  { key: 'category', label: 'Category' },
  { key: 'product', label: 'Product' },
  { key: 'city', label: 'City' },
  { key: 'status', label: 'Status' },
];

const tableTabs = computed(() => [
  { id: 'all', label: 'All Tasks', count: adminStore.ordersTotal || 0 },
  { id: 'completed', label: 'Completed', count: adminStore.stats?.deliveredToday || 0 },
  { id: 'in-progress', label: 'In Progress', count: adminStore.stats?.inTransitOrders || 0 },
  { id: 'pending', label: 'Pending', count: adminStore.stats?.pendingOrders || 0 },
  { id: 'cancelled', label: 'Cancelled', count: adminStore.stats?.delayedOrders || 0 },
]);

// Sales data - computed from admin store orders
const salesData = computed(() => {
  if (!adminStore.orders.length) return [];
  
  return adminStore.orders.map(order => ({
    client: order.customer.name,
    avatar: order.customer.avatar || defaultAvatar,
    date: formatDate(order.createdAt),
    price: formatCurrency(order.total),
    category: order.items[0]?.category || 'Mixed',
    product: order.items.map(i => i.name).join(', '),
    city: typeof order.deliveryAddress === 'string' 
      ? order.deliveryAddress.split(',').pop()?.trim() || 'Nairobi'
      : order.deliveryAddress?.city || 'Nairobi',
    status: capitalize(order.status)
  }));
});

// Fetch data on mount
onMounted(() => {
  adminStore.fetchDashboardStats();
  adminStore.fetchOrders(1);
});
</script>

<template>
  <div class="min-h-dvh" style="background: var(--bg-canvas);">
    <div class="flex">
      <!-- Sidebar -->
      <AdminDrawer active-section="dashboard" />

      <!-- Main Content -->
      <main class="flex-1 min-w-0">
        <!-- Top Bar -->
        <AdminTopBar :breadcrumb="['Pages', 'Dashboard']" />

        <!-- Dashboard Content -->
        <div class="p-6 lg:p-8 space-y-8 max-w-[1200px] mx-auto">
          <!-- Page Header -->
          <div>
            <h1 class="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p class="text-muted-foreground">Welcome back! Here's what's happening with your store.</p>
          </div>

          <!-- Loading State for Stats -->
          <div v-if="adminStore.statsLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <div
              v-for="i in 4"
              :key="i"
              class="bg-white rounded-xl p-6 border border-gray-200 animate-pulse"
            >
              <div class="flex items-center justify-between">
                <div class="space-y-3">
                  <div class="h-4 w-24 bg-gray-200 rounded"></div>
                  <div class="h-8 w-32 bg-gray-200 rounded"></div>
                  <div class="h-3 w-16 bg-gray-200 rounded"></div>
                </div>
                <div class="h-12 w-12 bg-gray-200 rounded-xl"></div>
              </div>
            </div>
          </div>

          <!-- KPI Cards Grid -->
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <AdminKPICard
              v-for="(stat, index) in kpiStats"
              :key="stat.title"
              v-bind="stat"
              :delay="index"
            />
          </div>

          <!-- Charts Section -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AdminChartCard
              title="Total Sales"
              :icon="BarChart3"
              :delay="4"
            />
            <AdminChartCard
              title="Total Revenue"
              :icon="LineChartIcon"
              :delay="5"
            />
          </div>

          <!-- Sales Table -->
          <AdminDataTable
            title="Last Sales"
            description="Recent transactions from your store"
            :columns="tableColumns"
            :data="salesData"
            :tabs="tableTabs"
            :delay="6"
            :loading="adminStore.ordersLoading"
          />
        </div>
      </main>
    </div>
  </div>
</template>
