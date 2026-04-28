/**
 * Stripe server-side client.
 * SERVER ONLY — never import from Client Components.
 */
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia',
  typescript: true,
})

export type SupportedCurrency = 'BRL' | 'EUR' | 'USD'

const BRL_PRICE_ID = 'price_1TNeYfGtK644c9ETLEaiGSxA'

/**
 * Resolves the Stripe Price ID for the requested currency.
 * Falls back to BRL when EUR/USD env vars are not configured yet.
 *
 * TODO: adicionar STRIPE_PRICE_EUR e STRIPE_PRICE_USD no Vercel + Stripe Dashboard
 */
export function getPriceIdForCurrency(currency: SupportedCurrency): {
  priceId: string
  currency: SupportedCurrency
  fallback: boolean
} {
  if (currency === 'EUR') {
    const eurId = process.env.STRIPE_PRICE_EUR
    if (eurId) return { priceId: eurId, currency: 'EUR', fallback: false }
    console.warn(
      '[stripe] STRIPE_PRICE_EUR not configured — falling back to BRL price. ' +
        'Configure a EUR price in Stripe Dashboard and set STRIPE_PRICE_EUR on Vercel.',
    )
    return { priceId: BRL_PRICE_ID, currency: 'BRL', fallback: true }
  }

  if (currency === 'USD') {
    const usdId = process.env.STRIPE_PRICE_USD
    if (usdId) return { priceId: usdId, currency: 'USD', fallback: false }
    console.warn(
      '[stripe] STRIPE_PRICE_USD not configured — falling back to BRL price. ' +
        'Configure a USD price in Stripe Dashboard and set STRIPE_PRICE_USD on Vercel.',
    )
    return { priceId: BRL_PRICE_ID, currency: 'BRL', fallback: true }
  }

  return { priceId: BRL_PRICE_ID, currency: 'BRL', fallback: false }
}

export const PLAN = {
  name: 'PetFlow — Plano Único',
  priceId: BRL_PRICE_ID,
  amount: 2990,
  currency: 'brl',
  interval: 'month' as const,
}
