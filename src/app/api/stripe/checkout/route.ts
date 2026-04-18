import { NextResponse } from 'next/server'
import { stripe, PLAN } from '@/lib/stripe'

export async function POST(req: Request) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  let email: string | undefined
  try {
    const body = await req.json().catch(() => ({}))
    email = typeof body.email === 'string' ? body.email.trim() : undefined
  } catch {
    // email is optional — Stripe will collect it in the checkout page
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: PLAN.priceId,
        quantity: 1,
      },
    ],
    ...(email ? { customer_email: email } : {}),
    success_url: `${appUrl}/login?welcome=1`,
    cancel_url: `${appUrl}/`,
    locale: 'pt-BR',
    billing_address_collection: 'auto',
    metadata: { source: 'landing_page' },
  })

  return NextResponse.json({ url: session.url })
}
