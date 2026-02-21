<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  Search,
  Bell,
  Package,
  Users,
  BarChart3,
  Settings,
  Filter,
  ArrowUpDown,
  MapPin,
  Plus,
  Truck,
  Calendar,
  Download,
  MoreHorizontal,
  Clock,
  CheckCircle,
  AlertCircle,
  Navigation,
  Store,
  Phone,
  TrendingUp
} from 'lucide-vue-next';
import { motion, AnimatePresence } from 'motion-v';
import { TabsRoot, TabsList, TabsTrigger, TabsContent, AvatarRoot, AvatarImage, AvatarFallback } from 'reka-ui';

// Page meta - uses admin layout without header/footer
useSeoMeta({
  title: 'Logistics | Yndu Admin',
  description: 'Manage orders, riders, and deliveries',
});

definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth',
});

// Toast notification
const showNotification = (message: string) => {
  // eslint-disable-next-line no-console
  console.log('[Notification]:', message);
};

// State
const searchQuery = ref('');
const activeTab = ref('dispatch');
const selectedFilter = ref('all');

// Stats
const stats = ref({
  pending: 12,
  inTransit: 8,
  delivered: 145,
  delayed: 2,
});

// Mock data
const orders = ref([
  { id: '4592', customerName: 'Jane Wambui', time: '08:45 AM', location: 'Kilimani, Nairobi', items: 'Large Veggie Box (x2)', price: 4200, priority: true, status: 'pending' as const },
  { id: '4601', customerName: 'David Maina', time: '10:15 AM', location: 'Westlands, Nairobi', items: 'Fruit Sampler', price: 1850, priority: false, status: 'assigned' as const },
  { id: '4598', customerName: 'Sarah Otieno', time: '09:30 AM', location: 'Karen, Nairobi', items: 'Family Box', price: 3500, priority: true, status: 'in-transit' as const },
  { id: '4605', customerName: 'Kevin Mwangi', time: '11:05 AM', location: 'Lavington, Nairobi', items: 'Single Veggie', price: 1200, priority: false, status: 'pending' as const },
  { id: '4612', customerName: 'Grace Njeri', time: '11:30 AM', location: 'Runda, Nairobi', items: 'Premium Mix Box', price: 5500, priority: true, status: 'pending' as const },
  { id: '4615', customerName: 'Peter Ochieng', time: '12:00 PM', location: 'Kileleshwa, Nairobi', items: 'Small Veggie Box', price: 950, priority: false, status: 'delivered' as const },
]);

const riders = ref([
  { name: 'Samuel Njoroge', image: 'https://i.pravatar.cc/150?u=samuel', status: 'ACTIVE' as const, location: 'Near Ngong Rd', assignedCount: 0, maxCapacity: 4, phone: '+254 700 111 222' },
  { name: 'Mary Muthoni', image: 'https://i.pravatar.cc/150?u=mary', status: 'BUSY' as const, location: 'Lower Kabete', assignedCount: 3, maxCapacity: 4, phone: '+254 700 333 444' },
  { name: 'John Kipkorir', image: 'https://i.pravatar.cc/150?u=john', status: 'ACTIVE' as const, location: 'Waiyaki Way', assignedCount: 1, maxCapacity: 4, phone: '+254 700 555 666' },
  { name: 'Alice Wanjiku', image: 'https://i.pravatar.cc/150?u=alice', status: 'OFFLINE' as const, location: 'Westlands', assignedCount: 0, maxCapacity: 4, phone: '+254 700 777 888' },
]);

// Inventory data
const inventoryItems = ref([
  { name: 'Tomatoes', current: 45, max: 100, unit: 'kg', trend: 'down' as const },
  { name: 'Spinach', current: 78, max: 100, unit: 'bunches', trend: 'stable' as const },
  { name: 'Onions', current: 23, max: 100, unit: 'kg', trend: 'down' as const },
  { name: 'Carrots', current: 89, max: 100, unit: 'kg', trend: 'up' as const },
  { name: 'Kale', current: 12, max: 50, unit: 'bunches', trend: 'down' as const },
  { name: 'Cabbage', current: 67, max: 80, unit: 'heads', trend: 'stable' as const },
]);

