DROP FUNCTION IF EXISTS public.lookup_registration(text, date);

CREATE OR REPLACE FUNCTION public.lookup_registration(_id_number text, _birth_date date)
 RETURNS TABLE(
    id uuid,
    name text,
    email text,
    phone text,
    mobile text,
    id_number text,
    birth_date date,
    category text,
    has_companion boolean,
    companion_name text,
    companion_phone text,
    emergency_phone text,
    needs_transportation boolean,
    address_cep text,
    address_street text,
    address_number text,
    address_neighborhood text,
    address_city text,
    address_state text,
    reference_point text,
    status registration_status,
    created_at timestamptz,
    event_day_id uuid,
    registration_code text,
    document_url text,
    disability_code text,
    pcd_name text
 )
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.name,
    r.email,
    r.phone,
    r.mobile,
    r.id_number,
    r.birth_date,
    r.category,
    r.has_companion,
    r.companion_name,
    r.companion_phone,
    r.emergency_phone,
    r.needs_transportation,
    r.address_cep,
    r.address_street,
    r.address_number,
    r.address_neighborhood,
    r.address_city,
    r.address_state,
    r.reference_point,
    r.status,
    r.created_at,
    r.event_day_id,
    r.registration_code,
    r.document_url,
    r.disability_code,
    r.pcd_name
  FROM registrations r
  WHERE r.id_number = _id_number 
    AND r.birth_date = _birth_date
  LIMIT 1;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.lookup_registration TO anon, authenticated;
