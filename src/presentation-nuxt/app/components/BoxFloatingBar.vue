<script setup lang="ts">
import { computed } from 'vue';
import { motion } from 'motion-v';
import { ShoppingCart, ArrowRight, Package } from 'lucide-vue-next';
import { useCustomBoxStore } from '../stores/custom-box-store';

const store = useCustomBoxStore();

const progress = computed(() => Math.min((store.usedSlots / store.maxSlots) * 100, 100));
const formatPrice = (p: number) => `KSh ${p.toLocaleString()}`;

const checkout = () => {
  if (store.items.length === 0) return;
  store.addBoxToCart();
  navigateTo('/checkout');
};
</script>

<template>
  <motion.div
    :initial="{ y: 100, opacity: 0 }"
    :animate="{ y: 0, opacity: 1 }"
    :transition="{ type: 'spring', stiffness: 300, damping: 30 }"
    class="fixed bottom-0 left-0 right-0 z-40"
  >
    <!-- Progress bar -->
    <div class="h-1 bg-neutral-100 dark:bg-zinc-800">
      <motion.div 
        class="h-full bg-gradient-to-r from-primary-deep to-secondary-sage"
        :animate="{ width: `${progress}%` }"
        :transition="{ duration: 0.4, ease: 'easeOut' }"
      />
    </div>

    <!-- Bar content -->
    <div class="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-neutral-100 dark:border-zinc-800 px-4 py-3 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
      <div class="max-w-5xl mx-auto flex items-center justify-between gap-4">
        <!-- Left: Progress info -->
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-primary-deep/10 flex items-center justify-center">
            <Package class="text-primary-deep" :size="18" />
          </div>
          <div>
            <p class="text-sm font-semibold text-foundation">
              {{ store.usedSlots }} / {{ store.maxSlots }} slots
            </p>
            <p class="text-xs text-neutral-400">
              {{ store.items.length }} {{ store.items.length === 1 ? 'item' : 'items' }} in box
            </p>
          </div>
        </div>

        <!-- Right: Price & CTA -->
        <div class="flex items-center gap-4">
          <div class="text-right">
            <p class="text-lg font-bold text-foundation">{{ formatPrice(store.totalPrice) }}</p>
            <p class="text-[10px] text-neutral-400 uppercase tracking-wide">/week</p>
          </div>
          
          <motion.button
            @click="checkout"
            :disabled="store.items.length === 0"
            :whileHover="{ scale: store.items.length > 0 ? 1.02 : 1 }"
            :whileTap="{ scale: store.items.length > 0 ? 0.98 : 1 }"
            class="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all"
            :class="store.items.length > 0 
              ? 'bg-primary-deep text-white shadow-lg shadow-primary-deep/25 hover:shadow-xl' 
              : 'bg-neutral-100 dark:bg-zinc-800 text-neutral-400 cursor-not-allowed'"
          >
            <ShoppingCart :size="16" />
            <span class="hidden sm:inline">Add to Cart</span>
            <ArrowRight :size="16" class="sm:hidden" />
          </motion.button>
        </div>
      </div>
    </div>
  </motion.div>
</template>

<style scoped>
.pb-safe {
  padding-bottom: calc(0.75rem + env(safe-area-inset-bottom, 0px));
}
</style>
