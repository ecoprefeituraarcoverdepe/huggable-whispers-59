CREATE POLICY "Allow public read on public-assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'public-assets');

GRANT SELECT ON storage.objects TO anon, authenticated;