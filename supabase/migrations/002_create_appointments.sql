-- =============================================================================
-- Migration: 002_create_appointments.sql
-- Story: 1.2 — Schema do Banco de Dados e Migrações
-- Agent: @data-engineer (Dara)
-- Description: Appointments, business_hours, and blocked_slots tables.
--              Includes the UNIQUE index that prevents overlapping bookings
--              for the same employee at the same start_time.
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- appointments — Calendar of bookings
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE RESTRICT,
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE RESTRICT,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
  assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT DEFAULT 'scheduled' NOT NULL CHECK (status IN (
    'scheduled', 'confirmed', 'in_progress', 'completed', 'canceled', 'no_show'
  )),
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  notes TEXT,
  confirmation_sent BOOLEAN DEFAULT false NOT NULL,
  reminder_sent BOOLEAN DEFAULT false NOT NULL,
  source TEXT DEFAULT 'manual' NOT NULL CHECK (source IN ('manual', 'whatsapp', 'online', 'public_booking', 'api', 'reactivation')),
  canceled_reason TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT chk_appointment_time_range CHECK (end_time > start_time)
);

COMMENT ON TABLE public.appointments IS 'Pet shop calendar. Slot overlap prevented by unique partial index idx_no_overlap (see 005).';

-- -----------------------------------------------------------------------------
-- business_hours — Weekly opening hours per tenant
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.business_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0 = Sunday ... 6 = Saturday
  is_open BOOLEAN DEFAULT true NOT NULL,
  open_time TIME,
  close_time TIME,
  break_start TIME,
  break_end TIME,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT uq_business_hours_tenant_day UNIQUE (tenant_id, day_of_week),
  CONSTRAINT chk_business_hours_open_close CHECK (
    NOT is_open OR (open_time IS NOT NULL AND close_time IS NOT NULL AND close_time > open_time)
  ),
  CONSTRAINT chk_business_hours_break CHECK (
    (break_start IS NULL AND break_end IS NULL)
    OR (break_start IS NOT NULL AND break_end IS NOT NULL AND break_end > break_start)
  )
);

COMMENT ON TABLE public.business_hours IS 'Opening hours per weekday (0=Sun..6=Sat). UNIQUE(tenant_id, day_of_week).';

-- -----------------------------------------------------------------------------
-- blocked_slots — Manual calendar blocks (holidays, appointments offline)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.blocked_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE, -- NULL = applies to every user
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT chk_blocked_slot_time_range CHECK (end_time > start_time)
);

COMMENT ON TABLE public.blocked_slots IS 'Manual time blocks on the calendar. user_id NULL = blocks all staff in tenant.';

COMMIT;
