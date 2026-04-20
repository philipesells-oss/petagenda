'use client'

/**
 * AppointmentForm — create or edit an appointment. Renders inside a Dialog.
 */

import { useEffect, useMemo, useState, useTransition } from 'react'
import { toast } from 'sonner'

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
import { createClient } from '@/lib/supabase/client'
import {
  createAppointment,
  updateAppointment,
  getAvailableSlots,
} from '@/actions/appointments'
import { getServicesByEmployeeAction } from '@/actions/team'
import { createClientAction, createPetAction } from '@/actions/clients'
import type {
  AppointmentRow,
  ClientRow,
  PetRow,
  ServiceRow,
  UserRow,
} from '@/types'
import { formatPhone } from '@/lib/utils/format'

export interface AppointmentFormProps {
  tenantId: string
  date: string // 'YYYY-MM-DD'
  initial?: AppointmentRow | null
  defaultStartTime?: string // 'HH:MM' for pre-fill when clicking a slot
  onSuccess?: () => void
  onCancel?: () => void
}

interface TimeSlot {
  time: string
  available: boolean
}

export function AppointmentForm(props: AppointmentFormProps) {
  const { tenantId, date, initial, defaultStartTime, onSuccess, onCancel } =
    props
  const isEdit = !!initial

  const [clients, setClients] = useState<ClientRow[]>([])
  const [pets, setPets] = useState<PetRow[]>([])
  const [services, setServices] = useState<ServiceRow[]>([])
  const [users, setUsers] = useState<Pick<UserRow, 'id' | 'full_name'>[]>([])
  const [slots, setSlots] = useState<TimeSlot[]>([])

  const [clientId, setClientId] = useState<string>(initial?.client_id ?? '')
  const [petId, setPetId] = useState<string>(initial?.pet_id ?? '')
  const [serviceId, setServiceId] = useState<string>(initial?.service_id ?? '')
  const [assignedTo, setAssignedTo] = useState<string>(
    initial?.assigned_to ?? '',
  )
  const [startTime, setStartTime] = useState<string>(
    initial?.start_time?.slice(0, 5) ?? defaultStartTime ?? '',
  )
  const [price, setPrice] = useState<string>(
    initial?.price != null ? String(initial.price) : '',
  )
  const [notes, setNotes] = useState<string>(initial?.notes ?? '')
  const [clientQuery, setClientQuery] = useState('')
  const [showQuickCreate, setShowQuickCreate] = useState(false)
  const [quickName, setQuickName] = useState('')
  const [quickPhone, setQuickPhone] = useState('')
  const [quickPetName, setQuickPetName] = useState('')
  const [quickPetSpecies, setQuickPetSpecies] = useState<'dog'|'cat'|'bird'|'other'>('dog')
  const [quickPetBreed, setQuickPetBreed] = useState('')
  const [quickPetWeight, setQuickPetWeight] = useState('')
  const [quickPetAge, setQuickPetAge] = useState('')
  const [quickPending, startQuickTransition] = useTransition()

  // inline add-pet form (for existing client with no pets)
  const [showAddPet, setShowAddPet] = useState(false)
  const [addPetName, setAddPetName] = useState('')
  const [addPetSpecies, setAddPetSpecies] = useState<'dog'|'cat'|'bird'|'other'>('dog')
  const [addPetBreed, setAddPetBreed] = useState('')
  const [addPetWeight, setAddPetWeight] = useState('')
  const [addPetAge, setAddPetAge] = useState('')
  const [addPetPending, startAddPetTransition] = useTransition()

  const [pending, startTransition] = useTransition()

  // ---------------- Initial load ----------------
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const supabase = createClient()
      const [clientsRes, servicesRes, usersRes] = await Promise.all([
        supabase
          .from('clients')
          .select('id, full_name, phone, tenant_id, status')
          .eq('tenant_id', tenantId)
          .eq('status', 'active')
          .order('full_name'),
        supabase
          .from('services')
          .select('*')
          .eq('tenant_id', tenantId)
          .eq('is_active', true)
          .order('name'),
        supabase
          .from('users')
          .select('id, full_name')
          .eq('tenant_id', tenantId)
          .eq('is_active', true)
          .order('full_name'),
      ])
      if (cancelled) return
      setClients((clientsRes.data ?? []) as ClientRow[])
      setServices((servicesRes.data ?? []) as ServiceRow[])
      setUsers(
        (usersRes.data ?? []) as Pick<UserRow, 'id' | 'full_name'>[],
      )
    })()
    return () => {
      cancelled = true
    }
  }, [tenantId])

  // ---------------- Pets filtered by client ----------------
  useEffect(() => {
    if (!clientId) {
      setPets([])
      return
    }
    let cancelled = false
    ;(async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('pets')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('client_id', clientId)
        .eq('is_active', true)
        .order('name')
      if (cancelled) return
      const petRows = (data ?? []) as PetRow[]
      setPets(petRows)
      // Auto-select when client has exactly one pet
      if (petRows.length === 1) {
        setPetId(petRows[0]!.id)
      } else if (petId && !petRows.some((p) => p.id === petId)) {
        setPetId('')
      }
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId, clientId])

  // ---------------- Filter services by selected employee --------------------
  useEffect(() => {
    if (!assignedTo) {
      // No employee selected — reload all services
      const supabase = createClient()
      supabase
        .from('services')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .order('name')
        .then(({ data }) => {
          setServices((data ?? []) as ServiceRow[])
        })
      return
    }
    let cancelled = false
    ;(async () => {
      const res = await getServicesByEmployeeAction(assignedTo)
      if (cancelled) return
      if (res.ok) {
        setServices(res.data as ServiceRow[])
        // Clear selected service if it's no longer available
        if (serviceId && !res.data.some((s) => s.id === serviceId)) {
          setServiceId('')
        }
      }
    })()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignedTo, tenantId])

  // ---------------- Available slots (client-side computed on pick) ----------
  useEffect(() => {
    if (!serviceId || !date) {
      setSlots([])
      return
    }
    let cancelled = false
    ;(async () => {
      const res = await getAvailableSlots(
        date,
        serviceId,
        assignedTo || undefined,
      )
      if (cancelled) return
      if (res.ok) {
        setSlots(res.data.map((s) => ({ time: s.time, available: s.available })))
      } else {
        setSlots([])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [date, serviceId, assignedTo])

  // ---------------- Pre-fill price from service ----------------
  useEffect(() => {
    if (!isEdit && serviceId) {
      const svc = services.find((s) => s.id === serviceId)
      if (svc && price === '') setPrice(String(svc.price))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceId])

  // ---------------- Filtered clients (combobox) ------------
  const filteredClients = useMemo(() => {
    const q = clientQuery.trim().toLowerCase()
    if (!q) return clients.slice(0, 20)
    const qDigits = q.replace(/\D/g, '')
    return clients
      .filter((c) => {
        const nameMatch = c.full_name.toLowerCase().includes(q)
        const phoneMatch =
          qDigits.length >= 2 && c.phone.replace(/\D/g, '').includes(qDigits)
        return nameMatch || phoneMatch
      })
      .slice(0, 20)
  }, [clients, clientQuery])

  // ---------------- Submit ----------------
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!clientId || !petId || !serviceId || !startTime) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    const fd = new FormData()
    fd.set('client_id', clientId)
    fd.set('pet_id', petId)
    fd.set('service_id', serviceId)
    fd.set('assigned_to', assignedTo || '')
    fd.set('date', date)
    fd.set('start_time', startTime)
    fd.set('price', price || '0')
    fd.set('notes', notes)

    startTransition(async () => {
      const res = isEdit
        ? await updateAppointment(initial!.id, fd)
        : await createAppointment(fd)

      if (!res.ok) {
        toast.error(res.error)
        return
      }
      toast.success(isEdit ? 'Agendamento atualizado' : 'Agendamento criado')
      onSuccess?.()
    })
  }

  async function handleQuickCreate() {
    if (!quickName.trim() || !quickPhone.trim()) {
      toast.error('Nome e telefone são obrigatórios')
      return
    }
    startQuickTransition(async () => {
      const fd = new FormData()
      fd.set('full_name', quickName.trim())
      fd.set('phone', quickPhone.trim())
      const res = await createClientAction(fd)
      if (!res.ok) { toast.error(res.error); return }
      const newClientId = res.data.id

      let newPetId = ''
      if (quickPetName.trim()) {
        const petFd = new FormData()
        petFd.set('name', quickPetName.trim())
        petFd.set('species', quickPetSpecies)
        if (quickPetBreed.trim()) petFd.set('breed', quickPetBreed.trim())
        if (quickPetWeight) petFd.set('weight', quickPetWeight)
        if (quickPetAge) {
          const birthYear = new Date().getFullYear() - parseInt(quickPetAge, 10)
          petFd.set('birth_date', `${birthYear}-01-01`)
        }
        const petRes = await createPetAction(newClientId, petFd)
        if (petRes.ok) newPetId = petRes.data.id
        else toast.error(`Pet não salvo: ${petRes.error}`)
      }

      // Reload clients list from Supabase
      const supabase = createClient()
      const { data } = await supabase
        .from('clients')
        .select('id, full_name, phone, tenant_id, status')
        .eq('tenant_id', tenantId)
        .eq('status', 'active')
        .order('full_name')
      setClients((data ?? []) as ClientRow[])

      setClientId(newClientId)
      if (newPetId) setPetId(newPetId)
      setClientQuery('')
      setShowQuickCreate(false)
      setQuickName('')
      setQuickPhone('')
      setQuickPetName('')
      setQuickPetBreed('')
      setQuickPetWeight('')
      setQuickPetAge('')
      toast.success('Cliente cadastrado!')
    })
  }

  async function handleAddPet() {
    if (!addPetName.trim() || !clientId) {
      toast.error('Nome do pet é obrigatório')
      return
    }
    startAddPetTransition(async () => {
      const fd = new FormData()
      fd.set('name', addPetName.trim())
      fd.set('species', addPetSpecies)
      if (addPetBreed.trim()) fd.set('breed', addPetBreed.trim())
      if (addPetWeight) fd.set('weight', addPetWeight)
      if (addPetAge) {
        const birthYear = new Date().getFullYear() - parseInt(addPetAge, 10)
        fd.set('birth_date', `${birthYear}-01-01`)
      }
      const res = await createPetAction(clientId, fd)
      if (!res.ok) { toast.error(`Erro ao salvar pet: ${res.error}`); return }

      // Reload pets for this client
      const supabase = createClient()
      const { data } = await supabase
        .from('pets').select('*')
        .eq('tenant_id', tenantId).eq('client_id', clientId).eq('is_active', true).order('name')
      const petRows = (data ?? []) as PetRow[]
      setPets(petRows)
      setPetId(res.data.id)
      setShowAddPet(false)
      setAddPetName('')
      setAddPetBreed('')
      setAddPetWeight('')
      setAddPetAge('')
      toast.success('Pet cadastrado!')
    })
  }


  const selectedClient = clients.find((c) => c.id === clientId) ?? null

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Client combobox (native datalist-style, simple & reliable) */}
      <div className="space-y-2">
        <Label htmlFor="client_search">Cliente *</Label>
        {selectedClient ? (
          <div className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
            <div>
              <div className="font-medium">{selectedClient.full_name}</div>
              <div className="text-xs text-muted-foreground">
                {formatPhone(selectedClient.phone)}
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setClientId('')
                setPetId('')
              }}
            >
              Trocar
            </Button>
          </div>
        ) : (
          <>
            <Input
              id="client_search"
              placeholder="Buscar por nome ou telefone…"
              value={clientQuery}
              onChange={(e) => setClientQuery(e.target.value)}
              autoComplete="off"
            />
            {clientQuery && !showQuickCreate && (
              <ul className="max-h-48 overflow-auto rounded-md border text-sm">
                {filteredClients.length === 0 ? (
                  <li className="px-3 py-2 text-muted-foreground">
                    Nenhum cliente encontrado.{' '}
                    <button
                      type="button"
                      className="font-medium text-foreground underline underline-offset-2"
                      onClick={() => { setShowQuickCreate(true) }}
                    >
                      Cadastrar agora
                    </button>
                  </li>
                ) : (
                  filteredClients.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        className="w-full px-3 py-2 text-left hover:bg-muted"
                        onClick={() => {
                          setClientId(c.id)
                          setClientQuery('')
                        }}
                      >
                        <span className="font-medium">{c.full_name}</span>{' '}
                        <span className="text-xs text-muted-foreground">
                          {formatPhone(c.phone)}
                        </span>
                      </button>
                    </li>
                  ))
                )}
              </ul>
            )}
            {showQuickCreate && (
              <div className="space-y-2 rounded-md border bg-muted/30 p-3 text-sm">
                <p className="font-medium">Cadastro rápido</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Nome *</Label>
                    <Input
                      placeholder="Nome completo"
                      value={quickName}
                      onChange={(e) => setQuickName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Telefone *</Label>
                    <Input
                      placeholder="(11) 99999-9999"
                      value={quickPhone}
                      onChange={(e) => setQuickPhone(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Nome do pet (opcional)</Label>
                    <Input
                      placeholder="Ex: Rex"
                      value={quickPetName}
                      onChange={(e) => setQuickPetName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Espécie</Label>
                    <Select value={quickPetSpecies} onValueChange={(v) => setQuickPetSpecies(v as typeof quickPetSpecies)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dog">🐶 Cachorro</SelectItem>
                        <SelectItem value="cat">🐱 Gato</SelectItem>
                        <SelectItem value="bird">🐦 Pássaro</SelectItem>
                        <SelectItem value="other">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {quickPetName.trim() && (
                  <div className="grid grid-cols-3 gap-2 items-end">
                    <div className="space-y-1">
                      <Label className="text-xs leading-tight">Raça</Label>
                      <Input
                        placeholder="Ex: Labrador"
                        value={quickPetBreed}
                        onChange={(e) => setQuickPetBreed(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs leading-tight">Peso (kg)</Label>
                      <Input
                        type="number"
                        min={0}
                        step="0.1"
                        placeholder="Ex: 8.5"
                        value={quickPetWeight}
                        onChange={(e) => setQuickPetWeight(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs leading-tight">Idade (anos)</Label>
                      <Input
                        type="number"
                        min={0}
                        max={30}
                        step="1"
                        placeholder="Ex: 3"
                        value={quickPetAge}
                        onChange={(e) => setQuickPetAge(e.target.value)}
                      />
                    </div>
                  </div>
                )}
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowQuickCreate(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    disabled={quickPending}
                    onClick={handleQuickCreate}
                  >
                    {quickPending ? 'Salvando…' : 'Cadastrar'}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Pet (filtered by client) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="pet_id">Pet *</Label>
          {clientId && (
            <button
              type="button"
              className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
              onClick={() => setShowAddPet((v) => !v)}
            >
              {showAddPet ? 'Cancelar' : '+ Adicionar pet'}
            </button>
          )}
        </div>

        {!showAddPet && (
          <Select
            value={petId}
            onValueChange={(v) => setPetId(v ?? '')}
            disabled={!clientId || pets.length === 0}
          >
            <SelectTrigger id="pet_id">
              <span className={petId ? '' : 'text-muted-foreground'}>
                {petId
                  ? (pets.find((p) => p.id === petId)?.name ?? 'Selecione o pet')
                  : !clientId
                  ? 'Escolha o cliente primeiro'
                  : pets.length === 0
                  ? 'Nenhum pet — clique em + Adicionar pet'
                  : 'Selecione o pet'}
              </span>
            </SelectTrigger>
            <SelectContent>
              {pets.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name} {p.breed ? `· ${p.breed}` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {showAddPet && (
          <div className="space-y-2 rounded-md border bg-muted/30 p-3 text-sm">
            <p className="font-medium">Novo pet</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Nome *</Label>
                <Input placeholder="Ex: Bella" value={addPetName} onChange={(e) => setAddPetName(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Espécie</Label>
                <Select value={addPetSpecies} onValueChange={(v) => setAddPetSpecies(v as typeof addPetSpecies)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dog">🐶 Cachorro</SelectItem>
                    <SelectItem value="cat">🐱 Gato</SelectItem>
                    <SelectItem value="bird">🐦 Pássaro</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 items-end">
              <div className="space-y-1">
                <Label className="text-xs leading-tight">Raça</Label>
                <Input placeholder="Ex: Poodle" value={addPetBreed} onChange={(e) => setAddPetBreed(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs leading-tight">Peso (kg)</Label>
                <Input type="number" min={0} step="0.1" placeholder="Ex: 5" value={addPetWeight} onChange={(e) => setAddPetWeight(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs leading-tight">Idade (anos)</Label>
                <Input type="number" min={0} max={30} placeholder="Ex: 3" value={addPetAge} onChange={(e) => setAddPetAge(e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="button" size="sm" disabled={addPetPending} onClick={handleAddPet}>
                {addPetPending ? 'Salvando…' : 'Salvar pet'}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Service */}
      <div className="space-y-2">
        <Label htmlFor="service_id">Serviço *</Label>
        <Select value={serviceId} onValueChange={(v) => setServiceId(v ?? '')}>
          <SelectTrigger id="service_id">
            <span className={serviceId ? '' : 'text-muted-foreground'}>
              {serviceId ? (services.find(s => s.id === serviceId)?.name ?? serviceId) : 'Selecione o serviço'}
            </span>
          </SelectTrigger>
          <SelectContent>
            {services.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name} ({s.duration_minutes}min)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Employee */}
      <div className="space-y-2">
        <Label htmlFor="assigned_to">Funcionário</Label>
        <Select
          value={assignedTo || '__any__'}
          onValueChange={(v) => setAssignedTo(v === '__any__' || v == null ? '' : v)}
        >
          <SelectTrigger id="assigned_to">
            <span className={assignedTo ? '' : 'text-muted-foreground'}>
              {assignedTo ? (users.find(u => u.id === assignedTo)?.full_name ?? assignedTo) : 'Qualquer um'}
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__any__">Qualquer um</SelectItem>
            {users.map((u) => (
              <SelectItem key={u.id} value={u.id}>
                {u.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Start time (only available slots) */}
      <div className="space-y-2">
        <Label htmlFor="start_time">Horário *</Label>
        <Select
          value={startTime}
          onValueChange={(v) => setStartTime(v ?? '')}
          disabled={!serviceId || slots.length === 0}
        >
          <SelectTrigger id="start_time">
            <SelectValue
              placeholder={serviceId ? 'Selecione o horário' : 'Escolha o serviço primeiro'}
            />
          </SelectTrigger>
          <SelectContent>
            {slots.map((s) => (
              <SelectItem key={s.time} value={s.time} disabled={!s.available}>
                {s.time} {!s.available ? '(indisponível)' : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Data: <strong>{date}</strong>
        </p>
      </div>

      {/* Price */}
      <div className="space-y-2">
        <Label htmlFor="price">Preço (R$)</Label>
        <Input
          id="price"
          type="number"
          min={0}
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notas</Label>
        <Textarea
          id="notes"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Observações do agendamento"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={pending}>
          {pending ? 'Salvando…' : isEdit ? 'Salvar' : 'Agendar'}
        </Button>
      </div>
    </form>
  )
}
