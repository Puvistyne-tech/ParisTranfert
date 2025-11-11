-- Migration: Remove redundant client_id column from clients table
-- This column was redundant since we already have a UUID id as primary key

-- Step 1: Drop the index on client_id (must be done before dropping the column)
DROP INDEX IF EXISTS idx_clients_client_id;

-- Step 2: Drop the client_id column from clients table
ALTER TABLE clients DROP COLUMN IF EXISTS client_id;

-- Note: The client_id field in reservations table is different - it's a foreign key
-- that references clients.id, so it should NOT be removed.

