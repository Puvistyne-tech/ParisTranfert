-- Migration Script: Add Vehicle Types and Pricing System
-- Run this script in Supabase SQL Editor to migrate existing database
-- WARNING: This will remove category_id from reservations table
-- Make sure to backup your data before running this migration

-- Step 1: Create new tables
-- (These should already exist from schema.sql, but included for completeness)

-- Create Vehicle Types Table
CREATE TABLE IF NOT EXISTS vehicle_types (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Locations Table
CREATE TABLE IF NOT EXISTS locations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Service Locations Junction Table
CREATE TABLE IF NOT EXISTS service_locations (
    service_id TEXT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    location_id TEXT NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    is_pickup BOOLEAN DEFAULT true,
    is_destination BOOLEAN DEFAULT true,
    PRIMARY KEY (service_id, location_id)
);

-- Create Service Vehicle Pricing Table
CREATE TABLE IF NOT EXISTS service_vehicle_pricing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id TEXT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    vehicle_type_id TEXT NOT NULL REFERENCES vehicle_types(id) ON DELETE CASCADE,
    pickup_location_id TEXT NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    destination_location_id TEXT NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (service_id, vehicle_type_id, pickup_location_id, destination_location_id)
);

-- Step 2: Add vehicle_type_id to reservations (before removing category_id)
ALTER TABLE reservations 
  ADD COLUMN IF NOT EXISTS vehicle_type_id TEXT REFERENCES vehicle_types(id) ON DELETE CASCADE;

-- Step 3: Migrate existing data (if any)
-- Note: This assumes you want to set a default vehicle type for existing reservations
-- You may need to adjust this based on your data
UPDATE reservations 
SET vehicle_type_id = 'car' 
WHERE vehicle_type_id IS NULL;

-- Step 4: Make vehicle_type_id NOT NULL (after setting defaults)
ALTER TABLE reservations 
  ALTER COLUMN vehicle_type_id SET NOT NULL;

-- Step 5: Remove category_id from reservations
-- First, drop the foreign key constraint
ALTER TABLE reservations 
  DROP CONSTRAINT IF EXISTS reservations_category_id_fkey;

-- Drop the index
DROP INDEX IF EXISTS idx_reservations_category_id;

-- Remove the column
ALTER TABLE reservations 
  DROP COLUMN IF EXISTS category_id;

-- Step 6: Add new indexes
CREATE INDEX IF NOT EXISTS idx_reservations_vehicle_type_id ON reservations(vehicle_type_id);
CREATE INDEX IF NOT EXISTS idx_service_locations_service_id ON service_locations(service_id);
CREATE INDEX IF NOT EXISTS idx_service_locations_location_id ON service_locations(location_id);
CREATE INDEX IF NOT EXISTS idx_service_vehicle_pricing_service_id ON service_vehicle_pricing(service_id);
CREATE INDEX IF NOT EXISTS idx_service_vehicle_pricing_vehicle_type_id ON service_vehicle_pricing(vehicle_type_id);
CREATE INDEX IF NOT EXISTS idx_service_vehicle_pricing_route ON service_vehicle_pricing(pickup_location_id, destination_location_id);

-- Step 7: Add triggers for updated_at
CREATE TRIGGER update_vehicle_types_updated_at BEFORE UPDATE ON vehicle_types
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_vehicle_pricing_updated_at BEFORE UPDATE ON service_vehicle_pricing
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 8: Insert seed data (vehicle types, locations, pricing)
-- See seed.sql for the complete seed data

-- Verify migration
SELECT 'Migration completed. Reservations table now has vehicle_type_id instead of category_id' AS status;
SELECT COUNT(*) AS total_reservations FROM reservations;
SELECT COUNT(*) AS vehicle_types_count FROM vehicle_types;
SELECT COUNT(*) AS locations_count FROM locations;
SELECT COUNT(*) AS pricing_rules_count FROM service_vehicle_pricing;

