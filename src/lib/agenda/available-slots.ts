/**
 * Available Slots computation — Story 1.7 (SERVER-ONLY).
 *
 * Given a tenant, date and service, returns the list of 30-min slots
 * between open_time and close_time (minus break) and marks each one as
 * available/unavailable based on existing appointments and blocked_slots.
 */

import 'server-only'
import { createClient } from '@/lib/supabase/server'
import {
  SLOT_STEP_MIN,
  dayOfWeek,
  minutesToTime,
  timeToMinutes,
} from './grid'

export {
  buildDayGrid,
  timeToMinutes,
  minutesToTime,
  dayOfWeek,
  SLOT_STEP_MIN,
} from './grid'

export interface TimeSlot {
  /** 'HH:MM' (24h) */
  time: string
  available: boolean
  /** Reason for unavailability (for UI tooltips) */
  reason?: 'closed' | 'break' | 'booked' | 'blocked' | 'outside'
}

// Overlap: [aStart,aEnd) ∩ [bStart,bEnd) != ∅
function overlaps(
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number,
): boolean {
  return aStart < bEnd && bStart < aEnd
}

export async function getAvailableSlots(
  tenantId: string,
  date: string,
  serviceId: string,
  employeeId?: string,
): Promise<TimeSlot[]> {
  const supabase = await createClient()

  // 1. Business hours for this day-of-week
  const dow = dayOfWeek(date)
  const { data: bh } = await supabase
    .from('business_hours')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('day_of_week', dow)
    .maybeSingle<{
      is_open: boolean
      open_time: string | null
      close_time: string | null
      break_start: string | null
      break_end: string | null
    }>()

  if (!bh || !bh.is_open || !bh.open_time || !bh.close_time) return []

  // 2. Service duration
  const { data: svc } = await supabase
    .from('services')
    .select('duration_minutes')
    .eq('tenant_id', tenantId)
    .eq('id', serviceId)
    .maybeSingle<{ duration_minutes: number }>()

  const durationMin = svc?.duration_minutes ?? 30

  // 3. Existing appointments on this date (exclude canceled / no_show)
  let apptsQ = supabase
    .from('appointments')
    .select('start_time, end_time, assigned_to, status')
    .eq('tenant_id', tenantId)
    .eq('date', date)
    .not('status', 'in', '(canceled,no_show)')

  if (employeeId) {
    apptsQ = apptsQ.or(`assigned_to.eq.${employeeId},assigned_to.is.null`)
  }

  const apptsRes = await apptsQ
  const appts = (apptsRes.data ?? []) as Array<{
    start_time: string
    end_time: string
    assigned_to: string | null
    status: string
  }>

  // 4. Blocked slots on this date
  let blockedQ = supabase
    .from('blocked_slots')
    .select('start_time, end_time, user_id')
    .eq('tenant_id', tenantId)
    .eq('date', date)

  if (employeeId) {
    blockedQ = blockedQ.or(`user_id.eq.${employeeId},user_id.is.null`)
  }

  const blockedRes = await blockedQ
  const blocked = (blockedRes.data ?? []) as Array<{
    start_time: string
    end_time: string
    user_id: string | null
  }>

  // 5. Generate grid
  const openMin = timeToMinutes(bh.open_time)
  const closeMin = timeToMinutes(bh.close_time)
  const breakStart = bh.break_start ? timeToMinutes(bh.break_start) : null
  const breakEnd = bh.break_end ? timeToMinutes(bh.break_end) : null

  const slots: TimeSlot[] = []

  for (let cur = openMin; cur + durationMin <= closeMin; cur += SLOT_STEP_MIN) {
    const slotEnd = cur + durationMin

    if (
      breakStart !== null &&
      breakEnd !== null &&
      overlaps(cur, slotEnd, breakStart, breakEnd)
    ) {
      slots.push({ time: minutesToTime(cur), available: false, reason: 'break' })
      continue
    }

    const bookedConflict = appts.some((a) =>
      overlaps(cur, slotEnd, timeToMinutes(a.start_time), timeToMinutes(a.end_time)),
    )
    if (bookedConflict) {
      slots.push({ time: minutesToTime(cur), available: false, reason: 'booked' })
      continue
    }

    const blockedConflict = blocked.some((b) =>
      overlaps(cur, slotEnd, timeToMinutes(b.start_time), timeToMinutes(b.end_time)),
    )
    if (blockedConflict) {
      slots.push({ time: minutesToTime(cur), available: false, reason: 'blocked' })
      continue
    }

    slots.push({ time: minutesToTime(cur), available: true })
  }

  return slots
}
