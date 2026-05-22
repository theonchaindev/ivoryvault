'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  competitionId: string
  competitionTitle: string
}

export default function AdminDrawButton({ competitionId, competitionTitle }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDraw = async () => {
    if (!confirm(`Draw a winner for "${competitionTitle}"? This cannot be undone.`)) return

    setLoading(true)
    try {
      const res = await fetch(`/api/admin/draw/${competitionId}`, { method: 'POST' })
      const data = await res.json()

      if (res.ok) {
        alert(`Winner drawn: ${data.winner.user.name}`)
        router.refresh()
      } else {
        alert(data.error || 'Draw failed')
      }
    } catch {
      alert('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDraw}
      disabled={loading}
      className="btn-primary"
      style={{ fontSize: '0.75rem', padding: '0.5rem 1.25rem', opacity: loading ? 0.7 : 1 }}
    >
      {loading ? 'Drawing...' : 'Draw Winner'}
    </button>
  )
}
