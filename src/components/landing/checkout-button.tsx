'use client'

import { useState } from 'react'
import { Loader2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  label?: string
  size?: 'default' | 'lg' | 'sm'
  className?: string
}

export function CheckoutButton({
  label = 'Começar agora — R$29,90/mês',
  size = 'lg',
  className,
}: Props) {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const { url } = await res.json()
      if (url) window.location.href = url
    } catch {
      setLoading(false)
    }
  }

  return (
    <Button size={size} className={className} onClick={handleClick} disabled={loading}>
      {loading ? <Loader2Icon className="animate-spin" /> : label}
    </Button>
  )
}
