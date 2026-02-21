<script setup lang="ts">
import { ref, computed } from 'vue';
import { motion, AnimatePresence } from 'motion-v';
import {
  Package,
  Search,
  Filter,
  Download,
  Plus,
  MoreHorizontal,
  MapPin,
  Clock,
  Phone,
  User,
  Truck,
  CheckCircle,
  AlertCircle,
  XCircle,
  ArrowUpDown,
  Calendar,
  ChevronRight,
  Eye,
  Edit,
  Navigation,
  RefreshCw
} from 'lucide-vue-next';
import { 
  DialogRoot, 
  DialogPortal, 
  DialogOverlay, 
  DialogContent, 
  DialogTitle, 
  DialogDescription,
  DialogClose,
  AvatarRoot, 
  AvatarImage, 
  AvatarFallback 
} from 'reka-ui';

// Page meta
useSeoMeta({
  title: 'Orders | Yndu Admin',
  description: 'Manage customer orders',
});

definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth',
});

// State
const searchQuery = ref('');
const selectedStatus = ref('all');
const selectedOrder = ref<any>(null);
const showAssignModal = ref(false);
const showDetailsPanel = ref(false);

// Order statuses
const statuses = [
  { id: 'all', label: 'All Orders', count: 156 },
  { id: 'pending', label: 'Pending', count: 23 },
  { id: 'processing', label: 'Processing', count: 18 },
  { id: 'dispatched', label: 'Dispatched', count: 42 },
  { id: 'in-transit', label: 'In Transit', count: 28 },
  { id: 'delivered', label: 'Delivered', count: 38 },
  { id: 'delayed', label: 'Delayed', count: 5 },
  { id: 'cancelled', label: 'Cancelled', count: 2 },
];

