'use client'

import { useEffect, useState } from 'react'

// Lightweight client check for admin role, fetched once per page load and cached
// at module level so multiple components don't each hit /api/auth/me.
let cache: boolean | null = null
let inflight: Promise<boolean> | null = null

function fetchAdmin(): Promise<boolean> {
  if (cache !== null) return Promise.resolve(cache)
  if (!inflight) {
    inflight = fetch('/api/auth/me')
      .then(r => (r.ok ? r.json() : null))
      .then(d => { cache = d?.user?.role === 'admin'; return cache as boolean })
      .catch(() => { cache = false; return false })
  }
  return inflight
}

export function useIsAdmin(): boolean {
  const [admin, setAdmin] = useState<boolean>(cache ?? false)
  useEffect(() => {
    let mounted = true
    fetchAdmin().then(v => { if (mounted) setAdmin(v) })
    return () => { mounted = false }
  }, [])
  return admin
}
