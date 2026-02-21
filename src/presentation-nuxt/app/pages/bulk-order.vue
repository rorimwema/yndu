<script setup lang="ts">
import { ref, computed } from 'vue';
import { RadioGroupRoot, RadioGroupItem, SwitchRoot, SwitchThumb } from 'reka-ui';
import { motion } from 'motion-v';
import {
  Building2, Utensils, Package, Truck, Scale,
  Check, BadgeCheck, ArrowRight, Sparkles,
  Hotel, Coffee, GraduationCap, School, HeartPulse,
  Landmark, HandHeart, ShoppingBag, MoreHorizontal,
  Repeat,
} from 'lucide-vue-next';

useSeoMeta({
  title: 'Bulk Order | Yndu Fresh Produce',
  description: 'Place bulk orders for farm-fresh produce. Volume pricing for hotels, restaurants, institutions.',
});
definePageMeta({ middleware: ['auth'] });

// ─── Form state ─────────────────────────────────────────────
const form = ref({
  businessName: '',
  businessType: '',
  contactName: '',
  email: '',
  phone: '',
  volume: '',
  categories: [] as string[],
  deliveryAddress: '',
  deliveryDate: '',
  deliveryTime: '',
  paymentTerms: '',
  notes: '',
  isRecurring: false,
  frequency: 'WEEKLY',
  preferredDay: 'MON',
});

const isSubmitting = ref(false);
const showSuccess = ref(false);

// ─── Data ───────────────────────────────────────────────────
const businessTypes = [
  { value: 'hotel', label: 'Hotel', icon: Hotel },
  { value: 'restaurant', label: 'Restaurant', icon: Utensils },
  { value: 'cafe', label: 'Café', icon: Coffee },
  { value: 'school', label: 'School', icon: GraduationCap },
  { value: 'university', label: 'University', icon: School },
  { value: 'hospital', label: 'Hospital', icon: HeartPulse },
  { value: 'corporate', label: 'Corporate', icon: Building2 },
  { value: 'government', label: 'Government', icon: Landmark },
  { value: 'ngo', label: 'NGO', icon: HandHeart },
  { value: 'retail', label: 'Retail', icon: ShoppingBag },
  { value: 'other', label: 'Other', icon: MoreHorizontal },
];

const volumeOptions = [
  { value: 'small', label: '50–100 kg', discount: '5%' },
  { value: 'medium', label: '100–300 kg', discount: '10%' },
  { value: 'large', label: '300–500 kg', discount: '15%' },
  { value: 'xlarge', label: '500 kg+', discount: 'Custom' },
];

const produceCategories = [
  { id: 'leafy', label: 'Leafy Greens' },
  { id: 'cruciferous', label: 'Cruciferous' },
  { id: 'root', label: 'Root Veg' },
  { id: 'alliums', label: 'Alliums' },
  { id: 'nightshades', label: 'Nightshades' },
  { id: 'squash', label: 'Squash' },
  { id: 'herbs', label: 'Herbs' },
  { id: 'fruits', label: 'Fruits' },
  { id: 'grains', label: 'Grains' },
  { id: 'legumes', label: 'Legumes' },
];

const timeSlots = [
  { value: 'early', label: '6–8 AM' },
  { value: 'morning', label: '8 AM–12 PM' },
  { value: 'afternoon', label: '12–4 PM' },
  { value: 'evening', label: '4–6 PM' },
];

const paymentOptions = [
  { value: 'cash', label: 'Cash' },
  { value: 'mpesa', label: 'M-Pesa' },
  { value: 'invoice-14', label: 'Invoice 14d' },
  { value: 'invoice-30', label: 'Invoice 30d' },
  { value: 'lpo', label: 'LPO' },
];

const dayOptions = ['MON', 'TUE', 'WED', 'THU', 'FRI'];
const freqOptions = [
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'BIWEEKLY', label: 'Bi-weekly' },
  { value: 'MONTHLY', label: 'Monthly' },
];

// ─── Helpers ────────────────────────────────────────────────
const toggleCategory = (id: string) => {
  const idx = form.value.categories.indexOf(id);
  idx > -1 ? form.value.categories.splice(idx, 1) : form.value.categories.push(id);
};

const today = new Date().toISOString().split('T')[0];

