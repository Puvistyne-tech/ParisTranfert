-- Migration: Update home_page_images table to support new section background images
-- This adds support for services, vehicles, features, and testimonials background images

-- Update the CHECK constraint to allow new types
ALTER TABLE home_page_images 
DROP CONSTRAINT IF EXISTS home_page_images_type_check;

ALTER TABLE home_page_images 
ADD CONSTRAINT home_page_images_type_check 
CHECK (type IN ('carousel', 'hero', 'services', 'vehicles', 'features', 'testimonials'));

-- Update RLS policy to allow public read access for all active images (not just carousel/hero)
-- The existing policy should already work, but we'll ensure it's correct
DROP POLICY IF EXISTS "Public can view active home page images" ON home_page_images;
CREATE POLICY "Public can view active home page images"
ON home_page_images FOR SELECT
USING (is_active = true);

