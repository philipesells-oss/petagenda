import Link from 'next/link'

import { getCurrentUser } from '@/lib/auth/get-current-user'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { StatsCards } from '@/components/dashboard/stats-cards'
import {
  TodayAppointments,
  type AppointmentRowView,
} from '@/components/dashboard/today-appointments'
import {
  RevenueChart,
  type RevenueChartDay,
} from '@/components/dashboard/revenue-chart'
import type { AppointmentStatus } from '@/types'

const PT_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

/**
 * Dashboard home. Shows onboarding banner (if incomplete), KPI stats cards,
 * and today's appointment list. All data is fetched server-side from Supabase.
 */
export default async function DashboardHome() {
  const user = await getCurrentUser()
  if (!user) return null

  const supabase = await createClient()
  const today = new Date().toISOString().slice(0, 10) // 'YYYY-MM-DD'
  const tenantId = user.tenantId

  const thirteenDaysAgo = new Date()
  thirteenDaysAgo.setDate(thirteenDaysAgo.getDate() - 13)
  const thirteenDaysAgoStr = thirteenDaysAgo.toISOString().slice(0, 10)

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().slice(0, 10)

  const [
    hoursResult,
    servicesOnboardResult,
    todayTotalResult,
    completedTodayResult,
    activeClientsResult,
    inactiveClientsResult,
    appointmentsResult,
    revenueHistoryResult,
    lastWeekAppointmentsResult,
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
      .eq('date', today),
    supabase
      .from('appointments')
      .select('price')
      .eq('tenant_id', tenantId)
      .eq('date', today)
      .eq('status', 'completed'),
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
    supabase
      .from('appointments')
      .select('date, price')
      .eq('tenant_id', tenantId)
      .eq('status', 'completed')
      .gte('date', thirteenDaysAgoStr),
    supabase
      .from('appointments')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .eq('date', sevenDaysAgoStr),
  ])

  const onboardingComplete =
    (hoursResult.count ?? 0) > 0 && (servicesOnboardResult.count ?? 0) > 0

  const todayRevenue = (completedTodayResult.data ?? []).reduce(
    (acc: number, row: { price: number | null }) => acc + (row.price ?? 0),
    0,
  )

  // Build daily revenue map from history
  const revenueByDate = new Map<string, number>()
  for (const row of (revenueHistoryResult.data ?? []) as { date: string; price: number | null }[]) {
    revenueByDate.set(row.date, (revenueByDate.get(row.date) ?? 0) + (row.price ?? 0))
  }

  // Chart: last 7 days + trend vs prior 7 days
  const chartData: RevenueChartDay[] = []
  let currentWeekRevenue = 0
  let priorWeekRevenue = 0

  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    const dayRevenue = revenueByDate.get(dateStr) ?? 0
    chartData.push({ day: PT_DAYS[d.getDay()], revenue: dayRevenue })
    currentWeekRevenue += dayRevenue
  }
  for (let i = 13; i >= 7; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    priorWeekRevenue += revenueByDate.get(d.toISOString().slice(0, 10)) ?? 0
  }

  const revenueTrendPct =
    priorWeekRevenue === 0
      ? 0
      : ((currentWeekRevenue - priorWeekRevenue) / priorWeekRevenue) * 100

  // Appointments trend: today vs same day last week
  const lastWeekCount = lastWeekAppointmentsResult.count ?? 0
  const todayCount = todayTotalResult.count ?? 0
  const appointmentsTrendPct =
    lastWeekCount === 0
      ? 0
      : ((todayCount - lastWeekCount) / lastWeekCount) * 100

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
              Leva menos de 2 minutos e libera todos os recursos da PetAgenda.
            </p>
          </div>
          <Button
            size="sm"
            render={<Link href="/onboarding">Completar configuração</Link>}
          />
        </div>
      )}

      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Olá, {user.fullName.split(' ')[0]} 🐾
        </h1>
        <p className="text-sm text-muted-foreground">
          Bem-vindo à PetAgenda. Aqui está o resumo do seu dia.
        </p>
      </header>

      <StatsCards
        todayAppointments={todayTotalResult.count ?? 0}
        todayRevenue={todayRevenue}
        activeClients={activeClientsResult.count ?? 0}
        inactiveClients={inactiveClientsResult.count ?? 0}
        appointmentsTrend={
          lastWeekCount > 0
            ? { pct: appointmentsTrendPct, label: 'vs semana passada' }
            : undefined
        }
        revenueTrend={
          todayRevenue > 0 && priorWeekRevenue > 0
            ? { pct: ((todayRevenue - (revenueByDate.get(sevenDaysAgoStr) ?? 0)) / Math.max(revenueByDate.get(sevenDaysAgoStr) ?? 1, 1)) * 100, label: 'vs semana passada' }
            : undefined
        }
      />

      <RevenueChart
        data={chartData}
        totalRevenue={currentWeekRevenue}
        trendPct={revenueTrendPct}
      />

      <TodayAppointments items={appointments} />
    </div>
  )
}
