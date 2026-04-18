import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendWhatsappMessage } from '@/lib/whatsapp/send-message'

export const dynamic = 'force-dynamic'

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function toISODate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function toHHMM(d: Date): string {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization') ?? ''
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()
  const now = new Date()

  // 24h window: appointments tomorrow
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = toISODate(tomorrow)

  // 2h window: appointments in ~2h (±15 min tolerance)
  const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000)
  const twoHourDate = toISODate(twoHoursLater)
  const twoHourTime = toHHMM(twoHoursLater)
  const twoHourTimePlus = toHHMM(new Date(twoHoursLater.getTime() + 15 * 60 * 1000))
  const twoHourTimeMinus = toHHMM(new Date(twoHoursLater.getTime() - 15 * 60 * 1000))

  let sent24h = 0
  let sent2h = 0
  let errors = 0

  // 24h reminders
  const { data: appts24h } = await admin
    .from('appointments')
    .select(
      'id, tenant_id, client_id, pet_id, service_id, date, start_time, clients(phone, full_name), pets(name), services(name)',
    )
    .eq('date', tomorrowStr)
    .in('status', ['scheduled', 'confirmed'])

  for (const appt of (appts24h ?? []) as AppointmentWithRelations[]) {
    const phone = appt.clients?.phone
    if (!phone) continue

    const { data: templateRow } = await admin
      .from('message_templates')
      .select('id')
      .eq('is_default', true)
      .eq('category', 'reminder')
      .eq('is_active', true)
      .limit(1)
      .single<{ id: string }>()

    if (!templateRow) continue

    const result = await sendWhatsappMessage({
      tenantId: appt.tenant_id,
      clientId: appt.client_id,
      phone,
      templateId: templateRow.id,
      appointmentId: appt.id,
      vars: {
        client_name: appt.clients?.full_name ?? 'Cliente',
        pet_name: appt.pets?.name ?? 'Pet',
        service_name: appt.services?.name ?? 'Serviço',
        date: new Date(appt.date + 'T00:00:00').toLocaleDateString('pt-BR'),
        time: appt.start_time.slice(0, 5),
      },
    })

    if (result.ok) sent24h++
    else errors++
  }

  // 2h reminders
  const { data: appts2h } = await admin
    .from('appointments')
    .select(
      'id, tenant_id, client_id, pet_id, service_id, date, start_time, clients(phone, full_name), pets(name), services(name)',
    )
    .eq('date', twoHourDate)
    .gte('start_time', twoHourTimeMinus)
    .lte('start_time', twoHourTimePlus)
    .in('status', ['scheduled', 'confirmed'])

  for (const appt of (appts2h ?? []) as AppointmentWithRelations[]) {
    const phone = appt.clients?.phone
    if (!phone) continue

    const { data: tenant } = await admin
      .from('tenants')
      .select('name')
      .eq('id', appt.tenant_id)
      .single<{ name: string }>()

    const { data: templateRow } = await admin
      .from('message_templates')
      .select('id')
      .eq('is_default', true)
      .eq('category', 'reminder')
      .eq('is_active', true)
      .order('name', { ascending: false })
      .limit(1)
      .single<{ id: string }>()

    if (!templateRow) continue

    const result = await sendWhatsappMessage({
      tenantId: appt.tenant_id,
      clientId: appt.client_id,
      phone,
      templateId: templateRow.id,
      appointmentId: appt.id,
      vars: {
        client_name: appt.clients?.full_name ?? 'Cliente',
        pet_name: appt.pets?.name ?? 'Pet',
        service_name: appt.services?.name ?? 'Serviço',
        date: new Date(appt.date + 'T00:00:00').toLocaleDateString('pt-BR'),
        time: appt.start_time.slice(0, 5),
        shop_name: tenant?.name ?? 'Pet Shop',
      },
    })

    if (result.ok) sent2h++
    else errors++
  }

  return NextResponse.json({
    ok: true,
    sent24h,
    sent2h,
    errors,
    timestamp: now.toISOString(),
  })
}

interface AppointmentWithRelations {
  id: string
  tenant_id: string
  client_id: string
  pet_id: string
  service_id: string
  date: string
  start_time: string
  clients: { phone: string | null; full_name: string } | null
  pets: { name: string } | null
  services: { name: string } | null
}
