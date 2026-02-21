<script setup lang="ts">
import { motion } from 'motion-v';

interface Props {
  title: string;
  description?: string;
  icon?: any;
  actionLabel?: string;
  delay?: number;
}

const props = withDefaults(defineProps<Props>(), {
  description: '',
  delay: 0,
});

const emit = defineEmits<{
  action: [];
}>();
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
    class="rounded-xl border bg-card shadow-sm overflow-hidden"
  >
    <!-- Header -->
    <div class="flex items-center justify-between px-6 py-4 border-b border-border">
      <div class="flex items-center gap-3">
        <div v-if="icon" class="rounded-lg p-2 bg-primary/10">
          <component :is="icon" class="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 class="font-semibold">{{ title }}</h3>
          <p v-if="description" class="text-sm text-muted-foreground">{{ description }}</p>
        </div>
      </div>
      <button
        v-if="actionLabel"
        class="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        @click="emit('action')"
      >
        {{ actionLabel }}
      </button>
    </div>
    
    <!-- Content -->
    <div class="p-6">
      <slot />
    </div>
  </motion.div>
</template>
