<script setup lang="ts">
import { ref } from 'vue';
import { motion, AnimatePresence } from 'motion-v';
import { ShoppingCart, X, ArrowRight, Trash2, RotateCcw, Package } from 'lucide-vue-next';
import { useCustomBoxStore } from '../stores/custom-box-store';

const customBoxStore = useCustomBoxStore();
const isExpanded = ref(false);

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-KE', { 
    style: 'currency', 
    currency: 'KES',
    minimumFractionDigits: 0
  })
    .format(price)
    .replace('KES', 'KSh');
};

const progressPercentage = () => {
  return Math.min((customBoxStore.usedSlots / customBoxStore.maxSlots) * 100, 100);
};

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;
};

const handleAddToCart = () => {
  customBoxStore.addBoxToCart();
  isExpanded.value = false;
  navigateTo('/checkout');
};
</script>

<template>
  <div class="lg:hidden">
    <!-- Collapsed Bar -->
    <motion.div 
      v-if="!isExpanded"
      class="fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-neutral-200 dark:border-zinc-800 px-4 py-3 pb-safe z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]"
      :initial="{ y: 100 }"
      :animate="{ y: 0 }"
      :transition="{ duration: 0.3 }"
    >
      <div class="flex items-center justify-between">
        <!-- Progress Info -->
        <button 
          @click="toggleExpand"
          class="flex items-center gap-3 flex-1"
        >
          <div class="relative w-12 h-12">
            <!-- Circular Progress -->
            <svg class="w-12 h-12 transform -rotate-90">
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="currentColor"
                stroke-width="4"
                fill="none"
                class="text-neutral-100 dark:text-zinc-800"
              />
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="currentColor"
                stroke-width="4"
                fill="none"
                stroke-linecap="round"
                :stroke-dasharray="125.6"
                :stroke-dashoffset="125.6 - (125.6 * progressPercentage()) / 100"
                class="text-primary-deep transition-all duration-500"
              />
            </svg>
            <!-- Icon -->
            <div class="absolute inset-0 flex items-center justify-center">
              <Package class="text-primary-deep" :size="18" />
            </div>
          </div>
          
          <div class="text-left">
            <p class="text-sm font-bold text-foundation">
              {{ customBoxStore.usedSlots }} / {{ customBoxStore.maxSlots }} slots
            </p>
            <p class="text-xs text-neutral-400">
              {{ customBoxStore.items.length }} items • Tap to review
            </p>
          </div>
        </button>
        
        <!-- Price & CTA -->
        <div class="flex items-center gap-3">
          <div class="text-right">
            <p class="text-lg font-bold text-foundation">{{ formatPrice(customBoxStore.totalPrice) }}</p>
            <p class="text-[10px] text-neutral-400 uppercase tracking-wide">/week</p>
          </div>
          <button 
            @click="customBoxStore.items.length > 0 ? handleAddToCart() : toggleExpand()"
            class="bg-primary-deep text-white px-5 py-3 rounded-xl font-semibold text-sm shadow-lg shadow-primary-deep/20 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="customBoxStore.items.length === 0"
          >
            <ShoppingCart :size="18" />
          </button>
        </div>
      </div>
    </motion.div>

    <!-- Expanded Sheet -->
    <AnimatePresence>
      <motion.div 
        v-if="isExpanded"
        class="fixed inset-0 z-50"
        :initial="{ opacity: 0 }"
        :animate="{ opacity: 1 }"
        :exit="{ opacity: 0 }"
      >
        <!-- Backdrop -->
        <div 
          class="absolute inset-0 bg-black/50 backdrop-blur-sm"
          @click="toggleExpand"
        />
        
        <!-- Sheet Content -->
        <motion.div 
          class="absolute bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 rounded-t-3xl shadow-2xl max-h-[80vh] overflow-hidden flex flex-col"
          :initial="{ y: '100%' }"
          :animate="{ y: 0 }"
          :exit="{ y: '100%' }"
          :transition="{ type: 'spring', damping: 25, stiffness: 300 }"
          @click.stop
        >
          <!-- Handle -->
          <div class="flex justify-center pt-3 pb-2" @click="toggleExpand">
            <div class="w-10 h-1 rounded-full bg-neutral-200 dark:bg-zinc-700" />
          </div>
          
          <!-- Header -->
          <div class="px-5 pb-4 border-b border-neutral-100 dark:border-zinc-800">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-lg font-bold text-foundation">Your Box</h2>
                <p class="text-sm text-neutral-400">
                  {{ customBoxStore.size.charAt(0) + customBoxStore.size.slice(1).toLowerCase() }} • {{ customBoxStore.usedSlots }} of {{ customBoxStore.maxSlots }} slots
                </p>
              </div>
              <button 
                @click="toggleExpand"
                class="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X :size="20" class="text-neutral-500" />
              </button>
            </div>
            
            <!-- Progress Bar -->
            <div class="mt-4">
              <div class="h-2 bg-neutral-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  class="h-full bg-primary-deep rounded-full transition-all duration-500"
                  :style="{ width: `${progressPercentage()}%` }"
                />
              </div>
            </div>
          </div>
          
          <!-- Items List -->
          <div class="flex-1 overflow-y-auto p-5">
            <div v-if="customBoxStore.items.length === 0" class="text-center py-12">
              <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-100 dark:bg-zinc-800 flex items-center justify-center">
                <Package class="text-neutral-300" :size="28" />
              </div>
              <p class="text-neutral-400">Your box is empty</p>
              <p class="text-sm text-neutral-400/70 mt-1">Add items to get started</p>
            </div>
            
            <div v-else class="space-y-3">
              <div 
                v-for="item in customBoxStore.items" 
                :key="item.produceId"
                class="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-zinc-800/50"
              >
                <div class="w-14 h-14 rounded-lg bg-white dark:bg-zinc-700 overflow-hidden flex-shrink-0">
                  <NuxtImg :src="(item as any).image" :alt="item.name" class="w-full h-full object-cover" format="webp" sizes="48px" loading="lazy" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-semibold text-foundation truncate">{{ item.name }}</p>
                  <p class="text-xs text-neutral-400">
                    {{ item.quantity }} × {{ (item as any).slots || 1 }} slots
                  </p>
                </div>
                <button 
                  @click="customBoxStore.clearItem(item.produceId)"
                  class="p-2 text-neutral-300 hover:text-accent-clay hover:bg-accent-clay/10 rounded-lg transition-colors"
                >
                  <Trash2 :size="18" />
                </button>
              </div>
            </div>
          </div>
          
          <!-- Footer -->
          <div class="p-5 border-t border-neutral-100 dark:border-zinc-800 bg-neutral-50/50 dark:bg-zinc-900">
            <div class="flex items-center justify-between mb-4">
              <div>
                <p class="text-sm text-neutral-400">Weekly Total</p>
                <p class="text-2xl font-bold text-foundation">{{ formatPrice(customBoxStore.totalPrice) }}</p>
              </div>
              <button 
                v-if="customBoxStore.items.length > 0"
                @click="customBoxStore.resetBox()"
                class="flex items-center gap-1 text-sm text-neutral-400 hover:text-accent-clay transition-colors"
              >
                <RotateCcw :size="14" />
                Clear all
              </button>
            </div>
            
            <button 
              @click="handleAddToCart"
              class="w-full bg-primary-deep text-white font-semibold py-4 rounded-xl shadow-lg shadow-primary-deep/20 active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              :disabled="customBoxStore.items.length === 0"
            >
              <span>Add Box to Cart</span>
              <ArrowRight :size="18" />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  </div>
</template>

<style scoped>
.pb-safe {
  padding-bottom: calc(0.75rem + env(safe-area-inset-bottom, 0px));
}
</style>
