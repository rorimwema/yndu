<script setup lang="ts">
import type { Component } from 'vue';

interface Props {
  number: string;
  icon: Component;
  title: string;
  description: string;
}

defineProps<Props>();
</script>

<template>
  <div class="text-center">
    <div class="size-16 bg-white dark:bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md border border-neutral-200">
      <component :is="icon" :size="32" class="text-primary-deep" />
    </div>
    <h5 class="font-bold text-lg mb-2 text-foundation">{{ number }}. {{ title }}</h5>
    <p class="text-sm text-neutral-400 max-w-xs mx-auto">{{ description }}</p>
  </div>
</template>
