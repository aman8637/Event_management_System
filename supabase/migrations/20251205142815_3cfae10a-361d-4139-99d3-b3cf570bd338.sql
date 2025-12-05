-- Fix function search path for generate_membership_number
CREATE OR REPLACE FUNCTION public.generate_membership_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_number TEXT;
  counter INT;
BEGIN
  SELECT COUNT(*) + 1 INTO counter FROM public.memberships;
  new_number := 'MEM' || LPAD(counter::TEXT, 6, '0');
  RETURN new_number;
END;
$$;