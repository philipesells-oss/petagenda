/**
 * Client-safe pure helpers for the agenda grid. No server-only imports.
 */

export const SLOT_STEP_MIN = 30

export interface GridSlot {
  time: string // 'HH:MM'
  minutes: number
}

export function timeToMinutes(t: string): number {
  if (!t) return 0
  const [h, m] = t.split(':').map((x) => parseInt(x, 10))
  return (h || 0) * 60 + (m || 0)
}

export function minutesToTime(min: number): string {
  const h = Math.floor(min / 60) % 24
  const m = min % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function buildDayGrid(
  startHour = 7,
  endHour = 20,
  stepMin = SLOT_STEP_MIN,
): GridSlot[] {
  const out: GridSlot[] = []
  for (let m = startHour * 60; m < endHour * 60; m += stepMin) {
    out.push({ time: minutesToTime(m), minutes: m })
  }
  return out
}

/** Local-date day-of-week (0=Sunday … 6=Saturday) from 'YYYY-MM-DD'. */
export function dayOfWeek(dateIso: string): number {
  const [y, m, d] = dateIso.split('-').map(Number)
  return new Date(y, (m || 1) - 1, d || 1).getDay()
}
