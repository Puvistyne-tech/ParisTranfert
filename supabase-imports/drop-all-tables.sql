-- Drop All Tables Script
-- Run this script to completely drop all tables and start fresh
-- WARNING: This will delete all data!

-- Drop tables in reverse order of dependencies to avoid foreign key constraint errors

-- Drop tables with foreign key dependencies first
DROP TABLE IF EXISTS service_vehicle_pricing CASCADE;
DROP TABLE IF EXISTS service_fields CASCADE;
DROP TABLE IF EXISTS service_locations CASCADE;
DROP TABLE IF EXISTS reservations CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS locations CASCADE;
DROP TABLE IF EXISTS vehicle_types CASCADE;
DROP TABLE IF EXISTS features CASCADE;
DROP TABLE IF EXISTS testimonials CASCADE;

-- Drop ENUM types
DROP TYPE IF EXISTS reservation_status_enum CASCADE;
DROP TYPE IF EXISTS category_type_enum CASCADE;
DROP TYPE IF EXISTS service_field_type_enum CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Verify all tables are dropped
SELECT 
    'Tables remaining: ' || COUNT(*)::text as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
    AND table_name NOT IN ('spatial_ref_sys'); -- Exclude PostGIS system table if it exists

