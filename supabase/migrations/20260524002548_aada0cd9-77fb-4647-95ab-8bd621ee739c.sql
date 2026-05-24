-- Create a bucket for event images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('event-images', 'event-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow anyone to view images
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'event-images');

-- Policy to allow authenticated users to upload images
CREATE POLICY "Admin Upload" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'event-images' AND auth.role() = 'authenticated');

-- Policy to allow authenticated users to update images
CREATE POLICY "Admin Update" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'event-images' AND auth.role() = 'authenticated');

-- Policy to allow authenticated users to delete images
CREATE POLICY "Admin Delete" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'event-images' AND auth.role() = 'authenticated');