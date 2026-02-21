<script setup lang="ts">
import { computed, ref } from 'vue';
import { RadioGroupRoot, RadioGroupItem } from 'reka-ui';
import { motion } from 'motion-v';
import {
  Home, Building, MapPin, Plus, Calendar, Clock,
  Smartphone, CreditCard, Banknote, Sparkles, Check,
  ShieldCheck, X,
} from 'lucide-vue-next';
import { useCheckoutStore, type Address } from '../stores/checkout-store';
import { useCartStore } from '../stores/cart-store';

useSeoMeta({
  title: 'Checkout | Yndu',
  description: 'Complete your fresh produce order from Kibwezi farms.',
});
definePageMeta({ middleware: ['checkout'] });

const checkoutStore = useCheckoutStore();
const cartStore = useCartStore();

const showAddAddress = ref(false);
const newAddress = ref({ label: 'Home', street: '', apartment: '', neighborhood: '', city: 'Nairobi', instructions: '' });

const formatPrice = (price: number) =>
  `KSh ${price.toLocaleString()}`;

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-KE', { month: 'short', day: 'numeric' });
};

const selectedAddressId = computed({
  get: () => checkoutStore.selectedAddress?.id || '',
  set: (id: string) => {
    const addr = checkoutStore.savedAddresses.find(a => a.id === id);
    if (addr) checkoutStore.selectAddress(addr);
  },
});

const selectedSlotDate = computed({
  get: () => checkoutStore.selectedSlot?.date || '',
  set: (date: string) => {
    const slot = checkoutStore.availableSlots.find(s => s.date === date);
    if (slot) checkoutStore.selectSlot(slot);
  },
});

const selectedPaymentType = computed({
  get: () => checkoutStore.selectedPayment?.type || '',
  set: (type: string) => {
    const method = checkoutStore.paymentMethods.find(m => m.type === type);
    if (method) checkoutStore.selectPayment(method);
  },
});

const getPaymentIcon = (type: string) => {
  if (type === 'mpesa') return Smartphone;
  if (type === 'card') return CreditCard;
  return Banknote;
};

const handleAddAddress = () => {
  if (!newAddress.value.street || !newAddress.value.neighborhood || !newAddress.value.city) return;
  checkoutStore.addNewAddress({ ...newAddress.value });
  showAddAddress.value = false;
  newAddress.value = { label: 'Home', street: '', apartment: '', neighborhood: '', city: 'Nairobi', instructions: '' };
};

const inputClass = 'w-full px-2.5 py-2 rounded-lg border border-neutral-200 text-sm bg-neutral-50/50 focus:outline-none focus:ring-2 focus:ring-primary-deep/30 focus:border-primary-deep/40';
</script>

