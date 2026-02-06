-- Events table for event sourcing (all bounded contexts)
CREATE TABLE domain_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stream_id UUID NOT NULL,
    stream_type VARCHAR(64) NOT NULL,
    version INTEGER NOT NULL,
    event_type VARCHAR(128) NOT NULL,
    payload JSONB NOT NULL,
    metadata JSONB,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(stream_id, version)
);

CREATE INDEX idx_events_stream ON domain_events(stream_id, version);
CREATE INDEX idx_events_type ON domain_events(event_type);
CREATE INDEX idx_events_occurred ON domain_events(occurred_at);

-- Optimistic locking for aggregate updates
CREATE TABLE aggregate_snapshots (
    id UUID PRIMARY KEY,
    type VARCHAR(64) NOT NULL,
    version INTEGER NOT NULL,
    state JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_snapshots_type ON aggregate_snapshots(type);

-- User Management Context
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    profile JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    label VARCHAR(50) NOT NULL,
    coordinates POINT NOT NULL,
    zone VARCHAR(50) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_addresses_user ON user_addresses(user_id);
CREATE INDEX idx_addresses_zone ON user_addresses(zone);

-- Inventory Context
CREATE TABLE produce_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    name_sw VARCHAR(255),
    category VARCHAR(50) NOT NULL,
    unit_price_cents INTEGER NOT NULL,
    available_quantity DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    reorder_threshold DECIMAL(10,2) DEFAULT 0,
    is_seasonal BOOLEAN DEFAULT FALSE,
    season_start DATE,
    season_end DATE,
    is_active BOOLEAN DEFAULT TRUE,
    image_url VARCHAR(500),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE box_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    size VARCHAR(20) NOT NULL CHECK (size IN ('SMALL', 'MEDIUM', 'LARGE')),
    base_price_cents INTEGER NOT NULL,
    max_weight_kg DECIMAL(5,2) NOT NULL,
    is_customizable BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    items JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ordering Context
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    total_price_cents INTEGER NOT NULL,
    delivery_date DATE NOT NULL,
    slot_type VARCHAR(20) NOT NULL CHECK (slot_type IN ('SAME_DAY', 'NEXT_DAY')),
    delivery_address_id UUID NOT NULL,
    items JSONB NOT NULL,
    placed_at TIMESTAMPTZ DEFAULT NOW(),
    confirmed_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_delivery ON orders(delivery_date);

-- Subscription Context
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    box_template_id UUID NOT NULL,
    frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('WEEKLY', 'BIWEEKLY', 'MONTHLY')),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    next_delivery_date DATE NOT NULL,
    delivery_address_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    paused_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_next ON subscriptions(next_delivery_date) WHERE status = 'ACTIVE';

-- Delivery Context
CREATE TABLE riders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    zone VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    current_location POINT,
    last_location_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE delivery_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL UNIQUE,
    rider_id UUID REFERENCES riders(id),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    assigned_at TIMESTAMPTZ,
    picked_up_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    delivery_proof JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_assignments_rider ON delivery_assignments(rider_id);
CREATE INDEX idx_assignments_status ON delivery_assignments(status);
