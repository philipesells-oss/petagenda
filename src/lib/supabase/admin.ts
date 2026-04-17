/**
 * Supabase Admin Client (service role)
 *
 * SERVER-SIDE ONLY. This client bypasses Row Level Security — never expose it
 * to the browser. The SUPABASE_SERVICE_ROLE_KEY must never be prefixed with
 * NEXT_PUBLIC_* and must never be imported from a Client Component.
 *
 * Use only for:
 *  - Admin operations (user provisioning, tenant setup)
 *  - Cross-tenant data migrations
 *  - Webhook handlers that need to bypass RLS
 *  - Cron jobs / server-only background work
 *
 * For all request-bound user operations, use `@/lib/supabase/server` instead.
 */
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

export function createAdminClient() {
  // Hard runtime guard: this must never execute in the browser.
  if (typeof window !== 'undefined') {
    throw new Error(
      '[supabase/admin] createAdminClient() was called in a browser context. ' +
        'The service role key must never reach the client. Move this call to a ' +
        'Server Component, Route Handler, or Server Action.',
    )
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error(
      '[supabase/admin] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY ' +
        'in environment. Check .env.local.',
    )
  }

  return createSupabaseClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
