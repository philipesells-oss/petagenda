import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { createClient } from '@/lib/supabase/server'
import { TeamPanel } from './team-panel'
import type { UserRow } from '@/types'

export const dynamic = 'force-dynamic'

export default async function TeamPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const supabase = await createClient()
  const [{ data }, { data: servicesData }] = await Promise.all([
    supabase
      .from('users')
      .select('id, full_name, role, is_active')
      .eq('tenant_id', user.tenantId)
      .order('full_name'),
    supabase
      .from('services')
      .select('id, name')
      .eq('tenant_id', user.tenantId)
      .eq('is_active', true)
      .order('name'),
  ])

  const members = (data ?? []) as Pick<UserRow, 'id' | 'full_name' | 'role' | 'is_active'>[]
  const allServices = (servicesData ?? []) as { id: string; name: string }[]

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-4 md:p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Equipe</h1>
        <p className="text-sm text-muted-foreground">
          Gerencie os funcionários do seu pet shop.
        </p>
      </header>
      <TeamPanel members={members} callerRole={user.role} allServices={allServices} />
    </div>
  )
}
