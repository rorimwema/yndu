-- ============================================================================
-- YNDU DATABASE SCHEMA - SUBSCRIPTION ENHANCEMENT
-- Adds subscription_id to orders and enhances subscriptions table
-- for full DDD Subscription aggregate support
-- ============================================================================

-- ============================================================================
-- 1. ENHANCE SUBSCRIPTIONS TABLE
-- ============================================================================

-- Add new columns to support enhanced Subscription aggregate
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS plan_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS plan_description TEXT,
ADD COLUMN IF NOT EXISTS plan_price_cents INTEGER CHECK (plan_price_cents >= 0),
ADD COLUMN IF NOT EXISTS delivery_slot_date DATE,
ADD COLUMN IF NOT EXISTS delivery_slot_type VARCHAR(20) CHECK (delivery_slot_type IN ('SAME_DAY', 'NEXT_DAY')),
ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS current_period_start DATE,
ADD COLUMN IF NOT EXISTS current_period_end DATE,
ADD COLUMN IF NOT EXISTS next_billing_date DATE,
ADD COLUMN IF NOT EXISTS pause_history JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS billing_cycle VARCHAR(20) DEFAULT 'MONTHLY'
    CHECK (billing_cycle IN ('WEEKLY', 'BIWEEKLY', 'MONTHLY'));

-- Update existing rows with default values where needed
UPDATE subscriptions 
SET 
    plan_name = COALESCE(plan_name, 'Standard Box'),
    plan_description = COALESCE(plan_description, 'Weekly produce delivery'),
    plan_price_cents = COALESCE(plan_price_cents, 5000),
    delivery_slot_date = COALESCE(delivery_slot_date, next_delivery_date),
    delivery_slot_type = COALESCE(delivery_slot_type, 'NEXT_DAY'),
    items = COALESCE(items, '[]'),
    current_period_start = COALESCE(current_period_start, created_at::DATE),
    current_period_end = COALESCE(current_period_end, next_delivery_date),
    next_billing_date = COALESCE(next_billing_date, next_delivery_date),
    pause_history = COALESCE(pause_history, '[]'),
    billing_cycle = COALESCE(billing_cycle, 'MONTHLY')
WHERE plan_name IS NULL;

-- Make new columns NOT NULL after populating
ALTER TABLE subscriptions 
ALTER COLUMN plan_name SET NOT NULL,
ALTER COLUMN plan_price_cents SET NOT NULL,
ALTER COLUMN billing_cycle SET NOT NULL;

-- ============================================================================
-- 2. ADD SUBSCRIPTION_ID TO ORDERS
-- ============================================================================

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS subscription_id UUID REFERENCES subscriptions(id),
ADD COLUMN IF NOT EXISTS is_from_subscription BOOLEAN DEFAULT FALSE;

-- Create indexes for subscription-related queries
CREATE INDEX IF NOT EXISTS idx_orders_subscription ON orders(subscription_id);
CREATE INDEX IF NOT EXISTS idx_orders_is_from_subscription ON orders(is_from_subscription);

-- ============================================================================
-- 3. ADD SUBSCRIPTION_ID TO SUBSCRIPTION DELIVERIES
-- ============================================================================

ALTER TABLE subscription_deliveries
ADD COLUMN IF NOT EXISTS subscription_id UUID REFERENCES subscriptions(id);

CREATE INDEX IF NOT EXISTS idx_subscription_deliveries_sub_new ON subscription_deliveries(subscription_id);

-- ============================================================================
-- 4. ENHANCE EXISTING INDEXES
-- ============================================================================

-- Add composite index for billing date queries
CREATE INDEX IF NOT EXISTS idx_subscriptions_next_billing 
ON subscriptions(next_billing_date) 
WHERE status = 'ACTIVE' AND next_billing_date IS NOT NULL;

-- Add index for user subscriptions with status
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status_new 
ON subscriptions(user_id, status) 
WHERE status != 'CANCELLED';

-- ============================================================================
-- 5. CREATE SUBSCRIPTION EVENTS TABLE (for event sourcing)
-- ============================================================================

-- Note: Using the existing domain_events table which already supports Subscription
-- This is just a comment for clarity - the schema already has the right structure

-- ============================================================================
-- 6. VIEWS FOR SUBSCRIPTIONS
-- ============================================================================

-- Active subscriptions view with full details
CREATE OR REPLACE VIEW v_active_subscriptions AS
SELECT 
    s.*,
    u.email as user_email,
    u.phone as user_phone,
    ua.label as delivery_label,
    ua.zone as delivery_zone,
    ua.street_address as delivery_address,
    bt.name as box_template_name
FROM subscriptions s
JOIN users u ON s.user_id = u.id
JOIN user_addresses ua ON s.delivery_address_id = ua.id
LEFT JOIN box_templates bt ON s.box_template_id = bt.id
WHERE s.status IN ('ACTIVE', 'PAUSED')
AND s.deleted_at IS NULL;

-- Subscriptions due for renewal view
CREATE OR REPLACE VIEW v_subscriptions_due_renewal AS
SELECT 
    s.*,
    u.email as user_email,
    u.phone as user_phone,
    DATEDIFF('day', CURRENT_DATE, s.next_billing_date) as days_until_billing
FROM subscriptions s
JOIN users u ON s.user_id = u.id
WHERE s.status = 'ACTIVE'
AND s.next_billing_date <= CURRENT_DATE + INTERVAL '3 days';

