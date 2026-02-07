<script setup lang="ts">
import { motion } from 'motion-v';
import { Settings, ArrowRight } from 'lucide-vue-next';

const navigateToCustom = () => navigateTo('/custom-box');
</script>

<template>
  <component
    :is="motion.section"
    class="text-center bg-flexoki border border-flexoki-primary/20 rounded-2xl py-12 px-6 mb-16"
    :initial="{ opacity: 0, scale: 0.95 }"
    :while-in-view="{ opacity: 1, scale: 1 }"
    :viewport="{ once: true, margin: '-100px' }"
    :transition="{ duration: 0.5, ease: 'easeOut' }"
  >
    <component
      :is="motion.div"
      class="mb-4"
      :initial="{ opacity: 0, scale: 0 }"
      :while-in-view="{ opacity: 1, scale: 1 }"
      :viewport="{ once: true }"
      :transition="{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }"
    >
      <Settings :size="48" class="text-flexoki-primary" />
    </component>
    
    <component
      :is="motion.h3"
      class="text-3xl font-black mb-4 text-flexoki"
      :initial="{ opacity: 0, y: 20 }"
      :while-in-view="{ opacity: 1, y: 0 }"
      :viewport="{ once: true }"
      :transition="{ duration: 0.4, delay: 0.2 }"
    >
      Not seeing your perfect mix?
    </component>
    
    <component
      :is="motion.p"
      class="text-lg text-flexoki-muted max-w-xl mx-auto mb-8"
      :initial="{ opacity: 0, y: 20 }"
      :while-in-view="{ opacity: 1, y: 0 }"
      :viewport="{ once: true }"
      :transition="{ duration: 0.4, delay: 0.3 }"
    >
      Customize every single item. Select exactly what you need and we'll pack it fresh from the Kibwezi fields for you.
    </component>
    
    <component
      :is="motion.button"
      @click="navigateToCustom"
      class="bg-flexoki-black text-white font-bold py-4 px-10 rounded-xl text-lg hover:scale-105 transition-transform flex items-center gap-3 mx-auto"
      :initial="{ opacity: 0, y: 20 }"
      :while-in-view="{ opacity: 1, y: 0 }"
      :viewport="{ once: true }"
      :transition="{ duration: 0.4, delay: 0.4 }"
      :while-hover="{ scale: 1.05, y: -2 }"
      :while-press="{ scale: 0.95 }"
    >
      Create Your Own Box
      <ArrowRight :size="18" />
    </component>
  </component>
</template>
