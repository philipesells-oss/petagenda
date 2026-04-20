'use client'

import { useEffect, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  updateEmployeeAction,
  getEmployeeScheduleAction,
  saveEmployeeScheduleAction,
  getEmployeeServicesAction,
  saveEmployeeServicesAction,
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
  employee: { id: string; full_name: string; role: 'employee' | 'admin' }
  allServices: { id: string; name: string }[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditEmployeeDialog({ employee, allServices, open, onOpenChange }: Props) {
  // Dados tab
  const [fullName, setFullName] = useState(employee.full_name)
  const [role, setRole] = useState<'employee' | 'admin'>(employee.role)
  const [dadosPending, startDadosTransition] = useTransition()

  // Horário tab
  const [rows, setRows] = useState<EmployeeScheduleDay[]>([])
  const [scheduleLoading, setScheduleLoading] = useState(false)
  const [schedulePending, startScheduleTransition] = useTransition()

  // Serviços tab
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [servicesLoading, setServicesLoading] = useState(false)
  const [servicesPending, startServicesTransition] = useTransition()

  useEffect(() => {
    if (!open) return
    setFullName(employee.full_name)
    setRole(employee.role)

    // Load schedule
    setScheduleLoading(true)
    getEmployeeScheduleAction(employee.id).then((res) => {
      if (res.ok) setRows(res.data)
      else toast.error(res.error)
      setScheduleLoading(false)
    })

    // Load services
    setServicesLoading(true)
    getEmployeeServicesAction(employee.id).then((res) => {
      if (res.ok) setSelectedServices(res.data)
      else toast.error(res.error)
      setServicesLoading(false)
    })
  }, [open, employee.id, employee.full_name, employee.role])

  function updateRow(dow: number, patch: Partial<EmployeeScheduleDay>) {
    setRows((prev) =>
      prev.map((r) => (r.dayOfWeek === dow ? { ...r, ...patch } : r)),
    )
  }

  function toggleService(serviceId: string) {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId],
    )
  }

  function handleSaveDados() {
    startDadosTransition(async () => {
      const res = await updateEmployeeAction(employee.id, { full_name: fullName, role })
      if (res.ok) {
        toast.success('Dados atualizados!')
        onOpenChange(false)
      } else {
        toast.error(res.error)
      }
    })
  }

  function handleSaveSchedule() {
    startScheduleTransition(async () => {
      const res = await saveEmployeeScheduleAction(employee.id, rows)
      if (res.ok) {
        toast.success('Horário salvo!')
        onOpenChange(false)
      } else {
        toast.error(res.error)
      }
    })
  }

  function handleSaveServices() {
    startServicesTransition(async () => {
      const res = await saveEmployeeServicesAction(employee.id, selectedServices)
      if (res.ok) {
        toast.success('Serviços salvos!')
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
          <DialogTitle>Editar — {employee.full_name}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="dados">
          <TabsList className="w-full">
            <TabsTrigger value="dados" className="flex-1">Dados</TabsTrigger>
            <TabsTrigger value="horario" className="flex-1">Horário</TabsTrigger>
            <TabsTrigger value="servicos" className="flex-1">Serviços</TabsTrigger>
          </TabsList>

          {/* ── Dados ── */}
          <TabsContent value="dados" className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label htmlFor="edit-name">Nome completo</Label>
              <Input
                id="edit-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Tipo de acesso</Label>
              <div className="flex gap-4">
                {(['employee', 'admin'] as const).map((r) => (
                  <label key={r} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="edit-role"
                      value={r}
                      checked={role === r}
                      onChange={() => setRole(r)}
                    />
                    {r === 'employee' ? 'Funcionário' : 'Admin'}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={dadosPending}>
                Cancelar
              </Button>
              <Button onClick={handleSaveDados} disabled={dadosPending}>
                {dadosPending ? 'Salvando…' : 'Salvar dados'}
              </Button>
            </div>
          </TabsContent>

          {/* ── Horário ── */}
          <TabsContent value="horario" className="space-y-3 pt-2">
            {scheduleLoading ? (
              <div className="py-8 text-center text-sm text-muted-foreground">Carregando…</div>
            ) : (
              <>
                {DAYS.map((day) => {
                  const row = rows.find((r) => r.dayOfWeek === day.dow)
                  if (!row) return null
                  return (
                    <div key={day.dow} className="rounded-lg border bg-card px-4 py-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{day.label}</span>
                        <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={row.isWorking}
                            onChange={(e) => updateRow(day.dow, { isWorking: e.target.checked })}
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
                              onChange={(e) => updateRow(day.dow, { startTime: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Saída</Label>
                            <Input
                              type="time"
                              value={row.endTime}
                              onChange={(e) => updateRow(day.dow, { endTime: e.target.value })}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={schedulePending}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveSchedule} disabled={schedulePending || scheduleLoading}>
                    {schedulePending ? 'Salvando…' : 'Salvar horário'}
                  </Button>
                </div>
              </>
            )}
          </TabsContent>

          {/* ── Serviços ── */}
          <TabsContent value="servicos" className="space-y-3 pt-2">
            <p className="text-xs text-muted-foreground">
              Marque os serviços que este funcionário pode realizar. Se nenhum estiver marcado, todos os serviços estarão disponíveis.
            </p>
            {servicesLoading ? (
              <div className="py-8 text-center text-sm text-muted-foreground">Carregando…</div>
            ) : (
              <>
                <div className="divide-y rounded-lg border">
                  {allServices.map((svc) => (
                    <label
                      key={svc.id}
                      className="flex items-center gap-3 px-4 py-3 text-sm cursor-pointer hover:bg-muted/50"
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={selectedServices.includes(svc.id)}
                        onChange={() => toggleService(svc.id)}
                      />
                      {svc.name}
                    </label>
                  ))}
                  {allServices.length === 0 && (
                    <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                      Nenhum serviço cadastrado.
                    </p>
                  )}
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={servicesPending}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveServices} disabled={servicesPending || servicesLoading}>
                    {servicesPending ? 'Salvando…' : 'Salvar serviços'}
                  </Button>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
