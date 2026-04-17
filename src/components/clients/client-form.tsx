'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { formatPhone } from '@/lib/utils/format'
import { createClientAction, updateClientAction } from '@/actions/clients'
import type { ClientRow } from '@/types'

interface Props {
  initial?: Partial<ClientRow>
  mode: 'create' | 'edit'
  onSuccess?: () => void
}

export function ClientForm({ initial, mode, onSuccess }: Props) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [phone, setPhone] = useState(formatPhone(initial?.phone ?? ''))

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    setErrors({})
    const fd = new FormData(e.currentTarget)

    const result =
      mode === 'create'
        ? await createClientAction(fd)
        : await updateClientAction(initial!.id!, fd)

    if (!result.ok) {
      setErrors(result.fieldErrors ?? {})
      toast.error(result.error)
      setSubmitting(false)
      return
    }

    toast.success(mode === 'create' ? 'Cliente criado!' : 'Cliente atualizado!')
    if (mode === 'create' && 'data' in result && result.data) {
      router.push(`/clients/${result.data.id}`)
    } else {
      onSuccess?.()
      router.refresh()
    }
    setSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="full_name">Nome completo *</Label>
        <Input id="full_name" name="full_name" defaultValue={initial?.full_name ?? ''} required />
        {errors.full_name && <p className="text-sm text-destructive mt-1">{errors.full_name[0]}</p>}
      </div>

      <div>
        <Label htmlFor="phone">Telefone *</Label>
        <Input
          id="phone"
          name="phone"
          value={phone}
          onChange={(e) => setPhone(formatPhone(e.target.value))}
          placeholder="(11) 98765-4321"
          required
        />
        {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone[0]}</p>}
      </div>

      <div>
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" name="email" type="email" defaultValue={initial?.email ?? ''} />
        {errors.email && <p className="text-sm text-destructive mt-1">{errors.email[0]}</p>}
      </div>

      <div>
        <Label htmlFor="cpf">CPF (opcional)</Label>
        <Input id="cpf" name="cpf" defaultValue={initial?.cpf ?? ''} />
      </div>

      <div>
        <Label htmlFor="notes">Notas</Label>
        <Textarea id="notes" name="notes" rows={3} defaultValue={initial?.notes ?? ''} />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="whatsapp_opt_in"
          name="whatsapp_opt_in"
          type="checkbox"
          defaultChecked={initial?.whatsapp_opt_in ?? true}
          className="h-4 w-4"
        />
        <Label htmlFor="whatsapp_opt_in" className="font-normal">
          Aceita receber mensagens no WhatsApp
        </Label>
      </div>

      <Button type="submit" disabled={submitting}>
        {submitting ? 'Salvando...' : mode === 'create' ? 'Criar cliente' : 'Salvar'}
      </Button>
    </form>
  )
}
