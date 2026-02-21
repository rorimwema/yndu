<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  TabsRoot, TabsList, TabsTrigger, TabsContent,
  DialogRoot, DialogPortal, DialogOverlay, DialogContent, DialogTitle, DialogDescription,
} from 'reka-ui';
import { motion } from 'motion-v';
import {
  Package, ShoppingBag, MapPin, CreditCard, Calendar, Truck,
  Plus, Pencil, Trash2, X, Check, Pause, Play, ChevronRight,
  Smartphone, AlertCircle, User, Clock, Sparkles,
} from 'lucide-vue-next';
import type { Subscription, SubscriptionAddress } from '~/types/subscription';

// SEO
useSeoMeta({
  title: 'My Account | Yndu',
  description: 'Manage your subscriptions, orders, addresses and payment methods.',
});

definePageMeta({
  middleware: ['auth'],
});

// ─── Tab state ─────────────────────────────────────────────
const activeTab = ref('subscriptions');

const tabs = [
  { id: 'subscriptions', label: 'Subscriptions', icon: Package },
  { id: 'orders', label: 'Orders', icon: ShoppingBag },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
  { id: 'payment', label: 'Payment', icon: CreditCard },
];

// ─── Subscriptions ─────────────────────────────────────────
const subscriptions = ref<Subscription[]>([
  {
    id: 'sub_12345',
    userId: 'user_1',
    plan: {
      id: 'plan_medium_weekly',
      name: 'Medium Box',
      frequency: 'WEEKLY',
      boxSize: 'MEDIUM',
      basePrice: 2500,
      discountPercentage: 0,
      description: 'Weekly delivery of medium fresh produce box',
    },
    deliveryDay: 'TUESDAY',
    paymentMode: 'WEEKLY',
    status: 'ACTIVE',
    startDate: '2025-01-15',
    nextDeliveryDate: '2026-02-25',
    address: {
      label: 'Home',
      street: '123 Karen Road',
      apartment: 'Block B, Apt 4',
      neighborhood: 'Karen',
      city: 'Nairobi',
      instructions: 'Gate code: 1234',
    },
    totalWeeklyPrice: 2500,
    createdAt: '2025-01-15',
    updatedAt: '2026-02-08',
  },
  {
    id: 'sub_67890',
    userId: 'user_1',
    plan: {
      id: 'plan_large_biweekly',
      name: 'Large Box',
      frequency: 'BIWEEKLY',
      boxSize: 'LARGE',
      basePrice: 3500,
      discountPercentage: 5,
      description: 'Bi-weekly delivery of large fresh produce box',
    },
    deliveryDay: 'FRIDAY',
    paymentMode: 'MONTHLY',
    status: 'PAUSED',
    startDate: '2025-01-01',
    nextDeliveryDate: '2026-02-28',
    address: {
      label: 'Office',
      street: '456 Ngong Road',
      neighborhood: 'Kilimani',
      city: 'Nairobi',
    },
    totalWeeklyPrice: 3325,
    createdAt: '2025-01-01',
    updatedAt: '2026-02-01',
  },
]);

const isSubLoading = ref(false);

const handlePause = async (sub: Subscription) => {
  isSubLoading.value = true;
  await new Promise(r => setTimeout(r, 800));
  const s = subscriptions.value.find(s => s.id === sub.id);
  if (s) s.status = 'PAUSED';
  isSubLoading.value = false;
};

const handleResume = async (sub: Subscription) => {
  isSubLoading.value = true;
  await new Promise(r => setTimeout(r, 800));
  const s = subscriptions.value.find(s => s.id === sub.id);
  if (s) s.status = 'ACTIVE';
  isSubLoading.value = false;
};

// ─── Orders ────────────────────────────────────────────────
interface UserOrder {
  id: string;
  date: string;
  items: string[];
  status: 'Delivered' | 'In Transit' | 'Processing' | 'Cancelled';
  total: number;
}

const orders = ref<UserOrder[]>([
  { id: 'ORD-2841', date: '2026-02-15', items: ['Medium Veggie Box', 'Fresh Herbs Pack'], status: 'Delivered', total: 2800 },
  { id: 'ORD-2790', date: '2026-02-08', items: ['Medium Veggie Box'], status: 'Delivered', total: 2500 },
  { id: 'ORD-2756', date: '2026-02-01', items: ['Medium Veggie Box', 'Fruit Sampler'], status: 'Delivered', total: 4200 },
  { id: 'ORD-2701', date: '2026-01-25', items: ['Large Box'], status: 'Delivered', total: 3500 },
  { id: 'ORD-2650', date: '2026-01-18', items: ['Medium Veggie Box'], status: 'Cancelled', total: 2500 },
]);

