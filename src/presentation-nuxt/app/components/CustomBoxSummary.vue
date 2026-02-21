<script setup lang="ts">
import { computed } from 'vue';
import { Trash2, Info, Truck, Package, ArrowRight, Sparkles, RotateCcw } from 'lucide-vue-next';
import { NuxtLink } from '#components';
import { ProgressRoot, ProgressIndicator } from 'reka-ui';
import { motion } from 'motion-v';
import { useCustomBoxStore } from '../stores/custom-box-store';

const customBoxStore = useCustomBoxStore();

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-KE', { 
    style: 'currency', 
    currency: 'KES',
    minimumFractionDigits: 0
  })
    .format(price)
    .replace('KES', 'KSh');
};

const progressValue = computed(() => {
  return Math.min((customBoxStore.usedSlots / customBoxStore.maxSlots) * 100, 100);
});

const progressStatus = computed(() => {
  const percentage = progressValue.value;
  if (percentage === 0) return { label: 'Start adding produce', color: 'text-neutral-400' };
  if (percentage < 50) return { label: 'Good start!', color: 'text-primary-deep' };
  if (percentage < 90) return { label: 'Almost there!', color: 'text-primary-deep' };
  if (percentage < 100) return { label: 'Just a bit more!', color: 'text-accent-clay' };
  return { label: 'Perfectly filled!', color: 'text-primary-deep font-bold' };
});

const estimatedWeight = computed(() => {
  // Rough estimate: each slot is about 250g
  const weight = customBoxStore.usedSlots * 0.25;
  return weight < 1 ? `${Math.round(weight * 1000)}g` : `${weight.toFixed(1)}kg`;
});
</script>

