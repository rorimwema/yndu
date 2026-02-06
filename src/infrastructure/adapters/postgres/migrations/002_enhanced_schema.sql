-- ============================================================================
-- YNDU DATABASE SCHEMA - PRODUCTION ENHANCED VERSION
-- Applied database-schema-design skill best practices
-- ============================================================================

-- ============================================================================
-- 1. CORE UTILITIES
-- ============================================================================

-- Auto-update trigger function for audit columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Auto-increment version function
CREATE OR REPLACE FUNCTION increment_version()
RETURNS TRIGGER AS $$
BEGIN
  NEW.version = OLD.version + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 2. EVENT SOURCING INFRASTRUCTURE
-- ============================================================================

-- Events table for event sourcing (all bounded contexts)
-- Enhanced with partitioning for performance
CREATE TABLE domain_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stream_id UUID NOT NULL,           -- Aggregate ID
    stream_type VARCHAR(64) NOT NULL,  -- "Order", "Subscription", etc.
    version INTEGER NOT NULL,
    event_type VARCHAR(128) NOT NULL,  -- "OrderPlaced", "StockDecremented"
    payload JSONB NOT NULL,
    metadata JSONB,                    -- correlation_id, causation_id
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT unique_stream_version UNIQUE(stream_id, version),
    -- Validate version starts at 1
    CONSTRAINT version_positive CHECK (version > 0),
    -- Validate stream_type is a known aggregate
    CONSTRAINT valid_stream_type CHECK (
        stream_type IN ('Order', 'ProduceItem', 'Subscription', 'User', 'Rider', 'DeliveryAssignment')
    )
) PARTITION BY RANGE (occurred_at);

-- Create monthly partitions for events (last 12 months + 3 future months)
DO $$
DECLARE
    partition_date DATE;
    partition_name TEXT;
    start_date DATE;
    end_date DATE;
BEGIN
    FOR i IN -12..3 LOOP
        partition_date := DATE_TRUNC('month', CURRENT_DATE + (i || ' months')::INTERVAL);
        partition_name := 'domain_events_' || TO_CHAR(partition_date, 'YYYY_MM');
        start_date := partition_date;
        end_date := partition_date + INTERVAL '1 month';
        
        EXECUTE format(
            'CREATE TABLE IF NOT EXISTS %I PARTITION OF domain_events
             FOR VALUES FROM (%L) TO (%L)',
            partition_name, start_date, end_date
        );
    END LOOP;
END $$;

-- Event store indexes (optimized for common query patterns)
CREATE INDEX idx_events_stream ON domain_events(stream_id, version);
CREATE INDEX idx_events_type ON domain_events(event_type);
CREATE INDEX idx_events_occurred ON domain_events(occurred_at);
CREATE INDEX idx_events_stream_type ON domain_events(stream_type, occurred_at DESC);

-- GIN index for JSONB payload queries
CREATE INDEX idx_events_payload ON domain_events USING GIN (payload jsonb_path_ops);

-- Optimistic locking for aggregate updates with enhanced metadata
CREATE TABLE aggregate_snapshots (
    id UUID PRIMARY KEY,
    type VARCHAR(64) NOT NULL,
    version INTEGER NOT NULL,
    state JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Soft delete support
    deleted_at TIMESTAMPTZ,
    
    CONSTRAINT positive_version CHECK (version > 0)
);

CREATE INDEX idx_snapshots_type ON aggregate_snapshots(type) WHERE deleted_at IS NULL;
CREATE INDEX idx_snapshots_type_version ON aggregate_snapshots(type, version DESC);

-- Trigger for updated_at
CREATE TRIGGER aggregate_snapshots_updated_at
BEFORE UPDATE ON aggregate_snapshots
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 3. USER MANAGEMENT CONTEXT
-- ============================================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE NOT NULL,
    phone_verified BOOLEAN DEFAULT FALSE NOT NULL,
    profile JSONB NOT NULL DEFAULT '{}',
    -- Status lifecycle
    status VARCHAR(20) NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'suspended', 'deactivated')),
    -- Soft delete
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES users(id),
    -- Audit columns
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    -- Optimistic locking
    version INTEGER NOT NULL DEFAULT 1
);

