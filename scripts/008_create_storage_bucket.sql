-- Create storage bucket for marketplace assets
-- This should be run in the Supabase SQL editor

-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'marketplace-assets',
  'marketplace-assets',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp', 'image/gif']
);

-- Create RLS policies for the bucket
CREATE POLICY "Allow public read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'marketplace-assets');

CREATE POLICY "Allow admin upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'marketplace-assets' 
    AND auth.uid() IN (
      SELECT id FROM public.users WHERE role = 'admin'
    )
  );

CREATE POLICY "Allow admin update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'marketplace-assets' 
    AND auth.uid() IN (
      SELECT id FROM public.users WHERE role = 'admin'
    )
  );

CREATE POLICY "Allow admin delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'marketplace-assets' 
    AND auth.uid() IN (
      SELECT id FROM public.users WHERE role = 'admin'
    )
  );
