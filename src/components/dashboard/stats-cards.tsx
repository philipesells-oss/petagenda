import Link from 'next/link'
import { Calendar, DollarSign, Send as SendIcon, TrendingDown, TrendingUp, Users, UserX } from 'lucide-react'

import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export interface TrendInfo {
  pct: number
  label: string
}

interface StatsCardsProps {
  todayAppointments: number
  todayRevenue: number
  activeClients: number
  inactiveClients: number
  appointmentsTrend?: TrendInfo
  revenueTrend?: TrendInfo
}

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

interface StatItem {
  label: string
  value: string
  icon: React.ComponentType<{ className?: string }>
  tint: string
  trend?: TrendInfo
}

function TrendBadge({ pct, label }: TrendInfo) {
  const up = pct >= 0
  const Icon = up ? TrendingUp : TrendingDown
  return (
    <div
      className={`flex items-center gap-1 text-xs font-medium mt-1.5 ${
        up
          ? 'text-emerald-600 dark:text-emerald-400'
          : 'text-red-600 dark:text-red-400'
      }`}
    >
      <Icon className="h-3 w-3 shrink-0" />
      <span>
        {up ? '+' : ''}
        {pct.toFixed(0)}%
      </span>
      <span className="text-muted-foreground font-normal truncate">{label}</span>
    </div>
  )
}

export function StatsCards({
  todayAppointments,
  todayRevenue,
  activeClients,
  inactiveClients,
  appointmentsTrend,
  revenueTrend,
}: StatsCardsProps) {
  const stats: StatItem[] = [
    {
      label: 'Agendamentos hoje',
      value: String(todayAppointments),
      icon: Calendar,
      tint: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300',
      trend: appointmentsTrend,
    },
    {
      label: 'Faturamento do dia',
      value: currency.format(todayRevenue),
      icon: DollarSign,
      tint: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300',
      trend: revenueTrend,
    },
    {
      label: 'Clientes ativos',
      value: String(activeClients),
      icon: Users,
      tint: 'bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-300',
    },
    {
      label: 'Clientes inativos',
      value: String(inactiveClients),
      icon: UserX,
      tint: 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-300',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map((s) => {
        const Icon = s.icon
        return (
          <Card key={s.label} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-muted-foreground">
                  {s.label}
                </p>
                <p className="truncate text-2xl font-semibold tracking-tight mt-1">
                  {s.value}
                </p>
                {s.trend && <TrendBadge {...s.trend} />}
              </div>
              <div className={`rounded-xl p-2 shrink-0 ${s.tint}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
            {s.label === 'Clientes inativos' && inactiveClients > 0 && (
              <Link
                href="/clients?status=inactive"
                className="mt-3 flex items-center gap-1.5 text-xs font-medium text-amber-600 hover:underline"
              >
                <SendIcon className="size-3" /> Enviar mensagem de reativação
              </Link>
            )}
          </Card>
        )
      })}
    </div>
  )
}

export function StatsCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="w-full space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-7 w-20" />
            </div>
            <Skeleton className="h-9 w-9 rounded-xl" />
          </div>
        </Card>
      ))}
    </div>
  )
}
