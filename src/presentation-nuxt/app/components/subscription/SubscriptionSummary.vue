<script setup lang="ts">
import { computed } from 'vue';
import { motion } from 'motion-v';
import { 
  Package, 
  Calendar, 
  Truck, 
  CreditCard, 
  MapPin, 
  Check,
  Sparkles,
  ArrowRight
} from 'lucide-vue-next';
import { useSubscriptionStore } from '../../stores/subscription-store';

const store = useSubscriptionStore();

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
  }).format(price).replace('KES', 'KSh');
};

const savings = computed(() => {
  return store.pricing.frequencyDiscount + store.pricing.paymentModeDiscount;
});

const hasSavings = computed(() => savings.value > 0);

const emit = defineEmits<{
  (e: 'confirm'): void;
  (e: 'edit', step: number): void;
}>();
</script>

<template>
  <div class="bg-white dark:bg-zinc-900 rounded-2xl border border-neutral-100 dark:border-zinc-800 shadow-lg overflow-hidden">
    <!-- Header -->
    <div class="p-6 border-b border-neutral-100 dark:border-zinc-800 bg-gradient-to-r from-primary-deep/5 to-transparent">
      <h3 class="text-xl font-bold text-foundation">Subscription Summary</h3>
      <p class="text-sm text-neutral-500 mt-1">Review your subscription details</p>
    </div>

    <!-- Details -->
    <div class="p-6 space-y-6">
      <!-- Box Size -->
      <div class="flex items-start gap-4">
        <div class="w-10 h-10 rounded-lg bg-primary-deep/10 flex items-center justify-center shrink-0">
          <Package class="text-primary-deep" :size="20" />
        </div>
        <div class="flex-1">
          <div class="flex items-center justify-between">
            <p class="text-sm font-medium text-foundation">{{ store.boxConfig.name }}</p>
            <button 
              @click="emit('edit', 2)"
              class="text-xs text-primary-deep hover:underline"
            >
              Edit
            </button>
          </div>
          <p class="text-xs text-neutral-400">{{ store.boxConfig.slots }} slots • {{ store.boxConfig.weightEstimate }}</p>
        </div>
      </div>

      <!-- Frequency -->
      <div class="flex items-start gap-4">
        <div class="w-10 h-10 rounded-lg bg-primary-deep/10 flex items-center justify-center shrink-0">
          <Calendar class="text-primary-deep" :size="20" />
        </div>
        <div class="flex-1">
          <div class="flex items-center justify-between">
            <p class="text-sm font-medium text-foundation">{{ store.frequencyConfig.label }} Delivery</p>
            <button 
              @click="emit('edit', 1)"
              class="text-xs text-primary-deep hover:underline"
            >
              Edit
            </button>
          </div>
          <p class="text-xs text-neutral-400">{{ store.frequencyConfig.description }}</p>
        </div>
      </div>

      <!-- Delivery Day -->
      <div class="flex items-start gap-4">
        <div class="w-10 h-10 rounded-lg bg-primary-deep/10 flex items-center justify-center shrink-0">
          <Truck class="text-primary-deep" :size="20" />
        </div>
        <div class="flex-1">
          <div class="flex items-center justify-between">
            <p class="text-sm font-medium text-foundation">{{ store.deliveryDayConfig.label }}s</p>
            <button 
              @click="emit('edit', 3)"
              class="text-xs text-primary-deep hover:underline"
            >
              Edit
            </button>
          </div>
          <p class="text-xs text-neutral-400">{{ store.deliveryDayConfig.timeRange }}</p>
        </div>
      </div>

      <!-- Payment Mode -->
      <div class="flex items-start gap-4">
        <div class="w-10 h-10 rounded-lg bg-primary-deep/10 flex items-center justify-center shrink-0">
          <CreditCard class="text-primary-deep" :size="20" />
        </div>
        <div class="flex-1">
          <div class="flex items-center justify-between">
            <p class="text-sm font-medium text-foundation">{{ store.paymentModeConfig.label }}</p>
            <button 
              @click="emit('edit', 4)"
              class="text-xs text-primary-deep hover:underline"
            >
              Edit
            </button>
          </div>
          <p class="text-xs text-neutral-400">{{ store.paymentModeConfig.description }}</p>
        </div>
      </div>

      <!-- Address -->
      <div v-if="store.selectedAddress" class="flex items-start gap-4">
        <div class="w-10 h-10 rounded-lg bg-primary-deep/10 flex items-center justify-center shrink-0">
          <MapPin class="text-primary-deep" :size="20" />
        </div>
        <div class="flex-1">
          <div class="flex items-center justify-between">
            <p class="text-sm font-medium text-foundation">{{ store.selectedAddress.label }}</p>
            <button 
              @click="emit('edit', 5)"
              class="text-xs text-primary-deep hover:underline"
            >
              Edit
            </button>
          </div>
          <p class="text-xs text-neutral-400">
            {{ store.selectedAddress.street }}, {{ store.selectedAddress.neighborhood }}
          </p>
        </div>
      </div>
    </div>

    <!-- Pricing -->
    <div class="p-6 bg-neutral-50 dark:bg-zinc-800/50 border-t border-neutral-100 dark:border-zinc-800">
      <div class="space-y-3">
        <div class="flex justify-between items-center text-sm">
          <span class="text-neutral-500">Base price</span>
          <span class="font-medium text-foundation">{{ formatPrice(store.pricing.basePrice) }}</span>
        </div>
        
        <div v-if="store.pricing.frequencyDiscount > 0" class="flex justify-between items-center text-sm">
          <span class="text-neutral-500">Frequency discount</span>
          <span class="font-medium text-secondary-sage">-{{ formatPrice(store.pricing.frequencyDiscount) }}</span>
        </div>
        
        <div v-if="store.pricing.paymentModeDiscount > 0" class="flex justify-between items-center text-sm">
          <span class="text-neutral-500">Payment mode discount</span>
          <span class="font-medium text-secondary-sage">-{{ formatPrice(store.pricing.paymentModeDiscount) }}</span>
        </div>
        
        <div class="pt-3 border-t border-neutral-200 dark:border-zinc-700">
          <div class="flex justify-between items-center">
            <span class="font-bold text-foundation">Per delivery</span>
            <span class="text-2xl font-bold text-primary-deep">{{ formatPrice(store.pricing.finalPrice) }}</span>
          </div>
        </div>
      </div>

      <!-- Confirm Button -->
      <motion.button
        v-if="store.selectedAddress"
        @click="emit('confirm')"
        :disabled="store.isLoading"
        class="w-full mt-6 bg-primary-deep text-white font-bold py-4 rounded-xl shadow-lg shadow-primary-deep/20 hover:shadow-xl hover:shadow-primary-deep/30 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        :while-hover="{ scale: 1.02 }"
        :while-press="{ scale: 0.98 }"
      >
        <span v-if="store.isLoading">Creating subscription...</span>
        <span v-else>Start Subscription</span>
        <ArrowRight v-if="!store.isLoading" :size="18" />
      </motion.button>

      <!-- Address Required Message -->
      <div v-else class="mt-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-center">
        <p class="text-sm text-amber-800 dark:text-amber-200">
          Please select a delivery address to continue
        </p>
      </div>

      <!-- Savings Badge -->
      <div v-if="hasSavings" class="mt-4 flex items-center justify-center gap-2 text-sm text-secondary-sage">
        <Sparkles :size="16" />
        <span>You're saving {{ formatPrice(savings) }} per delivery!</span>
      </div>
    </div>
  </div>
</template>
