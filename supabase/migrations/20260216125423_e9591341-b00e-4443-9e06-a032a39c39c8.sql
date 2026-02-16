
-- Update existing upload/update/delete policies to use user-scoped paths
DROP POLICY IF EXISTS "Authenticated users can upload meter photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own meter photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own meter photos" ON storage.objects;

CREATE POLICY "Authenticated users can upload meter photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'meter-photos'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update their own meter photos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'meter-photos'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their own meter photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'meter-photos'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
