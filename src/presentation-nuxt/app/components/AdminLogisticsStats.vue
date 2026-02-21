<script setup lang="ts">
import { computed } from 'vue';
import { Package, Clock, CheckCircle, AlertCircle } from 'lucide-vue-next';

interface Stats {
  pending: number;
  inTransit: number;
  delivered: number;
  delayed: number;
}

const props = withDefaults(defineProps<Stats>(), {
  pending: 12,
  inTransit: 8,
  delivered: 145,
  delayed: 2,
});

const stats = computed(() => [
  {
    label: 'Pending Dispatch',
    value: props.pending,
    icon: Package,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    borderColor: 'border-amber-200 dark:border-amber-800',
  },
  {
    label: 'In Transit',
    value: props.inTransit,
    icon: Clock,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
  },
  {
    label: 'Delivered Today',
    value: props.delivered,
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-200 dark:border-green-800',
  },
  {
    label: 'Delayed',
    value: props.delayed,
    icon: AlertCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-800',
  },
]);
</script>

<template>
  <div class="bg-white dark:bg-zinc-900 border-b border-neutral-100 dark:border-zinc-800 px-6 py-4">
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="flex items-center gap-3 p-3 rounded-xl border"
        :class="[stat.bgColor, stat.borderColor]"
      >
        <div class="p-2 rounded-lg bg-white dark:bg-zinc-800 shadow-sm">
          <component :is="stat.icon" class="size-5" :class="stat.color" />
        </div>
        <div>
          <p class="text-2xl font-bold text-foundation dark:text-white">{{ stat.value }}</p>
          <p class="text-xs text-neutral-400 font-medium">{{ stat.label }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
