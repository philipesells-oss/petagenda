import { headers } from 'next/headers'
import Link from 'next/link'
import { CheckIcon, StarIcon, ShieldCheckIcon, SmartphoneIcon, ClockIcon, TrendingUpIcon } from 'lucide-react'
import { CheckoutButton } from '@/components/landing/checkout-button'
import { TypingHeadline } from '@/components/landing/typing-headline'
import { PlatformShowcase } from '@/components/landing/platform-showcase'
import type { SupportedCurrency } from '@/lib/stripe'

// ── Locale detection ──────────────────────────────────────────────────────────

type Locale = 'pt-BR' | 'pt-PT' | 'en'

const EUR_COUNTRIES = new Set([
  'PT','DE','FR','IT','ES','NL','BE','AT','IE','FI','GR','LU','MT','CY',
  'SK','SI','EE','LV','LT','HR','BG','RO','HU','CZ','PL','SE','DK','NO','CH',
])

function detectLocale(hdrs: Headers): { locale: Locale; currency: SupportedCurrency } {
  const country = (hdrs.get('x-vercel-ip-country') ?? '').toUpperCase()
  const lang = hdrs.get('accept-language') ?? ''

  if (country === 'BR') return { locale: 'pt-BR', currency: 'BRL' }
  if (country === 'PT') return { locale: 'pt-PT', currency: 'EUR' }
  if (EUR_COUNTRIES.has(country)) return { locale: 'en', currency: 'EUR' }
  if (['US', 'CA', 'AU', 'GB', 'NZ'].includes(country)) return { locale: 'en', currency: 'USD' }
  if (lang.toLowerCase().includes('pt-br')) return { locale: 'pt-BR', currency: 'BRL' }
  if (lang.toLowerCase().includes('pt-pt')) return { locale: 'pt-PT', currency: 'EUR' }
  if (/\bpt\b/i.test(lang)) return { locale: 'pt-BR', currency: 'BRL' }
  return { locale: 'en', currency: 'USD' }
}

// ── Copy ──────────────────────────────────────────────────────────────────────

