'use server'

/**
 * Services CRUD — Server Actions for `services` table.
 *
 * RLS ensures tenant isolation; we still resolve tenant from the authenticated
 * user for defense in depth and to populate tenant_id on insert.
 */

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { getCurrentUser } from '@/lib/auth/get-current-user'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult, ServiceCategory } from '@/types'

const CATEGORIES: readonly ServiceCategory[] = [
  'grooming',
  'veterinary',
  'daycare',
  'other',
] as const

const priceBySizeSchema = z
  .object({
    small: z.number().nonnegative().optional(),
    medium: z.number().nonnegative().optional(),
    large: z.number().nonnegative().optional(),
    giant: z.number().nonnegative().optional(),
  })
  .partial()
  .optional()

const serviceSchema = z.object({
  name: z.string().min(2, 'Nome obrigatório'),
  description: z.string().optional().nullable(),
  category: z.enum(CATEGORIES),
  duration_minutes: z
    .number()
    .int()
    .min(5, 'Mínimo 5 min')
    .max(24 * 60),
  price: z.number().nonnegative(),
  price_by_size: priceBySizeSchema.nullable(),
  color: z.string().nullable().optional(),
})

export type ServiceFormValues = z.infer<typeof serviceSchema>

function parseNumber(v: FormDataEntryValue | null): number {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

function optionalNumber(v: FormDataEntryValue | null): number | undefined {
  if (v == null || v === '') return undefined
  const n = Number(v)
  return Number.isFinite(n) ? n : undefined
}

function extractValues(formData: FormData): ServiceFormValues {
  const pbs = {
    small: optionalNumber(formData.get('price_small')),
    medium: optionalNumber(formData.get('price_medium')),
    large: optionalNumber(formData.get('price_large')),
    giant: optionalNumber(formData.get('price_giant')),
  }
  const hasAny = Object.values(pbs).some((x) => x !== undefined)
  return {
    name: String(formData.get('name') ?? ''),
    description: (formData.get('description') as string) || null,
    category: (formData.get('category') as ServiceCategory) || 'other',
    duration_minutes: parseNumber(formData.get('duration_minutes')),
    price: parseNumber(formData.get('price')),
    price_by_size: hasAny ? pbs : null,
    color: (formData.get('color') as string) || null,
  }
}

export async function createService(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: 'Não autenticado' }

  const parsed = serviceSchema.safeParse(extractValues(formData))
  if (!parsed.success) {
    return {
      ok: false,
      error: 'Dados inválidos',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    }
  }

  const supabase = await createClient()
  const insertRow = {
    tenant_id: user.tenantId,
    name: parsed.data.name,
    description: parsed.data.description ?? null,
    category: parsed.data.category,
    duration_minutes: parsed.data.duration_minutes,
    price: parsed.data.price,
    price_by_size: parsed.data.price_by_size ?? null,
    color: parsed.data.color ?? null,
  }
  const { data, error } = await supabase
    .from('services')
    .insert(insertRow as never)
    .select('id')
    .single<{ id: string }>()

  if (error || !data) {
    return { ok: false, error: error?.message ?? 'Falha ao criar serviço' }
  }

  revalidatePath('/settings/services')
  return { ok: true, data: { id: data.id } }
}

export async function updateService(
  id: string,
  formData: FormData,
): Promise<ActionResult<null>> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: 'Não autenticado' }

  const parsed = serviceSchema.safeParse(extractValues(formData))
  if (!parsed.success) {
    return {
      ok: false,
      error: 'Dados inválidos',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    }
  }

  const supabase = await createClient()
  const updateRow = {
    name: parsed.data.name,
    description: parsed.data.description ?? null,
    category: parsed.data.category,
    duration_minutes: parsed.data.duration_minutes,
    price: parsed.data.price,
    price_by_size: parsed.data.price_by_size ?? null,
    color: parsed.data.color ?? null,
  }
  const { error } = await supabase
    .from('services')
    .update(updateRow as never)
    .eq('id', id)
    .eq('tenant_id', user.tenantId)

  if (error) return { ok: false, error: error.message }

  revalidatePath('/settings/services')
  return { ok: true, data: null }
}

export async function toggleServiceStatus(
  id: string,
  isActive: boolean,
): Promise<ActionResult<null>> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: 'Não autenticado' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('services')
    .update({ is_active: isActive } as never)
    .eq('id', id)
    .eq('tenant_id', user.tenantId)

  if (error) return { ok: false, error: error.message }

  revalidatePath('/settings/services')
  return { ok: true, data: null }
}
