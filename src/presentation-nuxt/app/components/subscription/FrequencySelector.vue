<script setup lang="ts">
import { computed } from 'vue';
import { RadioGroupRoot, RadioGroupItem } from 'reka-ui';
import { Check, Calendar, CalendarDays, CalendarRange } from 'lucide-vue-next';
import { motion } from 'motion-v';
import { useSubscriptionStore } from '../../stores/subscription-store';
import { FREQUENCY_CONFIG, type SubscriptionFrequency } from '../../types/subscription';

const store = useSubscriptionStore();

const frequencies = computed(() => [
  {
    value: 'WEEKLY' as SubscriptionFrequency,
    ...FREQUENCY_CONFIG.WEEKLY,
    icon: Calendar,
  },
  {
    value: 'BIWEEKLY' as SubscriptionFrequency,
    ...FREQUENCY_CONFIG.BIWEEKLY,
    icon: CalendarDays,
  },
  {
    value: 'MONTHLY' as SubscriptionFrequency,
    ...FREQUENCY_CONFIG.MONTHLY,
    icon: CalendarRange,
  },
]);
</script>

<template>
  <div>
    <h3 class="text-xl font-bold text-foundation mb-2">Delivery Frequency</h3>
    <p class="text-sm text-neutral-500 mb-6">How often would you like your box delivered?</p>

    <RadioGroupRoot
      v-model="store.frequency"
      class="grid grid-cols-1 sm:grid-cols-3 gap-4"
    >
      <motion.div
        v-for="(freq, index) in frequencies"
        :key="freq.value"
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.3, delay: index * 0.1 }"
      >
        <RadioGroupItem
          :value="freq.value"
          as-child
        >
          <div
            class="group relative w-full p-5 rounded-2xl border-2 transition-all duration-300 outline-none focus:ring-4 focus:ring-primary-deep/20 text-left cursor-pointer bg-white dark:bg-zinc-900 border-neutral-100 dark:border-zinc-800 hover:border-primary-deep/30 hover:shadow-lg data-[state=checked]:border-primary-deep data-[state=checked]:shadow-xl data-[state=checked]:shadow-primary-deep/10"
          >
          <!-- Check Indicator -->
          <div class="absolute top-4 right-4 opacity-0 group-data-[state=checked]:opacity-100 transition-all duration-300 bg-primary-deep text-white rounded-full p-1">
            <Check :size="16" stroke-width="3" />
          </div>

          <!-- Icon -->
          <div 
            class="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors duration-300 bg-neutral-100 text-neutral-500 group-data-[state=checked]:bg-primary-deep group-data-[state=checked]:text-white"
          >
            <component :is="freq.icon" :size="24" />
          </div>

          <!-- Content -->
          <h4 class="font-bold text-lg text-foundation mb-1">{{ freq.label }}</h4>
          <p class="text-sm text-neutral-500 mb-3">{{ freq.description }}</p>

          <!-- Discount Badge -->
          <div v-if="freq.discount > 0" class="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary-deep/10 text-primary-deep text-xs font-bold">
            Save {{ freq.discount }}%
          </div>
          <div v-else class="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-neutral-100 text-neutral-400 text-xs font-medium">
            Standard price
          </div>
        </div>
      </RadioGroupItem>
      </motion.div>
    </RadioGroupRoot>
  </div>
</template>
