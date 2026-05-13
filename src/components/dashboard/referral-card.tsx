'use client'

import { useEffect, useState } from 'react'
import { GiftIcon, CopyIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

interface BillingSummary {
  referralCode: string | null
  referralUrl: string | null
  hasStripeCustomer?: boolean
  subscriptionStatus?: string | null
}

/**
 * Dashboard referral promo card.
 *
 * Fetches /api/billing/summary client-side to retrieve the tenant's
 * referral URL and surfaces a copy-to-clipboard CTA. Only renders
 * when the tenant has an active referral_code (post-Stripe webhook).
 */
export function ReferralCard() {
  const [referralUrl, setReferralUrl] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/billing/summary')
      .then((r) => (r.ok ? r.json() : null))
      .then((data: BillingSummary | null) => {
        if (cancelled || !data?.referralUrl) return
        setReferralUrl(data.referralUrl)
      })
      .catch(() => {
        /* silent: feature is non-critical */
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (!referralUrl) return null

  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm space-y-3 dark:border-emerald-800 dark:bg-emerald-950/30">
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
          <GiftIcon className="size-5 text-emerald-600 dark:text-emerald-300" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
            Indique e ganhe 1 mês grátis
          </p>
          <p className="mt-0.5 text-xs text-emerald-700 dark:text-emerald-400">
            A cada amigo que assinar usando seu link, você ganha{' '}
            <strong>1 mês 100% grátis</strong> automaticamente.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <code className="flex-1 truncate rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs text-emerald-700 dark:border-emerald-700 dark:bg-gray-900 dark:text-emerald-300">
          {referralUrl}
        </code>
        <Button
          size="sm"
          variant="outline"
          className="shrink-0 border-emerald-300 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-700 dark:text-emerald-300 dark:hover:bg-emerald-900/40"
          onClick={() => {
            navigator.clipboard.writeText(referralUrl)
            toast.success('Link copiado!')
          }}
          aria-label="Copiar link de indicação"
        >
          <CopyIcon className="size-4" />
        </Button>
      </div>
    </div>
  )
}
