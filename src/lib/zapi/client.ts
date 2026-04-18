/**
 * Z-API Client — Server-side only wrapper for WhatsApp messaging.
 * Credentials (instanceId, token) are passed per call — never stored in module scope.
 */

export interface ZapiStatus {
  connected: boolean
  phone: string | null
  session: string
}

export interface ZapiQrCode {
  value: string // base64 image
}

export interface ZapiSendResult {
  messageId: string
}

export class ZapiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message)
    this.name = 'ZapiError'
  }
}

function base(instance: string, token: string) {
  return `https://api.z-api.io/instances/${instance}/token/${token}`
}

async function zapiGet<T>(
  instance: string,
  token: string,
  path: string,
  clientToken?: string,
): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (clientToken) headers['Client-Token'] = clientToken

  const res = await fetch(`${base(instance, token)}${path}`, { headers, cache: 'no-store' })

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new ZapiError(text, res.status)
  }
  return res.json() as Promise<T>
}

async function zapiPost<T>(
  instance: string,
  token: string,
  path: string,
  body?: unknown,
  clientToken?: string,
): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (clientToken) headers['Client-Token'] = clientToken

  const res = await fetch(`${base(instance, token)}${path}`, {
    method: 'POST',
    headers,
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  })

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new ZapiError(text, res.status)
  }
  return res.json() as Promise<T>
}

export async function zapiGetStatus(
  instance: string,
  token: string,
  clientToken?: string,
): Promise<ZapiStatus> {
  return zapiGet<ZapiStatus>(instance, token, '/status', clientToken)
}

export async function zapiGetQrCode(
  instance: string,
  token: string,
  clientToken?: string,
): Promise<ZapiQrCode> {
  return zapiGet<ZapiQrCode>(instance, token, '/qr-code/image', clientToken)
}

export async function zapiDisconnect(
  instance: string,
  token: string,
  clientToken?: string,
): Promise<void> {
  await zapiPost(instance, token, '/disconnect', undefined, clientToken)
}

export async function zapiSendText(
  instance: string,
  token: string,
  phone: string,
  message: string,
  clientToken?: string,
): Promise<ZapiSendResult> {
  return zapiPost<ZapiSendResult>(
    instance,
    token,
    '/send-text',
    { phone, message },
    clientToken,
  )
}
