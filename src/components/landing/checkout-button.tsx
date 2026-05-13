'use client'

import { useState } from 'react'
import { Loader2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { SupportedCurrency, BillingInterval } from '@/lib/stripe'

interface Props {
  label?: string
  size?: 'default' | 'lg' | 'sm'
  className?: string
  currency?: SupportedCurrency
  interval?: BillingInterval
}

export function CheckoutButton({
  label,
  size = 'lg',
  className,
  currency = 'BRL',
  interval = 'month',
}: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const defaultLabel = interval === 'year'
    ? currency === 'EUR'
      ? 'Começar agora — €199/ano'
      : currency === 'USD'
      ? 'Start now — $199/year'
      : 'Começar agora — R$299/ano'
    : currency === 'EUR'
    ? 'Começar agora — €19,90/mês'
    : currency === 'USD'
    ? 'Start now — $19.90/mo'
    : 'Começar agora — R$29,90/mês'

  async function handleClick() {
    setLoading(true)
    setError(null)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fbq = (window as any).fbq
    if (typeof fbq === 'function') {
      fbq('track', 'InitiateCheckout')
    }
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currency, interval }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? `HTTP ${res.status}`)
      }
      const { url } = await res.json()
      if (url) {
        window.location.href = url
      } else {
        throw new Error('No checkout URL returned')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado')
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <Button size={size} className={className} onClick={handleClick} disabled={loading}>
        {loading ? <Loader2Icon className="animate-spin" /> : (label ?? defaultLabel)}
      </Button>
      {error && (
        <p className="text-xs text-red-500">Erro: {error} — tente novamente</p>
      )}
    </div>
  )
}
