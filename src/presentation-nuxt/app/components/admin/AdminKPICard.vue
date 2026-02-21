<script setup lang="ts">
import { motion } from 'motion-v';
import AdminTrendBadge from './AdminTrendBadge.vue';

interface Props {
  title: string;
  value: string;
  icon: any;
  trend: 'up' | 'down';
  trendValue: string;
  delay?: number;
}

defineProps<Props>();
</script>

<template>
  <motion.div
    :initial="{ opacity: 0, y: 20 }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="{ duration: 0.4, delay: (delay || 0) * 0.1 }"
    class="glass-card glass-card-hover kpi-card transition-all cursor-pointer"
  >
    <div class="flex items-center justify-between mb-4">
      <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background: rgba(90, 120, 99, 0.12);">
        <component :is="icon" class="size-5" style="color: var(--yndu-green);" />
      </div>
      <AdminTrendBadge :value="trendValue" :direction="trend" />
    </div>
    
    <p class="kpi-value mb-1">{{ value }}</p>
    <p class="text-sm text-muted-foreground">{{ title }}</p>
  </motion.div>
</template>
