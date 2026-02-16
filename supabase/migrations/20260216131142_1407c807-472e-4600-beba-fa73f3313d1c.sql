
-- Fix 1: Recreate induction_report_data view with security_invoker=on
DROP VIEW IF EXISTS public.induction_report_data;
CREATE VIEW public.induction_report_data
WITH (security_invoker=on) AS
SELECT i.id AS induction_id,
    p.address AS property_address,
    profiles.full_name AS landlord_name,
    i.created_at AS completion_date,
    i.gas_reading,
    i.electric_reading,
    i.water_reading,
    i.tenant_signature
FROM ((inductions i
    JOIN properties p ON ((i.property_id = p.id)))
    JOIN profiles ON ((i.user_id = profiles.id)));

-- Fix 2: Add RLS policies for action_alerts (no user_id column, so scope by property ownership)
-- action_alerts has property_id but no user_id, so we need to join through properties
ALTER TABLE public.action_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view alerts for their own properties"
  ON public.action_alerts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE properties.id = action_alerts.property_id
        AND properties.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create alerts for their own properties"
  ON public.action_alerts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE properties.id = action_alerts.property_id
        AND properties.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update alerts for their own properties"
  ON public.action_alerts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE properties.id = action_alerts.property_id
        AND properties.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete alerts for their own properties"
  ON public.action_alerts FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE properties.id = action_alerts.property_id
        AND properties.user_id = auth.uid()
    )
  );