<template>
  <aside class="flex flex-col gap-4">
    <!-- Main Summary Card -->
    <div class="bg-white dark:bg-zinc-900 rounded-2xl border border-neutral-100 dark:border-zinc-800 shadow-lg shadow-primary-deep/5 overflow-hidden">
      <!-- Header -->
      <div class="p-5 border-b border-neutral-100 dark:border-zinc-800 bg-gradient-to-r from-primary-deep/5 to-transparent">
        <div class="flex items-center gap-2 mb-1">
          <Package class="text-primary-deep" :size="20" />
          <h2 class="text-lg font-bold text-foundation">Your Box</h2>
        </div>
        <p class="text-sm text-neutral-400">
          {{ customBoxStore.size.charAt(0) + customBoxStore.size.slice(1).toLowerCase() }} Box • {{ customBoxStore.maxSlots }} slots
        </p>
      </div>

      <!-- Progress Section -->
      <div class="p-5 border-b border-neutral-100 dark:border-zinc-800">
        <div class="flex justify-between items-center mb-3">
          <span class="text-sm font-medium text-neutral-600">Box Capacity</span>
          <span class="text-sm font-bold" :class="progressStatus.color">
            {{ customBoxStore.usedSlots }} / {{ customBoxStore.maxSlots }} slots
          </span>
        </div>
        
        <!-- Progress Bar -->
        <ProgressRoot
          :model-value="progressValue"
          class="relative w-full h-3 bg-neutral-100 dark:bg-zinc-800 rounded-full overflow-hidden"
        >
          <ProgressIndicator
            class="h-full rounded-full transition-all duration-500 ease-out"
            :class="[
              progressValue.value < 100 
                ? 'bg-primary-deep' 
                : 'bg-gradient-to-r from-primary-deep to-secondary-sage'
            ]"
            :style="{ width: `${progressValue}%` }"
          />
        </ProgressRoot>

        <!-- Status Message -->
        <div class="flex items-center justify-between mt-3">
          <p class="text-xs" :class="progressStatus.color">
            {{ progressStatus.label }}
          </p>
          <p v-if="customBoxStore.usedSlots > 0" class="text-xs text-neutral-400">
            Est. {{ estimatedWeight }}
          </p>
        </div>
      </div>

      <!-- Items List -->
      <div class="p-5 border-b border-neutral-100 dark:border-zinc-800 max-h-[300px] overflow-y-auto custom-scrollbar">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold text-foundation">
            Selected Items ({{ customBoxStore.items.length }})
          </h3>
          <button 
            v-if="customBoxStore.items.length > 0"
            @click="customBoxStore.resetBox()"
            class="text-xs text-neutral-400 hover:text-accent-clay flex items-center gap-1 transition-colors"
          >
            <RotateCcw :size="12" />
            Clear all
          </button>
        </div>
        
        <!-- Empty State -->
        <div v-if="customBoxStore.items.length === 0" class="text-center py-8">
          <div class="w-14 h-14 mx-auto mb-3 rounded-full bg-neutral-50 dark:bg-zinc-800 flex items-center justify-center">
            <Package class="text-neutral-300" :size="24" />
          </div>
          <p class="text-sm text-neutral-400 mb-1">Your box is empty</p>
          <p class="text-xs text-neutral-400/70">Add produce from the left to get started</p>
        </div>
        
        <!-- Items -->
        <motion.ul 
          v-else 
          class="space-y-3"
          layout
        >
          <motion.li 
            v-for="item in customBoxStore.items" 
            :key="item.produceId"
            layout
            :initial="{ opacity: 0, x: -10 }"
            :animate="{ opacity: 1, x: 0 }"
            :exit="{ opacity: 0, x: 10 }"
            class="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-zinc-800/50 group hover:bg-neutral-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-lg bg-white dark:bg-zinc-700 overflow-hidden flex-shrink-0 shadow-sm">
                <NuxtImg :src="(item as any).image" :alt="item.name" class="w-full h-full object-cover" format="webp" sizes="64px" loading="lazy" />
              </div>
              <div class="min-w-0">
                <p class="text-sm font-semibold text-foundation truncate max-w-[140px]">{{ item.name }}</p>
                <p class="text-xs text-neutral-400">
                  {{ item.quantity }} × {{ (item as any).slots || 1 }} {{ (item as any).slots === 1 ? 'slot' : 'slots' }}
                </p>
              </div>
            </div>
            <button 
              @click="customBoxStore.clearItem(item.produceId)"
              class="p-2 text-neutral-300 hover:text-accent-clay hover:bg-accent-clay/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
              title="Remove item"
            >
              <Trash2 :size="16" />
            </button>
          </motion.li>
        </motion.ul>
      </div>

      <!-- Delivery Info -->
      <div class="p-4 bg-neutral-50/50 dark:bg-zinc-800/30 border-b border-neutral-100 dark:border-zinc-800">
        <div class="flex items-start gap-3">
          <div class="w-8 h-8 rounded-lg bg-primary-deep/10 flex items-center justify-center shrink-0">
            <Truck class="text-primary-deep" :size="16" />
          </div>
          <div>
            <p class="text-sm font-medium text-foundation">Free Delivery</p>
            <p class="text-xs text-neutral-400">Every Tuesday & Friday in Nairobi area</p>
          </div>
        </div>
      </div>

      <!-- Total & CTA -->
      <div class="p-5 bg-gradient-to-b from-white to-neutral-50/50 dark:from-zinc-900 dark:to-zinc-900">
        <div class="flex justify-between items-end mb-4">
          <div>
            <span class="text-xs text-neutral-400 uppercase tracking-wide block mb-1">Weekly Total</span>
            <span class="text-3xl font-bold text-foundation tracking-tight">{{ formatPrice(customBoxStore.totalPrice) }}</span>
          </div>
          <div class="text-right">
            <span v-if="customBoxStore.items.length > 0" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-deep/10 text-primary-deep text-xs font-medium">
              <Sparkles :size="12" />
              Fresh guarantee
            </span>
          </div>
        </div>
        
        <NuxtLink
          v-if="customBoxStore.items.length > 0"
          to="/checkout"
          @click="customBoxStore.addBoxToCart"
          class="group w-full bg-primary-deep text-white font-semibold py-4 rounded-xl shadow-lg shadow-primary-deep/20 hover:shadow-xl hover:shadow-primary-deep/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-2 text-center"
        >
          <span>Add Box to Cart</span>
          <ArrowRight :size="18" class="group-hover:translate-x-1 transition-transform" />
        </NuxtLink>
        <button
          v-else
          disabled
          class="w-full bg-primary-deep/50 text-white/50 font-semibold py-4 rounded-xl cursor-not-allowed flex items-center justify-center gap-2"
        >
          <span>Add items to continue</span>
        </button>

        <p class="text-center text-xs text-neutral-400 mt-3">
          Skip, pause, or cancel anytime
        </p>
      </div>
    </div>

    <!-- Help Card -->
    <div class="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-neutral-100 dark:border-zinc-800">
      <div class="flex items-start gap-3">
        <div class="w-8 h-8 rounded-lg bg-primary-deep/10 flex items-center justify-center shrink-0">
          <Info :size="16" class="text-primary-deep" />
        </div>
        <div>
          <p class="text-sm font-medium text-foundation mb-1">How does this work?</p>
          <p class="text-xs text-neutral-400 leading-relaxed">
            Fill your box with fresh produce up to {{ customBoxStore.maxSlots }} slots. 
            Each item takes 1-2 slots. We'll deliver every Tuesday or Friday — you choose!
          </p>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: var(--neutral-200);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: var(--neutral-300);
}
</style>
