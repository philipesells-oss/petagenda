import { redirect } from 'next/navigation'

import { getCurrentUser } from '@/lib/auth/get-current-user'
import { ServicesTable } from '@/components/services/services-table'

export default async function ServicesPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  return (
    <div className="mx-auto w-full max-w-6xl p-4 md:p-6">
      <ServicesTable tenantId={user.tenantId} />
    </div>
  )
}
