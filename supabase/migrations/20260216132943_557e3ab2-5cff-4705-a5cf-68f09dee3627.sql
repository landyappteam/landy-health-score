
-- Fix mutable search_path on handle_electric_only_compliance function
CREATE OR REPLACE FUNCTION public.handle_electric_only_compliance()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF (SELECT has_gas_supply FROM properties WHERE id = NEW.property_id) = false THEN
    NEW.is_gas_applicable := false;
    NEW.gas_reading := 'N/A - Electric Only';
  END IF;
  RETURN NEW;
END;
$function$;
