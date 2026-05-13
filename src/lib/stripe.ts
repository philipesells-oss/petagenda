/**
 * Stripe server-side client.
 * SERVER ONLY — never import from Client Components.
 */
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia',
  typescript: true,
  httpClient: Stripe.createFetchHttpClient(),
})

export type SupportedCurrency = 'BRL' | 'EUR' | 'USD'
/** @deprecated use SupportedCurrency */
export type PlanCurrency = SupportedCurrency

export type BillingInterval = 'month' | 'year'

const BRL_PRICE_ID = process.env.STRIPE_PRICE_BRL ?? 'price_1TNeYfGtK644c9ETLEaiGSxA'
const BRL_PRICE_ANNUAL_ID = process.env.STRIPE_PRICE_BRL_ANNUAL ?? 'price_1TWYXVGtK644c9ETaOpZiICG'

export function getPriceIdForCurrency(
  currency: SupportedCurrency,
  interval: BillingInterval = 'month',
): { priceId: string; currency: SupportedCurrency } {
  if (interval === 'year') {
    if (currency === 'EUR') {
      const id = (process.env.STRIPE_PRICE_EUR_ANNUAL ?? '').trim()
      if (id) return { priceId: id, currency: 'EUR' }
    }
    if (currency === 'USD') {
      const id = (process.env.STRIPE_PRICE_USD_ANNUAL ?? '').trim()
      if (id) return { priceId: id, currency: 'USD' }
    }
    return { priceId: BRL_PRICE_ANNUAL_ID, currency: 'BRL' }
  }

  if (currency === 'EUR') {
    const id = (process.env.STRIPE_PRICE_EUR ?? '').trim()
    if (id) return { priceId: id, currency: 'EUR' }
  }
  if (currency === 'USD') {
    const id = (process.env.STRIPE_PRICE_USD ?? '').trim()
    if (id) return { priceId: id, currency: 'USD' }
  }
  return { priceId: BRL_PRICE_ID, currency: 'BRL' }
}

export const PLAN = {
  name: 'PetFlow — Plano Único',
  priceId: BRL_PRICE_ID,
  amount: 2990,
  currency: 'brl',
  interval: 'month' as const,
}