// Orders data
const orders = ref([
  {
    id: 'ORD-4592',
    customer: { name: 'Jane Wambui', email: 'jane@example.com', phone: '+254 712 345 678', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop&crop=face' },
    items: [{ name: 'Large Veggie Box', qty: 2, price: 2100 }],
    total: 4200,
    status: 'pending',
    priority: true,
    createdAt: '2026-02-09T08:45:00',
    deliveryAddress: 'Kilimani, Nairobi',
    deliverySlot: '10:00 AM - 12:00 PM',
    rider: null,
    notes: 'Please call before delivery',
  },
  {
    id: 'ORD-4601',
    customer: { name: 'David Maina', email: 'david@example.com', phone: '+254 722 111 222', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face' },
    items: [{ name: 'Fruit Sampler', qty: 1, price: 1850 }],
    total: 1850,
    status: 'processing',
    priority: false,
    createdAt: '2026-02-09T10:15:00',
    deliveryAddress: 'Westlands, Nairobi',
    deliverySlot: '2:00 PM - 4:00 PM',
    rider: null,
    notes: '',
  },
  {
    id: 'ORD-4598',
    customer: { name: 'Sarah Otieno', email: 'sarah@example.com', phone: '+254 733 444 555', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face' },
    items: [{ name: 'Family Box', qty: 1, price: 3500 }],
    total: 3500,
    status: 'in-transit',
    priority: true,
    createdAt: '2026-02-09T09:30:00',
    deliveryAddress: 'Karen, Nairobi',
    deliverySlot: '11:00 AM - 1:00 PM',
    rider: { name: 'Samuel Njoroge', phone: '+254 700 111 222', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face' },
    notes: 'Gate code: 1234',
  },
  {
    id: 'ORD-4605',
    customer: { name: 'Kevin Mwangi', email: 'kevin@example.com', phone: '+254 744 666 777', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face' },
    items: [{ name: 'Single Veggie', qty: 1, price: 1200 }],
    total: 1200,
    status: 'dispatched',
    priority: false,
    createdAt: '2026-02-09T11:05:00',
    deliveryAddress: 'Lavington, Nairobi',
    deliverySlot: '3:00 PM - 5:00 PM',
    rider: { name: 'Mary Muthoni', phone: '+254 700 333 444', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=40&h=40&fit=crop&crop=face' },
    notes: '',
  },
  {
    id: 'ORD-4612',
    customer: { name: 'Grace Njeri', email: 'grace@example.com', phone: '+254 755 888 999', avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=40&h=40&fit=crop&crop=face' },
    items: [{ name: 'Premium Mix Box', qty: 1, price: 5500 }],
    total: 5500,
    status: 'pending',
    priority: true,
    createdAt: '2026-02-09T11:30:00',
    deliveryAddress: 'Runda, Nairobi',
    deliverySlot: '4:00 PM - 6:00 PM',
    rider: null,
    notes: 'VIP customer',
  },
  {
    id: 'ORD-4615',
    customer: { name: 'Peter Ochieng', email: 'peter@example.com', phone: '+254 766 111 222', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=40&h=40&fit=crop&crop=face' },
    items: [{ name: 'Small Veggie Box', qty: 1, price: 950 }],
    total: 950,
    status: 'delivered',
    priority: false,
    createdAt: '2026-02-09T08:00:00',
    deliveryAddress: 'Kileleshwa, Nairobi',
    deliverySlot: '9:00 AM - 11:00 AM',
    rider: { name: 'John Kipkorir', phone: '+254 700 555 666', avatar: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=40&h=40&fit=crop&crop=face' },
    notes: '',
  },
  {
    id: 'ORD-4620',
    customer: { name: 'Lucy Achieng', email: 'lucy@example.com', phone: '+254 777 333 444', avatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=40&h=40&fit=crop&crop=face' },
    items: [{ name: 'Weekly Subscription Box', qty: 1, price: 2800 }],
    total: 2800,
    status: 'delayed',
    priority: true,
    createdAt: '2026-02-09T07:30:00',
    deliveryAddress: 'South B, Nairobi',
    deliverySlot: '8:00 AM - 10:00 AM',
    rider: { name: 'Samuel Njoroge', phone: '+254 700 111 222', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face' },
    notes: 'Traffic delay - customer notified',
  },
]);

// Available riders
const riders = ref([
  { id: 1, name: 'Samuel Njoroge', status: 'active', location: 'Near Ngong Rd', capacity: 3, assigned: 1, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face', phone: '+254 700 111 222' },
  { id: 2, name: 'Mary Muthoni', status: 'busy', location: 'Lower Kabete', capacity: 4, assigned: 4, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=40&h=40&fit=crop&crop=face', phone: '+254 700 333 444' },
  { id: 3, name: 'John Kipkorir', status: 'active', location: 'Waiyaki Way', capacity: 4, assigned: 2, avatar: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=40&h=40&fit=crop&crop=face', phone: '+254 700 555 666' },
  { id: 4, name: 'Alice Wanjiku', status: 'active', location: 'Westlands', capacity: 3, assigned: 0, avatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=40&h=40&fit=crop&crop=face', phone: '+254 700 777 888' },
]);

// Computed
const filteredOrders = computed(() => {
  let result = orders.value;

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(o =>
      o.customer.name.toLowerCase().includes(query) ||
      o.id.toLowerCase().includes(query) ||
      o.deliveryAddress.toLowerCase().includes(query)
    );
  }

  if (selectedStatus.value !== 'all') {
    result = result.filter(o => o.status === selectedStatus.value);
  }

  return result;
});

const availableRiders = computed(() => riders.value.filter(r => r.status === 'active' && r.assigned < r.capacity));

// Actions
const getStatusConfig = (status: string) => {
  const config: Record<string, { label: string; class: string; icon: any }> = {
    pending: { label: 'Pending', class: 'status-badge pending', icon: Clock },
    processing: { label: 'Processing', class: 'status-badge in-progress', icon: RefreshCw },
    dispatched: { label: 'Dispatched', class: 'bg-purple-100 text-purple-700', icon: Package },
    'in-transit': { label: 'In Transit', class: 'bg-blue-100 text-blue-700', icon: Truck },
    delivered: { label: 'Delivered', class: 'status-badge completed', icon: CheckCircle },
    delayed: { label: 'Delayed', class: 'bg-orange-100 text-orange-700', icon: AlertCircle },
    cancelled: { label: 'Cancelled', class: 'status-badge cancelled', icon: XCircle },
  };
  return config[status] || config.pending;
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
  }).format(price).replace('KES', 'KSh');
};

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

const openAssignModal = (order: any) => {
  selectedOrder.value = order;
  showAssignModal.value = true;
};

const openDetailsPanel = (order: any) => {
  selectedOrder.value = order;
  showDetailsPanel.value = true;
};

const assignRider = (rider: any) => {
  if (selectedOrder.value) {
    const order = orders.value.find(o => o.id === selectedOrder.value.id);
    if (order) {
      order.rider = { name: rider.name, phone: rider.phone, avatar: rider.avatar };
      order.status = 'dispatched';
      rider.assigned++;
    }
  }
  showAssignModal.value = false;
};

const updateOrderStatus = (orderId: string, newStatus: string) => {
  const order = orders.value.find(o => o.id === orderId);
  if (order) {
    order.status = newStatus;
  }
};

const dispatchOrder = (orderId: string) => {
  const order = orders.value.find(o => o.id === orderId);
  if (order) {
    openAssignModal(order);
  }
};
</script>

<template>
  <div class="min-h-dvh" style="background: var(--bg-canvas);">
    <div class="flex">
      <!-- Sidebar -->
      <AdminDrawer active-section="orders" />

      <!-- Main Content -->
      <main class="flex-1 min-w-0">
        <!-- Top Bar -->
        <AdminTopBar :breadcrumb="['Pages', 'Orders']" />

        <!-- Orders Content -->
        <div class="p-6 lg:p-8 space-y-6 max-w-[1200px] mx-auto">
          <!-- Page Header -->
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 class="text-2xl font-bold tracking-tight">Order Management</h1>
              <p class="text-muted-foreground">Dispatch, track, and manage all customer orders.</p>
            </div>
            <div class="flex items-center gap-3">
              <button class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium glass-card hover:bg-white/80 transition-colors">
                <Download class="size-4" />
                Export
              </button>
              <button class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-colors" style="background: var(--yndu-green);">
                <Plus class="size-4" />
                New Order
              </button>
            </div>
          </div>

          <!-- Stats Row -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <motion.div
              v-for="(stat, index) in [
                { label: 'Pending', value: 23, color: 'var(--yndu-gold)' },
                { label: 'In Transit', value: 28, color: '#3498db' },
                { label: 'Delivered Today', value: 38, color: 'var(--yndu-green)' },
                { label: 'Delayed', value: 5, color: '#e74c3c' },
              ]"
              :key="stat.label"
              :initial="{ opacity: 0, y: 20 }"
              :animate="{ opacity: 1, y: 0 }"
              :transition="{ delay: index * 0.1 }"
              class="glass-card p-4"
            >
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center" :style="{ background: `${stat.color}20` }">
                  <span class="text-lg font-bold" :style="{ color: stat.color }">{{ stat.value }}</span>
                </div>
                <span class="text-sm text-muted-foreground">{{ stat.label }}</span>
              </div>
            </motion.div>
          </div>

          <!-- Filters + Table -->
          <motion.div
            :initial="{ opacity: 0, y: 20 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ delay: 0.4 }"
            class="glass-card overflow-hidden"
          >
            <!-- Filter Bar -->
            <div class="p-5 border-b" style="border-color: rgba(90, 120, 99, 0.1);">
              <div class="flex flex-col sm:flex-row sm:items-center gap-4">
                <!-- Search -->
                <div class="relative flex-1 max-w-sm">
                  <Search class="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="Search orders..."
                    class="admin-search w-full"
                  />
                </div>

                <!-- Status Tabs -->
                <div class="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                  <button
                    v-for="status in statuses.slice(0, 5)"
                    :key="status.id"
                    class="admin-tab whitespace-nowrap"
                    :class="{ active: selectedStatus === status.id }"
                    @click="selectedStatus = status.id"
                  >
                    {{ status.label }}
                    <span class="ml-1 opacity-60">({{ status.count }})</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Orders Table -->
            <div class="overflow-x-auto">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Rider</th>
                    <th>Delivery</th>
                    <th class="w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="order in filteredOrders"
                    :key="order.id"
                    class="cursor-pointer"
                    @click="openDetailsPanel(order)"
                  >
                    <td>
                      <div class="flex items-center gap-2">
                        <span class="font-medium">{{ order.id }}</span>
                        <span
                          v-if="order.priority"
                          class="px-1.5 py-0.5 text-[10px] font-bold rounded"
                          style="background: rgba(244, 153, 26, 0.15); color: var(--yndu-gold);"
                        >
                          PRIORITY
                        </span>
                      </div>
                      <span class="text-xs text-muted-foreground">{{ formatTime(order.createdAt) }}</span>
                    </td>
                    <td>
                      <div class="flex items-center gap-3">
                        <AvatarRoot class="w-8 h-8 rounded-full">
                          <AvatarImage :src="order.customer.avatar" :alt="order.customer.name" />
                          <AvatarFallback class="bg-[var(--yndu-green)] text-white text-xs">
                            {{ order.customer.name.charAt(0) }}
                          </AvatarFallback>
                        </AvatarRoot>
                        <div>
                          <p class="font-medium text-sm">{{ order.customer.name }}</p>
                          <p class="text-xs text-muted-foreground">{{ order.customer.phone }}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="text-sm">{{ order.items[0].name }}</span>
                      <span v-if="order.items[0].qty > 1" class="text-muted-foreground"> x{{ order.items[0].qty }}</span>
                    </td>
                    <td>
                      <span class="font-semibold">{{ formatPrice(order.total) }}</span>
                    </td>
                    <td>
                      <span :class="getStatusConfig(order.status).class" class="text-xs px-2.5 py-1 rounded-full font-medium">
                        {{ getStatusConfig(order.status).label }}
                      </span>
                    </td>
                    <td>
                      <div v-if="order.rider" class="flex items-center gap-2">
                        <AvatarRoot class="w-6 h-6 rounded-full">
                          <AvatarImage :src="order.rider.avatar" :alt="order.rider.name" />
                          <AvatarFallback class="bg-gray-200 text-gray-600 text-xs">
                            {{ order.rider.name.charAt(0) }}
                          </AvatarFallback>
                        </AvatarRoot>
                        <span class="text-sm">{{ order.rider.name.split(' ')[0] }}</span>
                      </div>
                      <button
                        v-else
                        class="text-xs font-medium px-2 py-1 rounded-lg transition-colors"
                        style="background: rgba(90, 120, 99, 0.1); color: var(--yndu-green);"
                        @click.stop="openAssignModal(order)"
                      >
                        Assign
                      </button>
                    </td>
                    <td>
                      <div class="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin class="size-3" />
                        {{ order.deliveryAddress.split(',')[0] }}
                      </div>
                    </td>
                    <td>
                      <button class="p-1.5 rounded-lg hover:bg-accent transition-colors" @click.stop>
                        <MoreHorizontal class="size-4 text-muted-foreground" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pagination -->
            <div class="p-4 border-t flex items-center justify-between" style="border-color: rgba(90, 120, 99, 0.1);">
              <p class="text-sm text-muted-foreground">
                Showing {{ filteredOrders.length }} of {{ orders.length }} orders
              </p>
              <div class="flex items-center gap-1">
                <button class="px-3 py-1.5 text-sm font-medium rounded-lg hover:bg-accent transition-colors">
                  Previous
                </button>
                <button class="px-3 py-1.5 text-sm font-medium rounded-lg" style="background: var(--yndu-green); color: white;">
                  1
                </button>
                <button class="px-3 py-1.5 text-sm font-medium rounded-lg hover:bg-accent transition-colors">
                  2
                </button>
                <button class="px-3 py-1.5 text-sm font-medium rounded-lg hover:bg-accent transition-colors">
                  Next
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <!-- Order Details Slide-over Panel -->
      <AnimatePresence>
        <motion.aside
          v-if="showDetailsPanel && selectedOrder"
          :initial="{ x: '100%' }"
          :animate="{ x: 0 }"
          :exit="{ x: '100%' }"
          :transition="{ type: 'spring', damping: 25, stiffness: 200 }"
          class="fixed right-0 top-0 bottom-0 w-full max-w-md glass-card border-l z-50 overflow-y-auto"
          style="border-color: rgba(90, 120, 99, 0.15);"
        >
          <!-- Panel Header -->
          <div class="sticky top-0 p-5 border-b flex items-center justify-between" style="background: rgba(255,255,255,0.9); border-color: rgba(90, 120, 99, 0.1);">
            <div>
              <h2 class="font-semibold text-lg">{{ selectedOrder.id }}</h2>
              <span :class="getStatusConfig(selectedOrder.status).class" class="text-xs px-2 py-0.5 rounded-full font-medium">
                {{ getStatusConfig(selectedOrder.status).label }}
              </span>
            </div>
            <button
              class="p-2 rounded-lg hover:bg-accent transition-colors"
              @click="showDetailsPanel = false"
            >
              <XCircle class="size-5 text-muted-foreground" />
            </button>
          </div>

          <div class="p-5 space-y-6">
            <!-- Customer -->
            <div>
              <h3 class="text-xs font-semibold uppercase text-muted-foreground mb-3">Customer</h3>
              <div class="flex items-center gap-3 p-3 rounded-xl" style="background: rgba(90, 120, 99, 0.05);">
                <AvatarRoot class="w-12 h-12 rounded-full">
                  <AvatarImage :src="selectedOrder.customer.avatar" :alt="selectedOrder.customer.name" />
                  <AvatarFallback class="bg-[var(--yndu-green)] text-white">
                    {{ selectedOrder.customer.name.charAt(0) }}
                  </AvatarFallback>
                </AvatarRoot>
                <div class="flex-1">
                  <p class="font-medium">{{ selectedOrder.customer.name }}</p>
                  <p class="text-sm text-muted-foreground">{{ selectedOrder.customer.phone }}</p>
                </div>
                <button class="p-2 rounded-lg hover:bg-accent transition-colors">
                  <Phone class="size-4" style="color: var(--yndu-green);" />
                </button>
              </div>
            </div>

            <!-- Delivery -->
            <div>
              <h3 class="text-xs font-semibold uppercase text-muted-foreground mb-3">Delivery</h3>
              <div class="space-y-2">
                <div class="flex items-start gap-3">
                  <MapPin class="size-4 text-muted-foreground mt-0.5" />
                  <span class="text-sm">{{ selectedOrder.deliveryAddress }}</span>
                </div>
                <div class="flex items-start gap-3">
                  <Clock class="size-4 text-muted-foreground mt-0.5" />
                  <span class="text-sm">{{ selectedOrder.deliverySlot }}</span>
                </div>
              </div>
            </div>

            <!-- Items -->
            <div>
              <h3 class="text-xs font-semibold uppercase text-muted-foreground mb-3">Items</h3>
              <div class="space-y-2">
                <div
                  v-for="item in selectedOrder.items"
                  :key="item.name"
                  class="flex items-center justify-between p-3 rounded-xl" style="background: rgba(90, 120, 99, 0.05);"
                >
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-lg flex items-center justify-center" style="background: rgba(90, 120, 99, 0.1);">
                      <Package class="size-5" style="color: var(--yndu-green);" />
                    </div>
                    <div>
                      <p class="font-medium text-sm">{{ item.name }}</p>
                      <p class="text-xs text-muted-foreground">Qty: {{ item.qty }}</p>
                    </div>
                  </div>
                  <span class="font-semibold">{{ formatPrice(item.price * item.qty) }}</span>
                </div>
              </div>
              <div class="flex items-center justify-between mt-4 pt-3 border-t" style="border-color: rgba(90, 120, 99, 0.1);">
                <span class="font-medium">Total</span>
                <span class="text-lg font-bold">{{ formatPrice(selectedOrder.total) }}</span>
              </div>
            </div>

            <!-- Rider -->
            <div>
              <h3 class="text-xs font-semibold uppercase text-muted-foreground mb-3">Assigned Rider</h3>
              <div v-if="selectedOrder.rider" class="flex items-center gap-3 p-3 rounded-xl" style="background: rgba(90, 120, 99, 0.05);">
                <AvatarRoot class="w-10 h-10 rounded-full">
                  <AvatarImage :src="selectedOrder.rider.avatar" :alt="selectedOrder.rider.name" />
                  <AvatarFallback class="bg-gray-200 text-gray-600">
                    {{ selectedOrder.rider.name.charAt(0) }}
                  </AvatarFallback>
                </AvatarRoot>
                <div class="flex-1">
                  <p class="font-medium text-sm">{{ selectedOrder.rider.name }}</p>
                  <p class="text-xs text-muted-foreground">{{ selectedOrder.rider.phone }}</p>
                </div>
                <button class="p-2 rounded-lg hover:bg-accent transition-colors">
                  <Navigation class="size-4" style="color: var(--yndu-green);" />
                </button>
              </div>
              <button
                v-else
                class="w-full p-3 rounded-xl border-2 border-dashed text-sm font-medium text-center transition-colors hover:border-[var(--yndu-green)] hover:bg-[var(--yndu-green)]/5"
                style="border-color: rgba(90, 120, 99, 0.2);"
                @click="openAssignModal(selectedOrder)"
              >
                + Assign Rider
              </button>
            </div>

            <!-- Notes -->
            <div v-if="selectedOrder.notes">
              <h3 class="text-xs font-semibold uppercase text-muted-foreground mb-3">Notes</h3>
              <p class="text-sm p-3 rounded-xl" style="background: rgba(244, 153, 26, 0.1);">
                {{ selectedOrder.notes }}
              </p>
            </div>

            <!-- Actions -->
            <div class="pt-4 space-y-2">
              <h3 class="text-xs font-semibold uppercase text-muted-foreground mb-3">Update Status</h3>
              <div class="grid grid-cols-2 gap-2">
                <button
                  v-if="selectedOrder.status === 'pending'"
                  class="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white"
                  style="background: var(--yndu-green);"
                  @click="updateOrderStatus(selectedOrder.id, 'processing')"
                >
                  <RefreshCw class="size-4" />
                  Start Processing
                </button>
                <button
                  v-if="selectedOrder.status === 'processing'"
                  class="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white"
                  style="background: var(--yndu-green);"
                  @click="dispatchOrder(selectedOrder.id)"
                >
                  <Truck class="size-4" />
                  Dispatch
                </button>
                <button
                  v-if="selectedOrder.status === 'dispatched'"
                  class="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white"
                  style="background: #3498db;"
                  @click="updateOrderStatus(selectedOrder.id, 'in-transit')"
                >
                  <Truck class="size-4" />
                  Mark In Transit
                </button>
                <button
                  v-if="selectedOrder.status === 'in-transit'"
                  class="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white"
                  style="background: var(--yndu-green);"
                  @click="updateOrderStatus(selectedOrder.id, 'delivered')"
                >
                  <CheckCircle class="size-4" />
                  Mark Delivered
                </button>
                <button
                  v-if="['pending', 'processing', 'dispatched', 'in-transit'].includes(selectedOrder.status)"
                  class="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium"
                  style="background: rgba(244, 153, 26, 0.15); color: var(--yndu-gold);"
                  @click="updateOrderStatus(selectedOrder.id, 'delayed')"
                >
                  <AlertCircle class="size-4" />
                  Mark Delayed
                </button>
                <button
                  v-if="['pending', 'processing'].includes(selectedOrder.status)"
                  class="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium"
                  style="background: rgba(231, 76, 60, 0.15); color: #e74c3c;"
                  @click="updateOrderStatus(selectedOrder.id, 'cancelled')"
                >
                  <XCircle class="size-4" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </motion.aside>
      </AnimatePresence>

      <!-- Backdrop for panel -->
      <div
        v-if="showDetailsPanel"
        class="fixed inset-0 bg-black/20 z-40"
        @click="showDetailsPanel = false"
      />
    </div>

    <!-- Assign Rider Modal -->
    <DialogRoot v-model:open="showAssignModal">
      <DialogPortal>
        <DialogOverlay class="fixed inset-0 bg-black/40 z-50" />
        <DialogContent class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md glass-card p-6 z-50 rounded-2xl">
          <DialogTitle class="text-lg font-semibold mb-1">Assign Rider</DialogTitle>
          <DialogDescription class="text-sm text-muted-foreground mb-6">
            Select a rider to deliver order {{ selectedOrder?.id }}
          </DialogDescription>

          <div class="space-y-3 max-h-80 overflow-y-auto">
            <button
              v-for="rider in availableRiders"
              :key="rider.id"
              class="w-full flex items-center gap-4 p-4 rounded-xl border transition-all hover:border-[var(--yndu-green)] hover:bg-[var(--yndu-green)]/5"
              style="border-color: rgba(90, 120, 99, 0.15);"
              @click="assignRider(rider)"
            >
              <AvatarRoot class="w-12 h-12 rounded-full">
                <AvatarImage :src="rider.avatar" :alt="rider.name" />
                <AvatarFallback class="bg-[var(--yndu-green)] text-white">
                  {{ rider.name.charAt(0) }}
                </AvatarFallback>
              </AvatarRoot>
              <div class="flex-1 text-left">
                <p class="font-medium">{{ rider.name }}</p>
                <div class="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin class="size-3" />
                  {{ rider.location }}
                </div>
              </div>
              <div class="text-right">
                <div class="flex items-center gap-1">
                  <span
                    class="w-2 h-2 rounded-full"
                    :class="rider.status === 'active' ? 'bg-green-500' : 'bg-orange-400'"
                  />
                  <span class="text-xs text-muted-foreground capitalize">{{ rider.status }}</span>
                </div>
                <p class="text-xs text-muted-foreground mt-1">{{ rider.assigned }}/{{ rider.capacity }} orders</p>
              </div>
            </button>

            <div v-if="availableRiders.length === 0" class="text-center py-8">
              <Truck class="size-12 text-muted-foreground mx-auto mb-3" />
              <p class="font-medium">No riders available</p>
              <p class="text-sm text-muted-foreground">All riders are currently at capacity</p>
            </div>
          </div>

          <DialogClose as-child>
            <button class="absolute top-4 right-4 p-2 rounded-lg hover:bg-accent transition-colors" aria-label="Close">
              <XCircle class="size-5 text-muted-foreground" />
            </button>
          </DialogClose>
        </DialogContent>
      </DialogPortal>
    </DialogRoot>
  </div>
</template>
