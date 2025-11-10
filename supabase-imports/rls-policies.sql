-- Row Level Security (RLS) Policies for Paris Transfer Booking System
-- Run this script in Supabase SQL Editor to enable public read access

-- Enable RLS on all tables (if not already enabled)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE features ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_vehicle_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_fields ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow public read access" ON categories;
DROP POLICY IF EXISTS "Allow public read access" ON services;
DROP POLICY IF EXISTS "Allow public read access" ON features;
DROP POLICY IF EXISTS "Allow public read access" ON testimonials;
DROP POLICY IF EXISTS "Allow public read access" ON clients;
DROP POLICY IF EXISTS "Allow public read access" ON reservations;
DROP POLICY IF EXISTS "Allow public read access" ON vehicle_types;
DROP POLICY IF EXISTS "Allow public read access" ON locations;
DROP POLICY IF EXISTS "Allow public read access" ON service_locations;
DROP POLICY IF EXISTS "Allow public read access" ON service_vehicle_pricing;
DROP POLICY IF EXISTS "Allow public read access" ON service_fields;

DROP POLICY IF EXISTS "Allow public insert" ON clients;
DROP POLICY IF EXISTS "Allow public insert" ON reservations;

DROP POLICY IF EXISTS "Allow public update" ON reservations;

-- Categories: Allow anyone to read
CREATE POLICY "Allow public read access" ON categories
  FOR SELECT
  USING (true);

-- Services: Allow anyone to read
CREATE POLICY "Allow public read access" ON services
  FOR SELECT
  USING (true);

-- Features: Allow anyone to read
CREATE POLICY "Allow public read access" ON features
  FOR SELECT
  USING (true);

-- Testimonials: Allow anyone to read
CREATE POLICY "Allow public read access" ON testimonials
  FOR SELECT
  USING (true);

-- Clients: Allow anyone to read and insert (for contact forms and reservations)
CREATE POLICY "Allow public read access" ON clients
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert" ON clients
  FOR INSERT
  WITH CHECK (true);

-- Reservations: Allow anyone to read and insert (for creating reservations)
CREATE POLICY "Allow public read access" ON reservations
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert" ON reservations
  FOR INSERT
  WITH CHECK (true);

-- Reservations: Allow public to update (for status changes, etc.)
-- Note: You might want to restrict this further in production
CREATE POLICY "Allow public update" ON reservations
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Vehicle Types: Allow anyone to read
CREATE POLICY "Allow public read access" ON vehicle_types
  FOR SELECT
  USING (true);

-- Locations: Allow anyone to read
CREATE POLICY "Allow public read access" ON locations
  FOR SELECT
  USING (true);

-- Service Locations: Allow anyone to read
CREATE POLICY "Allow public read access" ON service_locations
  FOR SELECT
  USING (true);

-- Service Vehicle Pricing: Allow anyone to read
CREATE POLICY "Allow public read access" ON service_vehicle_pricing
  FOR SELECT
  USING (true);

-- Service Fields: Allow anyone to read
CREATE POLICY "Allow public read access" ON service_fields
  FOR SELECT
  USING (true);

-- ============================================
-- Admin Helper Functions
-- ============================================
-- Create helper functions if they don't exist
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM auth.users
    WHERE id = user_id
      AND raw_user_meta_data->>'role' = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Admin Policies for Reservations
-- ============================================
DROP POLICY IF EXISTS "Admins can read all reservations" ON reservations;
DROP POLICY IF EXISTS "Admins can update all reservations" ON reservations;
DROP POLICY IF EXISTS "Admins can delete reservations" ON reservations;

CREATE POLICY "Admins can read all reservations" ON reservations
  FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update all reservations" ON reservations
  FOR UPDATE
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can delete reservations" ON reservations
  FOR DELETE
  USING (is_admin(auth.uid()));

-- ============================================
-- Admin Policies for Clients
-- ============================================
DROP POLICY IF EXISTS "Admins can read all clients" ON clients;
DROP POLICY IF EXISTS "Admins can update clients" ON clients;
DROP POLICY IF EXISTS "Admins can delete clients" ON clients;

CREATE POLICY "Admins can read all clients" ON clients
  FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update clients" ON clients
  FOR UPDATE
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can delete clients" ON clients
  FOR DELETE
  USING (is_admin(auth.uid()));

-- ============================================
-- Admin Policies for Services
-- ============================================
DROP POLICY IF EXISTS "Super admins can manage services" ON services;
DROP POLICY IF EXISTS "Super admins can insert services" ON services;
DROP POLICY IF EXISTS "Super admins can update services" ON services;
DROP POLICY IF EXISTS "Super admins can delete services" ON services;
DROP POLICY IF EXISTS "Admins can insert services" ON services;
DROP POLICY IF EXISTS "Admins can update services" ON services;
DROP POLICY IF EXISTS "Admins can delete services" ON services;

CREATE POLICY "Admins can insert services" ON services
  FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update services" ON services
  FOR UPDATE
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can delete services" ON services
  FOR DELETE
  USING (is_admin(auth.uid()));

-- ============================================
-- Admin Policies for Categories
-- ============================================
DROP POLICY IF EXISTS "Super admins can manage categories" ON categories;
DROP POLICY IF EXISTS "Super admins can insert categories" ON categories;
DROP POLICY IF EXISTS "Super admins can update categories" ON categories;
DROP POLICY IF EXISTS "Super admins can delete categories" ON categories;
DROP POLICY IF EXISTS "Admins can insert categories" ON categories;
DROP POLICY IF EXISTS "Admins can update categories" ON categories;
DROP POLICY IF EXISTS "Admins can delete categories" ON categories;

