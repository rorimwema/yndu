<script setup lang="ts">
import { computed } from 'vue';
import { RadioGroupRoot, RadioGroupItem } from 'reka-ui';
import { Check, Wallet, CalendarCheck, CreditCard } from 'lucide-vue-next';
import { motion } from 'motion-v';
import { useSubscriptionStore } from '../../stores/subscription-store';
import { PAYMENT_MODE_CONFIG, type PaymentMode } from '../../types/subscription';

const store = useSubscriptionStore();

const paymentModes = computed(() => [
  {
    value: 'WEEKLY' as PaymentMode,
    ...PAYMENT_MODE_CONFIG.WEEKLY,
    icon: Wallet,
  },
  {
    value: 'MONTHLY' as PaymentMode,
    ...PAYMENT_MODE_CONFIG.MONTHLY,
    icon: CalendarCheck,
  },
  {
    value: 'PER_DELIVERY' as PaymentMode,
    ...PAYMENT_MODE_CONFIG.PER_DELIVERY,
    icon: CreditCard,
  },
]);

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
  }).format(price).replace('KES', 'KSh');
};
</script>

<template>
  <div>
    <h3 class="text-xl font-bold text-foundation mb-2">Payment Mode</h3>
    <p class="text-sm text-neutral-500 mb-6">Choose how you'd like to pay for your subscription</p>

    <RadioGroupRoot
      v-model="store.paymentMode"
      class="grid grid-cols-1 sm:grid-cols-3 gap-4"
    >
      <motion.div
        v-for="(mode, index) in paymentModes"
        :key="mode.value"
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.3, delay: index * 0.1 }"
      >
        <RadioGroupItem
          :value="mode.value"
          as-child
        >
          <div
            class="group relative w-full p-5 rounded-2xl border-2 transition-all duration-300 outline-none focus:ring-4 focus:ring-primary-deep/20 text-left cursor-pointer bg-white dark:bg-zinc-900 border-neutral-100 dark:border-zinc-800 hover:border-primary-deep/30 hover:shadow-lg data-[state=checked]:border-primary-deep data-[state=checked]:shadow-xl data-[state=checked]:shadow-primary-deep/10"
          >
          <!-- Check Indicator -->
          <div class="absolute top-4 right-4 opacity-0 group-data-[state=checked]:opacity-100 transition-all duration-300 bg-primary-deep text-white rounded-full p-1">
            <Check :size="16" stroke-width="3" />
          </div>

          <!-- Icon -->
          <div 
            class="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors duration-300 bg-neutral-100 text-neutral-500 group-data-[state=checked]:bg-primary-deep group-data-[state=checked]:text-white"
          >
            <component :is="mode.icon" :size="24" />
          </div>

          <!-- Content -->
          <h4 class="font-bold text-lg text-foundation mb-1">{{ mode.label }}</h4>
          <p class="text-sm text-neutral-500 mb-3">{{ mode.description }}</p>

          <!-- Discount Badge -->
          <div v-if="mode.discount > 0" class="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary-deep/10 text-primary-deep text-xs font-bold">
            Save {{ mode.discount }}%
          </div>
          <div v-else class="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-neutral-100 text-neutral-400 text-xs font-medium">
            Flexible
          </div>
        </div>
      </RadioGroupItem>
      </motion.div>
    </RadioGroupRoot>

    <!-- Price Preview -->
    <div class="mt-6 p-5 rounded-xl bg-foundation text-white">
      <div class="flex items-center justify-between mb-3">
        <span class="text-sm text-white/70">Price per delivery</span>
        <span class="text-xl font-bold">{{ formatPrice(store.pricing.finalPrice) }}</span>
      </div>
      <div class="flex items-center justify-between pt-3 border-t border-white/10">
        <span class="text-sm text-white/70">Estimated monthly cost</span>
        <span class="text-2xl font-bold text-primary-deep">{{ formatPrice(store.monthlyEstimate) }}</span>
      </div>
      <p class="text-xs text-white/50 mt-3">
        *Monthly estimate based on 4 deliveries per month. Actual cost may vary based on your frequency selection.
      </p>
    </div>
  </div>
</template>
