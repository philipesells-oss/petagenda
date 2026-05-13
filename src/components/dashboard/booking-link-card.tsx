'use client'

import { CopyIcon, CheckIcon, ExternalLinkIcon, CalendarIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface Props {
  bookingUrl: string
}

export function BookingLinkCard({ bookingUrl }: Props) {
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard.writeText(bookingUrl).then(() => {
      setCopied(true)
      toast.success('Link copiado!')
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 shadow-sm space-y-3 dark:border-blue-800 dark:bg-blue-950/30">
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50">
          <CalendarIcon className="size-5 text-blue-600 dark:text-blue-300" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">
            Link de agendamento online
          </p>
          <p className="mt-0.5 text-xs text-blue-700 dark:text-blue-400">
            Compartilhe este link com seus clientes para que agendem direto, sem WhatsApp.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <code className="flex-1 truncate rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs text-blue-700 dark:border-blue-700 dark:bg-gray-900 dark:text-blue-300">
          {bookingUrl}
        </code>
        <Button
          size="sm"
          variant="outline"
          className="shrink-0 border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/40"
          onClick={copy}
          aria-label="Copiar link de agendamento"
        >
          {copied ? <CheckIcon className="size-4 text-emerald-600" /> : <CopyIcon className="size-4" />}
        </Button>
        <a
          href={bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-blue-300 bg-white hover:bg-blue-100 dark:border-blue-700 dark:bg-gray-900 dark:hover:bg-blue-900/40"
          aria-label="Abrir página de agendamento"
        >
          <ExternalLinkIcon className="size-4 text-blue-600 dark:text-blue-300" />
        </a>
      </div>
      <p className="text-right text-xs text-blue-600 dark:text-blue-400">
        <Link href="/settings/booking" className="hover:underline">
          Configurar agendamento →
        </Link>
      </p>
    </div>
  )
}
