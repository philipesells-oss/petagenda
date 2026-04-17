'use server'

/**
 * Appointments Server Actions — Story 1.7
 *
 * CRUD + status flow for the Agenda feature. Tenant isolation via RLS plus
 * explicit tenant_id filters for defense-in-depth.
 */

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { getCurrentUser } from '@/lib/auth/get-current-user'
import { createClient } from '@/lib/supabase/server'
import { getAvailableSlots as libGetAvailableSlots } from '@/lib/agenda/available-slots'
import type { ActionResult, AppointmentStatus, AppointmentRow } from '@/types'

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const TIME_RE = /^\d{2}:\d{2}(:\d{2})?$/
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

const createSchema = z.object({
  client_id: z.string().uuid('Cliente obrigatório'),
  pet_id: z.string().uuid('Pet obrigatório'),
  service_id: z.string().uuid('Serviço obrigatório'),
  assigned_to: z
    .preprocess(
      (v) => (v === '' || v === null || v === undefined ? null : v),
      z.string().uuid().nullable(),
    ),
  date: z.string().regex(DATE_RE, 'Data inválida'),
  start_time: z.string().regex(TIME_RE, 'Horário inválido'),
  price: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? 0 : Number(v)),
    z.number().nonnegative(),
  ),
  notes: z.preprocess(
    (v) => (typeof v === 'string' && v.trim() !== '' ? v.trim() : null),
    z.string().nullable(),
  ),
})

const VALID_STATUS: readonly AppointmentStatus[] = [
  'scheduled',
  'confirmed',
  'in_progress',
  'completed',
  'canceled',
  'no_show',
] as const

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fdToObj(formData: FormData): Record<string, unknown> {
  const o: Record<string, unknown> = {}
  formData.forEach((v, k) => {
    o[k] = v
  })
  return o
}

function formatErr<T>(err: z.ZodError<T>): ActionResult<never> {
  const fieldErrors: Record<string, string[]> = {}
  for (const issue of err.issues) {
    const key = issue.path.join('.') || '_'
    fieldErrors[key] = [...(fieldErrors[key] ?? []), issue.message]
  }
  return { ok: false, error: 'Confira os campos destacados.', fieldErrors }
}

function toMin(t: string): number {
  const [h, m] = t.split(':').map((x) => parseInt(x, 10))
  return (h || 0) * 60 + (m || 0)
}

