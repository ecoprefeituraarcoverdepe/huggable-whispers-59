CREATE POLICY "Public Access to assets" ON storage.objects FOR SELECT USING (bucket_id = 'assets');
GRANT SELECT ON storage.objects TO anon, authenticated;