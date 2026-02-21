<script setup lang="ts">
import { computed } from 'vue';
import { MapPin, Clock, Package, Star } from 'lucide-vue-next';
import { motion } from 'motion-v';

interface Order {
  id: string;
  customerName: string;
  time: string;
  location: string;
  items: string;
  price: number;
  priority?: boolean;
  status?: 'pending' | 'assigned' | 'in-transit' | 'delivered';
}

const props = withDefaults(defineProps<Order>(), {
  status: 'pending',
  priority: false,
});

const emit = defineEmits<{
  (e: 'assign', orderId: string): void;
  (e: 'view', orderId: string): void;
}>();

const statusConfig = computed(() => {
  switch (props.status) {
    case 'assigned':
      return { label: 'Assigned', color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-200' };
    case 'in-transit':
      return { label: 'In Transit', color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 border-purple-200' };
    case 'delivered':
      return { label: 'Delivered', color: 'text-green-600 bg-green-50 dark:bg-green-900/20 border-green-200' };
    default:
      return { label: 'Pending', color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-200' };
  }
});

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
  }).format(price).replace('KES', 'KSh');
};
</script>

<template>
  <motion.div
    :while-hover="{ scale: 1.01 }"
    :while-press="{ scale: 0.99 }"
    class="group bg-white dark:bg-zinc-900 rounded-xl border border-neutral-100 dark:border-zinc-800 p-4 shadow-sm hover:shadow-md transition-all cursor-pointer"
    @click="emit('view', id)"
  >
    <!-- Header: ID & Priority -->
    <div class="flex items-start justify-between mb-3">
      <div class="flex items-center gap-2">
        <span class="text-xs font-bold text-neutral-400">#{{ id }}</span>
        <span
          v-if="priority"
          class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 text-[10px] font-bold uppercase tracking-wide"
        >
          <Star class="size-3 fill-current" />
          Priority
        </span>
      </div>
      <span
        class="px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border"
        :class="statusConfig.color"
      >
        {{ statusConfig.label }}
      </span>
    </div>

    <!-- Customer Info -->
    <div class="mb-3">
      <h3 class="font-bold text-foundation dark:text-white">{{ customerName }}</h3>
      <div class="flex items-center gap-1 text-xs text-neutral-400 mt-1">
        <MapPin class="size-3" />
        {{ location }}
      </div>
    </div>

    <!-- Order Details -->
    <div class="flex items-center gap-3 text-xs text-neutral-500 dark:text-gray-400 mb-3">
      <div class="flex items-center gap-1">
        <Package class="size-3" />
        {{ items }}
      </div>
      <div class="flex items-center gap-1">
        <Clock class="size-3" />
        {{ time }}
      </div>
    </div>

    <!-- Footer: Price & Action -->
    <div class="flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-zinc-800">
      <span class="font-bold text-primary-deep">{{ formatPrice(price) }}</span>
      <button
        v-if="status === 'pending'"
        class="text-xs font-bold text-primary-deep hover:text-primary-deep/80 transition-colors"
        @click.stop="emit('assign', id)"
      >
        Assign Rider →
      </button>
    </div>
  </motion.div>
</template>
