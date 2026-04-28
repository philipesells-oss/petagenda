import { NextResponse } from 'next/server'
import { stripe, PLANS, type PlanCurrency } from '@/lib/stripe'

export async function POST(req: Request) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://getpetflow.com'

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
}
