
-- Tenancies table (periodic rolling tenancies per 2026 rules)
CREATE TABLE public.tenancies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  tenant_name TEXT NOT NULL,
  tenant_email TEXT,
  tenant_phone TEXT,
  start_date DATE NOT NULL,
  monthly_rent DECIMAL(12,2) NOT NULL,
  deposit_amount DECIMAL(12,2),
  deposit_scheme_ref TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tenancies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tenancies" ON public.tenancies FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own tenancies" ON public.tenancies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own tenancies" ON public.tenancies FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own tenancies" ON public.tenancies FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_tenancies_updated_at BEFORE UPDATE ON public.tenancies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Rent increases (once per 12 months, 2 months notice via Section 13)
CREATE TABLE public.rent_increases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenancy_id UUID NOT NULL REFERENCES public.tenancies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  current_rent DECIMAL(12,2) NOT NULL,
  new_rent DECIMAL(12,2) NOT NULL,
  notice_served_date DATE NOT NULL,
  effective_date DATE NOT NULL,
  section_13_generated BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.rent_increases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own rent increases" ON public.rent_increases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own rent increases" ON public.rent_increases FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own rent increases" ON public.rent_increases FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own rent increases" ON public.rent_increases FOR DELETE USING (auth.uid() = user_id);

-- Legal notices (Section 8 only - Section 21 abolished)
CREATE TABLE public.legal_notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenancy_id UUID NOT NULL REFERENCES public.tenancies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  notice_type TEXT NOT NULL CHECK (notice_type IN ('section_8', 'section_13')),
  grounds TEXT[],
  notice_date DATE NOT NULL,
  expiry_date DATE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'served', 'expired', 'actioned')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.legal_notices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own legal notices" ON public.legal_notices FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own legal notices" ON public.legal_notices FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own legal notices" ON public.legal_notices FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own legal notices" ON public.legal_notices FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_legal_notices_updated_at BEFORE UPDATE ON public.legal_notices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
