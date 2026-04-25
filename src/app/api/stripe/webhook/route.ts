import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { Resend } from 'resend'
import { sendCAPIEvent } from '@/lib/meta/capi'

const resend = new Resend(process.env.RESEND_API_KEY)

function secureRandomPassword(len = 20): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%&*'
  const arr = new Uint8Array(len)
  crypto.getRandomValues(arr)
  return Array.from(arr, (b) => chars[b % chars.length]).join('')
}

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

  let event: ReturnType<typeof stripe.webhooks.constructEvent> extends Promise<infer T> ? T : ReturnType<typeof stripe.webhooks.constructEvent>

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true })
  }

  const session = event.data.object as {
    customer_details?: { email?: string; name?: string } | null
    customer?: string | null
    subscription?: string | null
  }

  const email = session.customer_details?.email
  if (!email) {
    return NextResponse.json({ error: 'No email in session' }, { status: 400 })
  }

  const adminClient = createAdminClient()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://getpetflow.com'

  // Create Supabase auth user (triggers handle_new_user → tenant + user rows).
  // Internal password is never revealed — access is via magic link only.
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password: secureRandomPassword(),
    email_confirm: true,
    user_metadata: {
      full_name: session.customer_details?.name ?? email.split('@')[0],
      shop_name: 'Meu Pet Shop',
      force_password_change: true,
    },
  })

  if (authError || !authData.user) {
    console.error('[webhook] createUser error:', authError)
    return NextResponse.json({ error: 'User creation failed' }, { status: 500 })
  }

  const userId = authData.user.id

  // Mark user in DB to force password change on first login
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (adminClient.from('users') as any)
    .update({ force_password_change: true })
    .eq('id', userId)

  // Store Stripe IDs on tenant for future billing management
  if (session.customer || session.subscription) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: userRow } = await (adminClient.from('users') as any)
      .select('tenant_id')
      .eq('id', userId)
      .maybeSingle() as { data: { tenant_id: string } | null }

    if (userRow?.tenant_id) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (adminClient.from('tenants') as any)
        .update({
          stripe_customer_id: (session.customer as string) ?? null,
          stripe_subscription_id: (session.subscription as string) ?? null,
          plan: 'starter',
          plan_status: 'active',
        })
        .eq('id', userRow.tenant_id)
    }
  }

  // Fire server-side Purchase event to Meta Conversions API
  await sendCAPIEvent({
    eventName: 'Purchase',
    email,
    value: 29.90,
    currency: 'BRL',
    eventSourceUrl: `${appUrl}/login?welcome=1`,
  })

  // Generate a magic link so the user never receives a plain-text password.
  const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
    type: 'magiclink',
    email,
    options: { redirectTo: `${appUrl}/auth/callback?next=/first-access` },
  })

  if (linkError || !linkData?.properties?.action_link) {
    console.error('[webhook] generateLink error:', linkError)
    // Fall back gracefully — user can use "forgot password" to gain access.
  }

  const accessLink = linkData?.properties?.action_link ?? `${appUrl}/forgot-password`

  await resend.emails.send({
    from: 'PetFlow <noreply@contato.getpetflow.com>',
    to: email,
    subject: 'Seu acesso ao PetFlow está pronto 🐾',
    html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 0; color: #1a1a1a;">
  <div style="background: #f0fdf4; padding: 24px; text-align: center; border-bottom: 2px solid #d1fae5;">
    <span style="font-size: 28px; font-weight: 800; color: #059669; letter-spacing: -0.5px;">🐾 PetFlow</span>
  </div>
  <div style="padding: 32px 24px;">
    <h2 style="color: #059669; margin-top: 0; margin-bottom: 8px;">Bem-vindo ao PetFlow! 🐾</h2>
    <p style="margin-top: 0;">Seu pagamento foi confirmado e sua conta está pronta para uso.</p>
    <p style="margin-top: 24px;">Clique no botão abaixo para criar sua senha e acessar o sistema:</p>
    <a href="${accessLink}"
       style="display:inline-block;margin-top:8px;background:#059669;color:#fff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:600;font-size:16px;">
      Criar senha e acessar o PetFlow
    </a>
    <p style="margin-top: 20px; font-size: 13px; color: #6b7280;">
      Este link é válido por 24 horas. Caso expire, use a opção
      <a href="${appUrl}/forgot-password" style="color:#059669;">Esqueci minha senha</a>.
    </p>
    <hr style="margin: 32px 0; border-color: #e5e7eb;">
    <p style="font-size: 12px; color: #6b7280; margin: 0;">Se você não criou uma conta, ignore este e-mail.</p>
  </div>
  <div style="background: #f9fafb; padding: 16px; text-align: center; border-top: 1px solid #e5e7eb;">
    <p style="font-size: 12px; color: #9ca3af; margin: 0;">© ${new Date().getFullYear()} PetFlow · Todos os direitos reservados</p>
  </div>
</body>
</html>`,
  })

  return NextResponse.json({ received: true })
}
