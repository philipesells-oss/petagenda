'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboardIcon,
  CalendarDaysIcon,
  UsersIcon,
  SettingsIcon,
  LogOutIcon,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { signOut } from '@/actions/auth'
import { useLanguage } from '@/lib/i18n'

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function Sidebar() {
  const pathname = usePathname()
  const { t } = useLanguage()

  const NAV_ITEMS = [
    { href: '/dashboard', label: t.nav.dashboard, icon: LayoutDashboardIcon, exact: true },
    { href: '/agenda', label: t.nav.agenda, icon: CalendarDaysIcon },
    { href: '/clients', label: t.nav.clients, icon: UsersIcon },
    { href: '/settings', label: t.nav.settings, icon: SettingsIcon },
  ]

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-background md:flex">
      <div className="flex h-14 items-center gap-2 border-b border-border px-4 text-lg font-semibold">
        <span aria-hidden="true">🐾</span>
        <span>PetFlow</span>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href, item.exact)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          )
        })}
        <div className="mt-auto pt-3">
          <form action={signOut}>
            <button
              type="submit"
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <LogOutIcon className="size-4" />
              {t.nav.signOut}
            </button>
          </form>
        </div>
      </nav>
    </aside>
  )
}

export function MobileBottomNav() {
  const pathname = usePathname()
  const { t } = useLanguage()

  const NAV_ITEMS = [
    { href: '/dashboard', label: t.nav.dashboard, icon: LayoutDashboardIcon, exact: true },
    { href: '/agenda', label: t.nav.agenda, icon: CalendarDaysIcon },
    { href: '/clients', label: t.nav.clients, icon: UsersIcon },
    { href: '/settings', label: t.nav.settings, icon: SettingsIcon },
  ]

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-border bg-background/95 px-2 py-1.5 backdrop-blur md:hidden">
      {NAV_ITEMS.map((item) => {
        const active = isActive(pathname, item.href, item.exact)
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-[10px] font-medium transition-colors',
              active ? 'text-foreground' : 'text-muted-foreground',
            )}
          >
            <Icon className="size-5" />
            {item.label}
          </Link>
        )
      })}
      <form action={signOut}>
        <button
          type="submit"
          className="flex flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-[10px] font-medium text-muted-foreground transition-colors"
        >
          <LogOutIcon className="size-5" />
          {t.nav.signOut}
        </button>
      </form>
    </nav>
  )
}
