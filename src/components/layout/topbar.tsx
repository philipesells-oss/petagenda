'use client'

import { LogOutIcon, UserIcon } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { signOut } from '@/actions/auth'

interface TopbarProps {
  shopName: string
  userName: string
  userEmail: string | null
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .filter(Boolean)
    .join('')
    .toUpperCase()
}

export function Topbar({ shopName, userName, userEmail }: TopbarProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-background px-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold truncate max-w-[60vw]">{shopName}</span>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon" aria-label="Menu do usuário">
              <Avatar className="size-8">
                <AvatarFallback>{initials(userName) || 'U'}</AvatarFallback>
              </Avatar>
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{userName}</span>
              {userEmail && (
                <span className="text-xs text-muted-foreground truncate">{userEmail}</span>
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <UserIcon className="size-4" />
            Minha conta
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <form action={signOut}>
            <DropdownMenuItem
              render={
                <button type="submit" className="w-full">
                  <LogOutIcon className="size-4" />
                  Sair
                </button>
              }
            />
          </form>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
