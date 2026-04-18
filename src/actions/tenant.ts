'use server'

/**
 * Tenant Server Actions
 */

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import type { ActionResult } from '@/types'

const tenantProfileSchema = z.object({
  name: z.string().trim().min(2, 'Nome obrigatório'),
  phone: z.string().trim().optional().nullable(),
  address: z.string().trim().optional().nullable(),
})

export async function updateTenantProfile(
  formData: FormData,
): Promise<ActionResult<void>> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, error: 'Não autenticado' }

  const parsed = tenantProfileSchema.safeParse({
    name: formData.get('name'),
    phone: formData.get('phone') ?? null,
    address: formData.get('address') ?? null,
  })
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Campos inválidos' }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('tenants')
    .update({
      name: parsed.data.name,
      phone: parsed.data.phone || null,
      address: parsed.data.address || null,
    } as never)
    .eq('id', user.tenantId)

  if (error) return { ok: false, error: error.message }

  revalidatePath('/settings/profile')
  revalidatePath('/settings')
  return { ok: true, data: undefined }
}
