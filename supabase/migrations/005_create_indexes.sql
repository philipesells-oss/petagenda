-- =============================================================================
-- Migration: 005_create_indexes.sql
-- Story: 1.2 — Schema do Banco de Dados e Migrações
-- Agent: @data-engineer (Dara)
-- Description: All performance indexes, including the unique partial index
--              that prevents overlapping appointments for the same employee.
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- tenants
-- -----------------------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS idx_tenants_slug ON public.tenants(slug);
CREATE INDEX IF NOT EXISTS idx_tenants_plan_status ON public.tenants(plan_status);

-- -----------------------------------------------------------------------------
-- users
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_users_tenant ON public.users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_tenant_active ON public.users(tenant_id, is_active);

-- -----------------------------------------------------------------------------
-- clients
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_clients_tenant ON public.clients(tenant_id);
CREATE INDEX IF NOT EXISTS idx_clients_phone ON public.clients(tenant_id, phone);
CREATE INDEX IF NOT EXISTS idx_clients_status ON public.clients(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_clients_last_visit ON public.clients(tenant_id, last_visit_at);
CREATE INDEX IF NOT EXISTS idx_clients_tags ON public.clients USING GIN (tags);

-- -----------------------------------------------------------------------------
-- pets
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_pets_client ON public.pets(client_id);
CREATE INDEX IF NOT EXISTS idx_pets_tenant ON public.pets(tenant_id);
CREATE INDEX IF NOT EXISTS idx_pets_species ON public.pets(tenant_id, species);

-- -----------------------------------------------------------------------------
-- services
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_services_tenant ON public.services(tenant_id);
CREATE INDEX IF NOT EXISTS idx_services_active ON public.services(tenant_id, is_active, sort_order);

-- -----------------------------------------------------------------------------
-- appointments
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_appointments_tenant_date    ON public.appointments(tenant_id, date);
CREATE INDEX IF NOT EXISTS idx_appointments_client         ON public.appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_pet            ON public.appointments(pet_id);
CREATE INDEX IF NOT EXISTS idx_appointments_service        ON public.appointments(service_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status         ON public.appointments(tenant_id, status, date);
CREATE INDEX IF NOT EXISTS idx_appointments_assigned       ON public.appointments(assigned_to, date);

-- Prevent overlapping bookings for the same employee at the same start_time
-- (when status is an "active" status). Canceled/no_show slots don't count.
CREATE UNIQUE INDEX IF NOT EXISTS idx_no_overlap
  ON public.appointments(tenant_id, assigned_to, date, start_time)
  WHERE status NOT IN ('canceled', 'no_show');

-- -----------------------------------------------------------------------------
-- business_hours
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_business_hours_tenant ON public.business_hours(tenant_id);

-- -----------------------------------------------------------------------------
-- blocked_slots
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_blocked_tenant_date ON public.blocked_slots(tenant_id, date);
CREATE INDEX IF NOT EXISTS idx_blocked_user_date   ON public.blocked_slots(user_id, date);

-- -----------------------------------------------------------------------------
-- message_templates
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_templates_tenant_cat ON public.message_templates(tenant_id, category)
  WHERE is_active = true;

COMMIT;
