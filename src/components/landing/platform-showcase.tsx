'use client'

import { useState, useEffect, useRef } from 'react'
import { LayoutDashboard, CalendarDays, Users, Scissors, TrendingUp, Clock, CheckCircle2 } from 'lucide-react'

type Locale = 'pt-BR' | 'pt-PT' | 'en'

// ── Translations ─────────────────────────────────────────────────────────────

const T = {
  'pt-BR': {
    badge: 'Plataforma por dentro',
    h1: 'Simples por fora.',
    h2: 'Completo por dentro.',
    sub: 'Tudo que seu pet shop precisa — no celular, no tablet ou no computador.',
    tabs: [
      { title: 'O dia inteiro numa tela', body: 'Faturamento, agendamentos confirmados e clientes ativos. Sem abrir planilha, sem adivinhar o caixa.' },
      { title: 'Agendamentos sem papel nem caderno', body: 'O atendente registra o serviço, escolhe o horário e pronto — conflito de agenda zero, histórico automático.' },
      { title: 'Cada pet com ficha completa', body: 'Raça, histórico de banhos, alergias e temperamento. Na próxima visita o tutor já se sente em casa.' },
      { title: 'Seu catálogo organizado', body: 'Banho, tosa, consulta veterinária — cada serviço com duração e preço certinho, sem calcular na ponta do lápis.' },
    ],
    stats: [
      { value: '< 3 min', label: 'pra cadastrar o primeiro pet' },
      { value: '100%', label: 'funciona no celular' },
      { value: 'R$0', label: 'de setup ou treinamento' },
      { value: 'LGPD', label: 'dados protegidos desde o dia 1' },
    ],
    dash: {
      date: 'Segunda, 20 Abr', kpis: ['Hoje', 'Agendados', 'Clientes'],
      kpiSubs: ['+12% semana', '3 em andamento', '4 inativos'], kpiValue: 'R$847',
      revLabel: 'Faturamento — 7 dias', days: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
      todayLabel: 'Próximos hoje',
      statuses: { confirmed: 'Confirmado', in_progress: 'Em andamento', scheduled: 'Agendado' },
      apts: [
        { time: '09:00', name: 'Buddy (Golden)', service: 'Banho + Tosa', status: 'confirmed' },
        { time: '10:30', name: 'Mel (Poodle)', service: 'Banho', status: 'in_progress' },
        { time: '14:00', name: 'Thor (Husky)', service: 'Consulta Clínica', status: 'scheduled' },
      ],
    },
    agenda: {
      title: 'Agenda — Abr 2026', newBtn: '+ Novo',
      days: ['Seg 20', 'Ter 21', 'Qua 22', 'Qui 23', 'Sex 24'],
    },
    clients: {
      title: 'Clientes & Pets', activeLabel: 'ativos', inactiveLabel: 'inativos',
      search: '🔍 Buscar por nome, pet ou telefone…', visits: 'visitas',
      statusActive: 'Ativo', statusInactive: 'Inativo',
      rows: [
        { name: 'Ana Beatriz Santos', pets: 'Buddy (Golden)', visits: 12, status: 'active', spent: 'R$840' },
        { name: 'Carlos Ferreira', pets: 'Mel (Poodle)', visits: 8, status: 'active', spent: 'R$560' },
        { name: 'Fernanda Lima', pets: 'Thor (Husky)', visits: 5, status: 'active', spent: 'R$350' },
        { name: 'Roberto Alves', pets: 'Nina (Shih-tzu)', visits: 2, status: 'inactive', spent: 'R$120' },
        { name: 'Juliana Costa', pets: 'Rex (Lab)', visits: 15, status: 'active', spent: 'R$1.050' },
      ],
    },
    services: {
      title: 'Serviços', newBtn: '+ Serviço',
      categories: ['Estética', 'Veterinário', 'Hotel & Day Care'],
      rows: [
        { name: 'Banho', category: 'Estética', duration: '60min', price: 'R$45', color: 'bg-blue-500' },
        { name: 'Banho + Tosa', category: 'Estética', duration: '90min', price: 'R$70', color: 'bg-emerald-500' },
        { name: 'Hidratação Capilar', category: 'Estética', duration: '60min', price: 'R$50', color: 'bg-pink-500' },
        { name: 'Consulta Clínica', category: 'Veterinário', duration: '30min', price: 'R$150', color: 'bg-violet-500' },
        { name: 'Vacinação', category: 'Veterinário', duration: '20min', price: 'R$80', color: 'bg-teal-500' },
        { name: 'Day Care - Diária', category: 'Hotel & Day Care', duration: '8h', price: 'R$80', color: 'bg-amber-500' },
      ],
    },
  },

  'pt-PT': {
    badge: 'A plataforma por dentro',
    h1: 'Simples por fora.',
    h2: 'Completo por dentro.',
    sub: 'Tudo o que o seu petshop precisa — no telemóvel, no tablet ou no computador.',
    tabs: [
      { title: 'O dia inteiro num ecrã', body: 'Faturamento, marcações confirmadas e clientes ativos. Sem abrir folha de cálculo, sem adivinhar o caixa.' },
      { title: 'Marcações sem papel nem caderno', body: 'O atendente regista o serviço, escolhe o horário e pronto — conflito de agenda zero, historial automático.' },
      { title: 'Cada animal com ficha completa', body: 'Raça, historial de banhos, alergias e temperamento. Na próxima visita o tutor já se sente em casa.' },
      { title: 'O seu catálogo organizado', body: 'Banho, tosquia, consulta veterinária — cada serviço com duração e preço certo, sem calcular na ponta do lápis.' },
    ],
    stats: [
      { value: '< 3 min', label: 'para registar o primeiro animal' },
      { value: '100%', label: 'funciona no telemóvel' },
      { value: '€0', label: 'de setup ou formação' },
      { value: 'RGPD', label: 'dados protegidos desde o dia 1' },
    ],
    dash: {
      date: 'Segunda, 20 Abr', kpis: ['Hoje', 'Marcações', 'Clientes'],
      kpiSubs: ['+12% semana', '3 em curso', '4 inativos'], kpiValue: '€241',
      revLabel: 'Faturamento — 7 dias', days: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
      todayLabel: 'Próximas hoje',
      statuses: { confirmed: 'Confirmado', in_progress: 'Em curso', scheduled: 'Agendado' },
      apts: [
        { time: '09:00', name: 'Buddy (Golden)', service: 'Banho + Tosquia', status: 'confirmed' },
        { time: '10:30', name: 'Mel (Poodle)', service: 'Banho', status: 'in_progress' },
        { time: '14:00', name: 'Thor (Husky)', service: 'Consulta Clínica', status: 'scheduled' },
      ],
    },
    agenda: {
      title: 'Agenda — Abr 2026', newBtn: '+ Nova',
      days: ['Seg 20', 'Ter 21', 'Qua 22', 'Qui 23', 'Sex 24'],
    },
    clients: {
      title: 'Clientes & Animais', activeLabel: 'ativos', inactiveLabel: 'inativos',
      search: '🔍 Pesquisar por nome, animal ou telefone…', visits: 'visitas',
      statusActive: 'Ativo', statusInactive: 'Inativo',
      rows: [
        { name: 'Ana Beatriz Santos', pets: 'Buddy (Golden)', visits: 12, status: 'active', spent: '€240' },
        { name: 'Carlos Ferreira', pets: 'Mel (Poodle)', visits: 8, status: 'active', spent: '€160' },
        { name: 'Fernanda Lima', pets: 'Thor (Husky)', visits: 5, status: 'active', spent: '€100' },
        { name: 'Roberto Alves', pets: 'Nina (Shih-tzu)', visits: 2, status: 'inactive', spent: '€40' },
        { name: 'Juliana Costa', pets: 'Rex (Lab)', visits: 15, status: 'active', spent: '€300' },
      ],
    },
    services: {
      title: 'Serviços', newBtn: '+ Serviço',
      categories: ['Estética', 'Veterinário', 'Hotel & Day Care'],
      rows: [
        { name: 'Banho', category: 'Estética', duration: '60min', price: '€12', color: 'bg-blue-500' },
        { name: 'Banho + Tosquia', category: 'Estética', duration: '90min', price: '€20', color: 'bg-emerald-500' },
        { name: 'Hidratação Capilar', category: 'Estética', duration: '60min', price: '€14', color: 'bg-pink-500' },
        { name: 'Consulta Clínica', category: 'Veterinário', duration: '30min', price: '€45', color: 'bg-violet-500' },
        { name: 'Vacinação', category: 'Veterinário', duration: '20min', price: '€22', color: 'bg-teal-500' },
        { name: 'Day Care - Diária', category: 'Hotel & Day Care', duration: '8h', price: '€22', color: 'bg-amber-500' },
      ],
    },
  },

  en: {
    badge: 'Inside the platform',
    h1: 'Simple outside.',
    h2: 'Complete inside.',
    sub: 'Everything your pet shop needs — on your phone, tablet, or computer.',
    tabs: [
      { title: 'Your entire day in one screen', body: 'Revenue, confirmed bookings, and active clients. No spreadsheet, no guessing.' },
      { title: 'Bookings without paper or notebooks', body: 'Staff registers the service, picks the slot — zero conflicts, automatic history.' },
      { title: 'Every pet with a complete profile', body: 'Breed, grooming history, allergies, and temperament. The owner feels at home on every visit.' },
      { title: 'Your catalog, organized', body: 'Bath, grooming, vet visits — each service with its duration and exact price.' },
    ],
    stats: [
      { value: '< 3 min', label: 'to register the first pet' },
      { value: '100%', label: 'works on mobile' },
      { value: '$0', label: 'setup or training fees' },
      { value: 'GDPR', label: 'data protected from day 1' },
    ],
    dash: {
      date: 'Monday, Apr 20', kpis: ['Today', 'Booked', 'Clients'],
      kpiSubs: ['+12% week', '3 in progress', '4 inactive'], kpiValue: '$247',
      revLabel: 'Revenue — 7 days', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      todayLabel: "Today's appointments",
      statuses: { confirmed: 'Confirmed', in_progress: 'In progress', scheduled: 'Scheduled' },
      apts: [
        { time: '09:00', name: 'Buddy (Golden)', service: 'Bath + Haircut', status: 'confirmed' },
        { time: '10:30', name: 'Mel (Poodle)', service: 'Bath', status: 'in_progress' },
        { time: '14:00', name: 'Thor (Husky)', service: 'Clinical Consult', status: 'scheduled' },
      ],
    },
    agenda: {
      title: 'Schedule — Apr 2026', newBtn: '+ New',
      days: ['Mon 20', 'Tue 21', 'Wed 22', 'Thu 23', 'Fri 24'],
    },
    clients: {
      title: 'Clients & Pets', activeLabel: 'active', inactiveLabel: 'inactive',
      search: '🔍 Search by name, pet, or phone…', visits: 'visits',
      statusActive: 'Active', statusInactive: 'Inactive',
      rows: [
        { name: 'Anna Mitchell', pets: 'Buddy (Golden)', visits: 12, status: 'active', spent: '$240' },
        { name: 'Carlos Ferreira', pets: 'Mel (Poodle)', visits: 8, status: 'active', spent: '$160' },
        { name: 'Fiona Lane', pets: 'Thor (Husky)', visits: 5, status: 'active', spent: '$100' },
        { name: 'Robert Walsh', pets: 'Nina (Shih-tzu)', visits: 2, status: 'inactive', spent: '$40' },
        { name: 'Julia Costa', pets: 'Rex (Lab)', visits: 15, status: 'active', spent: '$300' },
      ],
    },
    services: {
      title: 'Services', newBtn: '+ Service',
      categories: ['Grooming', 'Veterinary', 'Hotel & Day Care'],
      rows: [
        { name: 'Bath', category: 'Grooming', duration: '60min', price: '$12', color: 'bg-blue-500' },
        { name: 'Bath + Haircut', category: 'Grooming', duration: '90min', price: '$20', color: 'bg-emerald-500' },
        { name: 'Hair Treatment', category: 'Grooming', duration: '60min', price: '$14', color: 'bg-pink-500' },
        { name: 'Clinical Consult', category: 'Veterinary', duration: '30min', price: '$45', color: 'bg-violet-500' },
        { name: 'Vaccination', category: 'Veterinary', duration: '20min', price: '$22', color: 'bg-teal-500' },
        { name: 'Day Care - Daily', category: 'Hotel & Day Care', duration: '8h', price: '$22', color: 'bg-amber-500' },
      ],
    },
  },
} as const

