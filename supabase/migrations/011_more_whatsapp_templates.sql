-- =============================================================================
-- Migration: 011_more_whatsapp_templates.sql
-- Description: Adds 3 more default WhatsApp message templates (total: 8)
-- =============================================================================

BEGIN;

INSERT INTO public.message_templates (tenant_id, name, category, content, is_default, variables)
VALUES
  (NULL, 'Cancelamento de agendamento', 'cancellation',
   'Olá {{client_name}}! Infelizmente precisamos cancelar o {{service}} do {{pet_name}} marcado para {{date}} às {{time}}. Entre em contato para reagendar. Pedimos desculpas pelo transtorno! 🐾',
   true, ARRAY['client_name','service','pet_name','date','time']),

  (NULL, 'Promoção especial', 'promotion',
   'Olá {{client_name}}! 🎉 Temos uma promoção especial esta semana: {{offer}}. Aproveite e agende o {{pet_name}} com a gente! Responda essa mensagem para garantir sua vaga.',
   true, ARRAY['client_name','offer','pet_name']),

  (NULL, 'Vacinas e checkup', 'health',
   '{{client_name}}, é hora de cuidar da saúde do {{pet_name}}! 💉🐾 As vacinas e/ou vermífugo podem estar próximos do vencimento. Agende uma consulta de rotina com a gente!',
   true, ARRAY['client_name','pet_name'])
ON CONFLICT DO NOTHING;

COMMIT;
