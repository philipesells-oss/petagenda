import Link from 'next/link'

import { getCurrentUser } from '@/lib/auth/get-current-user'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'

/**
 * Dashboard home. Shows a welcome header and — if onboarding was skipped —
 * a banner nudging the user to finish setup.
 *
 * Onboarding completion is inferred from the presence of at least one
 * business_hours row AND one service row in the tenant. The onboarding
 * flow creates both, so this check is a lightweight stand-in until a
 * dedicated `onboarding_completed_at` column is added.
 */
export default async function DashboardHome() {
  const user = await getCurrentUser()
  if (!user) return null

  const supabase = await createClient()
  const [hoursResult, servicesResult] = await Promise.all([
    supabase
      .from('business_hours')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_id', user.tenantId),
    supabase
      .from('services')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_id', user.tenantId),
  ])

  const onboardingComplete =
    (hoursResult.count ?? 0) > 0 && (servicesResult.count ?? 0) > 0

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-6">
      {!onboardingComplete && (
        <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-amber-900 dark:bg-amber-950">
          <div>
            <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
              Configuração do pet shop pendente
            </p>
            <p className="text-xs text-amber-800 dark:text-amber-200">
              Leva menos de 2 minutos e libera todos os recursos da PetAgenda.
            </p>
          </div>
          <Button
            size="sm"
            render={<Link href="/onboarding">Completar configuração</Link>}
          />
        </div>
      )}

      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Olá, {user.fullName.split(' ')[0]} 🐾
        </h1>
        <p className="text-sm text-muted-foreground">
          Bem-vindo à PetAgenda. Seu painel aparecerá aqui.
        </p>
      </header>
    </div>
  )
}
