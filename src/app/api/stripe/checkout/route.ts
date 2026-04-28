import { NextResponse } from 'next/server'
import { stripe, PLANS, type PlanCurrency } from '@/lib/stripe'

export async function GET() {
  const key = process.env.STRIPE_SECRET_KEY ?? ''
  const keyPreview = key ? key.slice(0, 20) + '...' : 'MISSING'
  const priceId = PLANS.EUR.priceId

  // Step 1: raw fetch to Stripe to test network
  let fetchOk = false
  let fetchError = ''
  try {
    const res = await fetch(`https://api.stripe.com/v1/prices/${priceId}`, {
      headers: { Authorization: `Bearer ${key}` },
    })
    fetchOk = res.ok
    if (!res.ok) fetchError = await res.text()
  } catch (e) {
    fetchError = e instanceof Error ? e.message : 'fetch failed'
  }

  // Step 2: Stripe SDK
  let sdkOk = false
  let sdkError = ''
  try {
    const price = await stripe.prices.retrieve(priceId)
    sdkOk = !!price.id
  } catch (e) {
    sdkError = e instanceof Error ? e.message : 'sdk failed'
  }

  return NextResponse.json({ keyPreview, priceId, fetchOk, fetchError, sdkOk, sdkError })
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
