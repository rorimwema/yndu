<script setup lang="ts">
import { computed } from 'vue';
import { RadioGroupRoot, RadioGroupItem } from 'reka-ui';
import { Check, Sun, Sunset } from 'lucide-vue-next';
import { motion } from 'motion-v';
import { useSubscriptionStore } from '../../stores/subscription-store';
import { DELIVERY_DAY_CONFIG, type DeliveryDay } from '../../types/subscription';

const store = useSubscriptionStore();

const deliveryDays = computed(() => [
  {
    value: 'TUESDAY' as DeliveryDay,
    ...DELIVERY_DAY_CONFIG.TUESDAY,
    icon: Sun,
    theme: 'morning',
  },
  {
    value: 'FRIDAY' as DeliveryDay,
    ...DELIVERY_DAY_CONFIG.FRIDAY,
    icon: Sunset,
    theme: 'afternoon',
  },
]);
</script>

<template>
  <div>
    <h3 class="text-xl font-bold text-foundation mb-2">Delivery Day</h3>
    <p class="text-sm text-neutral-500 mb-6">Choose your preferred delivery day</p>

    <RadioGroupRoot
      v-model="store.deliveryDay"
      class="grid grid-cols-1 sm:grid-cols-2 gap-4"
    >
      <motion.div
        v-for="(day, index) in deliveryDays"
        :key="day.value"
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.3, delay: index * 0.1 }"
      >
        <RadioGroupItem
          :value="day.value"
          as-child
        >
          <div
            class="group relative w-full p-5 rounded-2xl border-2 transition-all duration-300 outline-none focus:ring-4 focus:ring-primary-deep/20 text-left cursor-pointer bg-white dark:bg-zinc-900 border-neutral-100 dark:border-zinc-800 hover:border-primary-deep/30 hover:shadow-lg data-[state=checked]:border-primary-deep data-[state=checked]:shadow-xl data-[state=checked]:shadow-primary-deep/10"
          >
          <!-- Check Indicator -->
          <div class="absolute top-4 right-4 opacity-0 group-data-[state=checked]:opacity-100 transition-all duration-300 bg-primary-deep text-white rounded-full p-1">
            <Check :size="16" stroke-width="3" />
          </div>

          <div class="flex items-start gap-4">
            <!-- Icon -->
            <div 
              class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-300"
              :class="[
                day.theme === 'morning' 
                  ? 'bg-amber-100 text-amber-600 group-data-[state=checked]:bg-amber-500 group-data-[state=checked]:text-white'
                  : 'bg-orange-100 text-orange-600 group-data-[state=checked]:bg-orange-500 group-data-[state=checked]:text-white'
              ]"
            >
              <component :is="day.icon" :size="24" />
            </div>

            <!-- Content -->
            <div class="flex-1">
              <h4 class="font-bold text-lg text-foundation mb-1">{{ day.label }}</h4>
              <p class="text-sm text-neutral-500 mb-2">{{ day.description }}</p>
              
              <!-- Time Badge -->
              <div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 text-neutral-600 text-xs font-medium">
                <span class="w-2 h-2 rounded-full" :class="day.theme === 'morning' ? 'bg-amber-500' : 'bg-orange-500'" />
                {{ day.timeRange }}
              </div>
            </div>
          </div>
        </div>
      </RadioGroupItem>
      </motion.div>
    </RadioGroupRoot>

    <!-- Delivery Info -->
    <div class="mt-6 p-4 rounded-xl bg-neutral-50 dark:bg-zinc-800/50 border border-neutral-100 dark:border-zinc-800">
      <div class="flex items-start gap-3">
        <div class="w-8 h-8 rounded-lg bg-primary-deep/10 flex items-center justify-center shrink-0">
          <Sun class="text-primary-deep" :size="16" />
        </div>
        <div>
          <p class="text-sm font-medium text-foundation">Free Delivery</p>
          <p class="text-xs text-neutral-400 mt-0.5">
            We deliver every Tuesday and Friday in the Nairobi area. 
            Order by 10 AM the day before for same-week delivery.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
