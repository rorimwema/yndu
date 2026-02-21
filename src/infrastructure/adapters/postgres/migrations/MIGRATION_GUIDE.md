# -- Migration Guide: From v001 to v002 Enhanced Schema --

-- This guide helps you migrate from the initial schema (001) to the enhanced -- production-ready
schema (002).

-- ============================================================================ -- STEP 1: BACKUP
YOUR DATA -- ============================================================================

-- Always backup before migrations! -- pg_dump -h localhost -U postgres -d yndu -f
yndu_backup_$(date +%Y%m%d).sql

-- ============================================================================ -- STEP 2: RUN
ENHANCED SCHEMA -- ============================================================================

-- The enhanced schema (002_enhanced_schema.sql) is designed to be run on a -- fresh database. For
existing data, follow the steps below:

-- ============================================================================ -- STEP 3: MIGRATE
EXISTING DATA -- ============================================================================

-- 3.1 Add new columns to existing tables ALTER TABLE users ADD COLUMN IF NOT EXISTS status
VARCHAR(20) DEFAULT 'active', ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ, ADD COLUMN IF NOT
EXISTS deleted_by UUID REFERENCES users(id), ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES
users(id), ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES users(id), ADD COLUMN IF NOT EXISTS
version INTEGER DEFAULT 1;

-- Add CHECK constraint (PostgreSQL requires this to be done carefully) ALTER TABLE users ADD
CONSTRAINT valid_user_status CHECK (status IN ('active', 'suspended', 'deactivated'));

-- 3.2 Add triggers for updated_at and version -- (Assuming functions already exist from 002 schema)

-- Check if trigger exists first DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'users_updated_at'
    ) THEN
        CREATE TRIGGER users_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$

;

-- 3.3 Migrate orders table ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20)
DEFAULT 'PENDING', ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50), ADD COLUMN IF NOT EXISTS
payment_reference VARCHAR(255), ADD COLUMN IF NOT EXISTS out_for_delivery_at TIMESTAMPTZ, ADD COLUMN
IF NOT EXISTS cancelled_at TIMESTAMPTZ, ADD COLUMN IF NOT EXISTS cancellation_reason TEXT, ADD
COLUMN IF NOT EXISTS confirmed_by UUID REFERENCES users(id), ADD COLUMN IF NOT EXISTS
box_template_id UUID, ADD COLUMN IF NOT EXISTS box_customizations JSONB, ADD COLUMN IF NOT EXISTS
delivery_address_snapshot JSONB, ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ, ADD COLUMN IF NOT
EXISTS version INTEGER DEFAULT 1;

-- Add CHECK constraints ALTER TABLE orders ADD CONSTRAINT valid_order_status CHECK ( status IN
('PENDING', 'CONFIRMED', 'ASSIGNED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED') ), ADD CONSTRAINT
valid_payment_status CHECK ( payment_status IN ('PENDING', 'PROCESSING', 'PAID', 'FAILED',
'REFUNDED') );

-- 3.4 Create new tables -- (Run the CREATE TABLE statements from 002_enhanced_schema.sql for tables
that don't exist)

-- ============================================================================ -- STEP 4: CREATE
INDEXES -- ============================================================================

-- Create indexes for better query performance -- (Run the CREATE INDEX statements from
002_enhanced_schema.sql)

-- ============================================================================ -- STEP 5: VALIDATE
MIGRATION -- ============================================================================

-- Check row counts match SELECT 'users' as table_name, COUNT(_) as row_count FROM users UNION ALL
SELECT 'orders', COUNT(_) FROM orders UNION ALL SELECT 'produce_items', COUNT(*) FROM produce_items;

-- Check for null constraints violations SELECT id FROM users WHERE status IS NULL; SELECT id FROM
orders WHERE payment_status IS NULL;

# -- ============================================================================ -- STEP 6: CLEANUP (AFTER SUCCESSFUL VALIDATION) --

-- If everything looks good, you can remove the old migration file -- and update your application to
use the new schema version.

-- ============================================================================ -- ROLLBACK PLAN (If
needed) -- ============================================================================

-- To rollback, restore from your backup: -- psql -h localhost -U postgres -d yndu -f
yndu_backup_YYYYMMDD.sql

-- Or selectively rollback columns: -- ALTER TABLE users DROP COLUMN IF EXISTS status; -- ALTER
TABLE orders DROP COLUMN IF EXISTS payment_status;

# -- ============================================================================ -- NOTES --

-- 1. The enhanced schema uses INTEGER for monetary values (cents) instead of -- DECIMAL to avoid
floating-point errors. Update your application code -- accordingly: price_cents / 100 =
price_shillings

-- 2. CHECK constraints enforce valid enum values at the database level. -- Make sure your
application handles constraint violations gracefully.

-- 3. Partitioning for domain_events and audit_log tables improves performance -- for large
datasets. New partitions are created automatically for future -- months, but old data won't be moved
to partitions automatically.

-- 4. Soft delete pattern (deleted_at column) allows logical deletion while -- preserving data for
reporting/analytics.

-- 5. Optimistic locking (version column) prevents concurrent update conflicts. -- Always include
version in UPDATE statements: UPDATE ... WHERE id = ? AND version = ?
