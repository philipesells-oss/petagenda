'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronDownIcon } from 'lucide-react'
import { useLanguage } from '@/lib/i18n'
import type { Locale } from '@/lib/translations'

const LOCALES: { code: Locale; flag: string; label: string }[] = [
  { code: 'pt-BR', flag: '🇧🇷', label: 'PT-BR' },
  { code: 'pt-PT', flag: '🇵🇹', label: 'PT-PT' },
  { code: 'en-US', flag: '🇺🇸', label: 'EN' },
  { code: 'es', flag: '🇪🇸', label: 'ES' },
]

export function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const current = LOCALES.find((l) => l.code === locale) ?? LOCALES[0]

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [open])

  function handleSelect(code: Locale) {
    setLocale(code)
    setOpen(false)
    // Reload so server components re-render with the new locale cookie
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        title="Language"
        className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <span className="text-base leading-none">{current.flag}</span>
        <span>{current.label}</span>
        <ChevronDownIcon className="size-3" />
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute right-0 z-50 mt-1 min-w-[140px] overflow-hidden rounded-md border border-border bg-popover shadow-md"
        >
          {LOCALES.map((l) => (
            <li key={l.code}>
              <button
                type="button"
                role="option"
                aria-selected={l.code === locale}
                onClick={() => handleSelect(l.code)}
                className={
                  'flex w-full items-center gap-2 px-3 py-2 text-xs text-left transition-colors hover:bg-muted ' +
                  (l.code === locale ? 'bg-muted font-semibold text-foreground' : 'text-muted-foreground')
                }
              >
                <span className="text-base leading-none">{l.flag}</span>
                <span>{l.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
