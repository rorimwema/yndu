<script setup lang="ts">
import { ref } from 'vue';
import { useBoxBuilder } from '../composables/useBoxBuilder';

const selectedSize = ref<'SMALL' | 'MEDIUM' | 'LARGE'>('MEDIUM');

// Demo inventory items
const inventory = new Map([
  ['tomato', { id: 'tomato', name: 'Tomatoes', unitPrice: 50, weightPerUnit: 0.5 }],
  ['onion', { id: 'onion', name: 'Onions', unitPrice: 30, weightPerUnit: 0.3 }],
  ['spinach', { id: 'spinach', name: 'Spinach', unitPrice: 40, weightPerUnit: 0.4 }],
  ['carrot', { id: 'carrot', name: 'Carrots', unitPrice: 35, weightPerUnit: 0.6 }],
]);

const { selections, currentWeight, currentPrice, canAddItem, addItem, build } = useBoxBuilder(selectedSize.value, inventory);

const placeOrder = () => {
  console.log('Order placed:', build());
};
</script>

<template>
  <div class="space-y-8">
    <!-- Hero Section -->
    <section class="text-center py-12">
      <h1 class="text-4xl md:text-5xl font-bold text-flexoki mb-4">
        Fresh Produce Delivered to Your Door
      </h1>
      <p class="text-xl text-flexoki-muted max-w-2xl mx-auto">
        Customizable produce boxes from local farms. Same-day delivery available.
      </p>
    </section>

    <!-- Box Builder Demo -->
    <section class="card-flexoki p-6 max-w-2xl mx-auto">
      <h2 class="text-2xl font-semibold text-flexoki mb-6">Build Your Box</h2>
      
      <!-- Size Selection -->
      <div class="flex gap-4 mb-6">
        <button 
          v-for="size in ['SMALL', 'MEDIUM', 'LARGE']" 
          :key="size"
          @click="selectedSize = size"
          :class="[
            'px-6 py-3 rounded-lg font-medium transition-all',
            selectedSize === size 
              ? 'btn-primary' 
              : 'bg-flexoki-100 text-flexoki-700 hover:bg-flexoki-200'
          ]"
        >
          {{ size }}
        </button>
      </div>

      <!-- Inventory Grid -->
      <div class="grid grid-cols-2 gap-4 mb-6">
        <div 
          v-for="[id, item] in inventory" 
          :key="id"
          class="card-flexoki p-4 flex justify-between items-center"
        >
          <div>
            <h3 class="font-medium text-flexoki">{{ item.name }}</h3>
            <p class="text-sm text-flexoki-muted">KES {{ item.unitPrice }}/kg</p>
          </div>
          <button 
            @click="addItem(id, 1)"
            :disabled="!canAddItem(id, 1)"
            :class="[
              'px-3 py-1 rounded text-sm font-medium transition-all',
              canAddItem(id, 1)
                ? 'btn-primary'
                : 'bg-flexoki-200 text-flexoki-400 cursor-not-allowed'
            ]"
          >
            Add
          </button>
        </div>
      </div>

      <!-- Summary -->
      <div class="border-t border-flexoki pt-4 space-y-2">
        <div class="flex justify-between text-flexoki">
          <span>Weight:</span>
          <span class="font-medium">{{ currentWeight.toFixed(2) }} kg</span>
        </div>
        <div class="flex justify-between text-flexoki">
          <span>Items:</span>
          <span class="font-medium">{{ selections.size }}</span>
        </div>
        <div class="flex justify-between text-xl font-bold text-flexoki-primary">
          <span>Total:</span>
          <span>KES {{ currentPrice }}</span>
        </div>
      </div>

      <!-- Action Button -->
      <button 
        @click="placeOrder"
        :disabled="selections.size === 0"
        class="w-full mt-6 py-3 rounded-lg font-semibold text-white transition-all"
        :class="selections.size > 0 ? 'btn-primary' : 'bg-flexoki-300 cursor-not-allowed'"
      >
        Place Order
      </button>
    </section>

    <!-- Features Grid -->
    <section class="grid md:grid-cols-3 gap-6">
      <div class="card-flexoki p-6 text-center">
        <div class="w-12 h-12 bg-flexoki-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <span class="text-2xl">🥬</span>
        </div>
        <h3 class="font-semibold text-flexoki mb-2">Fresh & Local</h3>
        <p class="text-flexoki-muted text-sm">Sourced directly from Kibwezi farms</p>
      </div>
      
      <div class="card-flexoki p-6 text-center">
        <div class="w-12 h-12 bg-flexoki-warning/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <span class="text-2xl">⚡</span>
        </div>
        <h3 class="font-semibold text-flexoki mb-2">Same-Day Delivery</h3>
        <p class="text-flexoki-muted text-sm">Order before 10 AM for same-day</p>
      </div>
      
      <div class="card-flexoki p-6 text-center">
        <div class="w-12 h-12 bg-flexoki-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <span class="text-2xl">📦</span>
        </div>
        <h3 class="font-semibold text-flexoki mb-2">Customizable Boxes</h3>
        <p class="text-flexoki-muted text-sm">Choose exactly what you want</p>
      </div>
    </section>
  </div>
</template>
