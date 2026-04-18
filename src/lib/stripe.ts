/**
 * Stripe server-side client.
 * SERVER ONLY — never import from Client Components.
 */
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia',
  typescript: true,
})

export const PLAN = {
  name: 'PetFlow — Plano Único',
  priceId: 'price_1TNeYfGtK644c9ETLEaiGSxA',
  amount: 2990,
  currency: 'brl',
  interval: 'month' as const,
}
