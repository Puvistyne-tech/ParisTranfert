-- Migration: Add image column to vehicle_types table
-- Run this script in Supabase SQL Editor to add image support to vehicle types

-- Add image column to vehicle_types table
ALTER TABLE vehicle_types 
ADD COLUMN IF NOT EXISTS image TEXT;

-- Update existing vehicle types with default images (optional)
-- Uncomment and modify these if you want to set default images for existing vehicles
-- UPDATE vehicle_types SET image = 'https://example.com/car.jpg' WHERE id = 'car';
-- UPDATE vehicle_types SET image = 'https://example.com/van.jpg' WHERE id = 'van';

