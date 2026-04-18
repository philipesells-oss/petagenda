import { redirect } from 'next/navigation'

import { Sidebar, MobileBottomNav } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'
import { Toaster } from '@/components/ui/sonner'
import { getCurrentUser } from '@/lib/auth/get-current-user'

/**
 * Dashboard Layout — Server Component.
 *
 * Middleware already blocks unauthenticated access, but we still load the
 * current user here to render the topbar (shop name, avatar) and to bail
 * out if the user somehow reached this tree without a tenant row.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (user.forcePasswordChange) redirect('/first-access')

  return (
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Topbar
          shopName={user.tenant.name}
          userName={user.fullName}
          userEmail={user.email}
        />
        <main className="flex-1 pb-20 md:pb-0">{children}</main>
      </div>
      <MobileBottomNav />
      <Toaster />
    </div>
  )
}
