<script setup lang="ts">
import { PlusCircle, ChevronLeft, ChevronRight } from 'lucide-vue-next';
import { ref, onMounted, onUnmounted } from 'vue';

const navigateToShop = () => navigateTo('/shop');
const navigateToCustomBox = () => navigateTo('/shop');

const images = [
  { src: '/slider1.jpg', alt: 'Fresh produce from Kibwezi farm' },
  { src: '/slider2.jpg', alt: 'YNDU fresh produce' },
  { src: '/slider3.jpg', alt: 'Farm fresh vegetables' },
  { src: '/slider4.jpg', alt: 'Fresh maize' },
  { src: '/slider5.jpg', alt: 'Organic vegetables' },
  { src: '/slider6.jpg', alt: 'Farm produce delivery' },
  { src: '/slider7.jpg', alt: 'Seasonal produce box' },
];

const currentIndex = ref(0);
let intervalId: ReturnType<typeof setInterval> | null = null;

const nextSlide = () => {
  currentIndex.value = (currentIndex.value + 1) % images.length;
};

const prevSlide = () => {
  currentIndex.value = (currentIndex.value - 1 + images.length) % images.length;
};

const goToSlide = (index: number) => {
  currentIndex.value = index;
};

onMounted(() => {
  intervalId = setInterval(nextSlide, 5000);
});

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
});
</script>

<template>
  <section class="relative rounded-2xl overflow-hidden mb-16 lg:mb-20 min-h-[500px] lg:h-[600px] flex items-center">
    <div class="absolute inset-0">
      <TransitionGroup name="carousel">
        <NuxtImg 
          v-for="(image, index) in images" 
          v-show="index === currentIndex"
          :key="image.src"
          :src="image.src" 
          :alt="image.alt"
          class="absolute inset-0 w-full h-full object-cover"
          :fetchpriority="index === 0 ? 'high' : 'auto'"
          :loading="index === 0 ? 'eager' : 'lazy'"
          format="webp"
          sizes="sm:100vw md:100vw lg:100vw"
          width="1920"
          height="1080"
        />
      </TransitionGroup>
    </div>
    
    <div class="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
    
    <button 
      @click="prevSlide"
      class="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/20 text-white p-2 rounded-full transition-all duration-200"
      aria-label="Previous slide"
    >
      <ChevronLeft :size="24" />
    </button>
    <button 
      @click="nextSlide"
      class="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/20 text-white p-2 rounded-full transition-all duration-200"
      aria-label="Next slide"
    >
      <ChevronRight :size="24" />
    </button>
    
    <div class="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
      <button 
        v-for="(_, index) in images" 
        :key="index"
        @click="goToSlide(index)"
        class="w-3 h-3 rounded-full transition-all duration-300"
        :class="index === currentIndex ? 'bg-white scale-110' : 'bg-white/40 hover:bg-white/60'"
        :aria-label="`Go to slide ${index + 1}`"
      />
    </div>
    
    <div class="relative z-10 px-8 md:px-16 max-w-2xl">
      <span class="inline-block bg-secondary-sage/90 text-white px-3 py-1 rounded-sm text-xs font-semibold uppercase tracking-wider mb-4">
        Direct from Kibwezi
      </span>
      
      <h2 class="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif leading-tight mb-6">
        Farm-to-Table Freshness to Your Doorstep
      </h2>
      
      <p class="text-white/90 text-lg md:text-xl mb-10 font-normal leading-relaxed">
        Experience the taste of Kenya with seasonal produce boxes hand-picked and delivered within hours.
      </p>
      
      <div class="flex flex-col sm:flex-row gap-4">
        <button
          @click="navigateToShop"
          class="bg-accent-clay hover:bg-primary-deep text-white font-medium py-4 px-8 rounded-sm text-base sm:text-lg transition-all duration-200 ease-in-out hover:-translate-y-0.5 w-full sm:w-auto"
        >
          Explore Shop
        </button>
        <button
          @click="navigateToCustomBox"
          class="bg-white/10 backdrop-blur-md text-white border border-white/20 font-medium py-4 px-8 rounded-sm text-base sm:text-lg hover:bg-white/20 transition-all duration-200 ease-in-out flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <PlusCircle :size="18" />
          Create Your Own Box
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.carousel-enter-active,
.carousel-leave-active {
  transition: opacity 0.7s ease-in-out;
}

.carousel-enter-from,
.carousel-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
</style>