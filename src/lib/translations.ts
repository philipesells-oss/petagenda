export type Locale = 'pt-BR' | 'pt-PT' | 'en-US' | 'es'

export interface MessageTemplate {
  label: string
  msg: string
}

export interface Translations {
  nav: {
    dashboard: string
    agenda: string
    clients: string
    settings: string
    signOut: string
    whatsapp: string
  }
  topbar: {
    myAccount: string
    language: string
  }
  common: {
    save: string
    cancel: string
    edit: string
    delete: string
    back: string
    loading: string
    yes: string
    no: string
    new: string
    search: string
    active: string
    inactive: string
    blocked: string
    schedule: string
    any: string
    employee: string
    service: string
    pet: string
    noAppointments: string
    total: string
    name: string
    phone: string
    email: string
    address: string
    actions: string
  }
  clientDetail: {
    title: string
    totalSpent: string
    points: string
    visits: string
    whatsappOptIn: string
    tabs: { pets: string; history: string; messages: string }
    noPets: string
    noHistory: string
    noPetName: string
    addPet: string
    sendMessageIntro: string
    messageTemplates: MessageTemplate[]
  }
  clients: {
    title: string
    new: string
    tutor: string
    status: string
    lastVisit: string
    totalSpent: string
    phone: string
    subtitle: string
  }
  agenda: {
    title: string
    subtitle: string
    newAppointment: string
    today: string
    all: string
    outsideHours: string
    scheduleSlot: string
    schedule: string
    noAppointments: string
    slot: string
    available: string
    unavailable: string
    form: {
      title: string
      titleEdit: string
      subtitle: string
      client: string
      searchClient: string
      pet: string
      selectClientFirst: string
      service: string
      selectService: string
      employee: string
      anyEmployee: string
      time: string
      date: string
      price: string
      notes: string
      notesPlaceholder: string
      cancel: string
      submit: string
      saving: string
      noSlotsAvailable: string
    }
    status: {
      scheduled: string
      confirmed: string
      inProgress: string
      completed: string
      cancelled: string
      noShow: string
    }
    detail: {
      title: string
      confirmAction: string
      startAction: string
      completeAction: string
      cancelAction: string
      noShowAction: string
      employee: string
      unassigned: string
      price: string
      notes: string
      history: string
    }
  }
  dashboard: {
    title: string
    today: string
    revenue: string
    appointments: string
    clients: string
    newClients: string
    thisMonth: string
    topServices: string
    welcome: string
    summary: string
  }
  settings: {
    title: string
    subtitle: string
    profile: string
    profileSubtitle: string
    hours: string
    hoursSubtitle: string
    services: string
    servicesSubtitle: string
    team: string
    teamSubtitle: string
    save: string
    shopName: string
    phone: string
    address: string
    open: string
    closed: string
    copyWeekdays: string
    profileTitle: string
    profilePageSubtitle: string
    hoursTitle: string
    hoursPageSubtitle: string
    servicesTitle: string
    servicesPageSubtitle: string
    teamTitle: string
    teamPageSubtitle: string
  }
  whatsapp: {
    title: string
    subtitle: string
    templatesTitle: string
    templatesSubtitle: string
    logsTitle: string
    logsSubtitle: string
    noConfig: string
    saveConfig: string
    instanceId: string
    token: string
    connecting: string
    connectedSince: string
    templates: string
    logs: string
    connect: string
    disconnect: string
    status: { connected: string; disconnected: string; connecting: string }
  }
  onboarding: {
    welcome: string
    step1: string
    step2: string
    step3: string
  }
}

