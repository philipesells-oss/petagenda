import sharp from 'sharp'
import { mkdirSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, '..', 'public', 'creatives')
mkdirSync(OUT, { recursive: true })

const green  = '#059669'
const greenL = '#d1fae5'
const greenD = '#047857'
const white  = '#ffffff'
const gray9  = '#111827'
const gray6  = '#4b5563'
const amber  = '#f59e0b'

// ── Creative 1: Instagram Post 1080x1080 ──────────────────────────────
const c1 = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ecfdf5"/>
      <stop offset="100%" stop-color="#d1fae5"/>
    </linearGradient>
  </defs>
  <rect width="1080" height="1080" fill="url(#bg)"/>
  <rect width="1080" height="10" fill="${green}"/>
  <rect x="0" y="1070" width="1080" height="10" fill="${green}"/>

  <!-- Logo -->
  <text x="540" y="102" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-size="44" font-weight="900" fill="${green}">PetFlow</text>
  <text x="540" y="104" text-anchor="middle" font-family="Arial, sans-serif" font-size="44" fill="none" stroke="${greenD}" stroke-width="0"/>

  <!-- Badge -->
  <rect x="300" y="126" width="480" height="50" rx="25" fill="${green}"/>
  <text x="540" y="158" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" font-weight="bold" fill="${white}">NOVO v1.4 — Agenda por Profissional</text>

  <!-- Headline -->
  <text x="540" y="270" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-size="66" font-weight="900" fill="${gray9}">Cada funcionario,</text>
  <text x="540" y="350" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-size="66" font-weight="900" fill="${green}">sua propria agenda.</text>

  <!-- Sub -->
  <text x="540" y="420" text-anchor="middle" font-family="Arial, sans-serif" font-size="30" fill="${gray6}">Chega de conflito de horario.</text>
  <text x="540" y="460" text-anchor="middle" font-family="Arial, sans-serif" font-size="30" fill="${gray6}">Cada tosadora com seus proprios servicos.</text>

  <!-- Divider -->
  <rect x="240" y="500" width="600" height="3" rx="2" fill="${greenL}"/>

  <!-- Feature card 1 -->
  <rect x="90" y="540" width="260" height="200" rx="20" fill="${white}" filter="drop-shadow(0 4px 16px rgba(0,0,0,0.1))"/>
  <circle cx="220" cy="606" r="32" fill="${greenL}"/>
  <text x="220" y="616" text-anchor="middle" font-family="Arial, sans-serif" font-size="32" fill="${green}" font-weight="bold">S</text>
  <text x="220" y="656" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="${gray9}">Seus servicos</text>
  <text x="220" y="682" text-anchor="middle" font-family="Arial, sans-serif" font-size="17" fill="${gray6}">Cada um faz</text>
  <text x="220" y="704" text-anchor="middle" font-family="Arial, sans-serif" font-size="17" fill="${gray6}">o que sabe</text>

  <!-- Feature card 2 -->
  <rect x="410" y="540" width="260" height="200" rx="20" fill="${white}" filter="drop-shadow(0 4px 16px rgba(0,0,0,0.1))"/>
  <circle cx="540" cy="606" r="32" fill="${greenL}"/>
  <text x="540" y="616" text-anchor="middle" font-family="Arial, sans-serif" font-size="32" fill="${green}" font-weight="bold">H</text>
  <text x="540" y="656" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="${gray9}">Horario proprio</text>
  <text x="540" y="682" text-anchor="middle" font-family="Arial, sans-serif" font-size="17" fill="${gray6}">Entrada, saida</text>
  <text x="540" y="704" text-anchor="middle" font-family="Arial, sans-serif" font-size="17" fill="${gray6}">e folgas no sistema</text>

  <!-- Feature card 3 -->
  <rect x="730" y="540" width="260" height="200" rx="20" fill="${white}" filter="drop-shadow(0 4px 16px rgba(0,0,0,0.1))"/>
  <circle cx="860" cy="606" r="32" fill="${greenL}"/>
  <text x="860" y="616" text-anchor="middle" font-family="Arial, sans-serif" font-size="32" fill="${green}" font-weight="bold">A</text>
  <text x="860" y="656" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="${gray9}">Sem conflito</text>
  <text x="860" y="682" text-anchor="middle" font-family="Arial, sans-serif" font-size="17" fill="${gray6}">O sistema bloqueia</text>
  <text x="860" y="704" text-anchor="middle" font-family="Arial, sans-serif" font-size="17" fill="${gray6}">horario indisponivel</text>

  <!-- Testimonial -->
  <rect x="80" y="790" width="920" height="140" rx="20" fill="${white}" filter="drop-shadow(0 2px 8px rgba(0,0,0,0.06))"/>
  <text x="120" y="838" font-family="Arial, sans-serif" font-size="22" fill="${amber}" letter-spacing="4">* * * * *</text>
  <text x="540" y="880" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" fill="${gray9}">"Cada tosadora tem sua grade propria. Zero conflito, caixa melhorou."</text>
  <text x="540" y="910" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="${green}">— Juliana Martins, Pet Space, Campinas-SP</text>

  <!-- CTA -->
  <rect x="240" y="975" width="600" height="72" rx="20" fill="${green}"/>
  <text x="540" y="1016" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-size="28" font-weight="900" fill="${white}">Assine por R$29,90/mes</text>
  <text x="540" y="1038" text-anchor="middle" font-family="Arial, sans-serif" font-size="17" fill="${greenL}">getpetflow.com  |  7 dias de garantia</text>
