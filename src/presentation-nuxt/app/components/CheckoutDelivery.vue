<script setup lang="ts">
import { motion } from 'motion-v';
import { Calendar, Clock, Truck, ArrowLeft, ArrowRight, Check, Info } from 'lucide-vue-next';
import { useCheckoutStore } from '../stores/checkout-store';

const checkoutStore = useCheckoutStore();

const handleContinue = () => {
  if (checkoutStore.selectedSlot) {
    checkoutStore.setStep(3);
  }
};

const handleBack = () => {
  checkoutStore.setStep(1);
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-KE', { 
    month: 'short', 
    day: 'numeric',
  });
};
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h2 class="text-xl font-bold text-foundation mb-2">Choose Delivery Date</h2>
      <p class="text-sm text-neutral-500">We deliver every Tuesday and Friday</p>
    </div>

    <!-- Info Banner -->
    <div class="bg-primary-deep/5 border border-primary-deep/20 rounded-xl p-4 flex gap-3">
      <Info class="text-primary-deep shrink-0" :size="20" />
      <div>
        <p class="text-sm font-medium text-foundation">Free Delivery</p>
        <p class="text-xs text-neutral-500">Delivery is free for all orders. We currently serve Nairobi and surrounding areas.</p>
      </div>
    </div>

    <!-- Delivery Slots Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <motion.div
        v-for="slot in checkoutStore.availableSlots"
        :key="slot.date"
        :while-hover="{ scale: 1.02 }"
        :while-tap="{ scale: 0.98 }"
        @click="checkoutStore.selectSlot(slot)"
        class="relative p-5 rounded-xl border-2 cursor-pointer transition-all duration-200"
        :class="[
          checkoutStore.selectedSlot?.date === slot.date
            ? 'border-primary-deep bg-primary-deep/5'
            : 'border-neutral-100 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-primary-deep/30'
        ]"
      >
        <!-- Selection Indicator -->
        <div 
          v-if="checkoutStore.selectedSlot?.date === slot.date"
          class="absolute top-4 right-4 w-6 h-6 rounded-full bg-primary-deep text-white flex items-center justify-center"
        >
          <Check :size="14" stroke-width="3" />
        </div>

        <div class="flex items-start gap-4">
          <div 
            class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            :class="checkoutStore.selectedSlot?.date === slot.date ? 'bg-primary-deep text-white' : 'bg-neutral-100 dark:bg-zinc-800 text-neutral-500'"
          >
            <Calendar :size="24" />
          </div>
          
          <div>
            <p class="font-semibold text-foundation text-lg">{{ slot.dayOfWeek }}</p>
            <p class="text-sm text-primary-deep font-medium">{{ formatDate(slot.date) }}</p>
            
            <div class="flex items-center gap-1.5 mt-2 text-sm text-neutral-500">
              <Clock :size="14" />
              <span>{{ slot.timeRange }}</span>
            </div>
            
            <div class="flex items-center gap-1.5 mt-1 text-xs text-neutral-400">
              <Truck :size="12" />
              <span>Free delivery</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>

    <!-- Special Instructions -->
    <div class="bg-white dark:bg-zinc-900 rounded-xl border border-neutral-100 dark:border-zinc-800 p-5">
      <label class="block text-sm font-medium text-neutral-600 mb-2">
        Special Delivery Instructions (Optional)
      </label>
      <textarea
        v-model="checkoutStore.specialInstructions"
        rows="3"
        placeholder="Any special instructions for the delivery? e.g., 'Call when you arrive', 'Leave with security'"
        class="w-full px-4 py-3 rounded-lg border border-neutral-200 dark:border-zinc-700 bg-neutral-50 dark:bg-zinc-800 text-foundation focus:ring-2 focus:ring-primary-deep/20 focus:border-primary-deep outline-none transition-all resize-none"
      />
    </div>

    <!-- Navigation Buttons -->
    <div class="flex gap-3 pt-4">
      <button
        @click="handleBack"
        class="px-6 py-4 rounded-xl border-2 border-neutral-200 dark:border-zinc-700 text-neutral-600 font-semibold hover:border-primary-deep hover:text-primary-deep transition-colors flex items-center gap-2"
      >
        <ArrowLeft :size="18" />
        <span>Back</span>
      </button>
      
      <button
        @click="handleContinue"
        :disabled="!checkoutStore.selectedSlot"
        class="flex-1 bg-primary-deep text-white font-semibold py-4 rounded-xl shadow-lg shadow-primary-deep/20 hover:shadow-xl hover:shadow-primary-deep/30 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
      >
        <span>Continue to Payment</span>
        <ArrowRight :size="18" />
      </button>
    </div>
  </div>
</template>
