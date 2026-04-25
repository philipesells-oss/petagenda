'use client'

import { Suspense, useEffect, useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { EyeIcon, EyeOffIcon, Loader2Icon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signIn } from '@/actions/auth'
import { MailCheckIcon } from 'lucide-react'

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[280px] items-center justify-center"><Loader2Icon className="size-5 animate-spin text-muted-foreground" /></div>}>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (params.get('welcome') === '1') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fbq = (window as any).fbq
      if (typeof fbq === 'function') {
        fbq('track', 'Purchase', { value: 29.90, currency: 'BRL' })
      }
    }
  }, [params])

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const nextParam = params.get('next')
    if (nextParam) form.set('next', nextParam)

    startTransition(async () => {
      setFieldErrors({})
      const result = await signIn(form)
      if (!result.ok) {
        setFieldErrors(result.fieldErrors ?? {})
        toast.error(result.error)
        return
      }
      toast.success('Bem-vindo de volta!')
      router.push(result.data.next)
      router.refresh()
    })
  }

  const isWelcome = params.get('welcome') === '1'
  const isInvalidLink = params.get('error') === 'link_invalido'

  return (
    <div className="space-y-6">
      {isWelcome && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950/40">
          <MailCheckIcon className="mt-0.5 size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <div>
            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Pagamento confirmado! 🎉</p>
            <p className="mt-0.5 text-xs text-emerald-700 dark:text-emerald-400">
              Em instantes você receberá um e-mail com o link para criar sua senha e acessar o PetFlow.
              Verifique também a caixa de spam.
            </p>
          </div>
        </div>
      )}
      {isInvalidLink && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/40">
          <p className="text-sm font-semibold text-red-700 dark:text-red-400">Link expirado ou inválido</p>
          <p className="mt-0.5 text-xs text-red-600 dark:text-red-500">
            Use a opção &quot;Esqueci minha senha&quot; abaixo para receber um novo link de acesso.
          </p>
        </div>
      )}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Entrar</h1>
        <p className="text-sm text-muted-foreground">Acesse sua conta PetFlow</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            aria-invalid={Boolean(fieldErrors.email)}
          />
          {fieldErrors.email && <p className="text-xs text-destructive">{fieldErrors.email[0]}</p>}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Senha</Label>
            <Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-foreground">
              Esqueci minha senha
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              className="pr-10"
              aria-invalid={Boolean(fieldErrors.password)}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {showPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
            </button>
          </div>
          {fieldErrors.password && <p className="text-xs text-destructive">{fieldErrors.password[0]}</p>}
        </div>

        <Button type="submit" size="lg" disabled={isPending} className="w-full">
          {isPending ? <><Loader2Icon className="animate-spin" /> Entrando…</> : 'Entrar'}
        </Button>
      </form>

      <p className="text-sm text-muted-foreground">
        Não tem conta?{' '}
        <Link href="/signup" className="font-medium text-foreground hover:underline">
          Criar conta
        </Link>
      </p>
    </div>
  )
}
