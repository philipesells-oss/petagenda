/**
 * Core send-message utility — server-side only.
 * Checks opt-in, quota, sends via Z-API, logs the result.
 */
import { createAdminClient } from '@/lib/supabase/admin'
import { zapiSendText, ZapiError } from '@/lib/zapi/client'
import { renderTemplate } from './render-template'

export interface SendMessageOptions {
  tenantId: string
  clientId: string
  phone: string
  templateId: string
  vars: Record<string, string>
  appointmentId?: string
}

export interface SendMessageResult {
  ok: boolean
  messageLogId?: string
  error?: string
}

export async function sendWhatsappMessage(
  opts: SendMessageOptions,
): Promise<SendMessageResult> {
  const admin = createAdminClient()

  // 1. Check opt-in
  const { data: optIn } = await admin
    .from('whatsapp_opt_ins')
    .select('opted_in')
    .eq('tenant_id', opts.tenantId)
    .eq('client_id', opts.clientId)
    .maybeSingle<{ opted_in: boolean }>()

  if (!optIn?.opted_in) {
    return { ok: false, error: 'Cliente sem opt-in de WhatsApp' }
  }

  // 2. Check quota
  const { data: tenant } = await admin
    .from('tenants')
    .select('messages_used, messages_limit, whatsapp_connected')
    .eq('id', opts.tenantId)
    .maybeSingle<{
      messages_used: number
      messages_limit: number
      whatsapp_connected: boolean
    }>()

  if (!tenant) return { ok: false, error: 'Tenant não encontrado' }
  if (!tenant.whatsapp_connected) return { ok: false, error: 'WhatsApp não conectado' }
  if (tenant.messages_used >= tenant.messages_limit) {
    return { ok: false, error: 'Limite de mensagens atingido' }
  }

  // 3. Load template
  const { data: template } = await admin
    .from('message_templates')
    .select('content')
    .eq('id', opts.templateId)
    .maybeSingle<{ content: string }>()

  if (!template) return { ok: false, error: 'Template não encontrado' }

  const body = renderTemplate(template.content, opts.vars)

  // 4. Load Z-API credentials
  const { data: cfg } = await admin
    .from('whatsapp_config')
    .select('zapi_instance, zapi_token, zapi_client_token')
    .eq('tenant_id', opts.tenantId)
    .maybeSingle<{
      zapi_instance: string
      zapi_token: string
      zapi_client_token: string | null
    }>()

  if (!cfg?.zapi_instance || !cfg?.zapi_token) {
    return { ok: false, error: 'Credenciais Z-API não configuradas' }
  }

  // 5. Create log entry (pending)
  const { data: logRow } = await admin
    .from('message_logs')
    .insert({
      tenant_id: opts.tenantId,
      appointment_id: opts.appointmentId ?? null,
      client_id: opts.clientId,
      template_id: opts.templateId,
      phone: opts.phone,
      body,
      status: 'pending',
    } as never)
    .select('id')
    .single<{ id: string }>()

  if (!logRow) return { ok: false, error: 'Erro ao criar log' }

  // 6. Send via Z-API
  try {
    const result = await zapiSendText(
      cfg.zapi_instance,
      cfg.zapi_token,
      opts.phone,
      body,
      cfg.zapi_client_token ?? undefined,
    )

    await admin
      .from('message_logs')
      .update({
        status: 'sent',
        zapi_message_id: result.messageId,
        sent_at: new Date().toISOString(),
      } as never)
      .eq('id', logRow.id)

    // Increment quota
    await admin.rpc('increment_messages_used' as never, {
      p_tenant_id: opts.tenantId,
    } as never)

    return { ok: true, messageLogId: logRow.id }
  } catch (e) {
    const msg = e instanceof ZapiError ? e.message : 'Erro ao enviar mensagem'

    await admin
      .from('message_logs')
      .update({ status: 'failed', error_message: msg } as never)
      .eq('id', logRow.id)

    return { ok: false, error: msg }
  }
}
