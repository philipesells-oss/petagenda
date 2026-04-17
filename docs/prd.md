# PetAgenda SaaS — Product Requirements Document (PRD)

**Versão:** 1.0
**Agente:** @pm (Morgan)
**Data:** 2026-04-17
**Status:** Approved

---

## Resumo Executivo

PetAgenda é um SaaS vertical para pet shops brasileiros com foco em reativação de clientes e ocupação de agenda via automação de WhatsApp. Stack: Next.js 14 + Supabase + Vercel.

---

## Épico 1 — MVP Foundation (Fase 1)

**Objetivo:** Pet shop consegue agendar e lembrar clientes sem depender de WhatsApp manual.

### Story 1.1 — Setup do Projeto e Infraestrutura
**Como** desenvolvedor, **quero** ter o projeto Next.js 14 configurado com Supabase e Vercel **para que** possamos começar o desenvolvimento com ambiente funcional.

**Acceptance Criteria:**
- [ ] Next.js 14 com App Router, TypeScript, Tailwind CSS configurados
- [ ] Supabase client (browser e server) configurados com SSR
- [ ] Middleware de autenticação Edge configurado
- [ ] Variáveis de ambiente documentadas (.env.example)
- [ ] Projeto deployado no Vercel (preview funcional)
- [ ] Estrutura de pastas conforme arquitetura definida

**Escopo IN:** Next.js setup, Supabase client, middleware, Vercel deploy inicial
**Escopo OUT:** Database schema, UI, autenticação completa

---

### Story 1.2 — Schema do Banco de Dados e Migrações
**Como** sistema, **quero** ter o schema completo no Supabase **para que** os dados sejam armazenados com isolamento multi-tenant e segurança via RLS.

**Acceptance Criteria:**
- [ ] Migrations criadas e aplicadas: tenants, users, clients, pets, services, appointments, business_hours, blocked_slots
- [ ] RLS habilitado em todas as tabelas com políticas de tenant isolation
- [ ] Função helper `get_my_tenant_id()` criada
- [ ] Triggers: `update_updated_at`, `update_client_metrics`, `auto_tag_client`, `handle_new_user`
- [ ] Índices de performance criados em todas as tabelas
- [ ] Seed de dados de exemplo para desenvolvimento

**Escopo IN:** Todas as tabelas do ERD, RLS policies, triggers, indexes
**Escopo OUT:** WhatsApp tables, reactivation tables, loyalty tables (fases futuras)

---

### Story 1.3 — Autenticação e Onboarding
**Como** dono de pet shop, **quero** criar minha conta e configurar meu estabelecimento **para que** eu possa começar a usar o sistema rapidamente.

**Acceptance Criteria:**
- [ ] Página de signup com: nome, email, senha, nome do pet shop, telefone
- [ ] Trigger no Supabase cria tenant + user automaticamente após signup
- [ ] Página de login com email/senha
- [ ] Página de forgot password com envio de email
- [ ] Fluxo de onboarding (3 passos): horário de funcionamento → serviços → WhatsApp (skip)
- [ ] Redirect automático pós-login para dashboard
- [ ] Proteção de rotas via Edge Middleware
- [ ] Layout sem sidebar para páginas de auth
- [ ] Verificação de plano cancelado → redirect para billing

**Escopo IN:** Signup, login, forgot-password, onboarding, middleware
**Escopo OUT:** Social login, 2FA, SAML

---

### Story 1.4 — Dashboard Principal
**Como** admin do pet shop, **quero** ver as métricas do dia na tela inicial **para que** eu tenha visibilidade rápida do negócio.

**Acceptance Criteria:**
- [ ] Layout com sidebar fixa (desktop) e menu bottom (mobile)
- [ ] Cards de métricas: agendamentos hoje, faturamento do dia, clientes ativos/inativos
- [ ] Lista de próximos agendamentos do dia com status
- [ ] Indicador de horários vagos de hoje
- [ ] Skeleton loading states
- [ ] Design responsivo mobile-first
- [ ] Topbar com nome do pet shop, avatar e dropdown de perfil

**Escopo IN:** Dashboard layout, métricas básicas, agendamentos do dia
**Escopo OUT:** Gráficos avançados, relatórios (Fase 6)

---

### Story 1.5 — Catálogo de Serviços
**Como** admin do pet shop, **quero** gerenciar o catálogo de serviços **para que** eu possa configurar o que ofereço com preços e duração.

**Acceptance Criteria:**
- [ ] Lista de serviços com nome, categoria, duração, preço
- [ ] CRUD completo: criar, editar, desativar serviço
- [ ] Preço por porte do animal (pequeno, médio, grande, gigante)
- [ ] Categorias: banho e tosa, veterinário, daycare, outros
- [ ] Cor personalizada por serviço (para agenda visual)
- [ ] Validação de formulário com Zod
- [ ] Feedback visual de sucesso/erro (sonner)

**Escopo IN:** CRUD de serviços, preço por porte, categorias
**Escopo OUT:** Pacotes, serviços compostos

---

### Story 1.6 — Gerenciamento de Clientes e Pets
**Como** funcionário do pet shop, **quero** cadastrar clientes e seus pets **para que** eu tenha histórico completo de cada animal.

**Acceptance Criteria:**
- [ ] Tabela de clientes com busca, filtros (status, tag) e paginação
- [ ] Formulário de cliente: nome, telefone, email, CPF (opcional), endereço, tags, notas
- [ ] Tags automáticas: novo, vip, atrasado, inativo
- [ ] Perfil do cliente com: dados pessoais, lista de pets, histórico de visitas, pontos de fidelidade
- [ ] CRUD de pets: nome, espécie, raça, porte, peso, data nascimento, pelagem, temperamento, alergias, foto
- [ ] Histórico de serviços na timeline do cliente
- [ ] Opt-in de WhatsApp (LGPD)
- [ ] Busca rápida por nome ou telefone

