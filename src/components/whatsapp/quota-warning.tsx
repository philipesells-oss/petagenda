import { AlertTriangleIcon, AlertCircleIcon } from 'lucide-react'

interface Props {
  used: number
  limit: number
  /**
   * Optional renewal date (ISO string). When omitted, falls back to the
   * first day of the next calendar month — the default Stripe monthly
   * billing cycle boundary used by PetFlow plans.
   */
  renewalDate?: string | Date | null
}

function formatRenewal(date: Date): string {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
  })
}

function defaultRenewal(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth() + 1, 1)
}

/**
 * Yellow/red alert shown when WhatsApp message quota usage reaches
 * 80%/95%. Renders nothing below 80% so it stays out of the way for
 * healthy tenants.
 */
export function QuotaWarning({ used, limit, renewalDate }: Props) {
  if (limit <= 0) return null
  const pct = used / limit
  if (pct < 0.8) return null

  const renewal = renewalDate
    ? new Date(renewalDate)
    : defaultRenewal()
  const renewalLabel = formatRenewal(renewal)
  const pctLabel = Math.min(100, Math.round(pct * 100))

  const isCritical = pct >= 0.95

  if (isCritical) {
    return (
      <div
        role="alert"
        className="flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-destructive dark:bg-destructive/20"
      >
        <AlertCircleIcon className="size-5 shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold">Quase sem mensagens!</p>
          <p className="mt-0.5 text-destructive/90">
            Você já usou {pctLabel}% da sua cota. Sua cota renova em{' '}
            <strong>{renewalLabel}</strong>.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200"
    >
      <AlertTriangleIcon className="size-5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
      <div className="text-sm">
        <p className="font-semibold">Atenção: cota chegando ao limite</p>
        <p className="mt-0.5">
          Você usou {pctLabel}% da sua cota de mensagens. Renova em{' '}
          <strong>{renewalLabel}</strong>.
        </p>
      </div>
    </div>
  )
}
