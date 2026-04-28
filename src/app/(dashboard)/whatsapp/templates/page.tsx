import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeftIcon, LayoutTemplateIcon } from 'lucide-react'

import { getCurrentUser } from '@/lib/auth/get-current-user'
import { createClient } from '@/lib/supabase/server'
import { getT } from '@/lib/server-i18n'
import { TemplateList } from '@/components/whatsapp/template-list'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { MessageTemplate } from '@/actions/whatsapp'

export const dynamic = 'force-dynamic'

export default async function TemplatesPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const t = await getT()
  const supabase = await createClient()
  const { data } = await supabase
    .from('message_templates')
    .select('*')
    .or(`is_default.eq.true,tenant_id.eq.${user.tenantId}`)
    .order('is_default', { ascending: false })
    .order('category')
    .order('name')

  const templates = (data ?? []) as MessageTemplate[]

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center gap-3">
        <Link href="/whatsapp" className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}>
          <ArrowLeftIcon className="size-4" />
        </Link>
        <div className="flex items-center gap-2">
          <LayoutTemplateIcon className="size-5 text-muted-foreground" />
          <h1 className="text-xl font-semibold">{t.whatsapp.templatesTitle}</h1>
        </div>
      </div>

      <p className="text-sm text-muted-foreground -mt-3">
        {t.whatsapp.templatesSubtitle}
      </p>

      <TemplateList templates={templates} />
    </div>
  )
}
