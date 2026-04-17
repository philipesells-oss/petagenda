import { Calendar, DollarSign, Users, UserX } from 'lucide-react'

import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface StatsCardsProps {
  todayAppointments: number
  todayRevenue: number
  activeClients: number
  inactiveClients: number
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
}

export function StatsCards({
  todayAppointments,
  todayRevenue,
  activeClients,
  inactiveClients,
}: StatsCardsProps) {
  const stats: StatItem[] = [
    {
      label: 'Agendamentos hoje',
      value: String(todayAppointments),
      icon: Calendar,
      tint: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300',
    },
    {
      label: 'Faturamento do dia',
      value: currency.format(todayRevenue),
      icon: DollarSign,
      tint: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300',
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
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((s) => {
        const Icon = s.icon
        return (
          <Card key={s.label} className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <p className="truncate text-xs font-medium text-muted-foreground">
                  {s.label}
                </p>
                <p className="truncate text-2xl font-semibold tracking-tight">
                  {s.value}
                </p>
              </div>
              <div className={`rounded-xl p-2 ${s.tint}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}

export function StatsCardsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
