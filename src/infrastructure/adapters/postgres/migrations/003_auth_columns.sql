-- ============================================================================
-- YNDU AUTH SCHEMA MIGRATION
-- Adds authentication columns to users table
-- ============================================================================

-- Password hash column (nullable — allows OAuth-only users)
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Refresh token for JWT token rotation
ALTER TABLE users ADD COLUMN IF NOT EXISTS refresh_token TEXT;

-- Last login timestamp
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

-- Index for refresh token lookups
CREATE INDEX IF NOT EXISTS idx_users_refresh_token 
ON users(refresh_token) WHERE refresh_token IS NOT NULL;

-- Name column (if not already present in profile JSONB, add as real column for queries)
ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255);
