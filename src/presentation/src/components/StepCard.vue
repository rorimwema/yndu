<script setup lang="ts">
interface Props {
  number: string;
  icon: string;
  title: string;
  description: string;
}

defineProps<Props>();
</script>

<template>
  <div class="text-center">
    <div class="size-16 bg-flexoki-paper rounded-full flex items-center justify-center mx-auto mb-6 shadow-md border border-flexoki">
      <span class="text-3xl">{{ icon }}</span>
    </div>
    <h5 class="font-bold text-lg mb-2 text-flexoki">{{ number }}. {{ title }}</h5>
    <p class="text-sm text-flexoki-muted max-w-xs mx-auto">{{ description }}</p>
  </div>
</template>