function buildTemplates(firstName: string, lang: Locale): MessageTemplate[] {
  // firstName here is just the literal placeholder text used in messages
  const fn = firstName
  if (lang === 'pt-BR') {
    return [
      { label: 'Lembrete de agendamento', msg: `Olá ${fn}! 👋 Passando para lembrar do agendamento do seu pet aqui no nosso pet shop. Qualquer dúvida, é só responder!` },
      { label: 'Promoção / oferta', msg: `Olá ${fn}! 🐾 Temos uma promoção especial esta semana. Que tal trazer seu pet para um banho e tosa? Entre em contato e agende já!` },
      { label: 'Reativar cliente inativo', msg: `Olá ${fn}! Sentimos sua falta! 🐶 Faz um tempinho que não vemos seu pet por aqui. Que tal agendar uma visita? Temos novidades te esperando!` },
      { label: 'Mensagem personalizada', msg: `Olá ${fn}! ` },
      { label: 'Aniversário do pet 🎂', msg: `Olá ${fn}! 🎉 Hoje é um dia especial para o seu pet! Desejamos um feliz aniversário cheio de petiscos e carinho. Que tal um banho de presente?` },
      { label: 'Feedback pós-atendimento', msg: `Olá ${fn}! 🐾 Esperamos que seu pet tenha gostado do atendimento. Sua opinião é muito importante para nós! Como foi a experiência?` },
      { label: 'Confirmar agendamento', msg: `Olá ${fn}! ✅ Confirmando o agendamento do seu pet. Estamos preparando tudo com carinho! Qualquer alteração, é só nos avisar.` },
      { label: 'Vacinas em dia 💉', msg: `Olá ${fn}! 💉 Notamos que está chegando a hora da vacina do seu pet. Que tal já agendarmos? A saúde dele em primeiro lugar!` },
    ]
  }
  if (lang === 'pt-PT') {
    return [
      { label: 'Lembrete de marcação', msg: `Olá ${fn}! 👋 Passamos para lembrar a marcação do seu animal cá na nossa pet shop. Qualquer dúvida, é só responder!` },
      { label: 'Promoção / oferta', msg: `Olá ${fn}! 🐾 Temos uma promoção especial esta semana. Que tal trazer o seu animal para banho e tosquia? Entre em contacto e marque já!` },
      { label: 'Reativar cliente inativo', msg: `Olá ${fn}! Temos saudades! 🐶 Há algum tempo que não vemos o seu animal por cá. Que tal marcar uma visita? Temos novidades à sua espera!` },
      { label: 'Mensagem personalizada', msg: `Olá ${fn}! ` },
      { label: 'Aniversário do animal 🎂', msg: `Olá ${fn}! 🎉 Hoje é um dia especial para o seu animal! Desejamos um feliz aniversário cheio de petiscos e carinho. Que tal um banho de prenda?` },
      { label: 'Feedback pós-atendimento', msg: `Olá ${fn}! 🐾 Esperamos que o seu animal tenha gostado do atendimento. A sua opinião é muito importante para nós! Como correu a experiência?` },
      { label: 'Confirmar marcação', msg: `Olá ${fn}! ✅ A confirmar a marcação do seu animal. Estamos a preparar tudo com carinho! Qualquer alteração, é só avisar.` },
      { label: 'Vacinas em dia 💉', msg: `Olá ${fn}! 💉 Verificámos que está a chegar a altura da vacina do seu animal. Que tal marcarmos já? A saúde dele em primeiro lugar!` },
    ]
  }
  if (lang === 'en-US') {
    return [
      { label: 'Appointment reminder', msg: `Hi ${fn}! 👋 Just a friendly reminder about your pet's appointment at our shop. Any questions, just reply!` },
      { label: 'Promotion / offer', msg: `Hi ${fn}! 🐾 We have a special promotion this week. How about bringing your pet for a bath & groom? Get in touch and book now!` },
      { label: 'Reactivate inactive client', msg: `Hi ${fn}! We miss you! 🐶 It's been a while since we've seen your pet. How about scheduling a visit? We have surprises waiting for you!` },
      { label: 'Custom message', msg: `Hi ${fn}! ` },
      { label: "Pet's birthday 🎂", msg: `Hi ${fn}! 🎉 Today is a special day for your pet! Wishing them a happy birthday full of treats and love. How about a complimentary bath?` },
      { label: 'Post-service feedback', msg: `Hi ${fn}! 🐾 We hope your pet enjoyed our service. Your feedback matters to us! How was the experience?` },
      { label: 'Confirm appointment', msg: `Hi ${fn}! ✅ Confirming your pet's appointment. We're getting everything ready with care! Any changes, just let us know.` },
      { label: 'Vaccines up to date 💉', msg: `Hi ${fn}! 💉 We noticed it's almost time for your pet's vaccine. How about scheduling now? Their health comes first!` },
    ]
  }
  // es
  return [
    { label: 'Recordatorio de cita', msg: `¡Hola ${fn}! 👋 Te recordamos la cita de tu mascota en nuestro pet shop. ¡Cualquier duda, responde aquí!` },
    { label: 'Promoción / oferta', msg: `¡Hola ${fn}! 🐾 Tenemos una promoción especial esta semana. ¿Qué te parece traer a tu mascota para un baño y corte? ¡Reserva ya!` },
    { label: 'Reactivar cliente inactivo', msg: `¡Hola ${fn}! ¡Te extrañamos! 🐶 Hace tiempo que no vemos a tu mascota. ¿Qué tal agendar una visita? ¡Tenemos novedades esperándote!` },
    { label: 'Mensaje personalizado', msg: `¡Hola ${fn}! ` },
    { label: 'Cumpleaños de la mascota 🎂', msg: `¡Hola ${fn}! 🎉 ¡Hoy es un día especial para tu mascota! Le deseamos un feliz cumpleaños lleno de premios y cariño. ¿Qué tal un baño de regalo?` },
    { label: 'Feedback post-servicio', msg: `¡Hola ${fn}! 🐾 Esperamos que tu mascota haya disfrutado del servicio. ¡Tu opinión es muy importante para nosotros! ¿Cómo fue la experiencia?` },
    { label: 'Confirmar cita', msg: `¡Hola ${fn}! ✅ Confirmando la cita de tu mascota. ¡Estamos preparando todo con cariño! Cualquier cambio, avísanos.` },
    { label: 'Vacunas al día 💉', msg: `¡Hola ${fn}! 💉 Notamos que se acerca la hora de la vacuna de tu mascota. ¿Qué tal agendar ahora? ¡Su salud es lo primero!` },
  ]
}

