<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue';
import { motion } from 'motion-v';
import { CheckCircle2, Truck, Calendar, Clock, ArrowRight, ShoppingBag, Sparkles, Package } from 'lucide-vue-next';
import { useCheckoutStore } from '../stores/checkout-store';

const checkoutStore = useCheckoutStore();

onMounted(() => {
  if (!import.meta.client) return;
  // Scroll to top when success page shows
  window.scrollTo({ top: 0, behavior: 'instant' });
});

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-KE', { 
    weekday: 'long',
    month: 'long', 
    day: 'numeric',
  });
};

// Staggered animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24,
    },
  },
};

const checkmarkVariants = {
  hidden: { scale: 0, rotate: -180 },
  visible: {
    scale: 1,
    rotate: 0,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 15,
      delay: 0.2,
    },
  },
};
</script>

<template>
  <!-- Fixed overlay that covers entire viewport -->
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--bg-canvas)]">
    <!-- Animated Background Particles -->
    <ClientOnly>
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          v-for="i in 12"
          :key="i"
          class="absolute w-2 h-2 rounded-full bg-primary-deep/20"
          :initial="{ 
            x: `${Math.random() * 100}%`, 
            y: '120%',
            scale: Math.random() * 0.5 + 0.5,
            opacity: 0 
          }"
          :animate="{ 
            y: '-20%',
            opacity: [0, 0.6, 0],
            rotate: 360 
          }"
          :transition="{ 
            duration: Math.random() * 3 + 4,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: 'linear'
          }"
        />
      </div>
    </ClientOnly>

    <!-- Radial Gradient Background -->
    <motion.div
      :initial="{ opacity: 0, scale: 0.8 }"
      :animate="{ opacity: 1, scale: 1 }"
      :transition="{ duration: 0.5 }"
      class="absolute inset-0 pointer-events-none"
      style="background: radial-gradient(circle at center, rgba(102, 128, 11, 0.1) 0%, transparent 70%);"
    />

    <!-- Success Modal -->
    <motion.div
      :initial="{ opacity: 0, scale: 0.9, y: 30 }"
      :animate="{ opacity: 1, scale: 1, y: 0 }"
      :transition="{ 
        type: 'spring',
        stiffness: 300,
        damping: 25,
        delay: 0.1 
      }"
      class="relative w-full max-w-sm"
    >
      <!-- Floating Sparkles -->
      <motion.div
        :initial="{ opacity: 0, scale: 0 }"
        :animate="{ opacity: 1, scale: 1 }"
        :transition="{ delay: 0.5, type: 'spring' }"
        class="absolute -top-4 -right-4 text-primary-deep/60"
      >
        <Sparkles :size="24" />
      </motion.div>
      <motion.div
        :initial="{ opacity: 0, scale: 0 }"
        :animate="{ opacity: 1, scale: 1 }"
        :transition="{ delay: 0.6, type: 'spring' }"
        class="absolute -top-2 -left-6 text-primary-deep/40"
      >
        <Sparkles :size="20" />
      </motion.div>

      <!-- Main Card -->
      <div class="bg-white dark:bg-zinc-900 rounded-2xl border border-neutral-100 dark:border-zinc-800 shadow-2xl shadow-primary-deep/20 overflow-hidden">
        <!-- Animated Success Header -->
        <div class="relative p-6 text-center border-b border-neutral-100 dark:border-zinc-800 bg-gradient-to-b from-primary-deep/5 to-transparent">
          <!-- Animated Checkmark Circle -->
          <div class="relative w-20 h-20 mx-auto mb-4">
            <!-- Outer Ring Animation -->
            <motion.div
              class="absolute inset-0 rounded-full border-4 border-primary-deep/20"
              :initial="{ scale: 0, opacity: 0 }"
              :animate="{ scale: [0, 1.2, 1], opacity: 1 }"
              :transition="{ duration: 0.5, delay: 0.2 }"
            />
            <motion.div
              class="absolute inset-0 rounded-full border-4 border-primary-deep/10"
              :initial="{ scale: 0, opacity: 0 }"
              :animate="{ scale: [0, 1.4, 1.2], opacity: [0, 0.5, 0] }"
              :transition="{ duration: 0.8, delay: 0.3 }"
            />
            
            <!-- Main Circle -->
            <motion.div
              class="absolute inset-0 rounded-full bg-primary-deep flex items-center justify-center"
              :variants="checkmarkVariants"
              initial="hidden"
              animate="visible"
            >
              <CheckCircle2 class="text-white" :size="40" stroke-width="2.5" />
            </motion.div>
          </div>

          <motion.h1
            :initial="{ opacity: 0, y: 10 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ delay: 0.6 }"
            class="text-xl font-bold text-foundation mb-1"
          >
            Order Confirmed!
          </motion.h1>
          <motion.p
            :initial="{ opacity: 0 }"
            :animate="{ opacity: 1 }"
            :transition="{ delay: 0.7 }"
            class="text-sm text-neutral-500"
          >
            We sent a confirmation to your email.
          </motion.p>
        </div>

        <!-- Order Details -->
        <motion.div
          class="p-5 space-y-4"
          :variants="containerVariants"
          initial="hidden"
          animate="visible"
        >
          <!-- Order ID -->
          <motion.div
            :variants="itemVariants"
            class="bg-gradient-to-r from-primary-deep/10 to-primary-deep/5 rounded-xl p-3 text-center border border-primary-deep/20"
          >
            <p class="text-[10px] text-neutral-400 uppercase tracking-wider mb-1">Order ID</p>
            <p class="text-base font-bold text-foundation tracking-wider">{{ checkoutStore.orderId }}</p>
          </motion.div>

          <!-- Delivery Details -->
          <div class="space-y-2">
            <motion.div
              :variants="itemVariants"
              class="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <motion.div 
                class="w-9 h-9 rounded-lg bg-primary-deep/10 flex items-center justify-center shrink-0"
                :whileHover="{ scale: 1.1, rotate: 5 }"
              >
                <Calendar class="text-primary-deep" :size="18" />
              </motion.div>
              <div>
                <p class="text-xs text-neutral-400">Delivery Date</p>
                <p class="text-sm font-semibold text-foundation">{{ formatDate(checkoutStore.selectedSlot?.date || '') }}</p>
              </div>
            </motion.div>

            <motion.div
              :variants="itemVariants"
              class="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <motion.div 
                class="w-9 h-9 rounded-lg bg-primary-deep/10 flex items-center justify-center shrink-0"
                :whileHover="{ scale: 1.1, rotate: -5 }"
              >
                <Clock class="text-primary-deep" :size="18" />
              </motion.div>
              <div>
                <p class="text-xs text-neutral-400">Delivery Time</p>
                <p class="text-sm font-semibold text-foundation">{{ checkoutStore.selectedSlot?.timeRange }}</p>
              </div>
            </motion.div>

            <motion.div
              :variants="itemVariants"
              class="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <motion.div 
                class="w-9 h-9 rounded-lg bg-primary-deep/10 flex items-center justify-center shrink-0"
                :whileHover="{ scale: 1.1, rotate: 5 }"
              >
                <Truck class="text-primary-deep" :size="18" />
              </motion.div>
              <div>
                <p class="text-xs text-neutral-400">Delivery Address</p>
                <p class="text-sm font-semibold text-foundation">{{ checkoutStore.selectedAddress?.label }}</p>
                <p class="text-[10px] text-neutral-400">{{ checkoutStore.selectedAddress?.neighborhood }}, {{ checkoutStore.selectedAddress?.city }}</p>
              </div>
            </motion.div>
          </div>

          <!-- Actions -->
          <motion.div
            :variants="itemVariants"
            class="space-y-2 pt-2"
          >
            <motion.div :whileHover="{ scale: 1.02 }" :whileTap="{ scale: 0.98 }">
              <NuxtLink
                to="/"
                class="w-full bg-primary-deep text-white text-sm font-semibold py-2.5 rounded-xl shadow-lg shadow-primary-deep/20 hover:shadow-xl hover:shadow-primary-deep/30 transition-all flex items-center justify-center gap-2"
              >
                <ShoppingBag :size="16" />
                <span>Continue Shopping</span>
              </NuxtLink>
            </motion.div>
            
            <motion.div :whileHover="{ scale: 1.02 }" :whileTap="{ scale: 0.98 }">
              <NuxtLink
                to="/account/orders"
                class="w-full bg-white dark:bg-zinc-800 text-neutral-600 text-sm font-semibold py-2.5 rounded-xl border border-neutral-200 dark:border-zinc-700 hover:border-primary-deep hover:text-primary-deep transition-colors flex items-center justify-center gap-2"
              >
                <Package :size="16" />
                <span>View Order History</span>
                <ArrowRight :size="16" />
              </NuxtLink>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      <!-- Footer Message -->
      <motion.p
        :initial="{ opacity: 0 }"
        :animate="{ opacity: 1 }"
        :transition="{ delay: 1.2 }"
        class="text-center text-xs text-neutral-400 mt-4"
      >
        Thank you for choosing Yndu!
      </motion.p>
    </motion.div>
  </div>
</template>
