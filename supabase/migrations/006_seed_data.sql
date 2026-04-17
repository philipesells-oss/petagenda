-- =============================================================================
-- Migration: 006_seed_data.sql
-- Story: 1.2 — Schema do Banco de Dados e Migrações
-- Agent: @data-engineer (Dara)
-- Description: Seed data for local development. Creates one demo tenant
--              ("PetShop Exemplo"), default services, default business hours,
--              and the baseline global message templates.
--
--              IMPORTANT: this seed is idempotent — safe to re-run on the same
--              database. It does NOT depend on auth.users, so it can be applied
--              directly via psql / SQL editor for development.
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1) Global message templates (tenant_id IS NULL = available to every tenant)
-- -----------------------------------------------------------------------------
INSERT INTO public.message_templates (tenant_id, name, category, content, is_default, variables)
VALUES
  (NULL, 'Lembrete 24h', 'reminder',
   'Oi {{client_name}}! Amanhã temos {{service}} do {{pet_name}} às {{time}}. Te esperamos! 🐾',
   true, ARRAY['client_name','service','pet_name','time']),
  (NULL, 'Confirmação de agendamento', 'confirmation',
   'Oi {{client_name}}! Seu {{service}} do {{pet_name}} está confirmado para {{date}} às {{time}}. Responda SIM para confirmar.',
   true, ARRAY['client_name','service','pet_name','date','time']),
  (NULL, 'Reativação 30 dias', 'reactivation',
   '{{client_name}}, faz tempo que não vemos o {{pet_name}}! Que tal agendar um {{service}}? Temos horários essa semana 🐶',
   true, ARRAY['client_name','pet_name','service']),
  (NULL, 'Pós-atendimento', 'post_service',
   '{{client_name}}, como foi o {{service}} do {{pet_name}}? De 1 a 5, qual sua nota? 😊',
   true, ARRAY['client_name','service','pet_name']),
  (NULL, 'Aniversário do pet', 'birthday',
   'Parabéns pro {{pet_name}}! 🎂 Hoje é o aniversário dele. Que tal um banho especial com 10% OFF?',
   true, ARRAY['pet_name'])
ON CONFLICT DO NOTHING;

-- -----------------------------------------------------------------------------
-- 2) Demo tenant + services + business hours
-- Uses a deterministic UUID for the demo tenant so seed is idempotent.
-- -----------------------------------------------------------------------------
DO $$
DECLARE
  demo_tenant_id UUID := '00000000-0000-4000-8000-000000000001';
BEGIN
  -- Upsert the demo tenant
  INSERT INTO public.tenants (id, name, slug, email, plan, plan_status, messages_limit)
  VALUES (
    demo_tenant_id,
    'PetShop Exemplo',
    'petshop-exemplo',
    'demo@petagenda.com.br',
    'trial',
    'trialing',
    500
  )
  ON CONFLICT (id) DO UPDATE
    SET name = EXCLUDED.name,
        slug = EXCLUDED.slug;

  -- Default service catalog (Brazilian pet shop baseline)
  INSERT INTO public.services (tenant_id, name, description, duration_minutes, price, category, sort_order)
  VALUES
    (demo_tenant_id, 'Banho',            'Banho completo com shampoo + secagem',           60,  45.00, 'grooming',    1),
    (demo_tenant_id, 'Tosa Higiênica',   'Tosa de patas, barriga e região íntima',         45,  35.00, 'grooming',    2),
    (demo_tenant_id, 'Banho + Tosa',     'Banho completo + tosa na tesoura',               90,  70.00, 'grooming',    3),
    (demo_tenant_id, 'Consulta',         'Consulta veterinária de rotina',                 30, 120.00, 'veterinary',  4)
  ON CONFLICT DO NOTHING;

  -- Default business hours (Mon-Sat 08:00-18:00, Sunday closed)
  -- 0 = Sunday (closed), 1-5 = Mon-Fri (open), 6 = Saturday (open)
  INSERT INTO public.business_hours (tenant_id, day_of_week, is_open, open_time, close_time)
  VALUES
    (demo_tenant_id, 0, false, NULL,       NULL),        -- Sunday
    (demo_tenant_id, 1, true,  '08:00',    '18:00'),
    (demo_tenant_id, 2, true,  '08:00',    '18:00'),
    (demo_tenant_id, 3, true,  '08:00',    '18:00'),
    (demo_tenant_id, 4, true,  '08:00',    '18:00'),
    (demo_tenant_id, 5, true,  '08:00',    '18:00'),
    (demo_tenant_id, 6, true,  '08:00',    '18:00')
  ON CONFLICT (tenant_id, day_of_week) DO NOTHING;
END $$;

COMMIT;
