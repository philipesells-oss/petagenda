'use client'

import { useState, useRef } from 'react'
import { toast } from 'sonner'
import { Loader2Icon } from 'lucide-react'

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
import { Badge } from '@/components/ui/badge'
import { TemplatePreview } from './template-preview'
import { createTemplate, updateTemplate } from '@/actions/whatsapp'
import type { MessageTemplate } from '@/actions/whatsapp'

const CATEGORIES = [
  { value: 'confirmation', label: 'Confirmação' },
  { value: 'reminder', label: 'Lembrete' },
  { value: 'reactivation', label: 'Reativação' },
  { value: 'post_service', label: 'Pós-atendimento' },
  { value: 'promotion', label: 'Promoção' },
  { value: 'custom', label: 'Personalizado' },
]

const VARIABLES = [
  'client_name',
  'pet_name',
  'service_name',
  'date',
  'time',
  'shop_name',
]

interface Props {
  template?: MessageTemplate
  onClose: () => void
}

export function TemplateEditor({ template, onClose }: Props) {
  const [pending, setPending] = useState(false)
  const [content, setContent] = useState(template?.content ?? '')
  const [category, setCategory] = useState(template?.category ?? 'custom')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function insertVar(varName: string) {
    const ta = textareaRef.current
    if (!ta) {
      setContent((c) => c + `{{${varName}}}`)
      return
    }
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const newContent =
      content.substring(0, start) + `{{${varName}}}` + content.substring(end)
    setContent(newContent)
    setTimeout(() => {
      ta.focus()
      ta.setSelectionRange(start + varName.length + 4, start + varName.length + 4)
    }, 0)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    const fd = new FormData(e.currentTarget)
    fd.set('content', content)
    fd.set('category', category)

    const result = template
      ? await updateTemplate(template.id, fd)
      : await createTemplate(fd)

    setPending(false)
    if (result.ok) {
      toast.success(template ? 'Template atualizado' : 'Template criado')
      onClose()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">Nome</Label>
        <Input
          id="name"
          name="name"
          defaultValue={template?.name ?? ''}
          placeholder="Ex: Lembrete personalizado"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label>Categoria</Label>
        <Select value={category} onValueChange={(v) => v && setCategory(v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>Variáveis disponíveis</Label>
        <div className="flex flex-wrap gap-1.5">
          {VARIABLES.map((v) => (
            <button key={v} type="button" onClick={() => insertVar(v)}>
              <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                {`{{${v}}}`}
              </Badge>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="content">Mensagem</Label>
        <Textarea
          id="content"
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Digite a mensagem. Clique nas variáveis acima para inserir."
          rows={4}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Pré-visualização</Label>
        <TemplatePreview content={content} />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" disabled={pending}>
          {pending && <Loader2Icon className="mr-2 size-4 animate-spin" />}
          {template ? 'Salvar' : 'Criar template'}
        </Button>
      </div>
    </form>
  )
}
