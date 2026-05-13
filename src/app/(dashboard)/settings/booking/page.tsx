import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { createAdminClient } from '@/lib/supabase/admin'
import { BookingSettingsForm } from './booking-settings-form'
import type { TenantRow } from '@/types'

export const dynamic = 'force-dynamic'

export default async function BookingSettingsPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()
  const { data } = await admin.from('tenants').select('*').eq('id', user.tenantId).single()
  const tenant = data as TenantRow | null

  const slug = tenant?.slug ?? ''
  const enabled = tenant?.public_booking_enabled ?? false
  const instructions = tenant?.booking_instructions ?? ''
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://getpetflow.com'

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 p-4 md:p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Agendamento Online</h1>
        <p className="text-sm text-muted-foreground">
          Permita que clientes agendem pelo link público da sua unidade.
        </p>
      </header>

      <BookingSettingsForm
        tenantId={user.tenantId}
        slug={slug}
        initialEnabled={enabled}
        initialInstructions={instructions}
        bookingUrl={`${appUrl}/book/${slug}`}
      />
    </div>
  )
}