// Computed
const filteredOrders = computed(() => {
  let result = orders.value;

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(o =>
      o.customerName.toLowerCase().includes(query) ||
      o.id.includes(query) ||
      o.location.toLowerCase().includes(query)
    );
  }

  if (selectedFilter.value !== 'all') {
    result = result.filter(o => o.status === selectedFilter.value);
  }

  return result;
});

const activeRiders = computed(() => riders.value.filter(r => r.status === 'ACTIVE').length);
const busyRiders = computed(() => riders.value.filter(r => r.status === 'BUSY').length);
const lowStockItems = computed(() => inventoryItems.value.filter(item => (item.current / item.max) < 0.3));

// Actions
const handleAssignOrder = (orderId: string) => {
  const order = orders.value.find(o => o.id === orderId);
  if (order) {
    order.status = 'assigned';
    stats.value.pending--;
    showNotification(`Order #${orderId} has been assigned to a rider`);
  }
};

const handleViewOrder = (orderId: string) => {
  navigateTo(`/admin/orders/${orderId}`);
};

const handleTrackRider = (riderName: string) => {
  showNotification(`Now tracking ${riderName}`);
};

const handleContactRider = (riderName: string) => {
  const rider = riders.value.find(r => r.name === riderName);
  if (rider?.phone) {
    window.open(`tel:${rider.phone}`);
  }
};

const getStockLevel = (current: number, max: number) => {
  const percent = (current / max) * 100;
  if (percent <= 20) return { color: 'bg-destructive', label: 'Critical' };
  if (percent <= 40) return { color: 'bg-amber-500', label: 'Low' };
  if (percent <= 70) return { color: 'bg-yellow-400', label: 'Medium' };
  return { color: 'bg-green-500', label: 'Good' };
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
  }).format(price).replace('KES', 'KSh');
};
</script>