</svg>`

// ── Creative 2: Instagram Story 1080x1920 ─────────────────────────────
const c2 = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920">
  <defs>
    <linearGradient id="bg2" x1="0%" y1="0%" x2="30%" y2="100%">
      <stop offset="0%" stop-color="${greenD}"/>
      <stop offset="100%" stop-color="#064e3b"/>
    </linearGradient>
  </defs>
  <rect width="1080" height="1920" fill="url(#bg2)"/>

  <!-- Logo -->
  <text x="540" y="180" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-size="56" font-weight="900" fill="${white}">PetFlow</text>
  <rect x="330" y="206" width="420" height="52" rx="26" fill="rgba(255,255,255,0.15)"/>
  <text x="540" y="240" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="${white}">NOVO — versao 1.4</text>

  <!-- Big icon circle -->
  <circle cx="540" cy="460" r="140" fill="rgba(255,255,255,0.12)"/>
  <text x="540" y="440" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-size="100" font-weight="900" fill="${white}">v1.4</text>
  <text x="540" y="510" text-anchor="middle" font-family="Arial, sans-serif" font-size="26" fill="rgba(255,255,255,0.7)">Agenda por Profissional</text>

  <!-- Headline -->
  <text x="540" y="660" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-size="78" font-weight="900" fill="${white}">Agenda por</text>
  <text x="540" y="750" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-size="78" font-weight="900" fill="${amber}">profissional</text>
  <text x="540" y="840" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-size="78" font-weight="900" fill="${white}">chegou!</text>

  <!-- Sub -->
  <text x="540" y="920" text-anchor="middle" font-family="Arial, sans-serif" font-size="34" fill="rgba(255,255,255,0.85)">Cada tosadora com seu horario,</text>
  <text x="540" y="962" text-anchor="middle" font-family="Arial, sans-serif" font-size="34" fill="rgba(255,255,255,0.85)">seus servicos e sua agenda.</text>

  <!-- Feature cards -->
  <rect x="60" y="1020" width="290" height="180" rx="18" fill="rgba(255,255,255,0.12)"/>
  <circle cx="205" cy="1080" r="30" fill="rgba(255,255,255,0.2)"/>
  <text x="205" y="1090" text-anchor="middle" font-family="Arial Black, sans-serif" font-size="26" fill="${white}" font-weight="900">H</text>
  <text x="205" y="1130" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" font-weight="bold" fill="${white}">Horario</text>
  <text x="205" y="1158" text-anchor="middle" font-family="Arial, sans-serif" font-size="19" fill="rgba(255,255,255,0.75)">individual</text>

  <rect x="395" y="1020" width="290" height="180" rx="18" fill="rgba(255,255,255,0.12)"/>
  <circle cx="540" cy="1080" r="30" fill="rgba(255,255,255,0.2)"/>
  <text x="540" y="1090" text-anchor="middle" font-family="Arial Black, sans-serif" font-size="26" fill="${white}" font-weight="900">S</text>
  <text x="540" y="1130" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" font-weight="bold" fill="${white}">Servicos</text>
  <text x="540" y="1158" text-anchor="middle" font-family="Arial, sans-serif" font-size="19" fill="rgba(255,255,255,0.75)">por pessoa</text>

  <rect x="730" y="1020" width="290" height="180" rx="18" fill="rgba(255,255,255,0.12)"/>
  <circle cx="875" cy="1080" r="30" fill="rgba(255,255,255,0.2)"/>
  <text x="875" y="1090" text-anchor="middle" font-family="Arial Black, sans-serif" font-size="26" fill="${white}" font-weight="900">0</text>
  <text x="875" y="1130" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" font-weight="bold" fill="${white}">Sem</text>
  <text x="875" y="1158" text-anchor="middle" font-family="Arial, sans-serif" font-size="19" fill="rgba(255,255,255,0.75)">conflito</text>

  <!-- Testimonial -->
  <rect x="60" y="1260" width="960" height="260" rx="24" fill="rgba(255,255,255,0.1)"/>
  <text x="100" y="1320" font-family="Arial, sans-serif" font-size="28" fill="${amber}" letter-spacing="6">* * * * *</text>
  <text x="540" y="1370" text-anchor="middle" font-family="Arial, sans-serif" font-size="27" fill="${white}">"Cada tosadora tem sua grade propria.</text>
  <text x="540" y="1406" text-anchor="middle" font-family="Arial, sans-serif" font-size="27" fill="${white}">Zero confusao, caixa melhorou."</text>
  <text x="540" y="1460" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" font-weight="bold" fill="${greenL}">— Juliana Martins | Pet Space, Campinas</text>

  <!-- CTA -->
  <rect x="100" y="1590" width="880" height="110" rx="28" fill="${amber}"/>
  <text x="540" y="1646" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-size="38" font-weight="900" fill="${gray9}">Comecar por R$29,90/mes</text>
  <text x="540" y="1682" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="${gray9}">7 dias de garantia | Sem fidelidade</text>

  <!-- URL -->
  <text x="540" y="1790" text-anchor="middle" font-family="Arial, sans-serif" font-size="34" font-weight="bold" fill="rgba(255,255,255,0.5)">getpetflow.com</text>

  <!-- Swipe indicator -->
  <rect x="490" y="1870" width="100" height="8" rx="4" fill="rgba(255,255,255,0.4)"/>
</svg>`

