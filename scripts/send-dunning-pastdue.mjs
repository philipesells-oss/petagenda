/**
 * One-time: dunning emails to past_due paying customers.
 * For each, fetches the open invoice (hosted_invoice_url) and creates a fresh
 * Stripe billing portal session (update card), then sends a recovery email.
 *
 * Run: node scripts/send-dunning-pastdue.mjs
 */
import { Resend } from 'resend'
import Stripe from 'stripe'

const resend = new Resend(process.env.RESEND_API_KEY)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const APP_URL = 'https://getpetflow.com'

const SUBS = [
  'sub_1TPrqxGtK644c9ETYAlO85ng', // Danila
  'sub_1TPor9GtK644c9ETw7HsgoT8', // Marcelo
]

function buildEmail(firstName, amount, currency, payUrl, portalUrl) {
  const valor = (amount / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, Segoe UI, sans-serif; max-width: 560px; margin: 0 auto; padding: 0; color: #1a1a1a; background:#ffffff;">
  <div style="background: #f0fdf4; padding: 24px; text-align: center; border-bottom: 2px solid #d1fae5;">
    <span style="font-size: 28px; font-weight: 800; color: #059669; letter-spacing: -0.5px;">🐾 PetFlow</span>
  </div>
  <div style="padding: 32px 24px;">
    <h2 style="color: #b45309; margin-top: 0; margin-bottom: 10px;">${firstName}, seu pagamento não passou 💳</h2>
    <p style="margin-top: 0;">Tentamos renovar sua assinatura do <strong>PetFlow</strong>, mas o cartão cadastrado foi recusado. Nada grave — geralmente é cartão vencido, limite ou bloqueio do banco. Só precisamos atualizar isso pra <strong>você não perder o acesso</strong> ao sistema.</p>

    <div style="background:#fff7ed; border:1px solid #fed7aa; border-radius:12px; padding:16px 20px; margin: 20px 0;">
      <p style="margin:0; font-size:14px; color:#9a3412;">Valor pendente: <strong>R$ ${valor}</strong> (mensalidade)</p>
    </div>

    <div style="text-align:center; margin: 24px 0 12px;">
      <a href="${payUrl}"
         style="display:inline-block;background:#059669;color:#fff;text-decoration:none;padding:15px 34px;border-radius:10px;font-weight:700;font-size:16px;">
        Regularizar pagamento agora
      </a>
    </div>
    <p style="text-align:center; margin: 0 0 24px; font-size:13px; color:#6b7280;">
      Prefere só trocar o cartão? <a href="${portalUrl}" style="color:#059669;">Atualizar forma de pagamento</a>
    </p>

    <p style="font-size:14px; color:#374151;">Seu acesso segue ativo por enquanto — assim que o pagamento for confirmado, tudo continua normalmente, sem nenhuma interrupção.</p>
    <p style="font-size:14px; color:#374151; margin-top: 16px;">Qualquer dúvida ou problema com o pagamento, <strong>é só responder este e-mail</strong> que a gente resolve junto.</p>

    <p style="font-size:14px; color:#374151; margin-top:18px;">Um abraço,<br>Equipe PetFlow 🐾</p>
  </div>
  <div style="background: #f9fafb; padding: 16px; text-align: center; border-top: 1px solid #e5e7eb;">
    <p style="font-size: 12px; color: #9ca3af; margin: 0;">© 2026 PetFlow · getpetflow.com<br>Você recebeu este e-mail porque tem uma assinatura ativa no PetFlow.</p>
  </div>
</body>
</html>`
}

async function main() {
  for (const subId of SUBS) {
    try {
      const sub = await stripe.subscriptions.retrieve(subId, {
        expand: ['latest_invoice', 'customer'],
      })
      const customer = sub.customer
      const email = customer.email
      const firstName = (customer.name || email.split('@')[0]).split(' ')[0]
      const inv = sub.latest_invoice || {}
      const amount = inv.amount_due ?? 2990
      const currency = inv.currency ?? 'brl'
      const payUrl = inv.hosted_invoice_url || `${APP_URL}/dashboard`

      const portal = await stripe.billingPortal.sessions.create({
        customer: customer.id,
        return_url: `${APP_URL}/dashboard`,
      })

      const res = await resend.emails.send({
        from: 'PetFlow <noreply@contato.getpetflow.com>',
        replyTo: 'contato@getpetflow.com',
        to: email,
        subject: `${firstName}, seu pagamento do PetFlow não passou 💳`,
        html: buildEmail(firstName, amount, currency, payUrl, portal.url),
      })
      console.log(`OK  ${email}  -> email id: ${res?.data?.id ?? JSON.stringify(res)}`)
    } catch (err) {
      console.error(`FAIL ${subId}:`, err?.message ?? err)
    }
  }
}
main()
