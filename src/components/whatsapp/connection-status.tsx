'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Loader2Icon, WifiIcon, WifiOffIcon, RefreshCwIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { disconnectWhatsapp, getZapiStatus } from '@/actions/whatsapp'
import type { WhatsappConfig } from '@/actions/whatsapp'

interface Props {
  config: WhatsappConfig
}

const STATUS_LABELS: Record<string, string> = {
  connected: 'Conectado',
  disconnected: 'Desconectado',
  connecting: 'Conectando…',
  error: 'Erro',
}

const STATUS_VARIANTS: Record<
  string,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  connected: 'default',
  disconnected: 'secondary',
  connecting: 'outline',
  error: 'destructive',
}

export function ConnectionStatus({ config }: Props) {
  const [status, setStatus] = useState(config.status)
  const [phone, setPhone] = useState(config.phone_number)
  const [isPending, startTransition] = useTransition()

  function handleRefresh() {
    startTransition(async () => {
      const result = await getZapiStatus()
      if (result.ok) {
        setStatus(result.data.status as WhatsappConfig['status'])
        setPhone(result.data.phone)
        toast.success('Status atualizado')
      } else {
        toast.error(result.error)
      }
    })
  }

  function handleDisconnect() {
    startTransition(async () => {
      const result = await disconnectWhatsapp()
      if (result.ok) {
        setStatus('disconnected')
        setPhone(null)
        toast.success('WhatsApp desconectado')
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          {status === 'connected' ? (
            <WifiIcon className="size-4 text-green-500" />
          ) : (
            <WifiOffIcon className="size-4 text-muted-foreground" />
          )}
          Status da Conexão
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Badge variant={STATUS_VARIANTS[status] ?? 'secondary'}>
            {STATUS_LABELS[status] ?? status}
          </Badge>
          {phone && (
            <span className="text-sm text-muted-foreground">📱 {phone}</span>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2Icon className="size-3.5 animate-spin" />
            ) : (
              <RefreshCwIcon className="size-3.5" />
            )}
            <span className="ml-1.5">Verificar</span>
          </Button>

          {status === 'connected' && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDisconnect}
              disabled={isPending}
            >
              Desconectar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
