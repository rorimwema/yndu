<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const navigateToShop = () => router.push('/shop');
const navigateToCustomBox = () => router.push('/custom-box');
</script>

<template>
  <section class="relative rounded-xl overflow-hidden mb-16 h-[500px] flex items-center">
    <!-- Background Image -->
    <div 
      class="absolute inset-0 bg-cover bg-center"
      style="background-image: url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&auto=format&fit=crop');"
    />
    <div class="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
    
    <!-- Content -->
    <div class="relative z-10 px-8 md:px-16 max-w-2xl">
      <span class="inline-block bg-flexoki-primary text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
        Direct from Kibwezi
      </span>
      <h2 class="text-white text-4xl md:text-6xl font-black leading-tight mb-6">
        Farm-to-Table Freshness to Your Doorstep
      </h2>
      <p class="text-white/90 text-lg md:text-xl mb-8 font-medium">
        Experience the taste of Kenya with seasonal produce boxes hand-picked and delivered within hours.
      </p>
      <div class="flex flex-wrap gap-4">
        <button 
          @click="navigateToShop"
          class="btn-primary text-lg py-4 px-8 hover:scale-105 transition-transform"
        >
          Explore Shop
        </button>
        <button 
          @click="navigateToCustomBox"
          class="bg-white/10 backdrop-blur-md text-white border border-white/20 font-bold py-4 px-8 rounded-xl text-lg hover:bg-white/20 transition-all flex items-center gap-2"
        >
          <span>+</span> Create Your Own Box
        </button>
      </div>
    </div>
  </section>
</template>
