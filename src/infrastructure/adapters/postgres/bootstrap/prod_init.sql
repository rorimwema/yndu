\echo 'Initializing Yndu production-like database (baseline + enterprise, no seed)'
CREATE EXTENSION IF NOT EXISTS pgcrypto;

\i /migrations/001_initial_schema.sql
\i /migrations/004_enterprise_schema.sql
