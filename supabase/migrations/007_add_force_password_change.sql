-- =============================================================================
-- Migration: 007_add_force_password_change.sql
-- Description: Adds force_password_change flag to users table.
--              Set to TRUE when account is provisioned via Stripe webhook so
--              the user is forced to create their own password on first login.
-- =============================================================================

BEGIN;

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS force_password_change BOOLEAN DEFAULT false NOT NULL;

COMMENT ON COLUMN public.users.force_password_change IS
  'When TRUE, middleware redirects the user to /first-access to set a new password.';

COMMIT;
