'use client'

/**
 * useUser — Client hook for the authenticated Supabase user.
 *
 * Subscribes to auth state changes so Client Components re-render when the
 * session changes (e.g. after sign-out). For tenant/profile data, fetch from
 * a Server Component or dedicated endpoint — this hook only exposes the raw
 * auth user.
 */

import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    let mounted = true

    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return
      setUser(data.user ?? null)
      setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [])

  return { user, loading }
}
