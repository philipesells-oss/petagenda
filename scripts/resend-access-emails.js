/**
 * resend-access-emails.js
 *
 * Envia novos links de acesso para assinantes que ainda não definiram senha.
 * Bug: o webhook original usava redirectTo errado (sem /auth/callback),
 * então o código PKCE nunca era trocado e eles ficavam sem sessão.
 *
 * Este script gera links de recuperação com o redirectTo correto e envia
 * via Resend. Executar uma única vez para reativar os 4 assinantes bloqueados.
 *
 * Uso: node scripts/resend-access-emails.js
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const { Resend } = require('resend')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
)
const resend = new Resend(process.env.RESEND_API_KEY)
const APP_URL = 'https://getpetflow.com'

// Assinantes pagantes com force_password_change = true (bloqueados)
const SUBSCRIBERS = [
  { email: 'silv123cinara@gmail.com',        name: 'Cinara Silva' },
  { email: 'lutupi@gmail.com',               name: 'Luciana Tupinamba' },
  { email: 'centroesteticoducao@gmail.com',  name: 'Marcelo Gusmão' },
  { email: 'danilalimamessias@gmail.com',    name: 'Danila de Lima Messias' },
]

async function main() {
  console.log('Enviando links de acesso para', SUBSCRIBERS.length, 'assinantes...\n')

  for (const sub of SUBSCRIBERS) {
    process.stdout.write(`→ ${sub.email} ... `)

    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: sub.email,
      options: {
        redirectTo: `${APP_URL}/auth/callback?next=/first-access`,
      },
    })

    if (linkError || !linkData?.properties?.action_link) {
      console.log('ERRO ao gerar link:', linkError?.message)
      continue
    }

    const accessLink = linkData.properties.action_link

    const { error: emailError } = await resend.emails.send({
      from: 'PetFlow <noreply@contato.getpetflow.com>',
      to: sub.email,
      subject: 'Seu acesso ao PetFlow — crie sua senha agora 🐾',
      html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 0; color: #1a1a1a;">
  <div style="background: #f0fdf4; padding: 24px; text-align: center; border-bottom: 2px solid #d1fae5;">
    <span style="font-size: 28px; font-weight: 800; color: #059669; letter-spacing: -0.5px;">🐾 PetFlow</span>
  </div>
  <div style="padding: 32px 24px;">
    <h2 style="color: #059669; margin-top: 0; margin-bottom: 8px;">Olá, ${sub.name}!</h2>
    <p style="margin-top: 0;">Identificamos que sua conta PetFlow ainda não tem uma senha definida. Clique no botão abaixo para criar sua senha e acessar o sistema:</p>
    <a href="${accessLink}"
       style="display:inline-block;margin-top:16px;background:#059669;color:#fff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:600;font-size:16px;">
      Criar senha e acessar o PetFlow
    </a>
    <p style="margin-top: 20px; font-size: 13px; color: #6b7280;">
      Este link é válido por 24 horas. Qualquer dúvida, responda este e-mail ou fale com a gente em
      <a href="mailto:suporte@getpetflow.com" style="color:#059669;">suporte@getpetflow.com</a>.
    </p>
    <hr style="margin: 32px 0; border-color: #e5e7eb;">
    <p style="font-size: 12px; color: #6b7280; margin: 0;">Sua assinatura está ativa — esse passo é só para criar sua senha de acesso.</p>
  </div>
  <div style="background: #f9fafb; padding: 16px; text-align: center; border-top: 1px solid #e5e7eb;">
    <p style="font-size: 12px; color: #9ca3af; margin: 0;">© ${new Date().getFullYear()} PetFlow · Todos os direitos reservados</p>
  </div>
</body>
</html>`,
    })

    if (emailError) {
      console.log('ERRO ao enviar email:', emailError.message)
    } else {
      console.log('OK ✓')
    }
  }

  console.log('\nConcluído.')
}

main().catch(console.error)