const COPY = {
  'pt-BR': {
    badge: '🆕 Agenda por profissional já disponível · R$29,90/mês · Sem fidelidade',
    heroSupport: 'Cada profissional com sua própria agenda.',
    heroTypingPhrases: ['Sem conflito de horário.', 'Sem bagunça no WhatsApp.', 'Mais dinheiro no caixa.'],
    heroSub: 'Cada profissional tem seu horário, seus serviços e sua agenda — o cliente agenda direto com quem faz. Menos confusão, menos conflito, mais dinheiro no caixa.',
    heroGuarantee: '7 dias de garantia · Cancele quando quiser · Suporte humano em português',
    navLogin: 'Entrar',
    navCta: 'Assinar agora',
    statsItems: [
      { value: '< 3min', label: 'para o primeiro agendamento' },
      { value: '0', label: 'conflitos com agenda por profissional' },
      { value: '100%', label: 'na nuvem — funciona em qualquer tela' },
      { value: '7 dias', label: 'de garantia, sem perguntas' },
    ],
    problemHeadline: 'Você se identifica?',
    problems: [
      { emoji: '📱', title: 'Agenda bagunçada no WhatsApp', body: 'Você perde horários, esquece confirmações e ainda atende dois banhos no mesmo horário.' },
      { emoji: '😕', title: 'Cliente volta e ninguém lembra do pet', body: 'Sem histórico, você pergunta tudo de novo — e passa a impressão de amador.' },
      { emoji: '💸', title: 'No fim do dia, não sabe quanto entrou', body: 'Caderno rasurado, maquininha de um lado, Pix do outro. O caixa vira adivinhação.' },
    ],
    comparisonHeadline: 'Do caderninho para o controle total',
    comparisonSub: 'Veja o que muda quando você sai do improviso e entra no PetFlow.',
    comparisonBefore: '😰 Antes',
    comparisonAfter: '✅ Com PetFlow',
    comparisonRows: [
      { situation: 'Agendar um banho', before: 'WhatsApp + caderno + torcer pra não conflitar', after: 'Atendente abre o sistema, escolhe horário livre e confirma' },
      { situation: 'Lembrar o histórico do pet', before: 'Pergunta tudo de novo a cada visita', after: 'Ficha completa com raça, alergias e todos os banhos anteriores' },
      { situation: 'Saber o faturamento do dia', before: 'Soma no caderno ou na maquininha no final do dia', after: 'Dashboard em tempo real, atualizado a cada serviço concluído' },
      { situation: 'Saber quais serviços mais vendem', before: 'Achismo ou planilha desatualizada', after: 'Gráfico de faturamento por período, atualizado a cada serviço concluído' },
      { situation: 'Clientes que sumiram', before: 'Não sabe quem parou de vir', after: 'Lista de inativos com data da última visita' },
      { situation: 'Agenda por profissional', before: 'Um único horário pra todo mundo — conflito na certa', after: 'Cada profissional com sua grade, seus serviços e sua disponibilidade' },
    ],
    featuresHeadline: 'Tudo que seu pet shop precisa',
    featuresSub: 'Em menos de uma tarde você configura e já começa a usar.',
    features: [
      { emoji: '📅', title: 'Agenda inteligente', body: 'Marque banho, tosa e consulta sem conflito de horário — e confirme com o tutor em 2 toques.' },
      { emoji: '🐶', title: 'Ficha do cliente e do pet', body: 'Raça, pelagem, manias, vacinas. Tudo na mão quando o tutor cruzar a porta.' },
      { emoji: '✂️', title: 'Catálogo de serviços', body: 'Cadastre banho, tosa, hidratação e pacotes com preço certinho — sem calcular na ponta do lápis.' },
      { emoji: '📊', title: 'Faturamento e KPIs do dia', body: 'Veja quanto entrou, quais serviços venderam mais e quem são seus melhores clientes.' },
      { emoji: '👩‍💼', title: 'Cada profissional, seus serviços', body: 'Defina quais serviços cada funcionário realiza. O atendente agenda sem erro — zero overbooking, zero serviço no profissional errado.' },
      { emoji: '🕐', title: 'Horário individual por profissional', body: 'Configure entrada, saída e folgas separado pra cada membro da equipe. O sistema bloqueia automaticamente quem não está disponível.' },
    ],
    testimonialsHeadline: 'Donos de pet shop que já saíram do caderninho',
    testimonialsSub: 'Deslize para ver mais →',
    testimonials: [
      { name: 'Carla Meneses', city: 'Belo Horizonte, MG 🇧🇷', text: 'Eu anotava tudo num caderno e vivia perdendo horário. No primeiro mês com o PetFlow, parei de marcar banhos em cima um do outro e ainda descobri que minha tosa higiênica era o serviço que mais dava dinheiro. Pago os R$29,90 sem pensar.' },
      { name: 'Ana Rodrigues', city: 'Lisboa, Portugal 🇵🇹', text: 'Tinha tudo numa agenda de papel e esquecia confirmações toda semana. Agora o PetFlow avisa os clientes automaticamente — as faltas caíram a zero. Não troco por nada.' },
      { name: 'Rogério Tavares', city: 'Campinas, SP 🇧🇷', text: 'Meu pet shop é pequeno, somos eu e mais duas meninas. Achei que sistema ia ser complicado, mas em uma tarde já tava com tudo cadastrado. O que mais gosto é abrir o celular de manhã e ver a agenda do dia inteirinha, sem bagunça no WhatsApp.' },
      { name: 'Jessica W.', city: 'Miami, FL 🇺🇸', text: 'I manage a grooming salon with 4 groomers and the old spreadsheet was a nightmare. PetFlow gave each groomer their own schedule. No more double bookings, no more angry clients at the door.' },
      { name: 'Juliana Martins', city: 'Pet Space · Campinas, SP 🇧🇷', text: 'A gente tinha 3 tosadoras e uma agenda só pra todo mundo. Virava bagunça toda semana. Com o PetFlow cada uma tem o próprio horário e os próprios serviços — o atendente já sabe exatamente quem faz o quê. Reduziu reclamação e o caixa melhorou.' },
      { name: 'Miguel Ferreira', city: 'Porto, Portugal 🇵🇹', text: 'A minha clínica veterinária cresceu muito e a agenda em papel já não dava. O PetFlow organizou tudo — cada médico com os seus horários, cada cliente com a ficha do animal. Muito profissional.' },
      { name: 'Tyler B.', city: 'Austin, TX 🇺🇸', text: 'Was using group chats and sticky notes to manage appointments. PetFlow changed everything — clients book, I get notified, and my revenue dashboard shows exactly what\'s working. Worth every penny.' },
    ],
    priceHeadline: 'Um plano. Tudo incluído.',
    priceSub: 'Valor único · Tudo incluso · Sem pegadinha, sem surpresa na fatura.',
    priceDisplay: 'R$29,90',
    pricePeriod: '/mês · Cancele quando quiser',
    priceFeatures: [
      'Agenda inteligente sem conflito de horários',
      'Clientes e pets com ficha completa e histórico',
      'Catálogo de serviços e pacotes ilimitados',
      'Faturamento diário e dashboard de KPIs',
      'Agenda individual por profissional com serviços e horários próprios',
      'Acesso pelo celular, tablet ou computador',
      'Suporte humano em português, de verdade',
      'Seus dados em servidores seguros — sempre disponíveis',
      '🛡️ Garantia de 7 dias ou seu dinheiro de volta',
    ],
    ctaLabel: 'Quero começar por R$29,90/mês',
    guaranteeTitle: 'Garantia de 7 dias — risco zero',
    guaranteeBody: 'Se em 7 dias você não ficar satisfeito, devolvemos 100% do valor pago. Sem perguntas, sem burocracia. É o seu direito garantido pelo',
    guaranteeLegal: 'Código de Defesa do Consumidor, Art. 49',
    guaranteeLegalSuffix: '— e a gente cumpre com prazer.',
    trustItems: [
      { title: 'Seus dados são seus', body: 'Exporte clientes, pets e histórico a qualquer momento, em qualquer formato. Você nunca fica refém.' },
      { title: 'Funciona em qualquer tela', body: 'Celular, tablet, notebook. Sem instalar nada — basta abrir o navegador e fazer login.' },
      { title: 'LGPD desde o dia 1', body: 'Dados dos seus clientes protegidos conforme a lei. Nenhuma informação é vendida ou compartilhada.' },
    ],
    faqHeadline: 'Perguntas frequentes',
    faqs: [
      { q: 'Preciso instalar alguma coisa?', a: 'Não. O PetFlow funciona direto no navegador do celular, tablet ou computador. Basta fazer login e usar.' },
      { q: 'Tem fidelidade ou multa pra cancelar?', a: 'Nenhuma. Você paga mês a mês e cancela quando quiser, sem burocracia.' },
      { q: 'E se eu cancelar — perco meus dados?', a: 'Não. Seus dados ficam seguros nos nossos servidores e nossa equipe te ajuda a extrair tudo antes do cancelamento. Clientes, pets, histórico — tudo seu, sempre.' },
      { q: 'Consigo migrar minha agenda atual?', a: 'Sim. A gente te ajuda a cadastrar seus clientes e pets na primeira semana, mesmo que esteja tudo no caderno ou no WhatsApp.' },
      { q: 'Funciona pra pet shop pequeno, com 1 ou 2 funcionários?', a: 'Foi feito pra isso. O PetFlow foi desenhado pro dono que atende no balcão e precisa de algo simples, rápido e que não atrapalhe o dia.' },
      { q: 'E se eu não gostar? Tem garantia?', a: 'Sim. Você tem 7 dias de garantia total. Se não ficar satisfeito por qualquer motivo, devolvemos 100% do valor pago — sem perguntas e sem burocracia. É seu direito pelo Código de Defesa do Consumidor (Art. 49) e a gente cumpre com prazer.' },
    ],
    ctaFinalHeadline: 'Seu próximo banho pode já sair organizado.',
    ctaFinalSub: 'R$29,90/mês pra ter agenda, equipe e caixa organizados num só lugar. Ative agora e comece a usar hoje mesmo.',
    ctaFinalGuarantee: '🛡️ Garantia de 7 dias — não gostou, devolvemos tudo. Sem perguntas.',
    footerLogin: 'Entrar',
    supportEmail: 'suporte@getpetflow.com',
  },

  'pt-PT': {
    badge: '🆕 Agenda por profissional disponível · €19,90/mês · Sem fidelidade',
    heroSupport: 'Cada profissional com a sua própria agenda.',
    heroTypingPhrases: ['Sem conflito de horários.', 'Sem confusão no WhatsApp.', 'Mais dinheiro no caixa.'],
    heroSub: 'Cada profissional tem o seu horário, os seus serviços e a sua agenda — o cliente marca diretamente com quem faz. Menos confusão, menos conflitos, mais dinheiro no caixa.',
    heroGuarantee: '7 dias de garantia · Cancele quando quiser · Suporte humano em português',
    navLogin: 'Entrar',
    navCta: 'Subscrever agora',
    statsItems: [
      { value: '< 3min', label: 'para a primeira marcação' },
      { value: '0', label: 'conflitos com agenda por profissional' },
      { value: '100%', label: 'na nuvem — funciona em qualquer ecrã' },
      { value: '7 dias', label: 'de garantia, sem perguntas' },
    ],
    problemHeadline: 'Isto soa-lhe familiar?',
    problems: [
      { emoji: '📱', title: 'Agenda desorganizada no WhatsApp', body: 'Perde horários, esquece confirmações e ainda marca dois banhos à mesma hora.' },
      { emoji: '😕', title: 'O cliente volta e ninguém se lembra do animal', body: 'Sem historial, pergunta tudo de novo em cada visita — e passa a impressão de amador.' },
      { emoji: '💸', title: 'No fim do dia, não sabe quanto entrou', body: 'Caderno rasurado, terminal de pagamento num lado, MB Way do outro. O caixa vira adivinhação.' },
    ],
    comparisonHeadline: 'Da agenda em papel para o controlo total',
    comparisonSub: 'Veja o que muda quando sai do improviso e entra no PetFlow.',
    comparisonBefore: '😰 Antes',
    comparisonAfter: '✅ Com PetFlow',
    comparisonRows: [
      { situation: 'Marcar um banho', before: 'WhatsApp + caderno + torcer para não haver conflito', after: 'Atendente abre o sistema, escolhe horário livre e confirma' },
      { situation: 'Lembrar o historial do animal', before: 'Pergunta tudo de novo a cada visita', after: 'Ficha completa com raça, alergias e todos os banhos anteriores' },
      { situation: 'Saber o faturamento do dia', before: 'Soma no caderno ou no terminal no fim do dia', after: 'Dashboard em tempo real, atualizado a cada serviço concluído' },
      { situation: 'Saber quais serviços mais vendem', before: 'Achismo ou folha de cálculo desatualizada', after: 'Gráfico de faturamento por período, atualizado a cada serviço concluído' },
      { situation: 'Clientes que desapareceram', before: 'Não sabe quem deixou de vir', after: 'Lista de inativos com data da última visita' },
      { situation: 'Agenda por profissional', before: 'Um único horário para todos — conflito garantido', after: 'Cada profissional com a sua grelha, os seus serviços e a sua disponibilidade' },
    ],
    featuresHeadline: 'Tudo o que o seu petshop precisa',
    featuresSub: 'Em menos de uma tarde configura e já começa a usar.',
    features: [
      { emoji: '📅', title: 'Agenda inteligente', body: 'Marque banho, tosquia e consulta sem conflito de horário — e confirme com o tutor em 2 toques.' },
      { emoji: '🐶', title: 'Ficha do cliente e do animal', body: 'Raça, pelagem, manias, vacinas. Tudo à mão quando o tutor entrar.' },
      { emoji: '✂️', title: 'Catálogo de serviços', body: 'Registe banho, tosquia, hidratação e pacotes com preço certo — sem calcular na ponta do lápis.' },
      { emoji: '📊', title: 'Faturamento e KPIs do dia', body: 'Veja quanto entrou, quais serviços venderam mais e quem são os seus melhores clientes.' },
      { emoji: '👩‍💼', title: 'Cada profissional, os seus serviços', body: 'Defina quais serviços cada funcionário realiza. O atendente marca sem erro — zero overbooking, zero serviço no profissional errado.' },
      { emoji: '🕐', title: 'Horário individual por profissional', body: 'Configure entrada, saída e folgas separadas para cada membro da equipa. O sistema bloqueia automaticamente quem não está disponível.' },
    ],
    testimonialsHeadline: 'Donos de petshop que já saíram da agenda em papel',
    testimonialsSub: 'Deslize para ver mais →',
    testimonials: [
      { name: 'Carla Meneses', city: 'Belo Horizonte, MG 🇧🇷', text: 'Eu anotava tudo num caderno e vivia perdendo horário. No primeiro mês com o PetFlow, parei de marcar banhos em cima um do outro e ainda descobri que minha tosa higiênica era o serviço que mais dava dinheiro. Pago os R$29,90 sem pensar.' },
      { name: 'Ana Rodrigues', city: 'Lisboa, Portugal 🇵🇹', text: 'Tinha tudo numa agenda de papel e esquecia confirmações toda semana. Agora o PetFlow avisa os clientes automaticamente — as faltas caíram a zero. Não troco por nada.' },
      { name: 'Rogério Tavares', city: 'Campinas, SP 🇧🇷', text: 'Meu pet shop é pequeno, somos eu e mais duas meninas. Achei que sistema ia ser complicado, mas em uma tarde já tava com tudo cadastrado. O que mais gosto é abrir o celular de manhã e ver a agenda do dia inteirinha, sem bagunça no WhatsApp.' },
      { name: 'Jessica W.', city: 'Miami, FL 🇺🇸', text: 'I manage a grooming salon with 4 groomers and the old spreadsheet was a nightmare. PetFlow gave each groomer their own schedule. No more double bookings, no more angry clients at the door.' },
      { name: 'Juliana Martins', city: 'Pet Space · Campinas, SP 🇧🇷', text: 'A gente tinha 3 tosadoras e uma agenda só pra todo mundo. Virava bagunça toda semana. Com o PetFlow cada uma tem o próprio horário e os próprios serviços — o atendente já sabe exatamente quem faz o quê. Reduziu reclamação e o caixa melhorou.' },
      { name: 'Miguel Ferreira', city: 'Porto, Portugal 🇵🇹', text: 'A minha clínica veterinária cresceu muito e a agenda em papel já não dava. O PetFlow organizou tudo — cada médico com os seus horários, cada cliente com a ficha do animal. Muito profissional.' },
      { name: 'Tyler B.', city: 'Austin, TX 🇺🇸', text: 'Was using group chats and sticky notes to manage appointments. PetFlow changed everything — clients book, I get notified, and my revenue dashboard shows exactly what\'s working. Worth every penny.' },
    ],
    priceHeadline: 'Um plano. Tudo incluído.',
    priceSub: 'Valor único · Tudo incluído · Sem surpresas na fatura.',
    priceDisplay: '€19,90',
    pricePeriod: '/mês · Cancele quando quiser',
    priceFeatures: [
      'Agenda inteligente sem conflito de horários',
      'Clientes e animais com ficha completa e historial',
      'Catálogo de serviços e pacotes ilimitados',
      'Faturamento diário e dashboard de KPIs',
      'Agenda individual por profissional com serviços e horários próprios',
      'Acesso pelo telemóvel, tablet ou computador',
      'Suporte humano em português, de verdade',
      'Os seus dados em servidores seguros — sempre disponíveis',
      '🛡️ Garantia de 7 dias ou o seu dinheiro de volta',
    ],
    ctaLabel: 'Quero começar por €19,90/mês',
    guaranteeTitle: 'Garantia de 7 dias — risco zero',
    guaranteeBody: 'Se em 7 dias não ficar satisfeito, devolvemos 100% do valor pago. Sem perguntas, sem burocracia. É o seu direito garantido pela',
    guaranteeLegal: 'Lei de Defesa do Consumidor',
    guaranteeLegalSuffix: '— e cumprimos com prazer.',
    trustItems: [
      { title: 'Os seus dados são seus', body: 'Exporte clientes, animais e historial a qualquer momento, em qualquer formato. Nunca fica refém.' },
      { title: 'Funciona em qualquer ecrã', body: 'Telemóvel, tablet, portátil. Sem instalar nada — basta abrir o browser e fazer login.' },
      { title: 'RGPD desde o dia 1', body: 'Dados dos seus clientes protegidos conforme a lei. Nenhuma informação é vendida ou partilhada.' },
    ],
    faqHeadline: 'Perguntas frequentes',
    faqs: [
      { q: 'Preciso de instalar alguma coisa?', a: 'Não. O PetFlow funciona diretamente no browser do telemóvel, tablet ou computador. Basta fazer login e usar.' },
      { q: 'Tem fidelidade ou multa para cancelar?', a: 'Nenhuma. Paga mês a mês e cancela quando quiser, sem burocracia.' },
      { q: 'Se cancelar, perco os meus dados?', a: 'Não. Os seus dados ficam seguros nos nossos servidores e a nossa equipa ajuda-o a extrair tudo antes do cancelamento.' },
      { q: 'Consigo migrar a minha agenda atual?', a: 'Sim. Ajudamos a registar os seus clientes e animais na primeira semana, mesmo que esteja tudo em papel ou no WhatsApp.' },
      { q: 'Funciona para um petshop pequeno, com 1 ou 2 funcionários?', a: 'Foi feito para isso. O PetFlow foi desenhado para o dono que atende no balcão e precisa de algo simples, rápido e que não atrapalhe o dia.' },
      { q: 'E se não gostar? Há garantia?', a: 'Sim. Tem 7 dias de garantia total. Se não ficar satisfeito por qualquer motivo, devolvemos 100% do valor pago — sem perguntas e sem burocracia.' },
    ],
    ctaFinalHeadline: 'A sua próxima marcação pode sair já organizada.',
    ctaFinalSub: '€19,90/mês para ter agenda, equipa e caixa organizados num só lugar. Ative agora e comece a usar hoje mesmo.',
    ctaFinalGuarantee: '🛡️ Garantia de 7 dias — não gostou, devolvemos tudo. Sem perguntas.',
    footerLogin: 'Entrar',
    supportEmail: 'suporte@getpetflow.com',
  },

  en: {
    badge: '🆕 Per-staff scheduling available · $19.90/mo · Cancel anytime',
    heroSupport: 'Each staff member has their own schedule.',
    heroTypingPhrases: ['Zero double-bookings.', 'No WhatsApp chaos.', 'More money in the register.'],
    heroSub: 'Each staff member has their own schedule, services, and calendar — clients book directly with who does the work. Less chaos, fewer conflicts, more money in the register.',
    heroGuarantee: '7-day guarantee · Cancel anytime · Human support in your language',
    navLogin: 'Log in',
    navCta: 'Subscribe now',
    statsItems: [
      { value: '< 3min', label: 'to your first booking' },
      { value: '0', label: 'conflicts with per-staff scheduling' },
      { value: '100%', label: 'cloud-based — works on any device' },
      { value: '7 days', label: 'money-back guarantee, no questions' },
    ],
    problemHeadline: 'Does this sound familiar?',
    problems: [
      { emoji: '📱', title: 'Chaotic scheduling on WhatsApp', body: 'You miss appointments, forget confirmations, and end up double-booking the same slot.' },
      { emoji: '😕', title: 'Client returns and nobody remembers their pet', body: 'No history on file, so you ask everything again — giving the impression of an amateur shop.' },
      { emoji: '💸', title: "At the end of the day, you don't know your revenue", body: 'Notes scattered, card terminal on one side, cash on the other. Bookkeeping becomes guesswork.' },
    ],
    comparisonHeadline: 'From chaos to total control',
    comparisonSub: 'See what changes when you move from improvisation to PetFlow.',
    comparisonBefore: '😰 Before',
    comparisonAfter: '✅ With PetFlow',
    comparisonRows: [
      { situation: 'Book a bath', before: 'WhatsApp + notebook + hope there is no conflict', after: 'Staff opens the system, picks a free slot, confirms instantly' },
      { situation: "Remember the pet's history", before: 'Ask everything again on every visit', after: 'Full profile with breed, allergies, and all previous visits' },
      { situation: "Today's revenue", before: 'Count entries at end of day on the terminal', after: 'Real-time dashboard updated after each completed service' },
      { situation: 'Best-selling services', before: 'Guesswork or an outdated spreadsheet', after: 'Revenue chart by period, updated automatically' },
      { situation: 'Clients who stopped coming', before: "You don't know who left", after: 'List of inactive clients with date of last visit' },
      { situation: 'Per-staff scheduling', before: 'One shared schedule for everyone — conflicts guaranteed', after: 'Each staff member has their own schedule and services' },
    ],
    featuresHeadline: 'Everything your pet shop needs',
    featuresSub: 'Set up in an afternoon and start using it the same day.',
    features: [
      { emoji: '📅', title: 'Smart scheduling', body: 'Book baths, grooming, and consultations without double-booking — confirm with the owner in 2 taps.' },
      { emoji: '🐶', title: 'Client and pet profiles', body: 'Breed, coat, allergies, vaccines. Everything at hand when the owner walks in.' },
      { emoji: '✂️', title: 'Service catalog', body: 'Set up baths, grooming, and packages with exact pricing — no more mental math.' },
      { emoji: '📊', title: 'Daily revenue and KPIs', body: 'See what came in, which services sold most, and who your best clients are.' },
      { emoji: '👩‍💼', title: 'Per-staff services', body: 'Define which services each staff member performs. Receptionists book the right person every time — zero overbooking.' },
      { emoji: '🕐', title: 'Individual schedules per staff', body: 'Set separate start, end, and days off for each team member. The system auto-blocks unavailable staff.' },
    ],
    testimonialsHeadline: 'Pet shop owners who left the spreadsheet behind',
    testimonialsSub: 'Swipe to see more →',
    testimonials: [
      { name: 'Carla Meneses', city: 'Belo Horizonte, Brazil 🇧🇷', text: 'I used to write everything in a notebook and constantly missed slots. In the first month with PetFlow, I stopped double-booking and discovered my hygiene groom was my most profitable service. The monthly fee pays for itself.' },
      { name: 'Ana Rodrigues', city: 'Lisbon, Portugal 🇵🇹', text: 'I had everything in a paper diary and missed confirmations every week. Now PetFlow notifies clients automatically — no-shows dropped to zero. I wouldn\'t go back.' },
      { name: 'Tyler B.', city: 'Austin, TX 🇺🇸', text: 'Was using group chats and sticky notes to manage appointments. PetFlow changed everything — clients book, I get notified, and my revenue dashboard shows exactly what\'s working. Worth every penny.' },
      { name: 'Rogério Tavares', city: 'Campinas, Brazil 🇧🇷', text: 'My shop is small — just me and two groomers. I thought a system would be complicated, but I had everything set up in an afternoon. Best part: opening my phone in the morning and seeing the full day schedule, no WhatsApp chaos.' },
      { name: 'Jessica W.', city: 'Miami, FL 🇺🇸', text: 'I manage a grooming salon with 4 groomers and the old spreadsheet was a nightmare. PetFlow gave each groomer their own schedule. No more double bookings, no more angry clients at the door.' },
      { name: 'Juliana Martins', city: 'Pet Space · Campinas, Brazil 🇧🇷', text: 'We had 3 groomers sharing one calendar — it was a mess every week. With PetFlow each has their own schedule and services. The receptionist always knows exactly who does what. Fewer complaints and better revenue.' },
      { name: 'Miguel Ferreira', city: 'Porto, Portugal 🇵🇹', text: 'My vet clinic grew fast and a paper calendar just couldn\'t keep up. PetFlow organized everything — each vet with their own hours, every client with their pet\'s full profile. Looks professional, works even better.' },
    ],
    priceHeadline: 'One plan. Everything included.',
    priceSub: 'Flat rate · All features · No hidden fees, no surprises.',
    priceDisplay: '$19.90',
    pricePeriod: '/month · Cancel anytime',
    priceFeatures: [
      'Smart scheduling with no double-booking',
      'Client and pet profiles with full history',
      'Unlimited service catalog and packages',
      'Daily revenue dashboard and KPIs',
      'Per-staff scheduling with individual hours and services',
      'Works on phone, tablet, or computer',
      'Human support, for real',
      'Your data on secure servers — always available',
      '🛡️ 7-day money-back guarantee',
    ],
    ctaLabel: 'Start now — $19.90/month',
    guaranteeTitle: '7-day guarantee — zero risk',
    guaranteeBody: "If you're not satisfied within 7 days, we refund 100% of your payment. No questions, no hassle. It's your right under",
    guaranteeLegal: 'consumer protection law',
    guaranteeLegalSuffix: '— and we honor it gladly.',
    trustItems: [
      { title: 'Your data is yours', body: 'Export clients, pets, and history at any time, in any format. You are never locked in.' },
      { title: 'Works on any screen', body: 'Phone, tablet, laptop. Nothing to install — just open a browser and log in.' },
      { title: 'GDPR-ready from day 1', body: "Your clients' data is protected by law. No information is ever sold or shared." },
    ],
    faqHeadline: 'Frequently asked questions',
    faqs: [
      { q: 'Do I need to install anything?', a: 'No. PetFlow runs directly in the browser on any device. Just log in and use it.' },
      { q: 'Is there a contract or cancellation fee?', a: 'None. Pay month-to-month and cancel whenever you want, no strings attached.' },
      { q: 'If I cancel, do I lose my data?', a: 'No. Your data stays safe on our servers and our team helps you export everything before cancellation.' },
      { q: 'Can I migrate my current schedule?', a: 'Yes. We help you get your clients and pets set up in the first week, even if everything is in a notebook or WhatsApp.' },
      { q: 'Does it work for a small shop with 1 or 2 staff?', a: 'It was built for exactly that. PetFlow is designed for the owner who works the counter and needs something simple, fast, and out of the way.' },
      { q: "What if I don't like it? Is there a guarantee?", a: 'Yes. You have a full 7-day guarantee. If you are not satisfied for any reason, we refund 100% — no questions, no hassle.' },
    ],
    ctaFinalHeadline: 'Your next appointment can be organized starting today.',
    ctaFinalSub: '$19.90/month to keep your schedule, team, and cash flow in one place. Activate now and start using it today.',
    ctaFinalGuarantee: '🛡️ 7-day guarantee — not happy, we refund everything. No questions.',
    footerLogin: 'Log in',
    supportEmail: 'support@getpetflow.com',
  },
} as const

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function LandingPage() {
  const hdrs = await headers()
  const { locale, currency } = detectLocale(hdrs)
  const base = COPY[locale]
  // en locale serves both EUR (Europe non-PT) and USD (rest of world) — patch price strings
  const c = (locale === 'en' && currency === 'EUR')
    ? {
        ...base,
        badge: '🆕 Per-staff scheduling available · €19.90/mo · Cancel anytime',
        priceDisplay: '€19,90',
        pricePeriod: '/month · Cancel anytime',
        ctaLabel: 'Start now — €19.90/month',
        ctaFinalSub: '€19.90/month to keep your schedule, team, and cash flow in one place. Activate now and start using it today.',
      }
    : { ...base }

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">

      {/* ── Navbar ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur dark:border-gray-800 dark:bg-gray-950/90">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <span className="text-lg font-bold tracking-tight">🐾 PetFlow</span>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
              {c.navLogin}
            </Link>
            <CheckoutButton label={c.navCta} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" currency={currency} />
          </div>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50 px-4 py-20 text-center dark:from-emerald-950/30 dark:via-gray-950 dark:to-teal-950/20 md:py-28">
        <div className="mx-auto max-w-3xl">
          <span className="mb-4 inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
            {c.badge}
          </span>
          <h1 className="mb-5 text-4xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white md:text-5xl lg:text-6xl">
            {c.heroSupport}{' '}
            <br className="hidden sm:block" />
            <TypingHeadline phrases={[...c.heroTypingPhrases]} />
          </h1>
          <p className="mx-auto mb-8 max-w-xl text-lg text-gray-600 dark:text-gray-400">
            {c.heroSub}
          </p>
          <CheckoutButton label={c.ctaLabel} className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30" currency={currency} />
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-500">
            {c.heroGuarantee}
          </p>
        </div>
      </section>

      {/* ── Barra de prova social ───────────────────────────────── */}
      <section className="border-y border-gray-100 bg-white py-6 dark:border-gray-800 dark:bg-gray-950">
        <div className="mx-auto max-w-4xl px-4">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {c.statsItems.map((s, i) => {
              const icons = [ClockIcon, CheckIcon, SmartphoneIcon, ShieldCheckIcon]
              const IconOrEmoji = icons[i]
              return (
                <div key={s.label} className="flex flex-col items-center gap-1 text-center">
                  {typeof IconOrEmoji === 'string' ? (
                    <span className="text-xl">{IconOrEmoji}</span>
                  ) : (
                    <IconOrEmoji className="size-5 text-emerald-600" />
                  )}
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Problemas ──────────────────────────────────────────── */}
      <section className="bg-gray-50 px-4 py-16 dark:bg-gray-900/40">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-10 text-center text-2xl font-bold md:text-3xl">{c.problemHeadline}</h2>
          <div className="grid gap-5 md:grid-cols-3">
            {c.problems.map((item) => (
              <div key={item.title} className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                <div className="mb-3 text-3xl">{item.emoji}</div>
                <h3 className="mb-2 font-semibold">{item.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Comparativo ────────────────────────────────────────── */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-3 text-center text-2xl font-bold md:text-3xl">
            {c.comparisonHeadline}
          </h2>
          <p className="mb-10 text-center text-sm text-gray-500 dark:text-gray-400">
            {c.comparisonSub}
          </p>
          <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <div className="min-w-[540px] overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-3 border-b border-gray-200 dark:border-gray-700">
              <div className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-400">{locale === 'en' ? 'Situation' : 'Situação'}</div>
              <div className="border-x border-gray-200 bg-red-50 p-4 text-center text-sm font-semibold text-red-600 dark:border-gray-700 dark:bg-red-950/30 dark:text-red-400">
                {c.comparisonBefore}
              </div>
              <div className="bg-emerald-50 p-4 text-center text-sm font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                {c.comparisonAfter}
              </div>
            </div>
            {c.comparisonRows.map((row, i) => (
              <div key={row.situation} className={`grid grid-cols-3 border-b border-gray-100 last:border-0 dark:border-gray-800 ${i % 2 === 1 ? 'bg-gray-50/50 dark:bg-gray-900/20' : ''}`}>
                <div className="p-4 text-sm font-medium text-gray-700 dark:text-gray-300">{row.situation}</div>
                <div className="border-x border-gray-100 p-4 text-center text-sm text-red-500 dark:border-gray-800 dark:text-red-400">{row.before}</div>
                <div className="p-4 text-center text-sm text-emerald-700 dark:text-emerald-400">{row.after}</div>
              </div>
            ))}
          </div>
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────── */}
      <section className="bg-gray-50 px-4 py-16 dark:bg-gray-900/40">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-3 text-center text-2xl font-bold md:text-3xl">{c.featuresHeadline}</h2>
          <p className="mb-10 text-center text-gray-500 dark:text-gray-400">{c.featuresSub}</p>
          <div className="grid gap-6 md:grid-cols-2">
            {c.features.map((f) => (
              <div key={f.title} className="flex gap-4 rounded-2xl border border-gray-100 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
                <span className="text-3xl">{f.emoji}</span>
                <div>
                  <h3 className="mb-1 font-semibold">{f.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{f.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Plataforma por dentro ───────────────────────────────── */}
      <PlatformShowcase locale={locale} />

      {/* ── Depoimentos ────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-emerald-50 via-white to-teal-50 py-20 dark:from-emerald-950/30 dark:via-gray-950 dark:to-teal-950/20 overflow-hidden">
        {/* decorative blobs */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-64 w-64 rounded-full bg-emerald-200/40 blur-3xl dark:bg-emerald-800/20" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-teal-200/40 blur-3xl dark:bg-teal-800/20" />

        <div className="relative mx-auto max-w-6xl px-4">
          <h2 className="mb-2 text-center text-2xl font-bold md:text-3xl">
            {c.testimonialsHeadline}
          </h2>
          <p className="mb-12 text-center text-sm text-gray-500 dark:text-gray-400">{c.testimonialsSub}</p>

          {/* staggered masonry-style grid */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {c.testimonials.map((t, i) => {
              const rotations = ['-rotate-1', 'rotate-1', '-rotate-2', 'rotate-2', '-rotate-1', 'rotate-1', '-rotate-2']
              const tops = ['mt-0', 'mt-6', 'mt-3', 'mt-8', 'mt-2', 'mt-5', 'mt-1']
              return (
                <div
                  key={t.name}
                  className={`group relative cursor-default rounded-2xl border border-white/80 bg-white p-6 shadow-md transition-all duration-300 ease-out hover:scale-105 hover:rotate-0 hover:shadow-xl hover:z-10 dark:border-gray-700/60 dark:bg-gray-800/90 ${rotations[i % rotations.length]} ${tops[i % tops.length]}`}
                >
                  {/* quote mark */}
                  <span className="absolute -top-3 left-5 text-5xl leading-none text-emerald-300 dark:text-emerald-600 select-none">"</span>

                  {/* stars */}
                  <div className="mb-3 flex gap-0.5 pt-3">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <StarIcon key={s} className="size-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  {/* text — clipped by default, full on hover */}
                  <p className="mb-5 text-sm leading-relaxed text-gray-600 line-clamp-4 group-hover:line-clamp-none transition-all duration-300 dark:text-gray-300">
                    {t.text}
                  </p>

                  {/* divider */}
                  <div className="mb-3 h-px bg-gradient-to-r from-emerald-200 via-teal-100 to-transparent dark:from-emerald-800 dark:via-teal-900" />

                  {/* author */}
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{t.name}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{t.city}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="mt-10 flex justify-center gap-2">
          {[0,1,2].map((i) => (
            <span key={i} className="inline-block h-1.5 w-6 rounded-full bg-emerald-400/60 dark:bg-emerald-700" />
          ))}
        </div>
      </section>

      {/* ── Preço ──────────────────────────────────────────────── */}
      <section className="px-4 py-16" id="preco">
        <div className="mx-auto max-w-md">
          <h2 className="mb-2 text-center text-2xl font-bold md:text-3xl">{c.priceHeadline}</h2>
          <p className="mb-8 text-center text-sm text-gray-500 dark:text-gray-400">{c.priceSub}</p>
          <div className="rounded-3xl border-2 border-emerald-500 p-8 shadow-xl shadow-emerald-100 dark:shadow-emerald-900/20">
            <div className="mb-6 text-center">
              <p className="text-5xl font-bold text-gray-900 dark:text-white">{c.priceDisplay}</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{c.pricePeriod}</p>
            </div>
            <ul className="mb-8 space-y-3">
              {c.priceFeatures.map((b) => (
                <li key={b} className="flex items-start gap-3 text-sm">
                  <CheckIcon className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  {b}
                </li>
              ))}
            </ul>
            <CheckoutButton label={c.ctaLabel} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" currency={currency} />
          </div>
        </div>
      </section>

      {/* ── Garantia ───────────────────────────────────────────── */}
      <section className="px-4 py-10 bg-white dark:bg-gray-950">
        <div className="mx-auto max-w-xl">
          <div className="flex items-start gap-4 rounded-2xl border-2 border-emerald-200 bg-emerald-50 px-6 py-6 dark:border-emerald-800 dark:bg-emerald-950/40">
            <span className="text-4xl shrink-0">🛡️</span>
            <div>
              <p className="font-bold text-gray-900 dark:text-white text-lg mb-1">{c.guaranteeTitle}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {c.guaranteeBody}{' '}
                <strong>{c.guaranteeLegal}</strong>{' '}
                {c.guaranteeLegalSuffix}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust ──────────────────────────────────────────────── */}
      <section className="bg-gray-50 px-4 py-12 dark:bg-gray-900/40">
        <div className="mx-auto max-w-3xl">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { icon: ShieldCheckIcon, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/40', ...c.trustItems[0] },
              { icon: SmartphoneIcon, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/40', ...c.trustItems[1] },
              { icon: TrendingUpIcon, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-950/40', ...c.trustItems[2] },
            ].map((item) => (
              <div key={item.title} className={`rounded-2xl ${item.bg} p-5`}>
                <item.icon className={`mb-3 size-5 ${item.color}`} />
                <h3 className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-400">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────── */}
      <section className="bg-white px-4 py-16 dark:bg-gray-950">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-10 text-center text-2xl font-bold md:text-3xl">{c.faqHeadline}</h2>
          <div className="space-y-4">
            {c.faqs.map((item) => (
              <details key={item.q} className="group rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
                <summary className="cursor-pointer list-none font-medium">{item.q}</summary>
                <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Final ──────────────────────────────────────────── */}
      <section className="bg-emerald-600 px-4 py-20 text-center dark:bg-emerald-800">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
            {c.ctaFinalHeadline}
          </h2>
          <p className="mb-8 text-emerald-100">
            {c.ctaFinalSub}
          </p>
          <CheckoutButton label={c.ctaLabel} className="bg-white text-emerald-700 hover:bg-emerald-50 px-8 shadow-lg" currency={currency} />
          <p className="mt-4 text-sm text-emerald-200">
            {c.ctaFinalGuarantee}
          </p>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 px-4 py-8 text-center text-xs text-gray-400 dark:border-gray-800">
        <p>© {new Date().getFullYear()} PetFlow · {locale === 'en' ? 'All rights reserved' : locale === 'pt-PT' ? 'Todos os direitos reservados' : 'Todos os direitos reservados'}</p>
        <p className="mt-1">
          <Link href="/login" className="hover:underline">{c.footerLogin}</Link>
          {' · '}
          <a href={`mailto:${c.supportEmail}`} className="hover:underline">{c.supportEmail}</a>
        </p>
      </footer>
    </div>
  )
}