-- Trigger for updated_at
CREATE TRIGGER users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger for version increment
CREATE TRIGGER users_version
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION increment_version();

-- Indexes
CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_phone ON users(phone) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_status ON users(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_active ON users(id) WHERE deleted_at IS NULL;

-- GIN index for profile JSONB
CREATE INDEX idx_users_profile ON users USING GIN (profile);

CREATE TABLE user_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    label VARCHAR(50) NOT NULL
        CHECK (label IN ('Home', 'Office', 'Other')),
    coordinates POINT NOT NULL,
    zone VARCHAR(50) NOT NULL
        CHECK (zone IN ('KIBWEZI_CENTRAL', 'KIBWEZI_NORTH', 'NAIROBI_EAST', 'NAIROBI_WEST')),
    is_default BOOLEAN DEFAULT FALSE NOT NULL,
    -- Address details
    street_address TEXT,
    building_name VARCHAR(200),
    floor_number VARCHAR(20),
    delivery_instructions TEXT,
    -- Soft delete
    deleted_at TIMESTAMPTZ,
    -- Audit columns
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    CONSTRAINT one_default_per_user UNIQUE (user_id, is_default)
);

-- Partial unique index for default addresses
CREATE UNIQUE INDEX idx_addresses_default 
ON user_addresses(user_id) 
WHERE is_default = TRUE AND deleted_at IS NULL;

CREATE INDEX idx_addresses_user ON user_addresses(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_addresses_zone ON user_addresses(zone) WHERE deleted_at IS NULL;
CREATE INDEX idx_addresses_coordinates ON user_addresses USING GIST (coordinates);

-- Trigger for updated_at
CREATE TRIGGER user_addresses_updated_at
BEFORE UPDATE ON user_addresses
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 4. INVENTORY CONTEXT
-- ============================================================================

CREATE TABLE produce_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
        CHECK (name IN ('LEAFY_GREENS', 'ROOT_VEGETABLES', 'FRUITS', 'HERBS')),
    display_name VARCHAR(100) NOT NULL,
    display_name_sw VARCHAR(100),
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Seed categories
INSERT INTO produce_categories (name, display_name, display_name_sw, sort_order) VALUES
('LEAFY_GREENS', 'Leafy Greens', 'Mboga za Majani', 1),
('ROOT_VEGETABLES', 'Root Vegetables', 'Mboga za Mizizi', 2),
('FRUITS', 'Fruits', 'Matunda', 3),
('HERBS', 'Herbs', 'Viungo', 4);

-- Trigger for updated_at
CREATE TRIGGER produce_categories_updated_at
BEFORE UPDATE ON produce_categories
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE produce_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    name_sw VARCHAR(255),              -- Swahili name
    category_id INTEGER NOT NULL REFERENCES produce_categories(id),
    -- Price stored as integer cents (KES) - NEVER use FLOAT for money
    unit_price_cents INTEGER NOT NULL 
        CHECK (unit_price_cents >= 0),
    available_quantity DECIMAL(10,2) NOT NULL DEFAULT 0
        CHECK (available_quantity >= 0),
    unit VARCHAR(20) NOT NULL
        CHECK (unit IN ('kg', 'pcs', 'bunches', 'g')),
    reorder_threshold DECIMAL(10,2) NOT NULL DEFAULT 0
        CHECK (reorder_threshold >= 0),
    is_seasonal BOOLEAN DEFAULT FALSE NOT NULL,
    season_start DATE,
    season_end DATE,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    image_url VARCHAR(500),
    description TEXT,
    nutritional_info JSONB,
    -- Soft delete
    deleted_at TIMESTAMPTZ,
    -- Audit columns
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    -- Optimistic locking
    version INTEGER NOT NULL DEFAULT 1,
    
    -- Validate season dates when seasonal
    CONSTRAINT valid_season CHECK (
        NOT is_seasonal OR (season_start IS NOT NULL AND season_end IS NOT NULL)
    ),
    CONSTRAINT valid_season_range CHECK (
        NOT is_seasonal OR season_end >= season_start
    )
);

