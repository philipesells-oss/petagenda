import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  ClockIcon,
  ScissorsIcon,
  UsersIcon,
  BuildingIcon,
  ChevronRightIcon,
} from 'lucide-react'
import { getCurrentUser } from '@/lib/auth/get-current-user'

export default async function SettingsPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const items = [
    {
      href: '/settings/profile',
      icon: BuildingIcon,
      title: 'Informações do Pet Shop',
      description: 'Nome, endereço e telefone do seu pet shop.',
    },
    {
      href: '/settings/hours',
      icon: ClockIcon,
      title: 'Horário de funcionamento',
      description: 'Dias e horários em que o pet shop atende.',
    },
    {
      href: '/settings/services',
      icon: ScissorsIcon,
      title: 'Serviços',
      description: 'Cadastre e edite os serviços oferecidos.',
    },
    {
      href: '/settings/team',
      icon: UsersIcon,
      title: 'Equipe',
      description: 'Adicione funcionários e gerencie acessos.',
    },
  ]

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 p-4 md:p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Configurações</h1>
        <p className="text-sm text-muted-foreground">
          Gerencie as configurações do seu pet shop.
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
