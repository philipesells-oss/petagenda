'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2Icon, ShieldCheckIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updatePassword } from '@/actions/auth'

export default function FirstAccessPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    setError(null)

    startTransition(async () => {
      const result = await updatePassword(form)
      if (!result.ok) {
        setError(result.error)
        return
      }
      toast.success('Senha criada com sucesso! Bem-vindo ao PetFlow.')
      router.push('/dashboard')
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="rounded-full bg-emerald-100 p-3 dark:bg-emerald-950">
          <ShieldCheckIcon className="size-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Crie sua senha</h1>
          <p className="text-sm text-muted-foreground">
            Por segurança, defina uma senha pessoal para continuar.
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="password">Nova senha</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
          />
          <p className="text-xs text-muted-foreground">Mínimo 8 caracteres</p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirm">Confirmar senha</Label>
          <Input
            id="confirm"
            name="confirm"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" size="lg" disabled={isPending} className="w-full">
          {isPending ? (
            <>
              <Loader2Icon className="animate-spin" /> Salvando…
            </>
          ) : (
            'Criar senha e acessar o PetFlow'
          )}
        </Button>
      </form>
    </div>
  )
}
