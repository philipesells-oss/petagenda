-- =============================================================================
-- Migration: 007_whatsapp_tables.sql
-- Epic: 2 — WhatsApp Integration
-- Note: message_templates already exists (migration 001/003/006).
--       This migration adds: updated_at to templates, message_logs,
--       whatsapp_opt_ins, and whatsapp_config.
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- Patch message_templates: add updated_at if missing
-- ---------------------------------------------------------------------------
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='message_templates' AND column_name='updated_at'
  ) THEN
    ALTER TABLE public.message_templates
      ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL;
  END IF;
END $$;

-- updated_at trigger on templates
DROP TRIGGER IF EXISTS update_message_templates_updated_at ON public.message_templates;
CREATE TRIGGER update_message_templates_updated_at
  BEFORE UPDATE ON public.message_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ---------------------------------------------------------------------------
-- whatsapp_config — Per-tenant Z-API credentials
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.whatsapp_config (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL UNIQUE REFERENCES public.tenants(id) ON DELETE CASCADE,
  zapi_instance     TEXT,
  zapi_token        TEXT,
  zapi_client_token TEXT,
  status            TEXT DEFAULT 'disconnected'
                         CHECK (status IN ('disconnected','connecting','connected','error')),
  phone_number      TEXT,
  connected_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TRIGGER update_whatsapp_config_updated_at
  BEFORE UPDATE ON public.whatsapp_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.whatsapp_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_whatsapp_config"
  ON public.whatsapp_config FOR ALL
  USING (tenant_id = public.get_my_tenant_id())
  WITH CHECK (tenant_id = public.get_my_tenant_id());

-- ---------------------------------------------------------------------------
-- message_logs — Audit trail for every WhatsApp message sent
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.message_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  appointment_id  UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  client_id       UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  template_id     UUID REFERENCES public.message_templates(id) ON DELETE SET NULL,
  phone           TEXT NOT NULL,
  body            TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending','sent','delivered','read','failed')),
  zapi_message_id TEXT,
  error_message   TEXT,
  sent_at         TIMESTAMPTZ,
  delivered_at    TIMESTAMPTZ,
  read_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TRIGGER update_message_logs_updated_at
  BEFORE UPDATE ON public.message_logs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE INDEX IF NOT EXISTS idx_message_logs_tenant_id   ON public.message_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_message_logs_appointment ON public.message_logs(appointment_id);
CREATE INDEX IF NOT EXISTS idx_message_logs_status      ON public.message_logs(status);
CREATE INDEX IF NOT EXISTS idx_message_logs_created_at  ON public.message_logs(created_at DESC);

ALTER TABLE public.message_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_message_logs"
  ON public.message_logs FOR ALL
  USING (tenant_id = public.get_my_tenant_id())
  WITH CHECK (tenant_id = public.get_my_tenant_id());

-- ---------------------------------------------------------------------------
-- whatsapp_opt_ins — LGPD opt-in tracking per client
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.whatsapp_opt_ins (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  client_id    UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  opted_in     BOOLEAN DEFAULT false NOT NULL,
  opted_in_at  TIMESTAMPTZ,
  opted_out_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (tenant_id, client_id)
);

CREATE TRIGGER update_whatsapp_opt_ins_updated_at
  BEFORE UPDATE ON public.whatsapp_opt_ins
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE INDEX IF NOT EXISTS idx_opt_ins_tenant_client ON public.whatsapp_opt_ins(tenant_id, client_id);

ALTER TABLE public.whatsapp_opt_ins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_opt_ins"
  ON public.whatsapp_opt_ins FOR ALL
  USING (tenant_id = public.get_my_tenant_id())
  WITH CHECK (tenant_id = public.get_my_tenant_id());

COMMIT;
