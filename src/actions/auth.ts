'use server'

/**
 * Auth Server Actions — Story 1.3
 *
 * Handles signup (which triggers DB `handle_new_user()` to create tenant +
 * user row), login, logout, and password reset email dispatch.
 *
 * All actions return a discriminated `ActionResult<T>` so forms can render
 * field errors + a top-level message without throwing.
 */

import { z } from 'zod'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/types'

// ---------------------------------------------------------------------------
// Validation schemas
// ---------------------------------------------------------------------------

const signUpSchema = z.object({
  fullName: z.string().trim().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().trim().toLowerCase().email('E-mail inválido'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
  shopName: z.string().trim().min(2, 'Nome do pet shop é obrigatório'),
  phone: z.string().trim().min(8, 'Telefone inválido'),
})

const signInSchema = z.object({
  email: z.string().trim().toLowerCase().email('E-mail inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
})

const resetSchema = z.object({
  email: z.string().trim().toLowerCase().email('E-mail inválido'),
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatZodError<T>(err: z.ZodError<T>): ActionResult<never> {
  const fieldErrors: Record<string, string[]> = {}
  for (const issue of err.issues) {
    const key = issue.path.join('.') || '_'
    fieldErrors[key] = [...(fieldErrors[key] ?? []), issue.message]
  }
  return {
    ok: false,
    error: 'Confira os campos destacados.',
    fieldErrors,
  }
}

async function getOrigin(): Promise<string> {
  const h = await headers()
  // Prefer explicit forwarded host for deployed environments, fallback to
  // host header for local dev. Scheme follows x-forwarded-proto.
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000'
  const proto = h.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https')
  return `${proto}://${host}`
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export async function signUp(formData: FormData): Promise<ActionResult<{ email: string }>> {
  const parsed = signUpSchema.safeParse({
    fullName: formData.get('fullName'),
    email: formData.get('email'),
    password: formData.get('password'),
    shopName: formData.get('shopName'),
    phone: formData.get('phone'),
  })

  if (!parsed.success) return formatZodError(parsed.error)

  const { email, password, fullName, shopName, phone } = parsed.data

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        shop_name: shopName,
        phone,
      },
    },
  })

  if (error) {
    return { ok: false, error: error.message }
  }
  if (!data.user) {
    return { ok: false, error: 'Não foi possível criar a conta.' }
  }

  return { ok: true, data: { email } }
}

export async function signIn(formData: FormData): Promise<ActionResult<{ next: string }>> {
  const parsed = signInSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) return formatZodError(parsed.error)

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)

  if (error) {
    return { ok: false, error: 'E-mail ou senha incorretos.' }
  }

  const nextRaw = formData.get('next')
  // Only accept safe relative paths (prevents open redirect).
  const next =
    typeof nextRaw === 'string' && nextRaw.startsWith('/') && !nextRaw.startsWith('//')
      ? nextRaw
      : '/'

  return { ok: true, data: { next } }
}

export async function signOut(): Promise<never> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function resetPassword(formData: FormData): Promise<ActionResult<{ email: string }>> {
  const parsed = resetSchema.safeParse({ email: formData.get('email') })
  if (!parsed.success) return formatZodError(parsed.error)

  const supabase = await createClient()
  const origin = await getOrigin()
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${origin}/login`,
  })

  if (error) {
    // Intentionally swallow detailed errors to avoid user enumeration.
    return { ok: true, data: { email: parsed.data.email } }
  }

  return { ok: true, data: { email: parsed.data.email } }
}