<template>
  <div class="min-h-dvh bg-[var(--bg-canvas)]">

    <!-- Success State -->
    <CheckoutSuccess v-if="checkoutStore.orderComplete" />

    <div v-else class="max-w-4xl mx-auto px-4 sm:px-6 py-5 sm:py-6">

      <!-- Header -->
      <motion.div
        :initial="{ opacity: 0, y: 8 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.3 }"
        class="flex items-center justify-between mb-5"
      >
        <div>
          <h1 class="text-xl sm:text-2xl font-bold text-foundation tracking-tight text-balance">Checkout</h1>
          <p class="text-xs text-neutral-400 mt-0.5">{{ cartStore.itemCount }} items · Free delivery</p>
        </div>
        <div class="flex items-center gap-1.5 text-[10px] text-neutral-400">
          <ShieldCheck :size="12" class="text-primary-deep" />
          Secure checkout
        </div>
      </motion.div>

      <!-- All sections in 2-column grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <!-- ── LEFT: Address + Delivery ── -->
        <div class="space-y-4">

          <!-- Address -->
          <motion.section
            :initial="{ opacity: 0, y: 10 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ duration: 0.25, delay: 0.05 }"
            class="bg-white rounded-xl border border-neutral-100 p-4"
          >
            <div class="flex items-center justify-between mb-2.5">
              <h2 class="text-xs font-semibold text-neutral-600 uppercase tracking-wider">Delivery Address</h2>
              <button
                v-if="!showAddAddress"
                @click="showAddAddress = true"
                class="text-[10px] font-medium text-primary-deep flex items-center gap-0.5 cursor-pointer"
              >
                <Plus :size="10" /> Add new
              </button>
            </div>

            <!-- Saved addresses -->
            <RadioGroupRoot v-if="!showAddAddress" v-model="selectedAddressId" class="space-y-2">
              <RadioGroupItem
                v-for="addr in checkoutStore.savedAddresses"
                :key="addr.id"
                :value="addr.id!"
                class="group relative w-full flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all outline-none
                  border-neutral-100 hover:border-primary-deep/30
                  data-[state=checked]:border-primary-deep data-[state=checked]:bg-primary-deep/5"
              >
                <div class="w-8 h-8 rounded-lg flex items-center justify-center bg-neutral-50 group-data-[state=checked]:bg-primary-deep/10">
                  <component :is="addr.label === 'Office' ? Building : Home" :size="16" class="text-neutral-400 group-data-[state=checked]:text-primary-deep" />
                </div>
                <div class="flex-1 min-w-0">
                  <span class="font-bold text-sm text-foundation">{{ addr.label }}</span>
                  <p class="text-[11px] text-neutral-400 truncate">{{ addr.street }}, {{ addr.neighborhood }}</p>
                </div>
                <div class="w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors border-neutral-300 group-data-[state=checked]:border-primary-deep">
                  <div class="w-2 h-2 rounded-full bg-primary-deep scale-0 group-data-[state=checked]:scale-100 transition-transform" />
                </div>
              </RadioGroupItem>
            </RadioGroupRoot>

            <!-- Add new address form -->
            <div v-else class="space-y-2.5">
              <div class="flex items-center justify-between">
                <span class="text-xs font-medium text-neutral-600">New Address</span>
                <button @click="showAddAddress = false" class="p-1 rounded text-neutral-400 hover:text-foundation cursor-pointer"><X :size="14" /></button>
              </div>
              <div class="flex gap-1.5 mb-2">
                <button
                  v-for="lbl in ['Home', 'Office', 'Other']"
                  :key="lbl"
                  type="button"
                  @click="newAddress.label = lbl"
                  class="px-2.5 py-1 rounded-md border text-[10px] font-medium transition-all cursor-pointer"
                  :class="newAddress.label === lbl
                    ? 'border-primary-deep bg-primary-deep text-white'
                    : 'border-neutral-200 text-neutral-500'"
                >{{ lbl }}</button>
              </div>
              <div class="grid grid-cols-2 gap-2">
                <input v-model="newAddress.street" :class="inputClass" placeholder="Street *" />
                <input v-model="newAddress.apartment" :class="inputClass" placeholder="Apt (optional)" />
              </div>
              <div class="grid grid-cols-2 gap-2">
                <input v-model="newAddress.neighborhood" :class="inputClass" placeholder="Neighborhood *" />
                <input v-model="newAddress.city" :class="inputClass" placeholder="City *" />
              </div>
              <input v-model="newAddress.instructions" :class="inputClass" placeholder="Delivery instructions..." />
              <button
                @click="handleAddAddress"
                class="w-full py-2 rounded-lg bg-primary-deep text-white text-xs font-bold cursor-pointer hover:bg-primary-deep/90"
              >Save Address</button>
            </div>
          </motion.section>

          <!-- Delivery Slot -->
          <motion.section
            :initial="{ opacity: 0, y: 10 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ duration: 0.25, delay: 0.1 }"
            class="bg-white rounded-xl border border-neutral-100 p-4"
          >
            <h2 class="text-xs font-semibold text-neutral-600 uppercase tracking-wider mb-2.5">Delivery Date</h2>
            <RadioGroupRoot v-model="selectedSlotDate" class="grid grid-cols-2 gap-2">
              <RadioGroupItem
                v-for="slot in checkoutStore.availableSlots"
                :key="slot.date"
                :value="slot.date"
                class="group relative p-3 rounded-lg border-2 cursor-pointer transition-all outline-none
                  border-neutral-100 hover:border-primary-deep/30
                  data-[state=checked]:border-primary-deep data-[state=checked]:bg-primary-deep/5"
              >
                <p class="font-bold text-sm text-foundation group-data-[state=checked]:text-primary-deep">{{ slot.dayOfWeek }}</p>
                <p class="text-[11px] text-neutral-400">{{ formatDate(slot.date) }}</p>
                <div class="flex items-center gap-1 mt-1">
                  <Clock :size="10" class="text-neutral-400" />
                  <span class="text-[10px] text-neutral-400">{{ slot.timeRange }}</span>
                </div>
              </RadioGroupItem>
            </RadioGroupRoot>
            <div class="mt-2.5">
              <input
                v-model="checkoutStore.specialInstructions"
                :class="inputClass"
                placeholder="Delivery instructions (optional)"
              />
            </div>
          </motion.section>
        </div>

        <!-- ── RIGHT: Payment + Summary ── -->
        <div class="space-y-4">

          <!-- Payment -->
          <motion.section
            :initial="{ opacity: 0, y: 10 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ duration: 0.25, delay: 0.15 }"
            class="bg-white rounded-xl border border-neutral-100 p-4"
          >
            <h2 class="text-xs font-semibold text-neutral-600 uppercase tracking-wider mb-2.5">Payment</h2>
            <RadioGroupRoot v-model="selectedPaymentType" class="space-y-2">
              <RadioGroupItem
                v-for="method in checkoutStore.paymentMethods"
                :key="method.type"
                :value="method.type"
                class="group relative w-full flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all outline-none
                  border-neutral-100 hover:border-primary-deep/30
                  data-[state=checked]:border-primary-deep data-[state=checked]:bg-primary-deep/5"
              >
                <div class="w-8 h-8 rounded-lg flex items-center justify-center bg-neutral-50 group-data-[state=checked]:bg-primary-deep/10">
                  <component :is="getPaymentIcon(method.type)" :size="16" class="text-neutral-400 group-data-[state=checked]:text-primary-deep" />
                </div>
                <div class="flex-1">
                  <span class="font-bold text-sm text-foundation">{{ method.label }}</span>
                  <p class="text-[10px] text-neutral-400">
                    <template v-if="method.type === 'mpesa'">Mobile money</template>
                    <template v-else-if="method.type === 'card'">Credit or debit</template>
                    <template v-else>Pay on delivery</template>
                  </p>
                </div>
                <div class="w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors border-neutral-300 group-data-[state=checked]:border-primary-deep">
                  <div class="w-2 h-2 rounded-full bg-primary-deep scale-0 group-data-[state=checked]:scale-100 transition-transform" />
                </div>
              </RadioGroupItem>
            </RadioGroupRoot>

            <!-- M-Pesa phone input -->
            <div v-if="checkoutStore.selectedPayment?.type === 'mpesa'" class="mt-3">
              <label class="text-[11px] font-medium text-neutral-500 mb-1 block">M-Pesa Number</label>
              <div class="relative">
                <span class="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-neutral-400 font-medium">+254</span>
                <input
                  v-model="checkoutStore.phoneNumber"
                  type="tel"
                  placeholder="712 345 678"
                  class="w-full pl-12 pr-2.5 py-2 rounded-lg border border-neutral-200 text-sm bg-neutral-50/50 focus:outline-none focus:ring-2 focus:ring-primary-deep/30 focus:border-primary-deep/40"
                />
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
            <h2 class="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3">Order Summary</h2>
            <div class="space-y-1.5 text-xs mb-4">
              <div class="flex justify-between"><span class="text-white/50">Items</span><span class="font-medium">{{ cartStore.itemCount }} items</span></div>
              <div class="flex justify-between"><span class="text-white/50">Subtotal</span><span class="font-medium">{{ formatPrice(cartStore.cartTotals.subtotal) }}</span></div>
              <div class="flex justify-between"><span class="text-white/50">Delivery</span><span class="font-medium text-green-400">Free</span></div>
              <div class="flex justify-between"><span class="text-white/50">To</span><span class="font-medium">{{ checkoutStore.selectedAddress?.neighborhood || '—' }}, {{ checkoutStore.selectedAddress?.city || '—' }}</span></div>
              <div class="flex justify-between"><span class="text-white/50">When</span><span class="font-medium">{{ checkoutStore.selectedSlot ? `${checkoutStore.selectedSlot.dayOfWeek}, ${formatDate(checkoutStore.selectedSlot.date)}` : '—' }}</span></div>
              <div class="flex justify-between"><span class="text-white/50">Pay via</span><span class="font-medium">{{ checkoutStore.selectedPayment?.label || '—' }}</span></div>
              <div class="flex justify-between pt-1.5 border-t border-white/10">
                <span class="font-semibold">Total</span>
                <span class="font-bold text-base text-primary-deep">{{ formatPrice(cartStore.cartTotals.total) }}</span>
              </div>
            </div>

            <button
              @click="checkoutStore.submitOrder()"
              :disabled="!checkoutStore.canCompleteOrder || checkoutStore.isLoading"
              class="w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer
                bg-primary-deep text-white
                hover:bg-primary-deep/90 hover:shadow-lg hover:shadow-primary-deep/25
                disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
            >
              <template v-if="checkoutStore.isLoading">Processing...</template>
              <template v-else>
                <Sparkles :size="16" />
                Place Order · {{ formatPrice(cartStore.cartTotals.total) }}
              </template>
            </button>
          </motion.section>
        </div>
      </div>

    </div>
  </div>
</template>
