'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2Icon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { saveWhatsappConfig } from '@/actions/whatsapp'

export function SetupForm() {
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    const form = e.currentTarget
    const fd = new FormData(form)
    const result = await saveWhatsappConfig(fd)
    setPending(false)
    if (result.ok) {
      toast.success('Configuração salva! Aguarde o QR Code.')
    } else {
      toast.error(result.error)
    }
  }

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Conectar WhatsApp</CardTitle>
        <CardDescription>
          Insira as credenciais da sua instância Z-API para conectar seu número.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="zapi_instance">Instance ID</Label>
            <Input
              id="zapi_instance"
              name="zapi_instance"
              placeholder="ex: 3A1B2C3D4E5F"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="zapi_token">Token</Label>
            <Input
              id="zapi_token"
              name="zapi_token"
              type="password"
              placeholder="Token da instância Z-API"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="zapi_client_token">
              Client Token{' '}
              <span className="text-muted-foreground font-normal">(opcional)</span>
            </Label>
            <Input
              id="zapi_client_token"
              name="zapi_client_token"
              type="password"
              placeholder="Security Client Token"
            />
          </div>
          <Button type="submit" disabled={pending} className="w-full">
            {pending && <Loader2Icon className="mr-2 size-4 animate-spin" />}
            Salvar e conectar
          </Button>
        </form>

        <p className="mt-4 text-xs text-muted-foreground">
          Acesse{' '}
          <span className="font-medium">app.z-api.io</span> para obter suas credenciais.
        </p>
      </CardContent>
    </Card>
  )
}
