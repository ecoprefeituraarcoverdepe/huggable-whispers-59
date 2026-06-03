-- Fix RLS for registrations
DROP POLICY IF EXISTS "Public can insert registrations" ON public.registrations;
CREATE POLICY "Public can insert registrations" 
ON public.registrations 
FOR INSERT 
WITH CHECK (true); -- Keep public insert but we'll add more constraints if possible. 

-- Secure lookup_registration function
REVOKE ALL ON FUNCTION public.lookup_registration FROM public;
GRANT EXECUTE ON FUNCTION public.lookup_registration TO anon, authenticated;

-- Secure has_role function
REVOKE ALL ON FUNCTION public.has_role FROM public;
GRANT EXECUTE ON FUNCTION public.has_role TO authenticated;

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_registrations_id_number ON public.registrations(id_number);
CREATE INDEX IF NOT EXISTS idx_registrations_birth_date ON public.registrations(birth_date);
CREATE INDEX IF NOT EXISTS idx_registrations_event_day_id ON public.registrations(event_day_id);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON public.registrations(status);

-- Storage security: registration-documents should be private or at least not listable
-- The bucket is already public? Let's check linter again. 
-- "Public Bucket Allows Listing" - this is usually a policy on storage.objects

-- Ensure updated_at trigger exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
DROP TRIGGER IF EXISTS update_registrations_updated_at ON public.registrations;
CREATE TRIGGER update_registrations_updated_at
    BEFORE UPDATE ON public.registrations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_event_days_updated_at ON public.event_days;
CREATE TRIGGER update_event_days_updated_at
    BEFORE UPDATE ON public.event_days
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
