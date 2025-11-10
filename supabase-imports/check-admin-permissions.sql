-- Diagnostic script to check admin permissions
-- Run this in Supabase SQL Editor to verify your setup

-- 1. Check if helper functions exist
SELECT 
  proname as function_name,
  prosrc as function_body
FROM pg_proc
WHERE proname IN ('is_admin');

-- 2. Check current user's role (replace with your user ID)
-- Get your user ID from: SELECT id, email, raw_user_meta_data FROM auth.users;
SELECT 
  id,
  email,
  raw_user_meta_data->>'role' as role,
  raw_user_meta_data
FROM auth.users
WHERE email = 'puvistiene@gmail.com'; -- Replace with your email

-- 3. Check if policies exist for service_vehicle_pricing
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'service_vehicle_pricing'
ORDER BY policyname;

-- 4. Test if is_admin function works (replace with your user ID)
-- SELECT is_admin('your-user-id-here'::UUID);

-- 5. Check RLS status
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'service_vehicle_pricing';

