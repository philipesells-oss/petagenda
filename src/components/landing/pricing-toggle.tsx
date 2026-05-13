'use client'

import { useState } from 'react'
import { CheckIcon } from 'lucide-react'
import { CheckoutButton } from './checkout-button'
import type { SupportedCurrency } from '@/lib/stripe'

interface PricingToggleProps {
  currency: SupportedCurrency
  monthlyDisplay: string
  annualDisplay: string
  monthlyPeriod: string
  annualPeriod: string
  annualMonthly: string
  ctaMonthly: string
  ctaAnnual: string
  features: readonly string[]
  labelMonthly: string
  labelAnnual: string
  badgeAnnual: string
}

export function PricingToggle({
  currency,
  monthlyDisplay,
  annualDisplay,
  monthlyPeriod,
  annualPeriod,
  annualMonthly,
  ctaMonthly,
  ctaAnnual,
  features,
  labelMonthly,
  labelAnnual,
  badgeAnnual,
}: PricingToggleProps) {
  const [interval, setInterval] = useState<'month' | 'year'>('month')
  const isAnnual = interval === 'year'

  return (
    <div>
      {/* Toggle */}
      <div className="flex justify-center mb-6">
        <div className="flex rounded-full border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 p-1 gap-1">
          <button
            onClick={() => setInterval('month')}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
              !isAnnual
                ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {labelMonthly}
          </button>
          <button
            onClick={() => setInterval('year')}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
              isAnnual
                ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {labelAnnual}
            <span className="bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold px-2 py-0.5 rounded-full">
              {badgeAnnual}
            </span>
          </button>
        </div>
      </div>

      {/* Card */}
      <div className="rounded-3xl border-2 border-emerald-500 p-8 shadow-xl shadow-emerald-100 dark:shadow-emerald-900/20">
        <div className="mb-6 text-center">
          <p className="text-5xl font-bold text-gray-900 dark:text-white">
            {isAnnual ? annualDisplay : monthlyDisplay}
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {isAnnual ? annualPeriod : monthlyPeriod}
          </p>
          {isAnnual && (
            <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              {annualMonthly}
            </p>
          )}
        </div>
        <ul className="mb-8 space-y-3">
          {features.map((b) => (
            <li key={b} className="flex items-start gap-3 text-sm">
              <CheckIcon className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              {b}
            </li>
          ))}
        </ul>
        <CheckoutButton
          label={isAnnual ? ctaAnnual : ctaMonthly}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
          currency={currency}
          interval={interval}
        />
      </div>
    </div>
  )
}
