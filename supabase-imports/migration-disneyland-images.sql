-- Migration: Add Disneyland image types to home_page_images table
-- This adds support for disneyland-promo and disneyland-page images

-- Update the CHECK constraint to allow new Disneyland types
ALTER TABLE home_page_images 
DROP CONSTRAINT IF EXISTS home_page_images_type_check;

ALTER TABLE home_page_images 
ADD CONSTRAINT home_page_images_type_check 
CHECK (type IN ('carousel', 'hero', 'services', 'vehicles', 'features', 'testimonials', 'disneyland-promo', 'disneyland-page'));

-- The existing RLS policies should already work for the new types
-- Public can view active images (already exists)
-- Admins can manage all images (already exists)
