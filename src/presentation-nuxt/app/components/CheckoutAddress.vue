<script setup lang="ts">
import { ref } from 'vue';
import { motion } from 'motion-v';
import { MapPin, Plus, Home, Building, ArrowRight, Check } from 'lucide-vue-next';
import { useCheckoutStore } from '../stores/checkout-store';

const checkoutStore = useCheckoutStore();
const showAddNew = ref(false);

const newAddress = ref({
  label: '',
  street: '',
  apartment: '',
  neighborhood: '',
  city: '',
  instructions: '',
});

const errors = ref<Record<string, string>>({});

const validateAddress = () => {
  errors.value = {};
  if (!newAddress.value.label) errors.value.label = 'Label is required';
  if (!newAddress.value.street) errors.value.street = 'Street address is required';
  if (!newAddress.value.neighborhood) errors.value.neighborhood = 'Neighborhood is required';
  if (!newAddress.value.city) errors.value.city = 'City is required';
  return Object.keys(errors.value).length === 0;
};

const handleAddAddress = () => {
  if (!validateAddress()) return;
  
  checkoutStore.addNewAddress(newAddress.value);
  showAddNew.value = false;
  newAddress.value = { label: '', street: '', apartment: '', neighborhood: '', city: '', instructions: '' };
};

const handleContinue = () => {
  if (checkoutStore.selectedAddress) {
    checkoutStore.setStep(2);
  }
};
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h2 class="text-xl font-bold text-foundation mb-2">Delivery Address</h2>
      <p class="text-sm text-neutral-500">Where should we deliver your fresh produce?</p>
    </div>

    <!-- Saved Addresses -->
    <div v-if="checkoutStore.savedAddresses.length > 0 && !showAddNew" class="space-y-3">
      <motion.div
        v-for="address in checkoutStore.savedAddresses"
        :key="address.id"
        :while-hover="{ scale: 1.01 }"
        :while-tap="{ scale: 0.99 }"
        @click="checkoutStore.selectAddress(address)"
        class="relative p-5 rounded-xl border-2 cursor-pointer transition-all duration-200"
        :class="[
          checkoutStore.selectedAddress?.id === address.id
            ? 'border-primary-deep bg-primary-deep/5'
            : 'border-neutral-100 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-primary-deep/30'
        ]"
      >
        <!-- Selection Indicator -->
        <div 
          v-if="checkoutStore.selectedAddress?.id === address.id"
          class="absolute top-4 right-4 w-6 h-6 rounded-full bg-primary-deep text-white flex items-center justify-center"
        >
          <Check :size="14" stroke-width="3" />
        </div>

        <div class="flex items-start gap-4">
          <div 
            class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
            :class="checkoutStore.selectedAddress?.id === address.id ? 'bg-primary-deep text-white' : 'bg-neutral-100 dark:bg-zinc-800 text-neutral-500'"
          >
            <component :is="address.label.toLowerCase().includes('office') ? Building : Home" :size="20" />
          </div>
          
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <span class="font-semibold text-foundation">{{ address.label }}</span>
              <span 
                v-if="address.id === '1'" 
                class="text-xs px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-zinc-800 text-neutral-500"
              >
                Default
              </span>
            </div>
            <p class="text-sm text-neutral-600">{{ address.street }}</p>
            <p v-if="address.apartment" class="text-sm text-neutral-500">{{ address.apartment }}</p>
            <p class="text-sm text-neutral-500">{{ address.neighborhood }}, {{ address.city }}</p>
            <p v-if="address.instructions" class="text-xs text-neutral-400 mt-2 italic">
              "{{ address.instructions }}"
            </p>
          </div>
        </div>
      </motion.div>

      <!-- Add New Button -->
      <button
        @click="showAddNew = true"
        class="w-full p-4 rounded-xl border-2 border-dashed border-neutral-200 dark:border-zinc-700 text-neutral-500 hover:border-primary-deep hover:text-primary-deep transition-colors flex items-center justify-center gap-2"
      >
        <Plus :size="20" />
        <span class="font-medium">Add New Address</span>
      </button>
    </div>

    <!-- Add New Address Form -->
    <div v-else-if="showAddNew" class="bg-white dark:bg-zinc-900 rounded-xl border border-neutral-100 dark:border-zinc-800 p-6">
      <div class="flex items-center justify-between mb-6">
        <h3 class="font-semibold text-foundation">Add New Address</h3>
        <button 
          v-if="checkoutStore.savedAddresses.length > 0"
          @click="showAddNew = false"
          class="text-sm text-neutral-400 hover:text-primary-deep"
        >
          Cancel
        </button>
      </div>

      <form @submit.prevent="handleAddAddress" class="space-y-4">
        <!-- Address Label -->
        <div>
          <label class="block text-sm font-medium text-neutral-600 mb-1.5">Address Label</label>
          <div class="flex gap-2">
            <button
              type="button"
              @click="newAddress.label = 'Home'"
              class="px-4 py-2 rounded-lg text-sm border transition-colors"
              :class="newAddress.label === 'Home' ? 'border-primary-deep bg-primary-deep/10 text-primary-deep' : 'border-neutral-200 text-neutral-500'"
            >
              Home
            </button>
            <button
              type="button"
              @click="newAddress.label = 'Office'"
              class="px-4 py-2 rounded-lg text-sm border transition-colors"
              :class="newAddress.label === 'Office' ? 'border-primary-deep bg-primary-deep/10 text-primary-deep' : 'border-neutral-200 text-neutral-500'"
            >
              Office
            </button>
            <button
              type="button"
              @click="newAddress.label = 'Other'"
              class="px-4 py-2 rounded-lg text-sm border transition-colors"
              :class="newAddress.label === 'Other' ? 'border-primary-deep bg-primary-deep/10 text-primary-deep' : 'border-neutral-200 text-neutral-500'"
            >
              Other
            </button>
          </div>
          <p v-if="errors.label" class="text-xs text-accent-clay mt-1">{{ errors.label }}</p>
        </div>

        <!-- Street Address -->
        <div>
          <label class="block text-sm font-medium text-neutral-600 mb-1.5">Street Address</label>
          <input
            v-model="newAddress.street"
            type="text"
            placeholder="e.g., 123 Karen Road"
            class="w-full px-4 py-2.5 rounded-lg border border-neutral-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-foundation focus:ring-2 focus:ring-primary-deep/20 focus:border-primary-deep outline-none transition-all"
          />
          <p v-if="errors.street" class="text-xs text-accent-clay mt-1">{{ errors.street }}</p>
        </div>

        <!-- Apartment/Unit -->
        <div>
          <label class="block text-sm font-medium text-neutral-600 mb-1.5">
            Apartment, Suite, Unit (Optional)
          </label>
          <input
            v-model="newAddress.apartment"
            type="text"
            placeholder="e.g., Block B, Apt 4"
            class="w-full px-4 py-2.5 rounded-lg border border-neutral-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-foundation focus:ring-2 focus:ring-primary-deep/20 focus:border-primary-deep outline-none transition-all"
          />
        </div>

        <!-- Neighborhood & City -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-neutral-600 mb-1.5">Neighborhood</label>
            <input
              v-model="newAddress.neighborhood"
              type="text"
              placeholder="e.g., Karen"
              class="w-full px-4 py-2.5 rounded-lg border border-neutral-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-foundation focus:ring-2 focus:ring-primary-deep/20 focus:border-primary-deep outline-none transition-all"
            />
            <p v-if="errors.neighborhood" class="text-xs text-accent-clay mt-1">{{ errors.neighborhood }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-neutral-600 mb-1.5">City</label>
            <input
              v-model="newAddress.city"
              type="text"
              placeholder="e.g., Nairobi"
              class="w-full px-4 py-2.5 rounded-lg border border-neutral-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-foundation focus:ring-2 focus:ring-primary-deep/20 focus:border-primary-deep outline-none transition-all"
            />
            <p v-if="errors.city" class="text-xs text-accent-clay mt-1">{{ errors.city }}</p>
          </div>
        </div>

        <!-- Delivery Instructions -->
        <div>
          <label class="block text-sm font-medium text-neutral-600 mb-1.5">
            Delivery Instructions (Optional)
          </label>
          <textarea
            v-model="newAddress.instructions"
            rows="2"
            placeholder="e.g., Gate code: 1234, Leave with security"
            class="w-full px-4 py-2.5 rounded-lg border border-neutral-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-foundation focus:ring-2 focus:ring-primary-deep/20 focus:border-primary-deep outline-none transition-all resize-none"
          />
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          class="w-full bg-primary-deep text-white font-semibold py-3 rounded-xl hover:bg-primary-deep/90 transition-colors"
        >
          Save Address
        </button>
      </form>
    </div>

    <!-- No Addresses State -->
    <div v-else class="text-center py-12 bg-white dark:bg-zinc-900 rounded-xl border border-neutral-100 dark:border-zinc-800">
      <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-100 flex items-center justify-center">
        <MapPin class="text-neutral-400" :size="28" />
      </div>
      <h3 class="font-semibold text-foundation mb-2">No saved addresses</h3>
      <p class="text-sm text-neutral-400 mb-4">Add your first delivery address to continue</p>
      <button
        @click="showAddNew = true"
        class="bg-primary-deep text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-deep/90 transition-colors inline-flex items-center gap-2"
      >
        <Plus :size="18" />
        Add Address
      </button>
    </div>

    <!-- Continue Button -->
    <div v-if="checkoutStore.savedAddresses.length > 0 && !showAddNew" class="pt-4">
      <button
        @click="handleContinue"
        :disabled="!checkoutStore.selectedAddress"
        class="w-full bg-primary-deep text-white font-semibold py-4 rounded-xl shadow-lg shadow-primary-deep/20 hover:shadow-xl hover:shadow-primary-deep/30 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
      >
        <span>Continue to Delivery</span>
        <ArrowRight :size="18" />
      </button>
    </div>
  </div>
</template>
