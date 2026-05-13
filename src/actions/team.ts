'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import type { ActionResult } from '@/types'

const createEmployeeSchema = z.object({
  full_name: z.string().trim().min(2, 'Nome obrigatório'),
  email: z.string().trim().email('E-mail inválido'),
  password: z.string().min(8, 'Senha mínima de 8 caracteres'),
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

// ── Employee schedule ──────────────────────────────────────────────────────

export interface EmployeeScheduleDay {
  dayOfWeek: number
  isWorking: boolean
  startTime: string
  endTime: string
}

const DAYS = [0, 1, 2, 3, 4, 5, 6]

export async function getEmployeeScheduleAction(
  employeeId: string,
): Promise<ActionResult<EmployeeScheduleDay[]>> {
  const caller = await getCurrentUser()
  if (!caller) return { ok: false, error: 'Não autenticado' }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('employee_schedules')
    .select('day_of_week, is_working, start_time, end_time')
    .eq('tenant_id', caller.tenantId)
    .eq('user_id', employeeId)
    .order('day_of_week')

  if (error) return { ok: false, error: error.message }

  const existing = new Map(
    (data ?? []).map((d: { day_of_week: number; is_working: boolean; start_time: string | null; end_time: string | null }) => [d.day_of_week, d]),
  )

  const result: EmployeeScheduleDay[] = DAYS.map((dow) => {
    const e = existing.get(dow)
    return {
      dayOfWeek: dow,
      isWorking: e ? e.is_working : dow >= 1 && dow <= 5,
      startTime: e?.start_time?.slice(0, 5) ?? '08:00',
      endTime: e?.end_time?.slice(0, 5) ?? '18:00',
    }
  })

  return { ok: true, data: result }
}

export async function saveEmployeeScheduleAction(
  employeeId: string,
  schedules: EmployeeScheduleDay[],
): Promise<ActionResult<void>> {
  const caller = await getCurrentUser()
  if (!caller) return { ok: false, error: 'Não autenticado' }
  if (caller.role !== 'owner' && caller.role !== 'admin') {
    return { ok: false, error: 'Permissão negada' }
  }

  const admin = createAdminClient()

  const { data: empCheck } = await admin
    .from('users')
    .select('id')
    .eq('id', employeeId)
    .eq('tenant_id', caller.tenantId)
    .single()

  if (!empCheck) return { ok: false, error: 'Funcionário não encontrado' }

  const rows = schedules.map((s) => ({
    tenant_id: caller.tenantId,
    user_id: employeeId,
    day_of_week: s.dayOfWeek,
    is_working: s.isWorking,
    start_time: s.isWorking ? s.startTime : null,
    end_time: s.isWorking ? s.endTime : null,
  }))

  const { error } = await admin
    .from('employee_schedules')
    .upsert(rows as never, { onConflict: 'user_id,day_of_week' })

  if (error) return { ok: false, error: error.message }

  revalidatePath('/settings/team')
  revalidatePath('/agenda')
  return { ok: true, data: undefined }
}

// ── Update employee ────────────────────────────────────────────────────────

export async function updateEmployeeAction(
  employeeId: string,
  data: { full_name: string; role: 'employee' | 'admin' },
): Promise<ActionResult<void>> {
  const caller = await getCurrentUser()
  if (!caller) return { ok: false, error: 'Não autenticado' }
  if (caller.role !== 'owner' && caller.role !== 'admin') {
    return { ok: false, error: 'Permissão negada' }
  }

  const admin = createAdminClient()
  const { error } = await admin
    .from('users')
    .update({ full_name: data.full_name, role: data.role } as never)
    .eq('id', employeeId)
    .eq('tenant_id', caller.tenantId)

  if (error) return { ok: false, error: error.message }

  revalidatePath('/settings/team')
  return { ok: true, data: undefined }
}

// ── Employee services ──────────────────────────────────────────────────────

export async function getEmployeeServicesAction(
  employeeId: string,
): Promise<ActionResult<string[]>> {
  const caller = await getCurrentUser()
  if (!caller) return { ok: false, error: 'Não autenticado' }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('employee_services')
    .select('service_id')
    .eq('tenant_id', caller.tenantId)
    .eq('user_id', employeeId)

  if (error) return { ok: false, error: error.message }

  return { ok: true, data: (data ?? []).map((r: { service_id: string }) => r.service_id) }
}

export async function saveEmployeeServicesAction(
  employeeId: string,
  serviceIds: string[],
): Promise<ActionResult<void>> {
  const caller = await getCurrentUser()
  if (!caller) return { ok: false, error: 'Não autenticado' }
  if (caller.role !== 'owner' && caller.role !== 'admin') {
    return { ok: false, error: 'Permissão negada' }
  }

  const admin = createAdminClient()

  // Delete all existing
  const { error: delError } = await admin
    .from('employee_services')
    .delete()
    .eq('user_id', employeeId)
    .eq('tenant_id', caller.tenantId)

  if (delError) return { ok: false, error: delError.message }

  // Re-insert if any selected
  if (serviceIds.length > 0) {
    const rows = serviceIds.map((sid) => ({
      tenant_id: caller.tenantId,
      user_id: employeeId,
      service_id: sid,
    }))
    const { error: insError } = await admin
      .from('employee_services')
      .insert(rows as never)

    if (insError) return { ok: false, error: insError.message }
  }

  revalidatePath('/settings/team')
  return { ok: true, data: undefined }
}

// ── Get employees by service (for appointment form) ───────────────────────
// Returns all active employees who either:
//   (a) have the serviceId in employee_services, OR
//   (b) have NO rows in employee_services at all (can do everything)

export async function getEmployeesByServiceAction(
  serviceId: string,
): Promise<ActionResult<{ id: string; full_name: string }[]>> {
  const caller = await getCurrentUser()
  if (!caller) return { ok: false, error: 'Não autenticado' }

  const admin = createAdminClient()

  // Fetch all active employees for this tenant
  const { data: allEmployees, error: empError } = await admin
    .from('users')
    .select('id, full_name')
    .eq('tenant_id', caller.tenantId)
    .eq('is_active', true)
    .order('full_name')

  if (empError) return { ok: false, error: empError.message }
  if (!allEmployees || allEmployees.length === 0) return { ok: true, data: [] }

  // Fetch all employee_services rows for this tenant
  const { data: allEmpServices, error: esError } = await admin
    .from('employee_services')
    .select('user_id, service_id')
    .eq('tenant_id', caller.tenantId)

  if (esError) return { ok: false, error: esError.message }

  // Build a set of user_ids that have any employee_services entries
  const employeesWithRestrictions = new Set(
    (allEmpServices ?? []).map((r: { user_id: string; service_id: string }) => r.user_id),
  )

  // Build a set of user_ids that have THIS specific service
  const employeesWithThisService = new Set(
    (allEmpServices ?? [])
      .filter((r: { user_id: string; service_id: string }) => r.service_id === serviceId)
      .map((r: { user_id: string; service_id: string }) => r.user_id),
  )

  const filtered = (allEmployees as { id: string; full_name: string }[]).filter((u) => {
    // (a) has this service explicitly, OR (b) has no restrictions at all
    return employeesWithThisService.has(u.id) || !employeesWithRestrictions.has(u.id)
  })

  return { ok: true, data: filtered }
}

// ── Get services by employee (for appointment form) ────────────────────────
// If employee has employee_services rows → return those services
// Else return all tenant services

export async function getServicesByEmployeeAction(
  employeeId: string,
): Promise<ActionResult<{ id: string; name: string; duration_minutes: number; price: number; is_active: boolean }[]>> {
  const caller = await getCurrentUser()
  if (!caller) return { ok: false, error: 'Não autenticado' }

  const supabase = await createClient()

  // Check if employee has any service restrictions
  const { data: empServices, error: empError } = await supabase
    .from('employee_services')
    .select('service_id')
    .eq('tenant_id', caller.tenantId)
    .eq('user_id', employeeId)

  if (empError) return { ok: false, error: empError.message }

  if (empServices && empServices.length > 0) {
    const serviceIds = empServices.map((r: { service_id: string }) => r.service_id)
    const { data, error } = await supabase
      .from('services')
      .select('id, name, duration_minutes, price, is_active')
      .eq('tenant_id', caller.tenantId)
      .eq('is_active', true)
      .in('id', serviceIds)
      .order('name')

    if (error) return { ok: false, error: error.message }
    return { ok: true, data: data ?? [] }
  }

  // No restrictions — return all tenant services
  const { data, error } = await supabase
    .from('services')
    .select('id, name, duration_minutes, price, is_active')
    .eq('tenant_id', caller.tenantId)
    .eq('is_active', true)
    .order('name')

  if (error) return { ok: false, error: error.message }
  return { ok: true, data: data ?? [] }
}