**Escopo IN:** CRUD clientes, CRUD pets, perfil, histórico
**Escopo OUT:** Importação em massa, prontuário veterinário completo

---

### Story 1.7 — Agenda Inteligente
**Como** atendente, **quero** visualizar e gerenciar a agenda de serviços **para que** eu possa agendar e controlar os atendimentos do dia.

**Acceptance Criteria:**
- [ ] Visão semanal da agenda por funcionário (colunas)
- [ ] Visão diária com slots de 30 minutos
- [ ] Criação de agendamento: cliente, pet, serviço, funcionário, data/hora
- [ ] Detecção de conflito de horário com erro claro
- [ ] Botão de check-in (scheduled → in_progress) e check-out (in_progress → completed)
- [ ] Alteração de status: confirmar, cancelar, marcar no-show
- [ ] Bloqueio de horários (férias, folgas)
- [ ] Horário de funcionamento respeitado (slots fora do horário aparecem desabilitados)
- [ ] Cor do serviço na visualização do card

**Escopo IN:** Agenda semanal/diária, CRUD agendamentos, status, bloqueios
**Escopo OUT:** Drag & drop, agendamento online pelo cliente

---

### Story 1.8 — Horário de Funcionamento
**Como** admin do pet shop, **quero** configurar meu horário de funcionamento **para que** agendamentos só sejam criados em horários disponíveis.

**Acceptance Criteria:**
- [ ] Configuração de horário por dia da semana (0=domingo a 6=sábado)
- [ ] Toggle de dia aberto/fechado
- [ ] Horário de abertura e fechamento
- [ ] Intervalo de almoço (opcional)
- [ ] Validação: horário de fechamento > abertura
- [ ] Integração com a agenda (slots fora do horário bloqueados)

**Escopo IN:** Config de horário, integração com agenda
**Escopo OUT:** Feriados, horários especiais por data

---

## Épico 2 — WhatsApp Integration (Fase 2)

### Story 2.1 — Configuração da Instância WhatsApp
**Como** admin do pet shop, **quero** conectar meu número de WhatsApp ao sistema **para que** as mensagens automáticas sejam enviadas pelo número do pet shop.

**Acceptance Criteria:**
- [ ] Tela de configuração de WhatsApp com status de conexão
- [ ] QR Code para conexão da instância Z-API
- [ ] Status em tempo real: conectado, desconectado, sincronizando
- [ ] Contador de mensagens usadas vs limite do plano
- [ ] Botão de desconectar/reconectar

---

### Story 2.2 — Templates de Mensagens
**Como** admin, **quero** gerenciar templates de mensagens WhatsApp **para que** eu possa personalizar a comunicação com meus clientes.

**Acceptance Criteria:**
- [ ] Lista de templates com categoria (confirmação, lembrete, reativação, etc.)
- [ ] Templates globais (padrão do sistema) + templates personalizados do pet shop
- [ ] Editor de template com preview ao vivo das variáveis ({{client_name}}, {{pet_name}}, etc.)
- [ ] CRUD de templates personalizados
- [ ] Toggle de ativo/inativo

---

### Story 2.3 — Lembretes e Confirmações Automáticas
**Como** sistema, **quero** enviar lembretes e confirmações automaticamente **para que** o pet shop reduza no-shows sem intervenção manual.

**Acceptance Criteria:**
- [ ] Envio de confirmação ao criar agendamento (via QStash)
- [ ] Lembrete 24h antes via cron job Vercel
- [ ] Lembrete 2h antes via cron job Vercel
- [ ] Pós-atendimento automático (2h após completar)
- [ ] Log de mensagens com status (pendente, enviado, entregue, lido, falhou)
- [ ] Respeito ao opt-in e limite de mensagens do plano
- [ ] Rate limiting via Upstash Redis

---

## Épico 3 — Reativação de Clientes (Fase 3)

### Story 3.1 — Marcação Automática de Inativos
**Como** sistema, **quero** marcar clientes sem visita há 30+ dias como inativos **para que** o pet shop saiba quem precisa ser reativado.

---

### Story 3.2 — Campanhas de Reativação
**Como** admin, **quero** criar e enviar campanhas de WhatsApp para clientes inativos **para que** eu possa recuperar receita de clientes perdidos.

---

## Épico 4 — Fidelidade e Assinaturas (Fase 4)

### Story 4.1 — Programa de Fidelidade
### Story 4.2 — Planos de Assinatura

---

## Épico 5 — Monetização SaaS (Fase 5)

### Story 5.1 — Integração Stripe Billing

---

## Épico 6 — Polish e Launch (Fase 6)

### Story 6.1 — Relatórios e Métricas
### Story 6.2 — Mobile Responsivo
### Story 6.3 — Onboarding Guiado

---

## Restrições Técnicas

- **Multi-tenancy:** Schema compartilhado com `tenant_id` + RLS Supabase
- **Auth:** Supabase Auth com JWT custom claims (tenant_id, role, plan)
- **Secrets:** Service role key NUNCA exposta no client
- **LGPD:** opt-in WhatsApp obrigatório, deleção de dados disponível
- **Crons:** Protegidos com CRON_SECRET header

## Definição de Pronto (DoD)

- [ ] Código implementado conforme acceptance criteria
- [ ] TypeScript sem erros
- [ ] Lint passando (ESLint)
- [ ] RLS testado (operações bloqueadas sem autenticação)
- [ ] UI responsiva (mobile + desktop)
- [ ] Loading states implementados
- [ ] Error handling com mensagem amigável
