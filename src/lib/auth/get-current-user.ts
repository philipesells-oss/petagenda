/**
 * Server-side loader for the authenticated user + tenant summary.
 *
 * Returns the shape expected by Server/Client Components that need both
 * identity (email) and tenant metadata (plan, shop name, etc.) without
 * re-querying the DB.
 */

import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import type { AuthUser, UserRow, TenantRow } from '@/types'

export const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
  const supabase = await createClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) return null

  const { data, error } = await supabase
    .from('users')
    .select('*, force_password_change, tenant:tenants(*)')
    .eq('id', authUser.id)
    .maybeSingle<UserRow & { force_password_change: boolean; tenant: TenantRow | TenantRow[] | null }>()

  if (error || !data) return null

  const tenant = Array.isArray(data.tenant) ? data.tenant[0] : data.tenant
  if (!tenant) return null

  return {
    id: authUser.id,
    email: authUser.email ?? null,
    tenantId: data.tenant_id,
    fullName: data.full_name,
    role: data.role,
    phone: data.phone,
    avatarUrl: data.avatar_url,
    isActive: data.is_active,
    forcePasswordChange: data.force_password_change ?? false,
    tenant: {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      plan: tenant.plan,
      planStatus: tenant.plan_status,
      trialEndsAt: tenant.trial_ends_at,
      messagesUsed: tenant.messages_used,
      messagesLimit: tenant.messages_limit,
      whatsappConnected: tenant.whatsapp_connected,
    },
  }
})
