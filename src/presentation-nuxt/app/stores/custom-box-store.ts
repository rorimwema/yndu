import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { useCartStore } from './cart-store.ts';
import type { BoxCartItem, BoxContentItem } from '../types/cart.ts';

export const useCustomBoxStore = defineStore('customBox', () => {
  const cartStore = useCartStore();

  // State
  const size = ref<'SMALL' | 'MEDIUM' | 'LARGE'>('SMALL');
  const items = ref<BoxContentItem[]>([]);
  const step = ref(1); // Start at Step 1: Size Selection

  // Capacities (slots)
  const capacities = {
    SMALL: 12,
    MEDIUM: 20,
    LARGE: 30,
  };

  // Prices
  const basePrices = {
    SMALL: 1500,
    MEDIUM: 2500,
    LARGE: 3500,
  };

  // Getters
  const maxSlots = computed(() => capacities[size.value]);
  const usedSlots = computed(() => {
    return items.value.reduce((total, item) => total + item.slots * item.quantity, 0);
  });
  const remainingSlots = computed(() => maxSlots.value - usedSlots.value);
  const totalPrice = computed(() => basePrices[size.value] as number);
  const isFull = computed(() => usedSlots.value >= maxSlots.value);

  // Actions
  function setSize(newSize: 'SMALL' | 'MEDIUM' | 'LARGE') {
    size.value = newSize;
    // Potentially clear if downsizing and overflowing
    if (usedSlots.value > capacities[newSize]) {
      items.value = [];
    }
  }

  function addItem(
    product: {
      id: string;
      title: string;
      slots: number;
      weight?: number;
      image: string;
      price: number;
      description?: string;
    },
  ) {
    if (usedSlots.value + product.slots > maxSlots.value) return false;

    const existing = items.value.find((i) => i.produceId === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      items.value.push({
        produceId: product.id,
        name: product.title,
        quantity: 1,
        weight: product.weight || 0.5,
        slots: product.slots,
        image: product.image,
      });
    }
    return true;
  }

  function removeItem(produceId: string) {
    const index = items.value.findIndex((i) => i.produceId === produceId);
    if (index > -1) {
      const item = items.value[index];
      if (item && item.quantity > 1) {
        item.quantity -= 1;
      } else {
        items.value.splice(index, 1);
      }
    }
  }

  function clearItem(produceId: string) {
    items.value = items.value.filter((i) => i.produceId !== produceId);
  }

  function resetBox() {
    items.value = [];
  }

  function addBoxToCart() {
    if (items.value.length === 0) return;

    const boxItem: BoxCartItem = {
      id: `custom_box_${Date.now()}`,
      productId: `custom_box_${size.value.toLowerCase()}`,
      name: `Custom ${size.value.charAt(0) + size.value.slice(1).toLowerCase()} Box`,
      price: totalPrice.value,
      quantity: 1,
      weight: items.value.reduce((t, i) => t + i.weight * i.quantity, 0),
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800',
      unit: 'box',
      type: 'box',
      size: size.value,
      contents: [...items.value],
    };

    cartStore.addBox(boxItem);
    cartStore.openCart();
    resetBox();
  }

  return {
    size,
    items,
    step,
    maxSlots,
    usedSlots,
    remainingSlots,
    totalPrice,
    isFull,
    setSize,
    addItem,
    removeItem,
    clearItem,
    resetBox,
    addBoxToCart,
  };
});
