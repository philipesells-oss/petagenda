'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { getCurrentUser } from '@/lib/auth/get-current-user'
import { createClient } from '@/lib/supabase/server'
import {
  zapiGetStatus,
  zapiGetQrCode,
  zapiDisconnect,
  ZapiError,
} from '@/lib/zapi/client'
import type { ActionResult } from '@/types'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface WhatsappConfig {
  id: string
  tenant_id: string
  zapi_instance: string | null
  zapi_token: string | null
  zapi_client_token: string | null
  status: 'disconnected' | 'connecting' | 'connected' | 'error'
  phone_number: string | null
  connected_at: string | null
}

export interface MessageTemplate {
  id: string
  tenant_id: string | null
  name: string
  category: string
  content: string
  is_default: boolean
  is_active: boolean
  variables: string[]
  created_at: string
  updated_at: string
}

export interface MessageLog {
  id: string
  tenant_id: string
  appointment_id: string | null
  client_id: string | null
  template_id: string | null
  phone: string
  body: string
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed'
  zapi_message_id: string | null
  error_message: string | null
  sent_at: string | null
  created_at: string
}

// ---------------------------------------------------------------------------
// WhatsApp Config
// ---------------------------------------------------------------------------

export async function getWhatsappConfig(): Promise<ActionResult<WhatsappConfig | null>> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: 'Não autenticado' }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('whatsapp_config')
    .select('*')
    .eq('tenant_id', user.tenantId)
    .maybeSingle<WhatsappConfig>()

  if (error) return { ok: false, error: error.message }
  return { ok: true, data: data ?? null }
}

const configSchema = z.object({
  zapi_instance: z.string().trim().min(1, 'Instance ID obrigatório'),
  zapi_token: z.string().trim().min(1, 'Token obrigatório'),
  zapi_client_token: z.string().trim().optional().nullable(),
})

export async function saveWhatsappConfig(
  formData: FormData,
): Promise<ActionResult<void>> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: 'Não autenticado' }

  const parsed = configSchema.safeParse({
    zapi_instance: formData.get('zapi_instance'),
    zapi_token: formData.get('zapi_token'),
    zapi_client_token: formData.get('zapi_client_token') || null,
  })
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Dados inválidos' }
  }

  const supabase = await createClient()
  const { error } = await supabase.from('whatsapp_config').upsert(
    {
      tenant_id: user.tenantId,
      ...parsed.data,
      status: 'connecting',
    } as never,
    { onConflict: 'tenant_id' },
  )

  if (error) return { ok: false, error: error.message }

  revalidatePath('/whatsapp')
  return { ok: true, data: undefined }
}

export async function getZapiStatus(): Promise<
  ActionResult<{ connected: boolean; phone: string | null; status: string }>
> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: 'Não autenticado' }

  const supabase = await createClient()
  const { data: cfg } = await supabase
    .from('whatsapp_config')
    .select('zapi_instance, zapi_token, zapi_client_token')
    .eq('tenant_id', user.tenantId)
    .maybeSingle<Pick<WhatsappConfig, 'zapi_instance' | 'zapi_token' | 'zapi_client_token'>>()

  if (!cfg?.zapi_instance || !cfg?.zapi_token) {
    return { ok: false, error: 'Instância não configurada' }
  }

  try {
    const zapiStatus = await zapiGetStatus(
      cfg.zapi_instance,
      cfg.zapi_token,
      cfg.zapi_client_token ?? undefined,
    )

    const newStatus = zapiStatus.connected ? 'connected' : 'disconnected'
    await supabase
      .from('whatsapp_config')
      .update({
        status: newStatus,
        phone_number: zapiStatus.phone ?? null,
        connected_at: zapiStatus.connected ? new Date().toISOString() : null,
      } as never)
      .eq('tenant_id', user.tenantId)

    await supabase
      .from('tenants')
      .update({ whatsapp_connected: zapiStatus.connected } as never)
      .eq('id', user.tenantId)

    revalidatePath('/whatsapp')
    return {
      ok: true,
      data: {
        connected: zapiStatus.connected,
        phone: zapiStatus.phone ?? null,
        status: newStatus,
      },
    }
  } catch (e) {
    const msg = e instanceof ZapiError ? e.message : 'Erro ao verificar status'
    await supabase
      .from('whatsapp_config')
      .update({ status: 'error' } as never)
      .eq('tenant_id', user.tenantId)
    return { ok: false, error: msg }
  }
}

export async function getZapiQrCode(): Promise<ActionResult<{ value: string }>> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: 'Não autenticado' }

  const supabase = await createClient()
  const { data: cfg } = await supabase
    .from('whatsapp_config')
    .select('zapi_instance, zapi_token, zapi_client_token')
    .eq('tenant_id', user.tenantId)
    .maybeSingle<Pick<WhatsappConfig, 'zapi_instance' | 'zapi_token' | 'zapi_client_token'>>()

  if (!cfg?.zapi_instance || !cfg?.zapi_token) {
    return { ok: false, error: 'Instância não configurada' }
  }

  try {
    const qr = await zapiGetQrCode(
      cfg.zapi_instance,
      cfg.zapi_token,
      cfg.zapi_client_token ?? undefined,
    )
    return { ok: true, data: { value: qr.value } }
  } catch (e) {
    const msg = e instanceof ZapiError ? e.message : 'Erro ao obter QR Code'
    return { ok: false, error: msg }
  }
}

