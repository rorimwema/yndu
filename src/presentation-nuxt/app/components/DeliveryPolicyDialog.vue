<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  DialogRoot,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from 'reka-ui';
import { Truck, Clock, MapPin, X, CheckCircle } from 'lucide-vue-next';

const STORAGE_KEY = 'yndu_delivery_policy_seen';

const isOpen = ref(false);

// Check if user has seen the policy before
onMounted(() => {
  if (import.meta.client) {
    const seen = localStorage.getItem(STORAGE_KEY);
    if (!seen) {
      // Show dialog after a short delay for better UX
      setTimeout(() => {
        isOpen.value = true;
      }, 500);
    }
  }
});

// Mark as seen when closed
const handleClose = () => {
  isOpen.value = false;
  if (import.meta.client) {
    localStorage.setItem(STORAGE_KEY, 'true');
  }
};

// Delivery areas
const deliveryAreas = [
  'Karen', 'Kilimani', 'Lavington', 'Westlands',
  'Kileleshwa', 'Langata', 'South B/C', 'Parklands'
];
</script>

<template>
  <DialogRoot v-model:open="isOpen">
    <DialogPortal>
      <DialogOverlay 
        class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-200" 
      />
      <DialogContent
        class="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100%-2rem)] max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden"
        @escape-key-down="handleClose"
        @pointer-down-outside="handleClose"
      >
        <!-- Header with icon -->
        <div class="bg-primary-deep/10 px-6 py-5">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl bg-primary-deep flex items-center justify-center text-white">
              <Truck :size="24" />
            </div>
            <div>
              <DialogTitle class="text-lg font-bold text-foundation">
                Delivery Policy
              </DialogTitle>
              <DialogDescription class="text-sm text-neutral-400">
                How we deliver fresh produce to you
              </DialogDescription>
            </div>
          </div>
        </div>

        <!-- Content -->
        <div class="p-6 space-y-5">
          <!-- Same day delivery -->
          <div class="flex gap-3">
            <div class="w-10 h-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <Clock :size="20" />
            </div>
            <div>
              <h4 class="font-semibold text-foundation text-sm">Same-Day Delivery</h4>
              <p class="text-sm text-neutral-500">Order before <strong>10 AM</strong> for same-day delivery. Orders after 10 AM are delivered the next day.</p>
            </div>
          </div>

          <!-- Delivery days -->
          <div class="flex gap-3">
            <div class="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center shrink-0">
              <CheckCircle :size="20" />
            </div>
            <div>
              <h4 class="font-semibold text-foundation text-sm">Delivery Days</h4>
              <p class="text-sm text-neutral-500">We deliver on <strong>Tuesday</strong> and <strong>Friday</strong> between 8 AM - 6 PM.</p>
            </div>
          </div>

          <!-- Delivery areas -->
          <div class="flex gap-3">
            <div class="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <MapPin :size="20" />
            </div>
            <div>
              <h4 class="font-semibold text-foundation text-sm mb-2">Delivery Areas</h4>
              <div class="flex flex-wrap gap-1.5">
                <span 
                  v-for="area in deliveryAreas" 
                  :key="area"
                  class="px-2 py-1 rounded-md bg-neutral-100 text-neutral-600 text-xs font-medium"
                >
                  {{ area }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 pb-6">
          <DialogClose as-child>
            <button
              @click="handleClose"
              class="w-full py-3 rounded-xl bg-primary-deep text-white font-bold text-sm hover:bg-primary-deep/90 transition-colors"
            >
              Got it, thanks!
            </button>
          </DialogClose>
        </div>

        <!-- Close button -->
        <DialogClose
          class="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:bg-neutral-100 hover:text-foundation transition-colors"
          @click="handleClose"
          aria-label="Close"
        >
          <X :size="18" />
        </DialogClose>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
