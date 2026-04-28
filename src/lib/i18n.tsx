'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { translations, type Locale, type Translations } from './translations'

export type { Locale, Translations } from './translations'

interface LanguageContextValue {
  locale: Locale
  t: Translations
  setLocale: (locale: Locale) => void
}

const LanguageContext = createContext<LanguageContextValue>({
  locale: 'pt-BR',
  t: translations['pt-BR'],
  setLocale: () => {},
})

const STORAGE_KEY = 'petflow_locale'
const VALID_LOCALES: Locale[] = ['pt-BR', 'pt-PT', 'en-US', 'es']

function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (VALID_LOCALES as string[]).includes(value)
}

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/[.$?*|{}()[\]\\/+^]/g, '\\$&') + '=([^;]*)'))
  return match ? decodeURIComponent(match[1]) : null
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('pt-BR')

  useEffect(() => {
    let initial: Locale | null = null
    try {
      const ls = localStorage.getItem(STORAGE_KEY)
      if (isLocale(ls)) initial = ls
    } catch {
      // ignore (SSR / privacy mode)
    }
    if (!initial) {
      const ck = readCookie(STORAGE_KEY)
      if (isLocale(ck)) initial = ck
    }
    if (initial) setLocaleState(initial)
  }, [])

  function setLocale(next: Locale) {
    setLocaleState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // ignore
    }
    if (typeof document !== 'undefined') {
      document.cookie = `${STORAGE_KEY}=${next}; path=/; max-age=31536000; SameSite=Lax`
    }
  }

  return (
    <LanguageContext.Provider value={{ locale, t: translations[locale], setLocale }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
