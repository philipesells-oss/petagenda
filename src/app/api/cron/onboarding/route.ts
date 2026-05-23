import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Resend } from 'resend'
import { getReferralUrl } from '@/lib/referral'

export const dynamic = 'force-dynamic'

const getResend = () => new Resend(process.env.RESEND_API_KEY)

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://getpetflow.com'

// Days after tenant creation when each email is sent
const STEPS: { key: string; days: number }[] = [
  { key: 'day1',  days: 1  },
  { key: 'day3',  days: 3  },
  { key: 'day7',  days: 7  },
  { key: 'day14', days: 14 },
  { key: 'day30', days: 30 },
]

function daysSince(date: string): number {
  return (Date.now() - new Date(date).getTime()) / 86_400_000
}

// ── Email HTML builders ───────────────────────────────────────────────────────

function emailShell(body: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 0; color: #1a1a1a;">
  <div style="background: #f0fdf4; padding: 24px; text-align: center; border-bottom: 2px solid #d1fae5;">
    <span style="font-size: 28px; font-weight: 800; color: #059669; letter-spacing: -0.5px;">🐾 PetFlow</span>
  </div>
  <div style="padding: 32px 24px;">${body}</div>
  <div style="background: #f9fafb; padding: 16px; text-align: center; border-top: 1px solid #e5e7eb;">
    <p style="font-size: 12px; color: #9ca3af; margin: 0;">© ${new Date().getFullYear()} PetFlow · Todos os direitos reservados</p>
  </div>
</body>
</html>`
}

function btn(label: string, href: string): string {
  return `<a href="${href}" style="display:inline-block;margin-top:16px;background:#059669;color:#fff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:600;font-size:16px;">${label}</a>`
}

function day1Html(): string {
  return emailShell(`
    <h2 style="color:#059669;margin-top:0;">Bem-vindo(a) — por onde começar 🐾</h2>
    <p>Sua conta está ativa! Para tirar o máximo do PetFlow, siga estes 3 passos rápidos:</p>
    <ol style="padding-left:20px;line-height:2;">
      <li><strong>Configure o nome do seu petshop</strong> em Configurações → Perfil</li>
      <li><strong>Cadastre seus serviços</strong> (banho, tosa, consulta…) em Configurações → Serviços</li>
      <li><strong>Ative o agendamento online</strong> — seus clientes agendam 24h por dia sem ligar para você</li>
    </ol>
    <p style="margin-top:8px;">Cada passo leva menos de 2 minutos.</p>
    <div style="background:#f0fdf4;border-radius:10px;padding:16px;margin:20px 0;">
      <p style="margin:0;font-size:13px;color:#374151;">💡 <strong>Dica:</strong> Com o agendamento online ativo, seus clientes escolhem o serviço e o horário diretamente pelo link — sem precisar ligar para você.</p>
    </div>
    ${btn('Acessar o PetFlow agora', `${APP_URL}/dashboard`)}
    <p style="margin-top:24px;font-size:13px;color:#6b7280;">Qualquer dúvida, responda este e-mail — a gente ajuda.</p>
  `)
}

function day3Html(): string {
  return emailShell(`
    <h2 style="color:#059669;margin-top:0;">Seus clientes estão esperando! 🐕</h2>
    <p>Sem serviços cadastrados, você não consegue criar agendamentos. Leva menos de 2 minutos para adicionar os seus.</p>
    <div style="background:#f0fdf4;border-radius:10px;padding:18px;margin:20px 0;">
      <p style="margin:0;font-weight:600;color:#059669;">O que cadastrar agora:</p>
      <ul style="margin:10px 0 0;padding-left:18px;color:#374151;line-height:2;">
        <li>Banho simples</li>
        <li>Banho e tosa</li>
        <li>Consulta veterinária</li>
      </ul>
    </div>
    ${btn('Cadastrar serviços', `${APP_URL}/settings/services`)}
    <p style="margin-top:20px;font-size:13px;color:#6b7280;">Você pode ajustar preços e durações a qualquer momento.</p>
  `)
}

function day7Html(appointmentCount: number): string {
  const hasAppts = appointmentCount > 0
  const headline = hasAppts
    ? `Você já tem ${appointmentCount} agendamento${appointmentCount > 1 ? 's' : ''}! Continue assim 💪`
    : 'Você ainda não fez nenhum agendamento 😢'
  const body = hasAppts
    ? `<p>Ótimo começo! Acesse a agenda para ver seus próximos atendimentos e manter tudo organizado.</p>`
    : `<p>Você está há 7 dias no PetFlow e ainda não registrou nenhum agendamento. Você sabia que leva menos de 1 minuto para criar um?</p>
       <p>Abra a agenda, clique em <strong>"+ Novo agendamento"</strong> e preencha os dados do cliente.</p>`
  return emailShell(`
    <h2 style="color:#059669;margin-top:0;">${headline}</h2>
    ${body}
    ${btn('Abrir a agenda agora', `${APP_URL}/agenda`)}
    <p style="margin-top:20px;font-size:13px;color:#6b7280;">Precisando de ajuda? Responda este e-mail.</p>
  `)
}

function day14Html(): string {
  return emailShell(`
    <h2 style="color:#059669;margin-top:0;">Seus clientes podem agendar 24h por dia 📱</h2>
    <p>Você sabia que o PetFlow tem uma página pública de agendamento? Seus clientes entram no link, escolhem o serviço e o horário — sem precisar ligar para você.</p>
    <div style="background:#f0fdf4;border-radius:10px;padding:18px;margin:20px 0;">
      <p style="margin:0;font-weight:600;color:#059669;">Vantagens do agendamento online:</p>
      <ul style="margin:10px 0 0;padding-left:18px;color:#374151;line-height:2;">
        <li>Clientes agendam enquanto você dorme</li>
        <li>Menos ligações para marcar horário</li>
        <li>Confirmações automáticas por WhatsApp</li>
      </ul>
    </div>
    ${btn('Ativar agendamento online', `${APP_URL}/settings/booking`)}
    <p style="margin-top:20px;font-size:13px;color:#6b7280;">A ativação leva menos de 1 minuto. Qualquer dúvida, responda este e-mail.</p>
  `)
}

function day30Html(appointmentCount: number, referralUrl: string): string {
  return emailShell(`
    <h2 style="color:#059669;margin-top:0;">1 mês de PetFlow — obrigado! 🎉</h2>
    <p>Você está há 30 dias com a gente${appointmentCount > 0 ? ` e já registrou <strong>${appointmentCount} agendamentos</strong>` : ''}. Obrigado pela confiança!</p>
    <hr style="margin:24px 0;border-color:#e5e7eb;">
    <div style="background:#f0fdf4;border-radius:12px;padding:20px;">
      <p style="margin:0 0 8px;font-weight:700;color:#059669;">🎁 Indique e ganhe 1 mês grátis</p>
      <p style="margin:0 0 12px;font-size:13px;color:#374151;">Cada amigo que assinar usando seu link te dá <strong>1 mês 100% grátis</strong> automaticamente — sem precisar fazer nada.</p>
      <p style="margin:0;background:#fff;border:1px solid #d1fae5;border-radius:8px;padding:10px 14px;font-family:monospace;font-size:13px;color:#059669;word-break:break-all;">${referralUrl}</p>
    </div>
    ${btn('Compartilhar meu link', referralUrl)}
    <p style="margin-top:20px;font-size:13px;color:#6b7280;">Tem alguma sugestão para melhorar o PetFlow? Responda este e-mail — lemos tudo.</p>
  `)
}

// ── Cron logic ────────────────────────────────────────────────────────────────

async function runOnboarding(): Promise<NextResponse> {
  const admin = createAdminClient()
  const resend = getResend()
  let sent = 0
  let errors = 0

  // Fetch all paying tenants with their email + referral code
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: tenants } = await (admin.from('tenants') as any)
    .select('id, email, name, referral_code, created_at')
    .in('plan_status', ['active', 'trialing'])
    .in('plan', ['starter', 'pro', 'business'])
    .not('email', 'is', null) as { data: Array<{ id: string; email: string; name: string; referral_code: string | null; created_at: string }> | null }

  if (!tenants?.length) {
    return NextResponse.json({ ok: true, sent: 0, errors: 0 })
  }

  // Fetch all onboarding records for these tenants in one query
  const tenantIds = tenants.map((t) => t.id)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: sentRows } = await (admin.from('onboarding_emails') as any)
    .select('tenant_id, email_key')
    .in('tenant_id', tenantIds) as { data: Array<{ tenant_id: string; email_key: string }> | null }

  const sentSet = new Set((sentRows ?? []).map((r) => `${r.tenant_id}:${r.email_key}`))

  for (const tenant of tenants) {
    const age = daysSince(tenant.created_at)

    for (const step of STEPS) {
      if (age < step.days) continue
      if (sentSet.has(`${tenant.id}:${step.key}`)) continue

      // Build email
      let subject = ''
      let html = ''

      if (step.key === 'day1') {
        subject = 'Por onde começar no PetFlow — 3 passos rápidos 🐾'
        html = day1Html()
      } else if (step.key === 'day3') {
        subject = 'Seus clientes esperam pelos seus serviços 🐕'
        html = day3Html()
      } else if (step.key === 'day7') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { count } = await (admin.from('appointments') as any)
          .select('id', { count: 'exact', head: true })
          .eq('tenant_id', tenant.id) as { count: number | null }
        subject = (count ?? 0) > 0
          ? `Você já tem ${count} agendamentos — continue assim! 💪`
          : 'Você está há 7 dias sem fazer um agendamento 😢'
        html = day7Html(count ?? 0)
      } else if (step.key === 'day14') {
        subject = 'Seus clientes podem agendar 24h por dia — você sabia? 📱'
        html = day14Html()
      } else if (step.key === 'day30') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { count } = await (admin.from('appointments') as any)
          .select('id', { count: 'exact', head: true })
          .eq('tenant_id', tenant.id) as { count: number | null }
        const referralUrl = tenant.referral_code
          ? getReferralUrl(tenant.referral_code)
          : `${APP_URL}`
        subject = '1 mês de PetFlow — obrigado! 🎉'
        html = day30Html(count ?? 0, referralUrl)
      }

      if (!subject) continue

      try {
        await resend.emails.send({
          from: 'PetFlow <noreply@contato.getpetflow.com>',
          to: tenant.email,
          subject,
          html,
        })

        // Mark as sent
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (admin.from('onboarding_emails') as any)
          .insert({ tenant_id: tenant.id, email_key: step.key })

        sentSet.add(`${tenant.id}:${step.key}`)
        sent++
      } catch (err) {
        console.error(`[onboarding] failed ${step.key} for ${tenant.email}:`, err)
        errors++
      }
    }
  }

  return NextResponse.json({ ok: true, sent, errors })
}

// ── Route handlers ────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization') ?? ''
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    return runOnboarding()
  }
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

export async function POST(req: NextRequest) {
  return GET(req)
}
