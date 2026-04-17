'use server'

/**
 * Onboarding Server Action — persists business hours + services seed for the
 * authenticated user's tenant. Called from the wizard on "Completar".
 *
 * Uses upserts so users who revisit onboarding don't get duplicate rows.
 */

import { createClient } from '@/lib/supabase/server'
import type { ActionResult, BusinessHourInsert, ServiceInsert } from '@/types'
import type { BusinessHour, ServiceDraft } from './wizard'

interface CompleteInput {
  tenantId: string
  hours: BusinessHour[]
  services: ServiceDraft[]
}

export async function completeOnboarding(
  input: CompleteInput,
): Promise<ActionResult<null>> {
  const supabase = await createClient()

  // Verify the caller actually belongs to the tenant they claim (defense in
  // depth — RLS should already enforce this, but explicit check gives a
  // clearer error).
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Sessão expirada.' }

  const { data: profile } = await supabase
    .from('users')
    .select('tenant_id')
    .eq('id', user.id)
    .maybeSingle<{ tenant_id: string }>()

  if (!profile || profile.tenant_id !== input.tenantId) {
    return { ok: false, error: 'Permissão negada.' }
  }

  // Replace any existing hours for this tenant to keep state idempotent.
  const { error: delError } = await supabase
    .from('business_hours')
    .delete()
    .eq('tenant_id', input.tenantId)

  if (delError) {
    return { ok: false, error: 'Erro ao limpar horários antigos.' }
  }

  const hoursRows: BusinessHourInsert[] = input.hours.map((h) => ({
    tenant_id: input.tenantId,
    day_of_week: h.dayOfWeek,
    is_open: h.isOpen,
    open_time: h.isOpen ? `${h.openTime}:00` : null,
    close_time: h.isOpen ? `${h.closeTime}:00` : null,
    break_start: null,
    break_end: null,
  }))

  const { error: hoursError } = await supabase
    .from('business_hours')
    .insert(hoursRows as never)
  if (hoursError) {
    return { ok: false, error: 'Erro ao salvar horários.' }
  }

  // Services — only seed if tenant has none yet (avoid clobbering manual edits)
  const { count } = await supabase
    .from('services')
    .select('id', { count: 'exact', head: true })
    .eq('tenant_id', input.tenantId)

  if ((count ?? 0) === 0) {
    const servicesRows: ServiceInsert[] = input.services.map((s, idx) => ({
      tenant_id: input.tenantId,
      name: s.name.trim(),
      description: null,
      duration_minutes: s.durationMinutes,
      price: s.price,
      price_by_size: null,
      category: 'grooming' as const,
      color: null,
      sort_order: idx,
    }))

    const { error: servicesError } = await supabase
      .from('services')
      .insert(servicesRows as never)
    if (servicesError) {
      return { ok: false, error: 'Erro ao salvar serviços.' }
    }
  }

  return { ok: true, data: null }
}
