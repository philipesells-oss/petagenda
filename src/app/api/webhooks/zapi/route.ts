import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

interface ZapiWebhookPayload {
  messageId?: string
  zaapId?: string
  status?: 'SENT' | 'DELIVERED' | 'READ' | 'ERROR'
  type?: string
}

export async function POST(req: NextRequest) {
  // Validate Z-API client token. Skip only if token is genuinely not configured
  // (WhatsApp integration not yet enabled). Never skip for placeholder values.
  const clientToken = process.env.ZAPI_CLIENT_TOKEN
  const zapiConfigured = clientToken && clientToken !== 'SEU_TOKEN_ZAPI'
  if (zapiConfigured) {
    const incoming = req.headers.get('client-token') ?? req.headers.get('Client-Token') ?? ''
    if (incoming !== clientToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  } else if (clientToken === 'SEU_TOKEN_ZAPI') {
    // Placeholder detected — reject all requests until a real token is configured
    console.error('[webhook/zapi] ZAPI_CLIENT_TOKEN is placeholder — rejecting request')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: ZapiWebhookPayload
  try {
    body = await req.json() as ZapiWebhookPayload
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const messageId = body.messageId ?? body.zaapId
  if (!messageId || !body.status) {
    return NextResponse.json({ ok: true, skipped: true })
  }

  const admin = createAdminClient()
  const now = new Date().toISOString()

  const statusMap: Record<string, string> = {
    SENT: 'sent',
    DELIVERED: 'delivered',
    READ: 'read',
    ERROR: 'failed',
  }

  const newStatus = statusMap[body.status]
  if (!newStatus) {
    return NextResponse.json({ ok: true, skipped: true })
  }

  const update: Record<string, string | null> = { status: newStatus }
  if (body.status === 'SENT') update.sent_at = now
  if (body.status === 'DELIVERED') update.delivered_at = now
  if (body.status === 'READ') update.read_at = now

  const { error } = await admin
    .from('message_logs')
    .update(update as never)
    .eq('zapi_message_id', messageId)

  if (error) {
    console.error('[webhook/zapi] update error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
