-- =============================================================================
-- Migration: 003_create_rls_policies.sql
-- Story: 1.2 — Schema do Banco de Dados e Migrações
-- Agent: @data-engineer (Dara)
-- Description: Enables Row Level Security on every tenant-scoped table and
--              installs the default tenant-isolation policies (SELECT / INSERT
--              / UPDATE / DELETE filtered by get_my_tenant_id()).
--              Also: helper function get_my_tenant_id() and owner/admin-only
--              delete policy on clients.
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- Helper function — resolves the current user's tenant_id from public.users
-- SECURITY DEFINER so it can read the users table even when RLS blocks anon.
-- STABLE so Postgres can cache it within a single statement.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_my_tenant_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT tenant_id FROM public.users WHERE id = auth.uid();
$$;

COMMENT ON FUNCTION public.get_my_tenant_id() IS
  'Returns tenant_id for the currently authenticated user. Used as the lock for RLS policies.';

REVOKE ALL ON FUNCTION public.get_my_tenant_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_tenant_id() TO authenticated, service_role;

-- -----------------------------------------------------------------------------
-- Enable RLS on every tenant-scoped table
-- -----------------------------------------------------------------------------
ALTER TABLE public.tenants           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pets              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_hours    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_slots     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;

-- Force RLS even for table owners (safer default)
ALTER TABLE public.clients           FORCE ROW LEVEL SECURITY;
ALTER TABLE public.pets              FORCE ROW LEVEL SECURITY;
ALTER TABLE public.appointments      FORCE ROW LEVEL SECURITY;

-- =============================================================================
-- tenants — self-scope via id
-- =============================================================================
DROP POLICY IF EXISTS "tenants_select" ON public.tenants;
CREATE POLICY "tenants_select" ON public.tenants
  FOR SELECT USING (id = public.get_my_tenant_id());

DROP POLICY IF EXISTS "tenants_update" ON public.tenants;
CREATE POLICY "tenants_update" ON public.tenants
  FOR UPDATE USING (id = public.get_my_tenant_id())
  WITH CHECK (id = public.get_my_tenant_id());

-- Tenants are created by the handle_new_user() SECURITY DEFINER trigger,
-- not directly by end-users. No INSERT/DELETE policy = blocked for clients.

-- =============================================================================
-- users
-- =============================================================================
DROP POLICY IF EXISTS "users_select" ON public.users;
CREATE POLICY "users_select" ON public.users
  FOR SELECT USING (tenant_id = public.get_my_tenant_id());

DROP POLICY IF EXISTS "users_insert" ON public.users;
CREATE POLICY "users_insert" ON public.users
  FOR INSERT WITH CHECK (tenant_id = public.get_my_tenant_id());

DROP POLICY IF EXISTS "users_update" ON public.users;
CREATE POLICY "users_update" ON public.users
  FOR UPDATE USING (tenant_id = public.get_my_tenant_id())
  WITH CHECK (tenant_id = public.get_my_tenant_id());

DROP POLICY IF EXISTS "users_delete_admin" ON public.users;
CREATE POLICY "users_delete_admin" ON public.users
  FOR DELETE USING (
    tenant_id = public.get_my_tenant_id()
    AND EXISTS (
      SELECT 1 FROM public.users me
      WHERE me.id = auth.uid() AND me.role IN ('owner', 'admin')
    )
  );

-- =============================================================================
-- clients
-- =============================================================================
DROP POLICY IF EXISTS "clients_select" ON public.clients;
CREATE POLICY "clients_select" ON public.clients
  FOR SELECT USING (tenant_id = public.get_my_tenant_id());

DROP POLICY IF EXISTS "clients_insert" ON public.clients;
CREATE POLICY "clients_insert" ON public.clients
  FOR INSERT WITH CHECK (tenant_id = public.get_my_tenant_id());

DROP POLICY IF EXISTS "clients_update" ON public.clients;
CREATE POLICY "clients_update" ON public.clients
  FOR UPDATE USING (tenant_id = public.get_my_tenant_id())
  WITH CHECK (tenant_id = public.get_my_tenant_id());

-- DELETE: restricted to owner/admin (employees must not erase customers).
DROP POLICY IF EXISTS "clients_delete_admin" ON public.clients;
CREATE POLICY "clients_delete_admin" ON public.clients
  FOR DELETE USING (
    tenant_id = public.get_my_tenant_id()
    AND EXISTS (
      SELECT 1 FROM public.users me
      WHERE me.id = auth.uid() AND me.role IN ('owner', 'admin')
    )
  );

-- =============================================================================
-- pets
-- =============================================================================
DROP POLICY IF EXISTS "pets_select" ON public.pets;
CREATE POLICY "pets_select" ON public.pets
  FOR SELECT USING (tenant_id = public.get_my_tenant_id());

DROP POLICY IF EXISTS "pets_insert" ON public.pets;
CREATE POLICY "pets_insert" ON public.pets
  FOR INSERT WITH CHECK (tenant_id = public.get_my_tenant_id());

DROP POLICY IF EXISTS "pets_update" ON public.pets;
CREATE POLICY "pets_update" ON public.pets
  FOR UPDATE USING (tenant_id = public.get_my_tenant_id())
  WITH CHECK (tenant_id = public.get_my_tenant_id());

