import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type {
  CreateSubscriptionInput as _CreateSubscriptionInput,
  DeliveryDay,
  ModifySubscriptionInput,
  PauseRecord as _PauseRecord,
  PaymentMode,
  SubscriptionAddress,
  SubscriptionApiResponse as _SubscriptionApiResponse,
  SubscriptionBoxSize,
  SubscriptionDetail,
  SubscriptionFrequency,
  SubscriptionItem,
  SubscriptionPricing,
} from '../types/subscription.ts';
import {
  BOX_SIZE_CONFIG,
  DELIVERY_DAY_CONFIG,
  FREQUENCY_CONFIG,
  PAYMENT_MODE_CONFIG,
} from '../types/subscription.ts';

const API_BASE = '/api/subscriptions';

const STORAGE_KEY = 'yndu_subscription_setup';

export const useSubscriptionStore = defineStore('subscription', () => {
  // State
  const frequency = ref<SubscriptionFrequency>('WEEKLY');
  const boxSize = ref<SubscriptionBoxSize>('MEDIUM');
  const deliveryDay = ref<DeliveryDay>('TUESDAY');
  const paymentMode = ref<PaymentMode>('WEEKLY');
  const customItems = ref<SubscriptionItem[]>([]);
  const selectedAddress = ref<SubscriptionAddress | null>(null);
  const step = ref(1);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const boxConfig = computed(() => BOX_SIZE_CONFIG[boxSize.value]);
  const frequencyConfig = computed(() => FREQUENCY_CONFIG[frequency.value]);
  const deliveryDayConfig = computed(() => DELIVERY_DAY_CONFIG[deliveryDay.value]);
  const paymentModeConfig = computed(() => PAYMENT_MODE_CONFIG[paymentMode.value]);

  const basePrice = computed(() => boxConfig.value.basePrice);

  const pricing = computed<SubscriptionPricing>(() => {
    const base = basePrice.value;
    const freqDiscount = base * (frequencyConfig.value.discount / 100);
    const paymentDiscount = base * (paymentModeConfig.value.discount / 100);
    const finalPrice = base - freqDiscount - paymentDiscount;

    return {
      basePrice: base,
      frequencyDiscount: freqDiscount,
      paymentModeDiscount: paymentDiscount,
      finalPrice: finalPrice,
      weeklyEquivalent: frequency.value === 'WEEKLY'
        ? finalPrice
        : finalPrice / (frequency.value === 'BIWEEKLY' ? 2 : 4),
    };
  });

  const monthlyEstimate = computed(() => {
    const weeklyPrice = pricing.value.weeklyEquivalent;
    return weeklyPrice * 4; // Approximate 4 weeks per month
  });

  const canProceedToAddress = computed(() => {
    return frequency.value && boxSize.value && deliveryDay.value && paymentMode.value;
  });

  const canCreateSubscription = computed(() => {
    return canProceedToAddress.value && selectedAddress.value !== null;
  });

  const subscriptionSummary = computed(() => {
    return {
      frequency: frequencyConfig.value.label,
      boxSize: boxConfig.value.name,
      deliveryDay: deliveryDayConfig.value.label,
      deliveryTime: deliveryDayConfig.value.timeRange,
      paymentMode: paymentModeConfig.value.label,
      basePrice: pricing.value.basePrice,
      totalDiscounts: pricing.value.frequencyDiscount + pricing.value.paymentModeDiscount,
      finalPrice: pricing.value.finalPrice,
      monthlyEstimate: monthlyEstimate.value,
      address: selectedAddress.value,
    };
  });

  // Actions
  function setFrequency(newFrequency: SubscriptionFrequency) {
    frequency.value = newFrequency;
    saveToStorage();
  }

  function setBoxSize(newSize: SubscriptionBoxSize) {
    boxSize.value = newSize;
    // Clear custom items if they don't fit in new size
    const maxSlots = BOX_SIZE_CONFIG[newSize].slots;
    const usedSlots = customItems.value.reduce(
      (total, item) => total + item.slots * item.quantity,
      0,
    );
    if (usedSlots > maxSlots) {
      customItems.value = [];
    }
    saveToStorage();
  }

  function setDeliveryDay(newDay: DeliveryDay) {
    deliveryDay.value = newDay;
    saveToStorage();
  }

  function setPaymentMode(newMode: PaymentMode) {
    paymentMode.value = newMode;
    saveToStorage();
  }

  function setStep(newStep: number) {
    step.value = newStep;
  }

  function selectAddress(address: SubscriptionAddress) {
    selectedAddress.value = address;
    saveToStorage();
  }

  function addCustomItem(item: Omit<SubscriptionItem, 'weight'> & { weight?: number }) {
    const maxSlots = boxConfig.value.slots;
    const usedSlots = customItems.value.reduce((total, i) => total + i.slots * i.quantity, 0);

    if (usedSlots + item.slots > maxSlots) {
      return false;
    }

    const existing = customItems.value.find((i) => i.produceId === item.produceId);
    if (existing) {
      existing.quantity += 1;
    } else {
      customItems.value.push({
        ...item,
        weight: item.weight || 0.5,
      });
    }
    saveToStorage();
    return true;
  }

  function removeCustomItem(produceId: string) {
    const index = customItems.value.findIndex((i) => i.produceId === produceId);
    if (index > -1) {
      const item = customItems.value[index];
      if (item.quantity > 1) {
        item.quantity -= 1;
      } else {
        customItems.value.splice(index, 1);
      }
      saveToStorage();
    }
  }

  function clearCustomItems() {
    customItems.value = [];
    saveToStorage();
  }

  function resetSetup() {
    frequency.value = 'WEEKLY';
    boxSize.value = 'MEDIUM';
    deliveryDay.value = 'TUESDAY';
    paymentMode.value = 'WEEKLY';
    customItems.value = [];
    selectedAddress.value = null;
    step.value = 1;
    saveToStorage();
  }

  async function createSubscription(): Promise<boolean> {
    if (!canCreateSubscription.value) return false;

    isLoading.value = true;
    error.value = null;

    try {
      // Get current user session
      const { user } = useUserSession();

      if (!user.value?.id) {
        error.value = 'User not authenticated';
        return false;
      }

      if (!selectedAddress.value?.id) {
        error.value = 'No delivery address selected';
        return false;
      }

      // Calculate the next occurrence of the preferred delivery day
      const preferredDeliveryDate = getNextDeliveryDate(deliveryDay.value);

      // Map custom items to backend format (if any)
      const items = customItems.value.length > 0
        ? customItems.value.map((item) => ({
          produceId: item.produceId,
          quantity: item.quantity,
          weight: item.weight,
        }))
        : undefined;

      // Prepare the API request body
      const requestBody = {
        userId: user.value.id,
        planName: boxConfig.value.name,
        planPriceCents: Math.round(pricing.value.finalPrice),
        billingCycle: frequency.value,
        deliveryAddressId: selectedAddress.value.id,
        preferredDeliveryDate: preferredDeliveryDate.toISOString(),
        ...(items && { items }),
      };

      // Call the real backend API
      const _response = await $fetch('/api/subscriptions', {
        method: 'POST',
        body: requestBody,
      });

      // Clear setup after successful creation
      resetSetup();

      return true;
    } catch (err: unknown) {
      error.value = err?.data?.error || err?.message || 'Failed to create subscription';
      console.error('Create subscription error:', err);
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Helper function to calculate the next occurrence of a delivery day
   */
  function getNextDeliveryDate(day: DeliveryDay): Date {
    const dayMap: Record<DeliveryDay, number> = {
      TUESDAY: 2, // JavaScript Date: 0=Sunday, 2=Tuesday
      FRIDAY: 5, // 5=Friday
    };

    const targetDay = dayMap[day];
    const now = new Date();
    const result = new Date(now);

    // Set to next occurrence of the target day
    result.setDate(now.getDate() + ((targetDay + 7 - now.getDay()) % 7));

    // If today is the target day, move to next week
    if (result.getDate() === now.getDate()) {
      result.setDate(result.getDate() + 7);
    }

    // Set to start of day for consistent delivery date
    result.setHours(0, 0, 0, 0);

    return result;
  }

  // Persistence
  function saveToStorage() {
    if (import.meta.server) return;
    try {
      const data = JSON.stringify({
        frequency: frequency.value,
        boxSize: boxSize.value,
        deliveryDay: deliveryDay.value,
        paymentMode: paymentMode.value,
        customItems: customItems.value,
        selectedAddress: selectedAddress.value,
        savedAt: new Date().toISOString(),
      });
      localStorage.setItem(STORAGE_KEY, data);
    } catch (err) {
      console.error('Failed to save subscription setup to storage:', err);
    }
  }

  function loadFromStorage() {
    if (import.meta.server) return;
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        // Check if data is not too old (30 days)
        const savedAt = new Date(parsed.savedAt);
        const now = new Date();
        const daysDiff = (now.getTime() - savedAt.getTime()) / (1000 * 60 * 60 * 24);

        if (daysDiff < 30) {
          frequency.value = parsed.frequency;
          boxSize.value = parsed.boxSize;
          deliveryDay.value = parsed.deliveryDay;
          paymentMode.value = parsed.paymentMode;
          customItems.value = parsed.customItems || [];
          selectedAddress.value = parsed.selectedAddress;
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch (err) {
      console.error('Failed to load subscription setup from storage:', err);
    }
  }

  // Initialize from storage
  loadFromStorage();

  // ============================================
  // SUBSCRIPTION MANAGEMENT (for existing subs)
  // ============================================

  // Management state
  const subscriptions = ref<SubscriptionDetail[]>([]);
  const selectedSubscription = ref<SubscriptionDetail | null>(null);
  const isLoadingSubscriptions = ref(false);
  const managementError = ref<string | null>(null);

  // Management getters
  const activeSubscriptions = computed(() =>
    subscriptions.value.filter((s) => s.status === 'ACTIVE')
  );

  const pausedSubscriptions = computed(() =>
    subscriptions.value.filter((s) => s.status === 'PAUSED')
  );

  const canPause = computed(() => selectedSubscription.value?.status === 'ACTIVE');

  const canResume = computed(() => selectedSubscription.value?.status === 'PAUSED');

  const canCancel = computed(() =>
    selectedSubscription.value &&
    !['CANCELLED', 'EXPIRED'].includes(selectedSubscription.value.status)
  );

  // Management actions
  async function fetchSubscriptions(userId: string): Promise<void> {
    isLoadingSubscriptions.value = true;
    managementError.value = null;

    try {
      const response = await fetch(`${API_BASE}?userId=${userId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch subscriptions');
      }

      subscriptions.value = data.subscriptions || [];
    } catch (err) {
      managementError.value = err instanceof Error ? err.message : 'Failed to fetch subscriptions';
      console.error('Fetch subscriptions error:', err);
    } finally {
      isLoadingSubscriptions.value = false;
    }
  }

  async function fetchSubscriptionById(id: string): Promise<SubscriptionDetail | null> {
    isLoadingSubscriptions.value = true;
    managementError.value = null;

    try {
      const response = await fetch(`${API_BASE}/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch subscription');
      }

      selectedSubscription.value = data.subscription;
      return data.subscription;
    } catch (err) {
      managementError.value = err instanceof Error ? err.message : 'Failed to fetch subscription';
      console.error('Fetch subscription error:', err);
      return null;
    } finally {
      isLoadingSubscriptions.value = false;
    }
  }

  async function pauseSubscription(
    id: string,
    reason?: string,
    resumeDate?: string,
  ): Promise<boolean> {
    managementError.value = null;

    try {
      const response = await fetch(`${API_BASE}/${id}/pause`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reason || 'User requested pause', resumeDate }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to pause subscription');
      }

      // Update local state
      if (selectedSubscription.value?.id === id) {
        selectedSubscription.value.status = 'PAUSED';
      }

      const index = subscriptions.value.findIndex((s) => s.id === id);
      if (index > -1) {
        subscriptions.value[index].status = 'PAUSED';
      }

      return true;
    } catch (err) {
      managementError.value = err instanceof Error ? err.message : 'Failed to pause subscription';
      console.error('Pause subscription error:', err);
      return false;
    }
  }

  async function resumeSubscription(id: string): Promise<boolean> {
    managementError.value = null;

    try {
      const response = await fetch(`${API_BASE}/${id}/resume`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resume subscription');
      }

      // Update local state
      if (selectedSubscription.value?.id === id) {
        selectedSubscription.value.status = 'ACTIVE';
      }

      const index = subscriptions.value.findIndex((s) => s.id === id);
      if (index > -1) {
        subscriptions.value[index].status = 'ACTIVE';
      }

      return true;
    } catch (err) {
      managementError.value = err instanceof Error ? err.message : 'Failed to resume subscription';
      console.error('Resume subscription error:', err);
      return false;
    }
  }

  async function cancelSubscription(id: string, reason?: string): Promise<boolean> {
    managementError.value = null;

    try {
      const response = await fetch(`${API_BASE}/${id}/cancel`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reason || 'User requested cancellation' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel subscription');
      }

      // Update local state
      if (selectedSubscription.value?.id === id) {
        selectedSubscription.value.status = 'CANCELLED';
      }

      const index = subscriptions.value.findIndex((s) => s.id === id);
      if (index > -1) {
        subscriptions.value[index].status = 'CANCELLED';
      }

      return true;
    } catch (err) {
      managementError.value = err instanceof Error ? err.message : 'Failed to cancel subscription';
      console.error('Cancel subscription error:', err);
      return false;
    }
  }

  async function modifySubscription(id: string, input: ModifySubscriptionInput): Promise<boolean> {
    managementError.value = null;

    try {
      const response = await fetch(`${API_BASE}/${id}/modify`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to modify subscription');
      }

      // Refresh subscription data
      await fetchSubscriptionById(id);

      return true;
    } catch (err) {
      managementError.value = err instanceof Error ? err.message : 'Failed to modify subscription';
      console.error('Modify subscription error:', err);
      return false;
    }
  }

  async function generateOrderFromSubscription(id: string): Promise<string | null> {
    managementError.value = null;

    try {
      const response = await fetch(`${API_BASE}/${id}/generate-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate order');
      }

      return data.id;
    } catch (err) {
      managementError.value = err instanceof Error ? err.message : 'Failed to generate order';
      console.error('Generate order error:', err);
      return null;
    }
  }

  function selectSubscription(subscription: SubscriptionDetail | null) {
    selectedSubscription.value = subscription;
  }

  return {
    // State
    frequency,
    boxSize,
    deliveryDay,
    paymentMode,
    customItems,
    selectedAddress,
    step,
    isLoading,
    error,
    // Getters
    boxConfig,
    frequencyConfig,
    deliveryDayConfig,
    paymentModeConfig,
    basePrice,
    pricing,
    monthlyEstimate,
    canProceedToAddress,
    canCreateSubscription,
    subscriptionSummary,
    // Actions
    setFrequency,
    setBoxSize,
    setDeliveryDay,
    setPaymentMode,
    setStep,
    selectAddress,
    addCustomItem,
    removeCustomItem,
    clearCustomItems,
    resetSetup,
    createSubscription,
    saveToStorage,
    loadFromStorage,
    // Management
    subscriptions,
    selectedSubscription,
    isLoadingSubscriptions,
    managementError,
    activeSubscriptions,
    pausedSubscriptions,
    canPause,
    canResume,
    canCancel,
    fetchSubscriptions,
    fetchSubscriptionById,
    pauseSubscription,
    resumeSubscription,
    cancelSubscription,
    modifySubscription,
    generateOrderFromSubscription,
    selectSubscription,
  };
});
