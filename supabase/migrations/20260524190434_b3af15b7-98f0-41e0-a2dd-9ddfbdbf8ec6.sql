-- Garante que não existam duplicatas antes de aplicar a restrição (backup check)
DELETE FROM public.registrations 
WHERE id IN (
    SELECT id 
    FROM (
        SELECT id, 
               ROW_NUMBER() OVER (PARTITION BY id_number ORDER BY created_at DESC) as row_num 
        FROM public.registrations
    ) t 
    WHERE row_num > 1
);

-- Adiciona a restrição de unicidade
ALTER TABLE public.registrations 
ADD CONSTRAINT registrations_id_number_key UNIQUE (id_number);