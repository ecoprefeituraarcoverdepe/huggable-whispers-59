DROP POLICY IF EXISTS "Public can insert registrations" ON public.registrations;
CREATE POLICY "Anyone can insert registrations"
ON public.registrations
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

GRANT INSERT ON public.registrations TO anon, authenticated;