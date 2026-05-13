import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { dayOfWeek, timeToMinutes, minutesToTime, SLOT_STEP_MIN } from '@/lib/agenda/grid'
import type { TenantRow, ServiceRow, BusinessHourRow, BlockedSlotRow, AppointmentRow } from '@/types'

function overlaps(aS: number, aE: number, bS: number, bE: number) {
  return aS < bE && bS < aE
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date')
  const serviceId = searchParams.get('serviceId')

  if (!date || !serviceId || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 })
  }

  const today = new Date().toISOString().slice(0, 10)
  if (date < today) return NextResponse.json({ slots: [] })

  const admin = createAdminClient()

  const { data: t } = await admin.from('tenants').select('*').eq('slug', slug).maybeSingle()
  const tenant = t as TenantRow | null
  if (!tenant?.public_booking_enabled) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

  const dow = dayOfWeek(date)

  const { data: bhData } = await admin
    .from('business_hours').select('*').eq('tenant_id', tenant.id).eq('day_of_week', dow).maybeSingle()
  const bh = bhData as BusinessHourRow | null
  if (!bh?.is_open || !bh.open_time || !bh.close_time) return NextResponse.json({ slots: [] })

  const { data: svcData } = await admin
    .from('services').select('*').eq('tenant_id', tenant.id).eq('id', serviceId).eq('is_active', true).maybeSingle()
  const svc = svcData as ServiceRow | null
  if (!svc) return NextResponse.json({ slots: [] })

  const durationMin = svc.duration_minutes
  const maxCapacity = (svc as ServiceRow & { max_capacity?: number }).max_capacity ?? 1

  const { data: apptsData } = await admin
    .from('appointments').select('*').eq('tenant_id', tenant.id).eq('date', date).not('status', 'in', '(canceled,no_show)')
  const appts = (apptsData ?? []) as AppointmentRow[]

  const { data: blockedData } = await admin
    .from('blocked_slots').select('*').eq('tenant_id', tenant.id).eq('date', date).is('user_id', null)
  const blocked = (blockedData ?? []) as BlockedSlotRow[]

  const openMin = timeToMinutes(bh.open_time)
  const closeMin = timeToMinutes(bh.close_time)
  const breakStart = bh.break_start ? timeToMinutes(bh.break_start) : null
  const breakEnd = bh.break_end ? timeToMinutes(bh.break_end) : null

  const slots: Array<{ time: string; available: boolean }> = []
  for (let cur = openMin; cur + durationMin <= closeMin; cur += SLOT_STEP_MIN) {
    const slotEnd = cur + durationMin
    if (breakStart !== null && breakEnd !== null && overlaps(cur, slotEnd, breakStart, breakEnd)) {
      slots.push({ time: minutesToTime(cur), available: false }); continue
    }
    const booked = appts.filter((a) => overlaps(cur, slotEnd, timeToMinutes(a.start_time), timeToMinutes(a.end_time))).length
    if (booked >= maxCapacity) { slots.push({ time: minutesToTime(cur), available: false }); continue }
    const isBlocked = blocked.some((b) => overlaps(cur, slotEnd, timeToMinutes(b.start_time), timeToMinutes(b.end_time)))
    slots.push({ time: minutesToTime(cur), available: !isBlocked })
  }

  return NextResponse.json({ slots })
}
