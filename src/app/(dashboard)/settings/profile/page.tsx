import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { Card } from '@/components/ui/card'
import { ProfileForm } from './profile-form'
import { getT } from '@/lib/server-i18n'
import type { TenantRow } from '@/types'

export const dynamic = 'force-dynamic'

function addressToString(address: TenantRow['address']): string {
  if (!address) return ''
  if (typeof address === 'string') return address
  try {
    if (typeof address === 'object' && !Array.isArray(address)) {
      const obj = address as Record<string, unknown>
      if (typeof obj.value === 'string') return obj.value
      if (typeof obj.formatted === 'string') return obj.formatted
      return JSON.stringify(address)
    }
    return JSON.stringify(address)
  } catch {
    return ''
  }
}

export default async function TenantProfilePage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const t = await getT()
  const supabase = await createClient()
  const { data: tenant } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', user.tenantId)
    .single<TenantRow>()

  const currentAddress = tenant ? addressToString(tenant.address) : ''

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 p-4 md:p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t.settings.profileTitle}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t.settings.profileSubtitle}
        </p>
      </header>

      <Card className="p-4 md:p-6">
        <ProfileForm
          defaultName={tenant?.name ?? ''}
          defaultPhone={tenant?.phone ?? ''}
          defaultAddress={currentAddress}
        />
      </Card>
    </div>
  )
}
