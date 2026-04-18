import Link from 'next/link'

import { getCurrentUser } from '@/lib/auth/get-current-user'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { PeriodSelector } from '@/components/dashboard/period-selector'
import {
  TodayAppointments,
  type AppointmentRowView,
} from '@/components/dashboard/today-appointments'
import type { AppointmentStatus } from '@/types'

type AppointmentsPeriod = 'today' | 'tomorrow' | 'week' | 'month'
type RevenuePeriod = 'today' | 'week' | 'month' | 'last_month'

const APPOINTMENT_PERIOD_OPTIONS = [
  { value: 'today', label: 'Hoje' },
  { value: 'tomorrow', label: 'Amanhã' },
  { value: 'week', label: 'Semana' },
  { value: 'month', label: 'Mês' },
]

const REVENUE_PERIOD_OPTIONS = [
  { value: 'today', label: 'Hoje' },
  { value: 'week', label: 'Semana' },
  { value: 'month', label: 'Mês' },
  { value: 'last_month', label: 'Mês passado' },
]

const APPOINTMENT_VALUES: AppointmentsPeriod[] = ['today', 'tomorrow', 'week', 'month']
const REVENUE_VALUES: RevenuePeriod[] = ['today', 'week', 'month', 'last_month']

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function addDays(d: Date, n: number): Date {
  const out = new Date(d)
  out.setUTCDate(out.getUTCDate() + n)
  return out
}

function startOfWeek(d: Date): Date {
  // Monday-based week
  const out = new Date(d)
  const day = out.getUTCDay() // 0=Sun..6=Sat
  const diff = (day + 6) % 7 // days since Monday
  out.setUTCDate(out.getUTCDate() - diff)
  return out
}

function startOfMonth(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1))
}

function endOfMonth(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0))
}

function getAppointmentsRange(period: AppointmentsPeriod): {
  from: string
  to: string
  label: string
} {
  const now = new Date()
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  switch (period) {
    case 'tomorrow': {
      const t = addDays(today, 1)
      return { from: toISODate(t), to: toISODate(t), label: 'amanhã' }
    }
    case 'week': {
      const from = startOfWeek(today)
      const to = addDays(from, 6)
      return { from: toISODate(from), to: toISODate(to), label: 'esta semana' }
    }
    case 'month': {
      return {
        from: toISODate(startOfMonth(today)),
        to: toISODate(endOfMonth(today)),
        label: 'este mês',
      }
    }
    case 'today':
    default:
      return { from: toISODate(today), to: toISODate(today), label: 'hoje' }
  }
}

function getRevenueRange(period: RevenuePeriod): {
  from: string
  to: string
  label: string
} {
  const now = new Date()
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  switch (period) {
    case 'week': {
      const from = startOfWeek(today)
      const to = addDays(from, 6)
      return { from: toISODate(from), to: toISODate(to), label: 'desta semana' }
    }
    case 'month': {
      return {
        from: toISODate(startOfMonth(today)),
        to: toISODate(endOfMonth(today)),
        label: 'deste mês',
      }
    }
    case 'last_month': {
      const firstOfThisMonth = startOfMonth(today)
      const lastMonthEnd = addDays(firstOfThisMonth, -1)
      const lastMonthStart = startOfMonth(lastMonthEnd)
      return {
        from: toISODate(lastMonthStart),
        to: toISODate(lastMonthEnd),
        label: 'do mês passado',
      }
    }
    case 'today':
    default:
      return { from: toISODate(today), to: toISODate(today), label: 'do dia' }
  }
}

function parseAppointmentsPeriod(value: string | undefined): AppointmentsPeriod {
  return (APPOINTMENT_VALUES as string[]).includes(value ?? '')
    ? (value as AppointmentsPeriod)
    : 'today'
}

function parseRevenuePeriod(value: string | undefined): RevenuePeriod {
  return (REVENUE_VALUES as string[]).includes(value ?? '')
    ? (value as RevenuePeriod)
    : 'today'
}

/**
 * Dashboard home. Shows onboarding banner (if incomplete), KPI stats cards
 * with period selectors, and today's appointment list. Data is fetched
 * server-side from Supabase.
 */
