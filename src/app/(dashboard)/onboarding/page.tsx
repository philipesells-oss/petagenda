import { redirect } from 'next/navigation'

import { getCurrentUser } from '@/lib/auth/get-current-user'
import { OnboardingWizard } from './wizard'

export default async function OnboardingPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  return (
    <div className="mx-auto w-full max-w-2xl p-4 md:p-6">
      <OnboardingWizard tenantId={user.tenantId} />
    </div>
  )
}
