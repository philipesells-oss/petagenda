'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

export type Locale = 'pt-BR' | 'en-US'

export interface Translations {
  nav: {
    dashboard: string
    agenda: string
    clients: string
    settings: string
    signOut: string
  }
  topbar: {
    myAccount: string
    language: string
  }
  dashboard: {
    title: string
    today: string
    revenue: string
    appointments: string
    clients: string
    newClients: string
  }
  agenda: {
    title: string
    schedule: string
    today: string
  }
  clients: {
    title: string
    new: string
  }
  settings: {
    title: string
    profile: string
    hours: string
    services: string
    team: string
  }
  whatsapp: {
    title: string
    templates: string
    logs: string
  }
  common: {
    save: string
    cancel: string
    edit: string
    delete: string
    back: string
    loading: string
    success: string
    error: string
  }
}

const translations: Record<Locale, Translations> = {
  'pt-BR': {
    nav: {
      dashboard: 'Dashboard',
      agenda: 'Agenda',
      clients: 'Clientes',
      settings: 'Configurações',
      signOut: 'Sair',
    },
    topbar: {
      myAccount: 'Minha conta',
      language: 'Idioma',
    },
    dashboard: {
      title: 'Dashboard',
      today: 'Hoje',
      revenue: 'Faturamento',
      appointments: 'Agendamentos',
      clients: 'Clientes',
      newClients: 'Novos clientes',
    },
    agenda: {
      title: 'Agenda',
      schedule: 'Agendar',
      today: 'Hoje',
    },
    clients: {
      title: 'Clientes',
      new: 'Novo cliente',
    },
    settings: {
      title: 'Configurações',
      profile: 'Perfil',
      hours: 'Horários',
      services: 'Serviços',
      team: 'Equipe',
    },
    whatsapp: {
      title: 'WhatsApp',
      templates: 'Templates',
      logs: 'Histórico',
    },
    common: {
      save: 'Salvar',
      cancel: 'Cancelar',
      edit: 'Editar',
      delete: 'Deletar',
      back: 'Voltar',
      loading: 'Carregando...',
      success: 'Sucesso!',
      error: 'Erro',
    },
  },
  'en-US': {
    nav: {
      dashboard: 'Dashboard',
      agenda: 'Schedule',
      clients: 'Clients',
      settings: 'Settings',
      signOut: 'Sign out',
    },
    topbar: {
      myAccount: 'My account',
      language: 'Language',
    },
    dashboard: {
      title: 'Dashboard',
      today: 'Today',
      revenue: 'Revenue',
      appointments: 'Appointments',
      clients: 'Clients',
      newClients: 'New clients',
    },
    agenda: {
      title: 'Schedule',
      schedule: 'Schedule',
      today: 'Today',
    },
    clients: {
      title: 'Clients',
      new: 'New client',
    },
    settings: {
      title: 'Settings',
      profile: 'Profile',
      hours: 'Hours',
      services: 'Services',
      team: 'Team',
    },
    whatsapp: {
      title: 'WhatsApp',
      templates: 'Templates',
      logs: 'Message log',
    },
    common: {
      save: 'Save',
      cancel: 'Cancel',
      edit: 'Edit',
      delete: 'Delete',
      back: 'Back',
      loading: 'Loading...',
      success: 'Success!',
      error: 'Error',
    },
  },
}

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

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('pt-BR')

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null
    if (saved === 'pt-BR' || saved === 'en-US') {
      setLocaleState(saved)
    }
  }, [])

  function setLocale(next: Locale) {
    setLocaleState(next)
    localStorage.setItem(STORAGE_KEY, next)
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
