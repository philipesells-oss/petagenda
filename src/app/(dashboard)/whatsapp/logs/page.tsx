import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeftIcon, ClipboardListIcon } from 'lucide-react'

import { getCurrentUser } from '@/lib/auth/get-current-user'
import { createClient } from '@/lib/supabase/server'
import { MessageLogTable } from '@/components/whatsapp/message-log-table'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { MessageLog } from '@/actions/whatsapp'

export const dynamic = 'force-dynamic'

export default async function LogsPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const supabase = await createClient()
  const { data } = await supabase
    .from('message_logs')
    .select('*')
    .eq('tenant_id', user.tenantId)
    .order('created_at', { ascending: false })
    .limit(100)

  const logs = (data ?? []) as MessageLog[]

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center gap-3">
        <Link href="/whatsapp" className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}>
          <ArrowLeftIcon className="size-4" />
        </Link>
        <div className="flex items-center gap-2">
          <ClipboardListIcon className="size-5 text-muted-foreground" />
          <h1 className="text-xl font-semibold">Histórico de Mensagens</h1>
        </div>
      </div>

      <p className="text-sm text-muted-foreground -mt-3">
        Últimas 100 mensagens enviadas via WhatsApp
      </p>

      <MessageLogTable logs={logs} />
    </div>
  )
}
