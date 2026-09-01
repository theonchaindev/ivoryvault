'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

// Create a new instant-win (spin) game and open it to configure — mirrors the
// one-click "create a new game" flow of Ticket Win. Instant games are stored as
// competitions of type 'instant', so this creates one with sensible defaults and
// jumps to its editor.
export default function CreateInstantButton() {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  const create = async () => {
    const name = prompt('Name your new instant win game (e.g. October Cash Spin)')
    if (name === null) return
    setBusy(true)
    try {
      const res = await fetch('/api/admin/competitions', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: name.trim() || 'New Instant Win',
          description: 'Buy spins and reveal your prize instantly — win site credit on the spot.',
          prizeValue: 100,
          ticketPrice: 0.10,
          maxTickets: 500,
          type: 'instant',
          instantPrizes: JSON.stringify([
            { amount: 20, total: 2 }, { amount: 10, total: 5 }, { amount: 5, total: 20 }, { amount: 1, total: 100 },
          ]),
          status: 'draft',
          images: '[]',
        }),
      })
      const d = await res.json()
      if (!res.ok) { alert(d.error || 'Could not create the game.'); setBusy(false); return }
      // Open the new game's editor to finish setup (prizes, image, price, go live).
      router.push(`/admin/competitions/${d.competition.id}`)
    } catch { alert('Could not create the game.'); setBusy(false) }
  }

  return (
    <button onClick={create} disabled={busy} style={{ background: 'var(--gold,#2563eb)', color: '#fff', border: 'none', borderRadius: '10px', padding: '.85rem 1.8rem', fontSize: '.75rem', fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit', opacity: busy ? .6 : 1 }}>
      {busy ? 'Creating…' : '+ Create new game'}
    </button>
  )
}
