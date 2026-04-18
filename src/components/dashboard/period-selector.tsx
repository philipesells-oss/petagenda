'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useTransition } from 'react'
import { cn } from '@/lib/utils'

interface PeriodOption {
  value: string
  label: string
}

interface PeriodSelectorProps {
  paramName: string
  options: PeriodOption[]
  defaultValue: string
  'aria-label'?: string
}

export function PeriodSelector({
  paramName,
  options,
  defaultValue,
  'aria-label': ariaLabel,
}: PeriodSelectorProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [pending, startTransition] = useTransition()

  const current = searchParams.get(paramName) ?? defaultValue

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === defaultValue) {
      params.delete(paramName)
    } else {
      params.set(paramName, value)
    }
    const qs = params.toString()
    startTransition(() => {
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    })
  }

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        'inline-flex items-center gap-1 rounded-lg border bg-card p-0.5 text-xs',
        pending && 'opacity-70',
      )}
    >
      {options.map((opt) => {
        const active = current === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => handleChange(opt.value)}
            className={cn(
              'rounded-md px-2.5 py-1 font-medium transition-colors',
              active
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