-- Trigger for updated_at
CREATE TRIGGER produce_items_updated_at
BEFORE UPDATE ON produce_items
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger for version increment
CREATE TRIGGER produce_items_version
BEFORE UPDATE ON produce_items
FOR EACH ROW
EXECUTE FUNCTION increment_version();

-- Indexes
CREATE INDEX idx_produce_category ON produce_items(category_id) WHERE deleted_at IS NULL AND is_active = TRUE;
CREATE INDEX idx_produce_active ON produce_items(id) WHERE deleted_at IS NULL AND is_active = TRUE;
CREATE INDEX idx_produce_seasonal ON produce_items(is_seasonal, season_start, season_end) WHERE is_seasonal = TRUE;
CREATE INDEX idx_produce_reorder ON produce_items(available_quantity, reorder_threshold) 
WHERE available_quantity <= reorder_threshold AND deleted_at IS NULL;

-- Inventory movements table (audit trail)
CREATE TABLE inventory_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    produce_item_id UUID NOT NULL REFERENCES produce_items(id),
    movement_type VARCHAR(20) NOT NULL
        CHECK (movement_type IN ('IN', 'OUT', 'ADJUSTMENT', 'RETURN')),
    quantity DECIMAL(10,2) NOT NULL,
    previous_quantity DECIMAL(10,2) NOT NULL,
    new_quantity DECIMAL(10,2) NOT NULL,
    reason VARCHAR(255) NOT NULL,
    reference_id UUID,  -- Order ID, adjustment ID, etc.
    reference_type VARCHAR(50),
    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES users(id)
);

CREATE INDEX idx_inventory_movements_item ON inventory_movements(produce_item_id);
CREATE INDEX idx_inventory_movements_created ON inventory_movements(created_at DESC);
CREATE INDEX idx_inventory_movements_reference ON inventory_movements(reference_id, reference_type);

-- Box templates
CREATE TABLE box_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    size VARCHAR(20) NOT NULL
        CHECK (size IN ('SMALL', 'MEDIUM', 'LARGE')),
    base_price_cents INTEGER NOT NULL 
        CHECK (base_price_cents >= 0),
    max_weight_kg DECIMAL(5,2) NOT NULL
        CHECK (max_weight_kg > 0),
    max_items INTEGER NOT NULL
        CHECK (max_items > 0),
    is_customizable BOOLEAN DEFAULT FALSE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    items JSONB NOT NULL DEFAULT '[]', -- [{produceId, defaultQty, maxQty}]
    image_url VARCHAR(500),
    -- Soft delete
    deleted_at TIMESTAMPTZ,
    -- Audit columns
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    -- Optimistic locking
    version INTEGER NOT NULL DEFAULT 1,
    
    -- Validate box size constraints
    CONSTRAINT valid_small_box CHECK (
        size != 'SMALL' OR (max_weight_kg = 5 AND max_items = 8 AND base_price_cents = 50000)
    ),
    CONSTRAINT valid_medium_box CHECK (
        size != 'MEDIUM' OR (max_weight_kg = 10 AND max_items = 15 AND base_price_cents = 90000)
    ),
    CONSTRAINT valid_large_box CHECK (
        size != 'LARGE' OR (max_weight_kg = 20 AND max_items = 25 AND base_price_cents = 150000)
    )
);

-- Trigger for updated_at
CREATE TRIGGER box_templates_updated_at
BEFORE UPDATE ON box_templates
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_box_templates_size ON box_templates(size) WHERE deleted_at IS NULL AND is_active = TRUE;
CREATE INDEX idx_box_templates_active ON box_templates(id) WHERE deleted_at IS NULL AND is_active = TRUE;

-- GIN index for box items JSONB
CREATE INDEX idx_box_templates_items ON box_templates USING GIN (items);

-- ============================================================================
-- 5. ORDERING CONTEXT
-- ============================================================================

