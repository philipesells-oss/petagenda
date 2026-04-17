'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { updateBusinessHours, type BusinessHourInput } from '@/actions/settings'

const DAYS = [
  { dow: 0, label: 'Domingo' },
  { dow: 1, label: 'Segunda' },
  { dow: 2, label: 'Terça' },
  { dow: 3, label: 'Quarta' },
  { dow: 4, label: 'Quinta' },
  { dow: 5, label: 'Sexta' },
  { dow: 6, label: 'Sábado' },
]

function toTime(v: string | null | undefined): string {
  if (!v) return ''
  return v.slice(0, 5)
}

export function HoursForm({ initial }: { initial: BusinessHourInput[] }) {
  const [rows, setRows] = useState<BusinessHourInput[]>(() =>
    DAYS.map((d) => {
      const existing = initial.find((h) => h.day_of_week === d.dow)
      return {
        day_of_week: d.dow,
        is_open: existing?.is_open ?? d.dow !== 0,
        open_time: toTime(existing?.open_time) || '09:00',
        close_time: toTime(existing?.close_time) || '18:00',
        break_start: toTime(existing?.break_start) || '',
        break_end: toTime(existing?.break_end) || '',
      }
    }),
  )
  const [saving, setSaving] = useState(false)

  function updateRow(dow: number, patch: Partial<BusinessHourInput>) {
    setRows((prev) => prev.map((r) => (r.day_of_week === dow ? { ...r, ...patch } : r)))
  }

  function copyToWeekdays() {
    const monday = rows.find((r) => r.day_of_week === 1)
    if (!monday) return
    setRows((prev) =>
      prev.map((r) =>
        r.day_of_week >= 1 && r.day_of_week <= 5
          ? {
              ...r,
              is_open: monday.is_open,
              open_time: monday.open_time,
              close_time: monday.close_time,
              break_start: monday.break_start,
              break_end: monday.break_end,
            }
          : r,
      ),
    )
    toast.success('Horários copiados para dias úteis')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const payload = rows.map((r) => ({
      ...r,
      open_time: r.is_open ? r.open_time || null : null,
      close_time: r.is_open ? r.close_time || null : null,
      break_start: r.is_open && r.break_start ? r.break_start : null,
      break_end: r.is_open && r.break_end ? r.break_end : null,
    }))
    const res = await updateBusinessHours(payload)
    if (res.ok) toast.success('Horário salvo!')
    else toast.error(res.error)
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex justify-end">
        <Button type="button" variant="outline" size="sm" onClick={copyToWeekdays}>
          Copiar segunda para dias úteis
        </Button>
      </div>

      {rows.map((r) => {
        const day = DAYS.find((d) => d.dow === r.day_of_week)!
        return (
          <Card key={r.day_of_week}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{day.label}</h3>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={r.is_open}
                    onChange={(e) => updateRow(r.day_of_week, { is_open: e.target.checked })}
                    className="h-4 w-4"
                  />
                  {r.is_open ? 'Aberto' : 'Fechado'}
                </label>
              </div>

              {r.is_open && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <Label>Abertura</Label>
                    <Input
                      type="time"
                      value={r.open_time ?? ''}
                      onChange={(e) => updateRow(r.day_of_week, { open_time: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Fechamento</Label>
                    <Input
                      type="time"
                      value={r.close_time ?? ''}
                      onChange={(e) => updateRow(r.day_of_week, { close_time: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Intervalo início</Label>
                    <Input
                      type="time"
                      value={r.break_start ?? ''}
                      onChange={(e) => updateRow(r.day_of_week, { break_start: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Intervalo fim</Label>
                    <Input
                      type="time"
                      value={r.break_end ?? ''}
                      onChange={(e) => updateRow(r.day_of_week, { break_end: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}

      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar horários'}
        </Button>
      </div>
    </form>
  )
}
