'use client'

import { useState, useTransition } from 'react'
import { Pencil, Power } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ServiceForm } from './service-form'
import { toggleServiceStatus } from '@/actions/services'
import { useServices } from '@/hooks/use-services'
import type { ServiceCategory, ServiceRow } from '@/types'

const CATEGORY_LABELS: Record<ServiceCategory, string> = {
  grooming: 'Banho e Tosa',
  veterinary: 'Veterinário',
  daycare: 'Daycare',
  other: 'Outros',
}

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

interface ServicesTableProps {
  tenantId: string
}

export function ServicesTable({ tenantId }: ServicesTableProps) {
  const { services, loading, error, refresh } = useServices(tenantId)
  const [editing, setEditing] = useState<ServiceRow | null>(null)
  const [creating, setCreating] = useState(false)
  const [, startTransition] = useTransition()

  function handleToggle(service: ServiceRow) {
    startTransition(async () => {
      const result = await toggleServiceStatus(service.id, !service.is_active)
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success(
        service.is_active ? 'Serviço desativado' : 'Serviço ativado',
      )
      await refresh()
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Serviços</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie o catálogo de serviços do seu pet shop.
          </p>
        </div>
        <Button onClick={() => setCreating(true)}>Novo Serviço</Button>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Duração</TableHead>
              <TableHead>Preço base</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-8 text-center text-sm text-muted-foreground"
                >
                  Carregando…
                </TableCell>
              </TableRow>
            ) : services.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-8 text-center text-sm text-muted-foreground"
                >
                  Nenhum serviço cadastrado. Clique em “Novo Serviço”.
                </TableCell>
              </TableRow>
            ) : (
              services.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {s.color && (
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: s.color }}
                        />
                      )}
                      <span className="font-medium">{s.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{CATEGORY_LABELS[s.category]}</TableCell>
                  <TableCell>{s.duration_minutes} min</TableCell>
                  <TableCell>{currency.format(s.price)}</TableCell>
                  <TableCell>
                    {s.is_active ? (
                      <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        Ativo
                      </Badge>
                    ) : (
                      <Badge variant="outline">Inativo</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditing(s)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggle(s)}
                        title={s.is_active ? 'Desativar' : 'Ativar'}
                      >
                        <Power className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={creating} onOpenChange={(o) => !o && setCreating(false)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo Serviço</DialogTitle>
          </DialogHeader>
          <ServiceForm
            onSuccess={async () => {
              setCreating(false)
              await refresh()
            }}
            onCancel={() => setCreating(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Serviço</DialogTitle>
          </DialogHeader>
          {editing && (
            <ServiceForm
              service={editing}
              onSuccess={async () => {
                setEditing(null)
                await refresh()
              }}
              onCancel={() => setEditing(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
