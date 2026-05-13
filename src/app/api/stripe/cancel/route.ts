import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: userRow } = await (admin.from('users') as any)
    .select('tenant_id')
    .eq('id', user.id)
    .maybeSingle() as { data: { tenant_id: string } | null }

  if (!userRow?.tenant_id) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: tenant } = await (admin.from('tenants') as any)
    .select('stripe_subscription_id')
    .eq('id', userRow.tenant_id)
    .maybeSingle() as { data: { stripe_subscription_id: string | null } | null }

  if (!tenant?.stripe_subscription_id) {
    return NextResponse.json({ error: 'No active subscription found' }, { status: 404 })
  }

  // Cancel at period end — user keeps access until billing cycle ends
  await stripe.subscriptions.update(tenant.stripe_subscription_id, {
    cancel_at_period_end: true,
  })

  return NextResponse.json({ ok: true })
}
