-- One-off fix if inserts/updates failed with:
--   ERROR 23514: violates check constraint "home_page_images_type_check"
-- Run this in Supabase SQL Editor, then retry the admin upload or run the full
-- migration-disneyland-hotels-and-page-slots.sql from section 2 onward if needed.

ALTER TABLE home_page_images
DROP CONSTRAINT IF EXISTS home_page_images_type_check;

ALTER TABLE home_page_images
ADD CONSTRAINT home_page_images_type_check
CHECK (type IN (
  'carousel', 'hero', 'services', 'vehicles', 'features', 'testimonials',
  'disneyland-promo',
  'disneyland-page',
  'disneyland-header', 'disneyland-content', 'disneyland-background',
  'disneyland-footer', 'disneyland-booking'
));