CREATE POLICY "Admins can insert categories" ON categories
  FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update categories" ON categories
  FOR UPDATE
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can delete categories" ON categories
  FOR DELETE
  USING (is_admin(auth.uid()));

-- ============================================
-- Admin Policies for Vehicle Types
-- ============================================
DROP POLICY IF EXISTS "Super admins can manage vehicle types" ON vehicle_types;
DROP POLICY IF EXISTS "Super admins can insert vehicle types" ON vehicle_types;
DROP POLICY IF EXISTS "Super admins can update vehicle types" ON vehicle_types;
DROP POLICY IF EXISTS "Super admins can delete vehicle types" ON vehicle_types;
DROP POLICY IF EXISTS "Admins can insert vehicle types" ON vehicle_types;
DROP POLICY IF EXISTS "Admins can update vehicle types" ON vehicle_types;
DROP POLICY IF EXISTS "Admins can delete vehicle types" ON vehicle_types;

CREATE POLICY "Admins can insert vehicle types" ON vehicle_types
  FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update vehicle types" ON vehicle_types
  FOR UPDATE
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can delete vehicle types" ON vehicle_types
  FOR DELETE
  USING (is_admin(auth.uid()));

-- ============================================
-- Admin Policies for Locations
-- ============================================
DROP POLICY IF EXISTS "Super admins can manage locations" ON locations;
DROP POLICY IF EXISTS "Super admins can insert locations" ON locations;
DROP POLICY IF EXISTS "Super admins can update locations" ON locations;
DROP POLICY IF EXISTS "Super admins can delete locations" ON locations;
DROP POLICY IF EXISTS "Admins can insert locations" ON locations;
DROP POLICY IF EXISTS "Admins can update locations" ON locations;
DROP POLICY IF EXISTS "Admins can delete locations" ON locations;

CREATE POLICY "Admins can insert locations" ON locations
  FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update locations" ON locations
  FOR UPDATE
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can delete locations" ON locations
  FOR DELETE
  USING (is_admin(auth.uid()));

-- ============================================
-- Admin Policies for Service Vehicle Pricing
-- ============================================
DROP POLICY IF EXISTS "Super admins can manage pricing" ON service_vehicle_pricing;
DROP POLICY IF EXISTS "Admins can insert pricing" ON service_vehicle_pricing;
DROP POLICY IF EXISTS "Admins can update pricing" ON service_vehicle_pricing;
DROP POLICY IF EXISTS "Admins can delete pricing" ON service_vehicle_pricing;
CREATE POLICY "Admins can insert pricing" ON service_vehicle_pricing
  FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update pricing" ON service_vehicle_pricing
  FOR UPDATE
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can delete pricing" ON service_vehicle_pricing
  FOR DELETE
  USING (is_admin(auth.uid()));

-- ============================================
-- Admin Policies for Features
-- ============================================
DROP POLICY IF EXISTS "Super admins can manage features" ON features;
DROP POLICY IF EXISTS "Super admins can insert features" ON features;
DROP POLICY IF EXISTS "Super admins can update features" ON features;
DROP POLICY IF EXISTS "Super admins can delete features" ON features;
DROP POLICY IF EXISTS "Admins can insert features" ON features;
DROP POLICY IF EXISTS "Admins can update features" ON features;
DROP POLICY IF EXISTS "Admins can delete features" ON features;

CREATE POLICY "Admins can insert features" ON features
  FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update features" ON features
  FOR UPDATE
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can delete features" ON features
  FOR DELETE
  USING (is_admin(auth.uid()));

-- ============================================
-- Admin Policies for Testimonials
-- ============================================
DROP POLICY IF EXISTS "Super admins can manage testimonials" ON testimonials;
DROP POLICY IF EXISTS "Super admins can insert testimonials" ON testimonials;
DROP POLICY IF EXISTS "Super admins can update testimonials" ON testimonials;
DROP POLICY IF EXISTS "Super admins can delete testimonials" ON testimonials;
DROP POLICY IF EXISTS "Admins can insert testimonials" ON testimonials;
DROP POLICY IF EXISTS "Admins can update testimonials" ON testimonials;
DROP POLICY IF EXISTS "Admins can delete testimonials" ON testimonials;

CREATE POLICY "Admins can insert testimonials" ON testimonials
  FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update testimonials" ON testimonials
  FOR UPDATE
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can delete testimonials" ON testimonials
  FOR DELETE
  USING (is_admin(auth.uid()));

-- ============================================
-- Admin Policies for Service Fields
-- ============================================
DROP POLICY IF EXISTS "Super admins can manage service fields" ON service_fields;
DROP POLICY IF EXISTS "Super admins can insert service fields" ON service_fields;
DROP POLICY IF EXISTS "Super admins can update service fields" ON service_fields;
DROP POLICY IF EXISTS "Super admins can delete service fields" ON service_fields;
DROP POLICY IF EXISTS "Admins can insert service fields" ON service_fields;
DROP POLICY IF EXISTS "Admins can update service fields" ON service_fields;
DROP POLICY IF EXISTS "Admins can delete service fields" ON service_fields;

CREATE POLICY "Admins can insert service fields" ON service_fields
  FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update service fields" ON service_fields
  FOR UPDATE
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can delete service fields" ON service_fields
  FOR DELETE
  USING (is_admin(auth.uid()));

-- ============================================
-- Verify policies were created
-- ============================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('categories', 'services', 'features', 'testimonials', 'clients', 'reservations', 'vehicle_types', 'locations', 'service_locations', 'service_vehicle_pricing', 'service_fields')
ORDER BY tablename, policyname;

