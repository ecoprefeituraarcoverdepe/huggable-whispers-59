ALTER TABLE public.registrations DROP CONSTRAINT IF EXISTS registrations_id_number_key;
ALTER TABLE public.registrations DROP CONSTRAINT IF EXISTS registrations_registration_code_key;

-- Garantir que a restrição de (id_number, event_day_id) existe para evitar inscrições duplicadas no MESMO dia
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'registrations_id_number_event_day_key') THEN
        ALTER TABLE public.registrations ADD CONSTRAINT registrations_id_number_event_day_key UNIQUE (id_number, event_day_id);
    END IF;
END $$;
