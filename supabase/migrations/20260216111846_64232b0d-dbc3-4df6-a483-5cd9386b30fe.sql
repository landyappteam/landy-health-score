
-- Maintenance requests table
CREATE TABLE public.maintenance_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  issue_type TEXT NOT NULL CHECK (issue_type IN ('damp_mould', 'plumbing', 'electrical', 'structural', 'pest', 'other')),
  description TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'emergency')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'escalated')),
  photo_urls TEXT[] DEFAULT '{}',
  remedial_deadline DATE,
  resolved_at TIMESTAMPTZ,
  reported_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.maintenance_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own maintenance requests" ON public.maintenance_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own maintenance requests" ON public.maintenance_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own maintenance requests" ON public.maintenance_requests FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own maintenance requests" ON public.maintenance_requests FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_maintenance_requests_updated_at BEFORE UPDATE ON public.maintenance_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Communication logs (immutable - no UPDATE or DELETE allowed)
CREATE TABLE public.communication_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  tenant_name TEXT NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('email', 'sms', 'phone', 'in_person', 'letter', 'other')),
  summary TEXT NOT NULL,
  related_request_id UUID REFERENCES public.maintenance_requests(id) ON DELETE SET NULL,
  logged_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.communication_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own communication logs" ON public.communication_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own communication logs" ON public.communication_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
-- No UPDATE or DELETE policies — immutable audit trail
