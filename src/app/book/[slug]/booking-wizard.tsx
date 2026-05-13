'use client'

import { useState, useTransition } from 'react'
import { format, addDays, isPast, isToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ChevronLeftIcon, CheckIcon, Loader2Icon, ScissorsIcon, PawPrintIcon, ClockIcon, UserIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/utils/format'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Service {
  id: string
  name: string
  duration_minutes: number
  price: number
  category: string
}

interface Tenant {
  id: string
  name: string
  slug: string
  phone: string | null
  booking_instructions: string | null
}

interface Props {
  tenant: Tenant
  services: Service[]
  closedDaysOfWeek: number[]
}

interface TimeSlot {
  time: string
  available: boolean
}

type PetSpecies = 'dog' | 'cat' | 'bird' | 'other'

const SPECIES_OPTIONS: Array<{ value: PetSpecies; label: string; emoji: string }> = [
  { value: 'dog', label: 'Cão', emoji: '🐕' },
  { value: 'cat', label: 'Gato', emoji: '🐈' },
  { value: 'bird', label: 'Pássaro', emoji: '🦜' },
  { value: 'other', label: 'Outro', emoji: '🐾' },
]

const STEP_LABELS = ['Serviço', 'Data', 'Horário', 'Seus dados', 'Confirmar']

// ---------------------------------------------------------------------------
// Step indicator
// ---------------------------------------------------------------------------

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="mb-8 flex items-center justify-center gap-2" role="progressbar" aria-valuenow={current + 1} aria-valuemax={total}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'h-2 rounded-full transition-all duration-300',
            i === current
              ? 'w-6 bg-emerald-600'
              : i < current
              ? 'w-2 bg-emerald-400'
              : 'w-2 bg-slate-200',
          )}
        />
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step 0 — Service selection
// ---------------------------------------------------------------------------

