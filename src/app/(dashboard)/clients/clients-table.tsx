'use client'

import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { DataTable, type DataTableColumn } from '@/components/shared/data-table'
import type { ClientRow, ClientStatus } from '@/types'

type Row = ClientRow & {
  _phone: string
  _total: string
  _last: string
}

const STATUS_LABEL: Record<ClientStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
  active: { label: 'Ativo', variant: 'default' },
  inactive: { label: 'Inativo', variant: 'secondary' },
  blocked: { label: 'Bloqueado', variant: 'destructive' },
}

const columns: DataTableColumn<Row>[] = [
  { key: 'name', header: 'Nome', render: (r) => <span className="font-medium">{r.full_name}</span> },
  { key: 'phone', header: 'Telefone', render: (r) => r._phone },
  {
    key: 'tags',
    header: 'Tags',
    render: (r) =>
      r.tags.length ? (
        <div className="flex gap-1 flex-wrap">
          {r.tags.map((t) => (
            <Badge key={t} variant="outline">{t}</Badge>
          ))}
        </div>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  { key: 'last', header: 'Último atendimento', render: (r) => r._last || <span className="text-muted-foreground">—</span> },
  { key: 'total', header: 'Total gasto', render: (r) => r._total, className: 'text-right' },
  {
    key: 'status',
    header: 'Status',
    render: (r) => {
      const v = STATUS_LABEL[r.status]
      return <Badge variant={v.variant}>{v.label}</Badge>
    },
  },
]

export function ClientsTable({
  rows,
  total,
  page,
  pageSize,
}: {
  rows: Row[]
  total: number
  page: number
  pageSize: number
}) {
  const router = useRouter()
  return (
    <DataTable
      columns={columns}
      rows={rows}
      total={total}
      page={page}
      pageSize={pageSize}
      searchPlaceholder="Buscar por nome ou telefone..."
      filters={[
        {
          name: 'status',
          label: 'Status',
          options: [
            { value: 'active', label: 'Ativo' },
            { value: 'inactive', label: 'Inativo' },
            { value: 'blocked', label: 'Bloqueado' },
          ],
        },
        {
          name: 'tag',
          label: 'Tag',
          options: [
            { value: 'vip', label: 'VIP' },
            { value: 'novo', label: 'Novo' },
            { value: 'atrasado', label: 'Atrasado' },
            { value: 'inativo', label: 'Inativo' },
          ],
        },
      ]}
      onRowClick={(row) => router.push(`/clients/${row.id}`)}
      emptyMessage="Nenhum cliente encontrado"
    />
  )
}
