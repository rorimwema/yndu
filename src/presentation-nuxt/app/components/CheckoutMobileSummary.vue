<script setup lang="ts">
import { ref } from 'vue';
import { motion, AnimatePresence } from 'motion-v';
import { ChevronUp, ChevronDown, Package } from 'lucide-vue-next';
import { useCartStore } from '../stores/cart-store';

const cartStore = useCartStore();
const isExpanded = ref(false);

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

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;
};
</script>

<template>
  <div class="fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-neutral-200 dark:border-zinc-800 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] z-40" style="padding-bottom: env(safe-area-inset-bottom, 0px)">
    <!-- Collapsed Bar -->
    <button
      @click="toggleExpand"
      class="w-full px-4 py-3 flex items-center justify-between"
    >
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-primary-deep/10 flex items-center justify-center">
          <Package class="text-primary-deep" :size="20" />
        </div>
        <div class="text-left">
          <p class="text-sm font-semibold text-foundation">{{ cartStore.itemCount }} items</p>
          <p class="text-xs text-neutral-400">Tap to review</p>
        </div>
      </div>
      
      <div class="flex items-center gap-3">
        <div class="text-right">
          <p class="text-lg font-bold text-foundation">{{ formatPrice(cartStore.cartTotals.total) }}</p>
          <p class="text-[10px] text-neutral-400">Including delivery</p>
        </div>
        <component :is="isExpanded ? ChevronDown : ChevronUp" class="text-neutral-400" :size="20" />
      </div>
    </button>

    <!-- Expanded Sheet -->
    <AnimatePresence>
      <motion.div
        v-if="isExpanded"
        :initial="{ height: 0 }"
        :animate="{ height: 'auto' }"
        :exit="{ height: 0 }"
        class="overflow-hidden border-t border-neutral-100 dark:border-zinc-800"
      >
        <div class="p-4 max-h-[60vh] overflow-y-auto">
          <!-- Items -->
          <div class="space-y-3 mb-4">
            <div 
              v-for="item in cartStore.items" 
              :key="item.id"
              class="flex items-center gap-3 p-3 rounded-lg bg-neutral-50 dark:bg-zinc-800/50"
            >
              <div class="w-12 h-12 rounded-lg bg-white dark:bg-zinc-700 overflow-hidden flex-shrink-0">
                <NuxtImg :src="item.image" :alt="item.name" class="w-full h-full object-cover" format="webp" sizes="48px" loading="lazy" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-foundation truncate">{{ item.name }}</p>
                <p class="text-xs text-neutral-400">
                  <span v-if="isBoxItem(item)">Custom Box</span>
                  <span v-else>{{ item.quantity }} × {{ item.unit }}</span>
                </p>
              </div>
              <p class="text-sm font-semibold text-foundation">{{ formatPrice(item.price * item.quantity) }}</p>
            </div>
          </div>

          <!-- Totals -->
          <div class="border-t border-neutral-100 dark:border-zinc-800 pt-4 space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-neutral-500">Subtotal</span>
              <span class="text-foundation">{{ formatPrice(cartStore.cartTotals.subtotal) }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-neutral-500">Delivery</span>
              <span :class="cartStore.cartTotals.delivery === 0 ? 'text-primary-deep' : 'text-foundation'">
                {{ cartStore.cartTotals.delivery === 0 ? 'Free' : formatPrice(cartStore.cartTotals.delivery) }}
              </span>
            </div>
            <div class="flex justify-between pt-2 border-t border-neutral-100 dark:border-zinc-800">
              <span class="font-semibold text-foundation">Total</span>
              <span class="text-xl font-bold text-primary-deep">{{ formatPrice(cartStore.cartTotals.total) }}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  </div>
</template>
