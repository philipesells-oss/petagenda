import { redirect } from 'next/navigation'
import Link from 'next/link'
import { MessageCircleIcon, LayoutTemplateIcon, ClipboardListIcon } from 'lucide-react'

import { getCurrentUser } from '@/lib/auth/get-current-user'
import { createClient } from '@/lib/supabase/server'
import { SetupForm } from '@/components/whatsapp/setup-form'
import { ConnectionStatus } from '@/components/whatsapp/connection-status'
import { QrCodeCard } from '@/components/whatsapp/qr-code-card'
import { MessageCounter } from '@/components/whatsapp/message-counter'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { WhatsappConfig } from '@/actions/whatsapp'

export const dynamic = 'force-dynamic'

export default async function WhatsappPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const supabase = await createClient()
  const { data: config } = await supabase
    .from('whatsapp_config')
    .select('*')
    .eq('tenant_id', user.tenantId)
    .maybeSingle<WhatsappConfig>()

  const hasConfig = !!config?.zapi_instance && !!config?.zapi_token

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center gap-3">
        <MessageCircleIcon className="size-6 text-green-500" />
        <div>
          <h1 className="text-xl font-semibold">WhatsApp</h1>
          <p className="text-sm text-muted-foreground">
            Conecte seu número e automatize mensagens
          </p>
        </div>
      </div>

      {/* Quick nav */}
      <div className="flex flex-wrap gap-2">
        <Link href="/whatsapp/templates" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
          <LayoutTemplateIcon className="mr-1.5 size-4" />
          Templates
        </Link>
        <Link href="/whatsapp/logs" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
          <ClipboardListIcon className="mr-1.5 size-4" />
          Histórico
        </Link>
      </div>

      {!hasConfig ? (
        <SetupForm />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-4">
            <ConnectionStatus config={config} />
            <MessageCounter
              used={user.tenant.messagesUsed}
              limit={user.tenant.messagesLimit}
            />
          </div>
          <QrCodeCard initialStatus={config.status} />
        </div>
      )}
    </div>
  )
}
