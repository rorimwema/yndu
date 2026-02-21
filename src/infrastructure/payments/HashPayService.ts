// HashPay Payment Service
// Handles M-Pesa STK Push integration

import { config as _config } from '../config/env.ts';
import { getEnv } from '../config/secret-env.ts';

export interface HashPayConfig {
  apiKey: string;
  accountId: string;
  environment: 'production' | 'sandbox';
  timeoutMs?: number;
}

export interface InitiateSTKResponse {
  success: boolean;
  message: string;
  checkout_id: string;
  ResponseCode?: string;
  ResponseDescription?: string;
  CheckoutRequestID?: string;
  MerchantRequestID?: string;
  CustomerMessage?: string;
}

interface RawSTKResponse {
  ResponseCode: string;
  ResponseDescription: string;
  CheckoutRequestID: string;
  MerchantRequestID: string;
  CustomerMessage: string;
}

export interface TransactionStatusResponse {
  ResponseCode: string;
  ResponseDescription: string;
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResultCode: string;
  ResultDesc: string;
}

export class HashPayService {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly accountId: string;
  private readonly timeoutMs: number;

  constructor(config?: HashPayConfig) {
    this.baseUrl = 'https://api.hashback.co.ke';
    this.apiKey = config?.apiKey || getEnv('HASHPAY_API_KEY', '');
    this.accountId = config?.accountId || getEnv('HASHPAY_ACCOUNT_ID', '');
    this.timeoutMs = config?.timeoutMs || 30000;
  }

  private async request<T>(
    endpoint: string,
    body: Record<string, string>,
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...body,
          api_key: this.apiKey,
          account_id: this.accountId,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HashPay API error: ${response.status} - ${errorText}`);
      }

      return await response.json() as T;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('HashPay API request timeout');
      }
      throw error;
    }
  }

  async initiateSTK(params: {
    amount: string;
    msisdn: string;
    reference: string;
  }): Promise<InitiateSTKResponse> {
    // Validate phone number format
    if (!PhoneUtils.isValidKenyanPhone(params.msisdn)) {
      throw new Error('Invalid phone number format. Use: 2547XXXXXXXX');
    }

    // Validate amount
    const amountNum = parseInt(params.amount, 10);
    if (isNaN(amountNum) || amountNum < 1) {
      throw new Error('Invalid amount. Must be a positive number.');
    }

    const response = await this.request<RawSTKResponse>('/initiatestk', {
      amount: params.amount,
      msisdn: params.msisdn,
      reference: params.reference,
    });

    // Map the API response to our interface
    return {
      success: response.ResponseCode === '0',
      message: response.ResponseDescription || response.CustomerMessage || '',
      checkout_id: response.CheckoutRequestID || '',
      ResponseCode: response.ResponseCode,
      ResponseDescription: response.ResponseDescription,
      CheckoutRequestID: response.CheckoutRequestID,
      MerchantRequestID: response.MerchantRequestID,
      CustomerMessage: response.CustomerMessage,
    };
  }

  checkStatus(checkoutId: string): Promise<TransactionStatusResponse> {
    if (!checkoutId) {
      throw new Error('Checkout ID is required');
    }

    return this.request<TransactionStatusResponse>('/transactionstatus', {
      checkoutid: checkoutId,
    });
  }

  isTransactionSuccess(status: TransactionStatusResponse): boolean {
    return status.ResponseCode === '0' && status.ResultCode === '0';
  }

  generateReference(orderId: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `ORD_${orderId}_${timestamp}_${random}`;
  }

  getExpiryTime(minutes: number = 15): Date {
    return new Date(Date.now() + minutes * 60 * 1000);
  }
}

// Phone utility class
export class PhoneUtils {
  private static readonly KENYAN_PHONE_REGEX = /^254[0-9]{9}$/;
  private static readonly MAX_AMOUNT_KES = 150000;
  private static readonly MIN_AMOUNT_KES = 10;

  static normalize(phone: string): string {
    let cleaned = phone.replace(/\D/g, '');

    if (cleaned.startsWith('0')) {
      cleaned = '254' + cleaned.slice(1);
    } else if (!cleaned.startsWith('254')) {
      cleaned = '254' + cleaned;
    }

    return cleaned;
  }

  static isValidKenyanPhone(phone: string): boolean {
    return this.KENYAN_PHONE_REGEX.test(phone);
  }

  static formatForDisplay(phone: string): string {
    if (phone.length === 12) {
      return `${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6, 10)} ${phone.slice(10)}`;
    }
    return phone;
  }

  static mask(phone: string): string {
    if (phone.length >= 9) {
      return phone.slice(0, 6) + '****' + phone.slice(-3);
    }
    return '****';
  }

  static validateAmountKES(
    amountCents: number,
  ): { valid: boolean; amountKES: number; error?: string } {
    const amountKES = Math.ceil(amountCents / 100);

    if (amountKES < this.MIN_AMOUNT_KES) {
      return { valid: false, amountKES, error: `Minimum amount is KES ${this.MIN_AMOUNT_KES}` };
    }
    if (amountKES > this.MAX_AMOUNT_KES) {
      return {
        valid: false,
        amountKES,
        error: `Maximum amount is KES ${this.MAX_AMOUNT_KES.toLocaleString()}`,
      };
    }

    return { valid: true, amountKES };
  }
}

// Singleton instance
let hashPayServiceInstance: HashPayService | null = null;

export function getHashPayService(): HashPayService {
  if (!hashPayServiceInstance) {
    hashPayServiceInstance = new HashPayService();
  }
  return hashPayServiceInstance;
}
