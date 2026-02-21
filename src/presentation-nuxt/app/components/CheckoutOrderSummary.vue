<script setup lang="ts">
import { useCartStore } from '../stores/cart-store';

const cartStore = useCartStore();

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-KE', { 
    style: 'currency', 
    currency: 'KES',
    minimumFractionDigits: 0
  }).format(price).replace('KES', 'KSh');
};

const isBoxItem = (item: any) => {
  return item.type === 'box' && Array.isArray(item.contents);
};
</script>

<template>
  <div class="bg-white dark:bg-zinc-900 rounded-2xl border border-neutral-100 dark:border-zinc-800 shadow-lg shadow-primary-deep/5 overflow-hidden">
    <!-- Header -->
    <div class="p-5 border-b border-neutral-100 dark:border-zinc-800 bg-gradient-to-r from-primary-deep/5 to-transparent">
      <h2 class="font-bold text-foundation">Order Summary</h2>
      <p class="text-sm text-neutral-400">{{ cartStore.itemCount }} items</p>
    </div>

    <!-- Items List -->
    <div class="p-5 border-b border-neutral-100 dark:border-zinc-800 max-h-[300px] overflow-y-auto custom-scrollbar">
      <div class="space-y-4">
        <div 
          v-for="item in cartStore.items" 
          :key="item.id"
          class="flex items-center gap-3"
        >
          <div class="w-12 h-12 rounded-lg bg-neutral-100 dark:bg-zinc-800 overflow-hidden flex-shrink-0">
            <NuxtImg :src="item.image" :alt="item.name" class="w-full h-full object-cover" format="webp" sizes="64px" loading="lazy" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-foundation truncate">{{ item.name }}</p>
            <p class="text-xs text-neutral-400">
              <span v-if="isBoxItem(item)">
                Custom Box
              </span>
              <span v-else>
                {{ item.quantity }} × {{ item.unit }}
              </span>
            </p>
          </div>
          <p class="text-sm font-semibold text-foundation">{{ formatPrice(item.price * item.quantity) }}</p>
        </div>
      </div>
    </div>

    <!-- Totals -->
    <div class="p-5 bg-gradient-to-b from-white to-neutral-50/50 dark:from-zinc-900 dark:to-zinc-900">
      <div class="space-y-2 mb-4">
        <div class="flex justify-between text-sm">
          <span class="text-neutral-500">Subtotal</span>
          <span class="text-foundation">{{ formatPrice(cartStore.cartTotals.subtotal) }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-neutral-500">Delivery</span>
          <span :class="cartStore.cartTotals.delivery === 0 ? 'text-primary-deep font-medium' : 'text-foundation'">
            {{ cartStore.cartTotals.delivery === 0 ? 'Free' : formatPrice(cartStore.cartTotals.delivery) }}
          </span>
        </div>
      </div>
      
      <div class="border-t border-neutral-100 dark:border-zinc-800 pt-4 flex justify-between items-end">
        <div>
          <span class="text-xs text-neutral-400 uppercase tracking-wide block mb-1">Total</span>
          <span class="text-2xl font-bold text-foundation">{{ formatPrice(cartStore.cartTotals.total) }}</span>
        </div>
        <span class="text-xs text-neutral-400">/week</span>
      </div>
    </div>
  </div>
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
