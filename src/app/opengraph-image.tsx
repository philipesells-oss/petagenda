import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'PetFlow — Sistema para Pet Shop e Clínica Veterinária'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        background: 'linear-gradient(135deg, #ecfdf5 0%, #ffffff 45%, #f0fdfa 100%)',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 80px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        position: 'relative',
      }}
    >
      {/* Decorative circle top-left */}
      <div
        style={{
          position: 'absolute',
          top: -80,
          left: -80,
          width: 320,
          height: 320,
          borderRadius: '50%',
          background: 'rgba(16,185,129,0.12)',
        }}
      />
      {/* Decorative circle bottom-right */}
      <div
        style={{
          position: 'absolute',
          bottom: -80,
          right: -80,
          width: 280,
          height: 280,
          borderRadius: '50%',
          background: 'rgba(20,184,166,0.10)',
        }}
      />

      {/* Logo */}
      <div
        style={{
          fontSize: 64,
          fontWeight: 900,
          color: '#059669',
          marginBottom: 20,
          letterSpacing: '-2px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        🐾 PetFlow
      </div>

      {/* Headline */}
      <div
        style={{
          fontSize: 44,
          fontWeight: 800,
          color: '#111827',
          textAlign: 'center',
          marginBottom: 16,
          lineHeight: 1.2,
          maxWidth: 900,
        }}
      >
        Sistema para Pet Shop e Clínica Veterinária
      </div>

      {/* Subheadline */}
      <div
        style={{
          fontSize: 26,
          color: '#6b7280',
          textAlign: 'center',
          marginBottom: 44,
          maxWidth: 800,
          lineHeight: 1.4,
        }}
      >
        Agendamento online com QR Code · Agenda por profissional · CRM completo
      </div>

      {/* Price badge */}
      <div
        style={{
          background: '#059669',
          color: 'white',
          padding: '16px 48px',
          borderRadius: 50,
          fontSize: 30,
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        🛡️ A partir de R$29,90/mês · 7 dias de garantia
      </div>
    </div>,
    { ...size }
  )
}
