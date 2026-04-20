/**
 * Available Slots computation — Story 1.7 (SERVER-ONLY).
 *
 * Given a tenant, date and service, returns the list of 30-min slots
 * between open_time and close_time (minus break) and marks each one as
 * available/unavailable based on existing appointments and blocked_slots.
 *
 * When employeeId is provided the employee's own schedule takes precedence
 * over shop hours. If no schedule row exists for that employee/day, shop
 * hours are used as fallback.
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

  const dow = dayOfWeek(date)

  // 1. Resolve working window for the day
  //    Employee schedule → shop hours fallback → closed
  let openTime: string
  let closeTime: string
  let breakStartTime: string | null = null
  let breakEndTime: string | null = null

  if (employeeId) {
    const { data: empSched } = await supabase
      .from('employee_schedules')
      .select('is_working, start_time, end_time')
      .eq('tenant_id', tenantId)
      .eq('user_id', employeeId)
      .eq('day_of_week', dow)
      .maybeSingle<{ is_working: boolean; start_time: string | null; end_time: string | null }>()

    if (empSched) {
      if (!empSched.is_working || !empSched.start_time || !empSched.end_time) return []
      openTime = empSched.start_time
      closeTime = empSched.end_time
      // Employee schedules don't carry break info — no break applied
    } else {
      // No personal schedule — fall back to shop hours
      const { data: bh } = await supabase
        .from('business_hours')
        .select('is_open, open_time, close_time, break_start, break_end')
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
      openTime = bh.open_time
      closeTime = bh.close_time
      breakStartTime = bh.break_start
      breakEndTime = bh.break_end
    }
  } else {
    const { data: bh } = await supabase
      .from('business_hours')
      .select('is_open, open_time, close_time, break_start, break_end')
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
    openTime = bh.open_time
    closeTime = bh.close_time
    breakStartTime = bh.break_start
    breakEndTime = bh.break_end
  }

  // 2. Service duration + capacity (max_capacity added in migration 008; fallback to 1)
  const { data: svc } = await supabase
    .from('services')
    .select('duration_minutes, max_capacity')
    .eq('tenant_id', tenantId)
    .eq('id', serviceId)
    .maybeSingle<{ duration_minutes: number; max_capacity: number }>()

  const durationMin = svc?.duration_minutes ?? 30
  const maxCapacity = svc?.max_capacity ?? 1

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
  const openMin = timeToMinutes(openTime)
  const closeMin = timeToMinutes(closeTime)
  const breakStart = breakStartTime ? timeToMinutes(breakStartTime) : null
  const breakEnd = breakEndTime ? timeToMinutes(breakEndTime) : null

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

    const overlappingAppts = appts.filter((a) =>
      overlaps(cur, slotEnd, timeToMinutes(a.start_time), timeToMinutes(a.end_time)),
    ).length
    if (overlappingAppts >= maxCapacity) {
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
