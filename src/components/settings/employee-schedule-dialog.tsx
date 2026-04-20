'use client'

import { useEffect, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { CalendarClock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  getEmployeeScheduleAction,
  saveEmployeeScheduleAction,
  type EmployeeScheduleDay,
} from '@/actions/team'

const DAYS = [
  { dow: 0, label: 'Domingo' },
  { dow: 1, label: 'Segunda' },
  { dow: 2, label: 'Terça' },
  { dow: 3, label: 'Quarta' },
  { dow: 4, label: 'Quinta' },
  { dow: 5, label: 'Sexta' },
  { dow: 6, label: 'Sábado' },
]

interface Props {
  employeeId: string
  employeeName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EmployeeScheduleDialog({
  employeeId,
  employeeName,
  open,
  onOpenChange,
}: Props) {
  const [rows, setRows] = useState<EmployeeScheduleDay[]>([])
  const [loading, setLoading] = useState(false)
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    if (!open) return
    setLoading(true)
    getEmployeeScheduleAction(employeeId).then((res) => {
      if (res.ok) setRows(res.data)
      else toast.error(res.error)
      setLoading(false)
    })
  }, [open, employeeId])

  function updateRow(dow: number, patch: Partial<EmployeeScheduleDay>) {
    setRows((prev) =>
      prev.map((r) => (r.dayOfWeek === dow ? { ...r, ...patch } : r)),
    )
  }

  function handleSave() {
    startTransition(async () => {
      const res = await saveEmployeeScheduleAction(employeeId, rows)
      if (res.ok) {
        toast.success('Horário salvo!')
        onOpenChange(false)
      } else {
        toast.error(res.error)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarClock className="size-4" />
            Horário — {employeeName}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Carregando…
          </div>
        ) : (
          <div className="space-y-3 py-2">
            {DAYS.map((day) => {
              const row = rows.find((r) => r.dayOfWeek === day.dow)
              if (!row) return null
              return (
                <div
                  key={day.dow}
                  className="rounded-lg border bg-card px-4 py-3 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{day.label}</span>
                    <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={row.isWorking}
                        onChange={(e) =>
                          updateRow(day.dow, { isWorking: e.target.checked })
                        }
                        className="h-4 w-4"
                      />
                      {row.isWorking ? 'Trabalha' : 'Folga'}
                    </label>
                  </div>

                  {row.isWorking && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Entrada</Label>
                        <Input
                          type="time"
                          value={row.startTime}
                          onChange={(e) =>
                            updateRow(day.dow, { startTime: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Saída</Label>
                        <Input
                          type="time"
                          value={row.endTime}
                          onChange={(e) =>
                            updateRow(day.dow, { endTime: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={pending}
              >
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={pending || loading}>
                {pending ? 'Salvando…' : 'Salvar horário'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
