import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = createAdminClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: userRow } = await (admin.from('users') as any)
      .select('tenant_id')
      .eq('id', user.id)
      .maybeSingle() as { data: { tenant_id: string } | null }

    if (!userRow?.tenant_id) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: tenant } = await (admin.from('tenants') as any)
      .select('stripe_customer_id')
      .eq('id', userRow.tenant_id)
      .maybeSingle() as { data: { stripe_customer_id: string | null } | null }

    if (!tenant?.stripe_customer_id) {
      return NextResponse.json({ error: 'no_customer' }, { status: 404 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://getpetflow.com'

    const session = await stripe.billingPortal.sessions.create({
      customer: tenant.stripe_customer_id,
      return_url: `${appUrl}/settings/billing`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[portal] error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
