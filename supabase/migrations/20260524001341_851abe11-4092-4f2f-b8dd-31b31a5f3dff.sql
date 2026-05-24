-- Add event_day_id to registrations
ALTER TABLE public.registrations 
ADD COLUMN event_day_id UUID REFERENCES public.event_days(id) ON DELETE SET NULL;

-- Create an index for performance
CREATE INDEX idx_registrations_event_day_id ON public.registrations(event_day_id);
