import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalPrice: number;
  status: string;
  deliveryDate: string;
  slotType: 'SAME_DAY' | 'NEXT_DAY';
}

export interface OrderItem {
  produceId: string;
  quantity: number;
  unit: string;
  linePrice: number;
}

export const useOrderStore = defineStore('orders', () => {
  const currentOrder = ref<Order | null>(null);
  const userOrders = ref<Order[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const canPlaceOrder = computed(() => {
    return currentOrder.value?.items.length && currentOrder.value.totalPrice > 0;
  });

  const orderTotal = computed(() => {
    return currentOrder.value?.totalPrice || 0;
  });

  function setCurrentOrder(order: Order | null) {
    currentOrder.value = order;
  }

  function addItemToOrder(item: OrderItem) {
    if (!currentOrder.value) {
      currentOrder.value = {
        id: '',
        userId: '',
        items: [],
        totalPrice: 0,
        status: 'PENDING',
        deliveryDate: '',
        slotType: 'NEXT_DAY',
      };
    }
    currentOrder.value.items.push(item);
    currentOrder.value.totalPrice += item.linePrice;
  }

  function removeItemFromOrder(index: number) {
    if (currentOrder.value) {
      const item = currentOrder.value.items[index];
      currentOrder.value.totalPrice -= item.linePrice;
      currentOrder.value.items.splice(index, 1);
    }
  }

  function setUserOrders(orders: Order[]) {
    userOrders.value = orders;
  }

  function setLoading(loading: boolean) {
    isLoading.value = loading;
  }

  function setError(err: string | null) {
    error.value = err;
  }

  function clearCurrentOrder() {
    currentOrder.value = null;
  }

  function clearError() {
    error.value = null;
  }

  return {
    currentOrder,
    userOrders,
    isLoading,
    error,
    canPlaceOrder,
    orderTotal,
    setCurrentOrder,
    addItemToOrder,
    removeItemFromOrder,
    setUserOrders,
    setLoading,
    setError,
    clearCurrentOrder,
    clearError,
  };
});
