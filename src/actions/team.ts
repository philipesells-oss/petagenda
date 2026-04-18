'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import type { ActionResult } from '@/types'

const createEmployeeSchema = z.object({
  full_name: z.string().trim().min(2, 'Nome obrigatório'),
  email: z.string().trim().email('E-mail inválido'),
  password: z.string().min(6, 'Senha mínima de 6 caracteres'),
  role: z.enum(['employee', 'admin']).default('employee'),
})

export async function createEmployeeAction(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const caller = await getCurrentUser()
  if (!caller) return { ok: false, error: 'Não autenticado' }
  if (caller.role !== 'owner' && caller.role !== 'admin') {
    return { ok: false, error: 'Permissão negada' }
  }

  const parsed = createEmployeeSchema.safeParse({
    full_name: formData.get('full_name'),
    email: formData.get('email'),
    password: formData.get('password'),
    role: formData.get('role'),
  })
  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => i.message).join(', ')
    return { ok: false, error: msg }
  }

  const admin = createAdminClient()

  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
  })

  if (authError || !authData.user) {
    return { ok: false, error: authError?.message ?? 'Erro ao criar usuário' }
  }

  // Supabase may have a trigger that auto-inserts into users on auth.user creation.
  // Use upsert to handle both cases (no trigger → insert, trigger fired → update).
  const { error: profileError } = await admin.from('users').upsert({
    id: authData.user.id,
    tenant_id: caller.tenantId,
    full_name: parsed.data.full_name,
    role: parsed.data.role,
    is_active: true,
  } as never, { onConflict: 'id' })

  if (profileError) {
    await admin.auth.admin.deleteUser(authData.user.id)
    return { ok: false, error: profileError.message }
  }

  revalidatePath('/settings/team')
  return { ok: true, data: { id: authData.user.id } }
}

export async function deactivateEmployeeAction(
  employeeId: string,
): Promise<ActionResult<void>> {
  const caller = await getCurrentUser()
  if (!caller) return { ok: false, error: 'Não autenticado' }
  if (caller.role !== 'owner' && caller.role !== 'admin') {
    return { ok: false, error: 'Permissão negada' }
  }

  const admin = createAdminClient()
  const { error } = await admin
    .from('users')
    .update({ is_active: false } as never)
    .eq('id', employeeId)
    .eq('tenant_id', caller.tenantId)

  if (error) return { ok: false, error: error.message }

  revalidatePath('/settings/team')
  return { ok: true, data: undefined }
}
