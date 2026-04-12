-- Migration: Disneyland hotels table + structured Disneyland page image types
-- Run in Supabase SQL Editor after prior home_page_images migrations.
--
-- IMPORTANT: The CHECK constraint must be widened BEFORE any UPDATE that sets
-- type to disneyland-header (etc.). Otherwise you get:
--   ERROR 23514: new row violates check constraint "home_page_images_type_check"

-- =============================================================================
-- 1) Widen CHECK constraint first (include legacy `disneyland-page` + new slots)
-- =============================================================================
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

-- =============================================================================
-- 2) Remap legacy disneyland-page rows (old convention: 0 hero, 1-4 … 9 booking)
-- =============================================================================
UPDATE home_page_images SET type = 'disneyland-header'
WHERE type = 'disneyland-page' AND COALESCE(display_order, 0) = 0;

UPDATE home_page_images SET type = 'disneyland-booking'
WHERE type = 'disneyland-page' AND COALESCE(display_order, 0) = 9;

UPDATE home_page_images SET type = 'disneyland-content'
WHERE type = 'disneyland-page' AND COALESCE(display_order, 0) BETWEEN 1 AND 4;

UPDATE home_page_images SET type = 'disneyland-background'
WHERE type = 'disneyland-page' AND COALESCE(display_order, 0) BETWEEN 5 AND 6;

UPDATE home_page_images SET type = 'disneyland-footer'
WHERE type = 'disneyland-page' AND COALESCE(display_order, 0) BETWEEN 7 AND 8;

UPDATE home_page_images SET type = 'disneyland-content'
WHERE type = 'disneyland-page';

-- =============================================================================
-- 3) Tighten CHECK: drop legacy type name (no rows should still use it)
-- =============================================================================
ALTER TABLE home_page_images
DROP CONSTRAINT IF EXISTS home_page_images_type_check;

ALTER TABLE home_page_images
ADD CONSTRAINT home_page_images_type_check
CHECK (type IN (
  'carousel', 'hero', 'services', 'vehicles', 'features', 'testimonials',
  'disneyland-promo',
  'disneyland-header', 'disneyland-content', 'disneyland-background',
  'disneyland-footer', 'disneyland-booking'
));

-- =============================================================================
-- 4) Disneyland hotels table + RLS
-- =============================================================================
CREATE TABLE IF NOT EXISTS disneyland_hotels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description_i18n JSONB DEFAULT '{}'::jsonb,
  image_url TEXT NOT NULL,
  google_maps_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_disneyland_hotels_active_order
  ON disneyland_hotels(is_active, display_order);

CREATE OR REPLACE FUNCTION update_disneyland_hotels_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_disneyland_hotels_updated_at ON disneyland_hotels;
CREATE TRIGGER trigger_update_disneyland_hotels_updated_at
  BEFORE UPDATE ON disneyland_hotels
  FOR EACH ROW
  EXECUTE FUNCTION update_disneyland_hotels_updated_at();

ALTER TABLE disneyland_hotels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active disneyland hotels" ON disneyland_hotels;
CREATE POLICY "Public can view active disneyland hotels"
  ON disneyland_hotels FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage disneyland hotels" ON disneyland_hotels;
CREATE POLICY "Admins can manage disneyland hotels"
  ON disneyland_hotels FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));
