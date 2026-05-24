-- Adiciona a coluna registration_code à tabela registrations
ALTER TABLE public.registrations 
ADD COLUMN IF NOT EXISTS registration_code TEXT;

-- Opcional: Gerar códigos para registros existentes que não possuem
UPDATE public.registrations 
SET registration_code = UPPER(SUBSTRING(MD5(id::text) FROM 1 FOR 8))
WHERE registration_code IS NULL;