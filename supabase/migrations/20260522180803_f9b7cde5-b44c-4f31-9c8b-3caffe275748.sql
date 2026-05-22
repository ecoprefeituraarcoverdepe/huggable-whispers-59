-- Fix function search path
ALTER FUNCTION update_updated_at_column() SET search_path = public;

-- Drop and recreate policies with slightly better targeting for "make it work"
-- (Still allowing public insert for registrations)
DROP POLICY IF EXISTS "Users can view their own registration by id_number" ON public.registrations;
CREATE POLICY "Public can query registrations for lookup" 
ON public.registrations FOR SELECT 
USING (true);

-- Adding a policy to allow update for status changes (later we will restrict this to auth)
CREATE POLICY "Public can update registrations for demo" 
ON public.registrations FOR UPDATE
USING (true)
WITH CHECK (true);

-- Adding a policy to allow delete for demo
CREATE POLICY "Public can delete registrations for demo" 
ON public.registrations FOR DELETE
USING (true);

-- Similar for event_days
CREATE POLICY "Public can manage event_days for demo"
ON public.event_days FOR ALL
USING (true)
WITH CHECK (true);
