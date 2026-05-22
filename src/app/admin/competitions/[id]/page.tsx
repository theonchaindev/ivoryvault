'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

interface Competition {
  id: string
  title: string
  subtitle?: string
  description: string
  prizeValue: number
  ticketPrice: number
  maxTickets: number
  images: string
  drawDate?: string
  status: string
  featured: boolean
  sortOrder: number
}

export default function EditCompetitionPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    description: '',
    prizeValue: '',
    ticketPrice: '',
    maxTickets: '',
    images: '[]',
    drawDate: '',
    status: 'draft',
    featured: false,
    sortOrder: '0',
  })

  useEffect(() => {
    fetch(`/api/admin/competitions/${id}`)
      .then(r => r.json())
      .then((data: { competition: Competition }) => {
        const c = data.competition
        setForm({
          title: c.title,
          subtitle: c.subtitle || '',
          description: c.description,
          prizeValue: String(c.prizeValue),
          ticketPrice: String(c.ticketPrice),
          maxTickets: String(c.maxTickets),
          images: c.images,
          drawDate: c.drawDate ? new Date(c.drawDate).toISOString().slice(0, 16) : '',
          status: c.status,
          featured: c.featured,
          sortOrder: String(c.sortOrder),
        })
      })
      .catch(() => setError('Failed to load competition'))
      .finally(() => setLoading(false))
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const res = await fetch(`/api/admin/competitions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to update')
        return
      }

      router.push('/admin/competitions')
      router.refresh()
    } catch {
      setError('Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div style={{ padding: '2rem', color: '#9a8878' }}>Loading...</div>
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Link href="/admin/competitions" style={{ color: '#9a8878', textDecoration: 'none', fontSize: '0.875rem' }}>
          ← Back
        </Link>
        <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2rem', fontWeight: 600, color: '#1c1a18' }}>
          Edit Competition
        </h1>
      </div>

      <form onSubmit={handleSubmit} style={{ maxWidth: '700px' }}>
        <div style={{ backgroundColor: 'white', border: '1px solid #e8d8cc', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.25rem', fontWeight: 600, color: '#1c1a18' }}>Details</h2>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#5c524a', marginBottom: '0.5rem' }}>Title *</label>
            <input type="text" className="iv-input" required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#5c524a', marginBottom: '0.5rem' }}>Subtitle</label>
            <input type="text" className="iv-input" value={form.subtitle} onChange={e => setForm(p => ({ ...p, subtitle: e.target.value }))} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#5c524a', marginBottom: '0.5rem' }}>Description *</label>
            <textarea className="iv-input" rows={5} required value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} style={{ resize: 'vertical' }} />
          </div>
        </div>

        <div style={{ backgroundColor: 'white', border: '1px solid #e8d8cc', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.25rem', fontWeight: 600, color: '#1c1a18' }}>Pricing & Tickets</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem' }}>
            {['prizeValue', 'ticketPrice', 'maxTickets'].map(key => (
              <div key={key}>
                <label style={{ display: 'block', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#5c524a', marginBottom: '0.5rem' }}>
                  {key === 'prizeValue' ? 'Prize Value (£)' : key === 'ticketPrice' ? 'Ticket Price (£)' : 'Max Tickets'}
                </label>
                <input
                  type="number"
                  className="iv-input"
                  value={form[key as keyof typeof form] as string}
                  onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                  min="0"
                  step={key === 'maxTickets' ? '1' : '0.01'}
                />
              </div>
            ))}
          </div>
        </div>

        <div style={{ backgroundColor: 'white', border: '1px solid #e8d8cc', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.25rem', fontWeight: 600, color: '#1c1a18' }}>Settings</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#5c524a', marginBottom: '0.5rem' }}>Draw Date</label>
              <input type="datetime-local" className="iv-input" value={form.drawDate} onChange={e => setForm(p => ({ ...p, drawDate: e.target.value }))} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#5c524a', marginBottom: '0.5rem' }}>Status</label>
              <select className="iv-input" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input type="checkbox" id="featured" checked={form.featured} onChange={e => setForm(p => ({ ...p, featured: e.target.checked }))} style={{ width: '16px', height: '16px', accentColor: '#b76e79' }} />
            <label htmlFor="featured" style={{ fontSize: '0.875rem', color: '#5c524a' }}>Featured competition</label>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#5c524a', marginBottom: '0.5rem' }}>Images (JSON)</label>
            <input type="text" className="iv-input" value={form.images} onChange={e => setForm(p => ({ ...p, images: e.target.value }))} placeholder='["https://..."]' />
          </div>
        </div>

        {error && (
          <div style={{ padding: '0.75rem 1rem', backgroundColor: 'rgba(183,110,121,0.08)', border: '1px solid rgba(183,110,121,0.2)', color: '#8a4f58', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button type="submit" className="btn-primary" disabled={saving} style={{ opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <Link href="/admin/competitions" className="btn-outline">Cancel</Link>
        </div>
      </form>
    </div>
  )
}
