'use client'

import { useState } from 'react'
import { Loader2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { PlanCurrency } from '@/lib/stripe'

interface Props {
  label?: string
  size?: 'default' | 'lg' | 'sm'
  className?: string
  currency?: PlanCurrency
}

export function CheckoutButton({
  label,
  size = 'lg',
  className,
  currency = 'BRL',
}: Props) {
  const [loading, setLoading] = useState(false)

  const defaultLabel = currency === 'EUR'
    ? 'Começar agora — €19,90/mês'
    : currency === 'USD'
    ? 'Start now — $19.90/mo'
    : 'Começar agora — R$29,90/mês'

  async function handleClick() {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currency }),
      })
      const { url } = await res.json()
      if (url) window.location.href = url
    } catch {
      setLoading(false)
    }
  }

  return (
    <Button size={size} className={className} onClick={handleClick} disabled={loading}>
      {loading ? <Loader2Icon className="animate-spin" /> : (label ?? defaultLabel)}
    </Button>
  )
}
