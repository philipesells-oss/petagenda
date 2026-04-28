'use client'

import * as React from 'react'

export type Locale = 'pt-BR' | 'pt-PT' | 'en' | 'es'

export const LOCALES: { code: Locale; flag: string; label: string }[] = [
  { code: 'pt-BR', flag: '🇧🇷', label: 'Português (BR)' },
  { code: 'pt-PT', flag: '🇵🇹', label: 'Português (PT)' },
  { code: 'en', flag: '🇺🇸', label: 'English' },
  { code: 'es', flag: '🇪🇸', label: 'Español' },
]

type Dict = Record<string, string>
type Translations = Record<Locale, Dict>

// Translations dictionary. Keys are namespaced (e.g. "topbar.account").
// Templates support placeholders like {name}, {pet}, {date}.
const TRANSLATIONS: Translations = {
  'pt-BR': {
    'topbar.account': 'Minha conta',
    'topbar.signOut': 'Sair',
    'topbar.language': 'Idioma',
    'messages.intro': 'Envie uma mensagem rápida para {name} pelo WhatsApp.',
    'messages.t1.label': 'Lembrete de agendamento',
    'messages.t1.msg': 'Olá {name}! 👋 Passando para lembrar do agendamento do seu pet aqui no nosso pet shop. Qualquer dúvida, é só responder!',
    'messages.t2.label': 'Promoção / oferta',
    'messages.t2.msg': 'Olá {name}! 🐾 Temos uma promoção especial esta semana. Que tal trazer seu pet para um banho e tosa? Entre em contato e agende já!',
    'messages.t3.label': 'Reativar cliente inativo',
    'messages.t3.msg': 'Olá {name}! Sentimos sua falta! 🐶 Faz um tempinho que não vemos seu pet por aqui. Que tal agendar uma visita? Temos novidades te esperando!',
    'messages.t4.label': 'Mensagem personalizada',
    'messages.t4.msg': 'Olá {name}! ',
    'messages.t5.label': 'Confirmação de agendamento',
    'messages.t5.msg': 'Olá {name}! ✅ Seu agendamento foi confirmado para {date}. Te esperamos!',
    'messages.t6.label': 'Pós-atendimento / avaliação',
    'messages.t6.msg': 'Olá {name}! 🌟 Esperamos que {pet} tenha curtido o banho! Pode nos avaliar com uma nota?',
    'messages.t7.label': 'Aniversário do pet',
    'messages.t7.msg': 'Olá {name}! 🎂 Hoje é o aniversário de {pet}! Parabéns! Que tal um banho especial de aniversário?',
    'messages.t8.label': 'Pacote/plano mensal',
    'messages.t8.msg': 'Olá {name}! 📦 Temos um pacote mensal que pode economizar para você. Quer saber mais?',
  },
  'pt-PT': {
    'topbar.account': 'A minha conta',
    'topbar.signOut': 'Terminar sessão',
    'topbar.language': 'Idioma',
    'messages.intro': 'Envie uma mensagem rápida a {name} pelo WhatsApp.',
    'messages.t1.label': 'Lembrete de marcação',
    'messages.t1.msg': 'Olá {name}! 👋 Só a passar para recordar a marcação do seu animal na nossa loja. Qualquer dúvida, é só responder!',
    'messages.t2.label': 'Promoção / oferta',
    'messages.t2.msg': 'Olá {name}! 🐾 Temos uma promoção especial esta semana. Que tal trazer o seu animal para um banho e tosquia? Contacte-nos e marque já!',
    'messages.t3.label': 'Reativar cliente inativo',
    'messages.t3.msg': 'Olá {name}! Sentimos a sua falta! 🐶 Já há algum tempo que não vemos o seu animal por cá. Que tal marcar uma visita? Temos novidades à sua espera!',
    'messages.t4.label': 'Mensagem personalizada',
    'messages.t4.msg': 'Olá {name}! ',
    'messages.t5.label': 'Confirmação de marcação',
    'messages.t5.msg': 'Olá {name}! ✅ A sua marcação foi confirmada para {date}. Aguardamos por si!',
    'messages.t6.label': 'Pós-atendimento / avaliação',
    'messages.t6.msg': 'Olá {name}! 🌟 Esperamos que {pet} tenha gostado do banho! Pode avaliar-nos com uma nota?',
    'messages.t7.label': 'Aniversário do animal',
    'messages.t7.msg': 'Olá {name}! 🎂 Hoje é o aniversário do {pet}! Parabéns! Que tal um banho especial de aniversário?',
    'messages.t8.label': 'Pacote / plano mensal',
    'messages.t8.msg': 'Olá {name}! 📦 Temos um pacote mensal que pode poupar-lhe dinheiro. Quer saber mais?',
  },
  en: {
    'topbar.account': 'My account',
    'topbar.signOut': 'Sign out',
    'topbar.language': 'Language',
    'messages.intro': 'Send a quick WhatsApp message to {name}.',
    'messages.t1.label': 'Appointment reminder',
    'messages.t1.msg': "Hi {name}! 👋 Just a quick reminder about your pet's upcoming appointment at our pet shop. Any questions, just reply!",
    'messages.t2.label': 'Promotion / offer',
    'messages.t2.msg': 'Hi {name}! 🐾 We have a special promotion this week. How about bringing your pet for a bath and grooming? Get in touch and book now!',
    'messages.t3.label': 'Reactivate inactive client',
    'messages.t3.msg': "Hi {name}! We miss you! 🐶 It's been a while since we last saw your pet. How about scheduling a visit? We have news waiting for you!",
    'messages.t4.label': 'Custom message',
    'messages.t4.msg': 'Hi {name}! ',
    'messages.t5.label': 'Appointment confirmation',
    'messages.t5.msg': "Hi {name}! ✅ Your appointment is confirmed for {date}. We'll be waiting!",
    'messages.t6.label': 'Post-visit / review',
    'messages.t6.msg': 'Hi {name}! 🌟 We hope {pet} enjoyed the bath! Could you leave us a rating?',
    'messages.t7.label': "Pet's birthday",
    'messages.t7.msg': "Hi {name}! 🎂 Today is {pet}'s birthday! Happy birthday! How about a special birthday bath?",
    'messages.t8.label': 'Monthly package / plan',
    'messages.t8.msg': 'Hi {name}! 📦 We have a monthly package that could save you money. Want to know more?',
  },
  es: {
    'topbar.account': 'Mi cuenta',
    'topbar.signOut': 'Cerrar sesión',
    'topbar.language': 'Idioma',
    'messages.intro': 'Envía un mensaje rápido a {name} por WhatsApp.',
    'messages.t1.label': 'Recordatorio de cita',
    'messages.t1.msg': 'Hola {name}! 👋 Te recuerdo la cita de tu mascota en nuestra tienda. Cualquier duda, solo responde!',
    'messages.t2.label': 'Promoción / oferta',
    'messages.t2.msg': 'Hola {name}! 🐾 Tenemos una promoción especial esta semana. ¿Qué tal traer a tu mascota para un baño y peluquería? Contáctanos y reserva ya!',
    'messages.t3.label': 'Reactivar cliente inactivo',
    'messages.t3.msg': 'Hola {name}! ¡Te echamos de menos! 🐶 Hace tiempo que no vemos a tu mascota por aquí. ¿Qué tal agendar una visita? ¡Tenemos novedades esperándote!',
    'messages.t4.label': 'Mensaje personalizado',
    'messages.t4.msg': 'Hola {name}! ',
    'messages.t5.label': 'Confirmación de cita',
    'messages.t5.msg': 'Hola {name}! ✅ Tu cita ha sido confirmada para {date}. ¡Te esperamos!',
    'messages.t6.label': 'Post-servicio / valoración',
    'messages.t6.msg': 'Hola {name}! 🌟 ¡Esperamos que {pet} haya disfrutado del baño! ¿Puedes valorarnos con una nota?',
    'messages.t7.label': 'Cumpleaños de la mascota',
    'messages.t7.msg': 'Hola {name}! 🎂 ¡Hoy es el cumpleaños de {pet}! ¡Felicidades! ¿Qué tal un baño especial de cumpleaños?',
    'messages.t8.label': 'Paquete / plan mensual',
    'messages.t8.msg': 'Hola {name}! 📦 Tenemos un paquete mensual que puede ahorrarte dinero. ¿Quieres saber más?',
  },
}

