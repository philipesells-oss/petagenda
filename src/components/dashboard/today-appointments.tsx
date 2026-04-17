import { CalendarDays } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import type { AppointmentStatus } from '@/types'

export interface AppointmentRowView {
  id: string
  startTime: string // 'HH:MM:SS'
  clientName: string
  petName: string
  serviceName: string
  status: AppointmentStatus
}

interface TodayAppointmentsProps {
  items: AppointmentRowView[]
}

const STATUS_META: Record<
  AppointmentStatus,
  { label: string; className: string }
> = {
  scheduled: {
    label: 'Agendado',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  },
  confirmed: {
    label: 'Confirmado',
    className:
      'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  },
  in_progress: {
    label: 'Em atendimento',
    className:
      'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  },
  completed: {
    label: 'Concluído',
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  },
  canceled: {
    label: 'Cancelado',
    className: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
  },
  no_show: {
    label: 'Faltou',
    className: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
  },
}

function formatTime(time: string): string {
  // 'HH:MM:SS' → 'HH:MM'
  return time.slice(0, 5)
}

export function TodayAppointments({ items }: TodayAppointmentsProps) {
  return (
    <Card className="p-0">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold">Agendamentos de hoje</h2>
          <p className="text-xs text-muted-foreground">
            {items.length === 0
              ? 'Nenhum agendamento'
              : `${items.length} ${items.length === 1 ? 'agendamento' : 'agendamentos'}`}
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 p-10 text-center">
          <div className="rounded-full bg-muted p-3">
            <CalendarDays className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">Nenhum agendamento hoje</p>
          <p className="text-xs text-muted-foreground">
            Aproveite o dia tranquilo ou cadastre novos serviços.
          </p>
        </div>
      ) : (
        <ul className="divide-y">
          {items.map((a) => {
            const meta = STATUS_META[a.status]
            return (
              <li
                key={a.id}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="w-12 shrink-0 text-sm font-semibold tabular-nums">
                    {formatTime(a.startTime)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {a.clientName}{' '}
                      <span className="text-muted-foreground">
                        · {a.petName}
                      </span>
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {a.serviceName}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className={meta.className}>
                  {meta.label}
                </Badge>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}
