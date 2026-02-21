<script setup lang="ts">
import { computed } from 'vue';
import { RadioGroupRoot, RadioGroupItem } from 'reka-ui';
import { Check, Package, Users, ArrowRight, Leaf, Info, Truck, Shield, Sparkles } from 'lucide-vue-next';
import { motion } from 'motion-v';
import { useCustomBoxStore } from '../stores/custom-box-store';

const customBoxStore = useCustomBoxStore();

const sizes = [
  {
    id: 'SMALL',
    name: 'Small Box',
    tagline: 'Perfect Start',
    description: 'Ideal for individuals or couples. Gets you about 3kg of fresh produce weekly.',
    capacity: 12,
    capacityDesc: '~3kg of produce',
    price: 1500,
    pricePerSlot: 125,
    icon: Leaf,
    color: 'green',
    idealFor: ['1-2 people', 'Weekly cooking', 'Trying us out'],
  },
  {
    id: 'MEDIUM',
    name: 'Medium Box',
    tagline: 'Most Popular',
    description: 'Great for small families. Around 5kg of seasonal produce delivered fresh.',
    capacity: 20,
    capacityDesc: '~5kg of produce',
    price: 2500,
    pricePerSlot: 125,
    icon: Package,
    color: 'blue',
    idealFor: ['3-4 people', 'Active cooks', 'Weekly meals'],
    popular: true,
  },
  {
    id: 'LARGE',
    name: 'Large Box',
    tagline: 'Family Size',
    description: 'For larger families or plant-based households. About 7.5kg of goodness.',
    capacity: 30,
    capacityDesc: '~7.5kg of produce',
    price: 3500,
    pricePerSlot: 117,
    icon: Users,
    color: 'purple',
    idealFor: ['5+ people', 'Vegetarian/Vegan', 'Batch cooking'],
  },
];

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-KE', { 
    style: 'currency', 
    currency: 'KES', 
    minimumFractionDigits: 0 
  }).format(price).replace('KES', 'KSh');
};

const selectedSizeData = computed(() => sizes.find(s => s.id === customBoxStore.size));
</script>

