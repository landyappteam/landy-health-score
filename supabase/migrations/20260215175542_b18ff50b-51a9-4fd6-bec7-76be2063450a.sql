
-- Create inductions table linked to properties
CREATE TABLE public.inductions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  
  -- Step 1: Physical readings
  gas_meter_reading TEXT,
  gas_meter_photo_url TEXT,
  electric_meter_reading TEXT,
  electric_meter_photo_url TEXT,
  water_meter_reading TEXT,
  water_meter_photo_url TEXT,
  smoke_alarms_tested BOOLEAN NOT NULL DEFAULT false,
  stopcock_located BOOLEAN NOT NULL DEFAULT false,
  
  -- Step 2: Document confirmations
  gas_safety_received BOOLEAN NOT NULL DEFAULT false,
  epc_received BOOLEAN NOT NULL DEFAULT false,
  eicr_received BOOLEAN NOT NULL DEFAULT false,
  how_to_rent_received BOOLEAN NOT NULL DEFAULT false,
  gov_info_sheet_received BOOLEAN NOT NULL DEFAULT false,
  
  -- Step 3: Sign-off
  tenant_signature TEXT,
  
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.inductions ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own inductions"
  ON public.inductions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own inductions"
  ON public.inductions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own inductions"
  ON public.inductions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own inductions"
  ON public.inductions FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_inductions_updated_at
  BEFORE UPDATE ON public.inductions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
