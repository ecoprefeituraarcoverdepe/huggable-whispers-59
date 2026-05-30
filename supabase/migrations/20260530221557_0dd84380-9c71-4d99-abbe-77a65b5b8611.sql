-- Create storage bucket for event images if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('event-images', 'event-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policy for public to view images
CREATE POLICY "Public can view event images" 
ON storage.objects 
FOR SELECT 
TO public 
USING (bucket_id = 'event-images');

-- Policy for authenticated users to manage images
CREATE POLICY "Admins can manage event images" 
ON storage.objects 
FOR ALL 
TO authenticated 
USING (bucket_id = 'event-images')
WITH CHECK (bucket_id = 'event-images');
