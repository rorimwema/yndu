<script setup lang="ts">
import { computed } from 'vue';
import { MapPin, Package, Phone, Navigation } from 'lucide-vue-next';
import { motion } from 'motion-v';

interface Rider {
  name: string;
  image: string;
  status: 'ACTIVE' | 'BUSY' | 'OFFLINE';
  location: string;
  assignedCount: number;
  maxCapacity: number;
  phone?: string;
}

const props = defineProps<Rider>();

const emit = defineEmits<{
  (e: 'track', riderName: string): void;
  (e: 'contact', riderName: string): void;
}>();

const statusConfig = computed(() => {
  switch (props.status) {
    case 'ACTIVE':
      return {
        label: 'Active',
        dotColor: 'bg-green-500',
        badgeColor: 'text-green-600 bg-green-50 dark:bg-green-900/20 border-green-200',
      };
    case 'BUSY':
      return {
        label: 'Busy',
        dotColor: 'bg-orange-400',
        badgeColor: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 border-orange-200',
      };
    default:
      return {
        label: 'Offline',
        dotColor: 'bg-gray-400',
        badgeColor: 'text-gray-600 bg-gray-50 dark:bg-gray-800 border-gray-200',
      };
  }
});

const capacityPercent = computed(() =>
  Math.round((props.assignedCount / props.maxCapacity) * 100)
);

const capacityColor = computed(() => {
  if (capacityPercent.value >= 100) return 'bg-red-500';
  if (capacityPercent.value >= 75) return 'bg-orange-400';
  return 'bg-green-500';
});
</script>

<template>
  <motion.div
    :while-hover="{ scale: 1.01 }"
    class="bg-white dark:bg-zinc-900 rounded-xl border border-neutral-100 dark:border-zinc-800 p-4 shadow-sm hover:shadow-md transition-all"
  >
    <div class="flex items-center gap-4">
      <!-- Avatar -->
      <div class="relative shrink-0">
        <NuxtImg
          :src="image"
          :alt="name"
          class="w-12 h-12 rounded-full object-cover shadow-sm bg-neutral-100 dark:bg-zinc-800"
          format="webp"
          sizes="48px"
          loading="lazy"
        /><div
          class="absolute -bottom-1 -right-1 size-4 rounded-full border-2 border-white dark:border-zinc-900"
          :class="statusConfig.dotColor"
        />
      </div>

      <!-- Info -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-1">
          <h3 class="font-bold text-foundation dark:text-white truncate">{{ name }}</h3>
          <span
            class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border shrink-0"
            :class="statusConfig.badgeColor"
          >
            {{ statusConfig.label }}
          </span>
        </div>

        <div class="flex items-center gap-1 text-xs text-neutral-400 mb-2">
          <MapPin class="size-3" />
          <span class="truncate">{{ location }}</span>
        </div>

        <!-- Capacity Bar -->
        <div class="flex items-center gap-2">
          <Package class="size-3 text-neutral-400" />
          <div class="flex-1 h-1.5 bg-neutral-100 dark:bg-zinc-700 rounded-full overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-300"
              :class="capacityColor"
              :style="{ width: `${capacityPercent}%` }"
            />
          </div>
          <span class="text-[10px] font-bold text-neutral-400">
            {{ assignedCount }}/{{ maxCapacity }}
          </span>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex flex-col gap-2 shrink-0">
        <button
          class="p-2 rounded-lg bg-neutral-50 dark:bg-zinc-800 text-primary-deep hover:bg-primary-deep hover:text-white transition-all"
          :class="{ 'opacity-50 cursor-not-allowed': status === 'OFFLINE' }"
          :disabled="status === 'OFFLINE'"
          @click="emit('track', name)"
        >
          <Navigation class="size-4" />
        </button>
        <button
          class="p-2 rounded-lg bg-neutral-50 dark:bg-zinc-800 text-primary-deep hover:bg-primary-deep hover:text-white transition-all"
          @click="emit('contact', name)"
        >
          <Phone class="size-4" />
        </button>
      </div>
    </div>
  </motion.div>
</template>