-- ============================================================================
-- 7. FUNCTIONS FOR SUBSCRIPTION MANAGEMENT
-- ============================================================================

-- Function to process subscription renewal
CREATE OR REPLACE FUNCTION process_subscription_renewal(p_subscription_id UUID)
RETURNS UUID AS $$
DECLARE
    v_order_id UUID;
    v_user_id UUID;
    v_delivery_address_id UUID;
    v_delivery_date DATE;
    v_slot_type VARCHAR(20);
    v_items JSONB;
    v_plan_price_cents INTEGER;
BEGIN
    -- Get subscription details
    SELECT 
        user_id, 
        delivery_address_id, 
        delivery_slot_date, 
        delivery_slot_type,
        items,
        plan_price_cents
    INTO v_user_id, v_delivery_address_id, v_delivery_date, v_slot_type, v_items, v_plan_price_cents
    FROM subscriptions
    WHERE id = p_subscription_id AND status = 'ACTIVE';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Subscription not found or not active';
    END IF;

    -- Create order from subscription
    INSERT INTO orders (
        user_id,
        status,
        total_price_cents,
        delivery_date,
        slot_type,
        delivery_address_id,
        subscription_id,
        is_from_subscription,
        items
    )
    SELECT 
        v_user_id,
        'PENDING',
        v_plan_price_cents,
        v_delivery_date,
        v_slot_type,
        v_delivery_address_id,
        p_subscription_id,
        TRUE,
        v_items
    RETURNING id INTO v_order_id;

    -- Update subscription next billing date
    UPDATE subscriptions
    SET 
        current_period_start = current_period_end,
        current_period_end = current_period_end + (
            CASE billing_cycle 
                WHEN 'WEEKLY' THEN INTERVAL '7 days'
                WHEN 'BIWEEKLY' THEN INTERVAL '14 days'
                WHEN 'MONTHLY' THEN INTERVAL '30 days'
                ELSE INTERVAL '30 days'
            END
        ),
        next_billing_date = next_billing_date + (
            CASE billing_cycle 
                WHEN 'WEEKLY' THEN INTERVAL '7 days'
                WHEN 'BIWEEKLY' THEN INTERVAL '14 days'
                WHEN 'MONTHLY' THEN INTERVAL '30 days'
                ELSE INTERVAL '30 days'
            END
        ),
        version = version + 1,
        updated_at = NOW()
    WHERE id = p_subscription_id;

    RETURN v_order_id;
END;
$$ LANGUAGE plpgsql;

-- Function to pause subscription
CREATE OR REPLACE FUNCTION pause_subscription(
    p_subscription_id UUID,
    p_reason TEXT,
    p_resume_date DATE DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    v_pause_history JSONB;
BEGIN
    -- Get current pause history
    SELECT pause_history INTO v_pause_history
    FROM subscriptions
    WHERE id = p_subscription_id;

    -- Add new pause record
    v_pause_history = COALESCE(v_pause_history, '[]'::jsonb) || jsonb_build_array(
        jsonb_build_object(
            'startDate', NOW()::DATE,
            'endDate', p_resume_date,
            'reason', p_reason,
            'createdAt', NOW()::DATE
        )
    );

    UPDATE subscriptions
    SET 
        status = 'PAUSED',
        paused_at = NOW(),
        pause_history = v_pause_history,
        version = version + 1,
        updated_at = NOW()
    WHERE id = p_subscription_id AND status = 'ACTIVE';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Subscription not found or not active';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to resume subscription
CREATE OR REPLACE FUNCTION resume_subscription(p_subscription_id UUID)
RETURNS VOID AS $$
DECLARE
    v_pause_history JSONB;
BEGIN
    -- Get pause history and update most recent pause record
    SELECT pause_history INTO v_pause_history
    FROM subscriptions
    WHERE id = p_subscription_id AND status = 'PAUSED';

    IF v_pause_history IS NULL OR jsonb_array_length(v_pause_history) = 0 THEN
        RAISE EXCEPTION 'No pause record found';
    END IF;

    -- Update the most recent pause record with end date
    v_pause_history = (
        SELECT jsonb_agg(
            CASE 
                WHEN i = jsonb_array_length(v_pause_history) - 1 
                THEN elem - jsonb_build_object('endDate', NULL) + jsonb_build_object('endDate', NOW()::DATE)
                ELSE elem
            END
        )
        FROM jsonb_array_elements(vpause_history) WITH ORDINALITY AS arr(elem, i)
    );

    UPDATE subscriptions
    SET 
        status = 'ACTIVE',
        pause_history = v_pause_history,
        version = version + 1,
        updated_at = NOW()
    WHERE id = p_subscription_id AND status = 'PAUSED';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Subscription not found or not paused';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 8. FINAL OPTIMIZATIONS
-- ============================================================================

ANALYZE subscriptions;
ANALYZE orders;

COMMENT ON TABLE subscriptions IS 'Enhanced subscription table supporting full DDD Subscription aggregate with pause/resume, modification, and auto-renewal.';
COMMENT ON COLUMN orders.subscription_id IS 'Links order to parent subscription for recurring orders';
COMMENT ON COLUMN orders.is_from_subscription IS 'Boolean flag indicating if order was auto-generated from subscription';
