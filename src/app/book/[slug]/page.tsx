import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { BookingWizard } from './booking-wizard'
import type { Metadata } from 'next'
import type { TenantRow, ServiceRow, BusinessHourRow } from '@/types'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const admin = createAdminClient()
  const { data } = await admin.from('tenants').select('*').eq('slug', slug).maybeSingle()
  const t = data as TenantRow | null
  if (!t?.public_booking_enabled) return { title: 'Agendamento | PetFlow' }
  return { title: `Agendar em ${t.name} | PetFlow` }
}

export default async function PublicBookingPage({ params }: Props) {
  const { slug } = await params
  const admin = createAdminClient()

  const { data: td } = await admin.from('tenants').select('*').eq('slug', slug).maybeSingle()
  const tenant = td as TenantRow | null

  if (!tenant?.public_booking_enabled) notFound()

  const { data: sd } = await admin
    .from('services').select('*').eq('tenant_id', tenant.id).eq('is_active', true).order('sort_order', { ascending: true })
  const services = (sd ?? []) as ServiceRow[]

  const { data: hd } = await admin.from('business_hours').select('*').eq('tenant_id', tenant.id)
  const hours = (hd ?? []) as BusinessHourRow[]
  const closedDaysOfWeek = hours.filter((h) => !h.is_open).map((h) => h.day_of_week)

  return (
    <main className="min-h-dvh bg-slate-50">
      <div className="mx-auto max-w-lg px-4 py-8 pb-20">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
            <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">{tenant.name}</h1>
          <p className="mt-1 text-sm text-slate-500">Agendamento online</p>
          {tenant.booking_instructions && (
            <p className="mt-3 rounded-lg bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
              {tenant.booking_instructions}
            </p>
          )}
        </div>

        <BookingWizard
          tenant={{
            id: tenant.id,
            name: tenant.name,
            slug: tenant.slug,
            phone: tenant.phone,
            booking_instructions: tenant.booking_instructions,
          }}
          services={services.map((s) => ({
            id: s.id,
            name: s.name,
            duration_minutes: s.duration_minutes,
            price: Number(s.price),
            category: s.category,
          }))}
          closedDaysOfWeek={closedDaysOfWeek}
        />
        <p className="mt-8 text-center text-xs text-slate-400">
          <a href="https://getpetflow.com" target="_blank" rel="noopener noreferrer" className="hover:text-slate-600 transition-colors">
            Powered by PetFlow
          </a>
        </p>
      </div>
    </main>
  )
}