export async function disconnectWhatsapp(): Promise<ActionResult<void>> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: 'Não autenticado' }

  const supabase = await createClient()
  const { data: cfg } = await supabase
    .from('whatsapp_config')
    .select('zapi_instance, zapi_token, zapi_client_token')
    .eq('tenant_id', user.tenantId)
    .maybeSingle<Pick<WhatsappConfig, 'zapi_instance' | 'zapi_token' | 'zapi_client_token'>>()

  if (cfg?.zapi_instance && cfg?.zapi_token) {
    try {
      await zapiDisconnect(
        cfg.zapi_instance,
        cfg.zapi_token,
        cfg.zapi_client_token ?? undefined,
      )
    } catch {
      // best-effort — continue to update local state
    }
  }

  await supabase
    .from('whatsapp_config')
    .update({ status: 'disconnected', phone_number: null, connected_at: null } as never)
    .eq('tenant_id', user.tenantId)

  await supabase
    .from('tenants')
    .update({ whatsapp_connected: false } as never)
    .eq('id', user.tenantId)

  revalidatePath('/whatsapp')
  return { ok: true, data: undefined }
}

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

export async function getTemplates(): Promise<ActionResult<MessageTemplate[]>> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: 'Não autenticado' }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('message_templates')
    .select('*')
    .or(`is_default.eq.true,tenant_id.eq.${user.tenantId}`)
    .order('is_default', { ascending: false })
    .order('category')
    .order('name')

  if (error) return { ok: false, error: error.message }
  return { ok: true, data: (data ?? []) as MessageTemplate[] }
}

const templateSchema = z.object({
  name: z.string().trim().min(2, 'Nome muito curto'),
  category: z.enum([
    'reminder',
    'confirmation',
    'reactivation',
    'post_service',
    'promotion',
    'custom',
  ]),
  content: z.string().trim().min(10, 'Mensagem muito curta'),
  is_active: z.boolean().optional().default(true),
})

export async function createTemplate(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: 'Não autenticado' }

  const parsed = templateSchema.safeParse({
    name: formData.get('name'),
    category: formData.get('category'),
    content: formData.get('content'),
  })
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Dados inválidos' }
  }

  const variables = extractVariables(parsed.data.content)

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('message_templates')
    .insert({
      tenant_id: user.tenantId,
      ...parsed.data,
      variables,
      is_default: false,
    } as never)
    .select('id')
    .single<{ id: string }>()

  if (error || !data) return { ok: false, error: error?.message ?? 'Erro ao criar template' }

  revalidatePath('/whatsapp/templates')
  return { ok: true, data: { id: data.id } }
}

export async function updateTemplate(
  id: string,
  formData: FormData,
): Promise<ActionResult<void>> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: 'Não autenticado' }

  const parsed = templateSchema.safeParse({
    name: formData.get('name'),
    category: formData.get('category'),
    content: formData.get('content'),
  })
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Dados inválidos' }
  }

  const variables = extractVariables(parsed.data.content)

  const supabase = await createClient()
  const { error } = await supabase
    .from('message_templates')
    .update({ ...parsed.data, variables } as never)
    .eq('id', id)
    .eq('tenant_id', user.tenantId)
    .eq('is_default', false)

  if (error) return { ok: false, error: error.message }

  revalidatePath('/whatsapp/templates')
  return { ok: true, data: undefined }
}

export async function deleteTemplate(id: string): Promise<ActionResult<void>> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: 'Não autenticado' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('message_templates')
    .delete()
    .eq('id', id)
    .eq('tenant_id', user.tenantId)
    .eq('is_default', false)

  if (error) return { ok: false, error: error.message }

  revalidatePath('/whatsapp/templates')
  return { ok: true, data: undefined }
}

export async function toggleTemplate(
  id: string,
  isActive: boolean,
): Promise<ActionResult<void>> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: 'Não autenticado' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('message_templates')
    .update({ is_active: isActive } as never)
    .eq('id', id)
    .eq('tenant_id', user.tenantId)
    .eq('is_default', false)

  if (error) return { ok: false, error: error.message }

  revalidatePath('/whatsapp/templates')
  return { ok: true, data: undefined }
}

// ---------------------------------------------------------------------------
// Message logs
// ---------------------------------------------------------------------------

export async function getMessageLogs(
  limit = 50,
  offset = 0,
): Promise<ActionResult<MessageLog[]>> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: 'Não autenticado' }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('message_logs')
    .select('*')
    .eq('tenant_id', user.tenantId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) return { ok: false, error: error.message }
  return { ok: true, data: (data ?? []) as MessageLog[] }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function extractVariables(content: string): string[] {
  const matches = content.matchAll(/\{\{(\w+)\}\}/g)
  return [...new Set([...matches].map((m) => m[1]))]
}
