import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { TenantRow, ServiceRow, BusinessHourRow } from '@/types'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const admin = createAdminClient()

  const { data: tenantData } = await admin
    .from('tenants')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  const tenant = tenantData as TenantRow | null

  if (!tenant) {
    return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
  }

  if (!tenant.public_booking_enabled) {
    return NextResponse.json({ error: 'Agendamento online não disponível' }, { status: 403 })
  }

  const { data: servicesData } = await admin
    .from('services')
    .select('*')
    .eq('tenant_id', tenant.id)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  const services = (servicesData ?? []) as ServiceRow[]

  const { data: hoursData } = await admin
    .from('business_hours')
    .select('*')
    .eq('tenant_id', tenant.id)

  const hours = (hoursData ?? []) as BusinessHourRow[]
  const closedDaysOfWeek = hours.filter((h) => !h.is_open).map((h) => h.day_of_week)

  return NextResponse.json({
    tenant: {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      phone: tenant.phone,
      booking_instructions: tenant.booking_instructions,
    },
    services: services.map((s) => ({
      id: s.id,
      name: s.name,
      duration_minutes: s.duration_minutes,
      price: Number(s.price),
      category: s.category,
    })),
    closedDaysOfWeek,
  })
}
