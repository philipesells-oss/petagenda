'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createService, updateService } from '@/actions/services'
import type { ServiceCategory, ServiceRow } from '@/types'

const CATEGORY_LABELS: Record<ServiceCategory, string> = {
  grooming: 'Banho e Tosa',
  veterinary: 'Veterinário',
  daycare: 'Daycare',
  other: 'Outros',
}

const COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#64748b',
]

interface ServiceFormProps {
  service?: ServiceRow | null
  onSuccess?: () => void
  onCancel?: () => void
}

export function ServiceForm({ service, onSuccess, onCancel }: ServiceFormProps) {
  const isEdit = !!service
  const [pending, startTransition] = useTransition()
  const [usePriceBySize, setUsePriceBySize] = useState(
    !!service?.price_by_size,
  )
  const [color, setColor] = useState<string | null>(service?.color ?? null)

  const pbs = (service?.price_by_size ?? {}) as {
    small?: number
    medium?: number
    large?: number
    giant?: number
  }

  function handleSubmit(formData: FormData) {
    // inject current color selection
    if (color) formData.set('color', color); else formData.delete('color')
    if (!usePriceBySize) {
      formData.delete('price_small')
      formData.delete('price_medium')
      formData.delete('price_large')
      formData.delete('price_giant')
    }

    startTransition(async () => {
      const result = isEdit && service
        ? await updateService(service.id, formData)
        : await createService(formData)

      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success(isEdit ? 'Serviço atualizado' : 'Serviço criado')
      onSuccess?.()
    })
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome</Label>
        <Input
          id="name"
          name="name"
          required
          defaultValue={service?.name ?? ''}
          placeholder="Ex: Banho completo"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          name="description"
          rows={2}
          defaultValue={service?.description ?? ''}
          placeholder="Opcional"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="category">Categoria</Label>
          <Select
            name="category"
            defaultValue={service?.category ?? 'grooming'}
          >
            <SelectTrigger id="category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(CATEGORY_LABELS) as ServiceCategory[]).map((c) => (
                <SelectItem key={c} value={c}>
                  {CATEGORY_LABELS[c]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="duration_minutes">Duração (min)</Label>
          <Input
            id="duration_minutes"
            name="duration_minutes"
            type="number"
            min={5}
            step={5}
            required
            defaultValue={service?.duration_minutes ?? 60}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="price">Preço base (R$)</Label>
        <Input
          id="price"
          name="price"
          type="number"
          min={0}
          step="0.01"
          required
          defaultValue={service?.price ?? 0}
        />
      </div>

      <div className="space-y-2 rounded-lg border p-3">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={usePriceBySize}
            onChange={(e) => setUsePriceBySize(e.target.checked)}
            className="h-4 w-4"
          />
          Preço por porte do pet
        </label>
        {usePriceBySize && (
          <div className="grid gap-3 sm:grid-cols-2">
            {(['small', 'medium', 'large', 'giant'] as const).map((size) => {
              const labels = {
                small: 'Pequeno',
                medium: 'Médio',
                large: 'Grande',
                giant: 'Gigante',
              } as const
              return (
                <div key={size} className="space-y-1">
                  <Label htmlFor={`price_${size}`} className="text-xs">
                    {labels[size]} (R$)
                  </Label>
                  <Input
                    id={`price_${size}`}
                    name={`price_${size}`}
                    type="number"
                    min={0}
                    step="0.01"
                    defaultValue={pbs[size] ?? ''}
                  />
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label>Cor</Label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setColor(null)}
            className={`h-8 w-8 rounded-full border-2 transition flex items-center justify-center text-xs text-muted-foreground bg-muted ${
              !color ? 'border-foreground' : 'border-transparent'
            }`}
            aria-label="Sem cor"
            title="Sem cor"
          >✕</button>
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`h-8 w-8 rounded-full border-2 transition ${
                color === c ? 'border-foreground' : 'border-transparent'
              }`}
              style={{ backgroundColor: c }}
              aria-label={`Cor ${c}`}
            />
          ))}
        </div>
      </div>

      <div className="space-y-2 rounded-lg border p-3">
        <div>
          <Label htmlFor="max_capacity" className="text-sm font-medium">
            Vagas simultâneas
          </Label>
          <p className="text-xs text-muted-foreground">
            Quantos pets podem ser atendidos ao mesmo tempo neste serviço.
          </p>
        </div>
        <Input
          id="max_capacity"
          name="max_capacity"
          type="number"
          min={1}
          max={20}
          required
          defaultValue={service?.max_capacity ?? 1}
          className="w-24"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={pending}>
          {pending ? 'Salvando…' : isEdit ? 'Salvar' : 'Criar serviço'}
        </Button>
      </div>
    </form>
  )
}
