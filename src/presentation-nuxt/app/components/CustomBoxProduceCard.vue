<script setup lang="ts">
import { computed } from 'vue';
import { motion } from 'motion-v';
import { Plus, Minus, MapPin, Check } from 'lucide-vue-next';
import { useCustomBoxStore } from '../stores/custom-box-store';

interface Props {
  id: string;
  title: string;
  subtitle: string;
  price: number;
  description: string;
  image: string;
  slots: number;
  category: string;
  origin: string;
  nutrients: string[];
  index?: number;
}

const props = defineProps<Props>();
const customBoxStore = useCustomBoxStore();

const currentQuantity = computed(() => {
  const item = customBoxStore.items.find(i => i.produceId === props.id);
  return item ? item.quantity : 0;
});

const canAdd = computed(() => {
  return customBoxStore.usedSlots + props.slots <= customBoxStore.maxSlots;
});

const isFull = computed(() => customBoxStore.isFull);

const handleAdd = () => {
  if (!canAdd.value) return;
  customBoxStore.addItem({
    id: props.id,
    title: props.title,
    price: props.price,
    description: props.description,
    image: props.image,
    slots: props.slots
  });
};

const handleRemove = () => {
  customBoxStore.removeItem(props.id);
};

const formatPrice = (value: number) => {
  return `KSh ${value.toLocaleString()}`;
};
</script>

<template>
  <motion.div 
    :initial="{ opacity: 0, y: 20 }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="{ duration: 0.3, delay: (index || 0) * 0.05 }"
    class="group bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-neutral-100 dark:border-zinc-800 hover:shadow-xl hover:shadow-primary-deep/5 transition-all duration-300 flex flex-col"
    :class="{ 'ring-2 ring-primary-deep/20': currentQuantity > 0 }"
  >
    <!-- Image Section -->
    <div class="relative h-48 overflow-hidden">
      <NuxtImg 
        :src="product.images[0]"
        :alt="product.name"
        class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        format="webp"
        sizes="sm:50vw md:33vw lg:25vw"
        loading="lazy"
      />
      
      <!-- Category Badge -->
      <div class="absolute top-3 left-3">
        <span class="inline-flex items-center px-2.5 py-1 rounded-lg bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm text-xs font-semibold text-neutral-600 dark:text-neutral-300 shadow-sm">
          {{ category }}
        </span>
      </div>

      <!-- Slots Badge -->
      <div class="absolute top-3 right-3">
        <span 
          class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm"
          :class="[
            currentQuantity > 0 
              ? 'bg-primary-deep text-white' 
              : 'bg-white/90 dark:bg-zinc-900/90 text-neutral-600 dark:text-neutral-300'
          ]"
        >
          {{ slots }} {{ slots === 1 ? 'slot' : 'slots' }}
        </span>
      </div>

      <!-- Selected Overlay -->
      <div 
        v-if="currentQuantity > 0"
        class="absolute inset-0 bg-primary-deep/10 flex items-center justify-center"
      >
        <div class="bg-primary-deep text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg flex items-center gap-2">
          <Check :size="16" />
          {{ currentQuantity }} in box
        </div>
      </div>
    </div>
    
    <!-- Content Section -->
    <div class="p-5 flex flex-col flex-1">
      <!-- Title & Local Name -->
      <div class="mb-3">
        <div class="flex items-start justify-between gap-2">
          <h3 class="font-bold text-lg text-foundation leading-tight">{{ title }}</h3>
          <span class="text-lg font-bold text-primary-deep whitespace-nowrap">{{ formatPrice(price) }}</span>
        </div>
        <p class="text-xs text-neutral-400 font-medium">{{ subtitle }}</p>
      </div>

      <!-- Description -->
      <p class="text-sm text-neutral-500 leading-relaxed mb-4 flex-1">
        {{ description }}
      </p>

      <!-- Origin & Nutrients -->
      <div class="mb-4 space-y-2">
        <div class="flex items-center gap-1.5 text-xs text-neutral-400">
          <MapPin :size="12" />
          <span>{{ origin }}</span>
        </div>
        <div class="flex flex-wrap gap-1">
          <span 
            v-for="nutrient in nutrients" 
            :key="nutrient"
            class="text-[10px] px-2 py-0.5 rounded-full bg-primary-deep/10 text-primary-deep font-medium"
          >
            {{ nutrient }}
          </span>
        </div>
      </div>

      <!-- Action Section -->
      <div class="pt-4 border-t border-neutral-100 dark:border-zinc-800">
        <div class="flex items-center justify-between">
          <!-- Price per slot hint -->
          <div class="text-xs text-neutral-400">
            <span v-if="!isFull || currentQuantity > 0">
              {{ customBoxStore.remainingSlots }} slots left
            </span>
            <span v-else class="text-accent-clay font-medium">
              Box full
            </span>
          </div>
          
          <!-- Quantity Controls -->
          <div class="flex items-center gap-2">
            <button 
              v-if="currentQuantity > 0"
              @click="handleRemove"
              class="w-9 h-9 flex items-center justify-center rounded-lg bg-neutral-100 dark:bg-zinc-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-zinc-700 transition-colors"
            >
              <Minus :size="16" stroke-width="2.5" />
            </button>
            
            <span 
              v-if="currentQuantity > 0"
              class="w-8 text-center font-bold text-foundation"
            >
              {{ currentQuantity }}
            </span>
            
            <button 
              @click="handleAdd"
              :disabled="!canAdd"
              class="w-9 h-9 flex items-center justify-center rounded-lg font-bold transition-all duration-200"
              :class="[
                canAdd 
                  ? 'bg-primary-deep text-white hover:bg-primary-deep/90 shadow-md shadow-primary-deep/20 hover:shadow-lg hover:shadow-primary-deep/30 hover:-translate-y-0.5' 
                  : 'bg-neutral-100 dark:bg-zinc-800 text-neutral-400 cursor-not-allowed'
              ]"
            >
              <Plus :size="16" stroke-width="2.5" />
            </button>
          </div>
        </div>

        <!-- Helper text when can't add -->
        <p v-if="!canAdd && currentQuantity === 0" class="text-xs text-accent-clay text-right mt-2">
          Not enough space in your box
        </p>
      </div>
    </div>
  </motion.div>
</template>
