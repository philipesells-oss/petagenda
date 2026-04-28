'use client'

import Link from 'next/link'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface TopbarProps {
  shopName: string
  userName: string
  userEmail: string | null
}

function initials(name: string) {
  if (!name) return 'U'
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .filter(Boolean)
    .join('')
    .toUpperCase()
}

export function Topbar({ shopName, userName, userEmail: _userEmail }: TopbarProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-background px-4">
      <span className="text-sm font-semibold truncate max-w-[60vw]">{shopName}</span>

      <Link
        href="/settings/profile"
        aria-label="Minha conta"
        className="rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <Avatar className="size-9">
          <AvatarFallback className="text-xs font-semibold">
            {initials(userName)}
          </AvatarFallback>
        </Avatar>
      </Link>
    </header>
  )
}
