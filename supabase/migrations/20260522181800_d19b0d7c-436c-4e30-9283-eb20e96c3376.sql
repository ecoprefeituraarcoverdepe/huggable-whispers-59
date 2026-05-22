ALTER TABLE public.registrations 
ALTER COLUMN status SET DEFAULT 'Pendente'::registration_status;

ALTER TABLE public.registrations 
ALTER COLUMN created_at SET DEFAULT now();

ALTER TABLE public.registrations 
ALTER COLUMN updated_at SET DEFAULT now();