import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { useCartStore } from './cart-store.ts';

export interface Address {
  id?: string;
  label: string;
  street: string;
  apartment?: string;
  neighborhood: string;
  city: string;
  instructions?: string;
}

export interface DeliverySlot {
  date: string;
  dayOfWeek: string;
  timeRange: string;
  type: 'TUESDAY' | 'FRIDAY';
}

export interface PaymentMethod {
  type: 'mpesa' | 'card' | 'cash';
  label: string;
  phoneNumber?: string;
  lastFour?: string;
}

export interface OrderResponse {
  id: string;
  userId: string;
  status: string;
  totalPrice: { amount: number; currency: string };
  deliverySlot: { date: string; type: string };
  createdAt: string;
}

export const useCheckoutStore = defineStore('checkout', () => {
  const cartStore = useCartStore();

  // State
  const step = ref(1);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const orderComplete = ref(false);
  const orderId = ref<string | null>(null);

  // Form Data
  const selectedAddress = ref<Address | null>(null);
  const selectedSlot = ref<DeliverySlot | null>(null);
  const selectedPayment = ref<PaymentMethod | null>(null);
  const phoneNumber = ref('');
  const specialInstructions = ref('');

  // Saved addresses (mock for now - would come from API)
  const savedAddresses = ref<Address[]>([
    {
      id: '1',
      label: 'Home',
      street: '123 Karen Road',
      apartment: 'Block B, Apt 4',
      neighborhood: 'Karen',
      city: 'Nairobi',
      instructions: 'Gate code: 1234',
    },
    {
      id: '2',
      label: 'Office',
      street: '456 Ngong Road',
      neighborhood: 'Kilimani',
      city: 'Nairobi',
    },
  ]);

  // Available delivery slots
  const availableSlots = computed<DeliverySlot[]>(() => {
    const slots: DeliverySlot[] = [];
    const today = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // Generate next 4 delivery dates (Tuesdays and Fridays)
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dayOfWeek = date.getDay();

      // Tuesday = 2, Friday = 5
      if (dayOfWeek === 2 || dayOfWeek === 5) {
        const dateStr = date.toISOString().split('T')[0];
        const dayName = days[dayOfWeek];
        const isTuesday = dayOfWeek === 2;

        slots.push({
          date: dateStr,
          dayOfWeek: dayName,
          timeRange: isTuesday ? '9:00 AM - 1:00 PM' : '2:00 PM - 6:00 PM',
          type: isTuesday ? 'TUESDAY' : 'FRIDAY',
        });
      }
    }

    return slots.slice(0, 4);
  });

  // Payment methods
  const paymentMethods: PaymentMethod[] = [
    { type: 'mpesa', label: 'M-Pesa' },
    { type: 'card', label: 'Credit/Debit Card' },
    { type: 'cash', label: 'Cash on Delivery' },
  ];

  // Validation
  const canProceedToDelivery = computed(() => {
    return selectedAddress.value !== null;
  });

  const canProceedToPayment = computed(() => {
    return selectedAddress.value !== null && selectedSlot.value !== null;
  });

  const canCompleteOrder = computed(() => {
    if (!selectedAddress.value || !selectedSlot.value || !selectedPayment.value) {
      return false;
    }
    // M-Pesa requires phone number
    if (selectedPayment.value.type === 'mpesa' && !phoneNumber.value) {
      return false;
    }
    return true;
  });

  // Steps configuration
  const steps = [
    { id: 1, title: 'Address', description: 'Delivery location' },
    { id: 2, title: 'Delivery', description: 'Choose date & time' },
    { id: 3, title: 'Payment', description: "How you'll pay" },
    { id: 4, title: 'Review', description: 'Confirm order' },
  ];

  // Actions
  function setStep(newStep: number) {
    // Validate step progression
    if (newStep > step.value) {
      if (newStep === 2 && !canProceedToDelivery.value) return;
      if (newStep === 3 && !canProceedToPayment.value) return;
      if (newStep === 4 && !canProceedToPayment.value) return;
    }
    step.value = newStep;
  }

  function selectAddress(address: Address) {
    selectedAddress.value = address;
  }

  function addNewAddress(address: Omit<Address, 'id'>) {
    const newAddress: Address = {
      ...address,
      id: `addr_${Date.now()}`,
    };
    savedAddresses.value.push(newAddress);
    selectedAddress.value = newAddress;
  }

  function selectSlot(slot: DeliverySlot) {
    selectedSlot.value = slot;
  }

  function selectPayment(method: PaymentMethod) {
    selectedPayment.value = method;
  }

  function setPhoneNumber(phone: string) {
    phoneNumber.value = phone;
  }

  function setSpecialInstructions(instructions: string) {
    specialInstructions.value = instructions;
  }

  async function submitOrder(): Promise<boolean> {
    if (!canCompleteOrder.value) return false;

    isLoading.value = true;
    error.value = null;

    try {
      // Get current user session
      const { user } = useUserSession();

      if (!user.value?.id) {
        error.value = 'You must be logged in to place an order';
        return false;
      }

      if (!selectedAddress.value?.id) {
        error.value = 'Please select a delivery address';
        return false;
      }

      if (!selectedSlot.value?.date) {
        error.value = 'Please select a delivery slot';
        return false;
      }

      // Map cart items to backend format
      const orderItems = cartStore.items.map((item) => {
        // For regular cart items, productId is the produceId
        // For box items, we handle them differently if needed
        return {
          produceId: item.productId,
          quantity: item.quantity,
        };
      });

      if (orderItems.length === 0) {
        error.value = 'Your cart is empty';
        return false;
      }

      // Prepare request body
      const requestBody = {
        userId: user.value.id,
        items: orderItems,
        deliveryAddressId: selectedAddress.value.id,
        preferredDeliveryDate: selectedSlot.value.date,
        isSubscription: false,
      };

      // Call the backend API
      const response = await $fetch<OrderResponse>('/api/orders', {
        method: 'POST',
        body: requestBody,
      });

      // Store the returned order ID
      orderId.value = response.id;
      orderComplete.value = true;

      // Clear cart after successful order
      cartStore.clearCart();

      return true;
    } catch (err: unknown) {
      // Handle different error types
      if (err?.data?.error) {
        error.value = err.data.error;
      } else if (err?.data?.message) {
        error.value = err.data.message;
      } else if (err instanceof Error) {
        error.value = err.message;
      } else {
        error.value = 'Failed to place order. Please try again.';
      }
      console.error('Submit order error:', err);
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  function resetCheckout() {
    step.value = 1;
    selectedAddress.value = null;
    selectedSlot.value = null;
    selectedPayment.value = null;
    phoneNumber.value = '';
    specialInstructions.value = '';
    orderComplete.value = false;
    orderId.value = null;
    error.value = null;
  }

  return {
    // State
    step,
    isLoading,
    error,
    orderComplete,
    orderId,
    selectedAddress,
    selectedSlot,
    selectedPayment,
    phoneNumber,
    specialInstructions,
    savedAddresses,
    availableSlots,
    paymentMethods,
    steps,
    // Computed
    canProceedToDelivery,
    canProceedToPayment,
    canCompleteOrder,
    // Actions
    setStep,
    selectAddress,
    addNewAddress,
    selectSlot,
    selectPayment,
    setPhoneNumber,
    setSpecialInstructions,
    submitOrder,
    resetCheckout,
  };
});
