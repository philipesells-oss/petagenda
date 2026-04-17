-- =============================================================================
-- Migration: 001_create_core_tables.sql
-- Story: 1.2 — Schema do Banco de Dados e Migrações
-- Agent: @data-engineer (Dara)
-- Description: Creates the core MVP tables (tenants, users, clients, pets, services).
--              RLS policies are configured in 003_create_rls_policies.sql.
--              Triggers and functions live in 004_create_triggers.sql.
--              Performance indexes live in 005_create_indexes.sql.
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- Required extensions
-- -----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- tenants — Pet shops (organizations)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  phone TEXT,
  email TEXT,
  address JSONB,
  settings JSONB DEFAULT '{}'::jsonb,
  whatsapp_instance_id TEXT,
  whatsapp_connected BOOLEAN DEFAULT false NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT DEFAULT 'trial' NOT NULL CHECK (plan IN ('starter', 'pro', 'business', 'trial')),
  plan_status TEXT DEFAULT 'trialing' NOT NULL CHECK (plan_status IN ('trialing', 'active', 'past_due', 'canceled', 'incomplete')),
  trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
  messages_used INTEGER DEFAULT 0 NOT NULL,
  messages_limit INTEGER DEFAULT 500 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE public.tenants IS 'Pet shops (multi-tenant root). Every other table references tenants.id.';

-- -----------------------------------------------------------------------------
-- users — Pet shop staff (1:1 with auth.users)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'employee' CHECK (role IN ('owner', 'admin', 'employee')),
  phone TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  permissions JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE public.users IS 'Pet shop staff profile. `id` mirrors auth.users(id).';

-- -----------------------------------------------------------------------------
-- clients — Pet owners (customers of the pet shop)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  cpf TEXT,
  address JSONB,
  tags TEXT[] DEFAULT '{}'::text[] NOT NULL,
  notes TEXT,
  total_spent NUMERIC(10,2) DEFAULT 0 NOT NULL,
  visit_count INTEGER DEFAULT 0 NOT NULL,
  last_visit_at TIMESTAMPTZ,
  loyalty_points INTEGER DEFAULT 0 NOT NULL,
  whatsapp_opt_in BOOLEAN DEFAULT true NOT NULL,
  status TEXT DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'inactive', 'blocked')),
  inactive_since TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE public.clients IS 'Pet owners. Soft-deletable via status=blocked. Tags auto-managed by trigger.';

-- -----------------------------------------------------------------------------
-- pets — Animals owned by clients
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  species TEXT NOT NULL CHECK (species IN ('dog', 'cat', 'bird', 'other')),
  breed TEXT,
  size TEXT CHECK (size IN ('small', 'medium', 'large', 'giant')),
  weight NUMERIC(5,2),
  birth_date DATE,
  gender TEXT CHECK (gender IN ('male', 'female')),
  coat_type TEXT,
  temperament TEXT,
  health_notes TEXT,
  photo_url TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE public.pets IS 'Animals belonging to clients. Cascade-deletes on client removal.';

-- -----------------------------------------------------------------------------
-- services — Service catalog per tenant
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 60 CHECK (duration_minutes > 0),
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  price_by_size JSONB,
  category TEXT DEFAULT 'grooming' NOT NULL CHECK (category IN ('grooming', 'veterinary', 'daycare', 'other')),
  color TEXT DEFAULT '#3B82F6',
  is_active BOOLEAN DEFAULT true NOT NULL,
  sort_order INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE public.services IS 'Service catalog (grooming, vet, daycare). Prices can be overridden by pet size via price_by_size JSONB.';

-- -----------------------------------------------------------------------------
-- message_templates — Global + tenant-specific WhatsApp templates
-- NOTE: Used by seed data (006) to register default templates.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,  -- NULL = global template
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'reminder', 'confirmation', 'reactivation', 'post_service',
    'promotion', 'loyalty', 'welcome', 'birthday'
  )),
  content TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  variables TEXT[] DEFAULT '{}'::text[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE public.message_templates IS 'WhatsApp message templates. tenant_id IS NULL = global template visible to every tenant.';

COMMIT;
