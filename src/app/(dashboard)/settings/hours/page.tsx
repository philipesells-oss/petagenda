import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { HoursForm } from '@/components/settings/hours-form'
import type { BusinessHourRow } from '@/types'
import type { BusinessHourInput } from '@/actions/settings'

export const dynamic = 'force-dynamic'

export default async function HoursSettingsPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const supabase = await createClient()
  const { data } = await supabase
    .from('business_hours')
    .select('*')
    .eq('tenant_id', user.tenantId)
    .order('day_of_week', { ascending: true })

  const initial: BusinessHourInput[] = ((data ?? []) as BusinessHourRow[]).map((h) => ({
    day_of_week: h.day_of_week,
    is_open: h.is_open,
    open_time: h.open_time,
    close_time: h.close_time,
    break_start: h.break_start,
    break_end: h.break_end,
  }))

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Horário de Funcionamento</h1>
        <p className="text-muted-foreground text-sm">
          Configure os dias e horários de atendimento do seu pet shop.
        </p>
      </div>
      <HoursForm initial={initial} />
    </div>
  )
}
