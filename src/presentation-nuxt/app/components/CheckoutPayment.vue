<script setup lang="ts">
import { computed } from 'vue';
import { motion } from 'motion-v';
import { Smartphone, CreditCard, Banknote, ArrowLeft, ArrowRight, Check, Shield, AlertCircle, Wallet } from 'lucide-vue-next';
import { useCheckoutStore } from '../stores/checkout-store';
import { useCartStore } from '../stores/cart-store';

const checkoutStore = useCheckoutStore();
const cartStore = useCartStore();

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-KE', { 
    style: 'currency', 
    currency: 'KES',
    minimumFractionDigits: 0
  }).format(price).replace('KES', 'KSh');
};

const totalDue = computed(() => cartStore.cartTotals.total);

const handleContinue = () => {
  if (checkoutStore.canProceedToPayment) {
    checkoutStore.setStep(4);
  }
};

const handleBack = () => {
  checkoutStore.setStep(2);
};

const getPaymentIcon = (type: string) => {
  switch (type) {
    case 'mpesa': return Smartphone;
    case 'card': return CreditCard;
    case 'cash': return Banknote;
    default: return CreditCard;
  }
};
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h2 class="text-xl font-bold text-foundation mb-2">Payment Method</h2>
      <p class="text-sm text-neutral-500">Choose how you'd like to pay</p>
    </div>

    <!-- Payment Summary -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-neutral-100 dark:border-zinc-800 bg-neutral-50/60 dark:bg-zinc-800/40 p-4">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-primary-deep/10 flex items-center justify-center">
          <Wallet class="text-primary-deep" :size="18" />
        </div>
        <div>
          <p class="text-xs text-neutral-400 uppercase tracking-wider">Total Due</p>
          <p class="text-lg font-bold text-foundation">{{ formatPrice(totalDue) }}</p>
        </div>
      </div>
      <p class="text-xs text-neutral-400">No hidden fees. Free delivery in Nairobi area.</p>
    </div>

    <!-- Payment Methods -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <motion.div
        v-for="method in checkoutStore.paymentMethods"
        :key="method.type"
        :while-hover="{ scale: 1.01 }"
        :while-tap="{ scale: 0.99 }"
        @click="checkoutStore.selectPayment(method)"
        class="relative p-5 rounded-xl border-2 cursor-pointer transition-all duration-200"
        :class="[
          checkoutStore.selectedPayment?.type === method.type
            ? 'border-primary-deep bg-primary-deep/5'
            : 'border-neutral-100 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-primary-deep/30'
        ]"
      >
        <!-- Selection Indicator -->
        <div 
          v-if="checkoutStore.selectedPayment?.type === method.type"
          class="absolute top-4 right-4 w-6 h-6 rounded-full bg-primary-deep text-white flex items-center justify-center"
        >
          <Check :size="14" stroke-width="3" />
        </div>

        <div class="flex items-center gap-4">
          <div 
            class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            :class="checkoutStore.selectedPayment?.type === method.type ? 'bg-primary-deep text-white' : 'bg-neutral-100 dark:bg-zinc-800 text-neutral-500'"
          >
            <component :is="getPaymentIcon(method.type)" :size="24" />
          </div>
          
          <div class="flex-1">
            <p class="font-semibold text-foundation">{{ method.label }}</p>
            <p class="text-sm text-neutral-400">
              <span v-if="method.type === 'mpesa'">Pay with M-Pesa mobile money</span>
              <span v-else-if="method.type === 'card'">Credit or debit card</span>
              <span v-else>Pay when you receive your order</span>
            </p>
          </div>
        </div>

        <!-- M-Pesa Phone Input -->
        <div 
          v-if="checkoutStore.selectedPayment?.type === 'mpesa' && method.type === 'mpesa'"
          class="mt-4 pt-4 border-t border-neutral-100 dark:border-zinc-800"
        >
          <label class="block text-sm font-medium text-neutral-600 mb-2">
            M-Pesa Phone Number
          </label>
          <div class="relative">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 font-medium">+254</span>
            <input
              v-model="checkoutStore.phoneNumber"
              type="tel"
              placeholder="712 345 678"
              class="w-full pl-16 pr-4 py-3 rounded-lg border border-neutral-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-foundation focus:ring-2 focus:ring-primary-deep/20 focus:border-primary-deep outline-none transition-all"
            />
          </div>
          <p class="text-xs text-neutral-400 mt-2">
            You'll receive an M-Pesa prompt to complete payment after confirming your order.
          </p>
        </div>

        <!-- Card Payment Info -->
        <div 
          v-if="checkoutStore.selectedPayment?.type === 'card' && method.type === 'card'"
          class="mt-4 pt-4 border-t border-neutral-100 dark:border-zinc-800"
        >
          <div class="bg-neutral-50 dark:bg-zinc-800 rounded-lg p-4 text-center">
            <CreditCard class="mx-auto text-neutral-400 mb-2" :size="32" />
            <p class="text-sm text-neutral-500">Card payment will be processed securely</p>
            <p class="text-xs text-neutral-400 mt-1">You'll enter card details on the next step</p>
          </div>
        </div>
      </motion.div>
    </div>

    <!-- Security Note -->
    <div class="flex items-center gap-3 p-4 rounded-xl bg-neutral-50 dark:bg-zinc-800/50 border border-neutral-100 dark:border-zinc-800">
      <Shield class="text-primary-deep shrink-0" :size="20" />
      <p class="text-sm text-neutral-500">
        Your payment information is secure and encrypted. We never store your full card details.
      </p>
    </div>

    <!-- Warning if no payment selected -->
    <div 
      v-if="!checkoutStore.selectedPayment" 
      class="flex items-center gap-3 p-4 rounded-xl bg-accent-clay/10 border border-accent-clay/20"
    >
      <AlertCircle class="text-accent-clay shrink-0" :size="20" />
      <p class="text-sm text-neutral-600">Please select a payment method to continue</p>
    </div>

    <!-- Navigation Buttons -->
    <div class="flex gap-3 pt-4">
      <button
        @click="handleBack"
        class="px-6 py-4 rounded-xl border-2 border-neutral-200 dark:border-zinc-700 text-neutral-600 font-semibold hover:border-primary-deep hover:text-primary-deep transition-colors flex items-center gap-2"
      >
        <ArrowLeft :size="18" />
        <span>Back</span>
      </button>
      
      <button
        @click="handleContinue"
        :disabled="!checkoutStore.canProceedToPayment"
        class="flex-1 bg-primary-deep text-white font-semibold py-4 rounded-xl shadow-lg shadow-primary-deep/20 hover:shadow-xl hover:shadow-primary-deep/30 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
      >
        <span>Review Order</span>
        <ArrowRight :size="18" />
      </button>
    </div>
  </div>
</template>
