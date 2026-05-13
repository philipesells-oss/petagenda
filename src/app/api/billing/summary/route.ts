import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getReferralUrl } from '@/lib/referral'
import { stripe } from '@/lib/stripe'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: userRow } = await (admin.from('users') as any)
    .select('tenant_id')
    .eq('id', user.id)
    .maybeSingle() as { data: { tenant_id: string } | null }

  if (!userRow?.tenant_id) return NextResponse.json({ referralCode: null, referralUrl: null })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: tenant } = await (admin.from('tenants') as any)
    .select('referral_code, stripe_customer_id')
    .eq('id', userRow.tenant_id)
    .maybeSingle() as { data: { referral_code: string | null; stripe_customer_id: string | null } | null }

  const referralCode = tenant?.referral_code ?? null
  const stripeCustomerId = tenant?.stripe_customer_id ?? null

  let subscriptionStatus: string | null = null
  if (stripeCustomerId) {
    try {
      const subs = await stripe.subscriptions.list({ customer: stripeCustomerId, limit: 1 })
      subscriptionStatus = subs.data[0]?.status ?? null
    } catch {
      subscriptionStatus = null
    }
  }

  return NextResponse.json({
    referralCode,
    referralUrl: referralCode ? getReferralUrl(referralCode) : null,
    hasStripeCustomer: !!stripeCustomerId,
    subscriptionStatus,
  })
}
