
CREATE OR REPLACE FUNCTION public.increment_property_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.profiles
  SET property_count = COALESCE(property_count, 0) + 1
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_property_insert
AFTER INSERT ON public.properties
FOR EACH ROW
EXECUTE FUNCTION public.increment_property_count();

CREATE OR REPLACE FUNCTION public.decrement_property_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.profiles
  SET property_count = GREATEST(COALESCE(property_count, 0) - 1, 0)
  WHERE id = OLD.user_id;
  RETURN OLD;
END;
$$;

CREATE TRIGGER on_property_delete
AFTER DELETE ON public.properties
FOR EACH ROW
EXECUTE FUNCTION public.decrement_property_count();
