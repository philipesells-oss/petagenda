'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  createPetAction,
  updatePetAction,
  uploadPetPhotoAction,
} from '@/actions/clients'
import type { PetRow } from '@/types'

interface Props {
  clientId: string
  initial?: Partial<PetRow>
  mode: 'create' | 'edit'
  onSuccess?: () => void
}

export function PetForm({ clientId, initial, mode, onSuccess }: Props) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [species, setSpecies] = useState<string>(initial?.species ?? 'dog')
  const [size, setSize] = useState<string>(initial?.size ?? '')
  const [gender, setGender] = useState<string>(initial?.gender ?? '')
  const [photoUrl, setPhotoUrl] = useState<string | null>(initial?.photo_url ?? null)

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!initial?.id) {
      toast.error('Salve o pet antes de enviar a foto')
      return
    }
    const fd = new FormData()
    fd.append('file', file)
    const res = await uploadPetPhotoAction(initial.id, fd)
    if (res.ok) {
      setPhotoUrl(res.data.url)
      toast.success('Foto enviada!')
      router.refresh()
    } else {
      toast.error(res.error)
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    fd.set('species', species)
    fd.set('size', size)
    fd.set('gender', gender)

    const result =
      mode === 'create'
        ? await createPetAction(clientId, fd)
        : await updatePetAction(initial!.id!, fd)

    if (result.ok) {
      toast.success(mode === 'create' ? 'Pet cadastrado!' : 'Pet atualizado!')
      onSuccess?.()
      router.refresh()
    } else {
      toast.error(result.error)
    }
    setSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <Label htmlFor="name">Nome *</Label>
          <Input id="name" name="name" defaultValue={initial?.name ?? ''} required />
        </div>

        <div>
          <Label>Espécie *</Label>
          <Select value={species} onValueChange={(v) => setSpecies(v ?? 'dog')}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="dog">Cachorro</SelectItem>
              <SelectItem value="cat">Gato</SelectItem>
              <SelectItem value="bird">Pássaro</SelectItem>
              <SelectItem value="other">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="breed">Raça</Label>
          <Input id="breed" name="breed" defaultValue={initial?.breed ?? ''} />
        </div>

        <div>
          <Label>Porte</Label>
          <Select value={size} onValueChange={(v) => setSize(v ?? '')}>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Pequeno</SelectItem>
              <SelectItem value="medium">Médio</SelectItem>
              <SelectItem value="large">Grande</SelectItem>
              <SelectItem value="giant">Gigante</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="weight">Peso (kg)</Label>
          <Input
            id="weight"
            name="weight"
            type="number"
            step="0.1"
            defaultValue={initial?.weight ?? ''}
          />
        </div>

        <div>
          <Label htmlFor="birth_date">Nascimento</Label>
          <Input id="birth_date" name="birth_date" type="date" defaultValue={initial?.birth_date ?? ''} />
        </div>

        <div>
          <Label>Gênero</Label>
          <Select value={gender} onValueChange={(v) => setGender(v ?? '')}>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Macho</SelectItem>
              <SelectItem value="female">Fêmea</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="coat_type">Pelagem</Label>
          <Input id="coat_type" name="coat_type" defaultValue={initial?.coat_type ?? ''} />
        </div>

        <div className="col-span-2">
          <Label htmlFor="temperament">Temperamento</Label>
          <Input id="temperament" name="temperament" defaultValue={initial?.temperament ?? ''} />
        </div>

        <div className="col-span-2">
          <Label htmlFor="health_notes">Alergias / observações de saúde</Label>
          <Textarea id="health_notes" name="health_notes" rows={2} defaultValue={initial?.health_notes ?? ''} />
        </div>

        {mode === 'edit' && (
          <div className="col-span-2">
            <Label htmlFor="photo">Foto do pet</Label>
            {photoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoUrl} alt="Pet" className="w-24 h-24 rounded-full object-cover mb-2" />
            )}
            <Input id="photo" type="file" accept="image/*" onChange={handlePhotoUpload} />
          </div>
        )}
      </div>

      <Button type="submit" disabled={submitting}>
        {submitting ? 'Salvando...' : mode === 'create' ? 'Cadastrar pet' : 'Salvar'}
      </Button>
    </form>
  )
}
