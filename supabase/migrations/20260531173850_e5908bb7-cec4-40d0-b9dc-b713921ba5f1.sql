DROP POLICY IF EXISTS "Public can view event_days" ON public.event_days;

CREATE POLICY "Anyone can view event_days"
ON public.event_days
FOR SELECT
TO anon, authenticated
USING (true);

GRANT SELECT ON public.event_days TO anon, authenticated;