const STORAGE_KEY = 'petagenda.locale'
const DEFAULT_LOCALE: Locale = 'pt-BR'

interface LanguageContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, vars?: Record<string, string>) => string
}

const LanguageContext = React.createContext<LanguageContextValue | null>(null)

function interpolate(template: string, vars?: Record<string, string>): string {
  if (!vars) return template
  return template.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`)
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = React.useState<Locale>(DEFAULT_LOCALE)

  React.useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY) as Locale | null
      if (stored && stored in TRANSLATIONS) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLocaleState(stored)
      }
    } catch {
      // ignore storage errors
    }
  }, [])

  const setLocale = React.useCallback((next: Locale) => {
    setLocaleState(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // ignore storage errors
    }
  }, [])

  const t = React.useCallback(
    (key: string, vars?: Record<string, string>) => {
      const dict = TRANSLATIONS[locale] ?? TRANSLATIONS[DEFAULT_LOCALE]
      const template = dict[key] ?? TRANSLATIONS[DEFAULT_LOCALE][key] ?? key
      return interpolate(template, vars)
    },
    [locale],
  )

  const value = React.useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage(): LanguageContextValue {
  const ctx = React.useContext(LanguageContext)
  if (!ctx) {
    // Safe fallback: returns English/default if provider missing.
    return {
      locale: DEFAULT_LOCALE,
      setLocale: () => {},
      t: (key, vars) => {
        const template = TRANSLATIONS[DEFAULT_LOCALE][key] ?? key
        return interpolate(template, vars)
      },
    }
  }
  return ctx
}