DROP POLICY IF EXISTS "pets_delete" ON public.pets;
CREATE POLICY "pets_delete" ON public.pets
  FOR DELETE USING (tenant_id = public.get_my_tenant_id());

-- =============================================================================
-- services
-- =============================================================================
DROP POLICY IF EXISTS "services_select" ON public.services;
CREATE POLICY "services_select" ON public.services
  FOR SELECT USING (tenant_id = public.get_my_tenant_id());

DROP POLICY IF EXISTS "services_insert" ON public.services;
CREATE POLICY "services_insert" ON public.services
  FOR INSERT WITH CHECK (tenant_id = public.get_my_tenant_id());

DROP POLICY IF EXISTS "services_update" ON public.services;
CREATE POLICY "services_update" ON public.services
  FOR UPDATE USING (tenant_id = public.get_my_tenant_id())
  WITH CHECK (tenant_id = public.get_my_tenant_id());

DROP POLICY IF EXISTS "services_delete" ON public.services;
CREATE POLICY "services_delete" ON public.services
  FOR DELETE USING (tenant_id = public.get_my_tenant_id());

-- =============================================================================
-- appointments
-- =============================================================================
DROP POLICY IF EXISTS "appointments_select" ON public.appointments;
CREATE POLICY "appointments_select" ON public.appointments
  FOR SELECT USING (tenant_id = public.get_my_tenant_id());

DROP POLICY IF EXISTS "appointments_insert" ON public.appointments;
CREATE POLICY "appointments_insert" ON public.appointments
  FOR INSERT WITH CHECK (tenant_id = public.get_my_tenant_id());

DROP POLICY IF EXISTS "appointments_update" ON public.appointments;
CREATE POLICY "appointments_update" ON public.appointments
  FOR UPDATE USING (tenant_id = public.get_my_tenant_id())
  WITH CHECK (tenant_id = public.get_my_tenant_id());

DROP POLICY IF EXISTS "appointments_delete" ON public.appointments;
CREATE POLICY "appointments_delete" ON public.appointments
  FOR DELETE USING (tenant_id = public.get_my_tenant_id());

-- =============================================================================
-- business_hours
-- =============================================================================
DROP POLICY IF EXISTS "business_hours_select" ON public.business_hours;
CREATE POLICY "business_hours_select" ON public.business_hours
  FOR SELECT USING (tenant_id = public.get_my_tenant_id());

DROP POLICY IF EXISTS "business_hours_insert" ON public.business_hours;
CREATE POLICY "business_hours_insert" ON public.business_hours
  FOR INSERT WITH CHECK (tenant_id = public.get_my_tenant_id());

DROP POLICY IF EXISTS "business_hours_update" ON public.business_hours;
CREATE POLICY "business_hours_update" ON public.business_hours
  FOR UPDATE USING (tenant_id = public.get_my_tenant_id())
  WITH CHECK (tenant_id = public.get_my_tenant_id());

DROP POLICY IF EXISTS "business_hours_delete" ON public.business_hours;
CREATE POLICY "business_hours_delete" ON public.business_hours
  FOR DELETE USING (tenant_id = public.get_my_tenant_id());

-- =============================================================================
-- blocked_slots
-- =============================================================================
DROP POLICY IF EXISTS "blocked_slots_select" ON public.blocked_slots;
CREATE POLICY "blocked_slots_select" ON public.blocked_slots
  FOR SELECT USING (tenant_id = public.get_my_tenant_id());

DROP POLICY IF EXISTS "blocked_slots_insert" ON public.blocked_slots;
CREATE POLICY "blocked_slots_insert" ON public.blocked_slots
  FOR INSERT WITH CHECK (tenant_id = public.get_my_tenant_id());

DROP POLICY IF EXISTS "blocked_slots_update" ON public.blocked_slots;
CREATE POLICY "blocked_slots_update" ON public.blocked_slots
  FOR UPDATE USING (tenant_id = public.get_my_tenant_id())
  WITH CHECK (tenant_id = public.get_my_tenant_id());

DROP POLICY IF EXISTS "blocked_slots_delete" ON public.blocked_slots;
CREATE POLICY "blocked_slots_delete" ON public.blocked_slots
  FOR DELETE USING (tenant_id = public.get_my_tenant_id());

-- =============================================================================
-- message_templates (special: global templates visible for everyone)
-- =============================================================================
DROP POLICY IF EXISTS "message_templates_select" ON public.message_templates;
CREATE POLICY "message_templates_select" ON public.message_templates
  FOR SELECT USING (
    tenant_id = public.get_my_tenant_id()
    OR tenant_id IS NULL
  );

DROP POLICY IF EXISTS "message_templates_insert" ON public.message_templates;
CREATE POLICY "message_templates_insert" ON public.message_templates
  FOR INSERT WITH CHECK (tenant_id = public.get_my_tenant_id());

DROP POLICY IF EXISTS "message_templates_update" ON public.message_templates;
CREATE POLICY "message_templates_update" ON public.message_templates
  FOR UPDATE USING (tenant_id = public.get_my_tenant_id())
  WITH CHECK (tenant_id = public.get_my_tenant_id());

DROP POLICY IF EXISTS "message_templates_delete" ON public.message_templates;
CREATE POLICY "message_templates_delete" ON public.message_templates
  FOR DELETE USING (tenant_id = public.get_my_tenant_id());

COMMIT;
