<script setup lang="ts">
import { computed } from 'vue';
import { motion } from 'motion-v';
import { TrendingUp, TrendingDown, Minus } from 'lucide-vue-next';

interface Props {
  title: string;
  value: string | number;
  icon: any;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: 'default' | 'primary' | 'success' | 'warning' | 'destructive';
  delay?: number;
}

const props = withDefaults(defineProps<Props>(), {
  trend: 'neutral',
  trendValue: '',
  color: 'default',
  delay: 0,
});

const colorClasses = computed(() => {
  switch (props.color) {
    case 'primary':
      return {
        bg: 'bg-primary/10',
        icon: 'text-primary',
        border: 'border-primary/20',
      };
    case 'success':
      return {
        bg: 'bg-green-500/10',
        icon: 'text-green-500',
        border: 'border-green-500/20',
      };
    case 'warning':
      return {
        bg: 'bg-amber-500/10',
        icon: 'text-amber-500',
        border: 'border-amber-500/20',
      };
    case 'destructive':
      return {
        bg: 'bg-destructive/10',
        icon: 'text-destructive',
        border: 'border-destructive/20',
      };
    default:
      return {
        bg: 'bg-muted',
        icon: 'text-muted-foreground',
        border: 'border-border',
      };
  }
});

const trendIcon = computed(() => {
  switch (props.trend) {
    case 'up':
      return TrendingUp;
    case 'down':
      return TrendingDown;
    default:
      return Minus;
  }
});

const trendClasses = computed(() => {
  switch (props.trend) {
    case 'up':
      return 'text-green-500';
    case 'down':
      return 'text-destructive';
    default:
      return 'text-muted-foreground';
  }
});
</script>

<template>
  <motion.div
    :initial="{ opacity: 0, y: 20 }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="{ 
      type: 'spring', 
      stiffness: 300, 
      damping: 30,
      delay: delay * 0.1 
    }"
    :while-hover="{ y: -4, transition: { duration: 0.2 } }"
    class="relative overflow-hidden rounded-xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
    :class="colorClasses.border"
  >
    <!-- Background decoration -->
    <div 
      class="absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-50 blur-2xl"
      :class="colorClasses.bg"
    />
    
    <div class="relative">
      <div class="flex items-start justify-between">
        <div>
          <p class="text-sm font-medium text-muted-foreground">{{ title }}</p>
          <h3 class="mt-2 text-3xl font-bold tracking-tight">{{ value }}</h3>
        </div>
        <div 
          class="rounded-xl p-3"
          :class="colorClasses.bg"
        >
          <component :is="icon" class="h-5 w-5" :class="colorClasses.icon" />
        </div>
      </div>
      
      <div v-if="trendValue" class="mt-4 flex items-center gap-2">
        <div class="flex items-center gap-1 text-sm font-medium" :class="trendClasses">
          <component :is="trendIcon" class="h-4 w-4" />
          <span>{{ trendValue }}</span>
        </div>
        <span class="text-sm text-muted-foreground">vs last month</span>
      </div>
    </div>
  </motion.div>
</template>
