<script setup lang="ts">
import { computed, reactive } from 'vue';
import { RadioGroupRoot, RadioGroupItem } from 'reka-ui';
import { motion } from 'motion-v';
import {
  Leaf, Package, Users, Check, ArrowRight, Sparkles,
  MapPin, Calendar, Truck, Sun, Sunset,
} from 'lucide-vue-next';
import { useSubscriptionStore } from '../stores/subscription-store';
import {
  BOX_SIZE_CONFIG,
  FREQUENCY_CONFIG,
  DELIVERY_DAY_CONFIG,
  type SubscriptionBoxSize,
  type SubscriptionFrequency,
  type DeliveryDay,
} from '../types/subscription';

useSeoMeta({
  title: 'Subscribe | Yndu Fresh Produce',
  description: 'Get fresh produce delivered to your door. Pick your box, schedule, and address.',
});
definePageMeta({ middleware: ['auth'] });

const store = useSubscriptionStore();

// Data
const boxSizes = computed(() => [
  { value: 'SMALL' as SubscriptionBoxSize, ...BOX_SIZE_CONFIG.SMALL, icon: Leaf },
  { value: 'MEDIUM' as SubscriptionBoxSize, ...BOX_SIZE_CONFIG.MEDIUM, icon: Package, popular: true },
  { value: 'LARGE' as SubscriptionBoxSize, ...BOX_SIZE_CONFIG.LARGE, icon: Users },
]);

const frequencies = computed(() =>
  Object.entries(FREQUENCY_CONFIG).map(([key, val]) => ({
    value: key as SubscriptionFrequency,
    ...val,
  }))
);

const days = computed(() =>
  Object.entries(DELIVERY_DAY_CONFIG).map(([key, val]) => ({
    value: key as DeliveryDay,
    ...val,
  }))
);

const address = reactive({
  label: 'Home',
  street: '',
  apartment: '',
  neighborhood: '',
  city: 'Nairobi',
  instructions: '',
});

const isValid = computed(() =>
  store.boxSize && store.frequency && store.deliveryDay &&
  address.street && address.neighborhood && address.city
);

const formatPrice = (n: number) => `KSh ${n.toLocaleString()}`;

const handleSubscribe = async () => {
  if (!isValid.value) return;
  store.selectAddress({ ...address });
  store.isLoading = true;
  await new Promise(r => setTimeout(r, 1200));
  store.isLoading = false;
  navigateTo('/subscriptions');
};
</script>

