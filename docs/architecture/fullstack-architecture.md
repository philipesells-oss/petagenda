# PetAgenda — Fullstack Architecture

**Versão:** 1.0 | **Agente:** @architect (Aria) | **Data:** 2026-04-17

> Documento baseado em petshop-saas-architecture.md (SAD v1.0 — Arch, Arquiteto SaaS)

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 14 App Router + TypeScript + Tailwind + shadcn/ui |
| Backend | Supabase (PostgreSQL + Auth + Storage + Realtime + Edge Functions) |
| Deploy | Vercel (hosting + Edge Middleware + Cron Jobs) |
| Filas | Upstash QStash |
| WhatsApp | Z-API (MVP) → Meta Cloud API (escala) |
| Pagamentos | Stripe |
| Email | Resend |

## Multi-tenancy

Schema compartilhado com `tenant_id` em todas as tabelas. RLS via `get_my_tenant_id()`.

## Estrutura de Pastas

```
src/
├── app/
│   ├── (auth)/          # login, signup, forgot-password
│   ├── (dashboard)/     # área logada (layout com sidebar)
│   │   ├── page.tsx     # Dashboard
│   │   ├── agenda/
│   │   ├── clients/
│   │   ├── whatsapp/
│   │   ├── reactivation/
│   │   ├── loyalty/
│   │   ├── subscriptions/
│   │   ├── reports/
│   │   └── settings/
│   └── api/
│       ├── webhooks/stripe/
│       ├── webhooks/whatsapp/
│       └── cron/
├── components/
│   ├── ui/              # shadcn/ui
│   ├── layout/          # sidebar, topbar
│   ├── agenda/
│   ├── clients/
│   └── shared/
├── lib/
│   ├── supabase/        # client, server, admin, middleware
│   ├── whatsapp/
│   ├── stripe/
│   └── utils/
├── hooks/
├── actions/             # Server Actions
└── types/
```

## Decisões Arquiteturais

| ADR | Decisão |
|-----|---------|
| ADR-001 | Multi-tenancy: schema compartilhado + RLS |
| ADR-002 | WhatsApp: Z-API MVP → Meta Cloud API escala |
| ADR-003 | Server Actions para CRUD, API Routes para webhooks/crons |
| ADR-004 | QStash para filas de mensagem WhatsApp |
| ADR-005 | Materialized Views para dashboard (refresh 15min) |
