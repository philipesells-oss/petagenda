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
import { Resend } from 'resend'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import type { ActionResult } from '@/types'

// Standard message shown to users when they hit any auth rate limit.
const RATE_LIMITED_MSG =
  'Muitas tentativas. Aguarde alguns minutos e tente novamente.'

const resend = new Resend(process.env.RESEND_API_KEY)

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

function getOrigin(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export async function signUp(formData: FormData): Promise<ActionResult<{ email: string }>> {
  // Rate limit: 5 signups per 10 min per IP — blocks account-creation abuse.
  const ip = await getClientIp()
  const rl = await checkRateLimit({
    namespace: 'auth:signUp',
    identifier: ip,
    limit: 5,
    windowSeconds: 10 * 60,
  })
  if (!rl.success) {
    return { ok: false, error: RATE_LIMITED_MSG }
  }

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

  // Rate limit: 10 attempts per 10 min per email — blocks credential stuffing.
  // We key on email (not IP) so a corp NAT does not lock everyone out; the
  // same email targeted from multiple IPs still hits the same bucket.
  const rl = await checkRateLimit({
    namespace: 'auth:signIn',
    identifier: parsed.data.email,
    limit: 10,
    windowSeconds: 10 * 60,
  })
  if (!rl.success) {
    return { ok: false, error: RATE_LIMITED_MSG }
  }

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
      : '/dashboard'

  return { ok: true, data: { next } }
}

export async function signOut(): Promise<never> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function updatePassword(formData: FormData): Promise<ActionResult<null>> {
  const password = formData.get('password')
  const confirm = formData.get('confirm')

  if (typeof password !== 'string' || password.length < 8) {
    return { ok: false, error: 'Senha deve ter pelo menos 8 caracteres.' }
  }
  if (password !== confirm) {
    return { ok: false, error: 'As senhas não coincidem.' }
  }

  const supabase = await createClient()

  // Update password and clear the force_password_change flag in user_metadata
  // in a single call so the JWT reflects the change immediately.
  const { error: pwError } = await supabase.auth.updateUser({
    password,
    data: { force_password_change: false },
  })
  if (pwError) return { ok: false, error: pwError.message }

  // Mirror the flag in the DB users table for consistency
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const admin = createAdminClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin.from('users') as any).update({ force_password_change: false }).eq('id', user.id)
  }

  return { ok: true, data: null }
}

export async function resetPassword(formData: FormData): Promise<ActionResult<{ email: string }>> {
  const parsed = resetSchema.safeParse({ email: formData.get('email') })
  if (!parsed.success) return formatZodError(parsed.error)

  const { email } = parsed.data

  // Rate limit: 3 reset emails per hour per email — protects against
  // email-bombing and reduces Resend cost from automated abuse.
  const rl = await checkRateLimit({
    namespace: 'auth:resetPassword',
    identifier: email,
    limit: 3,
    windowSeconds: 60 * 60,
  })
  if (!rl.success) {
    return { ok: false, error: RATE_LIMITED_MSG }
  }

  const origin = await getOrigin()
  const admin = createAdminClient()

  // Generate recovery link server-side so we control the email content (Portuguese)
  const { data: linkData } = await admin.auth.admin.generateLink({
    type: 'recovery',
    email,
    options: { redirectTo: `${origin}/auth/callback?next=/first-access` },
  })

  // Always return ok to avoid user enumeration — send email only if user exists
  if (linkData?.properties?.action_link) {
    const resetLink = linkData.properties.action_link
    await resend.emails.send({
      from: 'PetFlow <noreply@contato.getpetflow.com>',
      to: email,
      subject: 'Redefinir senha — PetFlow 🐾',
      html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
  <div style="text-align:center; margin-bottom: 24px;">
    <span style="font-size: 28px; font-weight: 800; color: #059669; letter-spacing: -0.5px;">🐾 PetFlow</span>
  </div>
  <h2 style="color: #111827; margin-bottom: 4px;">Redefinir sua senha</h2>
  <p>Recebemos uma solicitação para redefinir a senha da sua conta PetFlow.</p>
  <p style="margin-top: 16px;">Clique no botão abaixo para criar uma nova senha:</p>
  <a href="${resetLink}"
     style="display:inline-block;margin-top:16px;background:#059669;color:#fff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:600;font-size:16px;">
    Criar nova senha
  </a>
  <p style="margin-top: 20px; font-size: 13px; color: #6b7280;">
    Este link é válido por 24 horas. Se você não solicitou a redefinição, pode ignorar este e-mail com segurança.
  </p>
  <hr style="margin: 32px 0; border-color: #e5e7eb;">
  <p style="font-size: 12px; color: #6b7280; text-align: center;">© ${new Date().getFullYear()} PetFlow · Todos os direitos reservados</p>
</body>
</html>`,
    })
  }

  return { ok: true, data: { email } }
}