<template>
  <div class="min-h-dvh bg-background">
    <div class="flex">
      <!-- Drawer Navigation -->
      <AdminDrawer active-section="logistics" />

      <!-- Main Content -->
      <main class="flex-1 min-w-0">
        <!-- Top Header -->
        <header class="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border px-6 py-4">
          <div class="flex items-center justify-between gap-4">
            <div>
              <div class="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <span>Admin</span>
                <span>/</span>
                <span class="text-foreground font-medium">Logistics</span>
              </div>
              <h1 class="text-2xl font-bold tracking-tight">Logistics Management</h1>
            </div>
            <div class="flex items-center gap-3">
              <!-- Search -->
              <div class="relative hidden sm:block">
                <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search orders..."
                  class="pl-9 pr-4 py-2 bg-muted border-0 rounded-lg text-sm w-64 focus:ring-2 focus:ring-primary/30 outline-none"
                />
              </div>
              
              <!-- Notifications -->
              <button class="relative p-2 rounded-lg text-muted-foreground hover:bg-accent transition-colors">
                <Bell class="w-5 h-5" />
                <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full border-2 border-background" />
              </button>
              
              <!-- Export -->
              <button class="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-lg text-sm font-medium hover:bg-accent transition-colors">
                <Download class="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </header>

        <!-- Logistics Content -->
        <div class="p-6 space-y-6">
          <!-- Stats Cards -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <AdminStatCard
              title="Pending Dispatch"
              :value="stats.pending"
              :icon="Package"
              color="warning"
              trend="neutral"
              :delay="0"
            />
            <AdminStatCard
              title="In Transit"
              :value="stats.inTransit"
              :icon="Truck"
              color="primary"
              trend="up"
              trend-value="+2"
              :delay="1"
            />
            <AdminStatCard
              title="Delivered Today"
              :value="stats.delivered"
              :icon="CheckCircle"
              color="success"
              trend="up"
              trend-value="+12%"
              :delay="2"
            />
            <AdminStatCard
              title="Delayed"
              :value="stats.delayed"
              :icon="AlertCircle"
              color="destructive"
              trend="neutral"
              :delay="3"
            />
          </div>

          <!-- Tabs -->
          <TabsRoot v-model="activeTab" class="space-y-6">
            <TabsList class="inline-flex items-center gap-1 p-1 bg-muted rounded-lg">
              <TabsTrigger 
                value="dispatch" 
                as-child
              >
                <button class="px-4 py-2 rounded-md text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground">
                  <Package class="w-4 h-4 mr-2 inline" />
                  Dispatch
                </button>
              </TabsTrigger>
              <TabsTrigger 
                value="fleet" 
                as-child
              >
                <button class="px-4 py-2 rounded-md text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground">
                  <Users class="w-4 h-4 mr-2 inline" />
                  Fleet
                </button>
              </TabsTrigger>
              <TabsTrigger 
                value="inventory" 
                as-child
              >
                <button class="px-4 py-2 rounded-md text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground">
                  <Store class="w-4 h-4 mr-2 inline" />
                  Inventory
                </button>
              </TabsTrigger>
              <TabsTrigger 
                value="analytics" 
                as-child
              >
                <button class="px-4 py-2 rounded-md text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground">
                  <BarChart3 class="w-4 h-4 mr-2 inline" />
                  Analytics
                </button>
              </TabsTrigger>
            </TabsList>

            <!-- Dispatch Tab -->
            <TabsContent value="dispatch" class="space-y-6">
              <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <!-- Orders Queue -->
                <AdminSectionCard
                  title="Order Dispatch Queue"
                  :icon="Package"
                  action-label="View All"
                  class="xl:col-span-2"
                  :delay="4"
                >
                  <!-- Filter Bar -->
                  <div class="flex items-center gap-3 mb-4">
                    <div class="relative flex-1 max-w-xs">
                      <Filter class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <select
                        v-model="selectedFilter"
                        class="w-full pl-9 pr-8 py-2 bg-muted border-0 rounded-lg text-sm focus:ring-2 focus:ring-primary/30 outline-none appearance-none cursor-pointer"
                      >
                        <option value="all">All Orders</option>
                        <option value="pending">Pending</option>
                        <option value="assigned">Assigned</option>
                        <option value="in-transit">In Transit</option>
                        <option value="delivered">Delivered</option>
                      </select>
                      <ArrowUpDown class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 pointer-events-none" />
                    </div>
                    <span class="text-sm text-muted-foreground">{{ filteredOrders.length }} orders</span>
                  </div>

                  <!-- Orders List -->
                  <div class="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                    <motion.div
                      v-for="(order, index) in filteredOrders"
                      :key="order.id"
                      :initial="{ opacity: 0, x: -20 }"
                      :animate="{ opacity: 1, x: 0 }"
                      :transition="{ delay: 0.5 + index * 0.05 }"
                      :while-hover="{ scale: 1.01 }"
                      class="group p-4 rounded-xl border border-border/50 bg-card hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer"
                      @click="handleViewOrder(order.id)"
                    >
                      <div class="flex items-start justify-between">
                        <div class="flex items-start gap-4">
                          <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Package class="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <div class="flex items-center gap-2">
                              <span class="text-xs text-muted-foreground">#{{ order.id }}</span>
                              <span 
                                v-if="order.priority"
                                class="px-2 py-0.5 text-[10px] font-bold bg-destructive/10 text-destructive rounded-full"
                              >
                                PRIORITY
                              </span>
                            </div>
                            <p class="font-medium mt-1">{{ order.customerName }}</p>
                            <div class="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                              <span class="flex items-center gap-1">
                                <MapPin class="w-3 h-3" />
                                {{ order.location }}
                              </span>
                              <span class="flex items-center gap-1">
                                <Clock class="w-3 h-3" />
                                {{ order.time }}
                              </span>
                            </div>
                            <p class="text-sm text-muted-foreground mt-1">{{ order.items }}</p>
                          </div>
                        </div>
                        <div class="text-right">
                          <p class="font-bold text-lg">{{ formatPrice(order.price) }}</p>
                          <button
                            v-if="order.status === 'pending'"
                            class="mt-2 px-3 py-1 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                            @click.stop="handleAssignOrder(order.id)"
                          >
                            Assign
                          </button>
                          <span 
                            v-else
                            class="inline-block mt-2 px-2 py-1 text-xs font-medium rounded-lg"
                            :class="{
                              'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400': order.status === 'assigned',
                              'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400': order.status === 'in-transit',
                              'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400': order.status === 'delivered',
                            }"
                          >
                            {{ order.status === 'in-transit' ? 'In Transit' : order.status.charAt(0).toUpperCase() + order.status.slice(1) }}
                          </span>
                        </div>
                      </div>
                    </motion.div>

                    <!-- Empty State -->
                    <div v-if="filteredOrders.length === 0" class="text-center py-12">
                      <div class="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                        <Package class="w-8 h-8 text-muted-foreground" />
                      </div>
                      <p class="font-medium">No orders found</p>
                      <p class="text-sm text-muted-foreground">
                        {{ searchQuery ? 'Try adjusting your search' : 'All orders have been dispatched' }}
                      </p>
                    </div>
                  </div>
                </AdminSectionCard>

                <!-- Quick Stats -->
                <div class="space-y-6">
                  <AdminSectionCard title="Fleet Status" :icon="Truck" :delay="5">
                    <div class="space-y-4">
                      <div class="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div class="flex items-center gap-3">
                          <div class="w-2 h-2 rounded-full bg-green-500" />
                          <span class="font-medium">Active</span>
                        </div>
                        <span class="text-lg font-bold">{{ activeRiders }}</span>
                      </div>
                      <div class="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                        <div class="flex items-center gap-3">
                          <div class="w-2 h-2 rounded-full bg-orange-400" />
                          <span class="font-medium">Busy</span>
                        </div>
                        <span class="text-lg font-bold">{{ busyRiders }}</span>
                      </div>
                      <div class="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div class="flex items-center gap-3">
                          <div class="w-2 h-2 rounded-full bg-gray-400" />
                          <span class="font-medium">Offline</span>
                        </div>
                        <span class="text-lg font-bold">{{ riders.filter(r => r.status === 'OFFLINE').length }}</span>
                      </div>
                    </div>
                  </AdminSectionCard>

                  <AdminSectionCard title="Today's Summary" :icon="Calendar" :delay="6">
                    <div class="space-y-3">
                      <div class="flex justify-between items-center">
                        <span class="text-muted-foreground">Total Orders</span>
                        <span class="font-medium">28</span>
                      </div>
                      <div class="flex justify-between items-center">
                        <span class="text-muted-foreground">Completed</span>
                        <span class="font-medium text-green-600">18</span>
                      </div>
                      <div class="flex justify-between items-center">
                        <span class="text-muted-foreground">In Progress</span>
                        <span class="font-medium text-blue-600">8</span>
                      </div>
                      <div class="flex justify-between items-center">
                        <span class="text-muted-foreground">Cancelled</span>
                        <span class="font-medium text-destructive">2</span>
                      </div>
                      <div class="pt-3 border-t border-border">
                        <div class="flex justify-between items-center">
                          <span class="font-medium">Revenue</span>
                          <span class="font-bold text-lg">KSh 89,400</span>
                        </div>
                      </div>
                    </div>
                  </AdminSectionCard>
                </div>
              </div>
            </TabsContent>

            <!-- Fleet Tab -->
            <TabsContent value="fleet" class="space-y-6">
              <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                <motion.div
                  v-for="(rider, index) in riders"
                  :key="rider.name"
                  :initial="{ opacity: 0, y: 20 }"
                  :animate="{ opacity: 1, y: 0 }"
                  :transition="{ delay: index * 0.1 }"
                  :while-hover="{ y: -4 }"
                  class="rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-all"
                >
                  <div class="flex items-start justify-between">
                    <div class="flex items-center gap-4">
                      <AvatarRoot class="w-14 h-14 rounded-xl">
                        <AvatarImage :src="rider.image" :alt="rider.name" />
                        <AvatarFallback>{{ rider.name.charAt(0) }}</AvatarFallback>
                      </AvatarRoot>
                      <div>
                        <h3 class="font-semibold">{{ rider.name }}</h3>
                        <div class="flex items-center gap-2 mt-1">
                          <span 
                            class="w-2 h-2 rounded-full"
                            :class="{
                              'bg-green-500': rider.status === 'ACTIVE',
                              'bg-orange-400': rider.status === 'BUSY',
                              'bg-gray-400': rider.status === 'OFFLINE',
                            }"
                          />
                          <span class="text-sm text-muted-foreground">{{ rider.status }}</span>
                        </div>
                      </div>
                    </div>
                    <button class="p-2 rounded-lg hover:bg-muted">
                      <MoreHorizontal class="w-4 h-4" />
                    </button>
                  </div>

                  <div class="mt-4 space-y-3">
                    <div class="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin class="w-4 h-4" />
                      <span>{{ rider.location }}</span>
                    </div>
                    <div class="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone class="w-4 h-4" />
                      <span>{{ rider.phone }}</span>
                    </div>
                  </div>

                  <div class="mt-4">
                    <div class="flex justify-between items-center mb-2">
                      <span class="text-sm text-muted-foreground">Capacity</span>
                      <span class="text-sm font-medium">{{ rider.assignedCount }} / {{ rider.maxCapacity }}</span>
                    </div>
                    <div class="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        :initial="{ width: 0 }"
                        :animate="{ width: `${(rider.assignedCount / rider.maxCapacity) * 100}%` }"
                        :transition="{ delay: 0.3 + index * 0.1, duration: 0.5 }"
                        class="h-full rounded-full"
                        :class="{
                          'bg-green-500': rider.assignedCount < rider.maxCapacity * 0.5,
                          'bg-orange-400': rider.assignedCount >= rider.maxCapacity * 0.5 && rider.assignedCount < rider.maxCapacity,
                          'bg-destructive': rider.assignedCount === rider.maxCapacity,
                        }"
                      />
                    </div>
                  </div>

                  <div class="mt-4 flex gap-2">
                    <button
                      class="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                      :disabled="rider.status === 'OFFLINE'"
                      :class="{ 'opacity-50 cursor-not-allowed': rider.status === 'OFFLINE' }"
                      @click="handleTrackRider(rider.name)"
                    >
                      <Navigation class="w-4 h-4" />
                      Track
                    </button>
                    <button
                      class="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-accent transition-colors"
                      @click="handleContactRider(rider.name)"
                    >
                      <Phone class="w-4 h-4" />
                      Call
                    </button>
                  </div>
                </motion.div>

                <!-- Add Rider Card -->
                <motion.div
                  :initial="{ opacity: 0, y: 20 }"
                  :animate="{ opacity: 1, y: 0 }"
                  :transition="{ delay: riders.length * 0.1 }"
                  class="rounded-xl border border-dashed border-border bg-muted/50 p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted transition-colors"
                >
                  <div class="w-14 h-14 rounded-full bg-background flex items-center justify-center mb-4">
                    <Plus class="w-6 h-6 text-muted-foreground" />
                  </div>
                  <h3 class="font-medium">Add New Rider</h3>
                  <p class="text-sm text-muted-foreground mt-1">Expand your delivery fleet</p>
                </motion.div>
              </div>
            </TabsContent>

            <!-- Inventory Tab -->
            <TabsContent value="inventory" class="space-y-6">
              <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <!-- Inventory Grid -->
                <AdminSectionCard title="Stock Levels" :icon="Store" class="xl:col-span-2" :delay="4">
                  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <motion.div
                      v-for="(item, index) in inventoryItems"
                      :key="item.name"
                      :initial="{ opacity: 0, scale: 0.95 }"
                      :animate="{ opacity: 1, scale: 1 }"
                      :transition="{ delay: 0.3 + index * 0.05 }"
                      :while-hover="{ scale: 1.02 }"
                      class="p-4 rounded-xl border"
                      :class="(item.current / item.max) < 0.3 ? 'bg-destructive/5 border-destructive/20' : 'bg-card border-border'"
                    >
                      <div class="flex items-center justify-between mb-3">
                        <span class="font-medium">{{ item.name }}</span>
                        <span 
                          class="text-xs px-2 py-1 rounded-full"
                          :class="getStockLevel(item.current, item.max).color === 'bg-destructive' ? 'bg-destructive/10 text-destructive' : 'bg-muted'"
                        >
                          {{ getStockLevel(item.current, item.max).label }}
                        </span>
                      </div>
                      <div class="flex items-baseline gap-1 mb-3">
                        <span 
                          class="text-2xl font-bold"
                          :class="(item.current / item.max) < 0.3 ? 'text-destructive' : ''"
                        >
                          {{ item.current }}
                        </span>
                        <span class="text-sm text-muted-foreground">/ {{ item.max }} {{ item.unit }}</span>
                      </div>
                      <div class="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          :initial="{ width: 0 }"
                          :animate="{ width: `${(item.current / item.max) * 100}%` }"
                          :transition="{ delay: 0.5 + index * 0.1, duration: 0.5 }"
                          class="h-full rounded-full"
                          :class="getStockLevel(item.current, item.max).color"
                        />
                      </div>
                    </motion.div>
                  </div>
                </AdminSectionCard>

                <!-- Low Stock Alert -->
                <AdminSectionCard title="Low Stock Alerts" :icon="AlertCircle" :delay="5">
                  <div v-if="lowStockItems.length > 0" class="space-y-3">
                    <div
                      v-for="item in lowStockItems"
                      :key="item.name"
                      class="flex items-center gap-3 p-3 bg-destructive/5 border border-destructive/20 rounded-lg"
                    >
                      <AlertCircle class="w-5 h-5 text-destructive shrink-0" />
                      <div class="flex-1">
                        <p class="font-medium text-sm">{{ item.name }}</p>
                        <p class="text-xs text-muted-foreground">{{ item.current }} {{ item.unit }} remaining</p>
                      </div>
                      <button class="px-3 py-1 text-xs font-medium bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90">
                        Restock
                      </button>
                    </div>
                  </div>
                  <div v-else class="text-center py-8">
                    <CheckCircle class="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <p class="font-medium">All items well stocked</p>
                    <p class="text-sm text-muted-foreground">No restocking needed</p>
                  </div>
                </AdminSectionCard>
              </div>
            </TabsContent>

            <!-- Analytics Tab -->
            <TabsContent value="analytics" class="space-y-6">
              <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <AdminSectionCard title="Delivery Performance" :icon="BarChart3" :delay="4">
                  <div class="h-64 flex items-end justify-around">
                    <div v-for="(day, index) in ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']" :key="day" class="flex flex-col items-center gap-2">
                      <motion.div
                        :initial="{ height: 0 }"
                        :animate="{ height: `${[65, 80, 45, 90, 75, 60, 85][index]}%` }"
                        :transition="{ delay: index * 0.1, duration: 0.5 }"
                        class="w-12 bg-primary/20 rounded-t-lg relative group cursor-pointer"
                      >
                        <div class="absolute inset-x-0 bottom-0 bg-primary rounded-t-lg transition-all group-hover:bg-primary/80" :style="{ height: `${[65, 80, 45, 90, 75, 60, 85][index]}%` }" />
                      </motion.div>
                      <span class="text-sm text-muted-foreground">{{ day }}</span>
                    </div>
                  </div>
                </AdminSectionCard>

                <AdminSectionCard title="Delivery Metrics" :icon="TrendingUp" :delay="5">
                  <div class="space-y-6">
                    <div>
                      <div class="flex justify-between items-center mb-2">
                        <span class="text-sm text-muted-foreground">On-time Delivery Rate</span>
                        <span class="font-bold">94.5%</span>
                      </div>
                      <div class="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          :initial="{ width: 0 }"
                          :animate="{ width: '94.5%' }"
                          :transition="{ delay: 0.3, duration: 0.8 }"
                          class="h-full bg-green-500 rounded-full"
                        />
                      </div>
                    </div>
                    <div>
                      <div class="flex justify-between items-center mb-2">
                        <span class="text-sm text-muted-foreground">Customer Satisfaction</span>
                        <span class="font-bold">4.8/5.0</span>
                      </div>
                      <div class="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          :initial="{ width: 0 }"
                          :animate="{ width: '96%' }"
                          :transition="{ delay: 0.4, duration: 0.8 }"
                          class="h-full bg-primary rounded-full"
                        />
                      </div>
                    </div>
                    <div>
                      <div class="flex justify-between items-center mb-2">
                        <span class="text-sm text-muted-foreground">Fleet Utilization</span>
                        <span class="font-bold">78%</span>
                      </div>
                      <div class="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          :initial="{ width: 0 }"
                          :animate="{ width: '78%' }"
                          :transition="{ delay: 0.5, duration: 0.8 }"
                          class="h-full bg-amber-500 rounded-full"
                        />
                      </div>
                    </div>
                    <div>
                      <div class="flex justify-between items-center mb-2">
                        <span class="text-sm text-muted-foreground">Order Completion</span>
                        <span class="font-bold">98.2%</span>
                      </div>
                      <div class="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          :initial="{ width: 0 }"
                          :animate="{ width: '98.2%' }"
                          :transition="{ delay: 0.6, duration: 0.8 }"
                          class="h-full bg-green-500 rounded-full"
                        />
                      </div>
                    </div>
                  </div>
                </AdminSectionCard>
              </div>
            </TabsContent>
          </TabsRoot>
        </div>
      </main>
    </div>
  </div>
</template>
