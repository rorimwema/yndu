<script setup lang="ts">
import * as LucideIcons from 'lucide-vue-next';

interface Props {
  number: string;
  icon: string;
  title: string;
  description: string;
}

const props = defineProps<Props>();
const IconComponent = (LucideIcons as any)[props.icon];
</script>

<template>
  <div class="text-center">
    <div class="size-16 bg-white dark:bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md border border-flexoki">
      <component :is="IconComponent" :size="32" class="text-flexoki-primary" />
    </div>
    <h5 class="font-bold text-lg mb-2 text-flexoki">{{ number }}. {{ title }}</h5>
    <p class="text-sm text-flexoki-muted max-w-xs mx-auto">{{ description }}</p>
  </div>
</template>
