/**
 * Stripe server-side client.
 * SERVER ONLY — never import from Client Components.
 */
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia',
  typescript: true,
})

export type PlanCurrency = 'BRL' | 'EUR' | 'USD'

export const PLANS: Record<PlanCurrency, {
  priceId: string
  amount: number
  currency: string
  label: string
  symbol: string
  stripeLocale: Stripe.Checkout.SessionCreateParams['locale']
}> = {
  BRL: {
    priceId: (process.env.STRIPE_PRICE_BRL ?? 'price_1TNeYfGtK644c9ETLEaiGSxA').trim(),
    amount: 2990,
    currency: 'brl',
    label: 'R$29,90',
    symbol: 'R$',
    stripeLocale: 'pt-BR',
  },
  EUR: {
    priceId: (process.env.STRIPE_PRICE_EUR ?? 'price_1TRAR8GtK644c9ETXZGJFYnV').trim(),
    amount: 1990,
    currency: 'eur',
    label: '€19,90',
    symbol: '€',
    stripeLocale: 'pt',
  },
  USD: {
    priceId: (process.env.STRIPE_PRICE_USD ?? 'price_1TRARCGtK644c9ETiqsdneBT').trim(),
    amount: 1990,
    currency: 'usd',
    label: '$19.90',
    symbol: '$',
    stripeLocale: 'en',
  },
}

// backward-compat alias
export const PLAN = PLANS.BRL
