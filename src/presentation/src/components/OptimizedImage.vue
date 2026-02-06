<script setup lang="ts">
import { ref, computed } from 'vue';
import { useImage, useIntersectionObserver } from '@vueuse/core';

interface Props {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  lazy?: boolean;
  placeholder?: string;
}

const props = withDefaults(defineProps<Props>(), {
  lazy: true,
  placeholder: '/images/placeholder.svg',
});

const imgRef = ref<HTMLImageElement>();
const isLoaded = ref(false);
const isInView = ref(!props.lazy);

// Lazy load with intersection observer
if (props.lazy) {
  useIntersectionObserver(imgRef, ([{ isIntersecting }]) => {
    if (isIntersecting) {
      isInView.value = true;
    }
  }, {
    rootMargin: '50px', // Start loading 50px before visible
  });
}

// Use VueUse image composable for loading state
const { isLoading, error } = useImage(
  computed(() => ({
    src: isInView.value ? props.src : props.placeholder,
  }))
);

const handleLoad = () => {
  isLoaded.value = true;
};

const handleError = () => {
  console.error(`Failed to load image: ${props.src}`);
};
</script>

<template>
  <div 
    ref="imgRef"
    class="image-wrapper relative overflow-hidden"
    :style="{ aspectRatio: width && height ? `${width}/${height}` : undefined }"
  >
    <!-- Loading placeholder -->
    <div 
      v-if="isLoading || !isLoaded"
      class="absolute inset-0 bg-flexoki-100 animate-pulse flex items-center justify-center"
    >
      <span class="text-flexoki-400 text-sm">Loading...</span>
    </div>
    
    <!-- Error state -->
    <div 
      v-else-if="error"
      class="absolute inset-0 bg-flexoki-100 flex items-center justify-center"
    >
      <span class="text-flexoki-warning text-sm">Failed to load image</span>
    </div>
    
    <!-- Actual image -->
    <img
      v-if="isInView"
      :src="src"
      :alt="alt"
      :width="width"
      :height="height"
      class="w-full h-full object-cover transition-opacity duration-300"
      :class="{ 'opacity-0': !isLoaded }"
      @load="handleLoad"
      @error="handleError"
      loading="lazy"
    />
  </div>
</template>

<style scoped>
.image-wrapper {
  background-color: var(--flexoki-100);
}
</style>
