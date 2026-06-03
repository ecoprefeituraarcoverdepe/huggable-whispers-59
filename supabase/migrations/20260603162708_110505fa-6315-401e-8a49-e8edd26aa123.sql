
-- Restrict registration-documents bucket reads to admins only.
-- The bucket has been switched to private; public URLs no longer work.
DROP POLICY IF EXISTS "Public can view document if they have the link" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage all documents" ON storage.objects;
DROP POLICY IF EXISTS "Public can upload documents" ON storage.objects;

CREATE POLICY "Anyone can upload registration documents"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'registration-documents');

CREATE POLICY "Admins can read registration documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'registration-documents'
    AND public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can update registration documents"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'registration-documents'
    AND public.has_role(auth.uid(), 'admin')
  )
  WITH CHECK (
    bucket_id = 'registration-documents'
    AND public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can delete registration documents"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'registration-documents'
    AND public.has_role(auth.uid(), 'admin')
  );
