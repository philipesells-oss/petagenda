-- =============================================================================
-- Migration: 004_create_triggers.sql
-- Story: 1.2 — Schema do Banco de Dados e Migrações
-- Agent: @data-engineer (Dara)
-- Description: Trigger functions (updated_at, client metrics, auto-tagging)
--              plus the handle_new_user() bridge between auth.users and
--              public.tenants / public.users.
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- update_updated_at() — generic BEFORE UPDATE trigger for updated_at columns
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Apply updated_at triggers on every relevant table.
DROP TRIGGER IF EXISTS tr_tenants_updated ON public.tenants;
CREATE TRIGGER tr_tenants_updated
  BEFORE UPDATE ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS tr_users_updated ON public.users;
CREATE TRIGGER tr_users_updated
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS tr_clients_updated ON public.clients;
CREATE TRIGGER tr_clients_updated
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS tr_pets_updated ON public.pets;
CREATE TRIGGER tr_pets_updated
  BEFORE UPDATE ON public.pets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS tr_services_updated ON public.services;
CREATE TRIGGER tr_services_updated
  BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS tr_appointments_updated ON public.appointments;
CREATE TRIGGER tr_appointments_updated
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS tr_business_hours_updated ON public.business_hours;
CREATE TRIGGER tr_business_hours_updated
  BEFORE UPDATE ON public.business_hours
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- -----------------------------------------------------------------------------
-- update_client_metrics() — bump totals when an appointment is marked completed
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_client_metrics()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') THEN
    UPDATE public.clients
    SET
      total_spent    = total_spent + NEW.price,
      visit_count    = visit_count + 1,
      last_visit_at  = NOW(),
      status         = 'active',
      inactive_since = NULL
    WHERE id = NEW.client_id;

    -- Stamp completed_at on the appointment itself (defensive)
    IF NEW.completed_at IS NULL THEN
      NEW.completed_at = NOW();
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- NOTE: BEFORE UPDATE so we can also set completed_at atomically.
DROP TRIGGER IF EXISTS tr_appointment_completed ON public.appointments;
CREATE TRIGGER tr_appointment_completed
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_client_metrics();

-- -----------------------------------------------------------------------------
-- auto_tag_client() — maintain ['vip', 'novo', 'atrasado', 'inativo'] tags
-- Runs BEFORE UPDATE so tag array is recomputed on every metric change.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.auto_tag_client()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  new_tags TEXT[];
BEGIN
  -- Start from the incoming tags array, stripped of the auto-managed labels
  -- so we can re-apply them deterministically.
  new_tags := COALESCE(NEW.tags, '{}'::text[]);
  new_tags := array_remove(new_tags, 'vip');
  new_tags := array_remove(new_tags, 'novo');
  new_tags := array_remove(new_tags, 'atrasado');
  new_tags := array_remove(new_tags, 'inativo');

  -- VIP: >= R$500 spent OR >= 10 visits
  IF NEW.total_spent >= 500 OR NEW.visit_count >= 10 THEN
    new_tags := array_append(new_tags, 'vip');
  END IF;

  -- Novo: 0 or 1 visits
  IF NEW.visit_count <= 1 THEN
    new_tags := array_append(new_tags, 'novo');
  END IF;

  -- Inativo: explicit inactive status
  IF NEW.status = 'inactive' THEN
    new_tags := array_append(new_tags, 'inativo');
  ELSIF NEW.last_visit_at IS NOT NULL
    AND NEW.last_visit_at < NOW() - INTERVAL '15 days'
    AND NEW.last_visit_at >= NOW() - INTERVAL '30 days' THEN
    -- Atrasado: 15-30 days since last visit
    new_tags := array_append(new_tags, 'atrasado');
  END IF;

  NEW.tags := new_tags;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_auto_tag_client ON public.clients;
CREATE TRIGGER tr_auto_tag_client
  BEFORE INSERT OR UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.auto_tag_client();

-- -----------------------------------------------------------------------------
-- handle_new_user() — create tenant + user profile after auth.users insert
-- SECURITY DEFINER so it can INSERT into public.tenants without RLS blocking.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tenant_id UUID;
  v_shop_name TEXT;
  v_slug      TEXT;
  v_suffix    TEXT;
BEGIN
  v_shop_name := COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'shop_name', ''), 'Meu Pet Shop');

  -- Build URL-safe slug from shop name, then append short user-id suffix
  -- to guarantee uniqueness (LOWER + regex replace non-alphanum → '-').
  v_suffix := SUBSTRING(NEW.id::text, 1, 8);
  v_slug := LOWER(REGEXP_REPLACE(v_shop_name, '[^a-zA-Z0-9]+', '-', 'g'));
  v_slug := TRIM(BOTH '-' FROM v_slug);
  IF v_slug IS NULL OR v_slug = '' THEN
    v_slug := 'pet-' || v_suffix;
  ELSE
    v_slug := v_slug || '-' || v_suffix;
  END IF;

  -- 1) Create tenant
  INSERT INTO public.tenants (name, email, slug)
  VALUES (v_shop_name, NEW.email, v_slug)
  RETURNING id INTO v_tenant_id;

  -- 2) Create user profile as owner
  INSERT INTO public.users (id, tenant_id, full_name, role, phone)
  VALUES (
    NEW.id,
    v_tenant_id,
    COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'full_name', ''), split_part(NEW.email, '@', 1)),
    'owner',
    NULLIF(NEW.raw_user_meta_data ->> 'phone', '')
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Never block auth signup on our bookkeeping. Log and allow the auth row.
  RAISE WARNING 'handle_new_user failed: %', SQLERRM;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

COMMIT;
