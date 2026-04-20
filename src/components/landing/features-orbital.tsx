'use client'

import { RadialOrbitalTimeline, OrbitalNode } from '@/components/ui/radial-orbital-timeline'

const PETFLOW_NODES: OrbitalNode[] = [
  {
    id: 'agenda',
    emoji: '📅',
    label: 'Agenda Inteligente',
    sublabel: 'Agenda',
    details: {
      title: 'Agenda Inteligente',
      badge: 'Zero conflito de horário',
      description:
        'Marque banhos, tosas e consultas com verificação automática de disponibilidade. O sistema bloqueia sobreposições antes que aconteçam.',
      bullets: [
        'Sem conflito de horário — o sistema verifica antes de confirmar',
        'Histórico automático de todos os agendamentos por pet',
        'Confirmação de presença em 2 toques pelo WhatsApp',
        'Visão semanal e diária com status em tempo real',
      ],
    },
  },
  {
    id: 'clientes',
    emoji: '🐶',
    label: 'Ficha do Cliente & Pet',
    sublabel: 'Fichas',
    details: {
      title: 'Ficha do Cliente & Pet',
      badge: 'Histórico completo',
      description:
        'Cada tutor e seu pet com ficha completa. Na próxima visita, o atendente já sabe tudo — sem perguntar de novo.',
      bullets: [
        'Raça, pelagem, temperamento e observações do pet',
        'Registro de alergias e restrições de serviço',
        'Histórico completo de visitas com serviço e valor',
        'Foto do pet e contato rápido do tutor',
      ],
    },
  },
  {
    id: 'inativos',
    emoji: '😴',
    label: 'Clientes Inativos',
    sublabel: 'Inativos',
    details: {
      title: 'Recuperação de Clientes Inativos',
      badge: 'Receita perdida → recuperada',
      description:
        'Descubra quem parou de vir e ative sua lista de recuperação com um clique. Cada cliente inativo é dinheiro esperando voltar.',
      bullets: [
        'Lista automática de clientes sem visita há 30, 60 ou 90 dias',
        'Data exata da última visita de cada tutor',
        'Filtro por serviço — saiba quais tosas sumiram',
        'Botão de reativação direto para o WhatsApp do tutor',
      ],
    },
  },
  {
    id: 'whatsapp',
    emoji: '💬',
    label: 'WhatsApp + Templates',
    sublabel: 'WhatsApp',
    details: {
      title: 'WhatsApp + Templates Prontos',
      badge: 'Mensagens que convertem',
      description:
        'Mensagens prontas e personalizadas para cada momento do relacionamento com o cliente — sem precisar digitar do zero.',
      bullets: [
        'Template de reativação para clientes inativos',
        'Confirmação automática de agendamento no dia anterior',
        'Mensagem de pós-serviço com foto do pet (opcional)',
        'Template de retenção para clientes em risco de sumir',
      ],
    },
  },
  {
    id: 'servicos',
    emoji: '✂️',
    label: 'Catálogo de Serviços',
    sublabel: 'Serviços',
    details: {
      title: 'Catálogo de Serviços',
      badge: 'Preço certo, sempre',
      description:
        'Cadastre todos os seus serviços com preço, duração e categoria. Acabou o "calcular na ponta do lápis" na hora de cobrar.',
      bullets: [
        'Preços por tamanho do pet (pequeno, médio, grande)',
        'Duração por serviço para bloquear o horário certo na agenda',
        'Categorias: Grooming, Veterinário, Hotel & Day Care',
        'Pacotes e combos com desconto configuráveis',
      ],
    },
  },
  {
    id: 'faturamento',
    emoji: '📊',
    label: 'Faturamento & KPIs',
    sublabel: 'KPIs',
    details: {
      title: 'Faturamento & KPIs',
      badge: 'Caixa no controle',
      description:
        'Saiba exatamente quanto entrou, quais serviços mais renderam e quem são seus melhores clientes — sem planilha.',
      bullets: [
        'Receita do dia atualizada a cada serviço concluído',
        'Ranking dos serviços mais vendidos por período',
        'Clientes com maior valor gasto (ticket médio)',
        'Tendências semanais e mensais de faturamento',
      ],
    },
  },
]

export function FeaturesOrbital() {
  return (
    <section className="bg-gray-50 px-4 py-16 dark:bg-gray-900/40">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
            Tudo que seu pet shop precisa
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Em menos de uma tarde você configura e já começa a usar.
          </p>
        </div>

        {/* Orbital component */}
        <div className="flex justify-center">
          <RadialOrbitalTimeline nodes={PETFLOW_NODES} autoRotate />
        </div>
      </div>
    </section>
  )
}
