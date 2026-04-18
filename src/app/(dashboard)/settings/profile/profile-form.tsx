'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateTenantProfile } from '@/actions/tenant'

interface ProfileFormProps {
  defaultName: string
  defaultPhone: string
  defaultAddress: string
}

export function ProfileForm({
  defaultName,
  defaultPhone,
  defaultAddress,
}: ProfileFormProps) {
  const [pending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await updateTenantProfile(fd)
      if (!res.ok) {
        toast.error(res.error)
        return
      }
      toast.success('Informações atualizadas.')
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="tenant-name">Nome do pet shop *</Label>
        <Input
          id="tenant-name"
          name="name"
          defaultValue={defaultName}
          placeholder="Meu Pet Shop"
          required
          minLength={2}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="tenant-phone">Telefone</Label>
        <Input
          id="tenant-phone"
          name="phone"
          defaultValue={defaultPhone}
          placeholder="(11) 98765-4321"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="tenant-address">Endereço</Label>
        <Input
          id="tenant-address"
          name="address"
          defaultValue={defaultAddress}
          placeholder="Rua Exemplo, 123 - Bairro, Cidade - UF"
        />
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? 'Salvando…' : 'Salvar alterações'}
        </Button>
      </div>
    </form>
  )
}
