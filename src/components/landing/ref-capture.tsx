'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

export function RefCapture() {
  const params = useSearchParams()
  useEffect(() => {
    const ref = params.get('ref')
    if (ref && /^[A-Z0-9]{6,12}$/.test(ref)) {
      document.cookie = `pf_ref=${ref};max-age=604800;path=/;SameSite=Lax;Secure`
    }
  }, [params])
  return null
}