const orderStatusColor = (status: UserOrder['status']) => {
  const map: Record<UserOrder['status'], string> = {
    'Delivered': 'bg-green-100 text-green-700',
    'In Transit': 'bg-blue-100 text-blue-700',
    'Processing': 'bg-amber-100 text-amber-700',
    'Cancelled': 'bg-red-100 text-red-700',
  };
  return map[status];
};

// ─── Addresses ─────────────────────────────────────────────
interface SavedAddress extends SubscriptionAddress {
  id: string;
  isDefault?: boolean;
}

const addresses = ref<SavedAddress[]>([
  { id: 'addr_1', label: 'Home', street: '123 Karen Road', apartment: 'Block B, Apt 4', neighborhood: 'Karen', city: 'Nairobi', instructions: 'Gate code: 1234', isDefault: true },
  { id: 'addr_2', label: 'Office', street: '456 Ngong Road', neighborhood: 'Kilimani', city: 'Nairobi' },
]);

const showAddressDialog = ref(false);
const editingAddress = ref<SavedAddress | null>(null);
const addressForm = ref<Partial<SavedAddress>>({});

const openAddAddress = () => {
  editingAddress.value = null;
  addressForm.value = { label: '', street: '', apartment: '', neighborhood: '', city: 'Nairobi', instructions: '' };
  showAddressDialog.value = true;
};

const openEditAddress = (addr: SavedAddress) => {
  editingAddress.value = addr;
  addressForm.value = { ...addr };
  showAddressDialog.value = true;
};

const saveAddress = () => {
  if (editingAddress.value) {
    const idx = addresses.value.findIndex(a => a.id === editingAddress.value!.id);
    if (idx > -1) addresses.value[idx] = { ...editingAddress.value, ...addressForm.value };
  } else {
    addresses.value.push({
      id: `addr_${Date.now()}`,
      label: addressForm.value.label || 'New Address',
      street: addressForm.value.street || '',
      apartment: addressForm.value.apartment,
      neighborhood: addressForm.value.neighborhood || '',
      city: addressForm.value.city || 'Nairobi',
      instructions: addressForm.value.instructions,
    });
  }
  showAddressDialog.value = false;
};

const deleteAddress = (id: string) => {
  addresses.value = addresses.value.filter(a => a.id !== id);
};

// ─── Payment Methods ───────────────────────────────────────
interface PaymentMethod {
  id: string;
  type: 'mpesa' | 'card';
  label: string;
  detail: string;
  isDefault?: boolean;
}

const paymentMethods = ref<PaymentMethod[]>([
  { id: 'pm_1', type: 'mpesa', label: 'M-Pesa', detail: '+254 712 *** 890', isDefault: true },
  { id: 'pm_2', type: 'card', label: 'Visa', detail: '•••• 4242' },
]);

const showPaymentDialog = ref(false);
const newPaymentType = ref<'mpesa' | 'card'>('mpesa');
const newPaymentDetail = ref('');

const addPaymentMethod = () => {
  paymentMethods.value.push({
    id: `pm_${Date.now()}`,
    type: newPaymentType.value,
    label: newPaymentType.value === 'mpesa' ? 'M-Pesa' : 'Visa',
    detail: newPaymentDetail.value,
  });
  showPaymentDialog.value = false;
  newPaymentDetail.value = '';
};

const removePayment = (id: string) => {
  paymentMethods.value = paymentMethods.value.filter(p => p.id !== id);
};

// ─── Helpers ───────────────────────────────────────────────
const formatPrice = (n: number) => `KSh ${n.toLocaleString()}`;
const formatDate = (d: string) => new Date(d).toLocaleDateString('en-KE', { month: 'short', day: 'numeric', year: 'numeric' });
</script>

