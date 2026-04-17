/**
 * Supabase Server Client
 *
 * Use in Server Components, Route Handlers, and Server Actions. Reads and
 * writes auth cookies via next/headers so sessions stay in sync across the
 * request/response cycle.
 *
 * In Next.js 16, `cookies()` is async — this factory must be awaited.
 *
 * Example:
 *   const supabase = await createClient()
 *   const { data: { user } } = await supabase.auth.getUser()
 */
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // `setAll` was called from a Server Component.
            // This can be ignored if the middleware is refreshing sessions
            // (which it is — see src/middleware.ts).
          }
        },
      },
    },
  )
}
