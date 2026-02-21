<script setup lang="ts">
import { motion } from 'motion-v';
import { MapPin, Calendar, CreditCard, Package, ArrowLeft, ShieldCheck, Loader2, CheckCircle2, Edit2 } from 'lucide-vue-next';
import { useCheckoutStore } from '../stores/checkout-store';
import { useCartStore } from '../stores/cart-store';

const checkoutStore = useCheckoutStore();
const cartStore = useCartStore();

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-KE', { 
    style: 'currency', 
    currency: 'KES',
    minimumFractionDigits: 0
  }).format(price).replace('KES', 'KSh');
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-KE', { 
    weekday: 'long',
    month: 'long', 
    day: 'numeric',
  });
};

const getPaymentIcon = (type: string) => {
  switch (type) {
    case 'mpesa': return 'M-Pesa';
    case 'card': return 'Card';
    case 'cash': return 'Cash';
    default: return type;
  }
};

const handlePlaceOrder = async () => {
  const success = await checkoutStore.submitOrder();
  if (success) {
    // Order complete - success component will show
  }
};

const handleBack = () => {
  checkoutStore.setStep(3);
};

const isBoxItem = (item: any) => {
  return item.type === 'box' && Array.isArray(item.contents);
};
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h2 class="text-xl font-bold text-foundation mb-2">Review Your Order</h2>
      <p class="text-sm text-neutral-500">Please confirm your order details before placing</p>
    </div>

    <!-- Order Summary Card -->
    <div class="bg-white dark:bg-zinc-900 rounded-xl border border-neutral-100 dark:border-zinc-800 overflow-hidden">
      <!-- Delivery Address -->
      <div class="p-5 border-b border-neutral-100 dark:border-zinc-800">
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center gap-2">
            <MapPin class="text-primary-deep" :size="18" />
            <span class="font-semibold text-foundation">Delivery Address</span>
          </div>
          <button 
            @click="checkoutStore.setStep(1)"
            class="text-xs text-primary-deep hover:underline flex items-center gap-1"
          >
            <Edit2 :size="12" />
            Edit
          </button>
        </div>
        <div class="pl-6">
          <p class="font-medium text-foundation">{{ checkoutStore.selectedAddress?.label }}</p>
          <p class="text-sm text-neutral-500">{{ checkoutStore.selectedAddress?.street }}</p>
          <p v-if="checkoutStore.selectedAddress?.apartment" class="text-sm text-neutral-500">
            {{ checkoutStore.selectedAddress?.apartment }}
          </p>
          <p class="text-sm text-neutral-500">
            {{ checkoutStore.selectedAddress?.neighborhood }}, {{ checkoutStore.selectedAddress?.city }}
          </p>
          <p v-if="checkoutStore.selectedAddress?.instructions" class="text-sm text-neutral-400 mt-1 italic">
            "{{ checkoutStore.selectedAddress?.instructions }}"
          </p>
        </div>
      </div>

      <!-- Delivery Slot -->
      <div class="p-5 border-b border-neutral-100 dark:border-zinc-800">
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center gap-2">
            <Calendar class="text-primary-deep" :size="18" />
            <span class="font-semibold text-foundation">Delivery Date</span>
          </div>
          <button 
            @click="checkoutStore.setStep(2)"
            class="text-xs text-primary-deep hover:underline flex items-center gap-1"
          >
            <Edit2 :size="12" />
            Edit
          </button>
        </div>
        <div class="pl-6">
          <p class="font-medium text-foundation">{{ formatDate(checkoutStore.selectedSlot?.date || '') }}</p>
          <p class="text-sm text-neutral-500">{{ checkoutStore.selectedSlot?.timeRange }}</p>
          <p v-if="checkoutStore.specialInstructions" class="text-sm text-neutral-400 mt-1 italic">
            "{{ checkoutStore.specialInstructions }}"
          </p>
        </div>
      </div>

      <!-- Payment Method -->
      <div class="p-5 border-b border-neutral-100 dark:border-zinc-800">
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center gap-2">
            <CreditCard class="text-primary-deep" :size="18" />
            <span class="font-semibold text-foundation">Payment Method</span>
          </div>
          <button 
            @click="checkoutStore.setStep(3)"
            class="text-xs text-primary-deep hover:underline flex items-center gap-1"
          >
            <Edit2 :size="12" />
            Edit
          </button>
        </div>
        <div class="pl-6">
          <p class="font-medium text-foundation">{{ checkoutStore.selectedPayment?.label }}</p>
          <p v-if="checkoutStore.selectedPayment?.type === 'mpesa' && checkoutStore.phoneNumber" class="text-sm text-neutral-500">
            +254 {{ checkoutStore.phoneNumber }}
          </p>
        </div>
      </div>

      <!-- Order Items -->
      <div class="p-5">
        <div class="flex items-center gap-2 mb-4">
          <Package class="text-primary-deep" :size="18" />
          <span class="font-semibold text-foundation">Order Items ({{ cartStore.uniqueItemCount }})</span>
        </div>
        
        <div class="space-y-3 pl-6">
          <div 
            v-for="item in cartStore.items" 
            :key="item.id"
            class="flex items-center gap-4 p-3 rounded-lg bg-neutral-50 dark:bg-zinc-800/50"
          >
            <div class="w-14 h-14 rounded-lg bg-white dark:bg-zinc-700 overflow-hidden flex-shrink-0">
              <NuxtImg :src="item.image" :alt="item.name" class="w-full h-full object-cover" format="webp" sizes="64px" loading="lazy" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-medium text-foundation truncate">{{ item.name }}</p>
              <p class="text-sm text-neutral-400">
                <span v-if="isBoxItem(item)">
                  {{ item.contents?.length || 0 }} items
                </span>
                <span v-else>
                  {{ item.quantity }} × {{ item.unit }}
                </span>
              </p>
            </div>
            <p class="font-semibold text-foundation">{{ formatPrice(item.price * item.quantity) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Price Breakdown -->
    <div class="bg-white dark:bg-zinc-900 rounded-xl border border-neutral-100 dark:border-zinc-800 p-5">
      <div class="space-y-3">
        <div class="flex justify-between text-sm">
          <span class="text-neutral-500">Subtotal</span>
          <span class="font-medium text-foundation">{{ formatPrice(cartStore.cartTotals.subtotal) }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-neutral-500">Delivery</span>
          <span class="font-medium" :class="cartStore.cartTotals.delivery === 0 ? 'text-primary-deep' : 'text-foundation'">
            {{ cartStore.cartTotals.delivery === 0 ? 'Free' : formatPrice(cartStore.cartTotals.delivery) }}
          </span>
        </div>
        <div class="border-t border-neutral-100 dark:border-zinc-800 pt-3 flex justify-between">
          <span class="font-semibold text-foundation">Total</span>
          <span class="text-xl font-bold text-primary-deep">{{ formatPrice(cartStore.cartTotals.total) }}</span>
        </div>
      </div>
    </div>

    <!-- Security Badge -->
    <div class="flex items-center justify-center gap-2 p-4 rounded-xl bg-neutral-50 dark:bg-zinc-800/50 border border-neutral-100 dark:border-zinc-800">
      <ShieldCheck class="text-primary-deep" :size="20" />
      <span class="text-sm text-neutral-500">Your order is protected and secure</span>
    </div>

    <!-- Error Message -->
    <div v-if="checkoutStore.error" class="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
      {{ checkoutStore.error }}
    </div>

    <!-- Navigation Buttons -->
    <div class="flex gap-3 pt-4">
      <button
        @click="handleBack"
        :disabled="checkoutStore.isLoading"
        class="px-6 py-4 rounded-xl border-2 border-neutral-200 dark:border-zinc-700 text-neutral-600 font-semibold hover:border-primary-deep hover:text-primary-deep transition-colors flex items-center gap-2 disabled:opacity-50"
      >
        <ArrowLeft :size="18" />
        <span>Back</span>
      </button>
      
      <motion.button
        @click="handlePlaceOrder"
        :disabled="checkoutStore.isLoading || !checkoutStore.canCompleteOrder"
        class="flex-1 bg-primary-deep text-white font-semibold py-4 rounded-xl shadow-lg shadow-primary-deep/20 hover:shadow-xl hover:shadow-primary-deep/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        :while-hover="{ y: -2 }"
        :while-tap="{ scale: 0.98 }"
      >
        <Loader2 v-if="checkoutStore.isLoading" class="animate-spin" :size="20" />
        <CheckCircle2 v-else :size="20" />
        <span>{{ checkoutStore.isLoading ? 'Placing Order...' : 'Place Order' }}</span>
      </motion.button>
    </div>

    <!-- Terms Note -->
    <p class="text-center text-xs text-neutral-400">
      By placing this order, you agree to our Terms of Service and Privacy Policy
    </p>
  </div>
</template>