<template>
  <div class="flex-1 flex flex-col">
    <!-- Hero Section -->
    <div class="bg-gradient-to-b from-primary-deep/5 to-transparent py-12 md:py-16">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          :initial="{ opacity: 0, y: 20 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.5 }"
        >
          <span class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-deep/10 text-primary-deep text-sm font-medium mb-6">
            <Leaf :size="16" />
            Fresh from Kibwezi Farms
          </span>
          <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold text-foundation mb-6 tracking-tight">
            Choose Your Box Size
          </h1>
          <p class="text-lg md:text-xl text-neutral-500 max-w-2xl mx-auto leading-relaxed">
            Select the perfect box for your household. Each box uses a simple "slot" system — 
            think of slots as space for your produce. More slots = more variety!
          </p>
        </motion.div>
      </div>
    </div>

    <!-- Size Selection Cards -->
    <div class="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 w-full">
      <RadioGroupRoot
        v-model="customBoxStore.size"
        class="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <motion.div
          v-for="(size, index) in sizes"
          :key="size.id"
          :initial="{ opacity: 0, y: 20 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.4, delay: index * 0.1 }"
        >
          <RadioGroupItem
            :value="size.id"
            class="group relative w-full h-full flex flex-col p-6 rounded-3xl border-2 transition-all duration-300 outline-none focus:ring-4 focus:ring-primary-deep/20 text-left cursor-pointer bg-white dark:bg-zinc-900 border-neutral-100 dark:border-zinc-800 hover:border-primary-deep/30 hover:shadow-lg data-[state=checked]:border-primary-deep data-[state=checked]:shadow-xl data-[state=checked]:shadow-primary-deep/10"
            :class="{ 'ring-2 ring-primary-deep/20': size.popular }"
          >
            <!-- Popular Badge -->
            <div v-if="size.popular" class="absolute -top-3 left-1/2 -translate-x-1/2">
              <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary-deep text-white text-xs font-bold uppercase tracking-wide">
                <Sparkles class="w-3 h-3" />
                Most Popular
              </span>
            </div>

            <!-- Check Indicator -->
            <div class="absolute top-4 right-4 opacity-0 group-data-[state=checked]:opacity-100 transition-all duration-300 bg-primary-deep text-white rounded-full p-1.5">
              <Check :size="16" stroke-width="3" />
            </div>

            <!-- Icon -->
            <div 
              class="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-colors duration-300"
              :class="[
                size.popular 
                  ? 'bg-primary-deep text-white group-data-[state=checked]:bg-primary-deep' 
                  : 'bg-neutral-100 text-neutral-500 group-data-[state=checked]:bg-primary-deep group-data-[state=checked]:text-white'
              ]"
            >
              <component :is="size.icon" :size="28" />
            </div>

            <!-- Content -->
            <div class="flex-1">
              <h3 class="text-xl font-bold text-foundation mb-1">{{ size.name }}</h3>
              <p class="text-sm font-medium text-primary-deep mb-3">{{ size.tagline }}</p>
              <p class="text-sm text-neutral-500 leading-relaxed mb-4">
                {{ size.description }}
              </p>

              <!-- Ideal For -->
              <div class="flex flex-wrap gap-1.5 mb-5">
                <span 
                  v-for="ideal in size.idealFor" 
                  :key="ideal"
                  class="text-xs px-2 py-1 rounded-md bg-neutral-50 dark:bg-zinc-800 text-neutral-500 dark:text-neutral-400 font-medium"
                >
                  {{ ideal }}
                </span>
              </div>
            </div>

            <!-- Divider -->
            <div class="border-t border-neutral-100 dark:border-zinc-800 pt-5 mt-auto">
              <div class="flex items-end justify-between mb-3">
                <div>
                  <span class="text-xs text-neutral-400 uppercase tracking-wide block mb-1">Capacity</span>
                  <div class="flex items-baseline gap-2">
                    <span class="text-2xl font-bold text-foundation">{{ size.capacity }}</span>
                    <span class="text-sm text-neutral-500">slots</span>
                  </div>
                  <span class="text-xs text-neutral-400">{{ size.capacityDesc }}</span>
                </div>
                <div class="text-right">
                  <span class="text-xs text-neutral-400 uppercase tracking-wide block mb-1">Price</span>
                  <span class="text-2xl font-bold text-primary-deep">{{ formatPrice(size.price) }}</span>
                  <span class="text-xs text-neutral-400 block">/week</span>
                </div>
              </div>
              <p class="text-xs text-neutral-400 text-center">
                ~{{ formatPrice(size.pricePerSlot) }} per slot
              </p>
            </div>
          </RadioGroupItem>
        </motion.div>
      </RadioGroupRoot>

      <!-- Info Cards -->
      <motion.div 
        class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8"
        :initial="{ opacity: 0 }"
        :animate="{ opacity: 1 }"
        :transition="{ duration: 0.4, delay: 0.4 }"
      >
        <div class="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-zinc-900 border border-neutral-100 dark:border-zinc-800">
          <div class="w-10 h-10 rounded-lg bg-primary-deep/10 flex items-center justify-center shrink-0">
            <Info class="text-primary-deep" :size="20" />
          </div>
          <div>
            <p class="font-semibold text-foundation text-sm">What's a slot?</p>
            <p class="text-xs text-neutral-400">Each slot holds ~250g of fresh produce</p>
          </div>
        </div>
        
        <div class="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-zinc-900 border border-neutral-100 dark:border-zinc-800">
          <div class="w-10 h-10 rounded-lg bg-primary-deep/10 flex items-center justify-center shrink-0">
            <Truck class="text-primary-deep" :size="20" />
          </div>
          <div>
            <p class="font-semibold text-foundation text-sm">Free Delivery</p>
            <p class="text-xs text-neutral-400">Every Tuesday & Friday in Nairobi</p>
          </div>
        </div>
        
        <div class="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-zinc-900 border border-neutral-100 dark:border-zinc-800">
          <div class="w-10 h-10 rounded-lg bg-primary-deep/10 flex items-center justify-center shrink-0">
            <Shield class="text-primary-deep" :size="20" />
          </div>
          <div>
            <p class="font-semibold text-foundation text-sm">Freshness Guaranteed</p>
            <p class="text-xs text-neutral-400">48-hour freshness promise</p>
          </div>
        </div>
      </motion.div>

      <!-- CTA Button -->
      <motion.div 
        class="flex justify-center mt-10"
        :initial="{ opacity: 0, y: 10 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.4, delay: 0.5 }"
      >
        <button 
          @click="customBoxStore.step = 2"
          class="group relative bg-primary-deep text-white px-10 py-5 rounded-2xl text-lg font-bold shadow-lg shadow-primary-deep/25 hover:shadow-xl hover:shadow-primary-deep/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 flex items-center gap-3"
        >
          <span>Build My {{ selectedSizeData?.name }}</span>
          <ArrowRight :size="22" class="group-hover:translate-x-1 transition-transform duration-300" />
        </button>
      </motion.div>

      <!-- Trust Indicators -->
      <motion.div 
        class="text-center mt-6"
        :initial="{ opacity: 0 }"
        :animate="{ opacity: 1 }"
        :transition="{ duration: 0.4, delay: 0.6 }"
      >
        <p class="text-sm text-neutral-400">
          Skip, pause, or cancel anytime. No commitment required.
        </p>
      </motion.div>
    </div>
  </div>
</template>
