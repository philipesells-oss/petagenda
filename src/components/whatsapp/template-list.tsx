'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { PencilIcon, Trash2Icon, PlusIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { TemplateEditor } from './template-editor'
import { deleteTemplate, toggleTemplate } from '@/actions/whatsapp'
import type { MessageTemplate } from '@/actions/whatsapp'

const CATEGORY_LABELS: Record<string, string> = {
  confirmation: 'Confirmação',
  reminder: 'Lembrete',
  reactivation: 'Reativação',
  post_service: 'Pós-atendimento',
  promotion: 'Promoção',
  custom: 'Personalizado',
}

interface Props {
  templates: MessageTemplate[]
}

export function TemplateList({ templates: initial }: Props) {
  const [templates, setTemplates] = useState(initial)
  const [editing, setEditing] = useState<MessageTemplate | null>(null)
  const [creating, setCreating] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleClose() {
    setEditing(null)
    setCreating(false)
    // Trigger revalidation by reloading — the parent is a server component
    window.location.reload()
  }

  function handleToggle(id: string, isActive: boolean) {
    startTransition(async () => {
      const result = await toggleTemplate(id, isActive)
      if (result.ok) {
        setTemplates((prev) =>
          prev.map((t) => (t.id === id ? { ...t, is_active: isActive } : t)),
        )
      } else {
        toast.error(result.error)
      }
    })
  }

  function handleDelete(id: string) {
    if (!confirm('Deletar este template?')) return
    startTransition(async () => {
      const result = await deleteTemplate(id)
      if (result.ok) {
        setTemplates((prev) => prev.filter((t) => t.id !== id))
        toast.success('Template deletado')
      } else {
        toast.error(result.error)
      }
    })
  }

  // Group by category
  const grouped = templates.reduce<Record<string, MessageTemplate[]>>((acc, t) => {
    const key = t.category
    acc[key] = [...(acc[key] ?? []), t]
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setCreating(true)} size="sm">
          <PlusIcon className="mr-1.5 size-4" />
          Novo Template
        </Button>
      </div>

      {Object.entries(grouped).map(([category, items]) => (
        <Card key={category}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              {CATEGORY_LABELS[category] ?? category}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {items.map((t) => (
              <div
                key={t.id}
                className="flex items-start justify-between gap-3 rounded-lg border p-3"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-sm">{t.name}</span>
                    {t.is_default && (
                      <Badge variant="secondary" className="text-xs">
                        Padrão
                      </Badge>
                    )}
                    {!t.is_active && (
                      <Badge variant="outline" className="text-xs text-muted-foreground">
                        Inativo
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{t.content}</p>
                  {t.variables.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {t.variables.map((v) => (
                        <span
                          key={v}
                          className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
                        >
                          {`{{${v}}}`}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  {!t.is_default && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() =>
                          handleToggle(t.id, !t.is_active)
                        }
                        disabled={isPending}
                        title={t.is_active ? 'Desativar' : 'Ativar'}
                      >
                        <span className="text-base">{t.is_active ? '✅' : '⭕'}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => setEditing(t)}
                      >
                        <PencilIcon className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-destructive"
                        onClick={() => handleDelete(t.id)}
                        disabled={isPending}
                      >
                        <Trash2Icon className="size-3.5" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      {/* Create dialog */}
      <Dialog open={creating} onOpenChange={(open) => !open && setCreating(false)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo Template</DialogTitle>
          </DialogHeader>
          <TemplateEditor onClose={handleClose} />
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Template</DialogTitle>
          </DialogHeader>
          {editing && <TemplateEditor template={editing} onClose={handleClose} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}
