'use client'

import { useState } from 'react'
import { PlusIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FaqItem {
  q: string
  a: string
}

interface FaqAccordionProps {
  items: ReadonlyArray<FaqItem>
}

/**
 * Animated FAQ accordion.
 * One open at a time, smooth max-height + icon rotation animations.
 * No external accordion dependency — keeps the bundle small.
 */
export function FaqAccordion({ items }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="space-y-4">
      {items.map((item, i) => {
        const isOpen = openIndex === i
        const panelId = `faq-panel-${i}`
        const buttonId = `faq-button-${i}`
        return (
          <div
            key={item.q}
            className={cn(
              'overflow-hidden rounded-xl border bg-white transition-colors dark:bg-gray-800',
              isOpen
                ? 'border-emerald-300 dark:border-emerald-700'
                : 'border-gray-200 dark:border-gray-700',
            )}
          >
            <button
              id={buttonId}
              type="button"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 p-5 text-left font-medium text-gray-900 transition-colors hover:text-emerald-700 dark:text-gray-100 dark:hover:text-emerald-300"
            >
              <span>{item.q}</span>
              <PlusIcon
                className={cn(
                  'size-5 shrink-0 text-emerald-600 transition-transform duration-300 ease-out dark:text-emerald-400',
                  isOpen && 'rotate-45',
                )}
                aria-hidden="true"
              />
            </button>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className={cn(
                'grid transition-all duration-300 ease-out',
                isOpen
                  ? 'grid-rows-[1fr] opacity-100'
                  : 'grid-rows-[0fr] opacity-0',
              )}
            >
              <div className="overflow-hidden">
                <p className="px-5 pb-5 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                  {item.a}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
