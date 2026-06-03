ALTER TABLE public.registrations ADD COLUMN address_reference_point TEXT;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.registrations TO authenticated;
GRANT SELECT, INSERT ON public.registrations TO anon;
GRANT ALL ON public.registrations TO service_role;