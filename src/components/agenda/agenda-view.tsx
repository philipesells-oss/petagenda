'use client'

/**
 * AgendaView — daily calendar grid. Handles date navigation, slot rendering,
 * and opens create/detail dialogs.
 */

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, UsersIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/utils/format'
import { buildDayGrid, timeToMinutes } from '@/lib/agenda/grid'
import { useLanguage } from '@/lib/i18n'
import { AppointmentCard } from './appointment-card'
import { AppointmentForm } from './appointment-form'
import { AppointmentDetail } from './appointment-detail'
import type { AppointmentRow, AppointmentStatus } from '@/types'

// ---------------- View model passed from server ----------------

export interface AgendaViewItem {
  appointment: AppointmentRow
  clientName: string
  petName: string
  serviceName: string
  serviceColor: string | null
  employeeName: string | null
}

export interface AgendaBusinessHours {
  is_open: boolean
  open_time: string | null
  close_time: string | null
  break_start: string | null
  break_end: string | null
}

export interface AgendaViewProps {
  tenantId: string
  date: string // 'YYYY-MM-DD'
  items: AgendaViewItem[]
  businessHours: AgendaBusinessHours | null
}

// ---------------- Helpers ----------------

function shiftDate(dateIso: string, days: number): string {
  const [y, m, d] = dateIso.split('-').map(Number)
  const dt = new Date(y, (m || 1) - 1, d || 1)
  dt.setDate(dt.getDate() + days)
  const yyyy = dt.getFullYear()
  const mm = String(dt.getMonth() + 1).padStart(2, '0')
  const dd = String(dt.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, (m || 1) - 1, d || 1)
}

