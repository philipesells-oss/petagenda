import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { Resend } from 'resend'
import { sendCAPIEvent } from '@/lib/meta/capi'
import { generateReferralCode, getReferralUrl } from '@/lib/referral'

const getResend = () => new Resend(process.env.RESEND_API_KEY)

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
    amount_total?: number | null
    currency?: string | null
    metadata?: Record<string, string> | null
  }

  const email = session.customer_details?.email
  if (!email) {
    return NextResponse.json({ error: 'No email in session' }, { status: 400 })
  }

  const adminClient = createAdminClient()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://getpetflow.com'
  const referredByCode = session.metadata?.pf_ref ?? null

  // ── Try to create a new auth user ─────────────────────────────────────────
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

  const isNewUser = !authError && !!authData?.user

  // ── Resolve userId (new signup OR returning multi-unit owner) ─────────────
  let userId: string | null = null
  let tenantId: string | null = null

  if (isNewUser) {
    userId = authData!.user.id

    // Mark profile for forced password change on first login
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (adminClient.from('users') as any)
      .update({ force_password_change: true })
      .eq('id', userId)

    // handle_new_user trigger already created tenant + user rows — just find them
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: userRow } = await (adminClient.from('users') as any)
      .select('tenant_id')
      .eq('id', userId)
      .maybeSingle() as { data: { tenant_id: string } | null }

    tenantId = userRow?.tenant_id ?? null

    if (tenantId) {
      const referralCode = generateReferralCode(userId)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (adminClient.from('tenants') as any)
        .update({
          stripe_customer_id: (session.customer as string) ?? null,
          stripe_subscription_id: (session.subscription as string) ?? null,
          plan: 'starter',
          plan_status: 'active',
          referral_code: referralCode,
          ...(referredByCode ? { referred_by_code: referredByCode } : {}),
        })
        .eq('id', tenantId)
    }
  } else {
    // ── Existing user: create a second tenant for their new unit ─────────────
    // Find the auth user id via the tenants + users tables (email on tenant row)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existingTenant } = await (adminClient.from('tenants') as any)
      .select('id')
      .eq('email', email)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle() as { data: { id: string } | null }

    if (existingTenant) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: ownerRow } = await (adminClient.from('users') as any)
        .select('id')
        .eq('tenant_id', existingTenant.id)
        .eq('role', 'owner')
        .maybeSingle() as { data: { id: string } | null }

      userId = ownerRow?.id ?? null
    }

    if (!userId) {
      console.error('[webhook] existing user but could not resolve userId for email:', email)
      return NextResponse.json({ error: 'User lookup failed' }, { status: 500 })
    }

    // Build a unique slug for the new unit
    const suffix = userId.replace(/-/g, '').slice(0, 8).toLowerCase()
    const slugSuffix = Date.now().toString(36)
    const slug = `meu-pet-shop-${suffix}-${slugSuffix}`
    const referralCode = generateReferralCode(userId + slugSuffix)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: newTenant, error: tenantError } = await (adminClient.from('tenants') as any)
      .insert({
        name: 'Meu Pet Shop',
        email,
        slug,
        stripe_customer_id: (session.customer as string) ?? null,
        stripe_subscription_id: (session.subscription as string) ?? null,
        plan: 'starter',
        plan_status: 'active',
        referral_code: referralCode,
        ...(referredByCode ? { referred_by_code: referredByCode } : {}),
      })
      .select('id')
      .single() as { data: { id: string } | null; error: unknown }

    if (tenantError || !newTenant) {
      console.error('[webhook] failed to create second tenant:', tenantError)
      return NextResponse.json({ error: 'Tenant creation failed' }, { status: 500 })
    }

    tenantId = newTenant.id

    // Record the extra membership so future features can list all user tenants
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (adminClient.from('tenant_memberships') as any)
      .insert({ auth_user_id: userId, tenant_id: tenantId, role: 'owner' })
  }

  // ── Referral reward ───────────────────────────────────────────────────────
  if (referredByCode && /^[A-Z0-9]{6,12}$/.test(referredByCode)) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: referrerTenant } = await (adminClient.from('tenants') as any)
        .select('id, stripe_subscription_id')
        .eq('referral_code', referredByCode)
        .maybeSingle() as { data: { id: string; stripe_subscription_id: string | null } | null }

      if (referrerTenant?.stripe_subscription_id) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: referrerUserRow } = await (adminClient.from('users') as any)
          .select('id')
          .eq('tenant_id', referrerTenant.id)
          .maybeSingle() as { data: { id: string } | null }

        if (referrerUserRow) {
          const { data: referrerAuth } = await adminClient.auth.admin.getUserById(referrerUserRow.id)
          const referrerEmail = referrerAuth?.user?.email

          const coupon = await stripe.coupons.create({
            duration: 'once',
            percent_off: 100,
            name: 'Mês grátis — indicação PetFlow',
          })
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (stripe.subscriptions as any).update(referrerTenant.stripe_subscription_id, {
            coupon: coupon.id,
          })

          if (referrerEmail) {
            await getResend().emails.send({
              from: 'PetFlow <noreply@contato.getpetflow.com>',
              to: referrerEmail,
              subject: '🎉 Sua indicação deu certo — 1 mês grátis no PetFlow!',
              html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 0; color: #1a1a1a;">
  <div style="background: #f0fdf4; padding: 24px; text-align: center; border-bottom: 2px solid #d1fae5;">
    <span style="font-size: 28px; font-weight: 800; color: #059669; letter-spacing: -0.5px;">🐾 PetFlow</span>
  </div>
  <div style="padding: 32px 24px;">
    <h2 style="color: #059669; margin-top: 0;">🎉 Sua indicação funcionou!</h2>
    <p>Alguém que você indicou acabou de assinar o PetFlow. Como obrigado, seu próximo mês é <strong>100% grátis</strong> — sem fazer nada, o desconto já foi aplicado na sua próxima fatura.</p>
    <p style="margin-top: 20px; font-size: 13px; color: #6b7280;">Continue indicando e ganhe 1 mês grátis a cada nova assinatura confirmada.</p>
  </div>
  <div style="background: #f9fafb; padding: 16px; text-align: center; border-top: 1px solid #e5e7eb;">
    <p style="font-size: 12px; color: #9ca3af; margin: 0;">© ${new Date().getFullYear()} PetFlow · Todos os direitos reservados</p>
  </div>
</body>
</html>`,
            })
          }
        }
      }
    } catch (err) {
      console.error('[webhook] referral reward error:', err)
    }
  }

  // ── Meta Conversions API ──────────────────────────────────────────────────
  const purchaseValue = session.amount_total ? session.amount_total / 100 : 29.90
  const purchaseCurrency = (session.currency ?? 'brl').toUpperCase()
  await sendCAPIEvent({
    eventName: 'Purchase',
    email,
    value: purchaseValue,
    currency: purchaseCurrency,
    eventSourceUrl: `${appUrl}/login?welcome=1`,
  })

  // ── Generate magic link for access email ─────────────────────────────────
  const nextPath = isNewUser ? '/first-access' : '/dashboard'
  const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
    type: 'magiclink',
    email,
    options: { redirectTo: `${appUrl}/auth/callback?next=${nextPath}` },
  })

  if (linkError || !linkData?.properties?.action_link) {
    console.error('[webhook] generateLink error:', linkError)
  }

  const accessLink = linkData?.properties?.action_link ?? `${appUrl}/forgot-password`

  // ── Send welcome or new-unit email ────────────────────────────────────────
  if (isNewUser) {
    const referralCode = generateReferralCode(userId!)
    await getResend().emails.send({
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
    <div style="background:#f0fdf4; border-radius:12px; padding:20px; margin-bottom:24px;">
      <p style="margin:0 0 8px; font-weight:700; color:#059669;">🎁 Indique e ganhe 1 mês grátis</p>
      <p style="margin:0 0 12px; font-size:13px; color:#374151;">Compartilhe seu link exclusivo. A cada amigo que assinar, você ganha <strong>1 mês grátis</strong> automaticamente.</p>
      <p style="margin:0; background:#fff; border:1px solid #d1fae5; border-radius:8px; padding:10px 14px; font-family:monospace; font-size:13px; color:#059669; word-break:break-all;">${getReferralUrl(referralCode)}</p>
    </div>
    <p style="font-size: 12px; color: #6b7280; margin: 0;">Se você não criou uma conta, ignore este e-mail.</p>
  </div>
  <div style="background: #f9fafb; padding: 16px; text-align: center; border-top: 1px solid #e5e7eb;">
    <p style="font-size: 12px; color: #9ca3af; margin: 0;">© ${new Date().getFullYear()} PetFlow · Todos os direitos reservados</p>
  </div>
</body>
</html>`,
    })
  } else {
    // Existing user — their new unit is ready
    await getResend().emails.send({
      from: 'PetFlow <noreply@contato.getpetflow.com>',
      to: email,
      subject: 'Nova unidade adicionada ao seu PetFlow 🏪',
      html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 0; color: #1a1a1a;">
  <div style="background: #f0fdf4; padding: 24px; text-align: center; border-bottom: 2px solid #d1fae5;">
    <span style="font-size: 28px; font-weight: 800; color: #059669; letter-spacing: -0.5px;">🐾 PetFlow</span>
  </div>
  <div style="padding: 32px 24px;">
    <h2 style="color: #059669; margin-top: 0; margin-bottom: 8px;">Nova unidade criada com sucesso! 🏪</h2>
    <p style="margin-top: 0;">Recebemos sua assinatura e criamos uma nova unidade no PetFlow para você.</p>
    <p style="margin-top: 16px;">Clique no botão abaixo para acessar o sistema e começar a configurar sua nova unidade:</p>
    <a href="${accessLink}"
       style="display:inline-block;margin-top:8px;background:#059669;color:#fff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:600;font-size:16px;">
      Acessar o PetFlow
    </a>
    <p style="margin-top: 20px; font-size: 13px; color: #6b7280;">
      Este link é válido por 24 horas. Caso expire, acesse normalmente em
      <a href="${appUrl}/login" style="color:#059669;">getpetflow.com</a>.
    </p>
    <div style="background:#fff3cd; border:1px solid #ffc107; border-radius:8px; padding:16px; margin-top:24px;">
      <p style="margin:0; font-size:13px; color:#856404;">
        <strong>⚙️ Alternância entre unidades em breve</strong><br>
        Estamos desenvolvendo a troca de unidades dentro do painel. Por enquanto, entre em contato pelo suporte para configurar sua nova unidade.
      </p>
    </div>
  </div>
  <div style="background: #f9fafb; padding: 16px; text-align: center; border-top: 1px solid #e5e7eb;">
    <p style="font-size: 12px; color: #9ca3af; margin: 0;">© ${new Date().getFullYear()} PetFlow · Todos os direitos reservados</p>
  </div>
</body>
</html>`,
    })
  }

  return NextResponse.json({ received: true })
}
