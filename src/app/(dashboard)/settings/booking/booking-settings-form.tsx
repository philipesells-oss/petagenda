'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { CopyIcon, CheckIcon, ExternalLinkIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { updateBookingSettings } from '@/actions/tenant'

interface Props {
  tenantId: string
  slug: string
  initialEnabled: boolean
  initialInstructions: string
  bookingUrl: string
}

export function BookingSettingsForm({
  tenantId,
  initialEnabled,
  initialInstructions,
  bookingUrl,
}: Props) {
  const [enabled, setEnabled] = useState(initialEnabled)
  const [instructions, setInstructions] = useState(initialInstructions)
  const [copied, setCopied] = useState(false)
  const [isPending, startTransition] = useTransition()

  function copyLink() {
    navigator.clipboard.writeText(bookingUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function save() {
    startTransition(async () => {
      const result = await updateBookingSettings(tenantId, { enabled, instructions })
      if (result.ok) {
        toast.success('Configurações salvas')
      } else {
        toast.error(result.error ?? 'Erro ao salvar')
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Toggle */}
      <div className="flex items-start justify-between gap-4 rounded-xl border border-border bg-card p-5">
        <div>
          <p className="font-medium">Agendamento online ativo</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Quando ativo, clientes podem agendar pelo link público.
          </p>
        </div>
        <button
          role="switch"
          aria-checked={enabled}
          onClick={() => setEnabled((v) => !v)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
            enabled ? 'bg-emerald-600' : 'bg-muted-foreground/30'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 translate-x-1 rounded-full bg-white shadow transition-transform ${
              enabled ? 'translate-x-6' : ''
            }`}
          />
        </button>
      </div>

      {/* Booking URL */}
      <div className="space-y-2">
        <Label>Link de agendamento</Label>
        <div className="flex gap-2">
          <div className="flex-1 rounded-md border border-border bg-muted px-3 py-2 text-sm text-muted-foreground break-all select-all">
            {bookingUrl}
          </div>
          <Button variant="outline" size="icon" onClick={copyLink} title="Copiar link">
            {copied ? <CheckIcon className="h-4 w-4 text-emerald-600" /> : <CopyIcon className="h-4 w-4" />}
          </Button>
          <a
            href={bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Abrir página"
            className="inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-border bg-background hover:bg-muted"
          >
            <ExternalLinkIcon className="h-4 w-4" />
          </a>
        </div>
        <p className="text-xs text-muted-foreground">Compartilhe este link com seus clientes.</p>
      </div>

      {/* QR Code */}
      <div className="space-y-2">
        <Label>QR Code</Label>
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <div className="rounded-xl border border-border bg-white p-3 shadow-sm dark:bg-gray-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(bookingUrl)}&margin=0`}
              alt="QR Code de agendamento"
              width={160}
              height={160}
              className="rounded"
            />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Imprima e cole no balcão</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              O cliente aponta a câmera do celular e abre direto a página de agendamento — sem precisar digitar nada.
            </p>
            <a
              href={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(bookingUrl)}&margin=10`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-xs text-blue-600 hover:underline dark:text-blue-400"
            >
              Baixar QR Code em alta resolução →
            </a>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="space-y-2">
        <Label htmlFor="instructions">Mensagem para clientes (opcional)</Label>
        <Textarea
          id="instructions"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="Ex: Confirmaremos seu agendamento em até 1h pelo WhatsApp."
          maxLength={280}
          rows={3}
        />
        <p className="text-xs text-muted-foreground">
          Aparece no topo da página de agendamento. Máx. 280 caracteres.
        </p>
      </div>

      <Button onClick={save} disabled={isPending} className="w-full sm:w-auto">
        {isPending ? 'Salvando...' : 'Salvar configurações'}
      </Button>
    </div>
  )
}
