# PetAgenda — Project Brief

**Agente:** @analyst (Alex)
**Data:** 2026-04-17
**Status:** Approved

---

## 1. Visão do Produto

**PetAgenda** é um SaaS vertical para pet shops brasileiros focado em **reativação de clientes** e **ocupação de agenda**, usando WhatsApp como motor de engajamento.

Pet shops perdem até 40% da receita por falta de gestão: clientes somem, agenda tem buracos, comunicação é manual. Donos não têm tempo nem ferramenta simples para automatizar o dia a dia.

---

## 2. Problema

### Dores Críticas (Impacto Alto, Frequência Diária)
1. **Agendamentos por WhatsApp/caderno** — sem centralização, sem confirmação automática → no-shows
2. **Clientes somem** — sem régua de reativação, sem histórico estruturado
3. **Agenda com buracos** — sem preenchimento proativo de slots vagos
4. **Comunicação manual** — tudo depende do dono/atendente responder no WhatsApp pessoal

### Contexto de Mercado
- Sistemas existentes (Petland, VetSmart, Mion) têm interface datada, sem WhatsApp nativo, sem reativação
- Dono de petshop tem perfil não-técnico → solução precisa ser **simples de onboarding** (< 30 min)
- Concorrentes genéricos não entendem o fluxo real do setor pet

---

## 3. Solução

SaaS multi-tenant com:
- **Agenda inteligente** com confirmação/lembrete automático via WhatsApp
- **CRM de clientes + pets** com histórico completo
- **Reativação automática** de clientes inativos (30+ dias)
- **Programa de fidelidade** integrado
- **Planos de assinatura** para o pet shop vender recorrência
- **Dashboard de métricas** em tempo real

---

## 4. Modelo de Negócio

| Plano | Preço | Limite WhatsApp |
|-------|-------|-----------------|
| Starter | R$97/mês | 500 msgs |
| Pro | R$197/mês | 2.000 msgs |
| Business | R$397/mês | Ilimitado |

Trial gratuito de 14 dias. Cobrança via Stripe.

---

## 5. Usuários-Alvo

1. **Admin/Dono do pet shop** — configura, gerencia, toma decisões
2. **Funcionário (banhista/tosador)** — usa agenda e registra atendimentos
3. **Cliente final (tutor)** — recebe mensagens, agenda online (fase futura)

**Perfil do decisor:** Dono de petshop, 28-50 anos, não-técnico, usa smartphone, pain principal é "perder cliente" e "agenda vazia".

---

## 6. Stack Tecnológica

- **Frontend:** Next.js 14 (App Router) + Tailwind CSS + shadcn/ui
- **Backend/DB:** Supabase (PostgreSQL + Auth + Storage + Realtime + Edge Functions)
- **Deploy:** Vercel (hosting + cron jobs)
- **WhatsApp:** Z-API (MVP) → Meta Cloud API (escala)
- **Pagamentos:** Stripe
- **Filas:** Upstash QStash
- **Email:** Resend

---

## 7. Roadmap de Implementação

| Fase | Objetivo | Prazo |
|------|----------|-------|
| 1 — MVP Foundation | Setup + Schema + Auth + Clientes + Agenda básica | Semanas 1-3 |
| 2 — WhatsApp | Mensagens automáticas + lembretes | Semanas 4-5 |
| 3 — Reativação | Campanhas + tracking conversão | Semana 6 |
| 4 — Fidelidade & Assinaturas | Recorrência e retenção | Semanas 7-8 |
| 5 — Monetização | Stripe billing + planos | Semana 9 |
| 6 — Polish & Launch | Reports + Mobile + Onboarding | Semana 10 |

---

## 8. Métricas de Sucesso

- **Onboarding:** < 30 min até primeiro agendamento
- **Redução de no-shows:** > 30% em 90 dias
- **Reativação:** > 20% de clientes inativos voltam em 30 dias
- **Churn SaaS:** < 5% ao mês nos primeiros 6 meses
- **NPS:** > 50 após 60 dias de uso
