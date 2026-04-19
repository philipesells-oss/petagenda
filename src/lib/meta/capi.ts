import { createHash } from 'crypto'

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID!
const CAPI_TOKEN = process.env.META_CAPI_TOKEN!
const CAPI_URL = `https://graph.facebook.com/v19.0/${PIXEL_ID}/events`

function sha256(value: string): string {
  return createHash('sha256').update(value.trim().toLowerCase()).digest('hex')
}

interface CAPIEventOptions {
  eventName: string
  email: string
  value?: number
  currency?: string
  eventSourceUrl?: string
  clientIpAddress?: string
  clientUserAgent?: string
}

export async function sendCAPIEvent(opts: CAPIEventOptions): Promise<void> {
  if (!PIXEL_ID || !CAPI_TOKEN) return

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://getpetflow.com'

  const payload = {
    data: [
      {
        event_name: opts.eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_source_url: opts.eventSourceUrl ?? appUrl,
        action_source: 'website',
        user_data: {
          em: [sha256(opts.email)],
          ...(opts.clientIpAddress ? { client_ip_address: opts.clientIpAddress } : {}),
          ...(opts.clientUserAgent ? { client_user_agent: opts.clientUserAgent } : {}),
        },
        ...(opts.value !== undefined
          ? {
              custom_data: {
                value: opts.value,
                currency: opts.currency ?? 'BRL',
              },
            }
          : {}),
      },
    ],
  }

  try {
    const res = await fetch(`${CAPI_URL}?access_token=${CAPI_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const body = await res.text()
      console.error('[meta-capi] error:', res.status, body)
    }
  } catch (err) {
    console.error('[meta-capi] fetch failed:', err)
  }
}
