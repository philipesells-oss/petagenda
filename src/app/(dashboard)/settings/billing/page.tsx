'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CreditCardIcon, ExternalLinkIcon, AlertTriangleIcon, Loader2Icon, CheckCircleIcon, XCircleIcon, GiftIcon, CopyIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  active:      { label: 'Ativo',      color: 'text-emerald-600' },
  trialing:    { label: 'Trial',      color: 'text-blue-600' },
  past_due:    { label: 'Em atraso',  color: 'text-yellow-600' },
  canceled:    { label: 'Cancelado',  color: 'text-red-600' },
  incomplete:  { label: 'Incompleto', color: 'text-gray-500' },
}

const CANCEL_REASONS = [
  { value: 'too_expensive',     label: 'Muito caro' },
  { value: 'not_enough_usage',  label: 'Não uso o suficiente' },
  { value: 'missing_features',  label: 'Faltam funcionalidades' },
  { value: 'switching',         label: 'Vou para outro sistema' },
  { value: 'other',             label: 'Outro motivo' },
] as const

export default function BillingPage() {
  const router = useRouter()
  const [portalLoading, setPortalLoading] = useState(false)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [referralUrl, setReferralUrl] = useState<string | null>(null)
  const [hasStripeCustomer, setHasStripeCustomer] = useState(true)
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>('active')
  const [cancelReason, setCancelReason] = useState<string | null>(null)
  const [showSurvey, setShowSurvey] = useState(false)

  useEffect(() => {
    fetch('/api/billing/summary')
      .then(r => r.json())
      .then(d => {
        if (d.referralUrl) setReferralUrl(d.referralUrl)
        setHasStripeCustomer(d.hasStripeCustomer ?? false)
        if (d.subscriptionStatus) setSubscriptionStatus(d.subscriptionStatus)
      })
      .catch(() => {})
  }, [])

  async function openPortal() {
    setPortalLoading(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        if (data.error === 'no_customer') {
          toast.error('Conta de cobrança não encontrada. Entre em contato: suporte@getpetflow.com')
        } else {
          toast.error(`Erro ao abrir portal: ${data.error}`)
        }
        setPortalLoading(false)
        return
      }
      window.location.href = data.url
    } catch {
      toast.error('Não foi possível abrir o portal. Tente novamente.')
      setPortalLoading(false)
    }
  }

  async function cancelSubscription() {
    if (!cancelReason) {
      setShowSurvey(true)
      return
    }
    setCancelLoading(true)
    try {
      const res = await fetch(`/api/stripe/cancel?reason=${encodeURIComponent(cancelReason)}`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Assinatura cancelada. Você mantém o acesso até o fim do período pago.')
      setConfirmCancel(false)
      setShowSurvey(false)
      setCancelReason(null)
      router.refresh()
    } catch {
      toast.error('Erro ao cancelar. Tente novamente ou use o portal de cobrança.')
    } finally {
      setCancelLoading(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 p-4 md:p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Plano e cobrança</h1>
        <p className="text-sm text-muted-foreground">Gerencie sua assinatura e método de pagamento.</p>
      </header>

      {/* Plan card */}
      <div className="rounded-xl border bg-card p-5 space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950">
            <CreditCardIcon className="size-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">PetFlow — Plano Único</p>
            <p className="text-xs text-muted-foreground mt-0.5">R$29,90 / mês · Cancele quando quiser</p>
          </div>
          <span className={`text-xs font-semibold ${(STATUS_LABEL[subscriptionStatus] ?? STATUS_LABEL['active']).color}`}>
            {(STATUS_LABEL[subscriptionStatus] ?? STATUS_LABEL['active']).label}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground border-t pt-4">
          <div>
            <p className="font-medium text-foreground">Incluso no plano</p>
            <ul className="mt-1.5 space-y-1">
              {['Agendamentos ilimitados','Múltiplos profissionais','Notificações WhatsApp','Suporte humano em português'].map(f => (
                <li key={f} className="flex items-center gap-1.5">
                  <CheckCircleIcon className="size-3.5 text-emerald-500 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-2">
            <div>
              <p className="text-[10px] uppercase tracking-wide font-semibold">Suporte</p>
              <p className="mt-0.5">Humano · português</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide font-semibold">Fidelidade</p>
              <p className="mt-0.5">Nenhuma — cancele quando quiser</p>
            </div>
          </div>
        </div>

        {hasStripeCustomer ? (
          <Button onClick={openPortal} disabled={portalLoading} className="w-full" variant="outline">
            {portalLoading
              ? <><Loader2Icon className="size-4 animate-spin" /> Abrindo portal…</>
              : <><ExternalLinkIcon className="size-4" /> Gerenciar plano / alterar cartão</>
            }
          </Button>
        ) : (
          <p className="text-xs text-center text-muted-foreground py-1">
            Para alterar o cartão, entre em contato: <a href="mailto:suporte@getpetflow.com" className="underline">suporte@getpetflow.com</a>
          </p>
        )}
      </div>

      {/* Referral section */}
      {referralUrl && (
        <div className="rounded-xl border bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 p-5 space-y-3">
          <div className="flex items-start gap-3">
            <GiftIcon className="size-5 text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Indique e ganhe 1 mês grátis</p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                A cada amigo que assinar usando seu link, você ganha <strong>1 mês 100% grátis</strong> automaticamente.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-lg border border-emerald-200 dark:border-emerald-700 bg-white dark:bg-gray-900 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-300 break-all">
              {referralUrl}
            </code>
            <Button
              size="sm"
              variant="outline"
              className="shrink-0 border-emerald-300 text-emerald-700 hover:bg-emerald-100"
              onClick={() => {
                navigator.clipboard.writeText(referralUrl)
                toast.success('Link copiado!')
              }}
            >
              <CopyIcon className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Cancel section */}
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5 space-y-3">
        <div className="flex items-start gap-3">
          <XCircleIcon className="size-5 text-destructive mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold">Cancelar assinatura</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Você mantém acesso completo até o fim do período já pago. Não há reembolsos parciais.
            </p>
          </div>
        </div>

        {!confirmCancel ? (
          <Button
            variant="outline"
            className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => setConfirmCancel(true)}
          >
            Cancelar assinatura
          </Button>
        ) : (
          <div className="rounded-lg border border-destructive/40 bg-background p-4 space-y-3">
            <div className="flex items-start gap-2">
              <AlertTriangleIcon className="size-4 text-destructive mt-0.5 shrink-0" />
              <p className="text-sm font-medium">Tem certeza que deseja cancelar?</p>
            </div>
            <p className="text-xs text-muted-foreground">
              Seu acesso será mantido até o fim do período atual. Após isso, sua conta será suspensa e os dados preservados por 30 dias.
            </p>

            {showSurvey && (
              <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
                <p className="text-xs font-semibold">Por que você está cancelando?</p>
                <div className="flex flex-col gap-1.5">
                  {CANCEL_REASONS.map(reason => {
                    const selected = cancelReason === reason.value
                    return (
                      <button
                        key={reason.value}
                        type="button"
                        onClick={() => setCancelReason(reason.value)}
                        className={`flex items-center gap-2 rounded-md border px-3 py-2 text-left text-xs transition-colors ${
                          selected
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300'
                            : 'border-input bg-background hover:bg-muted'
                        }`}
                      >
                        <span
                          className={`size-3.5 shrink-0 rounded-full border ${
                            selected ? 'border-emerald-500 bg-emerald-500' : 'border-muted-foreground/40'
                          }`}
                        />
                        {reason.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="destructive"
                disabled={cancelLoading || (showSurvey && !cancelReason)}
                onClick={cancelSubscription}
              >
                {cancelLoading ? <><Loader2Icon className="size-3.5 animate-spin" /> Cancelando…</> : 'Sim, cancelar'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setConfirmCancel(false)
                  setShowSurvey(false)
                  setCancelReason(null)
                }}
              >
                Voltar
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
