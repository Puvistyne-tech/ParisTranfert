-- Migration: Add home_page_images table
-- This table manages images for the home page (carousel and hero images)

CREATE TABLE IF NOT EXISTS home_page_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL CHECK (type IN ('carousel', 'hero')),
    image_url TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_home_page_images_type ON home_page_images(type);
CREATE INDEX IF NOT EXISTS idx_home_page_images_type_active ON home_page_images(type, is_active);
CREATE INDEX IF NOT EXISTS idx_home_page_images_display_order ON home_page_images(type, display_order);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_home_page_images_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_home_page_images_updated_at ON home_page_images;
CREATE TRIGGER trigger_update_home_page_images_updated_at
    BEFORE UPDATE ON home_page_images
    FOR EACH ROW
    EXECUTE FUNCTION update_home_page_images_updated_at();

-- RLS Policies
ALTER TABLE home_page_images ENABLE ROW LEVEL SECURITY;

-- Allow public read access for active images
DROP POLICY IF EXISTS "Public can view active home page images" ON home_page_images;
CREATE POLICY "Public can view active home page images"
ON home_page_images FOR SELECT
USING (is_active = true);

-- Allow admins full access
DROP POLICY IF EXISTS "Admins can manage home page images" ON home_page_images;
CREATE POLICY "Admins can manage home page images"
ON home_page_images FOR ALL
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

