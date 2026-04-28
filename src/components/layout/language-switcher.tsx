'use client'

import { useLanguage, type Locale } from '@/lib/i18n'

const LOCALES: { code: Locale; flag: string; label: string }[] = [
  { code: 'pt-BR', flag: '🇧🇷', label: 'PT' },
  { code: 'en-US', flag: '🇺🇸', label: 'EN' },
]

export function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage()

  const next = locale === 'pt-BR' ? 'en-US' : 'pt-BR'
  const current = LOCALES.find((l) => l.code === locale)!
  const nextLocale = LOCALES.find((l) => l.code === next)!

  return (
    <button
      onClick={() => setLocale(next)}
      title={`Switch to ${nextLocale.label}`}
      aria-label={`Switch language to ${nextLocale.label}`}
      className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      <span className="text-base leading-none">{current.flag}</span>
      <span>{current.label}</span>
    </button>
  )
}
