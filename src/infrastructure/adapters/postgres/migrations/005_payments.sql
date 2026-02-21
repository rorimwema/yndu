-- =====================================================
-- PAYMENTS TABLE MIGRATION
-- =====================================================

-- TYPE DEFINITIONS
DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM (
        'pending', 'processing', 'completed', 'failed', 'cancelled', 'timeout', 'refunded'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_channel AS ENUM ('mpesa', 'card', 'bank');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_timeout_reason AS ENUM (
        'USER_ABANDONED', 'EXPIRED', 'NETWORK_ERROR', 'CANCELLED_BY_USER'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- PAYMENTS TABLE
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
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_checkout ON payments(hashpay_checkout_id);
CREATE INDEX IF NOT EXISTS idx_payments_reference ON payments(hashpay_reference);
CREATE INDEX IF NOT EXISTS idx_payments_created ON payments(initiated_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_expired ON payments(status, expires_at) 
    WHERE status = 'pending';

-- PAYMENT EVENTS TABLE (Audit Trail)
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

CREATE INDEX IF NOT EXISTS idx_payment_events_payment ON payment_events(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_events_unprocessed ON payment_events(processed, retry_count) 
    WHERE processed = FALSE;

-- PAYMENT STATUS HISTORY
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

CREATE INDEX IF NOT EXISTS idx_payment_status_history_payment ON payment_status_history(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_status_history_created ON payment_status_history(created_at DESC);

-- ORDERS TABLE EXTENSIONS
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_id UUID REFERENCES payments(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_notes TEXT;