const isValid = computed(() => !!(
  form.value.businessName && form.value.businessType &&
  form.value.contactName && form.value.email && form.value.phone &&
  form.value.volume && form.value.categories.length > 0 &&
  form.value.deliveryAddress && form.value.deliveryDate && form.value.deliveryTime
));

const handleSubmit = async () => {
  if (!isValid.value) return;
  isSubmitting.value = true;
  await new Promise(r => setTimeout(r, 1500));
  isSubmitting.value = false;
  showSuccess.value = true;
};

const inputClass = 'w-full px-2.5 py-2 rounded-lg border border-neutral-200 text-sm bg-neutral-50/50 focus:outline-none focus:ring-2 focus:ring-primary-deep/30 focus:border-primary-deep/40';
</script>

<template>
  <div class="min-h-dvh bg-[var(--bg-canvas)]">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 py-5 sm:py-6">

      <!-- Header -->
      <motion.div
        :initial="{ opacity: 0, y: 8 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.3 }"
        class="flex items-center justify-between mb-5"
      >
        <div>
          <div class="flex items-center gap-1.5 text-[10px] text-neutral-400 mb-0.5">
            <BadgeCheck :size="12" class="text-primary-deep" />
            B2B Wholesale · Volume Pricing
          </div>
          <h1 class="text-xl sm:text-2xl font-bold text-foundation tracking-tight text-balance">Bulk Order Request</h1>
        </div>
        <div class="flex gap-2 text-[10px]">
          <span class="px-2 py-1 rounded-md bg-green-100 text-green-700 font-bold">Free delivery</span>
          <span class="px-2 py-1 rounded-md bg-neutral-100 text-neutral-600 font-bold">24h quote</span>
        </div>
      </motion.div>

      <!-- Success -->
      <div v-if="showSuccess" class="text-center py-16">
        <div class="w-14 h-14 mx-auto mb-3 rounded-full bg-primary-deep/10 flex items-center justify-center">
          <BadgeCheck :size="28" class="text-primary-deep" />
        </div>
        <h2 class="text-xl font-bold text-foundation text-balance mb-1">Order Submitted!</h2>
        <p class="text-xs text-neutral-400 mb-5">We'll contact you within 24 hours with a custom quote.</p>
        <div class="flex gap-2 justify-center">
          <button @click="showSuccess = false" class="px-4 py-2 rounded-lg bg-primary-deep text-white text-xs font-medium cursor-pointer">Place Another</button>
          <NuxtLink to="/" class="px-4 py-2 rounded-lg border border-neutral-200 text-xs font-medium text-neutral-600">Home</NuxtLink>
        </div>
      </div>

      <!-- Form — 3-column grid -->
      <form v-else @submit.prevent="handleSubmit" class="grid grid-cols-1 lg:grid-cols-3 gap-4">

        <!-- ── COL 1: Business ── -->
        <motion.div
          :initial="{ opacity: 0, y: 10 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.25, delay: 0.05 }"
          class="bg-white rounded-xl border border-neutral-100 p-4 space-y-3"
        >
          <h2 class="text-xs font-semibold text-neutral-600 uppercase tracking-wider">Business</h2>

          <!-- Business type grid -->
          <div>
            <label class="text-[11px] font-medium text-neutral-500 mb-1.5 block">Type *</label>
            <RadioGroupRoot v-model="form.businessType" class="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
              <RadioGroupItem
                v-for="bt in businessTypes"
                :key="bt.value"
                :value="bt.value"
                class="group flex flex-col items-center gap-0.5 p-2 rounded-lg border cursor-pointer transition-all outline-none
                  border-neutral-100 hover:border-primary-deep/30
                  data-[state=checked]:border-primary-deep data-[state=checked]:bg-primary-deep/5"
              >
                <component :is="bt.icon" :size="14" class="text-neutral-400 group-data-[state=checked]:text-primary-deep" />
                <span class="text-[9px] font-medium text-neutral-500 group-data-[state=checked]:text-primary-deep">{{ bt.label }}</span>
              </RadioGroupItem>
            </RadioGroupRoot>
          </div>

          <div>
            <label class="text-[11px] font-medium text-neutral-500 mb-1 block">Business Name *</label>
            <input v-model="form.businessName" :class="inputClass" placeholder="e.g., Serena Hotel" />
          </div>
          <div>
            <label class="text-[11px] font-medium text-neutral-500 mb-1 block">Contact Person *</label>
            <input v-model="form.contactName" :class="inputClass" placeholder="Full name" />
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="text-[11px] font-medium text-neutral-500 mb-1 block">Email *</label>
              <input v-model="form.email" type="email" :class="inputClass" placeholder="orders@co.ke" />
            </div>
            <div>
              <label class="text-[11px] font-medium text-neutral-500 mb-1 block">Phone *</label>
              <input v-model="form.phone" type="tel" :class="inputClass" placeholder="+254 7XX" />
            </div>
          </div>

          <div>
            <label class="text-[11px] font-medium text-neutral-500 mb-1.5 block">Payment</label>
            <RadioGroupRoot v-model="form.paymentTerms" class="flex flex-wrap gap-1">
              <RadioGroupItem
                v-for="pt in paymentOptions"
                :key="pt.value"
                :value="pt.value"
                class="px-2 py-1 rounded-md border cursor-pointer text-[10px] font-medium transition-all outline-none
                  border-neutral-200 text-neutral-500 hover:border-primary-deep/30
                  data-[state=checked]:border-primary-deep data-[state=checked]:bg-primary-deep data-[state=checked]:text-white"
              >
                {{ pt.label }}
              </RadioGroupItem>
            </RadioGroupRoot>
          </div>
        </motion.div>

        <!-- ── COL 2: Order ── -->
        <motion.div
          :initial="{ opacity: 0, y: 10 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.25, delay: 0.1 }"
          class="bg-white rounded-xl border border-neutral-100 p-4 space-y-3"
        >
          <h2 class="text-xs font-semibold text-neutral-600 uppercase tracking-wider">Order</h2>

          <!-- Volume -->
          <div>
            <label class="text-[11px] font-medium text-neutral-500 mb-1.5 block">Volume *</label>
            <RadioGroupRoot v-model="form.volume" class="grid grid-cols-2 gap-2">
              <RadioGroupItem
                v-for="vol in volumeOptions"
                :key="vol.value"
                :value="vol.value"
                class="group relative p-2.5 rounded-lg border-2 cursor-pointer transition-all outline-none
                  border-neutral-100 hover:border-primary-deep/30
                  data-[state=checked]:border-primary-deep data-[state=checked]:bg-primary-deep/5"
              >
                <p class="font-bold text-xs text-foundation">{{ vol.label }}</p>
                <span class="absolute top-1.5 right-1.5 px-1 py-0.5 rounded text-[8px] font-bold bg-green-100 text-green-700">{{ vol.discount }}</span>
              </RadioGroupItem>
            </RadioGroupRoot>
          </div>

          <!-- Categories -->
          <div>
            <label class="text-[11px] font-medium text-neutral-500 mb-1.5 block">Categories * <span class="text-neutral-400 font-normal">({{ form.categories.length }} selected)</span></label>
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="cat in produceCategories"
                :key="cat.id"
                type="button"
                @click="toggleCategory(cat.id)"
                class="px-2.5 py-1.5 rounded-lg border text-[11px] font-medium transition-all cursor-pointer"
                :class="form.categories.includes(cat.id)
                  ? 'border-primary-deep bg-primary-deep text-white'
                  : 'border-neutral-200 text-neutral-500 hover:border-primary-deep/30'"
              >
                {{ cat.label }}
              </button>
            </div>
          </div>

          <!-- Notes -->
          <div>
            <label class="text-[11px] font-medium text-neutral-500 mb-1 block">Special requirements</label>
            <textarea v-model="form.notes" rows="2" :class="inputClass" class="resize-none" placeholder="Varieties, packaging..." />
          </div>

          <!-- Recurring -->
          <div class="p-3 rounded-lg bg-neutral-50 border border-neutral-100">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <Repeat :size="13" class="text-primary-deep" />
                <span class="text-xs font-semibold text-foundation">Recurring</span>
              </div>
              <SwitchRoot
                v-model:checked="form.isRecurring"
                class="w-8 h-5 rounded-full relative bg-neutral-200 data-[state=checked]:bg-primary-deep transition-colors outline-none cursor-pointer"
              >
                <SwitchThumb class="block w-4 h-4 bg-white rounded-full shadow transition-transform translate-x-0.5 data-[state=checked]:translate-x-[14px]" />
              </SwitchRoot>
            </div>
            <div v-if="form.isRecurring" class="space-y-2">
              <RadioGroupRoot v-model="form.frequency" class="flex gap-1.5">
                <RadioGroupItem
                  v-for="freq in freqOptions"
                  :key="freq.value"
                  :value="freq.value"
                  class="px-2 py-1 rounded-md border cursor-pointer text-[10px] font-medium transition-all outline-none
                    border-neutral-200 hover:border-primary-deep/30
                    data-[state=checked]:border-primary-deep data-[state=checked]:bg-primary-deep data-[state=checked]:text-white"
                >
                  {{ freq.label }}
                </RadioGroupItem>
              </RadioGroupRoot>
              <div class="flex gap-1">
                <button
                  v-for="day in dayOptions"
                  :key="day"
                  type="button"
                  @click="form.preferredDay = day"
                  class="flex-1 py-1.5 rounded-md text-[10px] font-medium transition-all cursor-pointer"
                  :class="form.preferredDay === day
                    ? 'bg-primary-deep text-white'
                    : 'bg-white border border-neutral-200 text-neutral-500'"
                >
                  {{ day }}
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        <!-- ── COL 3: Delivery + Submit ── -->
        <motion.div
          :initial="{ opacity: 0, y: 10 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.25, delay: 0.15 }"
          class="space-y-4"
        >
          <div class="bg-white rounded-xl border border-neutral-100 p-4 space-y-3">
            <h2 class="text-xs font-semibold text-neutral-600 uppercase tracking-wider">Delivery</h2>

            <div>
              <label class="text-[11px] font-medium text-neutral-500 mb-1 block">Address *</label>
              <textarea v-model="form.deliveryAddress" rows="2" :class="inputClass" class="resize-none" placeholder="Full address with building, floor, landmarks..." />
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="text-[11px] font-medium text-neutral-500 mb-1 block">Date *</label>
                <input v-model="form.deliveryDate" type="date" :min="today" :class="inputClass" />
              </div>
              <div>
                <label class="text-[11px] font-medium text-neutral-500 mb-1.5 block">Time *</label>
                <RadioGroupRoot v-model="form.deliveryTime" class="grid grid-cols-2 gap-1.5">
                  <RadioGroupItem
                    v-for="slot in timeSlots"
                    :key="slot.value"
                    :value="slot.value"
                    class="py-1.5 rounded-md border cursor-pointer text-center transition-all outline-none text-[10px] font-medium
                      border-neutral-200 hover:border-primary-deep/30
                      data-[state=checked]:border-primary-deep data-[state=checked]:bg-primary-deep data-[state=checked]:text-white"
                  >
                    {{ slot.label }}
                  </RadioGroupItem>
                </RadioGroupRoot>
              </div>
            </div>
          </div>

          <!-- Summary + Submit -->
          <div class="bg-foundation rounded-xl p-4 text-white">
            <h2 class="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2.5">Summary</h2>
            <div class="space-y-1.5 text-xs mb-4">
              <div class="flex justify-between"><span class="text-white/50">Business</span><span class="font-medium">{{ form.businessName || '—' }}</span></div>
              <div class="flex justify-between"><span class="text-white/50">Volume</span><span class="font-medium">{{ volumeOptions.find(v => v.value === form.volume)?.label || '—' }}</span></div>
              <div class="flex justify-between"><span class="text-white/50">Categories</span><span class="font-medium">{{ form.categories.length }} selected</span></div>
              <div class="flex justify-between"><span class="text-white/50">Delivery</span><span class="font-medium">{{ form.deliveryDate || '—' }}</span></div>
              <div v-if="form.isRecurring" class="flex justify-between"><span class="text-white/50">Recurring</span><span class="font-medium text-primary-deep">{{ form.frequency }} / {{ form.preferredDay }}</span></div>
            </div>

            <button
              type="submit"
              :disabled="!isValid || isSubmitting"
              class="w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer
                bg-primary-deep text-white
                hover:bg-primary-deep/90 hover:shadow-lg hover:shadow-primary-deep/25
                disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
            >
              <template v-if="isSubmitting">Submitting...</template>
              <template v-else>
                <Sparkles :size="16" />
                Submit Bulk Order
              </template>
            </button>
          </div>
        </motion.div>

      </form>
    </div>
  </div>
</template>
