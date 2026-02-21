<script setup lang="ts">
import { ref } from 'vue';
import { motion } from 'motion-v';
import { ChevronDown } from 'lucide-vue-next';

interface Props {
  title: string;
  icon?: any;
  delay?: number;
}

defineProps<Props>();

const selectedPeriod = ref('Last 30 days');
const periods = ['Last 7 days', 'Last 30 days', 'Last 90 days', 'This year'];
</script>

<template>
  <motion.div
    :initial="{ opacity: 0, y: 20 }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="{ duration: 0.4, delay: (delay || 0) * 0.1 }"
    class="glass-card chart-card overflow-hidden"
  >
    <!-- Header -->
    <div class="p-5 border-b flex items-center justify-between" style="border-color: rgba(90, 120, 99, 0.1);">
      <div class="flex items-center gap-3">
        <div 
          v-if="icon"
          class="w-9 h-9 rounded-lg flex items-center justify-center"
          style="background: rgba(90, 120, 99, 0.12);"
        >
          <component :is="icon" class="size-4" style="color: var(--yndu-green);" />
        </div>
        <h3 class="font-semibold">{{ title }}</h3>
      </div>

      <!-- Period Dropdown -->
      <div class="relative">
        <select
          v-model="selectedPeriod"
          class="appearance-none bg-transparent border rounded-lg px-3 py-1.5 pr-8 text-sm font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--yndu-green)]/20"
          style="border-color: rgba(90, 120, 99, 0.2);"
        >
          <option v-for="period in periods" :key="period" :value="period">
            {{ period }}
          </option>
        </select>
        <ChevronDown class="absolute right-2 top-1/2 -translate-y-1/2 size-4 pointer-events-none text-muted-foreground" />
      </div>
    </div>

    <!-- Chart Content -->
    <div class="p-5">
      <slot>
        <!-- Placeholder chart visualization -->
        <div class="h-56 flex items-end justify-around gap-2 px-4">
          <ClientOnly>
            <div
              v-for="i in 12"
              :key="i"
              class="flex-1 rounded-t-md transition-all duration-300"
              :style="{
                height: `${20 + Math.random() * 80}%`,
                background: i === 8 ? 'var(--yndu-green)' : 'rgba(90, 120, 99, 0.2)',
              }"
            />
          </ClientOnly>
        </div>
        <div class="flex justify-between text-xs text-muted-foreground mt-3 px-4">
          <span>Jan</span>
          <span>Feb</span>
          <span>Mar</span>
          <span>Apr</span>
          <span>May</span>
          <span>Jun</span>
          <span>Jul</span>
          <span>Aug</span>
          <span>Sep</span>
          <span>Oct</span>
          <span>Nov</span>
          <span>Dec</span>
        </div>
      </slot>
    </div>
  </motion.div>
</template>
