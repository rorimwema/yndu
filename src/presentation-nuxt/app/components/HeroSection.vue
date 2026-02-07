<script setup lang="ts">
import { PlusCircle } from 'lucide-vue-next';
import { motion } from 'motion-v';

const navigateToShop = () => navigateTo('/shop');
const navigateToCustomBox = () => navigateTo('/custom-box');
</script>

<template>
  <section class="relative rounded-xl overflow-hidden mb-12 lg:mb-16 min-h-[500px] lg:h-[600px] flex items-center">
    <!-- Background Image -->
    <component
      :is="motion.div"
      class="absolute inset-0 bg-cover bg-center"
      style="background-image: url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&auto=format&fit=crop');"
      :initial="{ scale: 1.1 }"
      :animate="{ scale: 1 }"
      :transition="{ duration: 1.2, ease: 'easeOut' }"
    />
    <div class="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
    
    <!-- Content -->
    <div class="relative z-10 px-8 md:px-16 max-w-2xl">
      <component
        :is="motion.span"
        class="inline-block bg-flexoki-primary text-flexoki-900 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4"
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.5, delay: 0.2 }"
      >
        Direct from Kibwezi
      </component>
      
      <component
        :is="motion.h2"
        class="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-6"
        :initial="{ opacity: 0, y: 30 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.6, delay: 0.3 }"
      >
        Farm-to-Table Freshness to Your Doorstep
      </component>
      
      <component
        :is="motion.p"
        class="text-white/90 text-lg md:text-xl mb-8 font-medium"
        :initial="{ opacity: 0, y: 30 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.6, delay: 0.4 }"
      >
        Experience the taste of Kenya with seasonal produce boxes hand-picked and delivered within hours.
      </component>
      
      <component
        :is="motion.div"
        class="flex flex-col sm:flex-row gap-4"
        :initial="{ opacity: 0, y: 30 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.6, delay: 0.5 }"
      >
        <component
          :is="motion.button"
          @click="navigateToShop"
          class="bg-flexoki-primary hover:bg-flexoki-primary/90 text-flexoki-900 font-bold py-4 px-8 rounded-xl text-base sm:text-lg hover:scale-105 transition-all w-full sm:w-auto"
          :while-hover="{ scale: 1.05, y: -2 }"
          :while-press="{ scale: 0.95 }"
          :transition="{ type: 'spring', stiffness: 400, damping: 15 }"
        >
          Explore Shop
        </component>
        <component
          :is="motion.button"
          @click="navigateToCustomBox"
          class="bg-white/10 backdrop-blur-md text-white border border-white/20 font-bold py-4 px-8 rounded-xl text-base sm:text-lg hover:bg-white/20 transition-all flex items-center justify-center gap-2 w-full sm:w-auto"
          :while-hover="{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.2)' }"
          :while-press="{ scale: 0.95 }"
          :transition="{ type: 'spring', stiffness: 400, damping: 15 }"
        >
          <PlusCircle :size="18" />
          Create Your Own Box
        </component>
      </component>
    </div>
  </section>
</template>
