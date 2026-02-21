<script setup lang="ts">
import { ToggleGroupRoot, ToggleGroupItem } from 'reka-ui';
import { motion } from 'motion-v';
import { Leaf, Package, Users } from 'lucide-vue-next';

const size = defineModel<'SMALL' | 'MEDIUM' | 'LARGE'>({ default: 'SMALL' });

const sizes: Array<{ id: 'SMALL' | 'MEDIUM' | 'LARGE'; label: string; slots: number; icon: typeof Leaf; popular?: true }> = [
  { id: 'SMALL', label: 'S', slots: 12, icon: Leaf },
  { id: 'MEDIUM', label: 'M', slots: 20, icon: Package, popular: true },
  { id: 'LARGE', label: 'L', slots: 30, icon: Users },
];
</script>

<template>
  <motion.div
    :initial="{ opacity: 0, scale: 0.95 }"
    :animate="{ opacity: 1, scale: 1 }"
    :transition="{ duration: 0.2 }"
  >
    <ToggleGroupRoot
      v-model="size"
      type="single"
      class="inline-flex bg-neutral-100 dark:bg-zinc-800 rounded-xl p-1 gap-1"
    >
      <ToggleGroupItem
        v-for="s in sizes"
        :key="s.id"
        :value="s.id"
        as-child
      >
        <button
          class="relative flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all outline-none focus:ring-2 focus:ring-primary-deep/20"
          :class="[
            s.id === 'SMALL' || s.id === 'LARGE'
              ? 'data-[state=off]:text-neutral-500 data-[state=off]:hover:bg-white/50 dark:data-[state=off]:hover:bg-zinc-700/50'
              : '',
            s.id === 'MEDIUM' 
              ? 'data-[state=off]:text-neutral-500 data-[state=off]:hover:bg-white/50 dark:data-[state=off]:hover:bg-zinc-700/50' 
              : '',
            s.id === 'SMALL' || s.id === 'LARGE'
              ? 'data-[state=on]:bg-white dark:data-[state=on]:bg-zinc-700 data-[state=on]:text-primary-deep data-[state=on]:shadow-sm'
              : '',
            s.id === 'MEDIUM'
              ? 'data-[state=on]:bg-white dark:data-[state=on]:bg-zinc-700 data-[state=on]:text-primary-deep data-[state=on]:shadow-sm'
              : ''
          ]"
        >
        <component :is="s.icon" :size="14" />
        <span>{{ s.label }}</span>
        <span class="text-xs opacity-60">· {{ s.slots }}</span>
        <span 
          v-if="s.popular" 
          class="absolute -top-1 -right-1 w-2 h-2 bg-primary-deep rounded-full"
        />
        </button>
      </ToggleGroupItem>
    </ToggleGroupRoot>
  </motion.div>
</template>
