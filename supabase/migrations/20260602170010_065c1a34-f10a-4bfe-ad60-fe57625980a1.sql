-- Add new columns for transportation and emergency contact
ALTER TABLE public.registrations 
ADD COLUMN needs_transportation BOOLEAN DEFAULT FALSE,
ADD COLUMN emergency_phone TEXT,
ADD COLUMN companion_name TEXT,
ADD COLUMN companion_phone TEXT;

-- Make address columns nullable since they are now optional based on transportation needs
ALTER TABLE public.registrations 
ALTER COLUMN address_cep DROP NOT NULL,
ALTER COLUMN address_city DROP NOT NULL,
ALTER COLUMN address_neighborhood DROP NOT NULL,
ALTER COLUMN address_number DROP NOT NULL,
ALTER COLUMN address_state DROP NOT NULL,
ALTER COLUMN address_street DROP NOT NULL;
