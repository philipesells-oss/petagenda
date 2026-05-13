import { getCurrentUser } from '@/lib/auth/get-current-user'
import { createClient } from '@/lib/supabase/server'
import { StatsCards } from '@/components/dashboard/stats-cards'
import {
  TodayAppointments,
  type AppointmentRowView,
} from '@/components/dashboard/today-appointments'
import { RevenueChart } from '@/components/dashboard/revenue-chart'
import { Launchpad } from '@/components/dashboard/launchpad'
import { ReferralCard } from '@/components/dashboard/referral-card'
import { getT } from '@/lib/server-i18n'
import type { AppointmentStatus } from '@/types'

const PT_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

/**
 * Dashboard home. Shows onboarding banner (if incomplete), KPI stats cards,
 * and today's appointment list. All data is fetched server-side from Supabase.
 */
export default async function DashboardHome() {
  const user = await getCurrentUser()
  if (!user) return null

  const t = await getT()
  const supabase = await createClient()
  const today = new Date().toISOString().slice(0, 10) // 'YYYY-MM-DD'
  const tenantId = user.tenantId

  const sixtyDaysAgo = new Date()
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 59)
  const sixtyDaysAgoStr = sixtyDaysAgo.toISOString().slice(0, 10)

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
    teamMembersResult,
    anyAppointmentResult,
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
      .gte('date', sixtyDaysAgoStr),
    supabase
      .from('appointments')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .eq('date', sevenDaysAgoStr),
    supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .in('role', ['employee', 'admin'])
      .eq('is_active', true),
    supabase
      .from('appointments')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .limit(1),
  ])

  const hasHours = (hoursResult.count ?? 0) > 0
  const hasServices = (servicesOnboardResult.count ?? 0) > 0
  const hasTeam = (teamMembersResult.count ?? 0) > 0
  const hasFirstAppointment = (anyAppointmentResult.count ?? 0) > 0

  const todayRevenue = (completedTodayResult.data ?? []).reduce(
    (acc: number, row: { price: number | null }) => acc + (row.price ?? 0),
    0,
  )

  // Build daily revenue map from history
  const revenueByDate = new Map<string, number>()
  for (const row of (revenueHistoryResult.data ?? []) as { date: string; price: number | null }[]) {
    revenueByDate.set(row.date, (revenueByDate.get(row.date) ?? 0) + (row.price ?? 0))
  }

  function buildPeriodData(days: number) {
    const data: { day: string; revenue: number }[] = []
    let current = 0
    let prior = 0
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().slice(0, 10)
      const rev = revenueByDate.get(dateStr) ?? 0
      data.push({ day: PT_DAYS[d.getDay()], revenue: rev })
      current += rev
    }
    for (let i = days * 2 - 1; i >= days; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      prior += revenueByDate.get(d.toISOString().slice(0, 10)) ?? 0
    }
    const trendPct = prior === 0 ? 0 : ((current - prior) / prior) * 100
    return { data, totalRevenue: current, trendPct }
  }

  const period7 = buildPeriodData(7)
  const period15 = buildPeriodData(15)
  const period30 = buildPeriodData(30)

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
      <Launchpad
        hasHours={hasHours}
        hasServices={hasServices}
        hasTeam={hasTeam}
        hasFirstAppointment={hasFirstAppointment}
      />

      <ReferralCard />

      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t.dashboard.welcome}, {user.fullName.split(' ')[0]} 🐾
        </h1>
        <p className="text-sm text-muted-foreground">
          {t.dashboard.summary}
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
          todayRevenue > 0 && period7.trendPct !== 0
            ? { pct: period7.trendPct, label: 'vs semana passada' }
            : undefined
        }
      />

      <RevenueChart
        period7={period7}
        period15={period15}
        period30={period30}
      />

      <TodayAppointments items={appointments} />
    </div>
  )
}
