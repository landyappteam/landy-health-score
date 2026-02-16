
-- Make meter-photos bucket private
UPDATE storage.buckets SET public = false WHERE id = 'meter-photos';

-- Drop the public read policy
DROP POLICY IF EXISTS "Meter photos are publicly accessible" ON storage.objects;

-- Add authenticated read policy scoped to user's own uploads
CREATE POLICY "Users can view their own meter photos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'meter-photos' 
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
