'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Props {
  competitionId: string
}

export default function AdminCompetitionsActions({ competitionId }: Props) {
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this competition?')) return

    const res = await fetch(`/api/admin/competitions/${competitionId}`, {
      method: 'DELETE',
    })

    if (res.ok) {
      router.refresh()
    } else {
      alert('Failed to delete competition')
    }
  }

  return (
    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
      <Link
        href={`/admin/competitions/${competitionId}`}
        style={{ fontSize: '0.8rem', color: 'var(--gold)', textDecoration: 'none' }}
      >
        Edit
      </Link>
      <button
        onClick={handleDelete}
        style={{ fontSize: '0.8rem', color: 'var(--ink3)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        Delete
      </button>
    </div>
  )
}
