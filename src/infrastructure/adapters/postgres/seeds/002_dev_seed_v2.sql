-- ============================================================================
-- DEV SEED (Enterprise schema compatible)
-- ============================================================================

-- Users
INSERT INTO users (id, email, phone, name, role, email_verified, phone_verified, profile, addresses, password_hash)
VALUES
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'superadmin@yndu.local',
    '+254700000001',
    'Yndu Super Admin',
    'SUPER_ADMIN',
    TRUE,
    TRUE,
    '{"preferredLanguage":"en"}'::jsonb,
    '[]'::jsonb,
    '$2a$10$y3D/mLIg2p72smMMTdb.Muult4ckBYkmguAOEsFJZMIalbi8VPeSi'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'customer@yndu.local',
    '+254700000002',
    'Retail Customer',
    'B2C_CUSTOMER',
    TRUE,
    TRUE,
    '{"preferredLanguage":"en"}'::jsonb,
    '[{"id":"11111111-1111-1111-1111-111111111111","label":"Home","street":"Kibwezi Town"}]'::jsonb,
    '$2a$10$y3D/mLIg2p72smMMTdb.Muult4ckBYkmguAOEsFJZMIalbi8VPeSi'
  ),
  (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'partner@yndu.local',
    '+254700000003',
    'B2B Partner User',
    'B2B_PARTNER',
    TRUE,
    TRUE,
    '{"preferredLanguage":"en"}'::jsonb,
    '[{"id":"22222222-2222-2222-2222-222222222222","label":"Office","street":"Mlolongo"}]'::jsonb,
    '$2a$10$y3D/mLIg2p72smMMTdb.Muult4ckBYkmguAOEsFJZMIalbi8VPeSi'
  ),
  (
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'rider@yndu.local',
    '+254700000004',
    'Primary Rider',
    'RIDER',
    TRUE,
    TRUE,
    '{"preferredLanguage":"en"}'::jsonb,
    '[]'::jsonb,
    '$2a$10$y3D/mLIg2p72smMMTdb.Muult4ckBYkmguAOEsFJZMIalbi8VPeSi'
  )
ON CONFLICT (email) DO NOTHING;

-- Set password hashes for all seed users (works for both new and existing databases)
-- Password for all test users is: admin123
UPDATE users SET password_hash = '$2a$10$y3D/mLIg2p72smMMTdb.Muult4ckBYkmguAOEsFJZMIalbi8VPeSi'
WHERE email IN ('superadmin@yndu.local', 'customer@yndu.local', 'partner@yndu.local', 'rider@yndu.local');

-- Normalized addresses
INSERT INTO user_addresses (id, user_id, label, coordinates, zone, is_default, created_at)
VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'Home',
    POINT(-2.4167, 37.9667),
    'KIBWEZI_CENTRAL',
    TRUE,
    NOW()
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'Office',
    POINT(-1.3833, 36.9500),
    'NAIROBI_EAST',
    TRUE,
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- B2B profile
INSERT INTO b2b_company_profiles (
  id,
  owner_user_id,
  company_name,
  tax_id,
  industry,
  credit_limit_cents,
  payment_terms_days,
  billing_email,
  billing_phone
)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'Mlolongo Retail Ltd',
  'P051234567X',
  'Retail & Distribution',
  5000000,
  30,
  'accounts@mlolongo.local',
  '+254711000001'
)
ON CONFLICT (owner_user_id) DO NOTHING;