function toHHMMSS(m: number): string {
  const h = Math.floor(m / 60) % 24
  const mm = m % 60
  return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}:00`
}

// ---------------------------------------------------------------------------
// Read — for client-side hooks (paralelo ao SSR que o page.tsx faz direto)
// ---------------------------------------------------------------------------

export async function getAppointmentsByDate(
  date: string,
): Promise<ActionResult<AppointmentRow[]>> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: 'Não autenticado' }
  if (!DATE_RE.test(date)) return { ok: false, error: 'Data inválida' }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('tenant_id', user.tenantId)
    .eq('date', date)
    .order('start_time', { ascending: true })

  if (error) return { ok: false, error: error.message }
  return { ok: true, data: (data ?? []) as AppointmentRow[] }
}

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

export async function createAppointment(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: 'Não autenticado' }

  const parsed = createSchema.safeParse(fdToObj(formData))
  if (!parsed.success) return formatErr(parsed.error)
  const v = parsed.data

  const supabase = await createClient()

  // Resolve service duration to compute end_time
  const { data: svc, error: svcErr } = await supabase
    .from('services')
    .select('duration_minutes, price')
    .eq('id', v.service_id)
    .eq('tenant_id', user.tenantId)
    .maybeSingle<{ duration_minutes: number; price: number }>()

  if (svcErr || !svc) {
    return { ok: false, error: 'Serviço não encontrado' }
  }

  const startMin = toMin(v.start_time)
  const endMin = startMin + svc.duration_minutes
  const start_time = toHHMMSS(startMin)
  const end_time = toHHMMSS(endMin)

  const insert = {
    tenant_id: user.tenantId,
    client_id: v.client_id,
    pet_id: v.pet_id,
    service_id: v.service_id,
    assigned_to: v.assigned_to,
    date: v.date,
    start_time,
    end_time,
    price: v.price || svc.price,
    notes: v.notes,
    source: 'manual' as const,
    status: 'scheduled' as AppointmentStatus,
  }

  const { data, error } = await supabase
    .from('appointments')
    .insert(insert as never)
    .select('id')
    .single<{ id: string }>()

  if (error || !data) {
    const msg = error?.message ?? 'Erro ao criar agendamento'
    // Postgres exclusion constraint → overlap
    const friendly = /overlap|conflict|exclus/i.test(msg)
      ? 'Horário conflita com outro agendamento'
      : msg
    return { ok: false, error: friendly }
  }

  revalidatePath('/agenda')
  return { ok: true, data: { id: data.id } }
}

// ---------------------------------------------------------------------------
// Update status (flow)
// ---------------------------------------------------------------------------

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus,
  reason?: string,
): Promise<ActionResult<null>> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: 'Não autenticado' }
  if (!VALID_STATUS.includes(status)) {
    return { ok: false, error: 'Status inválido' }
  }

  const supabase = await createClient()
  const patch: Record<string, unknown> = { status }

  if (status === 'completed') {
    patch.completed_at = new Date().toISOString()
  }
  if (status === 'canceled' && reason) {
    patch.canceled_reason = reason
  }

  const { error } = await supabase
    .from('appointments')
    .update(patch as never)
    .eq('id', id)
    .eq('tenant_id', user.tenantId)

  if (error) return { ok: false, error: error.message }

  revalidatePath('/agenda')
  return { ok: true, data: null }
}

// ---------------------------------------------------------------------------
// Update (edit)
// ---------------------------------------------------------------------------

export async function updateAppointment(
  id: string,
  formData: FormData,
): Promise<ActionResult<null>> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: 'Não autenticado' }

  const parsed = createSchema.safeParse(fdToObj(formData))
  if (!parsed.success) return formatErr(parsed.error)
  const v = parsed.data

  const supabase = await createClient()
  const { data: svc } = await supabase
    .from('services')
    .select('duration_minutes')
    .eq('id', v.service_id)
    .eq('tenant_id', user.tenantId)
    .maybeSingle<{ duration_minutes: number }>()

  if (!svc) return { ok: false, error: 'Serviço não encontrado' }

  const startMin = toMin(v.start_time)
  const endMin = startMin + svc.duration_minutes

  const patch = {
    client_id: v.client_id,
    pet_id: v.pet_id,
    service_id: v.service_id,
    assigned_to: v.assigned_to,
    date: v.date,
    start_time: toHHMMSS(startMin),
    end_time: toHHMMSS(endMin),
    price: v.price,
    notes: v.notes,
  }

  const { error } = await supabase
    .from('appointments')
    .update(patch as never)
    .eq('id', id)
    .eq('tenant_id', user.tenantId)

  if (error) {
    const friendly = /overlap|conflict|exclus/i.test(error.message)
      ? 'Horário conflita com outro agendamento'
      : error.message
    return { ok: false, error: friendly }
  }

  revalidatePath('/agenda')
  return { ok: true, data: null }
}

// ---------------------------------------------------------------------------
// Available slots (wrapper para client)
// ---------------------------------------------------------------------------

export async function getAvailableSlots(
  date: string,
  serviceId: string,
  employeeId?: string,
) {
  const user = await getCurrentUser()
  if (!user) return { ok: false as const, error: 'Não autenticado' }

  const slots = await libGetAvailableSlots(
    user.tenantId,
    date,
    serviceId,
    employeeId,
  )
  return { ok: true as const, data: slots }
}
