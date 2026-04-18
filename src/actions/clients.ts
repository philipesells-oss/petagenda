'use server'

/**
 * Clients & Pets Server Actions — Story 1.6
 */

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient as createSupabase } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { stripPhone } from '@/lib/utils/format'
import type { ActionResult } from '@/types'

const clientSchema = z.object({
  full_name: z.string().trim().min(2, 'Nome obrigatório'),
  phone: z
    .string()
    .trim()
    .transform(stripPhone)
    .refine((v) => v.length >= 8 && v.length <= 13, 'Telefone inválido'),
  email: z
    .preprocess(
      (v) => (typeof v === 'string' && v.trim() !== '' ? v.trim().toLowerCase() : null),
      z.string().email('E-mail inválido').nullable(),
    ),
  cpf: z
    .preprocess(
      (v) => (typeof v === 'string' && v.trim() !== '' ? v.replace(/\D/g, '') : null),
      z.string().nullable(),
    ),
  notes: z.preprocess(
    (v) => (typeof v === 'string' && v.trim() !== '' ? v.trim() : null),
    z.string().nullable(),
  ),
  whatsapp_opt_in: z.boolean().optional(),
})

const petSchema = z.object({
  name: z.string().trim().min(1, 'Nome obrigatório'),
  species: z.enum(['dog', 'cat', 'bird', 'other']),
  breed: z.preprocess(
    (v) => (typeof v === 'string' && v.trim() !== '' ? v.trim() : null),
    z.string().nullable(),
  ),
  size: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? null : v),
    z.enum(['small', 'medium', 'large', 'giant']).nullable(),
  ),
  weight: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? null : Number(v)),
    z.number().positive().nullable(),
  ),
  birth_date: z.preprocess(
    (v) => (typeof v === 'string' && v.trim() !== '' ? v : null),
    z.string().nullable(),
  ),
  gender: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? null : v),
    z.enum(['male', 'female']).nullable(),
  ),
  coat_type: z.preprocess(
    (v) => (typeof v === 'string' && v.trim() !== '' ? v.trim() : null),
    z.string().nullable(),
  ),
  temperament: z.preprocess(
    (v) => (typeof v === 'string' && v.trim() !== '' ? v.trim() : null),
    z.string().nullable(),
  ),
  health_notes: z.preprocess(
    (v) => (typeof v === 'string' && v.trim() !== '' ? v.trim() : null),
    z.string().nullable(),
  ),
})

function formatErr<T>(err: z.ZodError<T>): ActionResult<never> {
  const fieldErrors: Record<string, string[]> = {}
  for (const issue of err.issues) {
    const key = issue.path.join('.') || '_'
    fieldErrors[key] = [...(fieldErrors[key] ?? []), issue.message]
  }
  return { ok: false, error: 'Confira os campos destacados.', fieldErrors }
}

function fdToObj(formData: FormData): Record<string, unknown> {
  const o: Record<string, unknown> = {}
  formData.forEach((v, k) => {
    if (k === 'whatsapp_opt_in') o[k] = v === 'on' || v === 'true'
    else o[k] = v
  })
  return o
}

// ---------------------------------------------------------------------------
// Clients
// ---------------------------------------------------------------------------

export async function createClientAction(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: 'Não autenticado' }

  const parsed = clientSchema.safeParse(fdToObj(formData))
  if (!parsed.success) return formatErr(parsed.error)

  const supabase = await createSupabase()
  const { data, error } = await supabase
    .from('clients')
    .insert({
      tenant_id: user.tenantId,
      full_name: parsed.data.full_name,
      phone: parsed.data.phone,
      email: parsed.data.email,
      cpf: parsed.data.cpf,
      notes: parsed.data.notes,
      whatsapp_opt_in: parsed.data.whatsapp_opt_in ?? true,
    } as never)
    .select('id')
    .single()

  if (error || !data) return { ok: false, error: error?.message ?? 'Erro ao criar cliente' }

  revalidatePath('/clients')
  return { ok: true, data: { id: (data as { id: string }).id } }
}

export async function updateClientAction(
  id: string,
  formData: FormData,
): Promise<ActionResult<void>> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: 'Não autenticado' }

  const parsed = clientSchema.safeParse(fdToObj(formData))
  if (!parsed.success) return formatErr(parsed.error)

  const supabase = await createSupabase()
  const { error } = await supabase
    .from('clients')
    .update({
      full_name: parsed.data.full_name,
      phone: parsed.data.phone,
      email: parsed.data.email,
      cpf: parsed.data.cpf,
      notes: parsed.data.notes,
      whatsapp_opt_in: parsed.data.whatsapp_opt_in ?? true,
    } as never)
    .eq('id', id)
    .eq('tenant_id', user.tenantId)

  if (error) return { ok: false, error: error.message }

  revalidatePath('/clients')
  revalidatePath(`/clients/${id}`)
  return { ok: true, data: undefined }
}

// ---------------------------------------------------------------------------
// Pets
// ---------------------------------------------------------------------------

export async function createPetAction(
  clientId: string,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: 'Não autenticado' }

  const parsed = petSchema.safeParse(fdToObj(formData))
  if (!parsed.success) return formatErr(parsed.error)

  const supabase = await createSupabase()
  const { data, error } = await supabase
    .from('pets')
    .insert({
      tenant_id: user.tenantId,
      client_id: clientId,
      ...parsed.data,
    } as never)
    .select('id')
    .single()

  if (error || !data) return { ok: false, error: error?.message ?? 'Erro ao criar pet' }

  revalidatePath(`/clients/${clientId}`)
  return { ok: true, data: { id: (data as { id: string }).id } }
}

export async function updatePetAction(
  id: string,
  formData: FormData,
): Promise<ActionResult<void>> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: 'Não autenticado' }

  const parsed = petSchema.safeParse(fdToObj(formData))
  if (!parsed.success) return formatErr(parsed.error)

  const supabase = await createSupabase()
  const { data: pet, error } = await supabase
    .from('pets')
    .update(parsed.data as never)
    .eq('id', id)
    .eq('tenant_id', user.tenantId)
    .select('client_id')
    .single()

  if (error) return { ok: false, error: error.message }

  const clientId = (pet as { client_id: string } | null)?.client_id
  if (clientId) revalidatePath(`/clients/${clientId}`)
  return { ok: true, data: undefined }
}

export async function uploadPetPhotoAction(
  petId: string,
  formData: FormData,
): Promise<ActionResult<{ url: string }>> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: 'Não autenticado' }

  const file = formData.get('file') as File | null
  if (!file || file.size === 0) return { ok: false, error: 'Nenhum arquivo enviado' }

  const ext = (file.name.split('.').pop() ?? 'jpg').toLowerCase()
  const path = `${user.tenantId}/${petId}.${ext}`

  const supabase = await createSupabase()
  const { error } = await supabase.storage.from('pets').upload(path, file, {
    upsert: true,
    contentType: file.type || 'image/jpeg',
  })
  if (error) return { ok: false, error: error.message }

  const { data: pub } = supabase.storage.from('pets').getPublicUrl(path)
  const url = pub.publicUrl

  await supabase
    .from('pets')
    .update({ photo_url: url } as never)
    .eq('id', petId)
    .eq('tenant_id', user.tenantId)

  return { ok: true, data: { url } }
}
