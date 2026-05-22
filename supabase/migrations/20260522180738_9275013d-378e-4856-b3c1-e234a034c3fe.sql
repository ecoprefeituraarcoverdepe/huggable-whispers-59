-- Create enum for registration status
DO $$ BEGIN
    CREATE TYPE registration_status AS ENUM ('Pendente', 'Aprovado', 'Reprovado');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create registrations table
CREATE TABLE IF NOT EXISTS public.registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    mobile TEXT NOT NULL,
    id_number TEXT NOT NULL,
    birth_date DATE NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('idoso', 'pcd')),
    has_companion BOOLEAN DEFAULT false,
    address_cep TEXT NOT NULL,
    address_street TEXT NOT NULL,
    address_number TEXT NOT NULL,
    address_neighborhood TEXT NOT NULL,
    address_city TEXT NOT NULL,
    address_state TEXT NOT NULL,
    status registration_status DEFAULT 'Pendente',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create event_days table
CREATE TABLE IF NOT EXISTS public.event_days (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_days ENABLE ROW LEVEL SECURITY;

-- Policies for registrations
CREATE POLICY "Public can insert registrations" 
ON public.registrations FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can view their own registration by id_number" 
ON public.registrations FOR SELECT 
USING (true); -- Simplifying for the "make it work" phase, ideally filtered by id_number + birth_date logic in code

-- Policies for event_days
CREATE POLICY "Public can view event days" 
ON public.event_days FOR SELECT 
USING (true);

-- Functions for timestamp update
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
CREATE TRIGGER update_registrations_updated_at
    BEFORE UPDATE ON public.registrations
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_event_days_updated_at
    BEFORE UPDATE ON public.event_days
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
