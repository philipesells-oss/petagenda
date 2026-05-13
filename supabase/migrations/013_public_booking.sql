-- Public Booking — tenant-level toggle + booking page settings.
-- Existing tenants start with public booking DISABLED (opt-in).

ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS public_booking_enabled  BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS booking_instructions    TEXT;

-- Allow service role to read/update these columns (already covered by
-- the service_role bypass policies in migrations 001–012, but documented here
-- for clarity).

COMMENT ON COLUMN public.tenants.public_booking_enabled IS
  'When true, the tenant has a public /book/[slug] booking page.';
COMMENT ON COLUMN public.tenants.booking_instructions IS
  'Optional message shown on the public booking page (e.g. "Ligar 30min antes").';
