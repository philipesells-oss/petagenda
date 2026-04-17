/**
 * Supabase Browser Client
 *
 * Use in Client Components ("use client"). Reads cookies via document.cookie
 * and hooks into Supabase auth for session management on the browser side.
 *
 * For Server Components / Route Handlers / Server Actions, import from
 * `@/lib/supabase/server` instead.
 */
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