-- Order status enum as CHECK constraint (more flexible than ENUM type)
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING'
        CHECK (status IN ('PENDING', 'CONFIRMED', 'ASSIGNED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED')),
    -- Price stored as integer cents
    total_price_cents INTEGER NOT NULL 
        CHECK (total_price_cents >= 0),
    delivery_date DATE NOT NULL,
    slot_type VARCHAR(20) NOT NULL
        CHECK (slot_type IN ('SAME_DAY', 'NEXT_DAY')),
    delivery_address_id UUID NOT NULL REFERENCES user_addresses(id),
    -- Denormalized address snapshot (for historical accuracy)
    delivery_address_snapshot JSONB,
    -- Box information
    box_template_id UUID REFERENCES box_templates(id),
    box_customizations JSONB, -- {produceId, quantity, linePriceCents}
    -- Status timestamps
    placed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    confirmed_at TIMESTAMPTZ,
    confirmed_by UUID REFERENCES users(id),
    out_for_delivery_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    -- Payment
    payment_status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
        CHECK (payment_status IN ('PENDING', 'PROCESSING', 'PAID', 'FAILED', 'REFUNDED')),
    payment_method VARCHAR(50),
    payment_reference VARCHAR(255),
    -- Soft delete (rare for orders, but useful for test data)
    deleted_at TIMESTAMPTZ,
    -- Audit columns
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    -- Optimistic locking
    version INTEGER NOT NULL DEFAULT 1,
    
    -- Validate status transitions at database level (partial)
    CONSTRAINT valid_cancelled CHECK (
        status != 'CANCELLED' OR (cancelled_at IS NOT NULL AND cancellation_reason IS NOT NULL)
    ),
    CONSTRAINT valid_confirmed CHECK (
        status NOT IN ('CONFIRMED', 'ASSIGNED', 'OUT_FOR_DELIVERY', 'DELIVERED') 
        OR confirmed_at IS NOT NULL
    )
);

-- Trigger for updated_at
CREATE TRIGGER orders_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger for version increment
CREATE TRIGGER orders_version
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION increment_version();

-- Comprehensive indexes for order queries
CREATE INDEX idx_orders_user ON orders(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_orders_user_status ON orders(user_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_orders_status ON orders(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_orders_delivery ON orders(delivery_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_orders_delivery_slot ON orders(delivery_date, slot_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_orders_placed ON orders(placed_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_orders_payment ON orders(payment_status) WHERE deleted_at IS NULL;

-- Partial indexes for common filtered queries
CREATE INDEX idx_orders_pending ON orders(id) WHERE status = 'PENDING' AND deleted_at IS NULL;
CREATE INDEX idx_orders_active ON orders(id) 
WHERE status IN ('PENDING', 'CONFIRMED', 'ASSIGNED', 'OUT_FOR_DELIVERY') AND deleted_at IS NULL;
CREATE INDEX idx_orders_today ON orders(id) 
WHERE delivery_date = CURRENT_DATE AND deleted_at IS NULL;

-- GIN indexes for JSONB
CREATE INDEX idx_orders_box_customizations ON orders USING GIN (box_customizations);
CREATE INDEX idx_orders_address_snapshot ON orders USING GIN (delivery_address_snapshot);

-- Order status history (audit trail)
CREATE TABLE order_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id),
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    changed_by UUID REFERENCES users(id),
    reason TEXT,
    metadata JSONB
);

CREATE INDEX idx_order_history_order ON order_status_history(order_id);
CREATE INDEX idx_order_history_changed ON order_status_history(changed_at DESC);

-- Order items detail (for complex orders)
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    produce_item_id UUID NOT NULL REFERENCES produce_items(id),
    quantity DECIMAL(10,2) NOT NULL 
        CHECK (quantity > 0),
    unit VARCHAR(20) NOT NULL
        CHECK (unit IN ('kg', 'pcs', 'bunches', 'g')),
    unit_price_cents INTEGER NOT NULL 
        CHECK (unit_price_cents >= 0),
    line_total_cents INTEGER NOT NULL 
        CHECK (line_total_cents >= 0),
    -- Snapshot of produce item at time of order
    produce_item_snapshot JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_produce ON order_items(produce_item_id);

-- ============================================================================
-- 6. SUBSCRIPTION CONTEXT
-- ============================================================================

CREATE TABLE subscription_frequencies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(20) NOT NULL UNIQUE
        CHECK (name IN ('WEEKLY', 'BIWEEKLY', 'MONTHLY')),
    display_name VARCHAR(50) NOT NULL,
    interval_days INTEGER NOT NULL
);

INSERT INTO subscription_frequencies (name, display_name, interval_days) VALUES
('WEEKLY', 'Weekly', 7),
('BIWEEKLY', 'Bi-weekly', 14),
('MONTHLY', 'Monthly', 30);

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    box_template_id UUID NOT NULL REFERENCES box_templates(id),
    frequency VARCHAR(20) NOT NULL
        CHECK (frequency IN ('WEEKLY', 'BIWEEKLY', 'MONTHLY')),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
        CHECK (status IN ('ACTIVE', 'PAUSED', 'CANCELLED')),
    next_delivery_date DATE NOT NULL,
    delivery_address_id UUID NOT NULL REFERENCES user_addresses(id),
    -- Customization preferences
    customizations JSONB DEFAULT '{}', -- User preferences for custom boxes
    -- Status timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    paused_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    -- Audit
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    -- Optimistic locking
    version INTEGER NOT NULL DEFAULT 1,
    
    -- Validate status timestamps
    CONSTRAINT valid_paused CHECK (
        status != 'PAUSED' OR paused_at IS NOT NULL
    ),
    CONSTRAINT valid_cancelled_sub CHECK (
        status != 'CANCELLED' OR (cancelled_at IS NOT NULL AND cancellation_reason IS NOT NULL)
    )
);

-- Trigger for updated_at
CREATE TRIGGER subscriptions_updated_at
BEFORE UPDATE ON subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger for version increment
CREATE TRIGGER subscriptions_version
BEFORE UPDATE ON subscriptions
FOR EACH ROW
EXECUTE FUNCTION increment_version();

-- Indexes
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id) WHERE status != 'CANCELLED';
CREATE INDEX idx_subscriptions_next ON subscriptions(next_delivery_date) WHERE status = 'ACTIVE';
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_user_status ON subscriptions(user_id, status);

-- Subscription delivery history
CREATE TABLE subscription_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id),
    order_id UUID REFERENCES orders(id),
    scheduled_date DATE NOT NULL,
    actual_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED'
        CHECK (status IN ('SCHEDULED', 'DELIVERED', 'SKIPPED', 'CANCELLED')),
    skip_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_subscription_deliveries_sub ON subscription_deliveries(subscription_id);
