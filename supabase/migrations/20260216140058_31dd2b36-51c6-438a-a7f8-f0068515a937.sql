
-- Add optional end_date to tenancies for historical record-keeping
ALTER TABLE public.tenancies ADD COLUMN IF NOT EXISTS end_date date DEFAULT NULL;
