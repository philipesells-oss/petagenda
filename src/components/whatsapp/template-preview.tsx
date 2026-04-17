'use client'

import { useMemo } from 'react'

const EXAMPLE_VARS: Record<string, string> = {
  client_name: 'Maria',
  pet_name: 'Rex',
  service_name: 'Banho e Tosa',
  date: '25/04/2026',
  time: '14:00',
  shop_name: 'PetAgenda',
}

interface Props {
  content: string
  className?: string
}

export function TemplatePreview({ content, className }: Props) {
  const rendered = useMemo(() => {
    return content.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
      return EXAMPLE_VARS[key] ?? `{{${key}}}`
    })
  }, [content])

  return (
    <div
      className={`rounded-xl bg-[#DCF8C6] px-4 py-3 text-sm text-gray-800 shadow-sm whitespace-pre-wrap max-w-xs ${className ?? ''}`}
    >
      {rendered || <span className="text-muted-foreground italic">Pré-visualização…</span>}
    </div>
  )
}
