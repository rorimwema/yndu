<script setup lang="ts">
import { computed } from 'vue';
import { motion } from 'motion-v';
import { Check, Plus } from 'lucide-vue-next';
import { useCartStore } from '../stores/cartStore';

interface Props {
  id: string;
  title: string;
  price: number;
  description: string;
  image: string;
  imageAlt: string;
  badge?: string;
  variant?: 'default' | 'popular';
  weight?: number;
  unit?: string;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  weight: 0.5,
  unit: 'kg',
});

const emit = defineEmits<{
  addToCart: [];
}>();

const cart = useCartStore();

const isJustAdded = computed(() => cart.justAdded === props.id);
const isInCart = computed(() => cart.items.some((item) => item.productId === props.id));

const handleAddToCart = () => {
  cart.addItem({
    productId: props.id,
    name: props.title,
    price: props.price,
    quantity: 1,
    weight: props.weight,
    image: props.image,
    unit: props.unit,
  });
  
  emit('addToCart');
};
</script>

<template>
  <component
    :is="motion.div"
    class="group p-4 hover:shadow-xl transition-all duration-300 relative bg-flexoki dark:bg-zinc-800 rounded-xl border border-flexoki-200"
    :class="{ 'ring-2 ring-flexoki-primary': variant === 'popular' }"
    :initial="{ opacity: 0, y: 20 }"
    :while-in-view="{ opacity: 1, y: 0 }"
    :viewport="{ once: true, margin: '-50px' }"
    :transition="{ duration: 0.4, ease: 'easeOut' }"
    :while-hover="{ y: -8, scale: 1.02 }"
    :while-press="{ scale: 0.98 }"
  >
    <!-- Added Indicator -->
    <Transition
      enter-active-class="transform transition-all duration-300 ease-out"
      enter-from-class="scale-0 opacity-0"
      enter-to-class="scale-100 opacity-100"
      leave-active-class="transform transition-all duration-200 ease-in"
      leave-from-class="scale-100 opacity-100"
      leave-to-class="scale-0 opacity-0"
    >
      <div 
        v-if="isJustAdded"
        class="absolute -top-2 -right-2 z-20 bg-flexoki-primary text-white p-2 rounded-full shadow-lg"
      >
        <Check :size="20" />
      </div>
    </Transition>

    <!-- Badge -->
    <div v-if="badge" class="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
      <span class="bg-flexoki-warning text-white px-4 py-1 rounded-full text-xs font-black uppercase shadow-lg">
        {{ badge }}
      </span>
    </div>

    <!-- Image -->
    <div class="aspect-square rounded-lg overflow-hidden mb-4 bg-flexoki-paper relative">
      <img 
        :src="image" 
        :alt="imageAlt"
        class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        loading="lazy"
      />
      <!-- In Cart Indicator -->
      <div 
        v-if="isInCart"
        class="absolute top-2 right-2 bg-flexoki-primary text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1"
      >
        <Check :size="12" />
        In Cart
      </div>
    </div>

    <!-- Content -->
    <div class="flex justify-between items-start mb-2">
      <h4 class="font-bold text-lg text-flexoki">{{ title }}</h4>
      <span class="text-flexoki-primary font-black">KSh {{ price.toLocaleString() }}</span>
    </div>
    
    <p class="text-sm text-flexoki-muted mb-6 line-clamp-2">{{ description }}</p>
    
    <!-- Button -->
    <component
      :is="motion.button"
      @click="handleAddToCart"
      class="w-full py-4 sm:py-3 rounded-xl sm:rounded-lg font-bold transition-all flex items-center justify-center gap-2 min-h-[48px]"
      :class="[
        variant === 'popular' 
          ? 'bg-flexoki-primary text-flexoki-900 border-none' 
          : 'bg-flexoki-primary/20 hover:bg-flexoki-primary text-flexoki-900',
        isJustAdded ? 'bg-flexoki-primary text-flexoki-900' : ''
      ]"
      :while-hover="{ scale: 1.03 }"
      :while-press="{ scale: 0.97 }"
      :transition="{ type: 'spring', stiffness: 400, damping: 15 }"
      :disabled="isJustAdded as boolean"
    >
      <Transition mode="out-in">
        <span v-if="isJustAdded" key="added" class="flex items-center gap-2">
          <Check :size="16" />
          Added!
        </span>
        <span v-else key="add" class="flex items-center gap-2">
          <Plus :size="16" />
          Add to Box
        </span>
      </Transition>
    </component>
  </component>
</template>

<style scoped>
.v-enter-active,
.v-leave-active {
  transition: opacity 0.2s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
