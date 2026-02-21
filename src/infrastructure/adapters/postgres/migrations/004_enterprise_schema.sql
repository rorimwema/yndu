-- ============================================================================
-- YNDU ENTERPRISE SCHEMA EXPANSION (PHASE 0 + ENTERPRISE V1)
--
-- Purpose:
-- 1) Stabilize the baseline schema for the current app runtime.
-- 2) Add enterprise capabilities for RBAC, B2B, procurement, and route logistics.
--
-- Expected baseline: 001_initial_schema.sql
-- ============================================================================

-- Shared trigger helper
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 1. ENUMS
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM (
      'SUPER_ADMIN',
      'ADMIN',
      'B2C_CUSTOMER',
      'B2B_PARTNER',
      'RIDER'
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'membership_role') THEN
    CREATE TYPE membership_role AS ENUM (
      'OWNER',
      'BILLING_ADMIN',
      'OPERATIONS',
      'PROCUREMENT',
      'VIEWER'
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'purchase_order_status') THEN
    CREATE TYPE purchase_order_status AS ENUM (
      'DRAFT',
      'SUBMITTED',
      'PARTIALLY_RECEIVED',
      'RECEIVED',
      'CANCELLED'
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'invoice_status') THEN
    CREATE TYPE invoice_status AS ENUM (
      'DRAFT',
      'ISSUED',
      'PARTIALLY_PAID',
      'PAID',
      'OVERDUE',
      'VOID'
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vehicle_status') THEN
    CREATE TYPE vehicle_status AS ENUM ('ACTIVE', 'MAINTENANCE', 'INACTIVE');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'route_shift') THEN
    CREATE TYPE route_shift AS ENUM ('MORNING', 'AFTERNOON', 'EVENING');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'route_status') THEN
    CREATE TYPE route_status AS ENUM (
      'PLANNED',
      'DISPATCHED',
      'IN_PROGRESS',
      'COMPLETED',
      'CANCELLED'
    );
  END IF;
END $$;

-- ============================================================================
-- 2. USER + RBAC STABILIZATION
-- ============================================================================

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS password_hash TEXT,
  ADD COLUMN IF NOT EXISTS refresh_token TEXT,
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS addresses JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS role user_role NOT NULL DEFAULT 'B2C_CUSTOMER';

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_refresh_token
  ON users(refresh_token)
  WHERE refresh_token IS NOT NULL;

CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  org_type VARCHAR(30) NOT NULL CHECK (org_type IN ('B2B_PARTNER', 'INTERNAL', 'LOGISTICS_PARTNER')),
  legal_name VARCHAR(255),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS organization_memberships (
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role membership_role NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (organization_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_org_memberships_user
  ON organization_memberships(user_id);

-- B2B profile attached to a user account
CREATE TABLE IF NOT EXISTS b2b_company_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  company_name VARCHAR(255) NOT NULL,
  tax_id VARCHAR(100),
  industry VARCHAR(120),
  credit_limit_cents INTEGER NOT NULL DEFAULT 0 CHECK (credit_limit_cents >= 0),
  payment_terms_days INTEGER NOT NULL DEFAULT 30 CHECK (payment_terms_days >= 0),
  billing_email VARCHAR(255),
  billing_phone VARCHAR(30),
  billing_address JSONB,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_b2b_profiles_company_name
  ON b2b_company_profiles(company_name);

CREATE TABLE IF NOT EXISTS rider_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  legacy_rider_id UUID UNIQUE REFERENCES riders(id) ON DELETE SET NULL,
  license_number VARCHAR(100),
  national_id VARCHAR(100),
  employment_type VARCHAR(20) NOT NULL DEFAULT 'CONTRACTOR'
    CHECK (employment_type IN ('EMPLOYEE', 'CONTRACTOR')),
  rider_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
    CHECK (rider_status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
  joined_at DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rider_profiles_status
  ON rider_profiles(rider_status);

-- ============================================================================
-- 3. PROCUREMENT + TRACEABILITY
-- ============================================================================

CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  farm_name VARCHAR(255),
  supplier_type VARCHAR(30) NOT NULL DEFAULT 'FARM'
    CHECK (supplier_type IN ('FARM', 'AGGREGATOR', 'WHOLESALER')),
  contact_name VARCHAR(255),
  phone VARCHAR(30),
  email VARCHAR(255),
  tax_id VARCHAR(100),
  location_text VARCHAR(255),
  rating NUMERIC(3,2) CHECK (rating IS NULL OR (rating >= 0 AND rating <= 5)),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name);
CREATE INDEX IF NOT EXISTS idx_suppliers_farm_name ON suppliers(farm_name);

CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_number VARCHAR(64) NOT NULL UNIQUE,
  supplier_id UUID NOT NULL REFERENCES suppliers(id),
  status purchase_order_status NOT NULL DEFAULT 'DRAFT',
  ordered_by UUID REFERENCES users(id),
  ordered_at TIMESTAMPTZ,
  expected_delivery_date DATE,
  received_at TIMESTAMPTZ,
  subtotal_cents INTEGER NOT NULL DEFAULT 0 CHECK (subtotal_cents >= 0),
  tax_cents INTEGER NOT NULL DEFAULT 0 CHECK (tax_cents >= 0),
  total_cents INTEGER NOT NULL DEFAULT 0 CHECK (total_cents >= 0),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier
  ON purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status
  ON purchase_orders(status);

CREATE TABLE IF NOT EXISTS purchase_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  produce_item_id UUID REFERENCES produce_items(id),
  item_name_snapshot VARCHAR(255) NOT NULL,
  quantity DECIMAL(10,2) NOT NULL CHECK (quantity > 0),
  unit VARCHAR(20) NOT NULL,
  unit_cost_cents INTEGER NOT NULL CHECK (unit_cost_cents >= 0),
  line_total_cents INTEGER NOT NULL CHECK (line_total_cents >= 0),
  batch_number VARCHAR(64),
  farm_name VARCHAR(255),
  expires_on DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_purchase_order_items_po
  ON purchase_order_items(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_produce
  ON purchase_order_items(produce_item_id);
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_batch
  ON purchase_order_items(batch_number);

CREATE TABLE IF NOT EXISTS inventory_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produce_item_id UUID NOT NULL REFERENCES produce_items(id),
  movement_type VARCHAR(20) NOT NULL
    CHECK (movement_type IN ('IN', 'OUT', 'ADJUSTMENT', 'RETURN')),
  quantity DECIMAL(10,2) NOT NULL,
  previous_quantity DECIMAL(10,2) NOT NULL,
  new_quantity DECIMAL(10,2) NOT NULL,
  reason VARCHAR(255) NOT NULL,
  reference_id UUID,
  reference_type VARCHAR(50),
  batch_number VARCHAR(64),
  supplier_id UUID REFERENCES suppliers(id),
  purchase_order_id UUID REFERENCES purchase_orders(id),
  purchased_unit_cost_cents INTEGER CHECK (purchased_unit_cost_cents IS NULL OR purchased_unit_cost_cents >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

ALTER TABLE inventory_movements
  ADD COLUMN IF NOT EXISTS batch_number VARCHAR(64),
  ADD COLUMN IF NOT EXISTS supplier_id UUID REFERENCES suppliers(id),
  ADD COLUMN IF NOT EXISTS purchase_order_id UUID REFERENCES purchase_orders(id),
  ADD COLUMN IF NOT EXISTS purchased_unit_cost_cents INTEGER
    CHECK (purchased_unit_cost_cents IS NULL OR purchased_unit_cost_cents >= 0);

CREATE INDEX IF NOT EXISTS idx_inventory_movements_item
  ON inventory_movements(produce_item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_batch
  ON inventory_movements(batch_number);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_supplier
  ON inventory_movements(supplier_id);

-- ============================================================================
-- 4. B2B PRICING + INVOICING
-- ============================================================================

ALTER TABLE produce_items
  ADD COLUMN IF NOT EXISTS b2b_unit_price_cents INTEGER
    CHECK (b2b_unit_price_cents IS NULL OR b2b_unit_price_cents >= 0);

CREATE TABLE IF NOT EXISTS produce_price_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produce_item_id UUID NOT NULL REFERENCES produce_items(id) ON DELETE CASCADE,
  customer_type VARCHAR(8) NOT NULL CHECK (customer_type IN ('B2C', 'B2B')),
  min_quantity DECIMAL(10,2) NOT NULL CHECK (min_quantity > 0),
  max_quantity DECIMAL(10,2),
  unit_price_cents INTEGER NOT NULL CHECK (unit_price_cents >= 0),
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_to DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (max_quantity IS NULL OR max_quantity >= min_quantity),
  CHECK (effective_to IS NULL OR effective_to >= effective_from)
);

CREATE INDEX IF NOT EXISTS idx_price_tiers_produce
  ON produce_price_tiers(produce_item_id);
CREATE INDEX IF NOT EXISTS idx_price_tiers_customer
  ON produce_price_tiers(customer_type);

CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number VARCHAR(64) NOT NULL UNIQUE,
  b2b_company_profile_id UUID NOT NULL REFERENCES b2b_company_profiles(id),
  status invoice_status NOT NULL DEFAULT 'DRAFT',
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  subtotal_cents INTEGER NOT NULL DEFAULT 0 CHECK (subtotal_cents >= 0),
  tax_cents INTEGER NOT NULL DEFAULT 0 CHECK (tax_cents >= 0),
  total_cents INTEGER NOT NULL DEFAULT 0 CHECK (total_cents >= 0),
  paid_cents INTEGER NOT NULL DEFAULT 0 CHECK (paid_cents >= 0),
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (due_date >= issue_date),
  CHECK (paid_cents <= total_cents)
);

CREATE INDEX IF NOT EXISTS idx_invoices_company
  ON invoices(b2b_company_profile_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status
  ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date
  ON invoices(due_date);

CREATE TABLE IF NOT EXISTS invoice_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  description VARCHAR(255) NOT NULL,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price_cents INTEGER NOT NULL CHECK (unit_price_cents >= 0),
  line_total_cents INTEGER NOT NULL CHECK (line_total_cents >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoice_line_items_invoice
  ON invoice_line_items(invoice_id);

CREATE TABLE IF NOT EXISTS invoice_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  payment_method VARCHAR(50),
  payment_reference VARCHAR(255),
  paid_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  received_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoice_payments_invoice
  ON invoice_payments(invoice_id);

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS customer_type VARCHAR(8) NOT NULL DEFAULT 'B2C'
    CHECK (customer_type IN ('B2C', 'B2B')),
  ADD COLUMN IF NOT EXISTS b2b_company_profile_id UUID REFERENCES b2b_company_profiles(id),
  ADD COLUMN IF NOT EXISTS invoice_id UUID,
  ADD COLUMN IF NOT EXISTS subscription_id UUID REFERENCES subscriptions(id),
  ADD COLUMN IF NOT EXISTS is_from_subscription BOOLEAN NOT NULL DEFAULT FALSE;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_orders_invoice'
  ) THEN
    ALTER TABLE orders
      ADD CONSTRAINT fk_orders_invoice
      FOREIGN KEY (invoice_id)
      REFERENCES invoices(id)
      ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_orders_customer_type
  ON orders(customer_type);
CREATE INDEX IF NOT EXISTS idx_orders_b2b_profile
  ON orders(b2b_company_profile_id);
CREATE INDEX IF NOT EXISTS idx_orders_invoice
  ON orders(invoice_id);
CREATE INDEX IF NOT EXISTS idx_orders_subscription
  ON orders(subscription_id);

-- ============================================================================
-- 5. SUBSCRIPTION SHAPE (RUNTIME-COMPAT + BILLING)
-- ============================================================================

ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS plan_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS plan_description TEXT,
  ADD COLUMN IF NOT EXISTS plan_price_cents INTEGER CHECK (plan_price_cents >= 0),
  ADD COLUMN IF NOT EXISTS delivery_slot_date DATE,
  ADD COLUMN IF NOT EXISTS delivery_slot_type VARCHAR(20)
    CHECK (delivery_slot_type IN ('SAME_DAY', 'NEXT_DAY')),
  ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS current_period_start DATE,
  ADD COLUMN IF NOT EXISTS current_period_end DATE,
  ADD COLUMN IF NOT EXISTS next_billing_date DATE,
  ADD COLUMN IF NOT EXISTS pause_history JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS billing_cycle VARCHAR(20)
    CHECK (billing_cycle IN ('WEEKLY', 'BIWEEKLY', 'MONTHLY'));

UPDATE subscriptions
SET
  plan_name = COALESCE(plan_name, 'Standard Box'),
  plan_description = COALESCE(plan_description, 'Weekly produce delivery'),
  plan_price_cents = COALESCE(plan_price_cents, 5000),
  delivery_slot_date = COALESCE(delivery_slot_date, next_delivery_date),
  delivery_slot_type = COALESCE(delivery_slot_type, 'NEXT_DAY'),
  items = COALESCE(items, '[]'::jsonb),
  current_period_start = COALESCE(current_period_start, created_at::DATE),
  current_period_end = COALESCE(current_period_end, next_delivery_date),
  next_billing_date = COALESCE(next_billing_date, next_delivery_date),
  pause_history = COALESCE(pause_history, '[]'::jsonb),
  billing_cycle = COALESCE(billing_cycle, frequency);

ALTER TABLE subscriptions
  ALTER COLUMN plan_name SET NOT NULL,
  ALTER COLUMN plan_price_cents SET NOT NULL,
  ALTER COLUMN billing_cycle SET NOT NULL;

CREATE TABLE IF NOT EXISTS subscription_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  scheduled_date DATE NOT NULL,
  actual_date DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED'
    CHECK (status IN ('SCHEDULED', 'DELIVERED', 'SKIPPED', 'CANCELLED')),
  skip_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscription_deliveries_sub
  ON subscription_deliveries(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_deliveries_status
  ON subscription_deliveries(status);

-- ============================================================================
-- 6. FLEET + ROUTE LOGISTICS
-- ============================================================================

CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_number VARCHAR(50) NOT NULL UNIQUE,
  vehicle_type VARCHAR(30) NOT NULL DEFAULT 'MOTORBIKE'
    CHECK (vehicle_type IN ('MOTORBIKE', 'VAN', 'TRUCK', 'BICYCLE')),
  capacity_kg DECIMAL(10,2) NOT NULL CHECK (capacity_kg > 0),
  refrigerated BOOLEAN NOT NULL DEFAULT FALSE,
  status vehicle_status NOT NULL DEFAULT 'ACTIVE',
  owner_user_id UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);

CREATE TABLE IF NOT EXISTS delivery_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_code VARCHAR(64) NOT NULL UNIQUE,
  route_date DATE NOT NULL,
  shift route_shift NOT NULL,
  status route_status NOT NULL DEFAULT 'PLANNED',
  rider_profile_id UUID REFERENCES rider_profiles(id),
  rider_user_id UUID REFERENCES users(id),
  vehicle_id UUID REFERENCES vehicles(id),
  dispatch_by UUID REFERENCES users(id),
  planned_start_at TIMESTAMPTZ,
  planned_end_at TIMESTAMPTZ,
  actual_start_at TIMESTAMPTZ,
  actual_end_at TIMESTAMPTZ,
  total_stops INTEGER NOT NULL DEFAULT 0,
  total_distance_km DECIMAL(10,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_delivery_routes_date_shift
  ON delivery_routes(route_date, shift);
CREATE INDEX IF NOT EXISTS idx_delivery_routes_status
  ON delivery_routes(status);
CREATE INDEX IF NOT EXISTS idx_delivery_routes_vehicle
  ON delivery_routes(vehicle_id);

CREATE TABLE IF NOT EXISTS delivery_route_stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID NOT NULL REFERENCES delivery_routes(id) ON DELETE CASCADE,
  assignment_id UUID UNIQUE REFERENCES delivery_assignments(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  stop_sequence INTEGER NOT NULL CHECK (stop_sequence > 0),
  stop_type VARCHAR(20) NOT NULL CHECK (stop_type IN ('PICKUP', 'DROPOFF')),
  planned_eta TIMESTAMPTZ,
  actual_arrival TIMESTAMPTZ,
  actual_departure TIMESTAMPTZ,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING', 'ARRIVED', 'COMPLETED', 'SKIPPED', 'FAILED')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(route_id, stop_sequence)
);

CREATE INDEX IF NOT EXISTS idx_route_stops_route
  ON delivery_route_stops(route_id);
CREATE INDEX IF NOT EXISTS idx_route_stops_order
  ON delivery_route_stops(order_id);

ALTER TABLE delivery_assignments
  ADD COLUMN IF NOT EXISTS route_id UUID,
  ADD COLUMN IF NOT EXISTS stop_sequence INTEGER,
  ADD COLUMN IF NOT EXISTS vehicle_id UUID;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_delivery_assignments_route'
  ) THEN
    ALTER TABLE delivery_assignments
      ADD CONSTRAINT fk_delivery_assignments_route
      FOREIGN KEY (route_id)
      REFERENCES delivery_routes(id)
      ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_delivery_assignments_vehicle'
  ) THEN
    ALTER TABLE delivery_assignments
      ADD CONSTRAINT fk_delivery_assignments_vehicle
      FOREIGN KEY (vehicle_id)
      REFERENCES vehicles(id)
      ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_delivery_assignments_route
  ON delivery_assignments(route_id);
CREATE INDEX IF NOT EXISTS idx_delivery_assignments_vehicle
  ON delivery_assignments(vehicle_id);

-- ============================================================================
-- 7. AUDIT TIMESTAMPS FOR NEW TABLES
-- ============================================================================

DROP TRIGGER IF EXISTS organizations_updated_at ON organizations;
CREATE TRIGGER organizations_updated_at
BEFORE UPDATE ON organizations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS b2b_company_profiles_updated_at ON b2b_company_profiles;
CREATE TRIGGER b2b_company_profiles_updated_at
BEFORE UPDATE ON b2b_company_profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS rider_profiles_updated_at ON rider_profiles;
CREATE TRIGGER rider_profiles_updated_at
BEFORE UPDATE ON rider_profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS suppliers_updated_at ON suppliers;
CREATE TRIGGER suppliers_updated_at
BEFORE UPDATE ON suppliers
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS purchase_orders_updated_at ON purchase_orders;
CREATE TRIGGER purchase_orders_updated_at
BEFORE UPDATE ON purchase_orders
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS invoices_updated_at ON invoices;
CREATE TRIGGER invoices_updated_at
BEFORE UPDATE ON invoices
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS vehicles_updated_at ON vehicles;
CREATE TRIGGER vehicles_updated_at
BEFORE UPDATE ON vehicles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS delivery_routes_updated_at ON delivery_routes;
CREATE TRIGGER delivery_routes_updated_at
BEFORE UPDATE ON delivery_routes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 8. TRACEABILITY VIEW
-- ============================================================================

CREATE OR REPLACE VIEW v_inventory_batch_traceability AS
SELECT
  im.id AS movement_id,
  im.batch_number,
  im.movement_type,
  im.quantity,
  im.reason,
  im.created_at,
  pi.id AS produce_item_id,
  pi.name AS produce_name,
  s.id AS supplier_id,
  s.name AS supplier_name,
  s.farm_name,
  po.po_number
FROM inventory_movements im
JOIN produce_items pi ON pi.id = im.produce_item_id
LEFT JOIN suppliers s ON s.id = im.supplier_id
LEFT JOIN purchase_orders po ON po.id = im.purchase_order_id;

COMMENT ON VIEW v_inventory_batch_traceability IS
  'Batch-to-supplier traceability for produce movement and recalls.';
