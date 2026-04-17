/**
 * Formatters — pt-BR locale
 *
 * Pure functions for display formatting. All functions are tolerant of
 * unusual input (null, empty strings, invalid dates) and return a stable
 * fallback string instead of throwing.
 */

const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const DATE_BR = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

const DATETIME_BR = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

/**
 * Format a number as Brazilian Real — e.g. 1234.56 → "R$ 1.234,56".
 */
export function formatCurrency(value: number): string {
  if (!Number.isFinite(value)) return BRL.format(0)
  return BRL.format(value)
}

/**
 * Format a Brazilian phone number. Accepts raw digits, E.164, or mixed
 * punctuation and produces:
 *   - "(11) 99999-9999" for 11-digit mobile
 *   - "(11) 9999-9999"  for 10-digit landline
 * If the input doesn't contain enough digits, the original string is
 * returned so the UI still shows something useful (and bad data is visible).
 */
export function formatPhone(phone: string): string {
  if (!phone) return ''
  // Strip country code and any non-digit characters
  const digits = phone.replace(/\D/g, '').replace(/^55/, '')

  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }
  return phone
}

/**
 * Convert an ISO date string or Date into a Date, handling the special case
 * of a plain 'YYYY-MM-DD' (which JavaScript otherwise parses as UTC and can
 * shift by a day in negative timezones).
 */
function toDate(input: string | Date): Date | null {
  if (input instanceof Date) {
    return Number.isNaN(input.getTime()) ? null : input
  }
  if (typeof input !== 'string' || input.length === 0) return null

  // Pure date ('YYYY-MM-DD') — parse as local-time to avoid TZ drift.
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.exec(input)
  if (dateOnly) {
    const [y, m, d] = input.split('-').map(Number)
    return new Date(y, m - 1, d)
  }

  const parsed = new Date(input)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

/**
 * Format a date — "17/04/2026".
 */
export function formatDate(date: string | Date): string {
  const d = toDate(date)
  if (!d) return ''
  return DATE_BR.format(d)
}

/**
 * Format a date + time — "17/04/2026 às 14:30".
 */
export function formatDateTime(date: string | Date): string {
  const d = toDate(date)
  if (!d) return ''
  // Intl outputs "17/04/2026 14:30" — replace the separator for readability.
  return DATETIME_BR.format(d).replace(', ', ' às ').replace(' ', ' às ')
}

/**
 * Format a Postgres TIME column ('HH:MM:SS' or 'HH:MM') as 'HH:MM'.
 * Accepts a full ISO timestamp as well — the time portion is extracted.
 */
export function formatTime(time: string): string {
  if (!time) return ''

  // Full ISO timestamp → extract hh:mm from local time.
  if (time.includes('T')) {
    const d = toDate(time)
    if (!d) return ''
    const hh = String(d.getHours()).padStart(2, '0')
    const mm = String(d.getMinutes()).padStart(2, '0')
    return `${hh}:${mm}`
  }

  // 'HH:MM' or 'HH:MM:SS' → keep the first 5 chars.
  const match = /^(\d{2}):(\d{2})/.exec(time)
  return match ? `${match[1]}:${match[2]}` : time
}
