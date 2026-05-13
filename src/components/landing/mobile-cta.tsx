'use client'

import { CheckoutButton } from './checkout-button'
import type { SupportedCurrency } from '@/lib/stripe'

interface MobileCtaProps {
  priceDisplay: string
  pricePeriodShort?: string
  ctaLabel: string
  currency: SupportedCurrency
}

/**
 * Sticky bottom CTA bar — visible ONLY on mobile (<md).
 * Shows price + checkout button so the user always has the action at hand
 * while scrolling the landing page.
 */
export function MobileCta({
  priceDisplay,
  pricePeriodShort,
  ctaLabel,
  currency,
}: MobileCtaProps) {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 border-t border-emerald-100 bg-white p-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] dark:border-emerald-900/60 dark:bg-gray-950 md:hidden"
      role="region"
      aria-label="Assinar PetFlow"
    >
      <div className="mx-auto flex max-w-md items-center justify-between gap-3">
        <div className="flex flex-col leading-tight">
          <span className="text-base font-bold text-gray-900 dark:text-white">
            {priceDisplay}
          </span>
          {pricePeriodShort && (
            <span className="text-[11px] text-gray-500 dark:text-gray-400">
              {pricePeriodShort}
            </span>
          )}
        </div>
        <CheckoutButton
          label={ctaLabel}
          size="sm"
          className="bg-emerald-600 px-5 text-white hover:bg-emerald-700"
          currency={currency}
        />
      </div>
    </div>
  )
}