<template>
  <div class="min-h-dvh bg-[var(--bg-canvas)] pb-12">

    <!-- Header -->
    <div class="bg-white border-b border-neutral-100">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <motion.div
          :initial="{ opacity: 0, y: 12 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.4 }"
          class="flex items-center gap-4"
        >
          <div class="w-12 h-12 rounded-full bg-primary-deep/10 flex items-center justify-center">
            <User :size="22" class="text-primary-deep" />
          </div>
          <div>
            <h1 class="text-xl sm:text-2xl font-bold text-foundation tracking-tight text-balance">My Account</h1>
            <p class="text-sm text-neutral-400">Manage your deliveries and preferences</p>
          </div>
        </motion.div>
      </div>
    </div>

    <div class="max-w-3xl mx-auto px-4 sm:px-6 pt-6">

      <!-- Tabs -->
      <TabsRoot v-model="activeTab">
        <TabsList class="flex gap-1 bg-white rounded-xl border border-neutral-100 p-1 mb-6 overflow-x-auto">
          <TabsTrigger
            v-for="tab in tabs"
            :key="tab.id"
            :value="tab.id"
            class="flex items-center gap-1.5 px-3 sm:px-4 py-2.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap cursor-pointer transition-all outline-none
              text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50
              data-[state=active]:bg-primary-deep data-[state=active]:text-white data-[state=active]:shadow-sm"
          >
            <component :is="tab.icon" :size="15" />
            <span class="hidden sm:inline">{{ tab.label }}</span>
          </TabsTrigger>
        </TabsList>

        <!-- ═══════════════ SUBSCRIPTIONS TAB ═══════════════ -->
        <TabsContent value="subscriptions" class="outline-none">
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-bold text-foundation">Subscriptions</h2>
              <NuxtLink
                to="/subscription"
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary-deep text-white hover:bg-primary-deep/90 transition-colors"
              >
                <Plus :size="14" /> New
              </NuxtLink>
            </div>

            <motion.div
              v-for="(sub, index) in subscriptions"
              :key="sub.id"
              :initial="{ opacity: 0, y: 12 }"
              :animate="{ opacity: 1, y: 0 }"
              :transition="{ duration: 0.25, delay: index * 0.08 }"
              class="bg-white rounded-xl border border-neutral-100 overflow-hidden"
              :class="{ 'opacity-60': sub.status === 'PAUSED' }"
            >
              <!-- Sub header -->
              <div class="p-4 sm:p-5 flex items-start justify-between gap-3">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl flex items-center justify-center"
                    :class="sub.status === 'ACTIVE' ? 'bg-primary-deep/10' : 'bg-amber-100'"
                  >
                    <Package :size="18" :class="sub.status === 'ACTIVE' ? 'text-primary-deep' : 'text-amber-600'" />
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <h3 class="font-bold text-sm text-foundation">{{ sub.plan.name }}</h3>
                      <span
                        class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase"
                        :class="sub.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'"
                      >
                        {{ sub.status }}
                      </span>
                    </div>
                    <p class="text-xs text-neutral-400 mt-0.5">
                      {{ sub.plan.frequency === 'WEEKLY' ? 'Weekly' : 'Bi-weekly' }} · {{ sub.deliveryDay.charAt(0) + sub.deliveryDay.slice(1).toLowerCase() }}s
                    </p>
                  </div>
                </div>
                <p class="text-lg font-bold text-primary-deep leading-none">{{ formatPrice(sub.totalWeeklyPrice) }}</p>
              </div>

              <!-- Sub details -->
              <div class="px-4 sm:px-5 pb-3 flex items-center gap-4 text-xs text-neutral-400">
                <span class="flex items-center gap-1"><Calendar :size="12" /> Next: {{ formatDate(sub.nextDeliveryDate) }}</span>
                <span class="flex items-center gap-1"><MapPin :size="12" /> {{ sub.address.label }}</span>
              </div>

              <!-- Sub actions -->
              <div class="px-4 sm:px-5 pb-4 flex gap-2">
                <button
                  v-if="sub.status === 'ACTIVE'"
                  @click="handlePause(sub)"
                  :disabled="isSubLoading"
                  class="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-neutral-200 text-xs font-medium text-neutral-500 hover:bg-neutral-50 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <Pause :size="12" /> Pause
                </button>
                <button
                  v-if="sub.status === 'PAUSED'"
                  @click="handleResume(sub)"
                  :disabled="isSubLoading"
                  class="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary-deep text-white text-xs font-medium hover:bg-primary-deep/90 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <Play :size="12" /> Resume
                </button>
                <NuxtLink
                  :to="`/subscriptions`"
                  class="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-neutral-50 text-xs font-medium text-neutral-600 hover:bg-neutral-100 transition-colors"
                >
                  Manage <ChevronRight :size="12" />
                </NuxtLink>
              </div>
            </motion.div>

            <!-- Empty -->
            <div v-if="subscriptions.length === 0" class="text-center py-12">
              <div class="w-14 h-14 mx-auto mb-3 rounded-full bg-neutral-100 flex items-center justify-center">
                <Package :size="24" class="text-neutral-400" />
              </div>
              <p class="font-medium text-foundation text-sm">No subscriptions yet</p>
              <p class="text-xs text-neutral-400 mt-1 mb-4">Get fresh produce delivered weekly</p>
              <NuxtLink to="/subscription" class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-primary-deep text-white">
                <Sparkles :size="14" /> Create Subscription
              </NuxtLink>
            </div>
          </div>
        </TabsContent>

        <!-- ═══════════════ ORDERS TAB ═══════════════ -->
        <TabsContent value="orders" class="outline-none">
          <div class="space-y-4">
            <h2 class="text-lg font-bold text-foundation">Order History</h2>

            <motion.div
              v-for="(order, index) in orders"
              :key="order.id"
              :initial="{ opacity: 0, y: 12 }"
              :animate="{ opacity: 1, y: 0 }"
              :transition="{ duration: 0.25, delay: index * 0.06 }"
              class="bg-white rounded-xl border border-neutral-100 p-4 sm:p-5"
            >
              <div class="flex items-start justify-between gap-3">
                <div>
                  <div class="flex items-center gap-2 mb-1">
                    <p class="font-bold text-sm text-foundation">{{ order.id }}</p>
                    <span
                      class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                      :class="orderStatusColor(order.status)"
                    >
                      {{ order.status }}
                    </span>
                  </div>
                  <p class="text-xs text-neutral-400 flex items-center gap-1">
                    <Clock :size="11" /> {{ formatDate(order.date) }}
                  </p>
                </div>
                <p class="font-bold text-sm text-primary-deep">{{ formatPrice(order.total) }}</p>
              </div>
              <div class="mt-2 flex flex-wrap gap-1.5">
                <span
                  v-for="item in order.items"
                  :key="item"
                  class="px-2 py-0.5 rounded-md bg-neutral-50 text-[11px] font-medium text-neutral-600"
                >
                  {{ item }}
                </span>
              </div>
            </motion.div>

            <div v-if="orders.length === 0" class="text-center py-12">
              <div class="w-14 h-14 mx-auto mb-3 rounded-full bg-neutral-100 flex items-center justify-center">
                <ShoppingBag :size="24" class="text-neutral-400" />
              </div>
              <p class="font-medium text-foundation text-sm">No orders yet</p>
              <p class="text-xs text-neutral-400 mt-1">Your order history will appear here</p>
            </div>
          </div>
        </TabsContent>

        <!-- ═══════════════ ADDRESSES TAB ═══════════════ -->
        <TabsContent value="addresses" class="outline-none">
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-bold text-foundation">Saved Addresses</h2>
              <button
                @click="openAddAddress"
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary-deep text-white hover:bg-primary-deep/90 transition-colors cursor-pointer"
              >
                <Plus :size="14" /> Add Address
              </button>
            </div>

            <motion.div
              v-for="(addr, index) in addresses"
              :key="addr.id"
              :initial="{ opacity: 0, y: 12 }"
              :animate="{ opacity: 1, y: 0 }"
              :transition="{ duration: 0.25, delay: index * 0.08 }"
              class="bg-white rounded-xl border border-neutral-100 p-4 sm:p-5"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="flex items-start gap-3">
                  <div class="w-9 h-9 rounded-lg bg-primary-deep/10 flex items-center justify-center mt-0.5">
                    <MapPin :size="16" class="text-primary-deep" />
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <p class="font-bold text-sm text-foundation">{{ addr.label }}</p>
                      <span v-if="addr.isDefault" class="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-primary-deep/10 text-primary-deep">Default</span>
                    </div>
                    <p class="text-xs text-neutral-600 mt-0.5">{{ addr.street }}<template v-if="addr.apartment">, {{ addr.apartment }}</template></p>
                    <p class="text-xs text-neutral-400">{{ addr.neighborhood }}, {{ addr.city }}</p>
                    <p v-if="addr.instructions" class="text-[11px] text-neutral-400 mt-1 italic">{{ addr.instructions }}</p>
                  </div>
                </div>
                <div class="flex gap-1">
                  <button
                    @click="openEditAddress(addr)"
                    class="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-primary-deep hover:bg-neutral-50 transition-colors cursor-pointer"
                  >
                    <Pencil :size="14" />
                  </button>
                  <button
                    @click="deleteAddress(addr.id)"
                    class="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <Trash2 :size="14" />
                  </button>
                </div>
              </div>
            </motion.div>

            <div v-if="addresses.length === 0" class="text-center py-12">
              <div class="w-14 h-14 mx-auto mb-3 rounded-full bg-neutral-100 flex items-center justify-center">
                <MapPin :size="24" class="text-neutral-400" />
              </div>
              <p class="font-medium text-foundation text-sm">No saved addresses</p>
              <p class="text-xs text-neutral-400 mt-1 mb-4">Add your delivery address to get started</p>
              <button @click="openAddAddress" class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-primary-deep text-white cursor-pointer">
                <Plus :size="14" /> Add Address
              </button>
            </div>
          </div>

          <!-- Address Dialog -->
          <DialogRoot v-model:open="showAddressDialog">
            <DialogPortal>
              <DialogOverlay class="fixed inset-0 bg-black/40 z-50" />
              <DialogContent class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90vw] max-w-md bg-white rounded-2xl p-6 shadow-2xl outline-none">
                <DialogTitle class="text-lg font-bold text-foundation">
                  {{ editingAddress ? 'Edit Address' : 'Add Address' }}
                </DialogTitle>
                <DialogDescription class="text-xs text-neutral-400 mb-4">
                  Enter your delivery address details
                </DialogDescription>

                <div class="space-y-3">
                  <div>
                    <label class="text-xs font-medium text-neutral-600 mb-1 block">Label</label>
                    <input v-model="addressForm.label" placeholder="e.g. Home, Office" class="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-deep/30 focus:border-primary-deep/40 bg-neutral-50/50" />
                  </div>
                  <div>
                    <label class="text-xs font-medium text-neutral-600 mb-1 block">Street</label>
                    <input v-model="addressForm.street" placeholder="123 Main Street" class="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-deep/30 focus:border-primary-deep/40 bg-neutral-50/50" />
                  </div>
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="text-xs font-medium text-neutral-600 mb-1 block">Apartment</label>
                      <input v-model="addressForm.apartment" placeholder="Apt 4B" class="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-deep/30 focus:border-primary-deep/40 bg-neutral-50/50" />
                    </div>
                    <div>
                      <label class="text-xs font-medium text-neutral-600 mb-1 block">Neighborhood</label>
                      <input v-model="addressForm.neighborhood" placeholder="Karen" class="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-deep/30 focus:border-primary-deep/40 bg-neutral-50/50" />
                    </div>
                  </div>
                  <div>
                    <label class="text-xs font-medium text-neutral-600 mb-1 block">City</label>
                    <input v-model="addressForm.city" placeholder="Nairobi" class="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-deep/30 focus:border-primary-deep/40 bg-neutral-50/50" />
                  </div>
                  <div>
                    <label class="text-xs font-medium text-neutral-600 mb-1 block">Delivery Instructions</label>
                    <input v-model="addressForm.instructions" placeholder="Gate code, landmarks..." class="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-deep/30 focus:border-primary-deep/40 bg-neutral-50/50" />
                  </div>
                </div>

                <div class="flex gap-3 mt-5">
                  <button
                    @click="showAddressDialog = false"
                    class="flex-1 py-2.5 rounded-xl border border-neutral-200 text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    @click="saveAddress"
                    class="flex-1 py-2.5 rounded-xl bg-primary-deep text-white text-sm font-medium hover:bg-primary-deep/90 transition-colors cursor-pointer"
                  >
                    {{ editingAddress ? 'Save Changes' : 'Add Address' }}
                  </button>
                </div>
              </DialogContent>
            </DialogPortal>
          </DialogRoot>
        </TabsContent>

        <!-- ═══════════════ PAYMENT TAB ═══════════════ -->
        <TabsContent value="payment" class="outline-none">
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-bold text-foundation">Payment Methods</h2>
              <button
                @click="showPaymentDialog = true"
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary-deep text-white hover:bg-primary-deep/90 transition-colors cursor-pointer"
              >
                <Plus :size="14" /> Add Method
              </button>
            </div>

            <motion.div
              v-for="(pm, index) in paymentMethods"
              :key="pm.id"
              :initial="{ opacity: 0, y: 12 }"
              :animate="{ opacity: 1, y: 0 }"
              :transition="{ duration: 0.25, delay: index * 0.08 }"
              class="bg-white rounded-xl border border-neutral-100 p-4 sm:p-5 flex items-center justify-between gap-3"
            >
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center"
                  :class="pm.type === 'mpesa' ? 'bg-green-100' : 'bg-blue-100'"
                >
                  <Smartphone v-if="pm.type === 'mpesa'" :size="18" class="text-green-600" />
                  <CreditCard v-else :size="18" class="text-blue-600" />
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <p class="font-bold text-sm text-foundation">{{ pm.label }}</p>
                    <span v-if="pm.isDefault" class="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-primary-deep/10 text-primary-deep">Default</span>
                  </div>
                  <p class="text-xs text-neutral-400">{{ pm.detail }}</p>
                </div>
              </div>
              <button
                @click="removePayment(pm.id)"
                class="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
              >
                <Trash2 :size="14" />
              </button>
            </motion.div>

            <div v-if="paymentMethods.length === 0" class="text-center py-12">
              <div class="w-14 h-14 mx-auto mb-3 rounded-full bg-neutral-100 flex items-center justify-center">
                <CreditCard :size="24" class="text-neutral-400" />
              </div>
              <p class="font-medium text-foundation text-sm">No payment methods</p>
              <p class="text-xs text-neutral-400 mt-1 mb-4">Add M-Pesa or card to pay for orders</p>
              <button @click="showPaymentDialog = true" class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-primary-deep text-white cursor-pointer">
                <Plus :size="14" /> Add Method
              </button>
            </div>
          </div>

          <!-- Payment Dialog -->
          <DialogRoot v-model:open="showPaymentDialog">
            <DialogPortal>
              <DialogOverlay class="fixed inset-0 bg-black/40 z-50" />
              <DialogContent class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90vw] max-w-md bg-white rounded-2xl p-6 shadow-2xl outline-none">
                <DialogTitle class="text-lg font-bold text-foundation">Add Payment Method</DialogTitle>
                <DialogDescription class="text-xs text-neutral-400 mb-4">
                  Choose your preferred payment method
                </DialogDescription>

                <!-- Type picker -->
                <div class="grid grid-cols-2 gap-3 mb-4">
                  <button
                    @click="newPaymentType = 'mpesa'"
                    class="p-3 rounded-xl border-2 text-center transition-all cursor-pointer"
                    :class="newPaymentType === 'mpesa' ? 'border-primary-deep bg-primary-deep/5' : 'border-neutral-200 hover:border-primary-deep/30'"
                  >
                    <Smartphone :size="20" class="mx-auto mb-1" :class="newPaymentType === 'mpesa' ? 'text-primary-deep' : 'text-neutral-400'" />
                    <p class="text-sm font-medium text-foundation">M-Pesa</p>
                  </button>
                  <button
                    @click="newPaymentType = 'card'"
                    class="p-3 rounded-xl border-2 text-center transition-all cursor-pointer"
                    :class="newPaymentType === 'card' ? 'border-primary-deep bg-primary-deep/5' : 'border-neutral-200 hover:border-primary-deep/30'"
                  >
                    <CreditCard :size="20" class="mx-auto mb-1" :class="newPaymentType === 'card' ? 'text-primary-deep' : 'text-neutral-400'" />
                    <p class="text-sm font-medium text-foundation">Card</p>
                  </button>
                </div>

                <div>
                  <label class="text-xs font-medium text-neutral-600 mb-1 block">
                    {{ newPaymentType === 'mpesa' ? 'Phone Number' : 'Card Number' }}
                  </label>
                  <input
                    v-model="newPaymentDetail"
                    :placeholder="newPaymentType === 'mpesa' ? '+254 7XX XXX XXX' : '4242 4242 4242 4242'"
                    class="w-full px-3 py-2.5 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-deep/30 focus:border-primary-deep/40 bg-neutral-50/50"
                  />
                </div>

                <div class="flex gap-3 mt-5">
                  <button
                    @click="showPaymentDialog = false"
                    class="flex-1 py-2.5 rounded-xl border border-neutral-200 text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    @click="addPaymentMethod"
                    :disabled="!newPaymentDetail"
                    class="flex-1 py-2.5 rounded-xl bg-primary-deep text-white text-sm font-medium hover:bg-primary-deep/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Add {{ newPaymentType === 'mpesa' ? 'M-Pesa' : 'Card' }}
                  </button>
                </div>
              </DialogContent>
            </DialogPortal>
          </DialogRoot>
        </TabsContent>

      </TabsRoot>
    </div>
  </div>
</template>
