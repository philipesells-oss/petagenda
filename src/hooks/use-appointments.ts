'use client'

/**
 * useAppointments — fetches appointments for a given date from the client,
 * with a refresh() function for post-mutation revalidation.
 */

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { AppointmentRow } from '@/types'

interface UseAppointmentsResult {
  appointments: AppointmentRow[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useAppointments(
  tenantId: string,
  date: string,
): UseAppointmentsResult {
  const [appointments, setAppointments] = useState<AppointmentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data, error: err } = await supabase
      .from('appointments')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('date', date)
      .order('start_time', { ascending: true })

    if (err) {
      setError(err.message)
      setAppointments([])
    } else {
      setError(null)
      setAppointments((data ?? []) as AppointmentRow[])
    }
    setLoading(false)
  }, [tenantId, date])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (cancelled) return
      await load()
    })()
    return () => {
      cancelled = true
    }
  }, [load])

  return { appointments, loading, error, refresh: load }
}
