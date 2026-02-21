<script setup lang="ts">
import { computed } from 'vue';
import { RadioGroupRoot, RadioGroupItem } from 'reka-ui';
import { Check, Package, Users, Leaf, Sparkles } from 'lucide-vue-next';
import { motion } from 'motion-v';
import { useSubscriptionStore } from '../../stores/subscription-store';
import { BOX_SIZE_CONFIG, type SubscriptionBoxSize } from '../../types/subscription';

const store = useSubscriptionStore();

const boxSizes = computed(() => [
  {
    value: 'SMALL' as SubscriptionBoxSize,
    ...BOX_SIZE_CONFIG.SMALL,
    icon: Leaf,
  },
  {
    value: 'MEDIUM' as SubscriptionBoxSize,
    ...BOX_SIZE_CONFIG.MEDIUM,
    icon: Package,
    popular: true,
  },
  {
    value: 'LARGE' as SubscriptionBoxSize,
    ...BOX_SIZE_CONFIG.LARGE,
    icon: Users,
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
    <h3 class="text-xl font-bold text-foundation mb-2">Box Size</h3>
    <p class="text-sm text-neutral-500 mb-6">Choose the perfect size for your household</p>

    <RadioGroupRoot
      v-model="store.boxSize"
      class="grid grid-cols-1 md:grid-cols-3 gap-6"
    >
      <motion.div
        v-for="(size, index) in boxSizes"
        :key="size.value"
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.3, delay: index * 0.1 }"
      >
        <RadioGroupItem
          :value="size.value"
          as-child
        >
          <div
            class="group relative w-full h-full flex flex-col p-6 rounded-3xl border-2 transition-all duration-300 outline-none focus:ring-4 focus:ring-primary-deep/20 text-left cursor-pointer bg-white dark:bg-zinc-900 border-neutral-100 dark:border-zinc-800 hover:border-primary-deep/30 hover:shadow-xl data-[state=checked]:border-primary-deep data-[state=checked]:shadow-2xl data-[state=checked]:shadow-primary-deep/10"
            :class="{ 'ring-2 ring-primary-deep/20': size.popular }"
          >
          <!-- Popular Badge -->
          <div v-if="size.popular" class="absolute -top-3 left-1/2 -translate-x-1/2">
            <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary-deep text-white text-xs font-bold uppercase tracking-wide">
              <Sparkles class="w-3 h-3" />
              Most Popular
            </span>
          </div>

          <!-- Check Indicator -->
          <div class="absolute top-4 right-4 opacity-0 group-data-[state=checked]:opacity-100 transition-all duration-300 bg-primary-deep text-white rounded-full p-1.5">
            <Check :size="18" stroke-width="3" />
          </div>

          <!-- Icon -->
          <div 
            class="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-colors duration-300"
            :class="[
              size.popular 
                ? 'bg-primary-deep text-white group-data-[state=checked]:bg-primary-deep' 
                : 'bg-neutral-100 text-neutral-500 group-data-[state=checked]:bg-primary-deep group-data-[state=checked]:text-white'
            ]"
          >
            <component :is="size.icon" :size="28" />
          </div>

          <!-- Content -->
          <h4 class="font-bold text-xl text-foundation mb-1">{{ size.name }}</h4>
          <p class="text-sm text-primary-deep font-medium mb-3">{{ size.weightEstimate }}</p>
          <p class="text-sm text-neutral-500 mb-4 flex-1">{{ size.description }}</p>

          <!-- Capacity -->
          <div class="flex items-baseline gap-2 mb-4">
            <span class="text-3xl font-bold text-foundation">{{ size.slots }}</span>
            <span class="text-sm text-neutral-500">slots</span>
          </div>

          <!-- Price -->
          <div class="pt-4 border-t border-neutral-100 dark:border-zinc-800">
            <div class="flex items-baseline justify-between">
              <span class="text-sm text-neutral-400">Starting at</span>
              <span class="text-2xl font-bold text-primary-deep">{{ formatPrice(size.basePrice) }}</span>
            </div>
            <span class="text-xs text-neutral-400 block text-right">per delivery</span>
          </div>
        </div>
      </RadioGroupItem>
      </motion.div>
    </RadioGroupRoot>
  </div>
</template>
