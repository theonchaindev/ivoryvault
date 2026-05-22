'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewCompetitionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/admin/competitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to create competition')
        return
      }

      router.push('/admin/competitions')
      router.refresh()
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const field = (label: string, key: keyof typeof form, type = 'text', extra?: React.InputHTMLAttributes<HTMLInputElement>) => (
    <div>
      <label style={{ display: 'block', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#5c524a', marginBottom: '0.5rem' }}>
        {label}
      </label>
      <input
        type={type}
        className="iv-input"
        value={form[key] as string}
        onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
        {...extra}
      />
    </div>
  )

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Link href="/admin/competitions" style={{ color: '#9a8878', textDecoration: 'none', fontSize: '0.875rem' }}>
          ← Back
        </Link>
        <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2rem', fontWeight: 600, color: '#1c1a18' }}>
          New Competition
        </h1>
      </div>

      <form onSubmit={handleSubmit} style={{ maxWidth: '700px' }}>
        <div style={{ backgroundColor: 'white', border: '1px solid #e8d8cc', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.25rem', fontWeight: 600, color: '#1c1a18' }}>Details</h2>
          {field('Title *', 'title', 'text', { required: true, placeholder: 'e.g. Rolex Submariner' })}
          {field('Subtitle', 'subtitle', 'text', { placeholder: 'Short tagline' })}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#5c524a', marginBottom: '0.5rem' }}>
              Description *
            </label>
            <textarea
              className="iv-input"
              rows={5}
              required
              placeholder="Full competition description..."
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              style={{ resize: 'vertical' }}
            />
          </div>
        </div>

        <div style={{ backgroundColor: 'white', border: '1px solid #e8d8cc', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.25rem', fontWeight: 600, color: '#1c1a18' }}>Pricing & Tickets</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem' }}>
            {field('Prize Value (£) *', 'prizeValue', 'number', { required: true, min: '0', step: '0.01', placeholder: '5000' })}
            {field('Ticket Price (£) *', 'ticketPrice', 'number', { required: true, min: '0.01', step: '0.01', placeholder: '2.99' })}
            {field('Max Tickets *', 'maxTickets', 'number', { required: true, min: '1', placeholder: '1000' })}
          </div>
        </div>

        <div style={{ backgroundColor: 'white', border: '1px solid #e8d8cc', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.25rem', fontWeight: 600, color: '#1c1a18' }}>Settings</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            {field('Draw Date', 'drawDate', 'datetime-local')}
            {field('Sort Order', 'sortOrder', 'number', { min: '0' })}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#5c524a', marginBottom: '0.5rem' }}>
                Status
              </label>
              <select
                className="iv-input"
                value={form.status}
                onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#5c524a', marginBottom: '0.5rem' }}>
                Featured
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', height: '48px' }}>
                <input
                  type="checkbox"
                  id="featured"
                  checked={form.featured}
                  onChange={e => setForm(p => ({ ...p, featured: e.target.checked }))}
                  style={{ width: '16px', height: '16px', accentColor: '#b76e79' }}
                />
                <label htmlFor="featured" style={{ fontSize: '0.875rem', color: '#5c524a' }}>Show as featured</label>
              </div>
            </div>
          </div>
          {field('Images (JSON array of URLs)', 'images', 'text', { placeholder: '["https://example.com/image.jpg"]' })}
        </div>

        {error && (
          <div style={{ padding: '0.75rem 1rem', backgroundColor: 'rgba(183,110,121,0.08)', border: '1px solid rgba(183,110,121,0.2)', color: '#8a4f58', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button type="submit" className="btn-primary" disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Creating...' : 'Create Competition'}
          </button>
          <Link href="/admin/competitions" className="btn-outline">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
