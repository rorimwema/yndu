// Payment store — handles M-Pesa STK Push payments
import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'timeout';
  phone: string;
  checkoutId: string;
  initiatedAt: string;
  completedAt?: string;
  expiresAt: string;
}

export const usePaymentStore = defineStore('payment', () => {
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const currentPayment = ref<Payment | null>(null);
  const paymentStatus = ref<string | null>(null);

  /**
   * Initiate M-Pesa STK Push payment for an order
   */
  async function initiatePayment(orderId: string, phoneNumber: string): Promise<Payment | null> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await $fetch<{
        paymentId: string;
        checkoutId: string;
        reference: string;
        expiresAt: string;
        phone: string;
      }>('/api/payments/initiate', {
        method: 'POST',
        body: { orderId, phoneNumber },
      });

      currentPayment.value = {
        id: response.paymentId,
        orderId,
        amount: 0, // Will be fetched with order details
        currency: 'KES',
        status: 'pending',
        phone: response.phone,
        checkoutId: response.checkoutId,
        initiatedAt: new Date().toISOString(),
        expiresAt: response.expiresAt,
      };

      return currentPayment.value;
    } catch (err: unknown) {
      error.value = (err as Error)?.message || 'Payment initiation failed';
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Check payment status
   */
  async function checkPaymentStatus(checkoutId: string): Promise<string | null> {
    try {
      const response = await $fetch<{
        status: string;
        success: boolean;
        paymentId: string;
        message?: string;
      }>('/api/payments/status', {
        method: 'GET',
        params: { checkout_id: checkoutId },
      });

      paymentStatus.value = response.status;

      if (currentPayment.value) {
        currentPayment.value.status = response.status.toLowerCase() as Payment['status'];
      }

      return response.status;
    } catch (err: unknown) {
      error.value = (err as Error)?.message || 'Failed to check payment status';
      return null;
    }
  }

  /**
   * Get payment details
   */
  async function getPayment(paymentId: string): Promise<Payment | null> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await $fetch<{
        id: string;
        orderId: string;
        amount: number;
        currency: string;
        status: string;
        phone: string;
        checkoutId: string;
        initiatedAt: string;
        completedAt?: string;
        expiresAt: string;
      }>(`/api/payments/${paymentId}`);

      currentPayment.value = {
        id: response.id,
        orderId: response.orderId,
        amount: response.amount,
        currency: response.currency,
        status: response.status.toLowerCase() as Payment['status'],
        phone: response.phone,
        checkoutId: response.checkoutId,
        initiatedAt: response.initiatedAt,
        completedAt: response.completedAt,
        expiresAt: response.expiresAt,
      };

      return currentPayment.value;
    } catch (err: unknown) {
      error.value = (err as Error)?.message || 'Failed to get payment';
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Clear current payment state
   */
  function clearPayment(): void {
    currentPayment.value = null;
    paymentStatus.value = null;
    error.value = null;
  }

  /**
   * Clear error
   */
  function clearError(): void {
    error.value = null;
  }

  return {
    isLoading,
    error,
    currentPayment,
    paymentStatus,
    initiatePayment,
    checkPaymentStatus,
    getPayment,
    clearPayment,
    clearError,
  };
});
