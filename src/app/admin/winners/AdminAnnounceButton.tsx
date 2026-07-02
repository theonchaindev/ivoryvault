'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  winnerId: string
}

export default function AdminAnnounceButton({ winnerId }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleAnnounce = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/winners', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: winnerId, announced: true }),
      })

      if (res.ok) {
        router.refresh()
      } else {
        alert('Failed to announce winner')
      }
    } catch {
      alert('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleAnnounce}
      disabled={loading}
      style={{
        fontSize: '0.75rem',
        color: 'var(--gold)',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
        opacity: loading ? 0.5 : 1,
      }}
    >
      {loading ? 'Announcing...' : 'Announce'}
    </button>
  )
}
