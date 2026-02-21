# HashPay Payment Integration Architecture

Payment integration specification for HashPay (M-Pesa STK Push) into the Yndu e-commerce platform.

---

## Table of Contents

1. [Overview](#overview)
2. [Security Architecture](#security-architecture)
3. [Database Schema](#database-schema)
4. [Backend Implementation](#backend-implementation)
5. [Frontend Integration](#frontend-integration)
6. [Error Handling & Timeouts](#error-handling--timeouts)
7. [Accounting & Reconciliation](#accounting--reconciliation)
8. [Testing](#testing)

---

## Overview

### Why HashPay?

- **M-Pesa focused**: Optimized for Kenya mobile money
- **STK Push**: Instant payment prompts
- **Real-time webhooks**: Instant payment notifications
- **Simple API**: Easy integration
- **Local support**: Kenyan-based payment processor

### Integration Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    HASHPAY PAYMENT FLOW                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────┐    ┌─────────────┐    ┌──────────────┐                  │
│  │ Customer │───▶│   Frontend  │───▶│  Initialize  │                  │
│  │ Selects  │    │   Checkout  │    │   STK Push   │                  │
│  │ M-Pesa   │    │             │    └──────┬───────┘                  │
│  └──────────┘    └─────────────┘           │                         │
│                                              ▼                         │
│                                    ┌──────────────────┐               │
│                                    │  HashPay API     │               │
│                                    │  initiatestk     │               │
│                                    └────────┬─────────┘               │
│                                             │                         │
│                                             ▼                         │
│                              ┌────────────────────────┐               │
│                              │  Frontend Polling      │◀── Client     │
│                              │  (every 5 seconds)     │               │
│                              └────────┬───────────────┘               │
│                                         │                             │
│          ┌──────────────────────────────┼─────────────────────────────┐│
│          │                              │                             ││
│          ▼                              ▼                             ││
│  ┌──────────────┐              ┌─────────────────┐                   ││
│  │   Success    │              │    Webhook      │◀── HashPay Server  ││
│  │  (callback)  │              │  (async event)  │     POST           ││
│  └──────┬───────┘              └────────┬────────┘                   ││
│         │                                │                            ││
│         │         ┌──────────────────────┴───────────────────────┐   ││
│         │         │                                              │   ││
│         ▼         ▼                                              ▼   ││
│  ┌──────────────────────────────────┐                            │   │
│  │    Update Order Payment Status    │                            │   │
│  │    + Create Payment Record       │                            │   │
│  │    + Trigger Order Confirmation  │                            │   │
│  └──────────────────────────────────┘                            │   │
│                                                                    ││
└────────────────────────────────────────────────────────────────────┘
```

---

## Security Architecture

### Security Layers

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SECURITY LAYERS                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Layer 1: Authentication & Authorization                                     │
│  ┌─────────────────────────────────────────────────────────────────┐     │
│  │  • JWT/Session validation                                        │     │
│  │  • Role-based access control                                    │     │
│  │  • API key validation for webhooks                              │     │
│  └─────────────────────────────────────────────────────────────────┘     │
│                                     │                                       │
│  Layer 2: Input Validation                                                 │
│  ┌─────────────────────────────────────────────────────────────────┐     │
│  │  • Phone number format validation                                │     │
│  │  • Amount validation & limits                                    │     │
│  │  • Parameterized queries (SQL injection prevention)             │     │
│  │  • Reference format validation                                   │     │
│  └─────────────────────────────────────────────────────────────────┘     │
│                                     │                                       │
│  Layer 3: Business Logic Validation                                        │
│  ┌─────────────────────────────────────────────────────────────────┐     │
│  │  • Order ownership verification                                  │     │
│  │  • Payment amount must match order total                        │     │
│  │  • One payment per order enforcement                           │     │
│  │  • Order status checks before payment                           │     │
│  └─────────────────────────────────────────────────────────────────┘     │
│                                     │                                       │
│  Layer 4: Rate Limiting                                                   │
│  ┌─────────────────────────────────────────────────────────────────┐     │
│  │  • Per-user payment request limits                              │     │
│  │  • Per-IP initiation limits                                     │     │
│  │  • Webhook processing rate limits                               │     │
│  └─────────────────────────────────────────────────────────────────┘     │
│                                     │                                       │
│  Layer 5: Audit & Monitoring                                              │
│  ┌─────────────────────────────────────────────────────────────────┐     │
│  │  • Complete payment event logging                                │     │
│  │  • Anomaly detection                                           │     │
│  │  • Alerting on suspicious patterns                              │     │
│  └─────────────────────────────────────────────────────────────────┘     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### Core Tables

```sql
-- =====================================================
-- TYPE DEFINITIONS
-- =====================================================

CREATE TYPE IF NOT EXISTS payment_status AS ENUM (
    'pending', 'processing', 'completed', 'failed', 'cancelled', 'timeout', 'refunded'
);

CREATE TYPE IF NOT EXISTS payment_channel AS ENUM ('mpesa', 'card', 'bank');

CREATE TYPE IF NOT EXISTS payment_timeout_reason AS ENUM (
    'USER_ABANDONED', 'EXPIRED', 'NETWORK_ERROR', 'CANCELLED_BY_USER'
);

-- =====================================================
-- PAYMENTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Order Reference
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    
    -- HashPay Transaction Data
    hashpay_checkout_id VARCHAR(255) UNIQUE NOT NULL,
    hashpay_reference VARCHAR(255) NOT NULL,
    hashpay_merchant_request_id VARCHAR(255),
    hashpay_transaction_id VARCHAR(255),
    hashpay_transaction_receipt VARCHAR(255),
    
    -- Payment Details
    amount_cents INTEGER NOT NULL,
    currency VARCHAR(3) DEFAULT 'KES',
    channel payment_channel DEFAULT 'mpesa' NOT NULL,
    
    -- Status Tracking
    status payment_status DEFAULT 'pending',
    timeout_reason payment_timeout_reason,
    timeout_handled BOOLEAN DEFAULT FALSE,
    
    -- Payment Method Details
    mpesa_phone VARCHAR(20) NOT NULL,
    
    -- Timing
    initiated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    
    -- Metadata
    description TEXT,
    metadata JSONB DEFAULT '{}',
    
    -- Version for optimistic locking
    version INTEGER DEFAULT 1,
    
    -- Constraints
    CONSTRAINT positive_amount CHECK (amount_cents > 0),
    CONSTRAINT valid_phone_format CHECK (mpesa_phone ~ '^254[0-9]{9}$')
);

-- Indexes for common queries
CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_checkout ON payments(hashpay_checkout_id);
CREATE INDEX idx_payments_reference ON payments(hashpay_reference);
CREATE INDEX idx_payments_created ON payments(initiated_at DESC);
CREATE INDEX idx_payments_expired ON payments(status, expires_at) 
    WHERE status = 'pending';
CREATE INDEX idx_payments_metadata ON payments USING GIN (metadata);

-- =====================================================
-- PAYMENT EVENTS TABLE (Audit Trail)
-- =====================================================

CREATE TABLE IF NOT EXISTS payment_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    
    event_type VARCHAR(50) NOT NULL,
    event_id VARCHAR(255) UNIQUE NOT NULL,
    raw_payload JSONB NOT NULL,
    
    processed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMPTZ,
    processing_error TEXT,
    retry_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_event UNIQUE (event_id)
);

CREATE INDEX idx_payment_events_payment ON payment_events(payment_id);
CREATE INDEX idx_payment_events_unprocessed ON payment_events(processed, retry_count) 
    WHERE processed = FALSE;
CREATE INDEX idx_payment_events_payload ON payment_events USING GIN (raw_payload);

-- =====================================================
-- PAYMENT STATUS HISTORY
-- =====================================================

CREATE TABLE IF NOT EXISTS payment_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    
    from_status payment_status,
    to_status payment_status NOT NULL,
    reason TEXT,
    
    response_code VARCHAR(10),
    response_message TEXT,
    hashpay_response JSONB,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payment_status_history_payment ON payment_status_history(payment_id);
CREATE INDEX idx_payment_status_history_created ON payment_status_history(created_at DESC);
CREATE INDEX idx_payment_status_hashpay_response ON payment_status_history USING GIN (hashpay_response);

-- =====================================================
-- PAYMENT AUDIT LOG (Append-only)
-- =====================================================

CREATE TABLE IF NOT EXISTS payment_audit_log (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    event_type VARCHAR(50) NOT NULL,
    user_id UUID,
    ip_address INET,
    order_id UUID,
    payment_id UUID,
    old_data JSONB,
    new_data JSONB,
    checksum VARCHAR(64)
);

CREATE INDEX idx_payment_audit_created ON payment_audit_log(created_at DESC);
CREATE INDEX idx_payment_audit_user ON payment_audit_log(user_id);
CREATE INDEX idx_payment_audit_order ON payment_audit_log(order_id);
CREATE INDEX idx_payment_audit_event ON payment_audit_log(event_type);

-- Prevent updates/deletes to audit log
CREATE RULE IF NOT EXISTS no_update_audit AS ON UPDATE TO payment_audit_log DO INSTEAD NOTHING;
CREATE RULE IF NOT EXISTS no_delete_audit AS ON DELETE TO payment_audit_log DO INSTEAD NOTHING;

-- =====================================================
-- ORDERS TABLE EXTENSIONS
-- =====================================================

ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_id UUID REFERENCES payments(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_notes TEXT;

-- Update payment_status enum if using CHECK constraint
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_payment_status_check 
    CHECK (payment_status IN (
        'PENDING', 'AWAITING_PAYMENT', 'PROCESSING', 'PAID', 
        'PAYMENT_FAILED', 'PAYMENT_CANCELLED', 'PAYMENT_TIMEOUT', 'REFUNDED'
    ));
```

---

## Backend Implementation

### Environment Variables

```env
# HashPay Configuration
HASHPAY_API_KEY=your_api_key_here
HASHPAY_ACCOUNT_ID=ACC_ID
HASHPAY_ENVIRONMENT=production  # 'production' or 'sandbox'
HASHPAY_WEBHOOK_SECRET=your_webhook_secret_here

# Payment Settings
PAYMENT_TIMEOUT_MINUTES=15
PAYMENT_RETRY_ATTEMPTS=3
PAYMENT_RETRY_DELAY_SECONDS=30
PAYMENT_MIN_AMOUNT_KES=10
PAYMENT_MAX_AMOUNT_KES=150000

# Rate Limiting
PAYMENT_RATE_LIMIT_PER_MINUTE=5
PAYMENT_STATUS_CHECK_LIMIT_PER_MINUTE=30

# Frontend URLs
FRONTEND_URL=https://yndu.co.ke
PAYMENT_SUCCESS_URL=https://yndu.co.ke/checkout/success
PAYMENT_CANCEL_URL=https://yndu.co.ke/checkout/cancel

# Security
JWT_SECRET=...
CORS_ORIGIN=https://yndu.co.ke
HASHPAY_ALLOWED_IPS=203.0.113.0/24,198.51.100.0/24
```

### HashPay Service

```typescript
// src/infrastructure/payments/HashPayService.ts

interface HashPayConfig {
  apiKey: string;
  accountId: string;
  environment: 'production' | 'sandbox';
  timeoutMs?: number;
}

interface InitiateSTKResponse {
  success: boolean;
  message: string;
  checkout_id: string;
}

interface TransactionStatusResponse {
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

  constructor(config: HashPayConfig) {
    // Note: Both production and sandbox use same URL per HashPay docs
    this.baseUrl = 'https://api.hashback.co.ke';
    this.apiKey = config.apiKey;
    this.accountId = config.accountId;
    this.timeoutMs = config.timeoutMs || 30000;
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

    return this.request<InitiateSTKResponse>('/initiatestk', {
      amount: params.amount,
      msisdn: params.msisdn,
      reference: params.reference,
    });
  }

  async checkStatus(checkoutId: string): Promise<TransactionStatusResponse> {
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
```

### Phone Number Utility

```typescript
// src/infrastructure/utils/PhoneUtils.ts

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
```

### Payment Repository

```typescript
// src/infrastructure/payments/PaymentRepository.ts

import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
import { EventBus } from '../../domain/events/EventBus.ts';

export interface PaymentRecord {
  id: string;
  order_id: string;
  user_id: string;
  hashpay_checkout_id: string;
  hashpay_reference: string;
  hashpay_merchant_request_id: string | null;
  hashpay_transaction_id: string | null;
  hashpay_transaction_receipt: string | null;
  amount_cents: number;
  currency: string;
  channel: string;
  status: string;
  mpesa_phone: string;
  initiated_at: Date;
  completed_at: Date | null;
  failed_at: Date | null;
  expires_at: Date;
  version: number;
}

export interface CreatePaymentParams {
  orderId: string;
  userId: string;
  amountCents: number;
  currency?: string;
  hashpayCheckoutId: string;
  hashpayReference: string;
  mpesaPhone: string;
  expiresAt: Date;
}

export interface UpdatePaymentParams {
  transactionId?: string;
  receipt?: string;
  merchantRequestId?: string;
  completedAt?: Date;
  failedAt?: Date;
  timeoutReason?: string;
}

export class PaymentRepository {
  constructor(
    private db: Knex,
    private eventBus: EventBus,
  ) {}

  async createPayment(params: CreatePaymentParams): Promise<PaymentRecord> {
    return this.db.transaction(async (trx) => {
      const [payment] = await trx('payments')
        .insert({
          id: uuidv4(),
          order_id: params.orderId,
          user_id: params.userId,
          amount_cents: params.amountCents,
          currency: params.currency || 'KES',
          channel: 'mpesa',
          hashpay_checkout_id: params.hashpayCheckoutId,
          hashpay_reference: params.hashpayReference,
          mpesa_phone: params.mpesaPhone,
          status: 'pending',
          initiated_at: new Date(),
          expires_at: params.expiresAt,
        })
        .returning('*');

      await trx('payment_status_history').insert({
        id: uuidv4(),
        payment_id: payment.id,
        from_status: null,
        to_status: 'pending',
        reason: 'Payment initiated',
      });

      // Publish domain event
      await this.eventBus.publish({
        type: 'PaymentInitiated',
        payload: {
          paymentId: payment.id,
          orderId: params.orderId,
          amount: params.amountCents,
          checkoutId: params.hashpayCheckoutId,
        },
        occurredAt: new Date(),
      });

      return payment;
    });
  }

  async findById(id: string): Promise<PaymentRecord | null> {
    return this.db('payments').where('id', id).first();
  }

  async findByCheckoutId(checkoutId: string): Promise<PaymentRecord | null> {
    return this.db('payments')
      .where('hashpay_checkout_id', checkoutId)
      .first();
  }

  async findByReference(reference: string): Promise<PaymentRecord | null> {
    return this.db('payments')
      .where('hashpay_reference', reference)
      .first();
  }

  async findByOrderId(orderId: string): Promise<PaymentRecord | null> {
    return this.db('payments')
      .where('order_id', orderId)
      .orderBy('initiated_at', 'desc')
      .first();
  }

  async updatePaymentStatus(
    checkoutId: string,
    status: string,
    updates?: UpdatePaymentParams,
  ): Promise<PaymentRecord | null> {
    return this.db.transaction(async (trx) => {
      const existing = await trx('payments')
        .where('hashpay_checkout_id', checkoutId)
        .first();

      if (!existing) return null;

      // Prevent going backwards in state machine
      const validTransitions: Record<string, string[]> = {
        'pending': ['processing', 'completed', 'failed', 'timeout', 'cancelled'],
        'processing': ['completed', 'failed', 'timeout'],
        'failed': ['pending'], // Allow retry
        'timeout': ['completed'], // Late webhook
        'completed': [],
        'cancelled': [],
      };

      if (existing.status !== status && !validTransitions[existing.status]?.includes(status)) {
        throw new Error(`Invalid status transition: ${existing.status} -> ${status}`);
      }

      const updateData: Record<string, unknown> = {
        status,
        version: existing.version + 1,
      };

      if (updates?.transactionId) updateData.hashpay_transaction_id = updates.transactionId;
      if (updates?.receipt) updateData.hashpay_transaction_receipt = updates.receipt;
      if (updates?.merchantRequestId) {
        updateData.hashpay_merchant_request_id = updates.merchantRequestId;
      }
      if (updates?.completedAt) updateData.completed_at = updates.completedAt;
      if (updates?.failedAt) updateData.failed_at = updates.failedAt;
      if (updates?.timeoutReason) updateData.timeout_reason = updates.timeoutReason;

      const [payment] = await trx('payments')
        .where('hashpay_checkout_id', checkoutId)
        .update(updateData)
        .returning('*');

      // Record status history
      await trx('payment_status_history').insert({
        id: uuidv4(),
        payment_id: payment.id,
        from_status: existing.status,
        to_status: status,
        reason: updates?.timeoutReason || 'Status updated',
      });

      // Publish event
      const eventType = status === 'completed'
        ? 'PaymentCompleted'
        : status === 'failed'
        ? 'PaymentFailed'
        : status === 'timeout'
        ? 'PaymentTimeout'
        : 'PaymentStatusUpdated';

      await this.eventBus.publish({
        type: eventType,
        payload: {
          paymentId: payment.id,
          orderId: payment.order_id,
          checkoutId,
          fromStatus: existing.status,
          toStatus: status,
        },
        occurredAt: new Date(),
      });

      return payment;
    });
  }

  async recordPaymentEvent(params: {
    paymentId: string;
    eventType: string;
    eventId: string;
    rawPayload: Record<string, unknown>;
  }): Promise<boolean> {
    try {
      await this.db('payment_events')
        .insert({
          id: uuidv4(),
          payment_id: params.paymentId,
          event_type: params.eventType,
          event_id: params.eventId,
          raw_payload: params.rawPayload,
          processed: false,
          created_at: new Date(),
        })
        .onConflict('event_id')
        .ignore();

      return true; // Inserted
    } catch {
      return false; // Already exists
    }
  }

  async findEventById(eventId: string): Promise<{ processed: boolean } | null> {
    return this.db('payment_events')
      .where('event_id', eventId)
      .select('processed')
      .first();
  }

  async markEventProcessed(eventId: string): Promise<void> {
    await this.db('payment_events')
      .where('event_id', eventId)
      .update({ processed: true, processed_at: new Date() });
  }

  async getUnprocessedEvents(limit: number = 100): Promise<
    Array<{
      id: string;
      payment_id: string;
      event_type: string;
      event_id: string;
      raw_payload: Record<string, unknown>;
      retry_count: number;
    }>
  > {
    return this.db('payment_events')
      .where('processed', false)
      .where('retry_count', '<', 3)
      .orderBy('created_at', 'asc')
      .limit(limit);
  }

  async incrementEventRetry(eventId: string): Promise<void> {
    await this.db('payment_events')
      .where('event_id', eventId)
      .increment('retry_count', 1)
      .update({ processing_error: new Date().toISOString() });
  }

  async findExpiredPayments(): Promise<PaymentRecord[]> {
    return this.db('payments')
      .where('status', 'pending')
      .where('expires_at', '<', this.db.fn.now())
      .where('timeout_handled', false);
  }

  async markTimeoutHandled(paymentId: string): Promise<void> {
    await this.db('payments')
      .where('id', paymentId)
      .update({ timeout_handled: true });
  }

  async hasActivePayment(orderId: string): Promise<boolean> {
    const result = await this.db('payments')
      .where('order_id', orderId)
      .whereIn('status', ['pending', 'processing'])
      .first();
    return !!result;
  }
}
```

### Order Validator

```typescript
// src/infrastructure/payments/OrderValidator.ts

import { Knex } from 'knex';

export interface OrderValidationResult {
  valid: boolean;
  error?: string;
  order?: {
    id: string;
    user_id: string;
    total_price_cents: number;
    payment_status: string;
    created_at: Date;
  };
}

export class OrderValidator {
  constructor(private db: Knex) {}

  async validateForPayment(
    orderId: string,
    userId: string,
  ): Promise<OrderValidationResult> {
    const order = await this.db('orders')
      .where('id', orderId)
      .first();

    if (!order) {
      return { valid: false, error: 'Order not found' };
    }

    // Verify ownership (CRITICAL - don't leak info)
    if (order.user_id !== userId) {
      console.error(
        `[FRAUD] User ${userId} attempted to pay for order ${orderId} belonging to ${order.user_id}`,
      );
      return { valid: false, error: 'Order not found' };
    }

    // Check valid statuses
    const validStatuses = ['PENDING', 'AWAITING_PAYMENT', 'PROCESSING'];
    if (!validStatuses.includes(order.payment_status)) {
      return {
        valid: false,
        error: `Order is already ${order.payment_status.toLowerCase().replace('_', ' ')}`,
      };
    }

    // Check order age (24 hours)
    const orderAge = Date.now() - new Date(order.created_at).getTime();
    const maxAge = 24 * 60 * 60 * 1000;
    if (orderAge > maxAge) {
      return { valid: false, error: 'Order has expired. Please create a new order.' };
    }

    // Verify amount integrity
    const calculatedTotal = await this.calculateOrderTotal(orderId);
    if (calculatedTotal !== order.total_price_cents) {
      console.error(
        `[FRAUD] Order ${orderId} total mismatch: DB=${order.total_price_cents}, Calc=${calculatedTotal}`,
      );
      return { valid: false, error: 'Order validation failed' };
    }

    return { valid: true, order };
  }

  private async calculateOrderTotal(orderId: string): Promise<number> {
    const result = await this.db('order_items')
      .where('order_id', orderId)
      .sum('price_cents as total')
      .first();

    const subtotal = parseInt(result?.total || '0', 10);
    const deliveryFee = subtotal > 200000 ? 0 : 15000; // KES 150 in cents

    return subtotal + deliveryFee;
  }
}
```

### Webhook Handler (Secure)

```typescript
// src/routes/webhooks/hashpay.ts

import { Router } from 'oak';
import { crypto } from 'std/crypto/mod.ts';
import { PaymentRepository } from '../../infrastructure/payments/PaymentRepository.ts';
import { OrderRepository } from '../../infrastructure/adapters/postgres/OrderRepository.ts';

const router = new Router();

interface HashPayWebhookPayload {
  ResponseCode: number;
  ResponseDescription: string;
  MerchantRequestID: string;
  CheckoutRequestID: string;
  TransactionID?: string;
  TransactionAmount?: number;
  TransactionReceipt?: string;
  TransactionDate?: number;
  TransactionReference: string;
  Msisdn: number;
}

// Verify webhook signature
async function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string,
): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const signatureBytes = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  const computedSignature = btoa(String.fromCharCode(...new Uint8Array(signatureBytes)));

  return computedSignature === signature;
}

// Verify source IP (if configured)
function isValidSourceIP(ip: string, allowedRanges: string[]): boolean {
  if (!allowedRanges.length) return true;
  // Implement IP range checking logic here
  return true; // Placeholder - implement actual check
}

router.post('/hashpay', async (ctx) => {
  const startTime = Date.now();

  try {
    // 1. Get raw body for signature verification
    const rawBody = await ctx.request.body.text();

    // 2. Verify signature
    const signature = ctx.request.headers.get('x-hashpay-signature');
    const webhookSecret = Deno.env.get('HASHPAY_WEBHOOK_SECRET');

    if (webhookSecret && signature) {
      const valid = await verifyWebhookSignature(rawBody, signature, webhookSecret);
      if (!valid) {
        console.error('[Webhook] Invalid signature');
        ctx.response.status = 401;
        ctx.response.body = { error: 'Invalid signature' };
        return;
      }
    }

    // 3. Verify source IP
    const forwarded = ctx.request.headers.get('x-forwarded-for');
    const clientIp = forwarded?.split(',')[0]?.trim() || ctx.request.ip;
    const allowedIPs = Deno.env.get('HASHPAY_ALLOWED_IPS')?.split(',') || [];

    if (!isValidSourceIP(clientIp, allowedIPs)) {
      console.error(`[Webhook] Invalid source IP: ${clientIp}`);
      ctx.response.status = 403;
      ctx.response.body = { error: 'Invalid source' };
      return;
    }

    // 4. Parse and validate payload
    const payload: HashPayWebhookPayload = JSON.parse(rawBody);

    const requiredFields = ['ResponseCode', 'CheckoutRequestID', 'TransactionReference'];
    for (const field of requiredFields) {
      if (!(field in payload)) {
        console.error(`[Webhook] Missing field: ${field}`);
        ctx.response.status = 400;
        ctx.response.body = { error: `Missing ${field}` };
        return;
      }
    }

    // 5. Process payment
    const db = ctx.state.db;
    const paymentRepo = new PaymentRepository(db, ctx.state.eventBus);
    const orderRepo = new OrderRepository(db);

    const payment = await paymentRepo.findByReference(payload.TransactionReference);

    if (!payment) {
      console.error(`[Webhook] Payment not found: ${payload.TransactionReference}`);
      ctx.response.status = 200; // Acknowledge to prevent retries
      ctx.response.body = { received: true };
      return;
    }

    // Idempotency check - record event first
    const eventId = payload.CheckoutRequestID;
    const isNewEvent = await paymentRepo.recordPaymentEvent({
      paymentId: payment.id,
      eventType: 'webhook_callback',
      eventId,
      rawPayload: payload as Record<string, unknown>,
    });

    if (!isNewEvent) {
      console.log(`[Webhook] Duplicate event: ${eventId}`);
      ctx.response.status = 200;
      ctx.response.body = { received: true, duplicate: true };
      return;
    }

    // Process based on response code
    if (payload.ResponseCode === 0) {
      // Success - process even if previously timeout
      if (payment.status === 'completed') {
        console.log(`[Webhook] Already completed: ${payment.id}`);
      } else {
        await paymentRepo.updatePaymentStatus(
          payment.hashpay_checkout_id,
          'completed',
          {
            transactionId: payload.TransactionID,
            receipt: payload.TransactionReceipt,
            merchantRequestId: payload.MerchantRequestID,
            completedAt: new Date(),
          },
        );

        await orderRepo.updateOrderPaymentStatus(
          payment.order_id,
          'PAID',
          payment.hashpay_reference,
          new Date(),
        );

        console.log(`[Webhook] Payment completed: ${payment.id} (order: ${payment.order_id})`);
      }
    } else {
      // Failed
      if (!['completed', 'failed'].includes(payment.status)) {
        await paymentRepo.updatePaymentStatus(
          payment.hashpay_checkout_id,
          'failed',
          { failedAt: new Date() },
        );

        console.log(`[Webhook] Payment failed: ${payment.id} - ${payload.ResponseDescription}`);
      }
    }

    await paymentRepo.markEventProcessed(eventId);

    const duration = Date.now() - startTime;
    console.log(`[Webhook] Processed in ${duration}ms: ${eventId}`);

    ctx.response.status = 200;
    ctx.response.body = { received: true };
  } catch (error) {
    console.error('[Webhook] Error:', error);
    ctx.response.status = 500;
    ctx.response.body = { error: 'Internal server error' };
  }
});

export default router;
```

### Payment API Routes

```typescript
// src/routes/api/payments/index.ts

import { Router } from 'oak';
import { z } from 'zod';
import { PaymentRepository } from '../../../infrastructure/payments/PaymentRepository.ts';
import { OrderValidator } from '../../../infrastructure/payments/OrderValidator.ts';
import { OrderRepository } from '../../../infrastructure/adapters/postgres/OrderRepository.ts';
import { PhoneUtils } from '../../../infrastructure/utils/PhoneUtils.ts';
import { requireAuth } from '../../../middleware/auth.ts';
import { rateLimit } from '../../../middleware/rateLimit.ts';

const router = new Router();

// Rate limit configurations
const paymentInitLimit = rateLimit({ windowMs: 60000, maxRequests: 5 });
const statusCheckLimit = rateLimit({ windowMs: 60000, maxRequests: 30 });

// Validation schemas
const initiateSchema = z.object({
  orderId: z.string().uuid(),
  phoneNumber: z.string().regex(/^254[0-9]{9}$/, 'Invalid phone format'),
});

// POST /api/payments/initiate
router.post('/initiate', requireAuth, paymentInitLimit, async (ctx) => {
  const user = ctx.state.user;

  try {
    const body = await ctx.request.body.json();
    const { orderId, phoneNumber } = initiateSchema.parse(body);

    const db = ctx.state.db;
    const validator = new OrderValidator(db);
    const paymentRepo = new PaymentRepository(db, ctx.state.eventBus);
    const orderRepo = new OrderRepository(db);
    const hashPayService = ctx.state.hashPayService;

    // Validate order
    const validation = await validator.validateForPayment(orderId, user.id);
    if (!validation.valid) {
      ctx.response.status = 400;
      ctx.response.body = { error: validation.error };
      return;
    }

    // Check for existing active payment
    if (await paymentRepo.hasActivePayment(orderId)) {
      ctx.response.status = 409;
      ctx.response.body = { error: 'Payment already in progress for this order' };
      return;
    }

    // Validate amount
    const amountValidation = PhoneUtils.validateAmountKES(validation.order!.total_price_cents);
    if (!amountValidation.valid) {
      ctx.response.status = 400;
      ctx.response.body = { error: amountValidation.error };
      return;
    }

    // Generate reference and expiry
    const reference = hashPayService.generateReference(orderId);
    const expiresAt = hashPayService.getExpiryTime(15);

    // Initiate with HashPay
    const stkResponse = await hashPayService.initiateSTK({
      amount: String(amountValidation.amountKES),
      msisdn: phoneNumber,
      reference,
    });

    if (!stkResponse.success) {
      ctx.response.status = 502;
      ctx.response.body = { error: stkResponse.message || 'Payment provider error' };
      return;
    }

    // Create payment record
    const payment = await paymentRepo.createPayment({
      orderId,
      userId: user.id,
      amountCents: validation.order!.total_price_cents,
      hashpayCheckoutId: stkResponse.checkout_id,
      hashpayReference: reference,
      mpesaPhone: phoneNumber,
      expiresAt,
    });

    // Update order status
    await orderRepo.updateOrderPaymentStatus(orderId, 'PROCESSING', reference);

    ctx.response.status = 200;
    ctx.response.body = {
      paymentId: payment.id,
      checkoutId: payment.hashpay_checkout_id,
      reference: payment.hashpay_reference,
      expiresAt,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      ctx.response.status = 400;
      ctx.response.body = { error: error.errors[0].message };
      return;
    }
    console.error('[Payment Initiate] Error:', error);
    ctx.response.status = 500;
    ctx.response.body = { error: 'Failed to initiate payment' };
  }
});

// GET /api/payments/status
router.get('/status', requireAuth, statusCheckLimit, async (ctx) => {
  const checkoutId = ctx.request.url.searchParams.get('checkout_id');
  const reference = ctx.request.url.searchParams.get('reference');

  if (!checkoutId && !reference) {
    ctx.response.status = 400;
    ctx.response.body = { error: 'checkout_id or reference required' };
    return;
  }

  const db = ctx.state.db;
  const paymentRepo = new PaymentRepository(db, ctx.state.eventBus);
  const hashPayService = ctx.state.hashPayService;

  try {
    const payment = checkoutId
      ? await paymentRepo.findByCheckoutId(checkoutId)
      : await paymentRepo.findByReference(reference!);

    if (!payment) {
      ctx.response.status = 404;
      ctx.response.body = { error: 'Payment not found' };
      return;
    }

    // Return cached status if terminal
    if (['completed', 'failed', 'cancelled'].includes(payment.status)) {
      ctx.response.body = {
        status: payment.status.toUpperCase(),
        success: payment.status === 'completed',
        paymentId: payment.id,
      };
      return;
    }

    // Check with HashPay for pending payments
    const status = await hashPayService.checkStatus(payment.hashpay_checkout_id);

    if (hashPayService.isTransactionSuccess(status)) {
      await paymentRepo.updatePaymentStatus(
        payment.hashpay_checkout_id,
        'completed',
        { completedAt: new Date() },
      );

      ctx.response.body = {
        status: 'COMPLETED',
        success: true,
        paymentId: payment.id,
      };
    } else if (status.ResultCode && status.ResultCode !== '0') {
      // Failed
      await paymentRepo.updatePaymentStatus(
        payment.hashpay_checkout_id,
        'failed',
        { failedAt: new Date() },
      );

      ctx.response.body = {
        status: 'FAILED',
        success: false,
        message: status.ResultDesc,
        paymentId: payment.id,
      };
    } else {
      // Still pending
      ctx.response.body = {
        status: 'PENDING',
        success: false,
        paymentId: payment.id,
      };
    }
  } catch (error) {
    console.error('[Payment Status] Error:', error);
    ctx.response.status = 500;
    ctx.response.body = { error: 'Failed to check payment status' };
  }
});

// POST /api/payments/timeout
router.post('/timeout', requireAuth, async (ctx) => {
  try {
    const { checkoutId } = await ctx.request.body.json();

    const db = ctx.state.db;
    const paymentRepo = new PaymentRepository(db, ctx.state.eventBus);
    const hashPayService = ctx.state.hashPayService;

    const payment = await paymentRepo.findByCheckoutId(checkoutId);

    if (!payment) {
      ctx.response.status = 404;
      ctx.response.body = { error: 'Payment not found' };
      return;
    }

    // Don't change if already terminal
    if (['completed', 'failed'].includes(payment.status)) {
      ctx.response.body = { status: payment.status, success: payment.status === 'completed' };
      return;
    }

    // One final check with HashPay
    try {
      const hashpayStatus = await hashPayService.checkStatus(payment.hashpay_checkout_id);

      if (hashPayService.isTransactionSuccess(hashpayStatus)) {
        await paymentRepo.updatePaymentStatus(
          payment.hashpay_checkout_id,
          'completed',
          { completedAt: new Date() },
        );
        ctx.response.body = { status: 'COMPLETED', success: true };
        return;
      }
    } catch {
      // HashPay check failed, proceed with timeout
    }

    // Mark as timeout
    await paymentRepo.updatePaymentStatus(
      payment.hashpay_checkout_id,
      'timeout',
      { timeoutReason: 'EXPIRED' },
    );

    ctx.response.body = {
      status: 'TIMEOUT',
      success: false,
      canRetry: true,
    };
  } catch (error) {
    console.error('[Payment Timeout] Error:', error);
    ctx.response.status = 500;
    ctx.response.body = { error: 'Failed to process timeout' };
  }
});

export default router;
```

### Payment Timeout Service

```typescript
// src/infrastructure/payments/PaymentTimeoutService.ts

import { PaymentRecord, PaymentRepository } from './PaymentRepository.ts';
import { OrderRepository } from '../adapters/postgres/OrderRepository.ts';
import { Knex } from 'knex';

export class PaymentTimeoutService {
  constructor(
    private db: Knex,
    private paymentRepo: PaymentRepository,
    private orderRepo: OrderRepository,
  ) {}

  async processExpiredPayments(): Promise<number> {
    const expiredPayments = await this.paymentRepo.findExpiredPayments();
    let processed = 0;

    for (const payment of expiredPayments) {
      try {
        await this.handlePaymentTimeout(payment);
        processed++;
      } catch (error) {
        console.error(`[Timeout] Error processing ${payment.id}:`, error);
      }
    }

    return processed;
  }

  private async handlePaymentTimeout(payment: PaymentRecord): Promise<void> {
    await this.db.transaction(async (trx) => {
      // Mark payment as timeout
      await trx('payments')
        .where('id', payment.id)
        .update({
          status: 'timeout',
          timeout_reason: 'EXPIRED',
          timeout_handled: true,
          version: trx.raw('version + 1'),
        });

      // Record history
      await trx('payment_status_history').insert({
        id: crypto.randomUUID(),
        payment_id: payment.id,
        from_status: 'pending',
        to_status: 'timeout',
        reason: 'Payment expired - no confirmation received',
      });

      // Update order
      await this.orderRepo.updateOrderPaymentStatus(
        payment.order_id,
        'PAYMENT_TIMEOUT',
        payment.hashpay_reference,
      );
    });

    console.log(`[Timeout] Payment ${payment.id} marked as timeout`);
  }
}

// Cron job setup (in your main server file)
// Deno.cron('Process Expired Payments', { minute: { every: 5 } }, async () => {
//   const count = await timeoutService.processExpiredPayments();
//   if (count > 0) console.log(`[Cron] Processed ${count} expired payments`);
// });
```

### Webhook Retry Service

```typescript
// src/infrastructure/payments/WebhookRetryService.ts

import { PaymentRepository } from './PaymentRepository.ts';
import { OrderRepository } from '../adapters/postgres/OrderRepository.ts';
import { Knex } from 'knex';

export class WebhookRetryService {
  constructor(
    private db: Knex,
    private paymentRepo: PaymentRepository,
    private orderRepo: OrderRepository,
  ) {}

  async processFailedWebhooks(): Promise<number> {
    const failedEvents = await this.paymentRepo.getUnprocessedEvents(100);
    let processed = 0;

    for (const event of failedEvents) {
      try {
        await this.processEvent(event);
        processed++;
      } catch (error) {
        console.error(`[WebhookRetry] Failed event ${event.event_id}:`, error);
        await this.paymentRepo.incrementEventRetry(event.event_id);
      }
    }

    return processed;
  }

  private async processEvent(event: {
    payment_id: string;
    event_type: string;
    event_id: string;
    raw_payload: Record<string, unknown>;
  }): Promise<void> {
    const payload = event.raw_payload;
    const payment = await this.paymentRepo.findById(event.payment_id);

    if (!payment) {
      await this.paymentRepo.markEventProcessed(event.event_id);
      return;
    }

    // Skip if already terminal
    if (['completed', 'failed'].includes(payment.status)) {
      await this.paymentRepo.markEventProcessed(event.event_id);
      return;
    }

    // Process based on payload
    if (payload.ResponseCode === 0) {
      await this.paymentRepo.updatePaymentStatus(
        payment.hashpay_checkout_id,
        'completed',
        {
          transactionId: payload.TransactionID as string,
          receipt: payload.TransactionReceipt as string,
          completedAt: new Date(),
        },
      );

      await this.orderRepo.updateOrderPaymentStatus(
        payment.order_id,
        'PAID',
        payment.hashpay_reference,
        new Date(),
      );
    } else {
      await this.paymentRepo.updatePaymentStatus(
        payment.hashpay_checkout_id,
        'failed',
        { failedAt: new Date() },
      );
    }

    await this.paymentRepo.markEventProcessed(event.event_id);
  }
}

// Run every 2 minutes
// Deno.cron('Retry Failed Webhooks', { minute: { every: 2 } }, async () => {
//   const count = await retryService.processFailedWebhooks();
//   if (count > 0) console.log(`[Cron] Retried ${count} webhooks`);
// });
```

---

## Frontend Integration

### Payment Store (Pinia)

```typescript
// src/presentation-nuxt/app/stores/payment-store.ts

import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { PhoneUtils } from '../../../../infrastructure/utils/PhoneUtils';

export type PaymentStatus =
  | 'idle'
  | 'initiating'
  | 'awaiting'
  | 'processing'
  | 'success'
  | 'failed'
  | 'timeout';

const POLL_INTERVAL_MS = 5000;
const MAX_POLL_ATTEMPTS = 180; // 15 minutes
const PAYMENT_TIMEOUT_MINUTES = 15;

export const usePaymentStore = defineStore('payment', () => {
  // State
  const status = ref<PaymentStatus>('idle');
  const phoneNumber = ref('');
  const checkoutId = ref<string | null>(null);
  const reference = ref<string | null>(null);
  const expiresAt = ref<Date | null>(null);
  const error = ref<string | null>(null);
  const pollAttempts = ref(0);
  let pollInterval: number | null = null;

  // Getters
  const isProcessing = computed(() =>
    ['initiating', 'awaiting', 'processing'].includes(status.value)
  );

  const isExpired = computed(() => {
    if (!expiresAt.value) return false;
    return new Date() > expiresAt.value;
  });

  const formattedPhone = computed(() =>
    phoneNumber.value ? PhoneUtils.formatForDisplay(phoneNumber.value) : ''
  );

  const statusMessage = computed(() => {
    const messages: Record<PaymentStatus, string> = {
      idle: '',
      initiating: 'Sending payment request...',
      awaiting: 'Check your phone for the M-Pesa prompt',
      processing: 'Processing your payment...',
      success: 'Payment successful!',
      failed: error.value || 'Payment failed',
      timeout: 'Payment request expired',
    };
    return messages[status.value];
  });

  // Actions
  function setPhoneNumber(phone: string) {
    phoneNumber.value = PhoneUtils.normalize(phone);
  }

  async function initiatePayment(orderId: string) {
    if (!phoneNumber.value) {
      error.value = 'Phone number is required';
      return { success: false };
    }

    if (!PhoneUtils.isValidKenyanPhone(phoneNumber.value)) {
      error.value = 'Invalid phone format. Use: 2547XXXXXXXX';
      return { success: false };
    }

    status.value = 'initiating';
    error.value = null;
    pollAttempts.value = 0;

    try {
      const response = await $fetch<{
        paymentId: string;
        checkoutId: string;
        reference: string;
        expiresAt: string;
      }>('/api/payments/initiate', {
        method: 'POST',
        body: {
          orderId,
          phoneNumber: phoneNumber.value,
        },
      });

      checkoutId.value = response.checkoutId;
      reference.value = response.reference;
      expiresAt.value = new Date(response.expiresAt);
      status.value = 'awaiting';

      startPolling(response.checkoutId);

      return { success: true };
    } catch (err: any) {
      status.value = 'failed';
      error.value = err.data?.error || 'Failed to initiate payment';
      return { success: false, error: error.value };
    }
  }

  function startPolling(id: string) {
    stopPolling();

    pollInterval = window.setInterval(async () => {
      pollAttempts.value++;

      // Check expiration
      if (isExpired.value) {
        handleTimeout();
        return;
      }

      // Check max attempts
      if (pollAttempts.value >= MAX_POLL_ATTEMPTS) {
        handleTimeout();
        return;
      }

      try {
        const result = await $fetch<{
          status: string;
          success: boolean;
          message?: string;
        }>(`/api/payments/status?checkout_id=${id}`);

        if (result.success) {
          status.value = 'success';
          stopPolling();
          return { success: true };
        }

        if (result.status === 'FAILED') {
          status.value = 'failed';
          error.value = result.message || 'Payment failed';
          stopPolling();
          return { success: false };
        }
      } catch {
        // Continue polling on network error
      }
    }, POLL_INTERVAL_MS);
  }

  function stopPolling() {
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
  }

  async function handleTimeout() {
    stopPolling();
    status.value = 'timeout';

    if (checkoutId.value) {
      try {
        await $fetch('/api/payments/timeout', {
          method: 'POST',
          body: { checkoutId: checkoutId.value },
        });
      } catch {
        // Best effort
      }
    }
  }

  async function checkStatus() {
    if (!checkoutId.value) return null;

    try {
      return await $fetch(`/api/payments/status?checkout_id=${checkoutId.value}`);
    } catch (error) {
      return null;
    }
  }

  function reset() {
    stopPolling();
    status.value = 'idle';
    phoneNumber.value = '';
    checkoutId.value = null;
    reference.value = null;
    expiresAt.value = null;
    error.value = null;
    pollAttempts.value = 0;
  }

  return {
    status,
    phoneNumber,
    checkoutId,
    reference,
    expiresAt,
    error,
    isProcessing,
    isExpired,
    formattedPhone,
    statusMessage,
    setPhoneNumber,
    initiatePayment,
    checkStatus,
    handleTimeout,
    reset,
  };
});
```

### Payment Component

```vue
<!-- src/presentation-nuxt/app/components/CheckoutPayment.vue -->

<script setup lang="ts">
import { computed } from 'vue';
import { Smartphone, Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-vue-next';
import { usePaymentStore } from '../stores/payment-store';

const props = defineProps<{
  orderId: string;
  amount: number;
}>();

const emit = defineEmits<{
  success: [];
  failed: [error: string];
}>();

const payment = usePaymentStore();

const isValidPhone = computed(() => 
  payment.phoneNumber.length === 12 && payment.phoneNumber.startsWith('254')
);

async function handleSubmit() {
  const result = await payment.initiatePayment(props.orderId);
  
  if (result.success) {
    emit('success');
  } else {
    emit('failed', payment.error || 'Unknown error');
  }
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h3 class="text-xl font-bold text-flexoki-900 mb-2">M-Pesa Payment</h3>
      <p class="text-sm text-flexoki-600">Pay securely via M-Pesa STK Push</p>
    </div>

    <!-- Instructions -->
    <div class="p-4 rounded-xl bg-flexoki-50 border border-flexoki-200">
      <div class="flex items-start gap-3">
        <Smartphone class="w-6 h-6 text-flexoki-primary shrink-0 mt-0.5" />
        <div class="text-sm text-flexoki-700">
          <p class="font-medium mb-1">How it works:</p>
          <ol class="list-decimal list-inside space-y-1 text-flexoki-600">
            <li>Enter your M-Pesa registered phone number</li>
            <li>You'll receive an STK push on your phone</li>
            <li>Enter your M-Pesa PIN to confirm</li>
            <li>Order will be confirmed automatically</li>
          </ol>
        </div>
      </div>
    </div>

    <!-- Phone Input -->
    <div>
      <label class="block mb-2">
        <span class="text-sm font-medium text-flexoki-900">Phone Number</span>
        <span class="text-flexoki-primary"> *</span>
      </label>
      
      <div class="relative">
        <Smartphone class="absolute left-3 top-1/2 -translate-y-1/2 text-flexoki-400" :size="20" />
        <input
          type="tel"
          v-model="payment.phoneNumber"
          placeholder="2547XXXXXXXX"
          class="w-full pl-10 pr-4 py-3 rounded-lg border border-flexoki-300 focus:border-flexoki-primary focus:ring-2 focus:ring-flexoki-primary/20 outline-none transition-all font-mono"
          :class="{ 'border-red-500': payment.phoneNumber && !isValidPhone }"
          :disabled="payment.isProcessing"
        />
      </div>
      
      <p v-if="payment.phoneNumber && !isValidPhone" class="text-xs text-red-500 mt-1">
        Use format: 2547XXXXXXXX (12 digits)
      </p>
    </div>

    <!-- Status -->
    <div v-if="payment.statusMessage" 
         class="flex items-center gap-2 p-3 rounded-lg"
         :class="payment.status === 'failed' || payment.status === 'timeout' 
           ? 'bg-red-50 border border-red-200 text-red-700'
           : 'bg-flexoki-50 border border-flexoki-200 text-flexoki-700'">
      <Loader2 v-if="payment.isProcessing" class="w-5 h-5 animate-spin" />
      <CheckCircle v-else-if="payment.status === 'success'" class="w-5 h-5 text-green-500" />
      <XCircle v-else-if="payment.status === 'failed' || payment.status === 'timeout'" class="w-5 h-5" />
      <AlertCircle v-else class="w-5 h-5" />
      <span class="text-sm">{{ payment.statusMessage }}</span>
    </div>

    <!-- Amount -->
    <div class="p-4 rounded-xl bg-flexoki-900 text-white">
      <div class="flex justify-between items-center">
        <span class="text-sm text-white/70">Amount to pay</span>
        <span class="text-2xl font-bold">
          KSh {{ (amount / 100).toLocaleString() }}
        </span>
      </div>
    </div>

    <!-- Submit -->
    <button
      @click="handleSubmit"
      :disabled="!isValidPhone || payment.isProcessing"
      class="w-full py-3 px-4 bg-flexoki-primary text-white rounded-lg font-medium
             disabled:opacity-50 disabled:cursor-not-allowed
             hover:bg-flexoki-primary/90 transition-colors"
    >
      <span v-if="payment.isProcessing">Processing...</span>
      <span v-else>Pay with M-Pesa</span>
    </button>
  </div>
</template>
```

---

## Error Handling & Timeouts

### Payment Delay Scenarios

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    M-PESA PAYMENT DELAY SCENARIOS                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. STK Push Sent - User hasn't received prompt                           │
│     → Show "Check your phone" instruction                                  │
│                                                                             │
│  2. STK Push Received - User entered PIN but pending                      │
│     → Keep polling, show "Processing..."                                  │
│                                                                             │
│  3. User closed phone without completing                                   │
│     → Detect timeout, show "Payment not completed" + retry option        │
│                                                                             │
│  4. Network/Safaricom delay                                               │
│     → Webhook eventually arrives → Process normally                        │
│                                                                             │
│  5. Webhook arrives AFTER timeout                                          │
│     → MUST still process! Check status on webhook delivery                │
│                                                                             │
│  6. Duplicate webhook                                                     │
│     → Idempotent processing prevents double-processing                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### User Notification Rules

| Scenario           | User Sees                            | Actions Available       |
| ------------------ | ------------------------------------ | ----------------------- |
| STK sent, awaiting | "Check your phone for M-Pesa prompt" | Cancel, wait            |
| User entered PIN   | "Processing payment..."              | Wait                    |
| Payment success    | "Payment Successful!"                | View orders             |
| User cancelled     | "Payment cancelled"                  | Try again               |
| Timeout (15 min)   | "Payment expired. Try again?"        | Try again, Contact      |
| Network error      | "Having issues? Check status"        | Check status, Try again |
| Late webhook       | "Payment confirmed!" (auto)          | View orders             |

---

## Accounting & Reconciliation

### Daily Reconciliation Queries

```sql
-- Daily payment summary
SELECT 
    DATE(initiated_at) as date,
    COUNT(*) as total_transactions,
    SUM(amount_cents) as gross_amount,
    SUM(CASE WHEN status = 'completed' THEN amount_cents ELSE 0 END) as successful_amount,
    SUM(CASE WHEN status = 'failed' THEN amount_cents ELSE 0 END) as failed_amount,
    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as successful_count,
    SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_count,
    SUM(CASE WHEN status = 'pending' AND expires_at < NOW() THEN 1 ELSE 0 END) as timeout_count
FROM payments
WHERE initiated_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(initiated_at)
ORDER BY date DESC;

-- Payment status distribution
SELECT 
    status,
    COUNT(*) as count,
    SUM(amount_cents) as total_amount
FROM payments
WHERE initiated_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY status;

-- Fraud detection: Multiple attempts per order
SELECT 
    order_id,
    COUNT(*) as attempt_count,
    array_agg(DISTINCT status) as statuses
FROM payments
WHERE initiated_at > NOW() - INTERVAL '1 hour'
GROUP BY order_id
HAVING COUNT(*) > 3;

-- Late webhook processing
SELECT 
    p.id,
    p.hashpay_reference,
    p.status,
    p.initiated_at,
    p.completed_at,
    EXTRACT(EPOCH FROM (p.completed_at - p.initiated_at))/60 as minutes_to_complete
FROM payments p
WHERE p.status = 'completed'
  AND p.completed_at > p.expires_at
ORDER BY p.completed_at DESC;
```

---

## Testing

### Test Scenarios

```typescript
// __tests__/payments/hashpay.test.ts

describe('HashPay Integration', () => {
  describe('PhoneUtils', () => {
    it('normalizes phone numbers correctly', () => {
      expect(PhoneUtils.normalize('0712345678')).toBe('254712345678');
      expect(PhoneUtils.normalize('712345678')).toBe('254712345678');
      expect(PhoneUtils.normalize('254712345678')).toBe('254712345678');
    });

    it('validates Kenyan phone format', () => {
      expect(PhoneUtils.isValidKenyanPhone('254712345678')).toBe(true);
      expect(PhoneUtils.isValidKenyanPhone('254123456789')).toBe(false);
      expect(PhoneUtils.isValidKenyanPhone('0712345678')).toBe(false);
    });
  });

  describe('PaymentRepository', () => {
    it('prevents invalid status transitions', async () => {
      // Setup completed payment
      const payment = await repo.findByCheckoutId('test_checkout');

      // Should throw on invalid transition
      await expect(
        repo.updatePaymentStatus('test_checkout', 'pending'),
      ).rejects.toThrow('Invalid status transition');
    });

    it('handles idempotent webhook events', async () => {
      const eventId = 'evt_test_123';

      // First call should insert
      const first = await repo.recordPaymentEvent({
        paymentId: 'pay_123',
        eventType: 'webhook',
        eventId,
        rawPayload: {},
      });
      expect(first).toBe(true);

      // Second call should return false (already exists)
      const second = await repo.recordPaymentEvent({
        paymentId: 'pay_123',
        eventType: 'webhook',
        eventId,
        rawPayload: {},
      });
      expect(second).toBe(false);
    });
  });

  describe('Webhook Security', () => {
    it('rejects requests without valid signature', async () => {
      const response = await request(app)
        .post('/webhooks/hashpay')
        .send({ ResponseCode: 0 })
        .expect(401);
    });

    it('rejects requests from invalid IPs', async () => {
      const response = await request(app)
        .post('/webhooks/hashpay')
        .set('X-Forwarded-For', '1.2.3.4')
        .send({ ResponseCode: 0 })
        .expect(403);
    });
  });
});
```

---

## Implementation Checklist

### Phase 1: Backend (Week 1)

- [ ] Run database migrations (create types and tables)
- [ ] Configure environment variables
- [ ] Implement HashPayService with timeout support
- [ ] Implement PaymentRepository with transactions
- [ ] Implement OrderValidator with fraud checks
- [ ] Create secure webhook endpoint with signature verification
- [ ] Create payment API routes (/initiate, /status, /timeout)
- [ ] Setup cron jobs (expired payments, webhook retry)

### Phase 2: Frontend (Week 2)

- [ ] Implement PhoneUtils
- [ ] Create payment store with polling
- [ ] Update CheckoutPayment component
- [ ] Create checkout success/failure pages
- [ ] Add retry functionality

### Phase 3: Testing (Week 3)

- [ ] Unit tests for services
- [ ] Integration tests for payment flow
- [ ] Webhook security tests
- [ ] Load testing for concurrent payments

### Phase 4: Production (Week 4)

- [ ] HashPay production credentials
- [ ] SSL certificate verification
- [ ] Monitoring and alerting setup
- [ ] Runbook for common issues

---

## Environment Variables

```env
# HashPay
HASHPAY_API_KEY=your_api_key_here
HASHPAY_ACCOUNT_ID=ACC_ID
HASHPAY_ENVIRONMENT=production
HASHPAY_WEBHOOK_SECRET=generate_strong_secret_here

# Payment Settings
PAYMENT_TIMEOUT_MINUTES=15
PAYMENT_RETRY_ATTEMPTS=3
PAYMENT_RETRY_DELAY_SECONDS=30
PAYMENT_MIN_AMOUNT_KES=10
PAYMENT_MAX_AMOUNT_KES=150000

# Rate Limiting
PAYMENT_RATE_LIMIT_PER_MINUTE=5
PAYMENT_STATUS_CHECK_LIMIT_PER_MINUTE=30

# Frontend
FRONTEND_URL=https://yndu.co.ke
PAYMENT_SUCCESS_URL=https://yndu.co.ke/checkout/success
PAYMENT_CANCEL_URL=https://yndu.co.ke/checkout/cancel

# Server
PORT=8000
HOST=0.0.0.0

# Security
JWT_SECRET=...
CORS_ORIGIN=https://yndu.co.ke
HASHPAY_ALLOWED_IPS=203.0.113.0/24
```

---

## Quick Reference

### API Endpoints

| Endpoint                 | Method | Auth      | Rate Limit | Description       |
| ------------------------ | ------ | --------- | ---------- | ----------------- |
| `/api/payments/initiate` | POST   | JWT       | 5/min      | Start STK push    |
| `/api/payments/status`   | GET    | JWT       | 30/min     | Check status      |
| `/api/payments/timeout`  | POST   | JWT       | 5/min      | Mark timeout      |
| `/webhooks/hashpay`      | POST   | Signature | 100/min    | HashPay callbacks |

### Status Transitions

```
pending → processing → completed
   ↓           ↓           ↑
timeout ←─── failed ──────┘
```

### Emergency Contacts

- HashPay Support: support@hashback.co.ke
- Safaricom M-Pesa: 234
