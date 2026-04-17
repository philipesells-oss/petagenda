'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Loader2Icon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signUp } from '@/actions/auth'

export default function SignupPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)

    startTransition(async () => {
      setFieldErrors({})
      const result = await signUp(form)
      if (!result.ok) {
        setFieldErrors(result.fieldErrors ?? {})
        toast.error(result.error)
        return
      }
      toast.success('Conta criada! Vamos configurar seu pet shop.')
      router.push('/onboarding')
      router.refresh()
    })
  }

  function errorFor(field: string) {
    return fieldErrors[field]?.[0]
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Criar conta</h1>
        <p className="text-sm text-muted-foreground">
          Comece gratuitamente — sem cartão de crédito
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="fullName">Nome completo</Label>
          <Input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            required
            aria-invalid={Boolean(errorFor('fullName'))}
          />
          {errorFor('fullName') && (
            <p className="text-xs text-destructive">{errorFor('fullName')}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            aria-invalid={Boolean(errorFor('email'))}
          />
          {errorFor('email') && (
            <p className="text-xs text-destructive">{errorFor('email')}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            aria-invalid={Boolean(errorFor('password'))}
          />
          {errorFor('password') ? (
            <p className="text-xs text-destructive">{errorFor('password')}</p>
          ) : (
            <p className="text-xs text-muted-foreground">Mínimo 8 caracteres</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="shopName">Nome do pet shop</Label>
          <Input
            id="shopName"
            name="shopName"
            type="text"
            autoComplete="organization"
            required
            aria-invalid={Boolean(errorFor('shopName'))}
          />
          {errorFor('shopName') && (
            <p className="text-xs text-destructive">{errorFor('shopName')}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="(11) 99999-9999"
            required
            aria-invalid={Boolean(errorFor('phone'))}
          />
          {errorFor('phone') && (
            <p className="text-xs text-destructive">{errorFor('phone')}</p>
          )}
        </div>

        <Button type="submit" size="lg" disabled={isPending} className="w-full">
          {isPending ? (
            <>
              <Loader2Icon className="animate-spin" /> Criando conta…
            </>
          ) : (
            'Criar conta'
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Já tem conta?{' '}
        <Link href="/login" className="font-medium text-foreground hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  )
}
