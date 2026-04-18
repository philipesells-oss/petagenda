'use client'

import { useState, useEffect, useCallback } from 'react'
import { Loader2Icon, QrCodeIcon } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getZapiQrCode, getZapiStatus } from '@/actions/whatsapp'
import type { WhatsappConfig } from '@/actions/whatsapp'

interface Props {
  initialStatus: WhatsappConfig['status']
}

export function QrCodeCard({ initialStatus }: Props) {
  const [qrBase64, setQrBase64] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [connected, setConnected] = useState(initialStatus === 'connected')
  const [error, setError] = useState<string | null>(null)

  const fetchQr = useCallback(async () => {
    setLoading(true)
    setError(null)
    const result = await getZapiQrCode()
    setLoading(false)
    if (result.ok) {
      setQrBase64(result.data.value)
    } else {
      setError(result.error)
    }
  }, [])

  const checkStatus = useCallback(async () => {
    const result = await getZapiStatus()
    if (result.ok && result.data.connected) {
      setConnected(true)
    }
  }, [])

  // Poll status every 5s while showing QR
  useEffect(() => {
    if (connected || !qrBase64) return
    const interval = setInterval(checkStatus, 5000)
    return () => clearInterval(interval)
  }, [connected, qrBase64, checkStatus])

  if (connected) {
    return (
      <Card>
        <CardContent className="flex items-center gap-3 py-6">
          <span className="text-2xl">✅</span>
          <div>
            <p className="font-medium">WhatsApp Conectado!</p>
            <p className="text-sm text-muted-foreground">
              Seu número está ativo e pronto para enviar mensagens.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <QrCodeIcon className="size-4" />
          QR Code
        </CardTitle>
        <CardDescription>
          Abra o WhatsApp no celular → Aparelhos conectados → Conectar aparelho
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!qrBase64 && !loading && (
          <Button onClick={fetchQr} variant="outline">
            Gerar QR Code
          </Button>
        )}

        {loading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2Icon className="size-4 animate-spin" />
            <span className="text-sm">Carregando…</span>
          </div>
        )}

        {error && (
          <div className="space-y-2">
            <p className="text-sm text-destructive">{error}</p>
            <Button onClick={fetchQr} variant="outline" size="sm">
              Tentar novamente
            </Button>
          </div>
        )}

        {qrBase64 && !loading && (
          <div className="space-y-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`data:image/png;base64,${qrBase64}`}
              alt="QR Code WhatsApp"
              className="size-48 rounded-lg border"
            />
            <p className="text-xs text-muted-foreground">
              Verificando conexão automaticamente…
            </p>
            <Button onClick={fetchQr} variant="ghost" size="sm">
              Novo QR Code
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
