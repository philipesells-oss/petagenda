/**
 * One-time script: sends referral code emails to paying customers
 * who signed up BEFORE the referral program was launched (2026-05-12).
 *
 * Run: node scripts/send-referral-to-old-customers.mjs
 */

import { Resend } from 'resend'

const RESEND_API_KEY = 're_gPYcYRf7_L1PyvXEgopQrw6JeQ9gx4A7c'
const APP_URL = 'https://getpetflow.com'

const resend = new Resend(RESEND_API_KEY)

const OLD_CUSTOMERS = [
  { email: 'silv123cinara@gmail.com',      referralCode: '3600EC32' },
  { email: 'lutupi@gmail.com',             referralCode: '2650BA74' },
  { email: 'centroesteticoducao@gmail.com', referralCode: 'BF7B4199' },
  { email: 'danilalimamessias@gmail.com',   referralCode: '401471E6' },
]

function buildEmail(referralCode) {
  const referralUrl = `${APP_URL}/?ref=${referralCode}`
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 0; color: #1a1a1a;">
  <div style="background: #f0fdf4; padding: 24px; text-align: center; border-bottom: 2px solid #d1fae5;">
    <span style="font-size: 28px; font-weight: 800; color: #059669; letter-spacing: -0.5px;">🐾 PetFlow</span>
  </div>
  <div style="padding: 32px 24px;">
    <h2 style="color: #059669; margin-top: 0; margin-bottom: 8px;">🎁 Seu link exclusivo de indicação chegou!</h2>
    <p style="margin-top: 0;">Lançamos o <strong>Programa de Indicação PetFlow</strong> — e você, por ser assinante, já tem um link exclusivo esperando por você.</p>
    <p>Compartilhe com amigos, colegas e outros pet shops. A cada pessoa que assinar usando seu link, você ganha <strong>1 mês 100% grátis</strong> automaticamente, sem precisar fazer nada.</p>

    <div style="background:#f0fdf4; border-radius:12px; padding:20px; margin: 24px 0;">
      <p style="margin:0 0 8px; font-weight:700; color:#059669;">Seu link de indicação exclusivo:</p>
      <p style="margin:0; background:#fff; border:1px solid #d1fae5; border-radius:8px; padding:10px 14px; font-family:monospace; font-size:13px; color:#059669; word-break:break-all;">${referralUrl}</p>
      <p style="margin: 12px 0 0; font-size: 12px; color: #6b7280;">Copie esse link e envie para outros donos de pet shop ou clínicas veterinárias.</p>
    </div>

    <p style="font-size: 14px; color: #374151;">O desconto é aplicado automaticamente na sua próxima fatura quando alguém confirmar a assinatura — sem burocracia.</p>
    <p style="font-size: 12px; color: #6b7280; margin-top: 24px;">Dúvidas? Responda este email ou acesse seu painel em <a href="${APP_URL}/dashboard" style="color:#059669;">getpetflow.com</a>.</p>
  </div>
  <div style="background: #f9fafb; padding: 16px; text-align: center; border-top: 1px solid #e5e7eb;">
    <p style="font-size: 12px; color: #9ca3af; margin: 0;">© ${new Date().getFullYear()} PetFlow · Todos os direitos reservados</p>
  </div>
</body>
</html>`
}

async function main() {
  console.log('📧 Sending referral emails to old customers...\n')

  for (const customer of OLD_CUSTOMERS) {
    try {
      const result = await resend.emails.send({
        from: 'PetFlow <noreply@contato.getpetflow.com>',
        to: customer.email,
        subject: '🎁 Seu link de indicação PetFlow — 1 mês grátis por indicação!',
        html: buildEmail(customer.referralCode),
      })

      if (result.error) {
        console.error(`❌ ${customer.email}: ${JSON.stringify(result.error)}`)
      } else {
        console.log(`✅ ${customer.email} — sent (id: ${result.data?.id})`)
      }
    } catch (err) {
      console.error(`❌ ${customer.email}:`, err.message)
    }

    // Small delay to avoid rate limiting
    await new Promise((r) => setTimeout(r, 500))
  }

  console.log('\nDone.')
}

main()
