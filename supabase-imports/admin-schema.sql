-- Admin Users Schema
-- This uses Supabase Auth users with metadata for roles
-- Admin users should be created through Supabase Auth with user_metadata.role = 'admin'

-- Create a function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user exists in auth.users and has admin role in metadata
  RETURN EXISTS (
    SELECT 1
    FROM auth.users
    WHERE id = user_id
    AND raw_user_meta_data->>'role' = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for Admin Access
-- Note: These policies allow admin users to perform CRUD operations

-- Allow admins to read all reservations
DROP POLICY IF EXISTS "Admins can read all reservations" ON reservations;
CREATE POLICY "Admins can read all reservations" ON reservations
  FOR SELECT
  USING (is_admin(auth.uid()));

-- Allow admins to update all reservations
DROP POLICY IF EXISTS "Admins can update all reservations" ON reservations;
CREATE POLICY "Admins can update all reservations" ON reservations
  FOR UPDATE
  USING (is_admin(auth.uid()));

-- Allow admins to delete reservations
DROP POLICY IF EXISTS "Admins can delete reservations" ON reservations;
CREATE POLICY "Admins can delete reservations" ON reservations
  FOR DELETE
  USING (is_admin(auth.uid()));

-- Allow admins to read all clients
DROP POLICY IF EXISTS "Admins can read all clients" ON clients;
CREATE POLICY "Admins can read all clients" ON clients
  FOR SELECT
  USING (is_admin(auth.uid()));

-- Allow admins to update clients
DROP POLICY IF EXISTS "Admins can update clients" ON clients;
CREATE POLICY "Admins can update clients" ON clients
  FOR UPDATE
  USING (is_admin(auth.uid()));

-- Admin policies for managing services, categories, etc.
-- Services
DROP POLICY IF EXISTS "Super admins can manage services" ON services;
DROP POLICY IF EXISTS "Admins can manage services" ON services;
CREATE POLICY "Admins can manage services" ON services
  FOR ALL
  USING (is_admin(auth.uid()));

-- Categories
DROP POLICY IF EXISTS "Super admins can manage categories" ON categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON categories;
CREATE POLICY "Admins can manage categories" ON categories
  FOR ALL
  USING (is_admin(auth.uid()));

-- Vehicle Types
DROP POLICY IF EXISTS "Super admins can manage vehicle types" ON vehicle_types;
DROP POLICY IF EXISTS "Admins can manage vehicle types" ON vehicle_types;
CREATE POLICY "Admins can manage vehicle types" ON vehicle_types
  FOR ALL
  USING (is_admin(auth.uid()));

-- Locations
DROP POLICY IF EXISTS "Super admins can manage locations" ON locations;
DROP POLICY IF EXISTS "Admins can manage locations" ON locations;
CREATE POLICY "Admins can manage locations" ON locations
  FOR ALL
  USING (is_admin(auth.uid()));

-- Pricing
DROP POLICY IF EXISTS "Super admins can manage pricing" ON service_vehicle_pricing;
DROP POLICY IF EXISTS "Admins can manage pricing" ON service_vehicle_pricing;
CREATE POLICY "Admins can manage pricing" ON service_vehicle_pricing
  FOR ALL
  USING (is_admin(auth.uid()));

-- Features
DROP POLICY IF EXISTS "Super admins can manage features" ON features;
DROP POLICY IF EXISTS "Admins can manage features" ON features;
CREATE POLICY "Admins can manage features" ON features
  FOR ALL
  USING (is_admin(auth.uid()));

-- Testimonials
DROP POLICY IF EXISTS "Super admins can manage testimonials" ON testimonials;
DROP POLICY IF EXISTS "Admins can manage testimonials" ON testimonials;
CREATE POLICY "Admins can manage testimonials" ON testimonials
  FOR ALL
  USING (is_admin(auth.uid()));

-- Service Fields
DROP POLICY IF EXISTS "Super admins can manage service fields" ON service_fields;
DROP POLICY IF EXISTS "Admins can manage service fields" ON service_fields;
CREATE POLICY "Admins can manage service fields" ON service_fields
  FOR ALL
  USING (is_admin(auth.uid()));

