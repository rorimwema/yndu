-- Seed Data for Yndu Development Environment
-- ===========================================

-- This file contains sample data for development and testing.
-- Run after applying the schema migrations.

-- ============================================================================
-- 1. USERS & ADDRESSES
-- ============================================================================

-- Admin user
INSERT INTO users (id, email, phone, email_verified, phone_verified, profile, status, created_at)
VALUES (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'admin@yndu.co.ke',
    '+254700000000',
    true,
    true,
    '{"firstName": "Admin", "lastName": "User", "preferredLanguage": "en"}'::jsonb,
    'active',
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- Sample customers
INSERT INTO users (id, email, phone, email_verified, phone_verified, profile, status, created_at)
VALUES 
    (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        'john.doe@example.com',
        '+254711111111',
        true,
        true,
        '{"firstName": "John", "lastName": "Doe", "preferredLanguage": "en"}'::jsonb,
        'active',
        NOW() - INTERVAL '30 days'
    ),
    (
        'cccccccc-cccc-cccc-cccc-cccccccccccc',
        'jane.smith@example.com',
        '+254722222222',
        true,
        false,
        '{"firstName": "Jane", "lastName": "Smith", "preferredLanguage": "en"}'::jsonb,
        'active',
        NOW() - INTERVAL '15 days'
    ),
    (
        'dddddddd-dddd-dddd-dddd-dddddddddddd',
        'mwangi@example.co.ke',
        '+254733333333',
        true,
        true,
        '{"firstName": "Mwangi", "lastName": "Kamau", "preferredLanguage": "sw"}'::jsonb,
        'active',
        NOW() - INTERVAL '7 days'
    )
ON CONFLICT (email) DO NOTHING;

-- Sample addresses
INSERT INTO user_addresses (id, user_id, label, coordinates, zone, is_default, street_address, delivery_instructions, created_at)
VALUES 
    (
        'addr-001',
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        'Home',
        POINT(-1.2921, 36.8219),
        'NAIROBI_EAST',
        true,
        '123 Kimathi Street, Nairobi',
        'Gate is green. Call when you arrive.',
        NOW()
    ),
    (
        'addr-002',
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        'Office',
        POINT(-1.2865, 36.8172),
        'NAIROBI_EAST',
        false,
        '456 Moi Avenue, 3rd Floor, Nairobi',
        'Reception desk. Ask for John.',
        NOW()
    ),
    (
        'addr-003',
        'cccccccc-cccc-cccc-cccc-cccccccccccc',
        'Home',
        POINT(-1.2984, 36.7761),
        'NAIROBI_WEST',
        true,
        '789 Karen Road, Karen',
        'White house with blue gate.',
        NOW()
    ),
    (
        'addr-004',
        'dddddddd-dddd-dddd-dddd-dddddddddddd',
        'Home',
        POINT(-2.4167, 37.9667),
        'KIBWEZI_CENTRAL',
        true,
        'Kibwezi Town, Near Market',
        'Ask for Mwangi at the shop.',
        NOW()
    )
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 2. PRODUCE ITEMS
-- ============================================================================

INSERT INTO produce_items (
    id, name, name_sw, category_id, unit_price_cents, available_quantity, unit, 
    reorder_threshold, is_seasonal, is_active, image_url, description, created_at
) VALUES 
    (
        'prod-001',
        'Tomatoes',
        'Nyanya',
        2, -- ROOT_VEGETABLES
        5000, -- KES 50.00
        100.00,
        'kg',
        20.00,
        false,
        true,
        'https://cdn.yndu.co.ke/images/tomatoes.jpg',
        'Fresh red tomatoes from Kibwezi farm',
        NOW()
    ),
    (
        'prod-002',
        'Onions',
        'Kitunguu',
        2, -- ROOT_VEGETABLES
        3000, -- KES 30.00
        150.00,
        'kg',
        30.00,
        false,
        true,
        'https://cdn.yndu.co.ke/images/onions.jpg',
        'Sweet onions, perfect for cooking',
        NOW()
    ),
    (
        'prod-003',
        'Spinach',
        'Mchicha',
        1, -- LEAFY_GREENS
        4000, -- KES 40.00
        80.00,
        'bunches',
        15.00,
        false,
        true,
        'https://cdn.yndu.co.ke/images/spinach.jpg',
        'Fresh organic spinach',
        NOW()
    ),
    (
        'prod-004',
        'Carrots',
        'Karoti',
        2, -- ROOT_VEGETABLES
        3500, -- KES 35.00
        120.00,
        'kg',
        25.00,
        false,
        true,
        'https://cdn.yndu.co.ke/images/carrots.jpg',
        'Crunchy orange carrots',
        NOW()
    ),
    (
        'prod-005',
        'Kale (Sukuma Wiki)',
        'Sukuma Wiki',
        1, -- LEAFY_GREENS
        2500, -- KES 25.00
        200.00,
        'bunches',
        40.00,
        false,
        true,
        'https://cdn.yndu.co.ke/images/kale.jpg',
        'Fresh collard greens - staple Kenyan vegetable',
        NOW()
    ),
    (
        'prod-006',
        'Bananas',
        'Ndizi',
        3, -- FRUITS
        6000, -- KES 60.00
        50.00,
        'bunches',
        10.00,
        false,
        true,
        'https://cdn.yndu.co.ke/images/bananas.jpg',
        'Sweet bananas from local farms',
        NOW()
    ),
    (
        'prod-007',
        'Mangoes',
        'Embe',
        3, -- FRUITS
        8000, -- KES 80.00
        60.00,
        'kg',
        12.00,
        true, -- Seasonal
        true,
        'https://cdn.yndu.co.ke/images/mangoes.jpg',
        'Sweet Kenyan mangoes - in season now!',
        NOW()
    ),
    (
        'prod-008',
        'Coriander (Dhania)',
        'Dhania',
        4, -- HERBS
        1500, -- KES 15.00
        100.00,
        'bunches',
        20.00,
        false,
        true,
        'https://cdn.yndu.co.ke/images/coriander.jpg',
        'Fresh aromatic coriander',
        NOW()
    ),
    (
        'prod-009',
        'Potatoes',
        'Viazi',
        2, -- ROOT_VEGETABLES
        4500, -- KES 45.00
        200.00,
        'kg',
        40.00,
        false,
        true,
        'https://cdn.yndu.co.ke/images/potatoes.jpg',
        'Versatile potatoes for any meal',
        NOW()
    ),
    (
        'prod-010',
        'Cabbage',
        'Kabichi',
        2, -- ROOT_VEGETABLES
        3500, -- KES 35.00
        90.00,
        'pcs',
        15.00,
        false,
        true,
        'https://cdn.yndu.co.ke/images/cabbage.jpg',
        'Fresh cabbage heads',
        NOW()
    )
ON CONFLICT (id) DO UPDATE SET 
    available_quantity = EXCLUDED.available_quantity,
    updated_at = NOW();

-- ============================================================================
-- 3. RIDERS
-- ============================================================================

INSERT INTO riders (id, name, phone, email, zone_id, is_active, created_at)
VALUES 
    (
        'rider-001',
        'David Kimani',
        '+254744444444',
        'david.k@yndu.co.ke',
        1, -- KIBWEZI_CENTRAL
        true,
        NOW()
    ),
    (
        'rider-002',
        'Grace Wanjiku',
        '+254755555555',
        'grace.w@yndu.co.ke',
        3, -- NAIROBI_EAST
        true,
        NOW()
    ),
    (
        'rider-003',
        'Peter Omondi',
        '+254766666666',
        'peter.o@yndu.co.ke',
        4, -- NAIROBI_WEST
        true,
        NOW()
    )
ON CONFLICT (phone) DO NOTHING;

-- ============================================================================
-- 4. SAMPLE ORDERS (for testing)
-- ============================================================================

-- Pending order
INSERT INTO orders (
    id, user_id, status, total_price_cents, delivery_date, slot_type,
    delivery_address_id, box_template_id, box_customizations, 
    payment_status, placed_at, version
) VALUES (
    'order-001',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'PENDING',
    65000, -- KES 650.00
    CURRENT_DATE + INTERVAL '1 day',
    'NEXT_DAY',
    'addr-001',
    '11111111-1111-1111-1111-111111111111', -- Small box
    '[
        {"produceId": "prod-001", "quantity": 1.5, "unit": "kg", "linePriceCents": 7500},
        {"produceId": "prod-002", "quantity": 1.0, "unit": "kg", "linePriceCents": 3000},
        {"produceId": "prod-003", "quantity": 2, "unit": "bunches", "linePriceCents": 8000}
    ]'::jsonb,
    'PENDING',
    NOW() - INTERVAL '2 hours',
    1
) ON CONFLICT (id) DO NOTHING;

