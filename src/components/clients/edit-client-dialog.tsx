'use client'

import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ClientForm } from './client-form'
import { PetForm } from './pet-form'
import type { ClientRow } from '@/types'

export function EditClientDialog({ client }: { client: ClientRow }) {
  const [open, setOpen] = useState(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            <Pencil className="w-4 h-4 mr-2" /> Editar
          </Button>
        }
      />
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar cliente</DialogTitle>
        </DialogHeader>
        <ClientForm mode="edit" initial={client} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}

export function AddPetDialog({ clientId }: { clientId: string }) {
  const [open, setOpen] = useState(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm">Adicionar pet</Button>} />
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Novo pet</DialogTitle>
        </DialogHeader>
        <PetForm clientId={clientId} mode="create" onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