export default async function DashboardHome({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; rev_period?: string }>
}) {
  const user = await getCurrentUser()
  if (!user) return null

  const sp = await searchParams
  const apptPeriod = parseAppointmentsPeriod(sp.period)
  const revPeriod = parseRevenuePeriod(sp.rev_period)

  const apptRange = getAppointmentsRange(apptPeriod)
  const revRange = getRevenueRange(revPeriod)

  const supabase = await createClient()
  const today = new Date().toISOString().slice(0, 10)
  const tenantId = user.tenantId

  const [
    hoursResult,
    servicesOnboardResult,
    apptsCountResult,
    revenueResult,
    activeClientsResult,
    inactiveClientsResult,
    appointmentsResult,
  ] = await Promise.all([
    supabase
      .from('business_hours')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_id', tenantId),
    supabase
      .from('services')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_id', tenantId),
    supabase
      .from('appointments')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .gte('date', apptRange.from)
      .lte('date', apptRange.to),
    supabase
      .from('appointments')
      .select('price')
      .eq('tenant_id', tenantId)
      .gte('date', revRange.from)
      .lte('date', revRange.to)
      .in('status', ['scheduled', 'confirmed', 'in_progress', 'completed']),
    supabase
      .from('clients')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .eq('status', 'active'),
    supabase
      .from('clients')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .eq('status', 'inactive'),
    supabase
      .from('appointments')
      .select(
        `id, start_time, status, service:services(name), client:clients(full_name), pet:pets(name)`,
      )
      .eq('tenant_id', tenantId)
      .eq('date', today)
      .order('start_time', { ascending: true })
      .limit(50),
  ])

  const onboardingComplete =
    (hoursResult.count ?? 0) > 0 && (servicesOnboardResult.count ?? 0) > 0

  const revenue = (revenueResult.data ?? []).reduce(
    (acc: number, row: { price: number | null }) => acc + (row.price ?? 0),
    0,
  )

  type RawAppointment = {
    id: string
    start_time: string
    status: AppointmentStatus
    service: { name: string } | { name: string }[] | null
    client: { full_name: string } | { full_name: string }[] | null
    pet: { name: string } | { name: string }[] | null
  }

  const pickOne = <T,>(value: T | T[] | null): T | null => {
    if (!value) return null
    return Array.isArray(value) ? (value[0] ?? null) : value
  }

  const appointments: AppointmentRowView[] = (
    (appointmentsResult.data ?? []) as RawAppointment[]
  ).map((row) => {
    const service = pickOne(row.service)
    const client = pickOne(row.client)
    const pet = pickOne(row.pet)
    return {
      id: row.id,
      startTime: row.start_time,
      clientName: client?.full_name ?? '—',
      petName: pet?.name ?? '—',
      serviceName: service?.name ?? '—',
      status: row.status,
    }
  })

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-6">
      {!onboardingComplete && (
        <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-amber-900 dark:bg-amber-950">
          <div>
            <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
              Configuração do pet shop pendente
            </p>
            <p className="text-xs text-amber-800 dark:text-amber-200">
              Leva menos de 2 minutos e libera todos os recursos do PetFlow.
            </p>
          </div>
          <Button
            size="sm"
            render={<Link href="/onboarding">Completar configuração</Link>}
          />
        </div>
      )}

      <header className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Olá, {user.fullName.split(' ')[0]} 🐾
          </h1>
          <p className="text-sm text-muted-foreground">
            Bem-vindo ao PetFlow. Aqui está o resumo do seu dia.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          render={<Link href="/agenda">Ver agenda completa</Link>}
        />
      </header>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              Agendamentos:
            </span>
            <PeriodSelector
              paramName="period"
              defaultValue="today"
              options={APPOINTMENT_PERIOD_OPTIONS}
              aria-label="Período dos agendamentos"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              Faturamento:
            </span>
            <PeriodSelector
              paramName="rev_period"
              defaultValue="today"
              options={REVENUE_PERIOD_OPTIONS}
              aria-label="Período do faturamento"
            />
          </div>
        </div>

        <StatsCards
          todayAppointments={apptsCountResult.count ?? 0}
          todayRevenue={revenue}
          activeClients={activeClientsResult.count ?? 0}
          inactiveClients={inactiveClientsResult.count ?? 0}
        />
      </section>

      <section>
        <TodayAppointments items={appointments} />
      </section>
    </div>
  )
}