// ── Mock screens ──────────────────────────────────────────────────────────────

function DashboardScreen({ locale }: { locale: Locale }) {
  const d = T[locale].dash
  const hours = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00']
  return (
    <div className="h-full bg-gray-50 p-4 font-sans text-xs">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-semibold text-gray-800 text-sm">🐾 PetFlow</span>
        <span className="text-gray-400">{d.date}</span>
      </div>
      <div className="mb-3 grid grid-cols-3 gap-2">
        {([
          { label: d.kpis[0], value: d.kpiValue, sub: d.kpiSubs[0], icon: TrendingUp, color: 'text-emerald-600' },
          { label: d.kpis[1], value: '9', sub: d.kpiSubs[1], icon: Clock, color: 'text-blue-600' },
          { label: d.kpis[2], value: '51', sub: d.kpiSubs[2], icon: Users, color: 'text-violet-600' },
        ] as const).map((k) => (
          <div key={k.label} className="rounded-xl bg-white p-3 shadow-sm border border-gray-100">
            <k.icon className={`mb-1 size-3.5 ${k.color}`} />
            <p className="font-bold text-gray-900 text-sm">{k.value}</p>
            <p className="text-[10px] text-gray-400">{k.sub}</p>
            <p className="mt-0.5 text-[10px] font-medium text-gray-600">{k.label}</p>
          </div>
        ))}
      </div>
      <div className="mb-3 rounded-xl bg-white border border-gray-100 p-3 shadow-sm">
        <p className="mb-2 text-[10px] font-semibold text-gray-600 uppercase tracking-wide">{d.revLabel}</p>
        <div className="flex items-end gap-1 h-12">
          {[30, 55, 40, 70, 45, 80, 60].map((h, i) => (
            <div key={i} className="flex-1 rounded-sm" style={{ height: `${h}%`, backgroundColor: i === 6 ? '#059669' : '#D1FAE5' }} />
          ))}
        </div>
        <div className="mt-1 flex justify-between text-[9px] text-gray-400">
          {d.days.map((day) => <span key={day}>{day}</span>)}
        </div>
      </div>
      <div className="rounded-xl bg-white border border-gray-100 p-3 shadow-sm">
        <p className="mb-2 text-[10px] font-semibold text-gray-600 uppercase tracking-wide">{d.todayLabel}</p>
        {d.apts.map((a) => (
          <div key={a.time} className="flex items-center gap-2 py-1 border-b border-gray-50 last:border-0">
            <span className="text-[10px] font-mono text-gray-400 w-8 shrink-0">{a.time}</span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-800 truncate text-[10px]">{a.name}</p>
              <p className="text-[9px] text-gray-400">{a.service}</p>
            </div>
            <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-medium ${
              a.status === 'confirmed' ? 'bg-blue-50 text-blue-600' :
              a.status === 'in_progress' ? 'bg-amber-50 text-amber-600' :
              'bg-gray-50 text-gray-500'
            }`}>
              {d.statuses[a.status as keyof typeof d.statuses]}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function AgendaScreen({ locale }: { locale: Locale }) {
  const ag = T[locale].agenda
  const hours = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00']
  const apts = [
    { day: 0, hour: 0, name: 'Buddy', color: 'bg-emerald-200 text-emerald-800' },
    { day: 0, hour: 2, name: 'Mel', color: 'bg-blue-200 text-blue-800' },
    { day: 1, hour: 1, name: 'Thor', color: 'bg-violet-200 text-violet-800' },
    { day: 1, hour: 4, name: 'Nina', color: 'bg-amber-200 text-amber-800' },
    { day: 2, hour: 0, name: 'Rex', color: 'bg-rose-200 text-rose-800' },
    { day: 2, hour: 3, name: 'Luna', color: 'bg-teal-200 text-teal-800' },
    { day: 3, hour: 2, name: 'Bob', color: 'bg-indigo-200 text-indigo-800' },
    { day: 4, hour: 1, name: 'Lola', color: 'bg-pink-200 text-pink-800' },
  ]
  return (
    <div className="h-full bg-gray-50 p-4 font-sans text-xs overflow-hidden">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-semibold text-gray-800 text-sm">📅 {ag.title}</span>
        <button className="rounded-lg bg-emerald-600 px-2 py-1 text-[10px] font-medium text-white">{ag.newBtn}</button>
      </div>
      <div className="rounded-xl bg-white border border-gray-100 overflow-hidden shadow-sm">
        <div className="grid grid-cols-6 border-b border-gray-100">
          <div className="p-2 text-[9px] text-gray-300" />
          {ag.days.map((d) => (
            <div key={d} className="p-2 text-center text-[10px] font-semibold text-gray-600 border-l border-gray-50">{d}</div>
          ))}
        </div>
        {hours.map((h, hi) => (
          <div key={h} className="grid grid-cols-6 border-b border-gray-50 last:border-0">
            <div className="p-2 text-[9px] text-gray-300 font-mono">{h}</div>
            {ag.days.map((_, di) => {
              const apt = apts.find((a) => a.day === di && a.hour === hi)
              return (
                <div key={di} className="min-h-[24px] border-l border-gray-50 p-0.5">
                  {apt && (
                    <div className={`rounded px-1 py-0.5 text-[9px] font-medium truncate ${apt.color}`}>
                      {apt.name}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

function ClientesScreen({ locale }: { locale: Locale }) {
  const cl = T[locale].clients
  return (
    <div className="h-full bg-gray-50 p-4 font-sans text-xs">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-semibold text-gray-800 text-sm">👥 {cl.title}</span>
        <div className="flex gap-1">
          <span className="rounded-lg bg-emerald-50 px-2 py-1 text-[10px] font-medium text-emerald-700">51 {cl.activeLabel}</span>
          <span className="rounded-lg bg-gray-100 px-2 py-1 text-[10px] text-gray-500">20 {cl.inactiveLabel}</span>
        </div>
      </div>
      <div className="mb-2 rounded-lg bg-white border border-gray-100 px-3 py-2 text-[10px] text-gray-400">
        {cl.search}
      </div>
      <div className="rounded-xl bg-white border border-gray-100 shadow-sm overflow-hidden">
        {cl.rows.map((c, i) => (
          <div key={c.name} className={`flex items-center gap-3 px-3 py-2.5 ${i < cl.rows.length - 1 ? 'border-b border-gray-50' : ''}`}>
            <div className="size-7 shrink-0 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-[10px]">
              {c.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-800 truncate text-[10px]">{c.name}</p>
              <p className="text-[9px] text-gray-400 truncate">{c.pets} · {c.visits} {cl.visits}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-semibold text-gray-700 text-[10px]">{c.spent}</p>
              <span className={`rounded-full px-1.5 py-0.5 text-[9px] ${c.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                {c.status === 'active' ? cl.statusActive : cl.statusInactive}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ServicosScreen({ locale }: { locale: Locale }) {
  const sv = T[locale].services
  return (
    <div className="h-full bg-gray-50 p-4 font-sans text-xs">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-semibold text-gray-800 text-sm">✂️ {sv.title}</span>
        <button className="rounded-lg bg-emerald-600 px-2 py-1 text-[10px] font-medium text-white">{sv.newBtn}</button>
      </div>
      <div className="mb-2 grid grid-cols-3 gap-1.5">
        {sv.categories.map((cat, idx) => (
          <div key={cat} className="rounded-lg bg-white border border-gray-100 p-2 text-center">
            <p className="font-semibold text-gray-700 text-[10px]">{idx === 0 ? '8' : idx === 1 ? '8' : '3'}</p>
            <p className="text-[9px] text-gray-400">{cat}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl bg-white border border-gray-100 shadow-sm overflow-hidden">
        {sv.rows.map((s, i) => (
          <div key={s.name} className={`flex items-center gap-3 px-3 py-2.5 ${i < sv.rows.length - 1 ? 'border-b border-gray-50' : ''}`}>
            <div className={`size-2 rounded-full shrink-0 ${s.color}`} />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-800 text-[10px]">{s.name}</p>
              <p className="text-[9px] text-gray-400">{s.category} · {s.duration}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-emerald-700 text-[10px]">{s.price}</span>
              <CheckCircle2 className="size-3 text-emerald-500" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props { locale?: Locale }

const INTERVAL_MS = 4500

export function PlatformShowcase({ locale = 'pt-BR' }: Props) {
  const t = T[locale]
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const [progress, setProgress] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const TABS = [
    { id: 'dashboard', icon: LayoutDashboard, ...t.tabs[0], Screen: () => <DashboardScreen locale={locale} /> },
    { id: 'agenda', icon: CalendarDays, ...t.tabs[1], Screen: () => <AgendaScreen locale={locale} /> },
    { id: 'clientes', icon: Users, ...t.tabs[2], Screen: () => <ClientesScreen locale={locale} /> },
    { id: 'servicos', icon: Scissors, ...t.tabs[3], Screen: () => <ServicosScreen locale={locale} /> },
  ]

  const advance = (idx?: number) => {
    setActive(idx !== undefined ? idx : (prev) => (prev + 1) % TABS.length)
    setProgress(0)
  }

  useEffect(() => {
    if (paused) return
    progressRef.current = setInterval(() => {
      setProgress((p) => Math.min(p + 100 / (INTERVAL_MS / 50), 100))
    }, 50)
    intervalRef.current = setInterval(() => advance(), INTERVAL_MS)
    return () => {
      clearInterval(intervalRef.current!)
      clearInterval(progressRef.current!)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, paused])

  const handleTabClick = (idx: number) => {
    clearInterval(intervalRef.current!)
    clearInterval(progressRef.current!)
    setProgress(0)
    setActive(idx)
    setPaused(false)
  }

  return (
    <section className="relative overflow-hidden py-20 md:py-28">
      <div className="absolute inset-0 bg-gradient-to-b from-white via-emerald-50/40 to-white" />

      <div className="relative mx-auto max-w-6xl px-4">
        <div className="mb-14 text-center">
          <span className="mb-3 inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            {t.badge}
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
            {t.h1}<br className="hidden sm:block" />{' '}
            <span className="text-emerald-600">{t.h2}</span>
          </h2>
          <p className="mt-3 text-gray-500 md:text-lg">{t.sub}</p>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-12">
          <div className="flex gap-3 lg:col-span-4 lg:flex-col lg:gap-2">
            {TABS.map((tab, i) => {
              const Icon = tab.icon
              const isActive = i === active
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(i)}
                  className={`flex flex-1 cursor-pointer items-start gap-3 rounded-2xl border px-4 py-4 text-left transition-all duration-200 lg:flex-none ${
                    isActive
                      ? 'border-emerald-200 bg-white shadow-md shadow-emerald-100'
                      : 'border-transparent bg-transparent hover:bg-white/60'
                  }`}
                >
                  <div className={`mt-0.5 shrink-0 rounded-lg p-1.5 ${isActive ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                    <Icon className={`size-4 ${isActive ? 'text-emerald-600' : 'text-gray-400'}`} />
                  </div>
                  <div className="hidden lg:block">
                    <p className={`text-sm font-semibold ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                      {tab.title}
                    </p>
                    {isActive && (
                      <p className="mt-1 text-xs leading-relaxed text-gray-500">{tab.body}</p>
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          <div
            className="lg:col-span-8"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-2xl shadow-emerald-900/10">
              <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-4 py-2.5">
                <div className="flex gap-1.5">
                  <div className="size-2.5 rounded-full bg-red-400" />
                  <div className="size-2.5 rounded-full bg-amber-400" />
                  <div className="size-2.5 rounded-full bg-emerald-400" />
                </div>
                <div className="mx-auto flex items-center gap-1.5 rounded-lg bg-white border border-gray-200 px-3 py-1 text-xs text-gray-400">
                  <span>🔒</span>
                  <span>app.getpetflow.com/{TABS[active].id}</span>
                </div>
              </div>

              <div className="relative h-[380px] md:h-[420px] overflow-hidden">
                {TABS.map((tab, i) => {
                  const Screen = tab.Screen
                  return (
                    <div
                      key={tab.id}
                      className="absolute inset-0 transition-opacity duration-500"
                      style={{ opacity: i === active ? 1 : 0, pointerEvents: i === active ? 'auto' : 'none' }}
                    >
                      <Screen />
                    </div>
                  )
                })}
              </div>

              <div className="h-0.5 bg-gray-100">
                <div className="h-full bg-emerald-500 transition-none" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div className="pointer-events-none absolute -bottom-6 left-1/2 h-20 w-2/3 -translate-x-1/2 rounded-full bg-emerald-400/20 blur-3xl" />

            <div className="mt-4 flex justify-center gap-2">
              {TABS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => handleTabClick(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === active ? 'w-6 bg-emerald-600' : 'w-1.5 bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-2 gap-4 md:grid-cols-4">
          {t.stats.map((s) => (
            <div key={s.label} className="rounded-2xl border border-gray-100 bg-white p-5 text-center shadow-sm">
              <p className="text-2xl font-bold text-emerald-600">{s.value}</p>
              <p className="mt-1 text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
