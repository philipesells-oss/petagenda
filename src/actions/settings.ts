'use server'

/**
 * Settings Server Actions — Story 1.8
 */

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient as createSupabase } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import type { ActionResult } from '@/types'

const timeRe = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/

const hourSchema = z
  .object({
    day_of_week: z.number().int().min(0).max(6),
    is_open: z.boolean(),
    open_time: z.string().regex(timeRe).nullable().optional(),
    close_time: z.string().regex(timeRe).nullable().optional(),
    break_start: z.string().regex(timeRe).nullable().optional(),
    break_end: z.string().regex(timeRe).nullable().optional(),
  })
  .refine(
    (h) => !h.is_open || (h.open_time && h.close_time && h.open_time < h.close_time),
    { message: 'Fechamento deve ser maior que abertura', path: ['close_time'] },
  )
  .refine(
    (h) =>
      !h.break_start || !h.break_end || h.break_start < h.break_end,
    { message: 'Fim do intervalo deve ser maior que início', path: ['break_end'] },
  )

export type BusinessHourInput = z.infer<typeof hourSchema>

export async function updateBusinessHours(
  hours: BusinessHourInput[],
): Promise<ActionResult<void>> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: 'Não autenticado' }

  const parsed = z.array(hourSchema).length(7).safeParse(hours)
  if (!parsed.success) {
    return { ok: false, error: 'Dados inválidos: ' + parsed.error.issues[0]?.message }
  }

  const supabase = await createSupabase()
  const rows = parsed.data.map((h) => ({
    tenant_id: user.tenantId,
    day_of_week: h.day_of_week,
    is_open: h.is_open,
    open_time: h.is_open ? h.open_time ?? null : null,
    close_time: h.is_open ? h.close_time ?? null : null,
    break_start: h.is_open ? h.break_start ?? null : null,
    break_end: h.is_open ? h.break_end ?? null : null,
  }))

  const { error } = await supabase
    .from('business_hours')
    .upsert(rows as never, { onConflict: 'tenant_id,day_of_week' })

  if (error) return { ok: false, error: error.message }

  revalidatePath('/settings/hours')
  return { ok: true, data: undefined }
}

const tenantSchema = z.object({
  name: z.string().trim().min(2).optional(),
  phone: z.string().trim().optional().nullable(),
  email: z.string().trim().email().optional().nullable(),
})

export async function updateTenantSettings(
  formData: FormData,
): Promise<ActionResult<void>> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: 'Não autenticado' }

  const parsed = tenantSchema.safeParse({
    name: formData.get('name') ?? undefined,
    phone: formData.get('phone') ?? undefined,
    email: formData.get('email') ?? undefined,
  })
  if (!parsed.success) return { ok: false, error: 'Campos inválidos' }

  const supabase = await createSupabase()
  const { error } = await supabase
    .from('tenants')
    .update(parsed.data as never)
    .eq('id', user.tenantId)

  if (error) return { ok: false, error: error.message }

  revalidatePath('/settings')
  return { ok: true, data: undefined }
}
