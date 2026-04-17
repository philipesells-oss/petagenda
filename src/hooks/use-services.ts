'use client'

/**
 * Client-side fetcher for the services list. For now this is a simple fetch
 * against the REST endpoint; realtime subscriptions can be layered later.
 */

import { useCallback, useEffect, useState } from 'react'

import { createClient } from '@/lib/supabase/client'
import type { ServiceRow } from '@/types'

interface UseServicesResult {
  services: ServiceRow[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useServices(tenantId: string): UseServicesResult {
  const [services, setServices] = useState<ServiceRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchServices = useCallback(async () => {
    const supabase = createClient()
    const { data, error: err } = await supabase
      .from('services')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true })

    if (err) {
      setError(err.message)
      setServices([])
    } else {
      setError(null)
      setServices((data ?? []) as ServiceRow[])
    }
    setLoading(false)
  }, [tenantId])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const supabase = createClient()
      const { data, error: err } = await supabase
        .from('services')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true })

      if (cancelled) return
      if (err) {
        setError(err.message)
        setServices([])
      } else {
        setError(null)
        setServices((data ?? []) as ServiceRow[])
      }
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [tenantId])

  return { services, loading, error, refresh: fetchServices }
}