-- Box templates
INSERT INTO box_templates (id, name, description, size, base_price_cents, max_weight_kg, is_customizable, is_active, items)
VALUES (
  '44444444-4444-4444-4444-444444444444',
  'Standard Medium Box',
  'Core weekly produce box',
  'MEDIUM',
  90000,
  10.0,
  TRUE,
  TRUE,
  '[]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- Produce inventory
INSERT INTO produce_items (
  id,
  name,
  name_sw,
  category,
  unit_price_cents,
  b2b_unit_price_cents,
  available_quantity,
  unit,
  reorder_threshold,
  is_seasonal,
  is_active
)
VALUES
  (
    '55555555-5555-5555-5555-555555555555',
    'Tomatoes',
    'Nyanya',
    'ROOT_VEGETABLES',
    5000,
    4200,
    150.00,
    'kg',
    25.00,
    FALSE,
    TRUE
  ),
  (
    '66666666-6666-6666-6666-666666666666',
    'Onions',
    'Kitunguu',
    'ROOT_VEGETABLES',
    3000,
    2500,
    120.00,
    'kg',
    20.00,
    FALSE,
    TRUE
  ),
  (
    '77777777-7777-7777-7777-777777777777',
    'Spinach',
    'Mchicha',
    'LEAFY_GREENS',
    4000,
    3400,
    80.00,
    'bunches',
    15.00,
    FALSE,
    TRUE
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO suppliers (
  id,
  name,
  farm_name,
  supplier_type,
  contact_name,
  phone,
  email,
  location_text,
  rating
)
VALUES
  (
    '88888888-8888-8888-8888-888888888888',
    'Kibwezi Growers Cooperative',
    'Kibwezi Farm',
    'FARM',
    'Jane Mutiso',
    '+254722000001',
    'kibwezi@farm.local',
    'Kibwezi Central',
    4.7
  ),
  (
    '99999999-9999-9999-9999-999999999999',
    'Mlolongo Produce Hub',
    'Mlolongo Farm',
    'AGGREGATOR',
    'Peter Mwangi',
    '+254733000002',
    'mlolongo@farm.local',
    'Mlolongo',
    4.3
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO purchase_orders (
  id,
  po_number,
  supplier_id,
  status,
  ordered_by,
  ordered_at,
  expected_delivery_date,
  subtotal_cents,
  tax_cents,
  total_cents
)
VALUES (
  'aaaaaaaa-1111-1111-1111-111111111111',
  'PO-2026-0001',
  '88888888-8888-8888-8888-888888888888',
  'RECEIVED',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  NOW() - INTERVAL '2 days',
  CURRENT_DATE - 1,
  250000,
  0,
  250000
)
ON CONFLICT (po_number) DO NOTHING;

INSERT INTO purchase_order_items (
  id,
  purchase_order_id,
  produce_item_id,
  item_name_snapshot,
  quantity,
  unit,
  unit_cost_cents,
  line_total_cents,
  batch_number,
  farm_name
)
VALUES
  (
    'bbbbbbbb-1111-1111-1111-111111111111',
    'aaaaaaaa-1111-1111-1111-111111111111',
    '55555555-5555-5555-5555-555555555555',
    'Tomatoes',
    50.0,
    'kg',
    3500,
    175000,
    'KBZ-TOM-20260218-A',
    'Kibwezi Farm'
  ),
  (
    'cccccccc-1111-1111-1111-111111111111',
    'aaaaaaaa-1111-1111-1111-111111111111',
    '66666666-6666-6666-6666-666666666666',
    'Onions',
    30.0,
    'kg',
    2500,
    75000,
    'KBZ-ONI-20260218-B',
    'Kibwezi Farm'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO inventory_movements (
  id,
  produce_item_id,
  movement_type,
  quantity,
  previous_quantity,
  new_quantity,
  reason,
  batch_number,
  supplier_id,
  purchase_order_id,
  created_by
)
VALUES
  (
    'dddddddd-1111-1111-1111-111111111111',
    '55555555-5555-5555-5555-555555555555',
    'IN',
    50.0,
    100.0,
    150.0,
    'Inbound from purchase order',
    'KBZ-TOM-20260218-A',
    '88888888-8888-8888-8888-888888888888',
    'aaaaaaaa-1111-1111-1111-111111111111',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
  )
ON CONFLICT (id) DO NOTHING;

-- Rider and fleet
INSERT INTO riders (id, name, phone, zone, is_active)
VALUES (
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
  'Primary Rider Legacy',
  '+254700000014',
  'KIBWEZI_CENTRAL',
  TRUE
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO rider_profiles (id, user_id, legacy_rider_id, license_number, employment_type, rider_status)
VALUES (
  'ffffffff-ffff-ffff-ffff-ffffffffffff',
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
  'DL-KEN-00991',
  'CONTRACTOR',
  'ACTIVE'
)
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO vehicles (id, registration_number, vehicle_type, capacity_kg, refrigerated, status)
VALUES (
  '12121212-1212-1212-1212-121212121212',
  'KDJ 123A',
  'VAN',
  700,
  TRUE,
  'ACTIVE'
)
ON CONFLICT (registration_number) DO NOTHING;

-- B2B order + invoice
INSERT INTO orders (
  id,
  user_id,
  status,
  total_price_cents,
  delivery_date,
  slot_type,
  delivery_address_id,
  items,
  placed_at,
  customer_type,
  b2b_company_profile_id
)
VALUES (
  '13131313-1313-1313-1313-131313131313',
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'CONFIRMED',
  180000,
  CURRENT_DATE + 1,
  'NEXT_DAY',
  '22222222-2222-2222-2222-222222222222',
  '[{"produceId":"55555555-5555-5555-5555-555555555555","quantity":20,"unit":"kg"}]'::jsonb,
  NOW(),
  'B2B',
  '33333333-3333-3333-3333-333333333333'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO invoices (
  id,
  invoice_number,
  b2b_company_profile_id,
  status,
  issue_date,
  due_date,
  subtotal_cents,
  tax_cents,
  total_cents,
  paid_cents,
  created_by
)
VALUES (
  '14141414-1414-1414-1414-141414141414',
  'INV-2026-0001',
  '33333333-3333-3333-3333-333333333333',
  'ISSUED',
  CURRENT_DATE,
  CURRENT_DATE + 30,
  180000,
  0,
  180000,
  0,
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
)
ON CONFLICT (invoice_number) DO NOTHING;

INSERT INTO invoice_line_items (
  id,
  invoice_id,
  order_id,
  description,
  quantity,
  unit_price_cents,
  line_total_cents
)
VALUES (
  '15151515-1515-1515-1515-151515151515',
  '14141414-1414-1414-1414-141414141414',
  '13131313-1313-1313-1313-131313131313',
  'Wholesale tomatoes',
  20,
  9000,
  180000
)
ON CONFLICT (id) DO NOTHING;

UPDATE orders
SET invoice_id = '14141414-1414-1414-1414-141414141414'
WHERE id = '13131313-1313-1313-1313-131313131313';

-- Route manifest and assignments
INSERT INTO delivery_routes (
  id,
  route_code,
  route_date,
  shift,
  status,
  rider_profile_id,
  rider_user_id,
  vehicle_id,
  total_stops
)
VALUES (
  '16161616-1616-1616-1616-161616161616',
  'RT-2026-02-20-A',
  CURRENT_DATE + 1,
  'MORNING',
  'PLANNED',
  'ffffffff-ffff-ffff-ffff-ffffffffffff',
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  '12121212-1212-1212-1212-121212121212',
  1
)
ON CONFLICT (route_code) DO NOTHING;

INSERT INTO delivery_assignments (
  id,
  order_id,
  rider_id,
  status,
  assigned_at,
  route_id,
  stop_sequence,
  vehicle_id,
  created_at
)
VALUES (
  '17171717-1717-1717-1717-171717171717',
  '13131313-1313-1313-1313-131313131313',
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
  'ASSIGNED',
  NOW(),
  '16161616-1616-1616-1616-161616161616',
  1,
  '12121212-1212-1212-1212-121212121212',
  NOW()
)
ON CONFLICT (order_id) DO NOTHING;

INSERT INTO delivery_route_stops (
  id,
  route_id,
  assignment_id,
  order_id,
  stop_sequence,
  stop_type,
  planned_eta,
  status
)
VALUES (
  '18181818-1818-1818-1818-181818181818',
  '16161616-1616-1616-1616-161616161616',
  '17171717-1717-1717-1717-171717171717',
  '13131313-1313-1313-1313-131313131313',
  1,
  'DROPOFF',
  NOW() + INTERVAL '1 day 3 hours',
  'PENDING'
)
ON CONFLICT (id) DO NOTHING;
