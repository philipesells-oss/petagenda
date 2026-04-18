import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

function randomPassword(len = 12): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#'
  return Array.from({ length: len }, () =>
    chars[Math.floor(Math.random() * chars.length)],
  ).join('')
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

  const tempPassword = randomPassword()
  const adminClient = createAdminClient()

  // Create Supabase auth user (triggers handle_new_user → tenant + user rows)
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: {
      full_name: session.customer_details?.name ?? email.split('@')[0],
      shop_name: 'Meu Pet Shop',
    },
  })

  if (authError || !authData.user) {
    console.error('[webhook] createUser error:', authError)
    return NextResponse.json({ error: 'User creation failed' }, { status: 500 })
  }

  const userId = authData.user.id

  // Mark user to force password change on first login
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

  // Send welcome email with temporary credentials
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.petflow.com.br'
  await resend.emails.send({
    from: 'PetFlow <noreply@petflow.com.br>',
    to: email,
    subject: 'Seu acesso ao PetFlow está pronto 🐾',
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
  <h2 style="color: #059669; margin-bottom: 4px;">Bem-vindo ao PetFlow! 🐾</h2>
  <p>Seu pagamento foi confirmado e sua conta está pronta para uso.</p>
  <p style="margin-top: 24px; font-weight: 600;">Suas credenciais de acesso:</p>
  <div style="background: #f3f4f6; border-radius: 8px; padding: 16px; margin: 12px 0;">
    <p style="margin: 4px 0;"><strong>E-mail:</strong> ${email}</p>
    <p style="margin: 4px 0;"><strong>Senha temporária:</strong> <code style="background:#e5e7eb;padding:2px 6px;border-radius:4px;">${tempPassword}</code></p>
  </div>
  <p style="color: #dc2626; font-size: 14px;">⚠️ Por segurança, você será solicitado a criar uma nova senha no primeiro acesso.</p>
  <a href="${appUrl}/login?welcome=1"
     style="display:inline-block;margin-top:20px;background:#059669;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;">
    Acessar o PetFlow
  </a>
  <hr style="margin: 32px 0; border-color: #e5e7eb;">
  <p style="font-size: 12px; color: #6b7280;">Se você não criou uma conta, ignore este e-mail.</p>
</body>
</html>`,
  })

  return NextResponse.json({ received: true })
}