CREATE INDEX idx_subscription_deliveries_date ON subscription_deliveries(scheduled_date);
CREATE INDEX idx_subscription_deliveries_status ON subscription_deliveries(status);

-- ============================================================================
-- 7. DELIVERY CONTEXT
-- ============================================================================

CREATE TABLE delivery_zones (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
        CHECK (name IN ('KIBWEZI_CENTRAL', 'KIBWEZI_NORTH', 'NAIROBI_EAST', 'NAIROBI_WEST')),
    display_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    geometry GEOMETRY(POLYGON, 4326), -- Geographic boundaries
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Seed zones
INSERT INTO delivery_zones (name, display_name) VALUES
('KIBWEZI_CENTRAL', 'Kibwezi Central'),
('KIBWEZI_NORTH', 'Kibwezi North'),
('NAIROBI_EAST', 'Nairobi East'),
('NAIROBI_WEST', 'Nairobi West');

-- Trigger for updated_at
CREATE TRIGGER delivery_zones_updated_at
BEFORE UPDATE ON delivery_zones
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE riders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(255),
    zone_id INTEGER NOT NULL REFERENCES delivery_zones(id),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    -- Location tracking
    current_location POINT,
    current_location_at TIMESTAMPTZ,
    -- Work schedule
    work_schedule JSONB, -- {monday: {start: '08:00', end: '18:00'}, ...}
    -- Vehicle info
    vehicle_type VARCHAR(50),
    vehicle_plate VARCHAR(50),
    -- Soft delete
    deleted_at TIMESTAMPTZ,
    -- Audit columns
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    -- Optimistic locking
    version INTEGER NOT NULL DEFAULT 1
);

-- Trigger for updated_at
CREATE TRIGGER riders_updated_at
BEFORE UPDATE ON riders
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger for version increment
CREATE TRIGGER riders_version
BEFORE UPDATE ON riders
FOR EACH ROW
EXECUTE FUNCTION increment_version();

