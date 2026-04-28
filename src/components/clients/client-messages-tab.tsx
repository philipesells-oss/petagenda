'use client'

import { MessageCircle } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/language-context'

interface ClientMessagesTabProps {
  clientFullName: string
  clientPhone: string
  petName?: string | null
}

const TEMPLATE_KEYS = [
  { key: 't1' },
  { key: 't2' },
  { key: 't3' },
  { key: 't4' },
  { key: 't5' },
  { key: 't6' },
  { key: 't7' },
  { key: 't8' },
] as const

export function ClientMessagesTab({
  clientFullName,
  clientPhone,
  petName,
}: ClientMessagesTabProps) {
  const { t } = useLanguage()
  const firstName = clientFullName.split(' ')[0] ?? clientFullName
  const phoneDigits = clientPhone.replace(/\D/g, '')
  const pet = petName && petName.trim() ? petName : 'pet'
  // Generic placeholder for date — user fills in WhatsApp.
  const datePlaceholder = '___'

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {t('messages.intro', { name: clientFullName })}
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {TEMPLATE_KEYS.map(({ key }) => {
          const label = t(`messages.${key}.label`)
          const msg = t(`messages.${key}.msg`, {
            name: firstName,
            pet,
            date: datePlaceholder,
          })
          return (
            <a
              key={key}
              href={`https://wa.me/55${phoneDigits}?text=${encodeURIComponent(msg)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-lg border p-4 hover:bg-muted transition-colors"
            >
              <MessageCircle className="h-5 w-5 shrink-0 text-[#25D366]" />
              <div className="min-w-0">
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground line-clamp-1">{msg}</p>
              </div>
            </a>
          )
        })}
      </div>
    </div>
  )
}
