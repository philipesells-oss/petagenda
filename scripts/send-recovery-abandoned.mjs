/**
 * One-time: recovery emails to REAL abandoned/unpaid leads.
 * Creates a fresh Stripe Checkout session per lead (email prefilled) and
 * sends a board-approved win-back email featuring the new self-booking feature.
 *
 * Run: node scripts/send-recovery-abandoned.mjs
 */
import { Resend } from 'resend'
import Stripe from 'stripe'

const RESEND_API_KEY = process.env.RESEND_API_KEY
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY
const STRIPE_PRICE_BRL = process.env.STRIPE_PRICE_BRL
const APP_URL = 'https://getpetflow.com'

const resend = new Resend(RESEND_API_KEY)
const stripe = new Stripe(STRIPE_SECRET_KEY)

const LEADS = [
  { email: 'arquiteta.amandaborges@gmail.com', firstName: 'Amanda' },
  { email: 'renan.farinacio@gmail.com',         firstName: 'Renan'  },
]

function buildEmail(firstName, checkoutUrl) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, Segoe UI, sans-serif; max-width: 560px; margin: 0 auto; padding: 0; color: #1a1a1a; background:#ffffff;">
  <div style="background: #f0fdf4; padding: 24px; text-align: center; border-bottom: 2px solid #d1fae5;">
    <span style="font-size: 28px; font-weight: 800; color: #059669; letter-spacing: -0.5px;">🐾 PetFlow</span>
  </div>
  <div style="padding: 32px 24px;">
    <h2 style="color: #059669; margin-top: 0; margin-bottom: 10px;">${firstName}, faltou só um passo 🐾</h2>
    <p style="margin-top: 0;">Vi que você começou a assinar o <strong>PetFlow</strong> mas não chegou a concluir. Acontece — e eu não quis deixar você de fora. Guardei seu lugar e quero te mostrar rapidinho o que o PetFlow faz pelo seu negócio.</p>

    <div style="background:#f0fdf4; border:1px solid #d1fae5; border-radius:12px; padding:18px 20px; margin: 22px 0;">
      <p style="margin:0 0 10px; font-weight:700; color:#059669;">✨ Novidade: seus clientes agendam sozinhos</p>
      <p style="margin:0; font-size:14px; color:#374151;">Agora o PetFlow tem <strong>agendamento online</strong>: você configura seus serviços, horários e profissionais, e seus clientes marcam banho, tosa ou consulta <strong>sozinhos, 24h por dia</strong> — exatamente dentro da disponibilidade que você definir. Menos ligação, menos WhatsApp lotado, menos horário furado.</p>
    </div>

    <p style="margin:0 0 8px; font-weight:600;">Com o PetFlow você ainda tem:</p>
    <ul style="margin:0 0 20px; padding-left: 20px; color:#374151; font-size:14px; line-height:1.7;">
      <li>📅 Agenda completa de banho, tosa e consultas num só lugar</li>
      <li>💬 Lembretes automáticos no WhatsApp (cai o no-show)</li>
      <li>🐶 Ficha de cada cliente e pet, com histórico de atendimentos</li>
      <li>🎁 Programa de indicação: <strong>1 mês grátis</strong> a cada amigo que assinar</li>
    </ul>

    <div style="text-align:center; margin: 28px 0 20px;">
      <a href="${checkoutUrl}"
         style="display:inline-block;background:#059669;color:#fff;text-decoration:none;padding:15px 34px;border-radius:10px;font-weight:700;font-size:16px;">
        Voltar e finalizar minha assinatura
      </a>
      <p style="margin:12px 0 0; font-size:13px; color:#6b7280;">Apenas <strong>R$ 29,90/mês</strong> · sem fidelidade · cancele quando quiser</p>
    </div>

    <p style="font-size:14px; color:#374151; margin-top: 24px;">Travou no pagamento ou ficou com alguma dúvida? <strong>É só responder este e-mail</strong> — eu te ajudo a finalizar pessoalmente (inclusive com outras formas de pagamento).</p>

    <p style="font-size:14px; color:#374151; margin-top:18px;">Um abraço,<br>Equipe PetFlow 🐾</p>
  </div>
  <div style="background: #f9fafb; padding: 16px; text-align: center; border-top: 1px solid #e5e7eb;">
    <p style="font-size: 12px; color: #9ca3af; margin: 0;">© 2026 PetFlow · getpetflow.com<br>Você recebeu este e-mail porque iniciou uma assinatura no PetFlow.</p>
  </div>
</body>
</html>`
}

async function main() {
  for (const lead of LEADS) {
    try {
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [{ price: STRIPE_PRICE_BRL, quantity: 1 }],
        customer_email: lead.email,
        success_url: `${APP_URL}/login?welcome=1`,
        cancel_url: `${APP_URL}/`,
        locale: 'pt-BR',
        billing_address_collection: 'auto',
        metadata: { source: 'recovery_email', requested_currency: 'BRL', billing_interval: 'month' },
      })
      const checkoutUrl = session.url

      const res = await resend.emails.send({
        from: 'PetFlow <noreply@contato.getpetflow.com>',
        replyTo: 'contato@getpetflow.com',
        to: lead.email,
        subject: `${lead.firstName}, faltou só um passo no PetFlow 🐾`,
        html: buildEmail(lead.firstName, checkoutUrl),
      })
      console.log(`OK  ${lead.email}  -> email id: ${res?.data?.id ?? JSON.stringify(res)}  | checkout: ${checkoutUrl.slice(0, 60)}...`)
    } catch (err) {
      console.error(`FAIL ${lead.email}:`, err?.message ?? err)
    }
  }
}
main()
