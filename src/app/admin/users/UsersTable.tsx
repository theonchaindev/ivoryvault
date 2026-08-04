'use client'

import { useState } from 'react'
import Link from 'next/link'

interface U {
  id: string; name: string; email: string; role: string
  siteCredit: number; createdAt: string; tickets: number; spins: number
}

const cell: React.CSSProperties = { padding: '0.9rem 1.25rem', borderBottom: '1px solid var(--border)', fontSize: '0.85rem' }
const th: React.CSSProperties = { textAlign: 'left', padding: '0.85rem 1.25rem', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink3)', borderBottom: '1px solid var(--border)' }

export default function UsersTable({ users }: { users: U[] }) {
  const [q, setQ] = useState('')
  const query = q.trim().toLowerCase()
  const filtered = query ? users.filter(u => (`${u.name} ${u.email}`).toLowerCase().includes(query)) : users
  const members = users.filter(u => u.role !== 'admin' && u.role !== 'guest').length
  const guests = users.filter(u => u.role === 'guest').length
  const totalCredit = users.reduce((s, u) => s + u.siteCredit, 0)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2rem', fontWeight: 600, color: 'var(--ink)' }}>Members</h1>
          <p style={{ color: 'var(--ink3)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            {members} members{guests > 0 ? ` · ${guests} guest${guests > 1 ? 's' : ''}` : ''} · £{totalCredit.toFixed(2)} site credit outstanding
          </p>
        </div>
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search name or email…"
          style={{ padding: '0.65rem 1rem', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.85rem', minWidth: '260px', fontFamily: 'inherit' }}
        />
      </div>

      <div style={{ backgroundColor: 'white', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Member', 'Joined', 'Entries', 'Spins', 'Site Credit', ''].map((h, i) => (
                <th key={i} style={th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} style={{ cursor: 'pointer' }} className="admin-user-row">
                <td style={cell}>
                  <Link href={`/admin/users/${u.id}`} style={{ display: 'block', textDecoration: 'none' }}>
                    <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{u.name}</span>
                    {u.role === 'admin' && <span style={{ marginLeft: '.5rem', fontSize: '.6rem', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--gold)', border: '1px solid var(--gold)', borderRadius: '999px', padding: '1px 6px' }}>Admin</span>}
                    {u.role === 'guest' && <span style={{ marginLeft: '.5rem', fontSize: '.6rem', letterSpacing: '.08em', textTransform: 'uppercase', color: '#b45309', background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '999px', padding: '1px 6px' }}>Guest</span>}
                    <div style={{ fontSize: '0.75rem', color: 'var(--ink3)' }}>{u.email}</div>
                  </Link>
                </td>
                <td style={{ ...cell, color: 'var(--ink3)', fontSize: '0.78rem' }}>{new Date(u.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                <td style={{ ...cell, color: 'var(--ink)', fontWeight: 500 }}>{u.tickets}</td>
                <td style={{ ...cell, color: 'var(--ink2)' }}>{u.spins}</td>
                <td style={{ ...cell, color: u.siteCredit > 0 ? 'var(--gold)' : 'var(--ink3)', fontWeight: 600 }}>£{u.siteCredit.toFixed(2)}</td>
                <td style={{ ...cell, textAlign: 'right' }}>
                  <Link href={`/admin/users/${u.id}`} style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gold)', textDecoration: 'none' }}>View →</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--ink3)' }}>No members match “{q}”.</div>}
      </div>

      <style>{`.admin-user-row:hover td { background: var(--bg2); }`}</style>
    </div>
  )
}