-- Indexes
CREATE INDEX idx_riders_zone ON riders(zone_id) WHERE is_active = TRUE AND deleted_at IS NULL;
CREATE INDEX idx_riders_active ON riders(id) WHERE is_active = TRUE AND deleted_at IS NULL;
CREATE INDEX idx_riders_location ON riders USING GIST (current_location) 
WHERE current_location IS NOT NULL;

-- Rider availability
CREATE TABLE rider_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rider_id UUID NOT NULL REFERENCES riders(id),
    date DATE NOT NULL,
    is_available BOOLEAN DEFAULT TRUE NOT NULL,
    max_orders INTEGER NOT NULL DEFAULT 20,
    assigned_orders INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    UNIQUE(rider_id, date)
);

-- Trigger for updated_at
CREATE TRIGGER rider_availability_updated_at
BEFORE UPDATE ON rider_availability
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_rider_availability_rider ON rider_availability(rider_id);
CREATE INDEX idx_rider_availability_date ON rider_availability(date);
CREATE INDEX idx_rider_availability_available ON rider_availability(rider_id, date) 
WHERE is_available = TRUE AND assigned_orders < max_orders;

CREATE TABLE delivery_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL UNIQUE REFERENCES orders(id),
    rider_id UUID REFERENCES riders(id),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING'
        CHECK (status IN ('PENDING', 'ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'FAILED')),
    -- Assignment details
    assigned_at TIMESTAMPTZ,
    assigned_by UUID REFERENCES users(id),
    -- Pickup
    picked_up_at TIMESTAMPTZ,
    pickup_location JSONB, -- {name, coordinates, address}
    -- Delivery
    delivered_at TIMESTAMPTZ,
    delivery_proof JSONB, -- {photoUrl, signature, notes, gpsCoordinates}
    delivery_rating INTEGER CHECK (delivery_rating BETWEEN 1 AND 5),
    delivery_feedback TEXT,
    -- Failure
    failed_at TIMESTAMPTZ,
    failure_reason TEXT,
    retry_count INTEGER NOT NULL DEFAULT 0,
    -- Estimated times
    estimated_pickup_at TIMESTAMPTZ,
    estimated_delivery_at TIMESTAMPTZ,
    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    -- Optimistic locking
    version INTEGER NOT NULL DEFAULT 1,
    
    -- Validate status transitions
    CONSTRAINT valid_assigned CHECK (
        status NOT IN ('ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED') 
        OR assigned_at IS NOT NULL
    ),
    CONSTRAINT valid_delivered CHECK (
        status != 'DELIVERED' OR delivered_at IS NOT NULL
    ),
    CONSTRAINT valid_failed CHECK (
        status != 'FAILED' OR (failed_at IS NOT NULL AND failure_reason IS NOT NULL)
    )
);

-- Trigger for updated_at
CREATE TRIGGER delivery_assignments_updated_at
BEFORE UPDATE ON delivery_assignments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger for version increment
CREATE TRIGGER delivery_assignments_version
BEFORE UPDATE ON delivery_assignments
FOR EACH ROW
EXECUTE FUNCTION increment_version();

-- Indexes
CREATE INDEX idx_assignments_rider ON delivery_assignments(rider_id);
CREATE INDEX idx_assignments_status ON delivery_assignments(status);
CREATE INDEX idx_assignments_order ON delivery_assignments(order_id);
CREATE INDEX idx_assignments_rider_status ON delivery_assignments(rider_id, status);
CREATE INDEX idx_assignments_delivered ON delivery_assignments(delivered_at DESC) 
WHERE status = 'DELIVERED';

-- Partial indexes for common queries
CREATE INDEX idx_assignments_pending ON delivery_assignments(id) WHERE status = 'PENDING';
CREATE INDEX idx_assignments_active ON delivery_assignments(id) 
WHERE status IN ('ASSIGNED', 'PICKED_UP', 'IN_TRANSIT');

-- GIN indexes for JSONB
CREATE INDEX idx_assignments_pickup ON delivery_assignments USING GIN (pickup_location);
CREATE INDEX idx_assignments_proof ON delivery_assignments USING GIN (delivery_proof);

-- ============================================================================
-- 8. AUDIT & LOGGING
-- ============================================================================

-- Comprehensive audit log for all table changes
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL
        CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_data JSONB,
    new_data JSONB,
    changed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    changed_by UUID REFERENCES users(id),
    session_id VARCHAR(255),
    ip_address INET,
    user_agent TEXT
);

