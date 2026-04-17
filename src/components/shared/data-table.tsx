'use client'

/**
 * Generic DataTable with search + filter + pagination.
 * URL-driven state survives navigation.
 */

import { useCallback, useEffect, useState, useTransition } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export interface DataTableColumn<T> {
  key: string
  header: string
  render: (row: T) => React.ReactNode
  className?: string
}

export interface DataTableFilter {
  name: string
  label: string
  options: { value: string; label: string }[]
}

interface Props<T> {
  columns: DataTableColumn<T>[]
  rows: T[]
  total: number
  page: number
  pageSize: number
  searchPlaceholder?: string
  filters?: DataTableFilter[]
  onRowClick?: (row: T) => void
  emptyMessage?: string
}

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  total,
  page,
  pageSize,
  searchPlaceholder = 'Buscar...',
  filters = [],
  onRowClick,
  emptyMessage = 'Nenhum resultado',
}: Props<T>) {
  const router = useRouter()
  const pathname = usePathname()
  const sp = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [searchInput, setSearchInput] = useState(sp.get('q') ?? '')

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const pushParams = useCallback(
    (updates: Record<string, string | null>) => {
      const next = new URLSearchParams(sp.toString())
      Object.entries(updates).forEach(([k, v]) => {
        if (v === null || v === '') next.delete(k)
        else next.set(k, v)
      })
      startTransition(() => {
        router.push(`${pathname}?${next.toString()}`)
      })
    },
    [sp, pathname, router],
  )

  useEffect(() => {
    const h = setTimeout(() => {
      if ((sp.get('q') ?? '') !== searchInput) {
        pushParams({ q: searchInput || null, page: '1' })
      }
    }, 350)
    return () => clearTimeout(h)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        <Input
          placeholder={searchPlaceholder}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="max-w-xs"
        />
        {filters.map((f) => (
          <Select
            key={f.name}
            value={sp.get(f.name) ?? 'all'}
            onValueChange={(v) =>
              pushParams({ [f.name]: v === 'all' ? null : v, page: '1' })
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={f.label} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {f.options.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}
      </div>

      <div className="rounded-md border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((c) => (
                <TableHead key={c.key} className={c.className}>
                  {c.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center text-muted-foreground py-8">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={onRowClick ? 'cursor-pointer hover:bg-muted/50' : ''}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {columns.map((c) => (
                    <TableCell key={c.key} className={c.className}>
                      {c.render(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <span>
          {total} resultado{total === 1 ? '' : 's'} · Página {page} de {totalPages}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || isPending}
            onClick={() => pushParams({ page: String(page - 1) })}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages || isPending}
            onClick={() => pushParams({ page: String(page + 1) })}
          >
            Próxima
          </Button>
        </div>
      </div>
    </div>
  )
}
