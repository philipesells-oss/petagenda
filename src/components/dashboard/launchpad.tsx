import Link from 'next/link'
import { CheckCircle2Icon, CircleIcon, ArrowRightIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Step {
  id: string
  done: boolean
  emoji: string
  title: string
  desc: string
  href: string
  label: string
  optional?: boolean
}

interface LaunchpadProps {
  hasHours: boolean
  hasServices: boolean
  hasTeam: boolean
  hasFirstAppointment: boolean
}

export function Launchpad({ hasHours, hasServices, hasTeam, hasFirstAppointment }: LaunchpadProps) {
  const steps: Step[] = [
    {
      id: 'hours',
      done: hasHours,
      emoji: '⏰',
      title: 'Horário de funcionamento',
      desc: 'Configure os dias e horários que seu pet shop atende',
      href: '/settings/hours',
      label: 'Configurar horários',
    },
    {
      id: 'services',
      done: hasServices,
      emoji: '✂️',
      title: 'Serviços oferecidos',
      desc: 'Banho, tosa, consulta — com preço e duração',
      href: '/settings/services',
      label: 'Cadastrar serviços',
    },
    {
      id: 'team',
      done: hasTeam,
      emoji: '👤',
      title: 'Equipe',
      desc: 'Cadastre funcionários para acessarem o sistema',
      href: '/settings/team',
      label: 'Adicionar equipe',
      optional: true,
    },
    {
      id: 'appointment',
      done: hasFirstAppointment,
      emoji: '📅',
      title: 'Primeiro agendamento',
      desc: 'Agende um cliente e veja o sistema funcionando',
      href: '/agenda',
      label: 'Abrir agenda',
    },
  ]

  const completedCount = steps.filter((s) => s.done).length
  const requiredDone = hasHours && hasServices && hasFirstAppointment

  if (requiredDone && hasTeam) return null

  const pct = Math.round((completedCount / steps.length) * 100)

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold">Configure seu PetFlow</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {completedCount} de {steps.length} etapas concluídas
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          {pct}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Steps grid */}
      <div className="grid gap-3 sm:grid-cols-2">
        {steps.map((step) => (
          <div
            key={step.id}
            className={cn(
              'flex items-start gap-3 rounded-xl border p-3 transition-colors',
              step.done
                ? 'border-emerald-100 bg-emerald-50/60 dark:border-emerald-900/40 dark:bg-emerald-950/30'
                : 'border-border bg-background',
            )}
          >
            {/* Status icon */}
            <div
              className={cn(
                'flex size-9 shrink-0 items-center justify-center rounded-full text-base',
                step.done
                  ? 'bg-emerald-100 dark:bg-emerald-900/50'
                  : 'bg-muted',
              )}
            >
              {step.done ? (
                <CheckCircle2Icon className="size-5 text-emerald-600" />
              ) : (
                <span>{step.emoji}</span>
              )}
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className={cn('text-sm font-medium leading-tight', step.done && 'text-muted-foreground line-through')}>
                {step.title}
                {step.optional && (
                  <span className="ml-1.5 text-[11px] font-normal no-underline text-muted-foreground">
                    (opcional)
                  </span>
                )}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground leading-snug">{step.desc}</p>
            </div>

            {/* Action */}
            {!step.done && (
              <Link
                href={step.href}
                className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
              >
                {step.label}
                <ArrowRightIcon className="size-3" />
              </Link>
            )}
          </div>
        ))}
      </div>

      {requiredDone && (
        <p className="text-center text-xs text-muted-foreground pt-1">
          ✅ Configuração essencial concluída — o PetFlow está pronto para uso!
        </p>
      )}
    </div>
  )
}