-- Partition by month
CREATE TABLE audit_log_partitioned (
    LIKE audit_log INCLUDING ALL
) PARTITION BY RANGE (changed_at);

-- Create monthly partitions
DO $$
DECLARE
    partition_date DATE;
    partition_name TEXT;
    start_date DATE;
    end_date DATE;
BEGIN
    FOR i IN -12..3 LOOP
        partition_date := DATE_TRUNC('month', CURRENT_DATE + (i || ' months')::INTERVAL);
        partition_name := 'audit_log_' || TO_CHAR(partition_date, 'YYYY_MM');
        start_date := partition_date;
        end_date := partition_date + INTERVAL '1 month';
        
        EXECUTE format(
            'CREATE TABLE IF NOT EXISTS %I PARTITION OF audit_log_partitioned
             FOR VALUES FROM (%L) TO (%L)',
            partition_name, start_date, end_date
        );
    END LOOP;
END $$;

CREATE INDEX idx_audit_table_record ON audit_log(table_name, record_id);
CREATE INDEX idx_audit_changed_at ON audit_log(changed_at DESC);
CREATE INDEX idx_audit_action ON audit_log(action);
CREATE INDEX idx_audit_user ON audit_log(changed_by);

-- ============================================================================
-- 9. ARCHIVING & CLEANUP
-- ============================================================================

-- Archive old orders (moved here after 1 year)
CREATE TABLE orders_archive (
    LIKE orders INCLUDING ALL,
    archived_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    archive_reason VARCHAR(50) DEFAULT 'AGE'
);

CREATE INDEX idx_orders_archive_user ON orders_archive(user_id);
CREATE INDEX idx_orders_archive_archived ON orders_archive(archived_at);

