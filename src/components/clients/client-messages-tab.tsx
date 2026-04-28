'use client'

import Link from 'next/link'
import { MessageCircle } from 'lucide-react'
import { useLanguage } from '@/lib/i18n'

interface ClientMessagesTabProps {
  clientFirstName: string
  clientPhone: string
}

export function ClientMessagesTab({ clientFirstName, clientPhone }: ClientMessagesTabProps) {
  const { t } = useLanguage()
  const phoneDigits = clientPhone.replace(/\D/g, '')
  const intro = t.clientDetail.sendMessageIntro.replace(/\{\{firstName\}\}/g, clientFirstName)

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{intro}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {t.clientDetail.messageTemplates.map(({ label, msg }) => {
          const personalizedMsg = msg.replace(/\{\{firstName\}\}/g, clientFirstName)
          return (
            <Link
              key={label}
              href={`https://wa.me/55${phoneDigits}?text=${encodeURIComponent(personalizedMsg)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-lg border p-4 hover:bg-muted transition-colors"
            >
              <MessageCircle className="h-5 w-5 shrink-0 text-[#25D366]" />
              <div className="min-w-0">
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground line-clamp-1">{personalizedMsg}</p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
