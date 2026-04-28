import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { buttonVariants } from '@/components/ui/button'
import { ClientsTable } from './clients-table'
import { formatPhone, formatCurrency, formatDate } from '@/lib/utils/format'
import { getT } from '@/lib/server-i18n'
import type { ClientRow, ClientStatus } from '@/types'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 20

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function ClientsPage({ searchParams }: PageProps) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const t = await getT()
  const sp = await searchParams
  const q = typeof sp.q === 'string' ? sp.q : ''
  const status = typeof sp.status === 'string' ? sp.status : null
  const tag = typeof sp.tag === 'string' ? sp.tag : null
  const page = Math.max(1, parseInt(typeof sp.page === 'string' ? sp.page : '1', 10) || 1)

  const supabase = await createClient()
  let query = supabase
    .from('clients')
    .select('*', { count: 'exact' })
    .eq('tenant_id', user.tenantId)
    .order('full_name', { ascending: true })

  if (q) {
    const qDigits = q.replace(/\D/g, '')
    if (qDigits.length >= 3) {
      query = query.or(`full_name.ilike.%${q}%,phone.ilike.%${qDigits}%`)
    } else {
      query = query.ilike('full_name', `%${q}%`)
    }
  }
  if (status && ['active', 'inactive', 'blocked'].includes(status)) {
    query = query.eq('status', status as ClientStatus)
  }
  if (tag) {
    query = query.contains('tags', [tag])
  }

  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1
  const { data, count } = await query.range(from, to)

  const clients = (data ?? []) as ClientRow[]

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t.clients.title}</h1>
          <p className="text-muted-foreground text-sm">{t.clients.subtitle}</p>
        </div>
        <Link href="/clients/new" className={buttonVariants()}>
          <Plus className="w-4 h-4 mr-2" /> {t.clients.new}
        </Link>
      </div>

      <ClientsTable
        rows={clients.map((c) => ({
          ...c,
          _phone: formatPhone(c.phone),
          _total: formatCurrency(c.total_spent),
          _last: formatDate(c.last_visit_at ?? ''),
        }))}
        total={count ?? 0}
        page={page}
        pageSize={PAGE_SIZE}
      />
    </div>
  )
}