<template>
  <div class="min-h-dvh bg-[var(--bg-canvas)]">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 py-5 sm:py-6">

      <!-- Header — one line -->
      <motion.div
        :initial="{ opacity: 0, y: 8 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.3 }"
        class="flex items-center justify-between mb-5"
      >
        <div>
          <h1 class="text-xl sm:text-2xl font-bold text-foundation tracking-tight text-balance">New Subscription</h1>
          <p class="text-xs text-neutral-400 mt-0.5">Fresh produce from Kibwezi farms, delivered to your door</p>
        </div>
        <div class="text-right">
          <p class="text-xl font-bold text-primary-deep">{{ formatPrice(store.pricing.finalPrice) }}</p>
          <p class="text-[10px] text-neutral-400">per delivery</p>
        </div>
      </motion.div>

      <!-- All sections in a 2-column grid on desktop -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <!-- ── LEFT: Box + Schedule ── -->
        <div class="space-y-4">

          <!-- Box Size -->
          <motion.section
            :initial="{ opacity: 0, y: 10 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ duration: 0.25, delay: 0.05 }"
            class="bg-white rounded-xl border border-neutral-100 p-4"
          >
            <h2 class="text-xs font-semibold text-neutral-600 uppercase tracking-wider mb-2.5">Box Size</h2>
            <RadioGroupRoot v-model="store.boxSize" class="space-y-2">
              <RadioGroupItem
                v-for="size in boxSizes"
                :key="size.value"
                :value="size.value"
                class="group relative w-full flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all outline-none
                  border-neutral-100 hover:border-primary-deep/30
                  data-[state=checked]:border-primary-deep data-[state=checked]:bg-primary-deep/5"
              >
                <div class="w-8 h-8 rounded-lg flex items-center justify-center bg-neutral-50 group-data-[state=checked]:bg-primary-deep/10">
                  <component :is="size.icon" :size="16" class="text-neutral-400 group-data-[state=checked]:text-primary-deep" />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-sm text-foundation">{{ size.name }}</span>
                    <span v-if="'popular' in size && size.popular" class="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase bg-primary-deep text-white">Popular</span>
                  </div>
                  <span class="text-[11px] text-neutral-400">{{ size.weightEstimate }} · {{ size.idealFor[0] }}</span>
                </div>
                <span class="font-bold text-sm text-primary-deep">{{ formatPrice(size.basePrice) }}</span>
                <div class="w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors border-neutral-300 group-data-[state=checked]:border-primary-deep">
                  <div class="w-2 h-2 rounded-full bg-primary-deep scale-0 group-data-[state=checked]:scale-100 transition-transform" />
                </div>
              </RadioGroupItem>
            </RadioGroupRoot>
          </motion.section>

          <!-- Frequency + Day -->
          <motion.section
            :initial="{ opacity: 0, y: 10 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ duration: 0.25, delay: 0.1 }"
            class="bg-white rounded-xl border border-neutral-100 p-4"
          >
            <h2 class="text-xs font-semibold text-neutral-600 uppercase tracking-wider mb-2.5">Schedule</h2>

            <label class="text-[11px] font-medium text-neutral-500 mb-1.5 block">How often?</label>
            <RadioGroupRoot v-model="store.frequency" class="flex gap-2 mb-3">
              <RadioGroupItem
                v-for="freq in frequencies"
                :key="freq.value"
                :value="freq.value"
                class="flex-1 relative px-2 py-2 rounded-lg border-2 cursor-pointer text-center transition-all outline-none text-xs font-medium
                  border-neutral-100 hover:border-primary-deep/30
                  data-[state=checked]:border-primary-deep data-[state=checked]:bg-primary-deep data-[state=checked]:text-white"
              >
                {{ freq.label }}
                <span v-if="freq.discount" class="absolute -top-1.5 -right-1.5 px-1 py-0.5 rounded text-[8px] font-bold bg-green-100 text-green-700">
                  -{{ freq.discount }}%
                </span>
              </RadioGroupItem>
            </RadioGroupRoot>

            <label class="text-[11px] font-medium text-neutral-500 mb-1.5 block">Which day?</label>
            <RadioGroupRoot v-model="store.deliveryDay" class="flex gap-1.5">
              <RadioGroupItem
                v-for="day in days"
                :key="day.value"
                :value="day.value"
                class="flex-1 py-2 rounded-lg border-2 cursor-pointer text-center transition-all outline-none text-[11px] font-medium
                  border-neutral-100 hover:border-primary-deep/30
                  data-[state=checked]:border-primary-deep data-[state=checked]:bg-primary-deep data-[state=checked]:text-white"
              >
                {{ day.label.slice(0, 3) }}
              </RadioGroupItem>
            </RadioGroupRoot>
          </motion.section>
        </div>

        <!-- ── RIGHT: Address + Summary ── -->
        <div class="space-y-4">

          <!-- Address -->
          <motion.section
            :initial="{ opacity: 0, y: 10 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ duration: 0.25, delay: 0.15 }"
            class="bg-white rounded-xl border border-neutral-100 p-4"
          >
            <h2 class="text-xs font-semibold text-neutral-600 uppercase tracking-wider mb-2.5">Delivery Address</h2>
            <div class="space-y-2.5">
              <div class="grid grid-cols-2 gap-2.5">
                <div>
                  <label class="text-[11px] font-medium text-neutral-500 mb-1 block">Street *</label>
                  <input v-model="address.street" placeholder="123 Karen Road"
                    class="w-full px-2.5 py-2 rounded-lg border border-neutral-200 text-sm bg-neutral-50/50 focus:outline-none focus:ring-2 focus:ring-primary-deep/30 focus:border-primary-deep/40" />
                </div>
                <div>
                  <label class="text-[11px] font-medium text-neutral-500 mb-1 block">Apartment</label>
                  <input v-model="address.apartment" placeholder="Apt 4B"
                    class="w-full px-2.5 py-2 rounded-lg border border-neutral-200 text-sm bg-neutral-50/50 focus:outline-none focus:ring-2 focus:ring-primary-deep/30 focus:border-primary-deep/40" />
                </div>
              </div>
              <div class="grid grid-cols-2 gap-2.5">
                <div>
                  <label class="text-[11px] font-medium text-neutral-500 mb-1 block">Neighborhood *</label>
                  <input v-model="address.neighborhood" placeholder="Karen"
                    class="w-full px-2.5 py-2 rounded-lg border border-neutral-200 text-sm bg-neutral-50/50 focus:outline-none focus:ring-2 focus:ring-primary-deep/30 focus:border-primary-deep/40" />
                </div>
                <div>
                  <label class="text-[11px] font-medium text-neutral-500 mb-1 block">City *</label>
                  <input v-model="address.city" placeholder="Nairobi"
                    class="w-full px-2.5 py-2 rounded-lg border border-neutral-200 text-sm bg-neutral-50/50 focus:outline-none focus:ring-2 focus:ring-primary-deep/30 focus:border-primary-deep/40" />
                </div>
              </div>
              <div>
                <label class="text-[11px] font-medium text-neutral-500 mb-1 block">Delivery instructions</label>
                <input v-model="address.instructions" placeholder="Gate code, landmarks..."
                  class="w-full px-2.5 py-2 rounded-lg border border-neutral-200 text-sm bg-neutral-50/50 focus:outline-none focus:ring-2 focus:ring-primary-deep/30 focus:border-primary-deep/40" />
              </div>
            </div>
          </motion.section>

          <!-- Summary + CTA -->
          <motion.section
            :initial="{ opacity: 0, y: 10 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ duration: 0.25, delay: 0.2 }"
            class="bg-foundation rounded-xl p-4 text-white"
          >
            <h2 class="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3">Summary</h2>
            <div class="space-y-1.5 text-xs mb-4">
              <div class="flex justify-between"><span class="text-white/50">Box</span><span class="font-medium">{{ BOX_SIZE_CONFIG[store.boxSize]?.name || '—' }}</span></div>
              <div class="flex justify-between"><span class="text-white/50">Schedule</span><span class="font-medium">{{ FREQUENCY_CONFIG[store.frequency]?.label || '—' }} · {{ DELIVERY_DAY_CONFIG[store.deliveryDay]?.label || '—' }}</span></div>
              <div class="flex justify-between"><span class="text-white/50">Delivery</span><span class="font-medium">{{ address.neighborhood || '—' }}, {{ address.city || '—' }}</span></div>
              <div v-if="store.pricing.frequencyDiscount > 0 || store.pricing.paymentModeDiscount > 0" class="flex justify-between text-green-400">
                <span>Discounts</span><span class="font-medium">-{{ formatPrice(store.pricing.basePrice - store.pricing.finalPrice) }}</span>
              </div>
              <div class="flex justify-between pt-1.5 border-t border-white/10">
                <span class="font-semibold">Total per delivery</span>
                <span class="font-bold text-base text-primary-deep">{{ formatPrice(store.pricing.finalPrice) }}</span>
              </div>
            </div>

            <button
              @click="handleSubscribe"
              :disabled="!isValid || store.isLoading"
              class="w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer
                bg-primary-deep text-white
                hover:bg-primary-deep/90 hover:shadow-lg hover:shadow-primary-deep/25
                disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
            >
              <template v-if="store.isLoading">Creating...</template>
              <template v-else>
                <Sparkles :size="16" />
                Start Subscription
              </template>
            </button>
          </motion.section>
        </div>
      </div>

    </div>
  </div>
</template>
