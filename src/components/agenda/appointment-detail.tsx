'use client'

/**
 * AppointmentDetail — read-only panel + status transition actions.
 */

import { useState, useTransition } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { updateAppointmentStatus } from '@/actions/appointments'
import { formatCurrency, formatTime } from '@/lib/utils/format'
import { cn } from '@/lib/utils'
import { STATUS_LABEL, STATUS_STYLE } from './appointment-card'
import type { AppointmentRow, AppointmentStatus } from '@/types'

export interface AppointmentDetailProps {
  appointment: AppointmentRow
  clientName: string
  petName: string
  serviceName: string
  employeeName: string | null
  onChanged?: () => void
  onClose?: () => void
}

export function AppointmentDetail(props: AppointmentDetailProps) {
  const {
    appointment,
    clientName,
    petName,
    serviceName,
    employeeName,
    onChanged,
    onClose,
  } = props

  const [pending, startTransition] = useTransition()
  const [showCancelBox, setShowCancelBox] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  function change(status: AppointmentStatus, reason?: string) {
    startTransition(async () => {
      const res = await updateAppointmentStatus(appointment.id, status, reason)
      if (!res.ok) {
        toast.error(res.error)
        return
      }
      toast.success('Status atualizado')
      onChanged?.()
    })
  }

  function handleCancelSubmit() {
    change('canceled', cancelReason.trim() || undefined)
  }

  const status = appointment.status

  return (
    <div className="space-y-4">
      <div className="rounded-lg border p-3">
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold">{clientName}</p>
          <span
            className={cn(
              'rounded px-2 py-0.5 text-xs font-medium',
              STATUS_STYLE[status],
            )}
          >
            {STATUS_LABEL[status]}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">Pet: {petName}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <Field label="Serviço" value={serviceName} />
        <Field
          label="Horário"
          value={`${formatTime(appointment.start_time)} – ${formatTime(appointment.end_time)}`}
        />
        <Field label="Data" value={appointment.date} />
        <Field label="Preço" value={formatCurrency(appointment.price)} />
        <Field
          label="Funcionário"
          value={employeeName ?? 'Qualquer um'}
        />
        <Field
          label="Origem"
          value={
            appointment.source === 'manual'
              ? 'Manual'
              : appointment.source === 'whatsapp'
                ? 'WhatsApp'
                : appointment.source === 'public_booking'
                  ? 'Link público'
                  : 'API'
          }
        />
      </div>

      {appointment.notes && (
        <div className="rounded-lg border p-3">
          <p className="text-xs font-medium text-muted-foreground">Notas</p>
          <p className="whitespace-pre-wrap text-sm">{appointment.notes}</p>
        </div>
      )}

      {appointment.canceled_reason && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950">
          <p className="text-xs font-medium text-red-800 dark:text-red-200">
            Motivo do cancelamento
          </p>
          <p className="text-sm text-red-900 dark:text-red-100">
            {appointment.canceled_reason}
          </p>
        </div>
      )}

      {/* Actions by status */}
      {status === 'scheduled' && (
        <ActionRow pending={pending}>
          <Button onClick={() => change('confirmed')} disabled={pending}>
            Confirmar
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowCancelBox((v) => !v)}
            disabled={pending}
          >
            Cancelar
          </Button>
        </ActionRow>
      )}

      {status === 'confirmed' && (
        <ActionRow pending={pending}>
          <Button onClick={() => change('in_progress')} disabled={pending}>
            Iniciar serviço
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowCancelBox((v) => !v)}
            disabled={pending}
          >
            Cancelar
          </Button>
        </ActionRow>
      )}

      {status === 'in_progress' && (
        <ActionRow pending={pending}>
          <Button onClick={() => change('completed')} disabled={pending}>
            Concluir
          </Button>
          <Button
            variant="outline"
            onClick={() => change('no_show')}
            disabled={pending}
          >
            Não compareceu
          </Button>
        </ActionRow>
      )}

      {showCancelBox && (
        <div className="space-y-2 rounded-lg border p-3">
          <p className="text-sm font-medium">Motivo do cancelamento (opcional)</p>
          <Textarea
            rows={2}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowCancelBox(false)}
            >
              Voltar
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleCancelSubmit}
              disabled={pending}
            >
              Confirmar cancelamento
            </Button>
          </div>
        </div>
      )}

      {(status === 'completed' ||
        status === 'canceled' ||
        status === 'no_show') && (
        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      )}
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  )
}

function ActionRow({
  children,
}: {
  pending: boolean
  children: React.ReactNode
}) {
  return <div className="flex flex-wrap gap-2">{children}</div>
}
