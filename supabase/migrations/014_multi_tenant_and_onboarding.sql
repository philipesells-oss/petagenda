-- =============================================================================
-- Migration: 014_multi_tenant_and_onboarding.sql
-- Description: (1) tenant_memberships — allows one auth user to own multiple
--              tenants (e.g. two pet shops). (2) onboarding_emails — tracks
--              which lifecycle emails were sent per tenant so the daily cron
--              never sends duplicates.
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- tenant_memberships — secondary tenant links for multi-unit owners
-- The primary tenant is still tracked via public.users (1:1 schema untouched).
-- This table holds ADDITIONAL tenants for users who subscribe more than once.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tenant_memberships (
  auth_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id    UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  role         TEXT NOT NULL DEFAULT 'owner'
                    CHECK (role IN ('owner', 'admin', 'employee')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (auth_user_id, tenant_id)
);

CREATE INDEX IF NOT EXISTS idx_tenant_memberships_auth_user
  ON public.tenant_memberships(auth_user_id);

COMMENT ON TABLE public.tenant_memberships IS
  'Extra tenant associations for multi-unit owners. Primary tenant lives in public.users.';

-- -----------------------------------------------------------------------------
-- onboarding_emails — idempotency table for the daily onboarding cron
-- Records which email step (day1/day3/day7/day14/day30) was already sent
-- for each tenant so the cron never sends duplicates even if run twice.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.onboarding_emails (
  id        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID        NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  email_key TEXT        NOT NULL,   -- 'day1' | 'day3' | 'day7' | 'day14' | 'day30'
  sent_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, email_key)
);

CREATE INDEX IF NOT EXISTS idx_onboarding_emails_tenant
  ON public.onboarding_emails(tenant_id);

COMMENT ON TABLE public.onboarding_emails IS
  'Tracks sent onboarding lifecycle emails per tenant. Used by /api/cron/onboarding.';

COMMIT;
