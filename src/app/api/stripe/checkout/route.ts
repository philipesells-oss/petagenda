import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { stripe, getPriceIdForCurrency, type SupportedCurrency } from '@/lib/stripe'

const STRIPE_LOCALE: Record<SupportedCurrency, 'pt-BR' | 'pt' | 'en'> = {
  BRL: 'pt-BR',
  EUR: 'pt',
  USD: 'en',
}

export async function POST(req: Request) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://getpetflow.com'

  let email: string | undefined
  let requestedCurrency: SupportedCurrency = 'BRL'
  try {
    const body = await req.json().catch(() => ({}))
    email = typeof body.email === 'string' ? body.email.trim() : undefined
    if (body.currency === 'EUR' || body.currency === 'USD' || body.currency === 'BRL') {
      requestedCurrency = body.currency as SupportedCurrency
    }
  } catch {
    // email and currency are optional
  }

  const cookieStore = await cookies()
  const pfRef = cookieStore.get('pf_ref')?.value

  const { priceId, currency } = getPriceIdForCurrency(requestedCurrency)

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    ...(email ? { customer_email: email } : {}),
    success_url: `${appUrl}/login?welcome=1`,
    cancel_url: `${appUrl}/`,
    locale: STRIPE_LOCALE[currency],
    billing_address_collection: 'auto',
    metadata: {
      source: 'landing_page',
      requested_currency: requestedCurrency,
      ...(pfRef ? { pf_ref: pfRef } : {}),
    },
  })

  return NextResponse.json({ url: session.url })
}
