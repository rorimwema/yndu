<script setup lang="ts">
import { computed } from 'vue';
import { motion } from 'motion-v';
import { Check, Plus } from 'lucide-vue-next';
import { useCartStore } from '../stores/cart-store';

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
    class="group p-5 relative bg-white dark:bg-zinc-800 rounded border border-secondary-sage/20 transition-all duration-200 ease-in-out hover:border-secondary-sage hover:scale-[1.01] hover:shadow-lg"
    :class="{ 'ring-2 ring-primary-deep': variant === 'popular' }"
    :initial="{ opacity: 0, y: 20 }"
    :while-in-view="{ opacity: 1, y: 0 }"
    :viewport="{ once: true, margin: '-50px' }"
    :transition="{ duration: 0.4, ease: 'easeOut' }"
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
        class="absolute -top-2 -right-2 z-20 bg-secondary-sage text-white p-2 rounded-full shadow-lg"
      >
        <Check :size="20" />
      </div>
    </Transition>

    <!-- Badge -->
    <div v-if="badge" class="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
      <span class="bg-accent-clay text-white px-4 py-1 rounded-sm text-xs font-semibold uppercase shadow-lg tracking-wide">
        {{ badge }}
      </span>
    </div>

    <!-- Image & Badge Container -->
    <div class="aspect-square rounded overflow-hidden mb-4 bg-neutral-50 relative">
      <NuxtImg 
        :src="image" 
        :alt="imageAlt"
        class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        loading="lazy"
        format="webp"
        sizes="sm:100vw md:50vw lg:33vw"
      />
      
      <!-- In Cart Indicator -->
      <div 
        v-if="isInCart"
        class="absolute top-2 right-2 bg-primary-deep text-white px-2 py-1 rounded-sm text-xs font-medium flex items-center gap-1 shadow-md z-10"
      >
        <Check :size="12" />
        In Cart
      </div>
    </div>

    <!-- Content -->
    <div class="flex justify-between items-start mb-2">
      <h4 class="font-serif text-lg text-primary-deep">{{ title }}</h4>
      <span class="text-accent-clay font-semibold">KSh {{ price.toLocaleString() }}</span>
    </div>
    
    <p class="text-sm text-neutral-400 mb-6 line-clamp-2">{{ description }}</p>
    
    <!-- Button -->
    <component
      :is="motion.button"
      @click="handleAddToCart"
      class="w-full py-3 rounded font-medium transition-all duration-200 ease-in-out flex items-center justify-center gap-2 min-h-[48px]"
      :class="[
        variant === 'popular' 
          ? 'bg-accent-clay text-white border-none hover:bg-primary-deep' 
          : 'bg-primary-deep/10 hover:bg-accent-clay text-primary-deep hover:text-white',
        isJustAdded ? 'bg-secondary-sage text-white' : ''
      ]"
      :while-hover="{ scale: 1.02 }"
      :while-press="{ scale: 0.98 }"
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
  transition: opacity 0.2s ease-in-out;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