const FN_PLACEHOLDER = '{{firstName}}'

export const translations: Record<Locale, Translations> = {
  'pt-BR': {
    nav: { dashboard: 'Dashboard', agenda: 'Agenda', clients: 'Clientes', settings: 'Configurações', signOut: 'Sair', whatsapp: 'WhatsApp' },
    topbar: { myAccount: 'Minha conta', language: 'Idioma' },
    common: {
      save: 'Salvar', cancel: 'Cancelar', edit: 'Editar', delete: 'Deletar', back: 'Voltar', loading: 'Carregando...',
      yes: 'Sim', no: 'Não', new: 'Novo', search: 'Buscar', active: 'Ativo', inactive: 'Inativo', blocked: 'Bloqueado', schedule: 'Agendar',
      any: 'Qualquer', employee: 'Funcionário', service: 'Serviço', pet: 'Pet',
      noAppointments: 'Nenhum agendamento', total: 'Total', name: 'Nome', phone: 'Telefone',
      email: 'E-mail', address: 'Endereço', actions: 'Ações',
    },
    clientDetail: {
      title: 'Cliente', totalSpent: 'Total gasto', points: 'Pontos', visits: 'Visitas', whatsappOptIn: 'WhatsApp',
      tabs: { pets: 'Pets', history: 'Histórico', messages: 'Mensagens' },
      noPets: 'Nenhum pet cadastrado', noHistory: 'Nenhum atendimento ainda', noPetName: 'Sem nome', addPet: 'Adicionar pet',
      sendMessageIntro: `Envie uma mensagem rápida para ${FN_PLACEHOLDER} pelo WhatsApp.`,
      messageTemplates: buildTemplates(FN_PLACEHOLDER, 'pt-BR'),
    },
    clients: {
      title: 'Clientes', new: 'Novo cliente', tutor: 'Tutor', status: 'Status', lastVisit: 'Última visita', totalSpent: 'Total gasto', phone: 'Telefone',
      subtitle: 'Tutores cadastrados no seu pet shop',
    },
    agenda: {
      title: 'Agenda',
      subtitle: 'Visualize e gerencie os agendamentos do dia.',
      newAppointment: 'Novo agendamento',
      today: 'Hoje',
      all: 'Todos',
      outsideHours: 'Fora do horário',
      scheduleSlot: 'Agendar',
      schedule: 'Agendar',
      noAppointments: 'Nenhum agendamento',
      slot: 'Horário',
      available: 'Disponível',
      unavailable: 'Indisponível',
      form: {
        title: 'Novo agendamento',
        titleEdit: 'Editar agendamento',
        subtitle: 'Preencha os dados para agendar um serviço.',
        client: 'Cliente',
        searchClient: 'Buscar por nome ou telefone…',
        pet: 'Pet',
        selectClientFirst: 'Escolha o cliente primeiro',
        service: 'Serviço',
        selectService: 'Selecione o serviço',
        employee: 'Funcionário',
        anyEmployee: 'Qualquer um',
        time: 'Horário',
        date: 'Data',
        price: 'Preço (R$)',
        notes: 'Notas',
        notesPlaceholder: 'Observações do agendamento',
        cancel: 'Cancelar',
        submit: 'Agendar',
        saving: 'Salvando…',
        noSlotsAvailable: 'Nenhum horário disponível',
      },
      status: {
        scheduled: 'Agendado',
        confirmed: 'Confirmado',
        inProgress: 'Em andamento',
        completed: 'Concluído',
        cancelled: 'Cancelado',
        noShow: 'Não compareceu',
      },
      detail: {
        title: 'Detalhes do agendamento',
        confirmAction: 'Confirmar',
        startAction: 'Iniciar serviço',
        completeAction: 'Concluir',
        cancelAction: 'Cancelar',
        noShowAction: 'Não compareceu',
        employee: 'Funcionário',
        unassigned: 'Qualquer um',
        price: 'Preço',
        notes: 'Notas',
        history: 'Histórico',
      },
    },
    dashboard: {
      title: 'Dashboard', today: 'Hoje', revenue: 'Faturamento', appointments: 'Agendamentos', clients: 'Clientes', newClients: 'Novos clientes',
      thisMonth: 'Este mês', topServices: 'Serviços mais vendidos', welcome: 'Olá', summary: 'Bem-vindo ao PetFlow. Aqui está o resumo do seu dia.',
    },
    settings: {
      title: 'Configurações',
      subtitle: 'Gerencie as configurações do seu pet shop.',
      profile: 'Perfil',
      profileSubtitle: 'Nome, endereço e telefone do seu pet shop.',
      hours: 'Horários',
      hoursSubtitle: 'Dias e horários em que o pet shop atende.',
      services: 'Serviços',
      servicesSubtitle: 'Cadastre e edite os serviços oferecidos.',
      team: 'Equipe',
      teamSubtitle: 'Adicione funcionários e gerencie acessos.',
      save: 'Salvar',
      shopName: 'Nome do pet shop', phone: 'Telefone', address: 'Endereço', open: 'Aberto', closed: 'Fechado', copyWeekdays: 'Copiar para dias úteis',
      profileTitle: 'Informações do Pet Shop',
      profilePageSubtitle: 'Nome, endereço e telefone do seu pet shop.',
      hoursTitle: 'Horário de Funcionamento',
      hoursPageSubtitle: 'Configure os dias e horários de atendimento do seu pet shop.',
      servicesTitle: 'Serviços',
      servicesPageSubtitle: 'Gerencie os serviços oferecidos pelo seu pet shop.',
      teamTitle: 'Equipe',
      teamPageSubtitle: 'Gerencie os funcionários do seu pet shop.',
    },
    whatsapp: {
      title: 'WhatsApp',
      subtitle: 'Conecte seu número e automatize mensagens',
      templatesTitle: 'Templates de Mensagens',
      templatesSubtitle: 'Templates padrão do sistema + seus templates personalizados',
      logsTitle: 'Histórico de Mensagens',
      logsSubtitle: 'Últimas 100 mensagens enviadas via WhatsApp',
      noConfig: 'Configure a integração abaixo para começar.',
      saveConfig: 'Salvar configuração',
      instanceId: 'ID da instância',
      token: 'Token',
      connecting: 'Conectando...',
      connectedSince: 'Conectado desde',
      templates: 'Templates', logs: 'Histórico', connect: 'Conectar', disconnect: 'Desconectar',
      status: { connected: 'Conectado', disconnected: 'Desconectado', connecting: 'Conectando...' },
    },
    onboarding: { welcome: 'Bem-vindo!', step1: 'Configure seu pet shop', step2: 'Cadastre seus serviços', step3: 'Pronto!' },
  },
  'pt-PT': {
    nav: { dashboard: 'Painel', agenda: 'Agenda', clients: 'Clientes', settings: 'Definições', signOut: 'Sair', whatsapp: 'WhatsApp' },
    topbar: { myAccount: 'A minha conta', language: 'Idioma' },
    common: {
      save: 'Guardar', cancel: 'Cancelar', edit: 'Editar', delete: 'Eliminar', back: 'Voltar', loading: 'A carregar...',
      yes: 'Sim', no: 'Não', new: 'Novo', search: 'Pesquisar', active: 'Ativo', inactive: 'Inativo', blocked: 'Bloqueado', schedule: 'Marcar',
      any: 'Qualquer', employee: 'Funcionário', service: 'Serviço', pet: 'Animal',
      noAppointments: 'Sem marcações', total: 'Total', name: 'Nome', phone: 'Telemóvel',
      email: 'E-mail', address: 'Morada', actions: 'Ações',
    },
    clientDetail: {
      title: 'Cliente', totalSpent: 'Total gasto', points: 'Pontos', visits: 'Visitas', whatsappOptIn: 'WhatsApp',
      tabs: { pets: 'Animais', history: 'Histórico', messages: 'Mensagens' },
      noPets: 'Nenhum animal registado', noHistory: 'Sem atendimentos ainda', noPetName: 'Sem nome', addPet: 'Adicionar animal',
      sendMessageIntro: `Envie uma mensagem rápida para ${FN_PLACEHOLDER} pelo WhatsApp.`,
      messageTemplates: buildTemplates(FN_PLACEHOLDER, 'pt-PT'),
    },
    clients: {
      title: 'Clientes', new: 'Novo cliente', tutor: 'Tutor', status: 'Estado', lastVisit: 'Última visita', totalSpent: 'Total gasto', phone: 'Telemóvel',
      subtitle: 'Tutores registados na sua pet shop',
    },
    agenda: {
      title: 'Agenda',
      subtitle: 'Visualize e gira as marcações do dia.',
      newAppointment: 'Nova marcação',
      today: 'Hoje',
      all: 'Todos',
      outsideHours: 'Fora do horário',
      scheduleSlot: 'Marcar',
      schedule: 'Marcar',
      noAppointments: 'Sem marcações',
      slot: 'Horário',
      available: 'Disponível',
      unavailable: 'Indisponível',
      form: {
        title: 'Nova marcação',
        titleEdit: 'Editar marcação',
        subtitle: 'Preencha os dados para marcar um serviço.',
        client: 'Cliente',
        searchClient: 'Pesquisar por nome ou telemóvel…',
        pet: 'Animal',
        selectClientFirst: 'Escolha o cliente primeiro',
        service: 'Serviço',
        selectService: 'Selecione o serviço',
        employee: 'Funcionário',
        anyEmployee: 'Qualquer um',
        time: 'Horário',
        date: 'Data',
        price: 'Preço (€)',
        notes: 'Notas',
        notesPlaceholder: 'Observações da marcação',
        cancel: 'Cancelar',
        submit: 'Marcar',
        saving: 'A guardar…',
        noSlotsAvailable: 'Nenhum horário disponível',
      },
      status: {
        scheduled: 'Marcado',
        confirmed: 'Confirmado',
        inProgress: 'Em curso',
        completed: 'Concluído',
        cancelled: 'Cancelado',
        noShow: 'Não compareceu',
      },
      detail: {
        title: 'Detalhes da marcação',
        confirmAction: 'Confirmar',
        startAction: 'Iniciar serviço',
        completeAction: 'Concluir',
        cancelAction: 'Cancelar',
        noShowAction: 'Não compareceu',
        employee: 'Funcionário',
        unassigned: 'Qualquer um',
        price: 'Preço',
        notes: 'Notas',
        history: 'Histórico',
      },
    },
    dashboard: {
      title: 'Painel', today: 'Hoje', revenue: 'Faturação', appointments: 'Marcações', clients: 'Clientes', newClients: 'Novos clientes',
      thisMonth: 'Este mês', topServices: 'Serviços mais vendidos', welcome: 'Olá', summary: 'Bem-vindo ao PetFlow. Aqui está o resumo do seu dia.',
    },
    settings: {
      title: 'Definições',
      subtitle: 'Gira as definições da sua pet shop.',
      profile: 'Perfil',
      profileSubtitle: 'Nome, morada e telemóvel da sua pet shop.',
      hours: 'Horários',
      hoursSubtitle: 'Dias e horários em que a pet shop atende.',
      services: 'Serviços',
      servicesSubtitle: 'Crie e edite os serviços oferecidos.',
      team: 'Equipa',
      teamSubtitle: 'Adicione funcionários e gira acessos.',
      save: 'Guardar',
      shopName: 'Nome da pet shop', phone: 'Telemóvel', address: 'Morada', open: 'Aberto', closed: 'Fechado', copyWeekdays: 'Copiar para dias úteis',
      profileTitle: 'Informações da Pet Shop',
      profilePageSubtitle: 'Nome, morada e telemóvel da sua pet shop.',
      hoursTitle: 'Horário de Funcionamento',
      hoursPageSubtitle: 'Configure os dias e horários de atendimento da sua pet shop.',
      servicesTitle: 'Serviços',
      servicesPageSubtitle: 'Gira os serviços oferecidos pela sua pet shop.',
      teamTitle: 'Equipa',
      teamPageSubtitle: 'Gira os funcionários da sua pet shop.',
    },
    whatsapp: {
      title: 'WhatsApp',
      subtitle: 'Ligue o seu número e automatize mensagens',
      templatesTitle: 'Modelos de Mensagens',
      templatesSubtitle: 'Modelos padrão do sistema + os seus modelos personalizados',
      logsTitle: 'Histórico de Mensagens',
      logsSubtitle: 'Últimas 100 mensagens enviadas via WhatsApp',
      noConfig: 'Configure a integração abaixo para começar.',
      saveConfig: 'Guardar configuração',
      instanceId: 'ID da instância',
      token: 'Token',
      connecting: 'A ligar...',
      connectedSince: 'Ligado desde',
      templates: 'Modelos', logs: 'Histórico', connect: 'Ligar', disconnect: 'Desligar',
      status: { connected: 'Ligado', disconnected: 'Desligado', connecting: 'A ligar...' },
    },
    onboarding: { welcome: 'Bem-vindo!', step1: 'Configure a sua pet shop', step2: 'Registe os seus serviços', step3: 'Pronto!' },
  },
  'en-US': {
    nav: { dashboard: 'Dashboard', agenda: 'Schedule', clients: 'Clients', settings: 'Settings', signOut: 'Sign out', whatsapp: 'WhatsApp' },
    topbar: { myAccount: 'My account', language: 'Language' },
    common: {
      save: 'Save', cancel: 'Cancel', edit: 'Edit', delete: 'Delete', back: 'Back', loading: 'Loading...',
      yes: 'Yes', no: 'No', new: 'New', search: 'Search', active: 'Active', inactive: 'Inactive', blocked: 'Blocked', schedule: 'Schedule',
      any: 'Any', employee: 'Employee', service: 'Service', pet: 'Pet',
      noAppointments: 'No appointments', total: 'Total', name: 'Name', phone: 'Phone',
      email: 'Email', address: 'Address', actions: 'Actions',
    },
    clientDetail: {
      title: 'Client', totalSpent: 'Total spent', points: 'Points', visits: 'Visits', whatsappOptIn: 'WhatsApp',
      tabs: { pets: 'Pets', history: 'History', messages: 'Messages' },
      noPets: 'No pets registered', noHistory: 'No appointments yet', noPetName: 'No name', addPet: 'Add pet',
      sendMessageIntro: `Send a quick message to ${FN_PLACEHOLDER} via WhatsApp.`,
      messageTemplates: buildTemplates(FN_PLACEHOLDER, 'en-US'),
    },
    clients: {
      title: 'Clients', new: 'New client', tutor: 'Owner', status: 'Status', lastVisit: 'Last visit', totalSpent: 'Total spent', phone: 'Phone',
      subtitle: 'Owners registered at your pet shop',
    },
    agenda: {
      title: 'Schedule',
      subtitle: 'View and manage today\'s appointments.',
      newAppointment: 'New appointment',
      today: 'Today',
      all: 'All',
      outsideHours: 'Outside hours',
      scheduleSlot: 'Book',
      schedule: 'Book',
      noAppointments: 'No appointments',
      slot: 'Slot',
      available: 'Available',
      unavailable: 'Unavailable',
      form: {
        title: 'New appointment',
        titleEdit: 'Edit appointment',
        subtitle: 'Fill in the details to book a service.',
        client: 'Client',
        searchClient: 'Search by name or phone…',
        pet: 'Pet',
        selectClientFirst: 'Select a client first',
        service: 'Service',
        selectService: 'Select a service',
        employee: 'Employee',
        anyEmployee: 'Any employee',
        time: 'Time',
        date: 'Date',
        price: 'Price ($)',
        notes: 'Notes',
        notesPlaceholder: 'Appointment notes',
        cancel: 'Cancel',
        submit: 'Book',
        saving: 'Saving…',
        noSlotsAvailable: 'No time slots available',
      },
      status: {
        scheduled: 'Scheduled',
        confirmed: 'Confirmed',
        inProgress: 'In progress',
        completed: 'Completed',
        cancelled: 'Cancelled',
        noShow: 'No show',
      },
      detail: {
        title: 'Appointment details',
        confirmAction: 'Confirm',
        startAction: 'Start service',
        completeAction: 'Complete',
        cancelAction: 'Cancel',
        noShowAction: 'No show',
        employee: 'Employee',
        unassigned: 'Any employee',
        price: 'Price',
        notes: 'Notes',
        history: 'History',
      },
    },
    dashboard: {
      title: 'Dashboard', today: 'Today', revenue: 'Revenue', appointments: 'Appointments', clients: 'Clients', newClients: 'New clients',
      thisMonth: 'This month', topServices: 'Top services', welcome: 'Hello', summary: 'Welcome to PetFlow. Here is your daily summary.',
    },
    settings: {
      title: 'Settings',
      subtitle: 'Manage your pet shop settings.',
      profile: 'Profile',
      profileSubtitle: 'Name, address and phone of your pet shop.',
      hours: 'Hours',
      hoursSubtitle: 'Days and hours your pet shop is open.',
      services: 'Services',
      servicesSubtitle: 'Create and edit the services you offer.',
      team: 'Team',
      teamSubtitle: 'Add staff members and manage access.',
      save: 'Save',
      shopName: 'Shop name', phone: 'Phone', address: 'Address', open: 'Open', closed: 'Closed', copyWeekdays: 'Copy to weekdays',
      profileTitle: 'Pet Shop Information',
      profilePageSubtitle: 'Name, address and phone of your pet shop.',
      hoursTitle: 'Business Hours',
      hoursPageSubtitle: 'Set the days and hours your pet shop operates.',
      servicesTitle: 'Services',
      servicesPageSubtitle: 'Manage the services offered by your pet shop.',
      teamTitle: 'Team',
      teamPageSubtitle: 'Manage your pet shop staff.',
    },
    whatsapp: {
      title: 'WhatsApp',
      subtitle: 'Connect your number and automate messages',
      templatesTitle: 'Message Templates',
      templatesSubtitle: 'System default templates + your custom templates',
      logsTitle: 'Message Log',
      logsSubtitle: 'Last 100 messages sent via WhatsApp',
      noConfig: 'Set up the integration below to get started.',
      saveConfig: 'Save configuration',
      instanceId: 'Instance ID',
      token: 'Token',
      connecting: 'Connecting...',
      connectedSince: 'Connected since',
      templates: 'Templates', logs: 'Message log', connect: 'Connect', disconnect: 'Disconnect',
      status: { connected: 'Connected', disconnected: 'Disconnected', connecting: 'Connecting...' },
    },
    onboarding: { welcome: 'Welcome!', step1: 'Set up your pet shop', step2: 'Register your services', step3: 'All set!' },
  },
  es: {
    nav: { dashboard: 'Panel', agenda: 'Agenda', clients: 'Clientes', settings: 'Ajustes', signOut: 'Cerrar sesión', whatsapp: 'WhatsApp' },
    topbar: { myAccount: 'Mi cuenta', language: 'Idioma' },
    common: {
      save: 'Guardar', cancel: 'Cancelar', edit: 'Editar', delete: 'Eliminar', back: 'Volver', loading: 'Cargando...',
      yes: 'Sí', no: 'No', new: 'Nuevo', search: 'Buscar', active: 'Activo', inactive: 'Inactivo', blocked: 'Bloqueado', schedule: 'Agendar',
      any: 'Cualquiera', employee: 'Empleado', service: 'Servicio', pet: 'Mascota',
      noAppointments: 'Sin citas', total: 'Total', name: 'Nombre', phone: 'Teléfono',
      email: 'Correo', address: 'Dirección', actions: 'Acciones',
    },
    clientDetail: {
      title: 'Cliente', totalSpent: 'Total gastado', points: 'Puntos', visits: 'Visitas', whatsappOptIn: 'WhatsApp',
      tabs: { pets: 'Mascotas', history: 'Historial', messages: 'Mensajes' },
      noPets: 'Ninguna mascota registrada', noHistory: 'Sin citas aún', noPetName: 'Sin nombre', addPet: 'Añadir mascota',
      sendMessageIntro: `Envía un mensaje rápido a ${FN_PLACEHOLDER} por WhatsApp.`,
      messageTemplates: buildTemplates(FN_PLACEHOLDER, 'es'),
    },
    clients: {
      title: 'Clientes', new: 'Nuevo cliente', tutor: 'Tutor', status: 'Estado', lastVisit: 'Última visita', totalSpent: 'Total gastado', phone: 'Teléfono',
      subtitle: 'Tutores registrados en tu pet shop',
    },
    agenda: {
      title: 'Agenda',
      subtitle: 'Visualiza y gestiona las citas del día.',
      newAppointment: 'Nueva cita',
      today: 'Hoy',
      all: 'Todos',
      outsideHours: 'Fuera del horario',
      scheduleSlot: 'Agendar',
      schedule: 'Agendar',
      noAppointments: 'Sin citas',
      slot: 'Horario',
      available: 'Disponible',
      unavailable: 'No disponible',
      form: {
        title: 'Nueva cita',
        titleEdit: 'Editar cita',
        subtitle: 'Completa los datos para agendar un servicio.',
        client: 'Cliente',
        searchClient: 'Buscar por nombre o teléfono…',
        pet: 'Mascota',
        selectClientFirst: 'Elige el cliente primero',
        service: 'Servicio',
        selectService: 'Selecciona el servicio',
        employee: 'Empleado',
        anyEmployee: 'Cualquier empleado',
        time: 'Horario',
        date: 'Fecha',
        price: 'Precio ($)',
        notes: 'Notas',
        notesPlaceholder: 'Observaciones de la cita',
        cancel: 'Cancelar',
        submit: 'Agendar',
        saving: 'Guardando…',
        noSlotsAvailable: 'No hay horarios disponibles',
      },
      status: {
        scheduled: 'Agendado',
        confirmed: 'Confirmado',
        inProgress: 'En curso',
        completed: 'Completado',
        cancelled: 'Cancelado',
        noShow: 'No se presentó',
      },
      detail: {
        title: 'Detalles de la cita',
        confirmAction: 'Confirmar',
        startAction: 'Iniciar servicio',
        completeAction: 'Completar',
        cancelAction: 'Cancelar',
        noShowAction: 'No se presentó',
        employee: 'Empleado',
        unassigned: 'Cualquier empleado',
        price: 'Precio',
        notes: 'Notas',
        history: 'Historial',
      },
    },
    dashboard: {
      title: 'Panel', today: 'Hoy', revenue: 'Ingresos', appointments: 'Citas', clients: 'Clientes', newClients: 'Nuevos clientes',
      thisMonth: 'Este mes', topServices: 'Servicios más vendidos', welcome: 'Hola', summary: 'Bienvenido a PetFlow. Aquí está el resumen de tu día.',
    },
    settings: {
      title: 'Ajustes',
      subtitle: 'Gestiona los ajustes de tu pet shop.',
      profile: 'Perfil',
      profileSubtitle: 'Nombre, dirección y teléfono de tu pet shop.',
      hours: 'Horarios',
      hoursSubtitle: 'Días y horarios en que el pet shop atiende.',
      services: 'Servicios',
      servicesSubtitle: 'Crea y edita los servicios que ofreces.',
      team: 'Equipo',
      teamSubtitle: 'Agrega empleados y gestiona accesos.',
      save: 'Guardar',
      shopName: 'Nombre del pet shop', phone: 'Teléfono', address: 'Dirección', open: 'Abierto', closed: 'Cerrado', copyWeekdays: 'Copiar a días laborables',
      profileTitle: 'Información del Pet Shop',
      profilePageSubtitle: 'Nombre, dirección y teléfono de tu pet shop.',
      hoursTitle: 'Horario de Atención',
      hoursPageSubtitle: 'Configura los días y horarios de atención de tu pet shop.',
      servicesTitle: 'Servicios',
      servicesPageSubtitle: 'Gestiona los servicios que ofrece tu pet shop.',
      teamTitle: 'Equipo',
      teamPageSubtitle: 'Gestiona los empleados de tu pet shop.',
    },
    whatsapp: {
      title: 'WhatsApp',
      subtitle: 'Conecta tu número y automatiza mensajes',
      templatesTitle: 'Plantillas de Mensajes',
      templatesSubtitle: 'Plantillas predeterminadas del sistema + tus plantillas personalizadas',
      logsTitle: 'Historial de Mensajes',
      logsSubtitle: 'Últimos 100 mensajes enviados por WhatsApp',
      noConfig: 'Configura la integración abajo para comenzar.',
      saveConfig: 'Guardar configuración',
      instanceId: 'ID de instancia',
      token: 'Token',
      connecting: 'Conectando...',
      connectedSince: 'Conectado desde',
      templates: 'Plantillas', logs: 'Historial', connect: 'Conectar', disconnect: 'Desconectar',
      status: { connected: 'Conectado', disconnected: 'Desconectado', connecting: 'Conectando...' },
    },
    onboarding: { welcome: '¡Bienvenido!', step1: 'Configura tu pet shop', step2: 'Registra tus servicios', step3: '¡Listo!' },
  },
}
