<script setup lang="ts">
import { motion } from 'motion-v';
import SeasonalCalendar from '~/components/SeasonalCalendar.vue';

// Page metadata
useHead({
  title: 'Seasonal Calendar',
  meta: [
    { name: 'description', content: 'Discover what fresh produce is in season throughout the year. Plan your meals with our seasonal harvest calendar.' }
  ]
});
</script>

<template>
  <div class="min-h-screen bg-[#F0EEE9]">
    <!-- Hero Section -->
    <section class="relative py-16 sm:py-20 lg:py-24 overflow-hidden">
      <!-- Background Pattern -->
      <div class="absolute inset-0 opacity-30">
        <div class="absolute top-20 left-10 w-64 h-64 bg-[#66800b]/10 rounded-full blur-3xl" />
        <div class="absolute bottom-20 right-10 w-96 h-96 bg-[#66800b]/5 rounded-full blur-3xl" />
      </div>

      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Breadcrumb -->
        <motion.nav
          class="flex items-center gap-2 text-sm text-[#546a54] mb-8"
          :initial="{ opacity: 0, x: -20 }"
          :animate="{ opacity: 1, x: 0 }"
          :transition="{ duration: 0.4 }"
        >
          <NuxtLink to="/" class="hover:text-[#66800b] transition-colors">Home</NuxtLink>
          <span>/</span>
          <span class="text-[#111811] font-medium">Seasonal Calendar</span>
        </motion.nav>

        <!-- Calendar Component -->
        <SeasonalCalendar />
      </div>
    </section>

    <!-- Benefits Section -->
    <section class="py-16 sm:py-20 bg-white/30">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          class="text-center mb-12"
          :initial="{ opacity: 0, y: 20 }"
          :while-in-view="{ opacity: 1, y: 0 }"
          :viewport="{ once: true }"
          :transition="{ duration: 0.5 }"
        >
          <h2 class="text-2xl sm:text-3xl font-bold text-[#111811] mb-4">
            Why Eat Seasonally?
          </h2>
          <p class="text-[#546a54] max-w-2xl mx-auto">
            Eating with the seasons offers numerous benefits for your health, wallet, and the environment.
          </p>
        </motion.div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            v-for="(benefit, index) in [
              { icon: '🌱', title: 'Better Flavor', desc: 'Produce harvested at peak ripeness tastes amazing' },
              { icon: '💰', title: 'Save Money', desc: 'Seasonal produce is more abundant and affordable' },
              { icon: '🌿', title: 'More Nutritious', desc: 'Fresher produce retains more vitamins and minerals' },
              { icon: '🌍', title: 'Eco-Friendly', desc: 'Reduces transportation and storage emissions' }
            ]"
            :key="benefit.title"
            class="glass-card p-6 text-center hover:shadow-lg transition-shadow"
            :initial="{ opacity: 0, y: 20 }"
            :while-in-view="{ opacity: 1, y: 0 }"
            :viewport="{ once: true }"
            :transition="{ duration: 0.4, delay: index * 0.1 }"
          >
            <div class="text-4xl mb-4">{{ benefit.icon }}</div>
            <h3 class="font-bold text-lg text-[#111811] mb-2">{{ benefit.title }}</h3>
            <p class="text-sm text-[#546a54]">{{ benefit.desc }}</p>
          </motion.div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-16 sm:py-20">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          class="glass-card p-8 sm:p-12 text-center"
          :initial="{ opacity: 0, scale: 0.95 }"
          :while-in-view="{ opacity: 1, scale: 1 }"
          :viewport="{ once: true }"
          :transition="{ duration: 0.5 }"
        >
          <h2 class="text-2xl sm:text-3xl font-bold text-[#111811] mb-4">
            Ready to Eat Fresh?
          </h2>
          <p class="text-[#546a54] mb-8 max-w-xl mx-auto">
            Browse our selection of farm-fresh seasonal produce and have it delivered straight to your door.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <NuxtLink
              to="/shop"
              class="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#66800b] text-white font-semibold rounded-xl hover:bg-[#4d6008] transition-colors"
            >
              Shop Seasonal Produce
              <span class="text-lg">→</span>
            </NuxtLink>
            <NuxtLink
              to="/shop"
              class="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#66800b] font-semibold rounded-xl border-2 border-[#66800b] hover:bg-[#66800b]/5 transition-colors"
            >
              Build Your Box
            </NuxtLink>
          </div>
        </motion.div>
      </div>
    </section>
  </div>
</template>
