import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { dayOfWeek, timeToMinutes, SLOT_STEP_MIN } from '@/lib/agenda/grid'
import type { TenantRow, ServiceRow, BusinessHourRow, AppointmentRow, BlockedSlotRow, ClientRow, PetRow } from '@/types'

const bookSchema = z.object({
  serviceId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  clientName: z.string().trim().min(2).max(120),
  clientPhone: z.string().trim().min(8).max(20),
  petName: z.string().trim().min(1).max(80),
  petSpecies: z.enum(['dog', 'cat', 'bird', 'other']),
})

function overlaps(aS: number, aE: number, bS: number, bE: number) {
  return aS < bE && bS < aE
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params

  const ip = await getClientIp()
  const rl = await checkRateLimit({ namespace: 'public_booking', identifier: ip, limit: 5, windowSeconds: 3600 })
  if (!rl.success) {
    return NextResponse.json({ error: 'Muitas tentativas. Tente novamente em 1 hora.' }, { status: 429 })
  }

  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Payload inválido' }, { status: 400 }) }

  const parsed = bookSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Dados inválidos' }, { status: 422 })
  }

  const { serviceId, date, time, clientName, clientPhone, petName, petSpecies } = parsed.data
  const today = new Date().toISOString().slice(0, 10)
  if (date < today) return NextResponse.json({ error: 'Data inválida' }, { status: 422 })

  const admin = createAdminClient()

  const { data: t } = await admin.from('tenants').select('*').eq('slug', slug).maybeSingle()
  const tenant = t as TenantRow | null
  if (!tenant?.public_booking_enabled) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

  const { data: s } = await admin.from('services').select('*').eq('tenant_id', tenant.id).eq('id', serviceId).eq('is_active', true).maybeSingle()
  const svc = s as ServiceRow | null
  if (!svc) return NextResponse.json({ error: 'Serviço não encontrado' }, { status: 404 })

  const durationMin = svc.duration_minutes
  const maxCapacity = (svc as ServiceRow & { max_capacity?: number }).max_capacity ?? 1

  const dow = dayOfWeek(date)
  const { data: bhData } = await admin.from('business_hours').select('*').eq('tenant_id', tenant.id).eq('day_of_week', dow).maybeSingle()
  const bh = bhData as BusinessHourRow | null
  if (!bh?.is_open || !bh.open_time || !bh.close_time) {
    return NextResponse.json({ error: 'Unidade fechada neste dia' }, { status: 422 })
  }

  const openMin = timeToMinutes(bh.open_time)
  const closeMin = timeToMinutes(bh.close_time)
  const slotStart = timeToMinutes(time)
  const slotEnd = slotStart + durationMin

  if (slotStart < openMin || slotEnd > closeMin || (slotStart - openMin) % SLOT_STEP_MIN !== 0) {
    return NextResponse.json({ error: 'Horário inválido' }, { status: 422 })
  }

  const { data: apptsData } = await admin.from('appointments').select('*').eq('tenant_id', tenant.id).eq('date', date).not('status', 'in', '(canceled,no_show)')
  const appts = (apptsData ?? []) as AppointmentRow[]
  const overlap = appts.filter((a) => overlaps(slotStart, slotEnd, timeToMinutes(a.start_time), timeToMinutes(a.end_time))).length
  if (overlap >= maxCapacity) return NextResponse.json({ error: 'Horário não está mais disponível. Escolha outro.' }, { status: 409 })

  const { data: blockedData } = await admin.from('blocked_slots').select('*').eq('tenant_id', tenant.id).eq('date', date).is('user_id', null)
  const blocked = (blockedData ?? []) as BlockedSlotRow[]
  if (blocked.some((b) => overlaps(slotStart, slotEnd, timeToMinutes(b.start_time), timeToMinutes(b.end_time)))) {
    return NextResponse.json({ error: 'Horário bloqueado. Escolha outro.' }, { status: 409 })
  }

  const normalizedPhone = clientPhone.replace(/\D/g, '').replace(/^55/, '')

  const { data: ec } = await admin.from('clients').select('*').eq('tenant_id', tenant.id).eq('phone', normalizedPhone).maybeSingle()
  const existingClient = ec as ClientRow | null

  let clientId: string
  if (existingClient) {
    clientId = existingClient.id
    await admin.from('clients').update({ full_name: clientName, updated_at: new Date().toISOString() } as never).eq('id', clientId)
  } else {
    const { data: nc, error: ce } = await admin.from('clients').insert({ tenant_id: tenant.id, full_name: clientName, phone: normalizedPhone, status: 'active' } as never).select('id').single()
    if (ce || !nc) return NextResponse.json({ error: 'Erro ao salvar dados do cliente' }, { status: 500 })
    clientId = (nc as { id: string }).id
  }

  const { data: ep } = await admin.from('pets').select('*').eq('client_id', clientId).eq('tenant_id', tenant.id).ilike('name', petName.trim()).maybeSingle()
  const existingPet = ep as PetRow | null

  let petId: string
  if (existingPet) {
    petId = existingPet.id
  } else {
    const { data: np, error: pe } = await admin.from('pets').insert({ tenant_id: tenant.id, client_id: clientId, name: petName.trim(), species: petSpecies } as never).select('id').single()
    if (pe || !np) return NextResponse.json({ error: 'Erro ao salvar dados do pet' }, { status: 500 })
    petId = (np as { id: string }).id
  }

  const endH = Math.floor(slotEnd / 60) % 24
  const endM = slotEnd % 60
  const endTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`

  const { data: appt, error: ae } = await admin.from('appointments').insert({
    tenant_id: tenant.id, client_id: clientId, pet_id: petId, service_id: serviceId,
    date, start_time: time, end_time: endTime, status: 'scheduled',
    price: Number(svc.price), source: 'public_booking',
  } as never).select('id').single()

  if (ae || !appt) return NextResponse.json({ error: 'Erro ao criar agendamento' }, { status: 500 })

  return NextResponse.json({ appointmentId: (appt as { id: string }).id, date, time, endTime, serviceName: svc.name })
}
