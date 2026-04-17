'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { CheckIcon, Loader2Icon, QrCodeIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { completeOnboarding } from './actions'

// ---------------------------------------------------------------------------
// Local types / defaults
// ---------------------------------------------------------------------------

const DAYS = [
  { idx: 0, label: 'Dom' },
  { idx: 1, label: 'Seg' },
  { idx: 2, label: 'Ter' },
  { idx: 3, label: 'Qua' },
  { idx: 4, label: 'Qui' },
  { idx: 5, label: 'Sex' },
  { idx: 6, label: 'Sáb' },
] as const

export interface BusinessHour {
  dayOfWeek: number
  isOpen: boolean
  openTime: string
  closeTime: string
}

export interface ServiceDraft {
  name: string
  durationMinutes: number
  price: number
}

const DEFAULT_HOURS: BusinessHour[] = DAYS.map((d) => ({
  dayOfWeek: d.idx,
  isOpen: d.idx >= 1 && d.idx <= 5,
  openTime: '08:00',
  closeTime: '18:00',
}))

const DEFAULT_SERVICES: ServiceDraft[] = [
  { name: 'Banho', durationMinutes: 60, price: 45 },
  { name: 'Tosa', durationMinutes: 60, price: 35 },
  { name: 'Banho + Tosa', durationMinutes: 90, price: 70 },
]

const STEPS = ['Horário', 'Serviços', 'WhatsApp'] as const

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function OnboardingWizard({ tenantId }: { tenantId: string }) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [hours, setHours] = useState<BusinessHour[]>(DEFAULT_HOURS)
  const [services, setServices] = useState<ServiceDraft[]>(DEFAULT_SERVICES)
  const [isPending, startTransition] = useTransition()

  const canAdvance = useMemo(() => {
    if (step === 0) {
      return hours.some((h) => h.isOpen)
    }
    if (step === 1) {
      return services.length > 0 && services.every((s) => s.name.trim().length > 0)
    }
    return true
  }, [step, hours, services])

  function finish() {
    startTransition(async () => {
      const result = await completeOnboarding({ tenantId, hours, services })
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success('Configuração concluída!')
      router.push('/')
      router.refresh()
    })
  }

  return (
    <div className="space-y-6 rounded-2xl border border-border bg-background p-6 shadow-sm">
      <Stepper current={step} />

      {step === 0 && <HoursStep hours={hours} onChange={setHours} />}
      {step === 1 && <ServicesStep services={services} onChange={setServices} />}
      {step === 2 && <WhatsappStep />}

      <div className="flex items-center justify-between gap-2 pt-2">
        <Button
          variant="ghost"
          size="lg"
          disabled={step === 0 || isPending}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
        >
          Voltar
        </Button>

        {step < STEPS.length - 1 ? (
          <Button
            size="lg"
            disabled={!canAdvance || isPending}
            onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
          >
            Próximo
          </Button>
        ) : (
          <Button size="lg" disabled={isPending} onClick={finish}>
            {isPending ? (
              <>
                <Loader2Icon className="animate-spin" /> Salvando…
              </>
            ) : (
              'Completar'
            )}
          </Button>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Stepper UI
// ---------------------------------------------------------------------------

function Stepper({ current }: { current: number }) {
  return (
    <ol className="flex items-center gap-2">
      {STEPS.map((label, idx) => {
        const active = idx === current
        const done = idx < current
        return (
          <li key={label} className="flex flex-1 items-center gap-2">
            <div
              className={cn(
                'flex size-7 items-center justify-center rounded-full text-xs font-semibold',
                done
                  ? 'bg-emerald-500 text-white'
                  : active
                    ? 'bg-foreground text-background'
                    : 'bg-muted text-muted-foreground',
              )}
            >
              {done ? <CheckIcon className="size-4" /> : idx + 1}
            </div>
            <span
              className={cn(
                'text-xs font-medium',
                active ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              {label}
            </span>
            {idx < STEPS.length - 1 && (
              <div
                className={cn(
                  'h-px flex-1',
                  done ? 'bg-emerald-500' : 'bg-border',
                )}
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}

// ---------------------------------------------------------------------------
// Step 1 — Business hours
// ---------------------------------------------------------------------------

function HoursStep({
  hours,
  onChange,
}: {
  hours: BusinessHour[]
  onChange: (next: BusinessHour[]) => void
}) {
  function update(idx: number, patch: Partial<BusinessHour>) {
    onChange(hours.map((h, i) => (i === idx ? { ...h, ...patch } : h)))
  }

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Horário de funcionamento</h2>
        <p className="text-sm text-muted-foreground">
          Marque os dias em que seu pet shop atende.
        </p>
      </div>

      <div className="space-y-2">
        {hours.map((h, idx) => (
          <div
            key={h.dayOfWeek}
            className="flex flex-wrap items-center gap-3 rounded-lg border border-border p-3"
          >
            <label className="flex w-20 items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={h.isOpen}
                onChange={(e) => update(idx, { isOpen: e.target.checked })}
                className="size-4 accent-foreground"
              />
              {DAYS[h.dayOfWeek].label}
            </label>
            <div className="flex items-center gap-2">
              <Input
                type="time"
                value={h.openTime}
                disabled={!h.isOpen}
                onChange={(e) => update(idx, { openTime: e.target.value })}
                className="w-28"
              />
              <span className="text-xs text-muted-foreground">até</span>
              <Input
                type="time"
                value={h.closeTime}
                disabled={!h.isOpen}
                onChange={(e) => update(idx, { closeTime: e.target.value })}
                className="w-28"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Step 2 — Services
// ---------------------------------------------------------------------------

function ServicesStep({
  services,
  onChange,
}: {
  services: ServiceDraft[]
  onChange: (next: ServiceDraft[]) => void
}) {
  function update(idx: number, patch: Partial<ServiceDraft>) {
    onChange(services.map((s, i) => (i === idx ? { ...s, ...patch } : s)))
  }

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Serviços oferecidos</h2>
        <p className="text-sm text-muted-foreground">
          Sugerimos três serviços comuns — ajuste os preços para o seu negócio.
        </p>
      </div>

      <div className="space-y-3">
        {services.map((s, idx) => (
          <div
            key={idx}
            className="grid gap-2 rounded-lg border border-border p-3 sm:grid-cols-[1fr,120px,120px]"
          >
            <div className="space-y-1">
              <Label>Nome</Label>
              <Input
                value={s.name}
                onChange={(e) => update(idx, { name: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Duração (min)</Label>
              <Input
                type="number"
                min={5}
                step={5}
                value={s.durationMinutes}
                onChange={(e) =>
                  update(idx, {
                    durationMinutes: Math.max(5, Number(e.target.value) || 0),
                  })
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Preço (R$)</Label>
              <Input
                type="number"
                min={0}
                step={1}
                value={s.price}
                onChange={(e) =>
                  update(idx, { price: Math.max(0, Number(e.target.value) || 0) })
                }
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Step 3 — WhatsApp
// ---------------------------------------------------------------------------

function WhatsappStep() {
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Conectar WhatsApp</h2>
        <p className="text-sm text-muted-foreground">
          Escaneie o QR code pelo WhatsApp Web do aparelho que será usado para
          atendimento. Você pode configurar isso depois.
        </p>
      </div>

      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-muted/30 p-6">
        <div className="flex size-40 items-center justify-center rounded-lg bg-background text-muted-foreground">
          <QrCodeIcon className="size-16" />
        </div>
        <p className="text-xs text-muted-foreground">
          QR code disponível em breve. Concluir aqui não conecta o WhatsApp.
        </p>
      </div>
    </section>
  )
}
