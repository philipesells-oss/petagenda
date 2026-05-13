import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  ClockIcon,
  ScissorsIcon,
  UsersIcon,
  BuildingIcon,
  ChevronRightIcon,
  CreditCardIcon,
  CalendarCheckIcon,
} from 'lucide-react'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { getT } from '@/lib/server-i18n'

export default async function SettingsPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const t = await getT()

  const items = [
    {
      href: '/settings/profile',
      icon: BuildingIcon,
      title: t.settings.profileTitle,
      description: t.settings.profileSubtitle,
    },
    {
      href: '/settings/hours',
      icon: ClockIcon,
      title: t.settings.hoursTitle,
      description: t.settings.hoursSubtitle,
    },
    {
      href: '/settings/services',
      icon: ScissorsIcon,
      title: t.settings.servicesTitle,
      description: t.settings.servicesSubtitle,
    },
    {
      href: '/settings/team',
      icon: UsersIcon,
      title: t.settings.teamTitle,
      description: t.settings.teamSubtitle,
    },
    {
      href: '/settings/billing',
      icon: CreditCardIcon,
      title: 'Plano e cobrança',
      description: 'Gerencie sua assinatura e método de pagamento.',
    },
    {
      href: '/settings/booking',
      icon: CalendarCheckIcon,
      title: 'Agendamento online',
      description: 'Link público para clientes agendarem diretamente.',
    },
  ]

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 p-4 md:p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{t.settings.title}</h1>
        <p className="text-sm text-muted-foreground">
          {t.settings.subtitle}
        </p>
      </header>

      <div className="divide-y rounded-xl border bg-card">
        {items.map(({ href, icon: Icon, title, description }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-4 px-4 py-4 hover:bg-muted/50 transition-colors"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Icon className="size-5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{title}</p>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
            <ChevronRightIcon className="size-4 text-muted-foreground shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  )
}