// ── Creative 3: Facebook/LinkedIn Banner 1200x628 ─────────────────────
const c3 = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="628">
  <defs>
    <linearGradient id="bg3" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ecfdf5"/>
      <stop offset="100%" stop-color="#a7f3d0"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="628" fill="url(#bg3)"/>
  <rect width="10" height="628" fill="${green}"/>
  <!-- Right panel -->
  <rect x="660" y="0" width="540" height="628" fill="${green}"/>

  <!-- Left: Logo + badge -->
  <text x="60" y="78" font-family="Arial Black, Arial, sans-serif" font-size="38" font-weight="900" fill="${green}">PetFlow</text>
  <rect x="60" y="100" width="340" height="42" rx="21" fill="${green}"/>
  <text x="230" y="126" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="${white}">NOVO v1.4 disponivel</text>

  <!-- Left headline -->
  <text x="60" y="220" font-family="Arial Black, Arial, sans-serif" font-size="58" font-weight="900" fill="${gray9}">Agenda por</text>
  <text x="60" y="288" font-family="Arial Black, Arial, sans-serif" font-size="58" font-weight="900" fill="${green}">profissional</text>
  <text x="60" y="344" font-family="Arial, sans-serif" font-size="26" fill="${gray6}">Cada funcionario com seu horario,</text>
  <text x="60" y="378" font-family="Arial, sans-serif" font-size="26" fill="${gray6}">seus servicos e sua propria agenda.</text>

  <!-- Features left -->
  <rect x="60" y="416" width="28" height="28" rx="14" fill="${green}"/>
  <text x="74" y="435" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="${white}">v</text>
  <text x="104" y="438" font-family="Arial, sans-serif" font-size="22" fill="${gray9}">Horario individual por profissional</text>

  <rect x="60" y="456" width="28" height="28" rx="14" fill="${green}"/>
  <text x="74" y="475" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="${white}">v</text>
  <text x="104" y="478" font-family="Arial, sans-serif" font-size="22" fill="${gray9}">Servicos configurados por pessoa</text>

  <rect x="60" y="496" width="28" height="28" rx="14" fill="${green}"/>
  <text x="74" y="515" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="${white}">v</text>
  <text x="104" y="518" font-family="Arial, sans-serif" font-size="22" fill="${gray9}">Agenda filtra automaticamente</text>

  <!-- Price left -->
  <text x="60" y="590" font-family="Arial, sans-serif" font-size="20" fill="${gray6}">Por apenas R$29,90/mes | Sem fidelidade</text>

  <!-- Right content -->
  <text x="930" y="120" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-size="100" font-weight="900" fill="rgba(255,255,255,0.15)">1.4</text>
  <text x="930" y="220" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-size="50" font-weight="900" fill="${white}">Chega de</text>
  <text x="930" y="278" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-size="50" font-weight="900" fill="${amber}">confusao!</text>

  <!-- Quote -->
  <text x="930" y="340" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" fill="rgba(255,255,255,0.9)">"Cada tosadora tem sua grade propria.</text>
  <text x="930" y="368" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" fill="rgba(255,255,255,0.9)">Zero conflito, caixa melhorou."</text>
  <text x="930" y="402" text-anchor="middle" font-family="Arial, sans-serif" font-size="17" font-weight="bold" fill="${greenL}">— Juliana, Pet Space Campinas</text>
  <text x="930" y="434" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="${amber}" letter-spacing="4">* * * * *</text>

  <!-- CTA right -->
  <rect x="700" y="490" width="460" height="82" rx="20" fill="${white}"/>
  <text x="930" y="534" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-size="26" font-weight="900" fill="${green}">Assinar agora</text>
  <text x="930" y="558" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="${gray6}">getpetflow.com</text>
</svg>`

async function svgToPng(svgStr, outFile) {
  await sharp(Buffer.from(svgStr)).png().toFile(outFile)
  console.log('Created:', outFile)
}

await svgToPng(c1, path.join(OUT, 'petflow-v14-instagram-post.png'))
await svgToPng(c2, path.join(OUT, 'petflow-v14-instagram-story.png'))
await svgToPng(c3, path.join(OUT, 'petflow-v14-facebook-banner.png'))

console.log('\nAll 3 creatives saved to public/creatives/')
