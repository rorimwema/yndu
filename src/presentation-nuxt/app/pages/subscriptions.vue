<script setup lang="ts">
import { ref, computed } from 'vue';
import { motion } from 'motion-v';
import { 
  Plus, 
  Calendar, 
  Package, 
  Truck, 
  CreditCard, 
  MapPin,
  Pause,
  Play,
  X,
  ChevronRight,
  Sparkles,
  AlertCircle
} from 'lucide-vue-next';
import type { Subscription, SubscriptionStatus } from '../types/subscription';

// SEO
useSeoMeta({
  title: 'My Subscriptions | Yndu',
  description: 'Manage your fresh produce subscriptions. View upcoming deliveries, pause, resume, or cancel anytime.',
});

definePageMeta({
  middleware: ['auth'],
});

// Mock subscriptions data (would come from API)
const subscriptions = ref<Subscription[]>([
  {
    id: 'sub_12345',
    userId: 'user_1',
    plan: {
      id: 'plan_medium_weekly',
      name: 'Medium Box - Weekly',
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
    nextDeliveryDate: '2025-02-11',
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
    updatedAt: '2025-02-08',
  },
  {
    id: 'sub_67890',
    userId: 'user_1',
    plan: {
      id: 'plan_large_biweekly',
      name: 'Large Box - Bi-Weekly',
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
    nextDeliveryDate: '2025-02-21',
    address: {
      label: 'Office',
      street: '456 Ngong Road',
      neighborhood: 'Kilimani',
      city: 'Nairobi',
    },
    totalWeeklyPrice: 3325,
    createdAt: '2025-01-01',
    updatedAt: '2025-02-01',
  },
]);

const isLoading = ref(false);
const showPauseModal = ref(false);
const showCancelModal = ref(false);
const selectedSubscription = ref<Subscription | null>(null);

const activeSubscriptions = computed(() => 
  subscriptions.value.filter(sub => sub.status === 'ACTIVE')
);

const pausedSubscriptions = computed(() => 
  subscriptions.value.filter(sub => sub.status === 'PAUSED')
);

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
  }).format(price).replace('KES', 'KSh');
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-KE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const getStatusColor = (status: SubscriptionStatus) => {
  switch (status) {
    case 'ACTIVE':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    case 'PAUSED':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    case 'CANCELLED':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

const handlePause = (subscription: Subscription) => {
  selectedSubscription.value = subscription;
  showPauseModal.value = true;
};

const handleResume = async (subscription: Subscription) => {
  isLoading.value = true;
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  const index = subscriptions.value.findIndex(s => s.id === subscription.id);
  if (index > -1) {
    subscriptions.value[index].status = 'ACTIVE';
  }
  isLoading.value = false;
};

const handleCancel = (subscription: Subscription) => {
  selectedSubscription.value = subscription;
  showCancelModal.value = true;
};

const confirmPause = async () => {
  if (!selectedSubscription.value) return;
  isLoading.value = true;
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  const index = subscriptions.value.findIndex(s => s.id === selectedSubscription.value!.id);
  if (index > -1) {
    subscriptions.value[index].status = 'PAUSED';
  }
  isLoading.value = false;
  showPauseModal.value = false;
  selectedSubscription.value = null;
};

const confirmCancel = async () => {
  if (!selectedSubscription.value) return;
  isLoading.value = true;
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  const index = subscriptions.value.findIndex(s => s.id === selectedSubscription.value!.id);
  if (index > -1) {
    subscriptions.value[index].status = 'CANCELLED';
  }
  isLoading.value = false;
  showCancelModal.value = false;
  selectedSubscription.value = null;
};
</script>

<template>
  <div class="min-h-dvh bg-[var(--bg-canvas)]">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 class="text-3xl font-bold text-foundation">My Subscriptions</h1>
          <p class="text-neutral-500 mt-1">Manage your fresh produce deliveries</p>
        </div>
        <NuxtLink
          to="/subscription"
          class="inline-flex items-center justify-center gap-2 bg-primary-deep text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-primary-deep/20 hover:shadow-xl hover:shadow-primary-deep/30 hover:-translate-y-0.5 transition-all"
        >
          <Plus :size="20" />
          Create New Subscription
        </NuxtLink>
      </div>

      <!-- Active Subscriptions -->
      <section v-if="activeSubscriptions.length > 0" class="mb-12">
        <h2 class="text-xl font-bold text-foundation text-balance mb-4 flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-green-500" />
          Active Subscriptions
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            v-for="subscription in activeSubscriptions"
            :key="subscription.id"
            :initial="{ opacity: 0, y: 20 }"
            :animate="{ opacity: 1, y: 0 }"
            class="bg-white dark:bg-zinc-900 rounded-2xl border border-neutral-100 dark:border-zinc-800 shadow-sm overflow-hidden"
          >
            <!-- Header -->
            <div class="p-6 border-b border-neutral-100 dark:border-zinc-800 bg-gradient-to-r from-primary-deep/5 to-transparent">
              <div class="flex items-start justify-between">
                <div>
                  <span 
                    class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium mb-2"
                    :class="getStatusColor(subscription.status)"
                  >
                    <span class="w-1.5 h-1.5 rounded-full" :class="subscription.status === 'ACTIVE' ? 'bg-green-500' : 'bg-amber-500'" />
                    {{ subscription.status }}
                  </span>
                  <h3 class="text-lg font-bold text-foundation">{{ subscription.plan.name }}</h3>
                </div>
                <div class="text-right">
                  <p class="text-2xl font-bold text-primary-deep">{{ formatPrice(subscription.totalWeeklyPrice) }}</p>
                  <p class="text-xs text-neutral-400">per delivery</p>
                </div>
              </div>
            </div>

            <!-- Details -->
            <div class="p-6 space-y-4">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center">
                  <Calendar class="text-neutral-500" :size="16" />
                </div>
                <div>
                  <p class="text-sm font-medium text-foundation">Next Delivery</p>
                  <p class="text-xs text-neutral-400">{{ formatDate(subscription.nextDeliveryDate) }}</p>
                </div>
              </div>

              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center">
                  <Truck class="text-neutral-500" :size="16" />
                </div>
                <div>
                  <p class="text-sm font-medium text-foundation">{{ subscription.deliveryDay }} Delivery</p>
                  <p class="text-xs text-neutral-400">{{ subscription.deliveryDay === 'TUESDAY' ? '9:00 AM - 1:00 PM' : '2:00 PM - 6:00 PM' }}</p>
                </div>
              </div>

              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center">
                  <MapPin class="text-neutral-500" :size="16" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-foundation">{{ subscription.address.label }}</p>
                  <p class="text-xs text-neutral-400 truncate">{{ subscription.address.street }}, {{ subscription.address.neighborhood }}</p>
                </div>
              </div>

              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center">
                  <CreditCard class="text-neutral-500" :size="16" />
                </div>
                <div>
                  <p class="text-sm font-medium text-foundation">{{ subscription.paymentMode === 'WEEKLY' ? 'Weekly' : subscription.paymentMode === 'MONTHLY' ? 'Monthly' : 'Per Delivery' }} Payment</p>
                  <p class="text-xs text-neutral-400">Auto-billing enabled</p>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="px-6 pb-6">
              <div class="flex gap-3">
                <button
                  @click="handlePause(subscription)"
                  :disabled="isLoading"
                  class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-neutral-200 text-neutral-600 font-medium hover:bg-neutral-50 transition-colors disabled:opacity-50"
                >
                  <Pause :size="16" />
                  Pause
                </button>
                <NuxtLink
                  :to="`/subscriptions/${subscription.id}`"
                  class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-neutral-100 text-foundation font-medium hover:bg-neutral-200 transition-colors"
                >
                  Details
                  <ChevronRight :size="16" />
                </NuxtLink>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <!-- Paused Subscriptions -->
      <section v-if="pausedSubscriptions.length > 0" class="mb-12">
        <h2 class="text-xl font-bold text-foundation text-balance mb-4 flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-amber-500" />
          Paused Subscriptions
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            v-for="subscription in pausedSubscriptions"
            :key="subscription.id"
            :initial="{ opacity: 0, y: 20 }"
            :animate="{ opacity: 1, y: 0 }"
            class="bg-white dark:bg-zinc-900 rounded-2xl border border-neutral-100 dark:border-zinc-800 shadow-sm overflow-hidden opacity-75"
          >
            <!-- Header -->
            <div class="p-6 border-b border-neutral-100 dark:border-zinc-800">
              <div class="flex items-start justify-between">
                <div>
                  <span 
                    class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium mb-2"
                    :class="getStatusColor(subscription.status)"
                  >
                    <span class="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    {{ subscription.status }}
                  </span>
                  <h3 class="text-lg font-bold text-foundation">{{ subscription.plan.name }}</h3>
                </div>
                <div class="text-right">
                  <p class="text-2xl font-bold text-primary-deep">{{ formatPrice(subscription.totalWeeklyPrice) }}</p>
                  <p class="text-xs text-neutral-400">per delivery</p>
                </div>
              </div>
            </div>

            <!-- Alert -->
            <div class="px-6 py-3 bg-amber-50 dark:bg-amber-900/20 border-y border-amber-100 dark:border-amber-800">
              <div class="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                <AlertCircle :size="16" />
                <span class="text-sm">Subscription is paused. No deliveries scheduled.</span>
              </div>
            </div>

            <!-- Actions -->
            <div class="p-6">
              <div class="flex gap-3">
                <button
                  @click="handleResume(subscription)"
                  :disabled="isLoading"
                  class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary-deep text-white font-medium hover:bg-primary-deep/90 transition-colors disabled:opacity-50"
                >
                  <Play :size="16" />
                  Resume
                </button>
                <button
                  @click="handleCancel(subscription)"
                  :disabled="isLoading"
                  class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-red-200 text-red-600 font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  <X :size="16" />
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <!-- Empty State -->
      <div v-if="subscriptions.length === 0" class="text-center py-16">
        <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-neutral-100 flex items-center justify-center">
          <Package class="text-neutral-300" :size="40" />
        </div>
        <h2 class="text-2xl font-bold text-foundation text-balance mb-2">No subscriptions yet</h2>
        <p class="text-neutral-500 mb-8 max-w-md mx-auto">
          Start your journey to fresher, healthier eating with a weekly delivery of seasonal produce from Kibwezi farms.
        </p>
        <NuxtLink
          to="/subscription"
          class="inline-flex items-center justify-center gap-2 bg-primary-deep text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-primary-deep/20 hover:shadow-xl hover:shadow-primary-deep/30 hover:-translate-y-0.5 transition-all"
        >
          <Sparkles :size="20" />
          Create Your First Subscription
        </NuxtLink>
      </div>

      <!-- Pause Modal -->
      <div v-if="showPauseModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <motion.div
          :initial="{ opacity: 0, scale: 0.95 }"
          :animate="{ opacity: 1, scale: 1 }"
          class="bg-white dark:bg-zinc-900 rounded-2xl p-6 max-w-md w-full shadow-2xl"
        >
          <div class="flex items-center gap-3 mb-4">
            <div class="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
              <Pause class="text-amber-600" :size="24" />
            </div>
            <div>
              <h3 class="text-xl font-bold text-foundation">Pause Subscription?</h3>
              <p class="text-sm text-neutral-400">{{ selectedSubscription?.plan.name }}</p>
            </div>
          </div>
          <p class="text-neutral-500 mb-6">
            You can resume your subscription anytime. No deliveries will be scheduled while paused.
          </p>
          <div class="flex gap-3">
            <button
              @click="showPauseModal = false"
              class="flex-1 py-3 rounded-xl border border-neutral-200 text-neutral-600 font-medium hover:bg-neutral-50 transition-colors"
            >
              Keep Active
            </button>
            <button
              @click="confirmPause"
              :disabled="isLoading"
              class="flex-1 py-3 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-600 transition-colors disabled:opacity-50"
            >
              {{ isLoading ? 'Pausing...' : 'Pause' }}
            </button>
          </div>
        </motion.div>
      </div>

      <!-- Cancel Modal -->
      <div v-if="showCancelModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <motion.div
          :initial="{ opacity: 0, scale: 0.95 }"
          :animate="{ opacity: 1, scale: 1 }"
          class="bg-white dark:bg-zinc-900 rounded-2xl p-6 max-w-md w-full shadow-2xl"
        >
          <div class="flex items-center gap-3 mb-4">
            <div class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <X class="text-red-600" :size="24" />
            </div>
            <div>
              <h3 class="text-xl font-bold text-foundation">Cancel Subscription?</h3>
              <p class="text-sm text-neutral-400">{{ selectedSubscription?.plan.name }}</p>
            </div>
          </div>
          <p class="text-neutral-500 mb-6">
            Are you sure you want to cancel? This action cannot be undone. You can always create a new subscription later.
          </p>
          <div class="flex gap-3">
            <button
              @click="showCancelModal = false"
              class="flex-1 py-3 rounded-xl border border-neutral-200 text-neutral-600 font-medium hover:bg-neutral-50 transition-colors"
            >
              Keep Subscription
            </button>
            <button
              @click="confirmCancel"
              :disabled="isLoading"
              class="flex-1 py-3 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {{ isLoading ? 'Cancelling...' : 'Cancel' }}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  </div>
</template>
