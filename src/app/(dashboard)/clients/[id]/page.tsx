import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PetCard } from '@/components/clients/pet-card'
import { EditClientDialog, AddPetDialog } from '@/components/clients/edit-client-dialog'
import { formatPhone, formatCurrency, formatDate } from '@/lib/utils/format'
import type { ClientRow, PetRow, AppointmentRow } from '@/types'

export const dynamic = 'force-dynamic'

type AppointmentJoined = AppointmentRow & {
  pets: { name: string } | null
  services: { name: string } | null
}

export default async function ClientProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const supabase = await createClient()

  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .eq('tenant_id', user.tenantId)
    .maybeSingle<ClientRow>()

  if (!client) notFound()

  const { data: pets } = await supabase
    .from('pets')
    .select('*')
    .eq('client_id', id)
    .eq('tenant_id', user.tenantId)
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  const { data: appts } = await supabase
    .from('appointments')
    .select('*, pets(name), services(name)')
    .eq('client_id', id)
    .eq('tenant_id', user.tenantId)
    .order('date', { ascending: false })
    .order('start_time', { ascending: false })
    .limit(50)

  const petList = (pets ?? []) as PetRow[]
  const apptList = (appts ?? []) as unknown as AppointmentJoined[]

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <Link href="/clients" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
      </Link>

      <Card>
        <CardContent className="p-6 flex flex-wrap gap-6 items-start">
          <div className="flex-1 min-w-[220px]">
            <h1 className="text-2xl font-bold">{client.full_name}</h1>
            <p className="text-muted-foreground">{formatPhone(client.phone)}</p>
            {client.email && (
              <p className="text-sm text-muted-foreground">{client.email}</p>
            )}
            {client.tags.length > 0 && (
              <div className="flex gap-1 flex-wrap mt-2">
                {client.tags.map((t) => (
                  <Badge key={t} variant="outline">{t}</Badge>
                ))}
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Total gasto</p>
              <p className="font-semibold">{formatCurrency(client.total_spent)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Pontos</p>
              <p className="font-semibold">{client.loyalty_points}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Visitas</p>
              <p className="font-semibold">{client.visit_count}</p>
            </div>
            <div>
              <p className="text-muted-foreground">WhatsApp</p>
              <p className="font-semibold">{client.whatsapp_opt_in ? 'Sim' : 'Não'}</p>
            </div>
          </div>
          <EditClientDialog client={client} />
        </CardContent>
      </Card>

      <Tabs defaultValue="pets">
        <TabsList>
          <TabsTrigger value="pets">Pets ({petList.length})</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
          <TabsTrigger value="messages">Mensagens</TabsTrigger>
        </TabsList>

        <TabsContent value="pets" className="space-y-4">
          <div className="flex justify-end">
            <AddPetDialog clientId={client.id} />
          </div>
          {petList.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhum pet cadastrado
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {petList.map((p) => <PetCard key={p.id} pet={p} />)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history">
          {apptList.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhum atendimento ainda
            </p>
          ) : (
            <div className="space-y-2">
              {apptList.map((a) => (
                <Card key={a.id}>
                  <CardContent className="p-4 flex justify-between items-center">
                    <div>
                      <p className="font-medium">
                        {a.services?.name ?? 'Serviço'} — {a.pets?.name ?? '—'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(a.date)} às {a.start_time.slice(0, 5)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(a.price)}</p>
                      <Badge variant="outline">{a.status}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="messages">
          <p className="text-muted-foreground text-center py-8">
            Histórico de mensagens via WhatsApp estará disponível na Fase 2.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  )
}
