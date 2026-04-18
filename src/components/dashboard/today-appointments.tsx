'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarDays, ChevronDown, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Card } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { updateAppointmentStatus } from '@/actions/appointments'
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
  { label: string; dot: string; badge: string }
> = {
  scheduled: {
    label: 'Agendado',
    dot: 'bg-blue-400',
    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  },
  confirmed: {
    label: 'Confirmado',
    dot: 'bg-emerald-400',
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  },
  in_progress: {
    label: 'Em andamento',
    dot: 'bg-amber-400',
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  },
  completed: {
    label: 'Concluído',
    dot: 'bg-gray-400',
    badge: 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300',
  },
  canceled: {
    label: 'Cancelado',
    dot: 'bg-red-400',
    badge: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
  },
  no_show: {
    label: 'Não compareceu',
    dot: 'bg-orange-400',
    badge: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
  },
}

const STATUS_OPTIONS: AppointmentStatus[] = [
  'scheduled',
  'confirmed',
  'in_progress',
  'completed',
  'canceled',
  'no_show',
]

function formatTime(time: string): string {
  return time.slice(0, 5)
}

function AppointmentRow({ item }: { item: AppointmentRowView }) {
  const router = useRouter()
  const [currentStatus, setCurrentStatus] = useState<AppointmentStatus>(item.status)
  const [isPending, startTransition] = useTransition()

  const meta = STATUS_META[currentStatus]

  function handleStatusChange(next: AppointmentStatus) {
    if (next === currentStatus || isPending) return
    const prev = currentStatus
    setCurrentStatus(next)
    startTransition(async () => {
      const result = await updateAppointmentStatus(item.id, next)
      if (!result.ok) {
        setCurrentStatus(prev)
        toast.error(result.error ?? 'Erro ao atualizar status')
      } else {
        router.refresh()
      }
    })
  }

  const isFaded = currentStatus === 'canceled' || currentStatus === 'no_show'

  return (
    <li className={`flex items-center gap-3 px-4 py-3 transition-opacity ${isFaded ? 'opacity-50' : ''}`}>
      <div className="w-12 shrink-0 text-sm font-semibold tabular-nums text-muted-foreground">
        {formatTime(item.startTime)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {item.clientName}{' '}
          <span className="text-muted-foreground">· {item.petName}</span>
        </p>
        <p className="truncate text-xs text-muted-foreground">{item.serviceName}</p>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger
          disabled={isPending}
          aria-label="Alterar status"
          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-opacity focus:outline-none ${meta.badge} ${isPending ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:opacity-80'}`}
        >
          {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
          {meta.label}
          <ChevronDown className="h-3 w-3 opacity-60" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          {STATUS_OPTIONS.map((s) => (
            <DropdownMenuItem
              key={s}
              onClick={() => handleStatusChange(s)}
              className="flex cursor-pointer items-center gap-2 text-sm"
            >
              <span className={`h-2 w-2 rounded-full ${STATUS_META[s].dot}`} />
              {STATUS_META[s].label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  )
}

export function TodayAppointments({ items }: TodayAppointmentsProps) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-3">
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
          {items.map((a) => (
            <AppointmentRow key={a.id} item={a} />
          ))}
        </ul>
      )}
    </Card>
  )
}