-- Archive old events
CREATE TABLE domain_events_archive (
    LIKE domain_events INCLUDING ALL,
    archived_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- GIN index for archived events
CREATE INDEX idx_events_archive_payload ON domain_events_archive USING GIN (payload jsonb_path_ops);

-- ============================================================================
-- 10. VIEWS & MATERIALIZED VIEWS
-- ============================================================================

-- Active orders view
CREATE VIEW v_active_orders AS
SELECT 
    o.*,
    u.email as user_email,
    u.phone as user_phone,
    ua.label as delivery_label,
    ua.zone as delivery_zone
FROM orders o
JOIN users u ON o.user_id = u.id
JOIN user_addresses ua ON o.delivery_address_id = ua.id
WHERE o.deleted_at IS NULL 
AND o.status IN ('PENDING', 'CONFIRMED', 'ASSIGNED', 'OUT_FOR_DELIVERY');

-- Orders by date materialized view (for analytics)
CREATE MATERIALIZED VIEW mv_orders_by_date AS
SELECT 
    delivery_date,
    slot_type,
    status,
    COUNT(*) as order_count,
    SUM(total_price_cents) as total_revenue_cents,
    AVG(total_price_cents) as avg_order_value_cents
FROM orders
WHERE deleted_at IS NULL
GROUP BY delivery_date, slot_type, status;

CREATE UNIQUE INDEX idx_mv_orders_by_date ON mv_orders_by_date(delivery_date, slot_type, status);

-- Refresh this daily or hourly with:
-- REFRESH MATERIALIZED VIEW CONCURRENTLY mv_orders_by_date;

-- Low stock items view
CREATE VIEW v_low_stock_items AS
SELECT 
    pi.*,
    pc.display_name as category_name,
    (pi.available_quantity / NULLIF(pi.reorder_threshold, 0)) as stock_ratio
FROM produce_items pi
JOIN produce_categories pc ON pi.category_id = pc.id
WHERE pi.is_active = TRUE 
AND pi.deleted_at IS NULL
AND pi.reorder_threshold > 0
AND pi.available_quantity <= pi.reorder_threshold;

-- ============================================================================
-- 11. FUNCTIONS & STORED PROCEDURES
-- ============================================================================

-- Function to check if order can be cancelled
CREATE OR REPLACE FUNCTION can_cancel_order(p_order_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_status VARCHAR(50);
    v_delivery_date DATE;
BEGIN
    SELECT status, delivery_date 
    INTO v_status, v_delivery_date
    FROM orders 
    WHERE id = p_order_id AND deleted_at IS NULL;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Can cancel if status allows and delivery is in future
    RETURN v_status IN ('PENDING', 'CONFIRMED') 
           AND v_delivery_date >= CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate next delivery date for subscription
CREATE OR REPLACE FUNCTION calculate_next_delivery(
    p_current_date DATE,
    p_frequency VARCHAR(20)
)
RETURNS DATE AS $$
DECLARE
    v_interval_days INTEGER;
BEGIN
    SELECT interval_days INTO v_interval_days
    FROM subscription_frequencies
    WHERE name = p_frequency;
    
    RETURN p_current_date + v_interval_days;
END;
$$ LANGUAGE plpgsql;

-- Function to archive old orders
CREATE OR REPLACE FUNCTION archive_old_orders(p_days_old INTEGER DEFAULT 365)
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    -- Move orders older than p_days_old to archive
    WITH archived AS (
        DELETE FROM orders
        WHERE deleted_at IS NULL
        AND delivered_at IS NOT NULL
        AND delivered_at < CURRENT_DATE - p_days_old
        RETURNING *
    )
    INSERT INTO orders_archive
    SELECT *, NOW(), 'AGE' FROM archived;
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 12. SEED DATA
-- ============================================================================

-- Sample box templates (following business rules)
INSERT INTO box_templates (id, name, description, size, base_price_cents, max_weight_kg, max_items, items) VALUES
(
    '11111111-1111-1111-1111-111111111111',
    'Small Box',
    'Perfect for individuals or couples. Includes 5-8 items.',
    'SMALL',
    50000,
    5.00,
    8,
    '[
        {"produceId": "tomato", "defaultQty": 1, "maxQty": 3},
        {"produceId": "onion", "defaultQty": 1, "maxQty": 3},
        {"produceId": "spinach", "defaultQty": 1, "maxQty": 2}
    ]'::jsonb
),
(
    '22222222-2222-2222-2222-222222222222',
    'Medium Box',
    'Great for small families. Includes 10-15 items.',
    'MEDIUM',
    90000,
    10.00,
    15,
    '[
        {"produceId": "tomato", "defaultQty": 2, "maxQty": 5},
        {"produceId": "onion", "defaultQty": 2, "maxQty": 5},
        {"produceId": "spinach", "defaultQty": 2, "maxQty": 4},
        {"produceId": "carrot", "defaultQty": 1, "maxQty": 3}
    ]'::jsonb
),
(
    '33333333-3333-3333-3333-333333333333',
    'Large Box',
    'Ideal for large families. Includes 18-25 items.',
    'LARGE',
    150000,
    20.00,
    25,
    '[
        {"produceId": "tomato", "defaultQty": 3, "maxQty": 8},
        {"produceId": "onion", "defaultQty": 3, "maxQty": 8},
        {"produceId": "spinach", "defaultQty": 3, "maxQty": 6},
        {"produceId": "carrot", "defaultQty": 2, "maxQty": 5},
        {"produceId": "cabbage", "defaultQty": 1, "maxQty": 3}
    ]'::jsonb
);

-- ============================================================================
-- 13. FINAL OPTIMIZATIONS
-- ============================================================================

-- Vacuum analyze for statistics
ANALYZE;

-- Comment summary
COMMENT ON TABLE domain_events IS 'Event store for DDD event sourcing. Partitioned by month for performance.';
COMMENT ON TABLE orders IS 'Order aggregate root with full audit trail and optimistic locking.';
COMMENT ON TABLE produce_items IS 'Inventory items with stock tracking and seasonal support.';
COMMENT ON TABLE delivery_assignments IS 'Rider assignments with status workflow and delivery proof.';
COMMENT ON TABLE subscriptions IS 'Recurring delivery subscriptions with flexible frequency.';
