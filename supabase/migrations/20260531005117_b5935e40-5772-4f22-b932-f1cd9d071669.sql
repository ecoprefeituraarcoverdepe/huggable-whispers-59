
-- 1. Roles infrastructure
CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- Grant admin role to existing admin user
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE email = 'megawinoffic@hotmail.com'
ON CONFLICT DO NOTHING;

-- 2. Tighten registrations policies
DROP POLICY IF EXISTS "Public can lookup their registration" ON public.registrations;
DROP POLICY IF EXISTS "Admins can manage all registrations" ON public.registrations;

CREATE POLICY "Admins can select registrations"
  ON public.registrations FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update registrations"
  ON public.registrations FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete registrations"
  ON public.registrations FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Secure lookup function for anonymous consultation
CREATE OR REPLACE FUNCTION public.lookup_registration(
  _id_number TEXT,
  _birth_date DATE
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  email TEXT,
  phone TEXT,
  mobile TEXT,
  id_number TEXT,
  birth_date DATE,
  category TEXT,
  has_companion BOOLEAN,
  address_cep TEXT,
  address_street TEXT,
  address_number TEXT,
  address_neighborhood TEXT,
  address_city TEXT,
  address_state TEXT,
  status TEXT,
  created_at TIMESTAMPTZ,
  event_day_id UUID,
  registration_code TEXT
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    r.id, r.name, r.email, r.phone, r.mobile,
    r.id_number, r.birth_date, r.category, r.has_companion,
    r.address_cep, r.address_street, r.address_number,
    r.address_neighborhood, r.address_city, r.address_state,
    r.status::TEXT, r.created_at, r.event_day_id, r.registration_code
  FROM public.registrations r
  WHERE r.id_number = _id_number
    AND r.birth_date = _birth_date
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.lookup_registration(TEXT, DATE) TO anon, authenticated;

-- 3. Tighten event_days policies
DROP POLICY IF EXISTS "Admins can manage event_days" ON public.event_days;

CREATE POLICY "Admins can insert event_days"
  ON public.event_days FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update event_days"
  ON public.event_days FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete event_days"
  ON public.event_days FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 4. Storage policies: remove public listing; public URL access still works for public buckets
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Public can view event images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage event images" ON storage.objects;
DROP POLICY IF EXISTS "Admin Upload" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete" ON storage.objects;

CREATE POLICY "Admins can upload event images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'event-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update event images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'event-images' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'event-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete event images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'event-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can list event images"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'event-images' AND public.has_role(auth.uid(), 'admin'));
