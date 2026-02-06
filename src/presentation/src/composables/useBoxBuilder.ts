import { ref, computed } from 'vue';

export type BoxSize = 'SMALL' | 'MEDIUM' | 'LARGE';

export interface BoxRules {
  maxWeight: number;
  basePrice: number;
  maxItems: number;
}

export const ORDER_RULES: Record<BoxSize, BoxRules> = {
  SMALL: {
    maxWeight: 5,
    basePrice: 500,
    maxItems: 8,
  },
  MEDIUM: {
    maxWeight: 10,
    basePrice: 900,
    maxItems: 15,
  },
  LARGE: {
    maxWeight: 20,
    basePrice: 1500,
    maxItems: 25,
  },
};

export interface ProduceItem {
  id: string;
  name: string;
  unitPrice: number;
  weightPerUnit: number;
}

export interface BoxSelection {
  produceId: string;
  quantity: number;
}

export function useBoxBuilder(size: BoxSize, inventory: Map<string, ProduceItem>) {
  const selections = ref<Map<string, number>>(new Map());

  const rules = computed(() => ORDER_RULES[size]);

  const currentWeight = computed(() => {
    let total = 0;
    for (const [itemId, qty] of selections.value) {
      const item = inventory.get(itemId);
      if (item) total += item.weightPerUnit * qty;
    }
    return total;
  });

  const remainingWeight = computed(() => {
    return rules.value.maxWeight - currentWeight.value;
  });

  const currentPrice = computed(() => {
    let total = rules.value.basePrice;
    for (const [itemId, qty] of selections.value) {
      const item = inventory.get(itemId);
      if (item) total += item.unitPrice * qty;
    }
    return total;
  });

  const itemCount = computed(() => {
    let count = 0;
    for (const qty of selections.value.values()) {
      count += qty;
    }
    return count;
  });

  const canAddItem = (itemId: string, quantity: number): boolean => {
    const item = inventory.get(itemId);
    if (!item) return false;
    
    const newWeight = currentWeight.value + (item.weightPerUnit * quantity);
    const newCount = itemCount.value + quantity;
    
    return newWeight <= rules.value.maxWeight && newCount <= rules.value.maxItems;
  };

  const addItem = (itemId: string, quantity: number): { success: boolean; error?: string } => {
    if (!canAddItem(itemId, quantity)) {
      return { success: false, error: 'Would exceed box weight or item limit' };
    }
    
    const current = selections.value.get(itemId) ?? 0;
    selections.value.set(itemId, current + quantity);
    return { success: true };
  };

  const removeItem = (itemId: string) => {
    selections.value.delete(itemId);
  };

  const updateQuantity = (itemId: string, quantity: number): { success: boolean; error?: string } => {
    if (quantity <= 0) {
      removeItem(itemId);
      return { success: true };
    }
    
    const item = inventory.get(itemId);
    if (!item) return { success: false, error: 'Item not found' };
    
    const currentQty = selections.value.get(itemId) ?? 0;
    const diff = quantity - currentQty;
    
    if (diff > 0) {
      return addItem(itemId, diff);
    } else {
      selections.value.set(itemId, quantity);
      return { success: true };
    }
  };

  const build = () => ({
    size,
    selections: Array.from(selections.value.entries()).map(([id, qty]) => ({
      produceId: id,
      quantity: qty,
    })),
    totalWeight: currentWeight.value,
    totalPrice: currentPrice.value,
    itemCount: itemCount.value,
  });

  const clear = () => {
    selections.value.clear();
  };

  return {
    selections,
    currentWeight,
    remainingWeight,
    currentPrice,
    itemCount,
    canAddItem,
    addItem,
    removeItem,
    updateQuantity,
    build,
    clear,
  };
}
