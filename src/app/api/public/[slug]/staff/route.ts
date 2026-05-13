import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { TenantRow } from '@/types'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const { searchParams } = new URL(req.url)
  const serviceId = searchParams.get('serviceId')

  const admin = createAdminClient()
  const { data: t } = await admin.from('tenants').select('id, public_booking_enabled').eq('slug', slug).maybeSingle()
  const tenant = t as Pick<TenantRow, 'id' | 'public_booking_enabled'> | null
  if (!tenant?.public_booking_enabled) return NextResponse.json({ staff: [] })
  if (!serviceId) return NextResponse.json({ staff: [] })

  const { data: esRows } = await admin
    .from('employee_services')
    .select('user_id')
    .eq('tenant_id', tenant.id)
    .eq('service_id', serviceId) as { data: Array<{ user_id: string }> | null }

  if (!esRows || esRows.length === 0) return NextResponse.json({ staff: [] })

  const userIds = esRows.map((r) => r.user_id)

  const { data: usersData } = await admin
    .from('users')
    .select('id, full_name')
    .in('id', userIds)
    .eq('tenant_id', tenant.id)
    .eq('is_active', true) as { data: Array<{ id: string; full_name: string }> | null }

  return NextResponse.json({ staff: usersData ?? [] })
}
