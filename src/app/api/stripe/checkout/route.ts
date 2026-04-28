import { NextResponse } from 'next/server'
import { stripe, PLANS, type PlanCurrency } from '@/lib/stripe'

export async function GET() {
  try {
    const keyPreview = (process.env.STRIPE_SECRET_KEY ?? '').slice(0, 20) + '...'
    const price = await stripe.prices.retrieve(PLANS.EUR.priceId)
    return NextResponse.json({ ok: true, key: keyPreview, eur_price: price.id, currency: price.currency })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const appUrl = 'https://getpetflow.com'

    const body = await req.json().catch(() => ({}))
    const email: string | undefined = typeof body.email === 'string' ? body.email.trim() : undefined
    const currency: PlanCurrency = (body.currency as PlanCurrency) ?? 'BRL'
    const plan = PLANS[currency] ?? PLANS.BRL

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: plan.priceId, quantity: 1 }],
      ...(email ? { customer_email: email } : {}),
      success_url: `${appUrl}/login?welcome=1`,
      cancel_url: `${appUrl}/`,
      locale: plan.stripeLocale,
      billing_address_collection: 'auto',
      metadata: { source: 'landing_page', currency },
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Stripe error'
    console.error('[checkout]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
