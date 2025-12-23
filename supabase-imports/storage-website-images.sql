-- Storage Bucket Setup for Website Images (Carousel, Hero, etc.)
-- 
-- IMPORTANT: Before running this script, create the storage bucket manually:
-- 1. Go to Supabase Dashboard > Storage
-- 2. Click "New bucket"
-- 3. Set bucket name: "website-images"
-- 4. Make it public (toggle "Public bucket")
-- 5. Set file size limit: 5242880 (5MB)
-- 6. Set allowed MIME types: image/jpeg, image/jpg, image/png, image/webp
--
-- Then run this script to set up the storage policies.

-- Note: The bucket creation via SQL may not work in all Supabase setups.
-- If the INSERT below fails, create the bucket manually via the dashboard.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'website-images',
  'website-images',
  true, -- Public bucket for read access
  5242880, -- 5MB file size limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for website-images bucket

-- Allow public read access (for displaying images)
DROP POLICY IF EXISTS "Public can view website images" ON storage.objects;
CREATE POLICY "Public can view website images"
ON storage.objects FOR SELECT
USING (bucket_id = 'website-images');

-- Allow admins to upload images
DROP POLICY IF EXISTS "Admins can upload website images" ON storage.objects;
CREATE POLICY "Admins can upload website images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'website-images' 
  AND is_admin(auth.uid())
);

-- Allow admins to update/delete images
DROP POLICY IF EXISTS "Admins can update website images" ON storage.objects;
CREATE POLICY "Admins can update website images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'website-images' 
  AND is_admin(auth.uid())
)
WITH CHECK (
  bucket_id = 'website-images' 
  AND is_admin(auth.uid())
);

DROP POLICY IF EXISTS "Admins can delete website images" ON storage.objects;
CREATE POLICY "Admins can delete website images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'website-images' 
  AND is_admin(auth.uid())
);

