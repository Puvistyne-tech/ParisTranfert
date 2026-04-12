-- Extended metadata for disneyland_hotels (stars, tags, website, price tier)
-- Run in Supabase SQL Editor after disneyland_hotels exists.

ALTER TABLE disneyland_hotels
  ADD COLUMN IF NOT EXISTS star_rating SMALLINT;

ALTER TABLE disneyland_hotels
  ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}';

ALTER TABLE disneyland_hotels
  ADD COLUMN IF NOT EXISTS hotel_website_url TEXT;

ALTER TABLE disneyland_hotels
  ADD COLUMN IF NOT EXISTS price_range SMALLINT;

ALTER TABLE disneyland_hotels
  ADD COLUMN IF NOT EXISTS price_currency TEXT NOT NULL DEFAULT 'eur';

ALTER TABLE disneyland_hotels
  DROP CONSTRAINT IF EXISTS disneyland_hotels_star_rating_check;

ALTER TABLE disneyland_hotels
  ADD CONSTRAINT disneyland_hotels_star_rating_check
  CHECK (star_rating IS NULL OR (star_rating >= 1 AND star_rating <= 5));

ALTER TABLE disneyland_hotels
  DROP CONSTRAINT IF EXISTS disneyland_hotels_price_range_check;

ALTER TABLE disneyland_hotels
  ADD CONSTRAINT disneyland_hotels_price_range_check
  CHECK (price_range IS NULL OR (price_range >= 1 AND price_range <= 4));

ALTER TABLE disneyland_hotels
  DROP CONSTRAINT IF EXISTS disneyland_hotels_price_currency_check;

ALTER TABLE disneyland_hotels
  ADD CONSTRAINT disneyland_hotels_price_currency_check
  CHECK (price_currency IN ('eur', 'usd'));
