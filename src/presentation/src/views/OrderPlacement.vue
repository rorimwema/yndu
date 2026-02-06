<template>
  <div class="order-placement">
    <h1>Place Your Order</h1>
    
    <div class="box-builder">
      <h2>Select Box Size</h2>
      <div class="size-selector">
        <button 
          v-for="size in boxSizes" 
          :key="size"
          :class="{ active: selectedSize === size }"
          @click="selectBoxSize(size)"
        >
          {{ size }} Box
        </button>
      </div>
      
      <div v-if="selectedSize" class="box-details">
        <p>Max Weight: {{ rules.maxWeight }}kg</p>
        <p>Base Price: KES {{ rules.basePrice }}</p>
        <p>Max Items: {{ rules.maxItems }}</p>
        
        <div class="produce-selector">
          <h3>Add Produce Items</h3>
          <div class="inventory-grid">
            <div 
              v-for="item in inventory" 
              :key="item.id"
              class="inventory-item"
              :class="{ disabled: !canAddItem(item.id, 1) }"
            >
              <span>{{ item.name }}</span>
              <span>KES {{ item.unitPrice }}/kg</span>
              <button 
                @click="addItem(item.id, 1)"
                :disabled="!canAddItem(item.id, 1)"
              >
                Add
              </button>
            </div>
          </div>
        </div>
        
        <div class="current-selections">
          <h3>Current Selections</h3>
          <div 
            v-for="[itemId, qty] in selections" 
            :key="itemId"
            class="selection-item"
          >
            <span>{{ getItemName(itemId) }}: {{ qty }}</span>
            <button @click="removeItem(itemId)">Remove</button>
          </div>
          
          <div class="totals">
            <p>Total Weight: {{ currentWeight.toFixed(2) }}kg / {{ rules.maxWeight }}kg</p>
            <p>Total Price: KES {{ currentPrice }}</p>
          </div>
        </div>
      </div>
    </div>
    
    <div class="delivery-slot">
      <h2>Select Delivery Date</h2>
      <input 
        type="date" 
        v-model="deliveryDate"
        :min="minDate"
      />
      <p>{{ deliveryDisplay }}</p>
    </div>
    
    <button 
      @click="placeOrder"
      :disabled="!canPlaceOrder || isLoading"
      class="place-order-btn"
    >
      {{ isLoading ? 'Placing Order...' : 'Place Order' }}
    </button>
    
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useOrderStore } from '../stores/orderStore';
import { useBoxBuilder, BoxSize, ProduceItem } from '../composables/useBoxBuilder';
import { useDeliverySlot } from '../composables/useDeliverySlot';

const orderStore = useOrderStore();
const selectedSize = ref<BoxSize>('SMALL');
const deliveryDateInput = ref('');

const boxSizes: BoxSize[] = ['SMALL', 'MEDIUM', 'LARGE'];

const inventory = ref<ProduceItem[]>([
  { id: '1', name: 'Tomatoes', unitPrice: 50, weightPerUnit: 0.5 },
  { id: '2', name: 'Onions', unitPrice: 30, weightPerUnit: 0.3 },
  { id: '3', name: 'Spinach', unitPrice: 40, weightPerUnit: 0.4 },
  { id: '4', name: 'Carrots', unitPrice: 35, weightPerUnit: 0.6 },
]);

const inventoryMap = computed(() => {
  const map = new Map<string, ProduceItem>();
  inventory.value.forEach(item => map.set(item.id, item));
  return map;
});

const { 
  selections, 
  currentWeight, 
  currentPrice, 
  rules,
  canAddItem, 
  addItem, 
  removeItem, 
  build 
} = useBoxBuilder(selectedSize.value, inventoryMap.value);

const { slotType, deliveryDisplay, setDate } = useDeliverySlot();

const deliveryDate = computed({
  get: () => deliveryDateInput.value,
  set: (val) => {
    deliveryDateInput.value = val;
    setDate(new Date(val));
  }
});

const minDate = computed(() => {
  return new Date().toISOString().split('T')[0];
});

const canPlaceOrder = computed(() => {
  return selections.value.size > 0 && currentPrice.value > 0 && deliveryDate.value;
});

const isLoading = computed(() => orderStore.isLoading);
const error = computed(() => orderStore.error);

function selectBoxSize(size: BoxSize) {
  selectedSize.value = size;
}

function getItemName(itemId: string): string {
  return inventoryMap.value.get(itemId)?.name || 'Unknown';
}

async function placeOrder() {
  if (!canPlaceOrder.value) return;
  
  orderStore.setLoading(true);
  orderStore.clearError();
  
  try {
    const boxData = build();
    
    // TODO: Call GraphQL mutation
    console.log('Placing order:', {
      size: boxData.size,
      items: boxData.selections,
      totalPrice: boxData.totalPrice,
      deliveryDate: deliveryDate.value,
      slotType: slotType.value,
    });
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Reset form
    selections.value.clear();
    deliveryDateInput.value = '';
    
  } catch (err) {
    orderStore.setError(err instanceof Error ? err.message : 'Failed to place order');
  } finally {
    orderStore.setLoading(false);
  }
}
</script>

<style scoped>
.order-placement {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.size-selector {
  display: flex;
  gap: 10px;
  margin: 20px 0;
}

.size-selector button {
  padding: 10px 20px;
  border: 2px solid #ddd;
  background: white;
  cursor: pointer;
}

.size-selector button.active {
  background: #4CAF50;
  color: white;
  border-color: #4CAF50;
}

.inventory-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
  margin: 20px 0;
}

.inventory-item {
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.inventory-item.disabled {
  opacity: 0.5;
}

.current-selections {
  background: #f5f5f5;
  padding: 20px;
  border-radius: 4px;
  margin: 20px 0;
}

.selection-item {
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
  border-bottom: 1px solid #ddd;
}

.totals {
  margin-top: 20px;
  font-weight: bold;
}

.delivery-slot {
  margin: 20px 0;
}

.delivery-slot input {
  padding: 10px;
  font-size: 16px;
}

.place-order-btn {
  width: 100%;
  padding: 15px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 18px;
  cursor: pointer;
}

.place-order-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.error {
  color: red;
  margin-top: 10px;
}
</style>