-- Confirmed order
INSERT INTO orders (
    id, user_id, status, total_price_cents, delivery_date, slot_type,
    delivery_address_id, box_template_id, box_customizations,
    payment_status, placed_at, confirmed_at, confirmed_by, version
) VALUES (
    'order-002',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'CONFIRMED',
    105000, -- KES 1,050.00
    CURRENT_DATE,
    'SAME_DAY',
    'addr-003',
    '22222222-2222-2222-2222-222222222222', -- Medium box
    '[
        {"produceId": "prod-001", "quantity": 2, "unit": "kg", "linePriceCents": 10000},
        {"produceId": "prod-004", "quantity": 1.5, "unit": "kg", "linePriceCents": 5250},
        {"produceId": "prod-005", "quantity": 3, "unit": "bunches", "linePriceCents": 7500},
        {"produceId": "prod-009", "quantity": 2, "unit": "kg", "linePriceCents": 9000}
    ]'::jsonb,
    'PAID',
    NOW() - INTERVAL '4 hours',
    NOW() - INTERVAL '3 hours',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', -- Admin confirmed
    2
) ON CONFLICT (id) DO NOTHING;

-- Delivered order (last week)
INSERT INTO orders (
    id, user_id, status, total_price_cents, delivery_date, slot_type,
    delivery_address_id, box_template_id, box_customizations,
    payment_status, placed_at, confirmed_at, out_for_delivery_at, delivered_at, version
) VALUES (
    'order-003',
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'DELIVERED',
    175000, -- KES 1,750.00
    CURRENT_DATE - INTERVAL '7 days',
    'NEXT_DAY',
    'addr-004',
    '33333333-3333-3333-3333-333333333333', -- Large box
    '[
        {"produceId": "prod-001", "quantity": 3, "unit": "kg", "linePriceCents": 15000},
        {"produceId": "prod-002", "quantity": 2, "unit": "kg", "linePriceCents": 6000},
        {"produceId": "prod-003", "quantity": 4, "unit": "bunches", "linePriceCents": 16000},
        {"produceId": "prod-004", "quantity": 2, "unit": "kg", "linePriceCents": 7000},
        {"produceId": "prod-010", "quantity": 2, "unit": "pcs", "linePriceCents": 7000}
    ]'::jsonb,
    'PAID',
    NOW() - INTERVAL '8 days',
    NOW() - INTERVAL '7 days 20 hours',
    NOW() - INTERVAL '7 days 12 hours',
    NOW() - INTERVAL '7 days 10 hours',
    5
) ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 5. SAMPLE SUBSCRIPTIONS
-- ============================================================================

