
-- Create storage bucket for meter photos
INSERT INTO storage.buckets (id, name, public) VALUES ('meter-photos', 'meter-photos', true);

-- Allow authenticated users to upload their own photos
CREATE POLICY "Users can upload meter photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'meter-photos' AND auth.uid() IS NOT NULL);

-- Allow public read access
CREATE POLICY "Meter photos are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'meter-photos');

-- Allow users to update their own photos
CREATE POLICY "Users can update their own meter photos"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'meter-photos' AND auth.uid() IS NOT NULL);

-- Allow users to delete their own photos
CREATE POLICY "Users can delete their own meter photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'meter-photos' AND auth.uid() IS NOT NULL);
