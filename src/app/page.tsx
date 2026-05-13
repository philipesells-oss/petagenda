import { Suspense } from 'react'
import { headers } from 'next/headers'
import Link from 'next/link'
import { CheckIcon, StarIcon, ShieldCheckIcon, SmartphoneIcon, ClockIcon, TrendingUpIcon, CheckCircleIcon } from 'lucide-react'
import { CheckoutButton } from '@/components/landing/checkout-button'
import { PricingToggle } from '@/components/landing/pricing-toggle'
import { RefCapture } from '@/components/landing/ref-capture'
import { TypingHeadline } from '@/components/landing/typing-headline'
import { PlatformShowcase } from '@/components/landing/platform-showcase'
import { MobileCta } from '@/components/landing/mobile-cta'
import { FaqAccordion } from '@/components/landing/faq-accordion'
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
    badge: '📲 Clientes agendam pelo QR Code — sem WhatsApp · R$29,90/mês · Cancele quando quiser',
    heroSupport: 'Você não abriu um pet shop pra gerenciar WhatsApp.',
    heroTypingPhrases: ['Seu cliente escaneia e agenda sozinho.', 'Zero conflito de horário.', 'Mais dinheiro no caixa.'],
    heroSub: 'O PetFlow dá ao seu pet shop uma página própria de agendamento online com QR Code — o cliente escaneia, escolhe o serviço, o profissional e o horário, e confirma. Sem ligar pra você, sem WhatsApp, sem confusão.',
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
      { situation: 'Cliente quer marcar um banho', before: 'Te manda mensagem no WhatsApp e espera você responder', after: 'Escaneia o QR Code e agenda sozinho, 24h por dia' },
      { situation: 'Lembrar o histórico do pet', before: 'Pergunta tudo de novo a cada visita', after: 'Ficha completa com raça, alergias e todos os banhos anteriores' },
      { situation: 'Saber o faturamento do dia', before: 'Soma no caderno ou na maquininha no final do dia', after: 'Dashboard em tempo real, atualizado a cada serviço concluído' },
      { situation: 'Saber quais serviços mais vendem', before: 'Achismo ou planilha desatualizada', after: 'Gráfico de faturamento por período, atualizado a cada serviço concluído' },
      { situation: 'Clientes que sumiram', before: 'Não sabe quem parou de vir', after: 'Lista de inativos com data da última visita' },
      { situation: 'Agenda por profissional', before: 'Um único horário pra todo mundo — conflito na certa', after: 'Cada profissional com sua grade, seus serviços e sua disponibilidade' },
    ],
    featuresHeadline: 'Tudo que seu pet shop precisa',
    featuresSub: 'Em menos de uma tarde você configura e já começa a usar.',
    features: [
      { emoji: '📲', title: 'Agendamento online com QR Code', body: 'Seu pet shop ganha uma página de agendamento pública. Imprima o QR Code e cole no balcão — o cliente escaneia e agenda sem precisar te chamar.' },
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
      { name: 'Carla Meneses', city: 'Belo Horizonte, MG 🇧🇷', text: 'No primeiro mês com o PetFlow, zero conflitos de horário — antes tinha pelo menos 2 ou 3 por semana. Descobri que minha tosa higiênica respondia por 38% da receita e eu estava cobrando barato. Subi 15% e os clientes nem piscaram. Pago os R$29,90 sem pensar.' },
      { name: 'Ana Rodrigues', city: 'Lisboa, Portugal 🇵🇹', text: 'Tinha tudo numa agenda de papel e esquecia confirmações toda semana. Agora o PetFlow avisa os clientes automaticamente — as faltas caíram a zero. Não troco por nada.' },
      { name: 'Rogério Tavares', city: 'Campinas, SP 🇧🇷', text: 'Somos eu e mais duas tosadoras. Em menos de 2 horas já tava tudo cadastrado. Antes eu perdia pelo menos 1 cliente por mês por confusão de horário — agora não perco mais. Abro o celular de manhã e a agenda do dia tá toda lá, sem bagunça no WhatsApp.' },
      { name: 'Jessica W.', city: 'Miami, FL 🇺🇸', text: '4 tosadoras, pelo menos 3 conflitos por semana com a planilha antiga. O PetFlow zerou tudo — zero conflitos em 5 meses. Nunca mais tive cliente na porta no horário errado.' },
      { name: 'Juliana Martins', city: 'Pet Space · Campinas, SP 🇧🇷', text: '3 tosadoras, 1 agenda pra todo mundo — toda semana pelo menos 1 conflito. Com o PetFlow cada uma tem seu próprio horário e seus próprios serviços. Em 3 meses, zero conflitos. O caixa melhorou uns 20% só porque paramos de perder cliente por bagunça.' },
      { name: 'Miguel Ferreira', city: 'Porto, Portugal 🇵🇹', text: 'A minha clínica veterinária cresceu muito e a agenda em papel já não dava. O PetFlow organizou tudo — cada médico com os seus horários, cada cliente com a ficha do animal. Muito profissional.' },
      { name: 'Tyler B.', city: 'Austin, TX 🇺🇸', text: 'Tinha conflito de horário quase toda semana. O PetFlow zerou isso em 4 meses. O dashboard mostrou que eu estava cobrando barato em 3 serviços — corrigi na hora. Receita subiu 18% em 60 dias. Vale cada centavo.' },
    ],
    priceHeadline: 'Um plano. Tudo incluído.',
    priceSub: 'Valor único · Tudo incluso · Sem pegadinha, sem surpresa na fatura.',
    priceDisplay: 'R$29,90',
    pricePeriod: '/mês · Cancele quando quiser',
    priceAnnualDisplay: 'R$299',
    priceAnnualPeriod: '/ano · 2 meses grátis',
    priceAnnualMonthly: 'equivale a R$24,92/mês',
    priceLabelMonthly: 'Mensal',
    priceLabelAnnual: 'Anual',
    priceBadgeAnnual: '2 meses grátis',
    ctaLabelAnnual: 'Quero começar por R$299/ano',
    priceFeatures: [
      'Agendamento online com link público e QR Code imprimível',
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
      { q: 'Como funciona o agendamento online?', a: 'Você recebe um link único e um QR Code imprimível no seu painel. Cole no balcão, poste no Instagram ou mande pelo WhatsApp. O cliente abre pelo celular, escolhe o serviço, o profissional e um horário disponível, e confirma. O agendamento entra direto no sistema — sem precisar falar com você.' },
      { q: 'Preciso instalar alguma coisa?', a: 'Não. O PetFlow funciona direto no navegador do celular, tablet ou computador. Basta fazer login e usar.' },
      { q: 'Tem fidelidade ou multa pra cancelar?', a: 'Nenhuma. Você paga mês a mês e cancela quando quiser, sem burocracia.' },
      { q: 'E se eu cancelar — perco meus dados?', a: 'Não. Seus dados ficam seguros nos nossos servidores e nossa equipe te ajuda a extrair tudo antes do cancelamento. Clientes, pets, histórico — tudo seu, sempre.' },
      { q: 'Consigo migrar minha agenda atual?', a: 'Sim. A gente te ajuda a cadastrar seus clientes e pets na primeira semana, mesmo que esteja tudo no caderno ou no WhatsApp.' },
      { q: 'Funciona pra pet shop pequeno, com 1 ou 2 funcionários?', a: 'Foi feito pra isso. O PetFlow foi desenhado pro dono que atende no balcão e precisa de algo simples, rápido e que não atrapalhe o dia.' },
      { q: 'E se eu não gostar? Tem garantia?', a: 'Sim. Você tem 7 dias de garantia total. Se não ficar satisfeito por qualquer motivo, devolvemos 100% do valor pago — sem perguntas e sem burocracia. É seu direito pelo Código de Defesa do Consumidor (Art. 49) e a gente cumpre com prazer.' },
    ],
    howItWorksHeadline: 'Do QR Code ao horário confirmado em menos de 1 minuto',
    howItWorksSub: 'Sem app pra baixar. Sem cadastro. Sem WhatsApp.',
    howItWorksSteps: [
      { emoji: '📷', title: 'Escaneia o QR Code', body: 'O QR Code fica no balcão, no Instagram ou no WhatsApp do seu pet shop.' },
      { emoji: '✂️', title: 'Escolhe serviço e profissional', body: 'Vê os serviços disponíveis, o preço e escolhe quem vai atender.' },
      { emoji: '📅', title: 'Escolhe data e horário livre', body: 'Só aparecem horários realmente disponíveis — zero conflito garantido.' },
      { emoji: '✅', title: 'Confirma e pronto', body: 'O agendamento entra direto no sistema. Você recebe o aviso. Cliente fica tranquilo.' },
    ],
    howItWorksNote: '🛡️ Funciona no celular, sem instalar nada — o cliente abre pelo navegador e agenda em segundos.',
    referralHeadline: 'Indique e ganhe 1 mês grátis',
    referralSub: 'Cada amigo dono de pet shop que assinar usando o seu link = 1 mês 100% grátis pra você. Automático, sem precisar pedir.',
    referralSteps: [
      { emoji: '🔑', title: 'Assine o PetFlow', body: 'Ao ativar, você recebe um link exclusivo de indicação no painel.' },
      { emoji: '📤', title: 'Compartilhe com amigos', body: 'Mande pra colegas donos de pet shop — WhatsApp, Instagram, boca a boca.' },
      { emoji: '🎁', title: 'Eles assinam, você ganha', body: '1 mês grátis por cada novo assinante. Sem limite de indicações.' },
    ],
    referralBadge: 'Sem limite · Acumula · 100% automático',
    referralCta: 'Assinar e ganhar meu link',
    ctaFinalHeadline: 'Seu próximo banho pode já sair organizado.',
    ctaFinalSub: 'R$29,90/mês pra ter agenda, equipe e caixa organizados num só lugar. Ative agora e comece a usar hoje mesmo.',
    ctaFinalGuarantee: '🛡️ Garantia de 7 dias — não gostou, devolvemos tudo. Sem perguntas.',
    footerLogin: 'Entrar',
    supportEmail: 'suporte@getpetflow.com',
  },

  'pt-PT': {
    badge: '📲 Clientes marcam pelo QR Code — sem WhatsApp · €19,90/mês · Cancele quando quiser',
    heroSupport: 'Não abriu um petshop para gerir mensagens no WhatsApp.',
    heroTypingPhrases: ['Digitalizou. Escolheu. Marcou.', 'Zero conflitos de horários.', 'Mais dinheiro no caixa.'],
    heroSub: 'O PetFlow dá ao seu petshop uma página pública de marcação com QR Code — o cliente digitaliza, escolhe o serviço, o profissional e o horário, e confirma. Sem ligar, sem WhatsApp, sem confusão.',
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
      { situation: 'Cliente quer marcar um banho', before: 'Envia mensagem no WhatsApp e espera você responder', after: 'Digitaliza o QR Code e marca sozinho, 24h por dia' },
      { situation: 'Lembrar o historial do animal', before: 'Pergunta tudo de novo a cada visita', after: 'Ficha completa com raça, alergias e todos os banhos anteriores' },
      { situation: 'Saber o faturamento do dia', before: 'Soma no caderno ou no terminal no fim do dia', after: 'Dashboard em tempo real, atualizado a cada serviço concluído' },
      { situation: 'Saber quais serviços mais vendem', before: 'Achismo ou folha de cálculo desatualizada', after: 'Gráfico de faturamento por período, atualizado a cada serviço concluído' },
      { situation: 'Clientes que desapareceram', before: 'Não sabe quem deixou de vir', after: 'Lista de inativos com data da última visita' },
      { situation: 'Agenda por profissional', before: 'Um único horário para todos — conflito garantido', after: 'Cada profissional com a sua grelha, os seus serviços e a sua disponibilidade' },
    ],
    featuresHeadline: 'Tudo o que o seu petshop precisa',
    featuresSub: 'Em menos de uma tarde configura e já começa a usar.',
    features: [
      { emoji: '📲', title: 'Marcação online com QR Code', body: 'O seu petshop ganha uma página de marcação pública. Imprima o QR Code e cole no balcão — o cliente digitaliza e marca sem precisar de ligar.' },
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
      { name: 'Carla Meneses', city: 'Belo Horizonte, Brasil 🇧🇷', text: 'No primeiro mês com o PetFlow, zero conflitos de horário — antes tinha pelo menos 2 ou 3 por semana. Descobri que a tosquia higiénica correspondia a 38% da receita e estava a cobrar barato. Subi 15% e os clientes nem deram por isso. Pago sem pensar.' },
      { name: 'Ana Rodrigues', city: 'Lisboa, Portugal 🇵🇹', text: 'Tinha tudo numa agenda de papel e esquecia confirmações toda a semana. Agora o PetFlow avisa os clientes automaticamente — as faltas caíram a zero. Não troco por nada.' },
      { name: 'Rogério Tavares', city: 'Campinas, Brasil 🇧🇷', text: 'Somos eu e mais duas tosadoras. Em menos de 2 horas já estava tudo registado. Antes perdia pelo menos 1 cliente por mês por confusão de horários — agora não perco mais. Abro o telemóvel de manhã e a agenda do dia está toda lá, sem confusão no WhatsApp.' },
      { name: 'Jessica W.', city: 'Miami, FL 🇺🇸', text: '4 tosadores, pelo menos 3 conflitos por semana com a folha de cálculo antiga. O PetFlow eliminou tudo — zero conflitos em 5 meses. Nunca mais tive um cliente à porta no horário errado.' },
      { name: 'Juliana Martins', city: 'Pet Space · Campinas, Brasil 🇧🇷', text: '3 tosadoras, 1 agenda para toda a gente — todas as semanas pelo menos 1 conflito. Com o PetFlow cada uma tem o seu próprio horário e os seus próprios serviços. Em 3 meses, zero conflitos. O caixa melhorou uns 20% só porque deixámos de perder clientes por confusão.' },
      { name: 'Miguel Ferreira', city: 'Porto, Portugal 🇵🇹', text: 'A minha clínica veterinária cresceu muito e a agenda em papel já não chegava. O PetFlow organizou tudo — cada médico com os seus horários, cada cliente com a ficha do animal. Muito profissional.' },
      { name: 'Tyler B.', city: 'Austin, TX 🇺🇸', text: 'Tinha conflitos de horário quase todas as semanas. O PetFlow resolveu isso em 4 meses. O dashboard mostrou que estava a cobrar barato em 3 serviços — corrigi de imediato. A receita subiu 18% em 60 dias. Vale cada cêntimo.' },
    ],
    priceHeadline: 'Um plano. Tudo incluído.',
    priceSub: 'Valor único · Tudo incluído · Sem surpresas na fatura.',
    priceDisplay: '€19,90',
    pricePeriod: '/mês · Cancele quando quiser',
    priceAnnualDisplay: '€199',
    priceAnnualPeriod: '/ano · 2 meses grátis',
    priceAnnualMonthly: 'equivale a €16,58/mês',
    priceLabelMonthly: 'Mensal',
    priceLabelAnnual: 'Anual',
    priceBadgeAnnual: '2 meses grátis',
    ctaLabelAnnual: 'Quero começar por €199/ano',
    priceFeatures: [
      'Marcação online com link público e QR Code imprimível',
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
      { q: 'Como funciona a marcação online?', a: 'Recebe um link único e um QR Code imprimível no seu painel. Cole no balcão, publique no Instagram ou envie pelo WhatsApp. O cliente abre pelo telemóvel, escolhe o serviço, o profissional e um horário disponível, e confirma. A marcação entra direto no sistema — sem precisar de falar consigo.' },
      { q: 'Preciso de instalar alguma coisa?', a: 'Não. O PetFlow funciona diretamente no browser do telemóvel, tablet ou computador. Basta fazer login e usar.' },
      { q: 'Tem fidelidade ou multa para cancelar?', a: 'Nenhuma. Paga mês a mês e cancela quando quiser, sem burocracia.' },
      { q: 'Se cancelar, perco os meus dados?', a: 'Não. Os seus dados ficam seguros nos nossos servidores e a nossa equipa ajuda-o a extrair tudo antes do cancelamento.' },
      { q: 'Consigo migrar a minha agenda atual?', a: 'Sim. Ajudamos a registar os seus clientes e animais na primeira semana, mesmo que esteja tudo em papel ou no WhatsApp.' },
      { q: 'Funciona para um petshop pequeno, com 1 ou 2 funcionários?', a: 'Foi feito para isso. O PetFlow foi desenhado para o dono que atende no balcão e precisa de algo simples, rápido e que não atrapalhe o dia.' },
      { q: 'E se não gostar? Há garantia?', a: 'Sim. Tem 7 dias de garantia total. Se não ficar satisfeito por qualquer motivo, devolvemos 100% do valor pago — sem perguntas e sem burocracia.' },
    ],
    howItWorksHeadline: 'Do QR Code à marcação confirmada em menos de 1 minuto',
    howItWorksSub: 'Sem app para instalar. Sem conta. Sem WhatsApp.',
    howItWorksSteps: [
      { emoji: '📷', title: 'Digitaliza o QR Code', body: 'O QR Code fica no balcão, no Instagram ou no WhatsApp do petshop.' },
      { emoji: '✂️', title: 'Escolhe serviço e profissional', body: 'Vê os serviços disponíveis, o preço e escolhe quem vai atender.' },
      { emoji: '📅', title: 'Escolhe data e horário livre', body: 'Só aparecem horários realmente disponíveis — zero conflitos garantidos.' },
      { emoji: '✅', title: 'Confirma e pronto', body: 'A marcação entra direto no sistema. É notificado, o cliente fica descansado.' },
    ],
    howItWorksNote: '🛡️ Funciona no browser do telemóvel — sem instalar nada, sem conta, sem fricção.',
    referralHeadline: 'Indique e ganhe 1 mês grátis',
    referralSub: 'Cada amigo dono de petshop que subscrever com o seu link = 1 mês 100% grátis para si. Automático, sem precisar pedir.',
    referralSteps: [
      { emoji: '🔑', title: 'Subscreva o PetFlow', body: 'Ao ativar, recebe um link exclusivo de indicação no painel.' },
      { emoji: '📤', title: 'Partilhe com amigos', body: 'Envie a colegas donos de petshop — WhatsApp, Instagram, onde preferir.' },
      { emoji: '🎁', title: 'Eles subscrevem, você ganha', body: '1 mês grátis por cada novo subscritor. Sem limite de indicações.' },
    ],
    referralBadge: 'Sem limite · Acumula · 100% automático',
    referralCta: 'Subscrever e ganhar o meu link',
    ctaFinalHeadline: 'A sua próxima marcação pode sair já organizada.',
    ctaFinalSub: '€19,90/mês para ter agenda, equipa e caixa organizados num só lugar. Ative agora e comece a usar hoje mesmo.',
    ctaFinalGuarantee: '🛡️ Garantia de 7 dias — não gostou, devolvemos tudo. Sem perguntas.',
    footerLogin: 'Entrar',
    supportEmail: 'suporte@getpetflow.com',
  },

  en: {
    badge: '📲 Clients self-book via QR Code — no phone calls · $19.90/mo · Cancel anytime',
    heroSupport: "You didn't open a pet shop to manage text messages.",
    heroTypingPhrases: ['Scan. Choose. Booked.', 'Zero double-bookings.', 'More money in the register.'],
    heroSub: 'PetFlow gives your shop its own public booking page with a printable QR Code — clients scan, pick the service, the groomer, and the time slot, and confirm. No calls, no WhatsApp, no confusion.',
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
      { situation: 'Client wants to book a bath', before: 'Texts you on WhatsApp and waits for you to reply', after: 'Scans the QR Code and books themselves, 24/7' },
      { situation: "Remember the pet's history", before: 'Ask everything again on every visit', after: 'Full profile with breed, allergies, and all previous visits' },
      { situation: "Today's revenue", before: 'Count entries at end of day on the terminal', after: 'Real-time dashboard updated after each completed service' },
      { situation: 'Best-selling services', before: 'Guesswork or an outdated spreadsheet', after: 'Revenue chart by period, updated automatically' },
      { situation: 'Clients who stopped coming', before: "You don't know who left", after: 'List of inactive clients with date of last visit' },
      { situation: 'Per-staff scheduling', before: 'One shared schedule for everyone — conflicts guaranteed', after: 'Each staff member has their own schedule and services' },
    ],
    featuresHeadline: 'Everything your pet shop needs',
    featuresSub: 'Set up in an afternoon and start using it the same day.',
    features: [
      { emoji: '📲', title: 'Public booking + QR Code', body: 'Your shop gets its own booking page. Print the QR Code and put it on the counter — clients scan and book without calling you.' },
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
      { name: 'Carla Meneses', city: 'Belo Horizonte, Brazil 🇧🇷', text: 'In the first month with PetFlow, zero scheduling conflicts — before I had at least 2 or 3 per week. I discovered my hygiene groom accounted for 38% of revenue and I was undercharging. Raised prices 15% and clients didn\'t blink. The monthly fee pays for itself.' },
      { name: 'Ana Rodrigues', city: 'Lisbon, Portugal 🇵🇹', text: 'I had everything in a paper diary and missed confirmations every week. Now PetFlow notifies clients automatically — no-shows dropped to zero. I wouldn\'t go back.' },
      { name: 'Tyler B.', city: 'Austin, TX 🇺🇸', text: 'Had double-bookings almost every week. PetFlow fixed that — zero in 4 months. The revenue dashboard showed I was undercharging for 3 services. Fixed that immediately. Revenue up 18% in 60 days. Worth every penny.' },
      { name: 'Rogério Tavares', city: 'Campinas, Brazil 🇧🇷', text: 'My shop is small — just me and two groomers. Everything was set up in under 2 hours. I used to lose at least one client a month to scheduling confusion — not anymore. I open my phone in the morning and the full day\'s schedule is right there.' },
      { name: 'Jessica W.', city: 'Miami, FL 🇺🇸', text: '4 groomers, at least 3 double-bookings per week with the old spreadsheet. PetFlow eliminated them completely — zero conflicts in 5 months. No more angry clients showing up at the wrong time.' },
      { name: 'Juliana Martins', city: 'Pet Space · Campinas, Brazil 🇧🇷', text: '3 groomers, one shared calendar — at least one conflict every week. With PetFlow each groomer has their own schedule and services. Zero conflicts in 3 months. Revenue improved about 20% just from stopping to lose clients to scheduling chaos.' },
      { name: 'Miguel Ferreira', city: 'Porto, Portugal 🇵🇹', text: 'My vet clinic grew fast and a paper calendar just couldn\'t keep up. PetFlow organized everything — each vet with their own hours, every client with their pet\'s full profile. Looks professional, works even better.' },
    ],
    priceHeadline: 'One plan. Everything included.',
    priceSub: 'Flat rate · All features · No hidden fees, no surprises.',
    priceDisplay: '$19.90',
    pricePeriod: '/month · Cancel anytime',
    priceAnnualDisplay: '$199',
    priceAnnualPeriod: '/year · 2 months free',
    priceAnnualMonthly: 'equals $16.58/month',
    priceLabelMonthly: 'Monthly',
    priceLabelAnnual: 'Annual',
    priceBadgeAnnual: '2 months free',
    ctaLabelAnnual: 'Start now — $199/year',
    priceFeatures: [
      'Public booking page with printable QR Code',
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
      { q: 'How does the online booking work?', a: 'You get a unique link and a printable QR Code in your dashboard. Put it on the counter, post it on Instagram, or share it on WhatsApp. Clients open it on their phone, pick the service, groomer, and an available time slot, and confirm. The booking goes straight into your system — no need to talk to you.' },
      { q: 'Do I need to install anything?', a: 'No. PetFlow runs directly in the browser on any device. Just log in and use it.' },
      { q: 'Is there a contract or cancellation fee?', a: 'None. Pay month-to-month and cancel whenever you want, no strings attached.' },
      { q: 'If I cancel, do I lose my data?', a: 'No. Your data stays safe on our servers and our team helps you export everything before cancellation.' },
      { q: 'Can I migrate my current schedule?', a: 'Yes. We help you get your clients and pets set up in the first week, even if everything is in a notebook or WhatsApp.' },
      { q: 'Does it work for a small shop with 1 or 2 staff?', a: 'It was built for exactly that. PetFlow is designed for the owner who works the counter and needs something simple, fast, and out of the way.' },
      { q: "What if I don't like it? Is there a guarantee?", a: 'Yes. You have a full 7-day guarantee. If you are not satisfied for any reason, we refund 100% — no questions, no hassle.' },
    ],
    howItWorksHeadline: 'From QR Code to confirmed booking in under a minute',
    howItWorksSub: 'No app to download. No account needed. No phone call.',
    howItWorksSteps: [
      { emoji: '📷', title: 'Scan the QR Code', body: 'The QR Code lives on your counter, Instagram, or WhatsApp.' },
      { emoji: '✂️', title: 'Choose service and staff', body: 'Clients see available services, prices, and who will do the work.' },
      { emoji: '📅', title: 'Pick a free time slot', body: 'Only real available slots appear — zero double-booking guaranteed.' },
      { emoji: '✅', title: 'Confirm and done', body: 'Booking goes straight into your system. You get notified. Client is happy.' },
    ],
    howItWorksNote: '🛡️ Works on any phone browser — no install, no signup, no friction.',
    referralHeadline: 'Refer a friend, get 1 month free',
    referralSub: 'Every friend who subscribes using your link = 1 free month for you. Automatic, no questions asked.',
    referralSteps: [
      { emoji: '🔑', title: 'Subscribe to PetFlow', body: 'Once active, you get a unique referral link in your dashboard.' },
      { emoji: '📤', title: 'Share with friends', body: 'Send it to fellow pet shop owners — WhatsApp, Instagram, word of mouth.' },
      { emoji: '🎁', title: 'They subscribe, you earn', body: '1 free month per new subscriber. No limit on referrals.' },
    ],
    referralBadge: 'No limit · Stackable · 100% automatic',
    referralCta: 'Subscribe and get my link',
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
        badge: '📲 Clients self-book via QR Code — no phone calls · €19.90/mo · Cancel anytime',
        priceDisplay: '€19,90',
        pricePeriod: '/month · Cancel anytime',
        priceAnnualDisplay: '€199',
        priceAnnualPeriod: '/year · 2 months free',
        priceAnnualMonthly: 'equals €16.58/month',
        ctaLabel: 'Start now — €19.90/month',
        ctaLabelAnnual: 'Start now — €199/year',
        ctaFinalSub: '€19.90/month to keep your schedule, team, and cash flow in one place. Activate now and start using it today.',
      }
    : { ...base }

  return (
    <div className="min-h-screen bg-white text-gray-900 pb-20 md:pb-0 dark:bg-gray-950 dark:text-gray-100">
      <Suspense><RefCapture /></Suspense>

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

      {/* ── Como funciona ──────────────────────────────────────── */}
      <section className="bg-white px-4 py-16 dark:bg-gray-950">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-3 text-center text-2xl font-bold md:text-3xl">{c.howItWorksHeadline}</h2>
          <p className="mb-12 text-center text-sm text-gray-500 dark:text-gray-400">{c.howItWorksSub}</p>
          <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
            {c.howItWorksSteps.map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-3xl dark:bg-emerald-950/30">
                    {step.emoji}
                  </div>
                  <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                    {i + 1}
                  </span>
                </div>
                <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">{step.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
          <p className="mt-10 text-center text-xs text-gray-400 dark:text-gray-500">{c.howItWorksNote}</p>
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
                  <span className="absolute -top-3 left-5 text-5xl leading-none text-emerald-300 dark:text-emerald-600 select-none">&ldquo;</span>

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
                      <p className="mt-0.5 flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                        <CheckCircleIcon className="size-3" aria-hidden="true" />
                        {locale === 'en' ? 'Verified customer' : 'Cliente verificado'}
                      </p>
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
          <PricingToggle
            currency={currency}
            monthlyDisplay={c.priceDisplay}
            annualDisplay={c.priceAnnualDisplay}
            monthlyPeriod={c.pricePeriod}
            annualPeriod={c.priceAnnualPeriod}
            annualMonthly={c.priceAnnualMonthly}
            ctaMonthly={c.ctaLabel}
            ctaAnnual={c.ctaLabelAnnual}
            features={c.priceFeatures}
            labelMonthly={c.priceLabelMonthly}
            labelAnnual={c.priceLabelAnnual}
            badgeAnnual={c.priceBadgeAnnual}
          />
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
          <FaqAccordion items={c.faqs} />
        </div>
      </section>

      {/* ── Referral ───────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-emerald-50 to-teal-50 px-4 py-16 dark:from-emerald-950/30 dark:to-teal-950/20">
        <div className="mx-auto max-w-3xl text-center">
          <span className="mb-4 inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
            {c.referralBadge}
          </span>
          <h2 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
            {c.referralHeadline}
          </h2>
          <p className="mx-auto mb-10 max-w-xl text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {c.referralSub}
          </p>
          <div className="grid gap-4 md:grid-cols-3 mb-10">
            {c.referralSteps.map((step, i) => (
              <div key={i} className="rounded-2xl bg-white p-6 shadow-sm border border-emerald-100 dark:bg-gray-900 dark:border-emerald-900/50 text-left">
                <div className="mb-3 flex items-center gap-3">
                  <span className="text-2xl">{step.emoji}</span>
                  <span className="flex size-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                    {i + 1}
                  </span>
                </div>
                <h3 className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">{step.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
          <CheckoutButton label={c.referralCta} className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30" currency={currency} />
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

      {/* ── Mobile sticky CTA (mobile only) ─────────────────────── */}
      <MobileCta
        priceDisplay={c.priceDisplay}
        pricePeriodShort={locale === 'en' ? '/mo · Cancel anytime' : '/mês · Cancele quando quiser'}
        ctaLabel={locale === 'en' ? 'Start now' : 'Começar agora'}
        currency={currency}
      />
    </div>
  )
}
