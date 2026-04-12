-- Optional Google Maps URL + physical address for disneyland_hotels
-- Run in Supabase SQL Editor after disneyland_hotels exists.

ALTER TABLE disneyland_hotels
  ADD COLUMN IF NOT EXISTS address TEXT;

ALTER TABLE disneyland_hotels
  ALTER COLUMN google_maps_url DROP NOT NULL;

-- Existing rows keep their URL; NULL allowed for new rows.
