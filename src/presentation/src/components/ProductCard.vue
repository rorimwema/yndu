<script setup lang="ts">
interface Props {
  title: string;
  price: number;
  description: string;
  image: string;
  imageAlt: string;
  badge?: string;
  variant?: 'default' | 'popular';
}

withDefaults(defineProps<Props>(), {
  variant: 'default',
});

const emit = defineEmits<{
  addToCart: [];
}>();
</script>

<template>
  <div 
    class="group card-flexoki p-4 hover:shadow-xl transition-all duration-300"
    :class="{ 'ring-2 ring-flexoki-primary': variant === 'popular' }"
  >
    <!-- Badge -->
    <div v-if="badge" class="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
      <span class="bg-flexoki-warning text-white px-4 py-1 rounded-full text-xs font-black uppercase shadow-lg">
        {{ badge }}
      </span>
    </div>

    <!-- Image -->
    <div class="aspect-square rounded-lg overflow-hidden mb-4 bg-flexoki-100 relative">
      <img 
        :src="image" 
        :alt="imageAlt"
        class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        loading="lazy"
      />
    </div>

    <!-- Content -->
    <div class="flex justify-between items-start mb-2">
      <h4 class="font-bold text-lg text-flexoki">{{ title }}</h4>
      <span class="text-flexoki-primary font-black">KSh {{ price.toLocaleString() }}</span>
    </div>
    
    <p class="text-sm text-flexoki-muted mb-6 line-clamp-2">{{ description }}</p>
    
    <!-- Button -->
    <button 
      @click="emit('addToCart')"
      class="w-full py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2"
      :class="variant === 'popular' 
        ? 'btn-primary' 
        : 'bg-flexoki-primary/20 hover:bg-flexoki-primary text-flexoki hover:text-white'"
    >
      <span>+</span> Add to Box
    </button>
  </div>
</template>