function toIso(d: Date): string {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

// ---------------- Component ----------------

export function AgendaView({
  tenantId,
  date,
  items,
  businessHours,
}: AgendaViewProps) {
  const router = useRouter()
  const { t } = useLanguage()
  const [, startNav] = useTransition()

  const [createOpen, setCreateOpen] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [detailItem, setDetailItem] = useState<AgendaViewItem | null>(null)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [filterEmployee, setFilterEmployee] = useState<string>('all')

  const grid = useMemo(() => buildDayGrid(7, 20, 30), [])

  // Unique employees present in today's agenda
  const employeeOptions = useMemo(() => {
    const map = new Map<string, string>()
    for (const item of items) {
      const id = item.appointment.assigned_to
      if (id && item.employeeName) map.set(id, item.employeeName)
    }
    return [...map.entries()].map(([id, name]) => ({ id, name }))
  }, [items])

  const hasUnassigned = items.some((i) => !i.appointment.assigned_to)
  const showFilter = employeeOptions.length > 0 && (employeeOptions.length > 1 || hasUnassigned)

  // Apply employee filter client-side
  const filteredItems = useMemo(() => {
    if (filterEmployee === 'all') return items
    if (filterEmployee === 'unassigned') return items.filter((i) => !i.appointment.assigned_to)
    return items.filter((i) => i.appointment.assigned_to === filterEmployee)
  }, [items, filterEmployee])

  // Precompute which slot minute range each appointment spans
  const appointmentsByStart = useMemo(() => {
    const map = new Map<number, AgendaViewItem[]>()
    for (const item of filteredItems) {
      const startMin = timeToMinutes(item.appointment.start_time)
      // Round down to the nearest 30-min grid slot
      const slotMin = Math.floor(startMin / 30) * 30
      const list = map.get(slotMin) ?? []
      list.push(item)
      map.set(slotMin, list)
    }
    return map
  }, [filteredItems])

  // Business hours range (minutes)
  const openMin = businessHours?.open_time
    ? timeToMinutes(businessHours.open_time)
    : null
  const closeMin = businessHours?.close_time
    ? timeToMinutes(businessHours.close_time)
    : null
  const breakStart = businessHours?.break_start
    ? timeToMinutes(businessHours.break_start)
    : null
  const breakEnd = businessHours?.break_end
    ? timeToMinutes(businessHours.break_end)
    : null

  function isWithinOpen(min: number): boolean {
    if (!businessHours?.is_open || openMin == null || closeMin == null) {
      return false
    }
    if (min < openMin || min >= closeMin) return false
    if (breakStart != null && breakEnd != null) {
      if (min >= breakStart && min < breakEnd) return false
    }
    return true
  }

  // ---------------- Navigation ----------------

  function navigateToDate(nextDate: string) {
    startNav(() => {
      router.push(`/agenda?date=${nextDate}`)
      router.refresh()
    })
  }

  function handlePrev() {
    navigateToDate(shiftDate(date, -1))
  }

  function handleNext() {
    navigateToDate(shiftDate(date, 1))
  }

  function handleToday() {
    navigateToDate(new Date().toISOString().slice(0, 10))
  }

  function handleCalendarSelect(d: Date | undefined) {
    if (!d) return
    setCalendarOpen(false)
    navigateToDate(toIso(d))
  }

  function openCreate(time?: string) {
    setSelectedSlot(time ?? null)
    setCreateOpen(true)
  }

  function afterMutation() {
    setCreateOpen(false)
    setSelectedSlot(null)
    setDetailItem(null)
    startNav(() => router.refresh())
  }

  const isClosedDay =
    !businessHours?.is_open || openMin == null || closeMin == null

  const today = new Date().toISOString().slice(0, 10)

  return (
    <div className="flex gap-4">
      {/* Sidebar: mini calendar always visible on md+ */}
      <aside className="hidden md:flex md:flex-col md:gap-3 md:w-[260px] md:shrink-0">
        <Calendar
          mode="single"
          selected={parseIsoDate(date)}
          onSelect={handleCalendarSelect}
          className="rounded-xl border bg-card p-3 shadow-sm"
        />
        <Button className="w-full" onClick={() => openCreate()}>
          <PlusIcon className="mr-1 size-4" /> {t.agenda.newAppointment}
        </Button>
      </aside>

      {/* Main area */}
      <div className="flex-1 space-y-4 min-w-0">
        {/* Header: navigation */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrev}
              aria-label="Dia anterior"
            >
              <ChevronLeftIcon className="size-4" />
            </Button>

            {/* Date button — opens popover on mobile (sidebar visible on md+) */}
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger
                render={
                  <Button variant="outline" className="min-w-[180px] md:pointer-events-none">
                    {formatDate(date)}
                  </Button>
                }
              />
              <PopoverContent className="w-auto p-0 md:hidden" align="start">
                <Calendar
                  mode="single"
                  selected={parseIsoDate(date)}
                  onSelect={handleCalendarSelect}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              aria-label="Próximo dia"
            >
              <ChevronRightIcon className="size-4" />
            </Button>

            <Button
              variant={date === today ? 'default' : 'ghost'}
              size="sm"
              onClick={handleToday}
            >
              {t.agenda.today}
            </Button>
          </div>

          {/* New appointment button — mobile only (sidebar has it on md+) */}
          <Button className="md:hidden" onClick={() => openCreate()}>
            <PlusIcon className="mr-1 size-4" /> {t.agenda.newAppointment}
          </Button>
        </div>

        {/* Employee filter tabs */}
        {showFilter && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <UsersIcon className="size-4 shrink-0 text-muted-foreground" />
            {[
              { id: 'all', name: `${t.agenda.all} (${items.length})` },
              ...employeeOptions.map((e) => ({
                id: e.id,
                name: `${e.name.split(' ')[0]} (${items.filter((i) => i.appointment.assigned_to === e.id).length})`,
              })),
              ...(hasUnassigned
                ? [{ id: 'unassigned', name: `Sem profissional (${items.filter((i) => !i.appointment.assigned_to).length})` }]
                : []),
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setFilterEmployee(opt.id)}
                className={cn(
                  'shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                  filterEmployee === opt.id
                    ? 'border-emerald-500 bg-emerald-500 text-white'
                    : 'border-border bg-background text-muted-foreground hover:border-foreground/40 hover:text-foreground',
                )}
              >
                {opt.name}
              </button>
            ))}
          </div>
        )}

        {/* Grid */}
        <div className="rounded-xl border bg-card">
          {isClosedDay ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              O pet shop está fechado neste dia.
            </div>
          ) : (
            <div className="divide-y">
              {grid.map((slot) => {
                const within = isWithinOpen(slot.minutes)
                const slotItems = appointmentsByStart.get(slot.minutes) ?? []

                return (
                  <div
                    key={slot.time}
                    className={cn(
                      'flex gap-3 p-2',
                      !within && 'bg-muted/40',
                    )}
                  >
                    <div className="w-14 shrink-0 pt-1.5 text-xs font-medium text-muted-foreground">
                      {slot.time}
                    </div>
                    <div className="flex-1">
                      {slotItems.length > 0 ? (
                        <div className="space-y-1.5">
                          {slotItems.map((item) => (
                            <AppointmentCard
                              key={item.appointment.id}
                              id={item.appointment.id}
                              startTime={item.appointment.start_time}
                              endTime={item.appointment.end_time}
                              clientName={item.clientName}
                              petName={item.petName}
                              serviceName={item.serviceName}
                              serviceColor={item.serviceColor}
                              employeeName={item.employeeName}
                              status={item.appointment.status as AppointmentStatus}
                              onClick={() => setDetailItem(item)}
                            />
                          ))}
                        </div>
                      ) : within ? (
                        <button
                          type="button"
                          onClick={() => openCreate(slot.time)}
                          className="flex w-full items-center justify-center rounded-lg border border-dashed py-2 text-xs text-muted-foreground hover:border-foreground/40 hover:bg-muted"
                        >
                          <PlusIcon className="mr-1 size-3.5" /> {t.agenda.scheduleSlot}
                        </button>
                      ) : (
                        <div className="flex h-8 items-center text-xs italic text-muted-foreground">
                          {breakStart != null &&
                          breakEnd != null &&
                          slot.minutes >= breakStart &&
                          slot.minutes < breakEnd
                            ? 'Intervalo'
                            : t.agenda.outsideHours}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.agenda.form.title}</DialogTitle>
            <DialogDescription>
              {t.agenda.form.subtitle}
            </DialogDescription>
          </DialogHeader>
          <AppointmentForm
            tenantId={tenantId}
            date={date}
            defaultStartTime={selectedSlot ?? undefined}
            onSuccess={afterMutation}
            onCancel={() => setCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Detail dialog */}
      <Dialog
        open={!!detailItem}
        onOpenChange={(v) => {
          if (!v) setDetailItem(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.agenda.detail.title}</DialogTitle>
            <DialogDescription>
              {t.agenda.subtitle}
            </DialogDescription>
          </DialogHeader>
          {detailItem && (
            <AppointmentDetail
              appointment={detailItem.appointment}
              clientName={detailItem.clientName}
              petName={detailItem.petName}
              serviceName={detailItem.serviceName}
              employeeName={detailItem.employeeName}
              onChanged={afterMutation}
              onClose={() => setDetailItem(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