function ServiceStep({
  services,
  selected,
  onSelect,
}: {
  services: Service[]
  selected: string | null
  onSelect: (s: Service) => void
}) {
  return (
    <div>
      <h2 className="mb-1 text-lg font-semibold text-slate-900">Escolha o serviço</h2>
      <p className="mb-5 text-sm text-slate-500">Selecione o que deseja agendar</p>

      {services.length === 0 ? (
        <p className="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
          Nenhum serviço disponível no momento.
        </p>
      ) : (
        <div className="space-y-3">
          {services.map((svc) => (
            <button
              key={svc.id}
              type="button"
              onClick={() => onSelect(svc)}
              className={cn(
                'flex w-full cursor-pointer items-center gap-4 rounded-xl border-2 bg-white p-4 text-left transition-all duration-150 hover:border-emerald-300 hover:shadow-sm active:scale-[0.99]',
                selected === svc.id
                  ? 'border-emerald-500 shadow-sm ring-2 ring-emerald-100'
                  : 'border-slate-200',
              )}
            >
              <div className={cn(
                'flex h-11 w-11 shrink-0 items-center justify-center rounded-full',
                selected === svc.id ? 'bg-emerald-100' : 'bg-slate-100',
              )}>
                <ScissorsIcon className={cn('h-5 w-5', selected === svc.id ? 'text-emerald-600' : 'text-slate-400')} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900">{svc.name}</p>
                <p className="text-sm text-slate-500">{svc.duration_minutes} min</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-slate-900">{formatCurrency(svc.price)}</p>
              </div>
              {selected === svc.id && (
                <CheckIcon className="h-5 w-5 shrink-0 text-emerald-600" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step 1 — Date selection
// ---------------------------------------------------------------------------

function DateStep({
  selected,
  closedDaysOfWeek,
  onSelect,
}: {
  selected: Date | undefined
  closedDaysOfWeek: number[]
  onSelect: (d: Date) => void
}) {
  const today = new Date()
  const maxDate = addDays(today, 60)

  function isDisabled(day: Date) {
    if (isPast(day) && !isToday(day)) return true
    if (closedDaysOfWeek.includes(day.getDay())) return true
    if (day > maxDate) return true
    return false
  }

  return (
    <div>
      <h2 className="mb-1 text-lg font-semibold text-slate-900">Escolha a data</h2>
      <p className="mb-5 text-sm text-slate-500">Dias disponíveis destacados no calendário</p>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-2">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(d) => d && onSelect(d)}
          disabled={isDisabled}
          locale={ptBR}
          classNames={{
            day_selected: 'bg-emerald-600 text-white hover:bg-emerald-700 focus:bg-emerald-600',
            day_today: 'bg-emerald-50 text-emerald-700 font-semibold',
          }}
        />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step 2 — Time slot selection
// ---------------------------------------------------------------------------

function TimeStep({
  slots,
  loading,
  selected,
  onSelect,
}: {
  slots: TimeSlot[]
  loading: boolean
  selected: string | null
  onSelect: (t: string) => void
}) {
  const available = slots.filter((s) => s.available)

  return (
    <div>
      <h2 className="mb-1 text-lg font-semibold text-slate-900">Escolha o horário</h2>
      <p className="mb-5 text-sm text-slate-500">Horários disponíveis para a data selecionada</p>

      {loading ? (
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100" />
          ))}
        </div>
      ) : available.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <ClockIcon className="mx-auto mb-3 h-8 w-8 text-slate-300" />
          <p className="text-sm font-medium text-slate-700">Sem horários disponíveis</p>
          <p className="mt-1 text-sm text-slate-400">Escolha outra data</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {slots.map((slot) => (
            <button
              key={slot.time}
              type="button"
              disabled={!slot.available}
              onClick={() => slot.available && onSelect(slot.time)}
              className={cn(
                'h-12 rounded-lg border-2 text-sm font-medium transition-all duration-150',
                !slot.available
                  ? 'cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300'
                  : selected === slot.time
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-100'
                  : 'cursor-pointer border-slate-200 bg-white text-slate-700 hover:border-emerald-300 active:scale-[0.98]',
              )}
            >
              {slot.time}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step 3 — Client + Pet info
// ---------------------------------------------------------------------------

interface InfoData {
  clientName: string
  clientPhone: string
  petName: string
  petSpecies: PetSpecies
}

function InfoStep({
  data,
  onChange,
}: {
  data: InfoData
  onChange: (patch: Partial<InfoData>) => void
}) {
  return (
    <div>
      <h2 className="mb-1 text-lg font-semibold text-slate-900">Seus dados</h2>
      <p className="mb-5 text-sm text-slate-500">Usaremos o telefone para confirmar</p>

      <div className="space-y-5">
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <UserIcon className="h-4 w-4 text-emerald-600" />
            Sobre você
          </p>
          <div className="space-y-1">
            <Label htmlFor="clientName" className="text-sm text-slate-600">Seu nome *</Label>
            <Input
              id="clientName"
              value={data.clientName}
              onChange={(e) => onChange({ clientName: e.target.value })}
              placeholder="Nome completo"
              autoComplete="name"
              className="border-slate-200 bg-slate-50 focus:bg-white"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="clientPhone" className="text-sm text-slate-600">Telefone (WhatsApp) *</Label>
            <Input
              id="clientPhone"
              type="tel"
              inputMode="tel"
              value={data.clientPhone}
              onChange={(e) => onChange({ clientPhone: e.target.value })}
              placeholder="(11) 99999-9999"
              autoComplete="tel"
              className="border-slate-200 bg-slate-50 focus:bg-white"
            />
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <PawPrintIcon className="h-4 w-4 text-emerald-600" />
            Sobre o pet
          </p>
          <div className="space-y-1">
            <Label htmlFor="petName" className="text-sm text-slate-600">Nome do pet *</Label>
            <Input
              id="petName"
              value={data.petName}
              onChange={(e) => onChange({ petName: e.target.value })}
              placeholder="Ex: Rex, Mel, Bolinha..."
              className="border-slate-200 bg-slate-50 focus:bg-white"
            />
          </div>
          <div className="space-y-2">
            <p className="text-sm text-slate-600">Espécie *</p>
            <div className="grid grid-cols-2 gap-2">
              {SPECIES_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onChange({ petSpecies: opt.value })}
                  className={cn(
                    'flex items-center gap-2 rounded-lg border-2 p-3 text-sm font-medium transition-all duration-150',
                    data.petSpecies === opt.value
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300',
                  )}
                >
                  <span className="text-lg">{opt.emoji}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step 4 — Review & confirm
// ---------------------------------------------------------------------------

function ReviewStep({
  service,
  date,
  time,
  info,
  onConfirm,
  error,
  isPending,
}: {
  service: Service
  date: Date
  time: string
  info: InfoData
  onConfirm: () => void
  error: string | null
  isPending: boolean
}) {
  const speciesLabel = SPECIES_OPTIONS.find((o) => o.value === info.petSpecies)?.label ?? info.petSpecies

  const rows = [
    { label: 'Serviço', value: `${service.name} — ${service.duration_minutes} min` },
    { label: 'Data', value: format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR }) },
    { label: 'Horário', value: time },
    { label: 'Valor', value: formatCurrency(service.price) },
    { label: 'Nome', value: info.clientName },
    { label: 'Telefone', value: info.clientPhone },
    { label: 'Pet', value: `${info.petName} (${speciesLabel})` },
  ]

  return (
    <div>
      <h2 className="mb-1 text-lg font-semibold text-slate-900">Confirmar agendamento</h2>
      <p className="mb-5 text-sm text-slate-500">Revise os detalhes antes de confirmar</p>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {rows.map((row, i) => (
          <div
            key={row.label}
            className={cn(
              'flex items-start justify-between gap-4 px-4 py-3 text-sm',
              i < rows.length - 1 && 'border-b border-slate-100',
            )}
          >
            <span className="shrink-0 text-slate-500">{row.label}</span>
            <span className="text-right font-medium text-slate-900 capitalize">{row.value}</span>
          </div>
        ))}
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <Button
        className="mt-6 h-14 w-full bg-emerald-600 text-base font-semibold hover:bg-emerald-700 active:scale-[0.99]"
        onClick={onConfirm}
        disabled={isPending}
      >
        {isPending ? (
          <>
            <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
            Confirmando...
          </>
        ) : (
          'Confirmar agendamento'
        )}
      </Button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Success state
// ---------------------------------------------------------------------------

function SuccessState({
  serviceName,
  date,
  time,
  tenantPhone,
}: {
  serviceName: string
  date: string
  time: string
  tenantPhone: string | null
}) {
  const dateObj = new Date(date + 'T12:00:00')
  const formattedDate = format(dateObj, "EEEE, d 'de' MMMM", { locale: ptBR })

  return (
    <div className="text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
        <CheckIcon className="h-8 w-8 text-emerald-600" />
      </div>
      <h2 className="text-xl font-semibold text-slate-900">Agendamento confirmado!</h2>
      <p className="mt-2 text-sm text-slate-500">Você receberá uma confirmação em breve.</p>

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white text-left">
        {[
          { label: 'Serviço', value: serviceName },
          { label: 'Data', value: formattedDate },
          { label: 'Horário', value: time },
        ].map((row, i, arr) => (
          <div
            key={row.label}
            className={cn(
              'flex items-center justify-between px-4 py-3 text-sm',
              i < arr.length - 1 && 'border-b border-slate-100',
            )}
          >
            <span className="text-slate-500">{row.label}</span>
            <span className="font-medium text-slate-900 capitalize">{row.value}</span>
          </div>
        ))}
      </div>

      {tenantPhone && (
        <a
          href={`https://wa.me/55${tenantPhone.replace(/\D/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-emerald-200 bg-emerald-50 py-3 text-sm font-medium text-emerald-700 hover:bg-emerald-100"
        >
          Falar pelo WhatsApp
        </a>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Wizard
// ---------------------------------------------------------------------------

const TOTAL_STEPS = 5

export function BookingWizard({ tenant, services, closedDaysOfWeek }: Props) {
  const [step, setStep] = useState(0)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [info, setInfo] = useState<InfoData>({
    clientName: '',
    clientPhone: '',
    petName: '',
    petSpecies: 'dog',
  })
  const [bookError, setBookError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [success, setSuccess] = useState<{ serviceName: string; date: string; time: string } | null>(null)

  async function fetchSlots(service: Service, date: Date) {
    setSlotsLoading(true)
    setSlots([])
    try {
      const dateStr = format(date, 'yyyy-MM-dd')
      const res = await fetch(
        `/api/public/${tenant.slug}/slots?date=${dateStr}&serviceId=${service.id}`,
      )
      const json: { slots?: TimeSlot[] } = await res.json()
      setSlots(json.slots ?? [])
    } catch {
      setSlots([])
    } finally {
      setSlotsLoading(false)
    }
  }

  function handleServiceSelect(svc: Service) {
    setSelectedService(svc)
    setSelectedDate(undefined)
    setSelectedTime(null)
    setSlots([])
  }

  function handleDateSelect(date: Date) {
    setSelectedDate(date)
    setSelectedTime(null)
    if (selectedService) fetchSlots(selectedService, date)
  }

  function canAdvance() {
    if (step === 0) return selectedService !== null
    if (step === 1) return selectedDate !== undefined
    if (step === 2) return selectedTime !== null
    if (step === 3) {
      return (
        info.clientName.trim().length >= 2 &&
        info.clientPhone.trim().length >= 8 &&
        info.petName.trim().length >= 1
      )
    }
    return false
  }

  function advance() {
    if (step === 1 && selectedService && selectedDate) {
      fetchSlots(selectedService, selectedDate)
    }
    setStep((s) => s + 1)
  }

  function confirm() {
    if (!selectedService || !selectedDate || !selectedTime) return
    setBookError(null)

    startTransition(async () => {
      try {
        const res = await fetch(`/api/public/${tenant.slug}/book`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            serviceId: selectedService.id,
            date: format(selectedDate, 'yyyy-MM-dd'),
            time: selectedTime,
            clientName: info.clientName.trim(),
            clientPhone: info.clientPhone.trim(),
            petName: info.petName.trim(),
            petSpecies: info.petSpecies,
          }),
        })
        const json: { error?: string; serviceName?: string; date?: string; time?: string } = await res.json()
        if (!res.ok) {
          setBookError(json.error ?? 'Erro ao confirmar. Tente novamente.')
          return
        }
        setSuccess({
          serviceName: json.serviceName ?? selectedService.name,
          date: json.date ?? format(selectedDate, 'yyyy-MM-dd'),
          time: json.time ?? selectedTime,
        })
      } catch {
        setBookError('Erro de conexão. Verifique sua internet e tente novamente.')
      }
    })
  }

  if (success) {
    return (
      <SuccessState
        serviceName={success.serviceName}
        date={success.date}
        time={success.time}
        tenantPhone={tenant.phone}
      />
    )
  }

  const stepLabel = STEP_LABELS[step]

  return (
    <div>
      <StepDots current={step} total={TOTAL_STEPS} />

      <p className="mb-4 text-center text-xs font-medium uppercase tracking-wider text-slate-400">
        Passo {step + 1} de {TOTAL_STEPS} — {stepLabel}
      </p>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        {step === 0 && (
          <ServiceStep
            services={services}
            selected={selectedService?.id ?? null}
            onSelect={handleServiceSelect}
          />
        )}

        {step === 1 && (
          <DateStep
            selected={selectedDate}
            closedDaysOfWeek={closedDaysOfWeek}
            onSelect={handleDateSelect}
          />
        )}

        {step === 2 && (
          <TimeStep
            slots={slots}
            loading={slotsLoading}
            selected={selectedTime}
            onSelect={setSelectedTime}
          />
        )}

        {step === 3 && (
          <InfoStep
            data={info}
            onChange={(patch) => setInfo((prev) => ({ ...prev, ...patch }))}
          />
        )}

        {step === 4 && selectedService && selectedDate && selectedTime && (
          <ReviewStep
            service={selectedService}
            date={selectedDate}
            time={selectedTime}
            info={info}
            onConfirm={confirm}
            error={bookError}
            isPending={isPending}
          />
        )}
      </div>

      {/* Navigation */}
      <div className={cn('mt-4 flex gap-3', step === 0 ? 'justify-end' : 'justify-between')}>
        {step > 0 && (
          <Button
            variant="ghost"
            onClick={() => setStep((s) => s - 1)}
            disabled={isPending}
            className="gap-1 text-slate-600"
          >
            <ChevronLeftIcon className="h-4 w-4" />
            Voltar
          </Button>
        )}

        {step < TOTAL_STEPS - 1 && (
          <Button
            onClick={advance}
            disabled={!canAdvance()}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40"
          >
            Continuar
          </Button>
        )}
      </div>
    </div>
  )
}
