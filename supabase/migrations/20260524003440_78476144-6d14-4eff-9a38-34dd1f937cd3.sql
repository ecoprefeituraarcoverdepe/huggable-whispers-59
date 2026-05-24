-- Alter column date to text to support flexible formats like "22/06"
ALTER TABLE public.event_days ALTER COLUMN date TYPE TEXT;

-- Enable RLS
ALTER TABLE public.event_days ENABLE ROW LEVEL SECURITY;

-- Policies for event_days
CREATE POLICY "Public read access for event_days"
ON public.event_days FOR SELECT
USING (true);

CREATE POLICY "Admin full access for event_days"
ON public.event_days FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Insert initial data again with the correct format
INSERT INTO public.event_days (date, description) VALUES 
('21/06', '{"weekday": "Sábado", "totalSpots": 100, "attractions": ["Calcinha Preta", "João Gomes"], "image": "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=400&auto=format&fit=crop"}'),
('22/06', '{"weekday": "Domingo", "totalSpots": 100, "attractions": ["Wesley Safadão", "Mari Fernandez"], "image": "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=400&auto=format&fit=crop"}'),
('23/06', '{"weekday": "Segunda", "totalSpots": 100, "attractions": ["Nattanzinho", "Henry Freitas"], "image": "https://images.unsplash.com/photo-1459749411177-042180ce673c?q=80&w=400&auto=format&fit=crop"}'),
('24/06', '{"weekday": "Terça", "totalSpots": 100, "attractions": ["Zé Vaqueiro", "Iguinho e Lulinha"], "image": "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=400&auto=format&fit=crop"}');