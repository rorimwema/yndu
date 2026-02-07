import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { CartItem, CartItemType, AddToCartInput, BoxCartItem } from '../types/cart';

const STORAGE_KEY = 'yndu_cart';

export const useCartStore = defineStore('cart', () => {
    // State
    const items = ref<CartItemType[]>([]);
    const isOpen = ref(false);
    const isLoading = ref(false);
    const error = ref<string | null>(null);
    const justAdded = ref<string | null>(null);

    // Getters
    const itemCount = computed(() => {
        return items.value.reduce((total: number, item: CartItemType) => total + item.quantity, 0);
    });

    const totalPrice = computed(() => {
        return items.value.reduce((total: number, item: CartItemType) => total + item.price * item.quantity, 0);
    });

    const totalWeight = computed(() => {
        const isBoxItem = (item: CartItemType): item is BoxCartItem => {
            return (item as BoxCartItem).type === 'box' && Array.isArray((item as BoxCartItem).contents);
        };

        return items.value.reduce((total: number, item: CartItemType) => {
            const itemWeight = isBoxItem(item)
                ? item.contents.reduce((w: number, c: { weight: number }) => w + c.weight, 0)
                : item.weight * item.quantity;
            return total + itemWeight;
        }, 0);
    });

    const isEmpty = computed(() => items.value.length === 0);

    const uniqueItemCount = computed(() => items.value.length);

    const cartTotals = computed(() => {
        const subtotal = totalPrice.value;
        const delivery = subtotal > 2000 ? 0 : 150; // Free delivery over 2000 KSh
        return {
            subtotal,
            delivery,
            total: subtotal + delivery,
        };
    });

    // Actions
    function addItem(input: AddToCartInput): void {
        isLoading.value = true;
        error.value = null;

        try {
            const existingItem = items.value.find((item: CartItemType) => item.productId === input.productId);

            if (existingItem) {
                existingItem.quantity += input.quantity;
            } else {
                const newItem: CartItem = {
                    id: `${input.productId}_${Date.now()}`,
                    productId: input.productId,
                    name: input.name,
                    price: input.price,
                    quantity: input.quantity,
                    weight: input.weight,
                    image: input.image,
                    unit: input.unit,
                };
                items.value.push(newItem);
            }

            // Trigger "just added" animation
            justAdded.value = input.productId;
            setTimeout(() => {
                justAdded.value = null;
            }, 1500);

            saveToStorage();
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to add item to cart';
        } finally {
            isLoading.value = false;
        }
    }

    function addBox(boxItem: BoxCartItem): void {
        isLoading.value = true;
        error.value = null;

        try {
            items.value.push(boxItem);
            saveToStorage();
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to add box to cart';
        } finally {
            isLoading.value = false;
        }
    }

    function removeItem(productId: string): void {
        const index = items.value.findIndex((item: CartItemType) => item.productId === productId);
        if (index > -1) {
            items.value.splice(index, 1);
            saveToStorage();
        }
    }

    function updateQuantity(productId: string, quantity: number): void {
        if (quantity <= 0) {
            removeItem(productId);
            return;
        }

        const item = items.value.find((item: CartItemType) => item.productId === productId);
        if (item) {
            item.quantity = quantity;
            saveToStorage();
        }
    }

    function incrementQuantity(productId: string): void {
        const item = items.value.find((item: CartItemType) => item.productId === productId);
        if (item) {
            item.quantity += 1;
            saveToStorage();
        }
    }

    function decrementQuantity(productId: string): void {
        const item = items.value.find((item: CartItemType) => item.productId === productId);
        if (item) {
            if (item.quantity <= 1) {
                removeItem(productId);
            } else {
                item.quantity -= 1;
                saveToStorage();
            }
        }
    }

    function clearCart(): void {
        items.value = [];
        saveToStorage();
    }

    function toggleCart(): void {
        isOpen.value = !isOpen.value;
    }

    function openCart(): void {
        isOpen.value = true;
    }

    function closeCart(): void {
        isOpen.value = false;
    }

    function clearError(): void {
        error.value = null;
    }

    // Persistence
    function saveToStorage(): void {
        if (import.meta.server) return;
        try {
            const data = JSON.stringify({
                items: items.value,
                savedAt: new Date().toISOString(),
            });
            localStorage.setItem(STORAGE_KEY, data);
        } catch (err) {
            console.error('Failed to save cart to storage:', err);
        }
    }

    function loadFromStorage(): void {
        if (import.meta.server) return;
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            if (data) {
                const parsed = JSON.parse(data);
                // Check if cart is not too old (7 days)
                const savedAt = new Date(parsed.savedAt);
                const now = new Date();
                const daysDiff = (now.getTime() - savedAt.getTime()) / (1000 * 60 * 60 * 24);

                if (daysDiff < 7 && Array.isArray(parsed.items)) {
                    items.value = parsed.items;
                } else {
                    localStorage.removeItem(STORAGE_KEY);
                }
            }
        } catch (err) {
            console.error('Failed to load cart from storage:', err);
        }
    }

    // Initialize from storage on store creation (client-side only)
    loadFromStorage();

    return {
        // State
        items,
        isOpen,
        isLoading,
        error,
        justAdded,
        // Getters
        itemCount,
        totalPrice,
        totalWeight,
        isEmpty,
        uniqueItemCount,
        cartTotals,
        // Actions
        addItem,
        addBox,
        removeItem,
        updateQuantity,
        incrementQuantity,
        decrementQuantity,
        clearCart,
        toggleCart,
        openCart,
        closeCart,
        clearError,
        saveToStorage,
        loadFromStorage,
    };
});
