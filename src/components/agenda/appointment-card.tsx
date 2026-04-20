'use client'

/**
 * AppointmentCard — compact card rendered in the agenda grid.
 */

import { cn } from '@/lib/utils'
import { formatTime } from '@/lib/utils/format'
import type { AppointmentStatus } from '@/types'

export interface AppointmentCardProps {
  id: string
  startTime: string
  endTime: string
  clientName: string
  petName: string
  serviceName: string
  serviceColor?: string | null
  employeeName?: string | null
  status: AppointmentStatus
  onClick?: () => void
}

const STATUS_LABEL: Record<AppointmentStatus, string> = {
  scheduled: 'Agendado',
  confirmed: 'Confirmado',
  in_progress: 'Em andamento',
  completed: 'Concluído',
  canceled: 'Cancelado',
  no_show: 'Não compareceu',
}

const STATUS_STYLE: Record<AppointmentStatus, string> = {
  scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200',
  confirmed: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200',
  in_progress:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200',
  completed: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200',
  canceled: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200',
  no_show:
    'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200',
}

export function AppointmentCard(props: AppointmentCardProps) {
  const {
    startTime,
    endTime,
    clientName,
    petName,
    serviceName,
    serviceColor,
    employeeName,
    status,
    onClick,
  } = props

  const bg = serviceColor ?? '#3b82f6'

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group w-full rounded-lg border border-transparent p-2 text-left shadow-sm transition',
        'hover:border-foreground/30 hover:shadow-md',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      )}
      style={{ backgroundColor: `${bg}20`, borderLeft: `3px solid ${bg}` }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{clientName}</p>
          <p className="truncate text-xs text-muted-foreground">
            {petName} · {serviceName}
          </p>
          {employeeName && (
            <p className="truncate text-[11px] text-muted-foreground/80">
              👤 {employeeName}
            </p>
          )}
        </div>
        <span className="shrink-0 text-[10px] text-muted-foreground">
          {formatTime(startTime)}–{formatTime(endTime)}
        </span>
      </div>
      <div className="mt-1.5">
        <span
          className={cn(
            'inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium',
            STATUS_STYLE[status],
          )}
        >
          {STATUS_LABEL[status]}
        </span>
      </div>
    </button>
  )
}

export { STATUS_LABEL, STATUS_STYLE }
