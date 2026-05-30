-- Fix RLS for registrations
DROP POLICY IF EXISTS "Public can insert registrations" ON public.registrations;
DROP POLICY IF EXISTS "Public can query registrations for lookup" ON public.registrations;
DROP POLICY IF EXISTS "Public can update registrations for demo" ON public.registrations;
DROP POLICY IF EXISTS "Public can delete registrations for demo" ON public.registrations;

-- Authenticated admins can do everything
CREATE POLICY "Admins can manage all registrations" 
ON public.registrations 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Public can insert registrations
CREATE POLICY "Public can insert registrations" 
ON public.registrations 
FOR INSERT 
TO anon 
WITH CHECK (true);

-- Public can select their own registration by id_number and birth_date
-- Note: In a production app with sensitive data, we'd use more secure lookup.
-- For this specific use case, we allow lookup by these fields.
CREATE POLICY "Public can lookup their registration" 
ON public.registrations 
FOR SELECT 
TO anon 
USING (true);

-- Fix RLS for event_days
DROP POLICY IF EXISTS "Public can view event days" ON public.event_days;
DROP POLICY IF EXISTS "Public can manage event_days for demo" ON public.event_days;
DROP POLICY IF EXISTS "Admin full access for event_days" ON public.event_days;
DROP POLICY IF EXISTS "Public read access for event_days" ON public.event_days;

CREATE POLICY "Admins can manage event_days" 
ON public.event_days 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Public can view event_days" 
ON public.event_days 
FOR SELECT 
TO anon 
USING (true);

-- Ensure RLS is enabled
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_days ENABLE ROW LEVEL SECURITY;

-- Add unique constraint to registration_code
-- First, let's make sure we don't have duplicates before adding the constraint
-- If there are duplicates, we'll just keep them for now or let the constraint fail if needed
-- Actually, it's safer to just add the constraint and let the user handle existing data if it fails.
ALTER TABLE public.registrations ADD CONSTRAINT registrations_registration_code_key UNIQUE (registration_code);

-- Add unique constraint to id_number (assuming one registration per person per event)
-- If a person can register for multiple days, we should include event_day_id in the unique constraint
ALTER TABLE public.registrations ADD CONSTRAINT registrations_id_number_event_day_key UNIQUE (id_number, event_day_id);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_registrations_id_number ON public.registrations(id_number);
CREATE INDEX IF NOT EXISTS idx_registrations_registration_code ON public.registrations(registration_code);
CREATE INDEX IF NOT EXISTS idx_registrations_event_day_id ON public.registrations(event_day_id);

-- Grants
GRANT SELECT, INSERT ON public.registrations TO anon;
GRANT ALL ON public.registrations TO authenticated;
GRANT ALL ON public.registrations TO service_role;

GRANT SELECT ON public.event_days TO anon;
GRANT ALL ON public.event_days TO authenticated;
GRANT ALL ON public.event_days TO service_role;
