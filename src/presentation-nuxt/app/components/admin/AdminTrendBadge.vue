<script setup lang="ts">
import { TrendingUp, TrendingDown } from 'lucide-vue-next';

interface Props {
  value: string;
  direction: 'up' | 'down';
}

defineProps<Props>();
</script>

<template>
  <span class="trend-badge" :class="direction">
    <TrendingUp v-if="direction === 'up'" class="size-3" />
    <TrendingDown v-else class="size-3" />
    {{ value }}
  </span>
</template>
