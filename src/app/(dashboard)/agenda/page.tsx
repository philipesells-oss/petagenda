import { redirect } from 'next/navigation'

import { getCurrentUser } from '@/lib/auth/get-current-user'
import { createClient } from '@/lib/supabase/server'
import { dayOfWeek } from '@/lib/agenda/grid'
import {
  AgendaView,
  type AgendaViewItem,
  type AgendaBusinessHours,
} from '@/components/agenda/agenda-view'
import type { AppointmentRow } from '@/types'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export default async function AgendaPage({ searchParams }: PageProps) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const sp = await searchParams
  const raw = typeof sp.date === 'string' ? sp.date : ''
  const date = DATE_RE.test(raw) ? raw : new Date().toISOString().slice(0, 10)

  const supabase = await createClient()

  // Pull appointments with related names + colors in one round-trip
  const [apptsResult, hoursResult] = await Promise.all([
    supabase
      .from('appointments')
      .select(
        `
        *,
        client:clients(full_name),
        pet:pets(name),
        service:services(name, color),
        employee:users!appointments_assigned_to_fkey(full_name)
      `,
      )
      .eq('tenant_id', user.tenantId)
      .eq('date', date)
      .order('start_time', { ascending: true }),
    supabase
      .from('business_hours')
      .select('is_open, open_time, close_time, break_start, break_end')
      .eq('tenant_id', user.tenantId)
      .eq('day_of_week', dayOfWeek(date))
      .maybeSingle<AgendaBusinessHours>(),
  ])

  type Raw = AppointmentRow & {
    client: { full_name: string } | { full_name: string }[] | null
    pet: { name: string } | { name: string }[] | null
    service:
      | { name: string; color: string | null }
      | { name: string; color: string | null }[]
      | null
    employee: { full_name: string } | { full_name: string }[] | null
  }

  function pickOne<T>(v: T | T[] | null): T | null {
    if (!v) return null
    return Array.isArray(v) ? (v[0] ?? null) : v
  }

  const items: AgendaViewItem[] = ((apptsResult.data ?? []) as Raw[]).map(
    (row) => {
      const client = pickOne(row.client)
      const pet = pickOne(row.pet)
      const service = pickOne(row.service)
      const employee = pickOne(row.employee)

      // Strip the relational fields to get a clean AppointmentRow
      const {
        client: _c,
        pet: _p,
        service: _s,
        employee: _e,
        ...appointment
      } = row
      void _c
      void _p
      void _s
      void _e

      return {
        appointment: appointment as AppointmentRow,
        clientName: client?.full_name ?? '—',
        petName: pet?.name ?? '—',
        serviceName: service?.name ?? '—',
        serviceColor: service?.color ?? null,
        employeeName: employee?.full_name ?? null,
      }
    },
  )

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 p-4 md:p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Agenda</h1>
        <p className="text-sm text-muted-foreground">
          Visualize e gerencie os agendamentos do dia.
        </p>
      </header>

      <AgendaView
        tenantId={user.tenantId}
        date={date}
        items={items}
        businessHours={hoursResult.data ?? null}
      />
    </div>
  )
}
