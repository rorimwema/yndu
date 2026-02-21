\echo 'Initializing Yndu dev database (baseline + enterprise + seed)'
CREATE EXTENSION IF NOT EXISTS pgcrypto;

\i /migrations/001_initial_schema.sql
\i /migrations/004_enterprise_schema.sql
\i /seeds/002_dev_seed_v2.sql
