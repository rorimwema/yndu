<script setup lang="ts">
import { computed } from 'vue';
import { motion } from 'motion-v';
import { Plus, Minus, Check } from 'lucide-vue-next';
import { useCustomBoxStore } from '../stores/custom-box-store';

interface Props {
  id: string;
  title: string;
  price: number;
  image: string;
  slots: number;
  index?: number;
}

const props = defineProps<Props>();
const store = useCustomBoxStore();

const qty = computed(() => store.items.find(i => i.produceId === props.id)?.quantity || 0);
const canAdd = computed(() => store.usedSlots + props.slots <= store.maxSlots);

const add = () => canAdd.value && store.addItem({ 
  id: props.id, title: props.title, slots: props.slots, image: props.image, price: props.price 
});
const remove = () => store.removeItem(props.id);
</script>

<template>
  <motion.div
    :initial="{ opacity: 0, y: 12 }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="{ duration: 0.25, delay: (index || 0) * 0.03 }"
    :whileTap="{ scale: 0.98 }"
    class="group relative bg-white dark:bg-zinc-900 rounded-xl overflow-hidden border border-neutral-100 dark:border-zinc-800 hover:shadow-lg transition-shadow"
    :class="{ 'ring-2 ring-primary-deep/30': qty > 0 }"
  >
    <!-- Image -->
    <div class="relative aspect-square overflow-hidden">
      <NuxtImg :src="image" :alt="title" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" format="webp" sizes="sm:50vw md:33vw lg:25vw" loading="lazy" />
      
      <!-- Quantity badge -->
      <motion.div 
        v-if="qty > 0"
        :initial="{ scale: 0 }"
        :animate="{ scale: 1 }"
        :transition="{ type: 'spring', stiffness: 400, damping: 15 }"
        class="absolute top-2 right-2 bg-primary-deep text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-lg"
      >
        {{ qty }}
      </motion.div>

      <!-- Slot indicator -->
      <div class="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded-md text-xs text-white font-medium">
        {{ slots }} {{ slots === 1 ? 'slot' : 'slots' }}
      </div>
    </div>

    <!-- Content -->
    <div class="p-3">
      <div class="flex items-start justify-between gap-2 mb-2">
        <h3 class="font-semibold text-sm text-foundation leading-tight line-clamp-1">{{ title }}</h3>
        <span class="text-sm font-bold text-primary-deep whitespace-nowrap">KSh {{ price }}</span>
      </div>

      <!-- Controls -->
      <div class="flex items-center justify-end gap-1.5">
        <button 
          v-if="qty > 0"
          @click="remove"
          class="w-8 h-8 flex items-center justify-center rounded-lg bg-neutral-100 dark:bg-zinc-800 text-neutral-500 hover:bg-neutral-200 dark:hover:bg-zinc-700 transition-colors"
        >
          <Minus :size="14" stroke-width="2.5" />
        </button>
        
        <button 
          @click="add"
          :disabled="!canAdd"
          class="w-8 h-8 flex items-center justify-center rounded-lg transition-all"
          :class="canAdd 
            ? 'bg-primary-deep text-white hover:bg-primary-deep/90 shadow-md shadow-primary-deep/20' 
            : 'bg-neutral-100 dark:bg-zinc-800 text-neutral-300 cursor-not-allowed'"
        >
          <Plus :size="14" stroke-width="2.5" />
        </button>
      </div>
    </div>
  </motion.div>
</template>
