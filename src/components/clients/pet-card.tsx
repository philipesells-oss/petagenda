'use client'

import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { PetForm } from './pet-form'
import type { PetRow } from '@/types'

const speciesLabel: Record<string, string> = {
  dog: 'Cachorro',
  cat: 'Gato',
  bird: 'Pássaro',
  other: 'Outro',
}

const sizeLabel: Record<string, string> = {
  small: 'Pequeno',
  medium: 'Médio',
  large: 'Grande',
  giant: 'Gigante',
}

export function PetCard({ pet }: { pet: PetRow }) {
  const [open, setOpen] = useState(false)

  return (
    <Card>
      <CardContent className="p-4 flex gap-3 items-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-2xl shrink-0 overflow-hidden">
          {pet.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={pet.photo_url} alt={pet.name} className="w-full h-full object-cover" />
          ) : (
            <span>🐾</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold truncate">{pet.name}</h3>
            {pet.size && <Badge variant="secondary">{sizeLabel[pet.size]}</Badge>}
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {speciesLabel[pet.species] ?? pet.species}
            {pet.breed ? ` · ${pet.breed}` : ''}
          </p>
          {pet.temperament && (
            <p className="text-xs text-muted-foreground truncate">{pet.temperament}</p>
          )}
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={
              <Button variant="ghost" size="icon">
                <Pencil className="w-4 h-4" />
              </Button>
            }
          />
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Editar {pet.name}</DialogTitle>
            </DialogHeader>
            <PetForm
              clientId={pet.client_id}
              initial={pet}
              mode="edit"
              onSuccess={() => setOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
