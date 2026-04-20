'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { PencilIcon, PlusIcon, UserCheckIcon, UserXIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { createEmployeeAction, deactivateEmployeeAction } from '@/actions/team'
import { EditEmployeeDialog } from '@/components/settings/edit-employee-dialog'
import type { UserRole } from '@/types'

interface Member {
  id: string
  full_name: string
  role: UserRole
  is_active: boolean
}

const ROLE_LABEL: Record<UserRole, string> = {
  owner: 'Proprietário',
  admin: 'Admin',
  employee: 'Funcionário',
}

export function TeamPanel({
  members,
  callerRole,
  allServices,
}: {
  members: Member[]
  callerRole: UserRole
  allServices: { id: string; name: string }[]
}) {
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'employee'|'admin'>('employee')
  const [pending, startTransition] = useTransition()
  const [editTarget, setEditTarget] = useState<Member | null>(null)

  const canManage = callerRole === 'owner' || callerRole === 'admin'

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    const fd = new FormData()
    fd.set('full_name', name)
    fd.set('email', email)
    fd.set('password', password)
    fd.set('role', role)
    const createdName = name
    startTransition(async () => {
      const res = await createEmployeeAction(fd)
      if (!res.ok) { toast.error(res.error); return }
      toast.success('Funcionário criado! Configure o horário de trabalho.')
      setName(''); setEmail(''); setPassword('')
      setShowForm(false)
      // Auto-open edit dialog for the new employee
      setEditTarget({ id: res.data.id, full_name: createdName, role: 'employee', is_active: true })
    })
  }

  function handleDeactivate(id: string) {
    startTransition(async () => {
      const res = await deactivateEmployeeAction(id)
      if (!res.ok) { toast.error(res.error); return }
      toast.success('Funcionário desativado.')
    })
  }

  return (
    <div className="space-y-4">
      {/* Member list */}
      <div className="divide-y rounded-xl border bg-card">
        {members.map((m) => (
          <div key={m.id} className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-full bg-muted text-sm font-semibold uppercase">
                {m.full_name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium leading-tight">{m.full_name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Badge variant="outline" className="text-xs py-0">
                    {ROLE_LABEL[m.role]}
                  </Badge>
                  {!m.is_active && (
                    <Badge variant="secondary" className="text-xs py-0">Inativo</Badge>
                  )}
                </div>
              </div>
            </div>
            {canManage && m.role === 'employee' && m.is_active && (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  title="Editar funcionário"
                  disabled={pending}
                  onClick={() => setEditTarget(m)}
                >
                  <PencilIcon className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  disabled={pending}
                  onClick={() => handleDeactivate(m.id)}
                >
                  <UserXIcon className="size-4" />
                </Button>
              </div>
            )}
          </div>
        ))}
        {members.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-muted-foreground">
            Nenhum membro cadastrado.
          </p>
        )}
      </div>

      {/* Add employee */}
      {canManage && (
        <>
          {!showForm ? (
            <Button variant="outline" onClick={() => setShowForm(true)}>
              <PlusIcon className="mr-1 size-4" /> Adicionar funcionário
            </Button>
          ) : (
            <form onSubmit={handleCreate} className="space-y-4 rounded-xl border bg-card p-4">
              <p className="font-medium text-sm">Novo funcionário</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1 sm:col-span-2">
                  <Label htmlFor="emp-name">Nome completo *</Label>
                  <Input
                    id="emp-name"
                    placeholder="Maria Silva"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="emp-email">E-mail (login) *</Label>
                  <Input
                    id="emp-email"
                    type="email"
                    placeholder="maria@petshop.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="emp-pw">Senha inicial *</Label>
                  <Input
                    id="emp-pw"
                    type="password"
                    placeholder="mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Tipo de acesso *</Label>
                <div className="flex gap-3">
                  {(['employee', 'admin'] as const).map((r) => (
                    <label key={r} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="radio" name="role" value={r} checked={role === r} onChange={() => setRole(r)} />
                      {r === 'employee' ? 'Funcionário' : 'Admin'}
                    </label>
                  ))}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                O membro poderá entrar com este e-mail e senha.
              </p>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={pending}>
                  {pending ? 'Criando…' : (
                    <><UserCheckIcon className="mr-1 size-4" /> Criar funcionário</>
                  )}
                </Button>
              </div>
            </form>
          )}
        </>
      )}

      {editTarget && (
        <EditEmployeeDialog
          employee={{ id: editTarget.id, full_name: editTarget.full_name, role: editTarget.role as 'employee' | 'admin' }}
          allServices={allServices}
          open={!!editTarget}
          onOpenChange={(open) => { if (!open) setEditTarget(null) }}
        />
      )}
    </div>
  )
}
