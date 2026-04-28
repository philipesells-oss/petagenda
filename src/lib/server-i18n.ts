import { cookies } from 'next/headers'
import { translations, type Locale, type Translations } from './translations'

const VALID_LOCALES: Locale[] = ['pt-BR', 'pt-PT', 'en-US', 'es']

export async function getServerLocale(): Promise<Locale> {
  const cookieStore = await cookies()
  const saved = cookieStore.get('petflow_locale')?.value
  if (saved && (VALID_LOCALES as string[]).includes(saved)) {
    return saved as Locale
  }
  return 'pt-BR'
}

export async function getT(): Promise<Translations> {
  const locale = await getServerLocale()
  return translations[locale]
}