INSERT INTO subscriptions (
    id, user_id, box_template_id, frequency, status, next_delivery_date,
    delivery_address_id, customizations, created_at, version
) VALUES (
    'sub-001',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '22222222-2222-2222-2222-222222222222', -- Medium box
    'WEEKLY',
    'ACTIVE',
    CURRENT_DATE + INTERVAL '7 days',
    'addr-001',
    '{"excludeItems": ["prod-004"], "preferredItems": ["prod-001", "prod-003"]}'::jsonb,
    NOW() - INTERVAL '30 days',
    1
) ON CONFLICT (id) DO NOTHING;

INSERT INTO subscriptions (
    id, user_id, box_template_id, frequency, status, next_delivery_date,
    delivery_address_id, created_at, version
) VALUES (
    'sub-002',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '11111111-1111-1111-1111-111111111111', -- Small box
    'BIWEEKLY',
    'ACTIVE',
    CURRENT_DATE + INTERVAL '14 days',
    'addr-003',
    NOW() - INTERVAL '15 days',
    1
) ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 6. DELIVERY ASSIGNMENTS
-- ============================================================================

-- Active delivery assignment
INSERT INTO delivery_assignments (
    id, order_id, rider_id, status, assigned_at, assigned_by, estimated_delivery_at, version
) VALUES (
    'da-001',
    'order-002',
    'rider-003',
    'ASSIGNED',
    NOW() - INTERVAL '3 hours',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    CURRENT_DATE + INTERVAL '14:00:00',
    2
) ON CONFLICT (order_id) DO NOTHING;

-- Completed delivery
INSERT INTO delivery_assignments (
    id, order_id, rider_id, status, assigned_at, assigned_by,
    picked_up_at, delivered_at, delivery_proof, delivery_rating, version
) VALUES (
    'da-002',
    'order-003',
    'rider-001',
    'DELIVERED',
    NOW() - INTERVAL '8 days',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    NOW() - INTERVAL '7 days 18 hours',
    NOW() - INTERVAL '7 days 10 hours',
    '{"photoUrl": "https://cdn.yndu.co.ke/proof/order-003.jpg", "notes": "Delivered to reception"}'::jsonb,
    5,
    5
) ON CONFLICT (order_id) DO NOTHING;

-- ============================================================================
-- 7. REFRESH MATERIALIZED VIEWS
-- ============================================================================

REFRESH MATERIALIZED VIEW mv_orders_by_date;

-- ============================================================================
-- 8. VERIFY SEED DATA
-- ============================================================================

SELECT 'Users' as entity, COUNT(*) as count FROM users
UNION ALL SELECT 'Addresses', COUNT(*) FROM user_addresses
UNION ALL SELECT 'Produce Items', COUNT(*) FROM produce_items
UNION ALL SELECT 'Riders', COUNT(*) FROM riders
UNION ALL SELECT 'Orders', COUNT(*) FROM orders
UNION ALL SELECT 'Subscriptions', COUNT(*) FROM subscriptions
UNION ALL SELECT 'Deliveries', COUNT(*) FROM delivery_assignments;
