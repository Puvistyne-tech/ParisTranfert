-- Migration: Add quote_requested status to reservation_status_enum
-- This migration adds the new 'quote_requested' status to the existing enum

-- Add the new enum value
ALTER TYPE reservation_status_enum ADD VALUE IF NOT EXISTS 'quote_requested';

-- Note: PostgreSQL doesn't support removing enum values, so we're only adding
-- The enum now supports: 'quote_requested', 'pending', 'quote_sent', 'quote_accepted', 'confirmed', 'completed', 'cancelled'

