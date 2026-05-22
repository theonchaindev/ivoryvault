'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface FormState {
  title: string; subtitle: string; description: string
  prizeValue: string; ticketPrice: string; maxTickets: string
  drawDate: string; status: string; featured: boolean; sortOrder: string
}

export default function NewCompetitionPage() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState<FormState>({
    title: '', subtitle: '', description: '',
    prizeValue: '', ticketPrice: '', maxTickets: '',
    drawDate: '', status: 'draft', featured: false, sortOrder: '0',
  })
  const [images, setImages] = useState<string[]>([])
  const [urlInput, setUrlInput] = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (k: keyof FormState, v: string | boolean) =>
    setForm(p => ({ ...p, [k]: v }))

  /* ── Image helpers ── */
  const addUrl = () => {
    const u = urlInput.trim()
    if (u && !images.includes(u)) setImages(p => [...p, u])
    setUrlInput('')
  }

  const uploadFile = async (file: File) => {
    setUploading(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Upload failed'); return }
      setImages(p => [...p, data.url])
    } catch {
      setError('Upload failed — check your connection')
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (url: string) => setImages(p => p.filter(u => u !== url))
  const moveImage = (i: number, dir: -1 | 1) => {
    const next = [...images]
    ;[next[i], next[i + dir]] = [next[i + dir], next[i]]
    setImages(next)
  }

  /* ── Submit ── */
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      const res = await fetch('/api/admin/competitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, images: JSON.stringify(images) }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to create'); return }
      router.push('/admin/competitions')
      router.refresh()
    } catch {
      setError('Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  /* ── Field helper ── */
  const F = ({ label, k, type = 'text', ...rest }: { label: string; k: keyof FormState; type?: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
    <div>
      <label className="field-label">{label}</label>
      <input type={type} className="iv-input" value={form[k] as string} onChange={e => set(k, e.target.value)} {...rest} />
    </div>
  )

  return (
    <div className="nc-page">
      {/* Header */}
      <div className="nc-header">
        <Link href="/admin/competitions" className="nc-back">← Back</Link>
        <h1 className="nc-title">New Competition</h1>
      </div>

      <form onSubmit={submit} className="nc-form">

        {/* ── DETAILS ── */}
        <section className="nc-card">
          <h2 className="nc-section-title">Details</h2>
          <F label="Title *" k="title" required placeholder="e.g. Rolex Submariner Date" />
          <F label="Subtitle" k="subtitle" placeholder="Short tagline shown on cards" />
          <div>
            <label className="field-label">Description *</label>
            <textarea className="iv-input" rows={5} required placeholder="Full competition description..." value={form.description} onChange={e => set('description', e.target.value)} style={{ resize: 'vertical' }} />
          </div>
        </section>

        {/* ── PRICING ── */}
        <section className="nc-card">
          <h2 className="nc-section-title">Pricing & Tickets</h2>
          <div className="nc-3col">
            <F label="Prize Value (£) *" k="prizeValue" type="number" required min="0" step="0.01" placeholder="9850" />
            <F label="Ticket Price (£) *" k="ticketPrice" type="number" required min="0.01" step="0.01" placeholder="4.99" />
            <F label="Max Tickets *" k="maxTickets" type="number" required min="1" placeholder="5000" />
          </div>
        </section>

        {/* ── IMAGES ── */}
        <section className="nc-card">
          <h2 className="nc-section-title">Images</h2>
          <p className="nc-hint">First image is the hero. Drag to reorder (use arrows below).</p>

          {/* Upload button */}
          <div className="nc-upload-row">
            <button type="button" className="nc-upload-btn" onClick={() => fileRef.current?.click()} disabled={uploading}>
              {uploading ? (
                <span className="nc-spinner" />
              ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2v9M4 5l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              )}
              {uploading ? 'Uploading...' : 'Upload Image'}
            </button>
            <span className="nc-hint">or paste a URL:</span>
            <div className="nc-url-row">
              <input
                type="url"
                className="iv-input"
                placeholder="https://example.com/image.jpg"
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addUrl())}
                style={{ flex: 1 }}
              />
              <button type="button" className="nc-add-url" onClick={addUrl}>Add</button>
            </div>
          </div>

          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(f); e.target.value = '' }} />

          {/* Image previews */}
          {images.length > 0 && (
            <div className="nc-img-grid">
              {images.map((url, i) => (
                <div key={url} className="nc-img-item">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="nc-img-preview" />
                  {i === 0 && <span className="nc-img-badge">Hero</span>}
                  <div className="nc-img-actions">
                    <button type="button" onClick={() => moveImage(i, -1)} disabled={i === 0} title="Move left">‹</button>
                    <button type="button" onClick={() => moveImage(i, 1)} disabled={i === images.length - 1} title="Move right">›</button>
                    <button type="button" onClick={() => removeImage(url)} className="nc-img-remove" title="Remove">✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── SETTINGS ── */}
        <section className="nc-card">
          <h2 className="nc-section-title">Settings</h2>
          <div className="nc-2col">
            <F label="Draw Date" k="drawDate" type="datetime-local" />
            <F label="Sort Order" k="sortOrder" type="number" min="0" />
          </div>
          <div className="nc-2col">
            <div>
              <label className="field-label">Status</label>
              <select className="iv-input" value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="draft">Draft (hidden)</option>
                <option value="active">Active (live)</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
              <label className="field-label">Options</label>
              <label className="nc-check">
                <input type="checkbox" checked={form.featured} onChange={e => set('featured', e.target.checked)} />
                <span>Featured on homepage</span>
              </label>
            </div>
          </div>
        </section>

        {error && <div className="nc-error">{error}</div>}

        <div className="nc-actions">
          <button type="submit" className="btn-dark" disabled={saving} style={{ opacity: saving ? .65 : 1 }}>
            {saving ? 'Creating...' : 'Create Competition'}
          </button>
          <Link href="/admin/competitions" className="btn-ghost">Cancel</Link>
        </div>
      </form>

      <style>{`
        .nc-page { max-width: 780px; }
        .nc-header { display: flex; align-items: center; gap: 1.25rem; margin-bottom: 2rem; }
        .nc-back { font-size: .8125rem; color: var(--ink3,#7a726a); text-decoration: none; transition: color .2s; }
        .nc-back:hover { color: var(--rg,#b8687a); }
        .nc-title { font-family: var(--font-cormorant,serif); font-size: 2rem; font-weight: 400; color: var(--ink,#0c0b0a); }
        .nc-form { display: flex; flex-direction: column; gap: 1.25rem; }
        .nc-card { background: #fff; border: 1px solid var(--border,#e8e2da); padding: 1.75rem; display: flex; flex-direction: column; gap: 1.25rem; }
        .nc-section-title { font-family: var(--font-cormorant,serif); font-size: 1.125rem; font-weight: 500; color: var(--ink,#0c0b0a); padding-bottom: .875rem; border-bottom: 1px solid var(--border,#e8e2da); }
        .field-label { display: block; font-size: .6875rem; font-weight: 500; letter-spacing: .1em; text-transform: uppercase; color: var(--ink2,#3a3530); margin-bottom: .5rem; }
        .nc-hint { font-size: .8125rem; color: var(--ink3,#7a726a); }
        .nc-3col { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; }
        .nc-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        @media (max-width: 600px) { .nc-3col,.nc-2col { grid-template-columns: 1fr; } }

        /* Upload */
        .nc-upload-row { display: flex; flex-direction: column; gap: .75rem; }
        .nc-upload-btn {
          display: inline-flex; align-items: center; gap: .5rem;
          padding: .75rem 1.5rem; background: var(--off,#f7f4f0);
          border: 1px dashed var(--border-strong,#c8b4a0); cursor: pointer;
          font-size: .6875rem; font-weight: 500; letter-spacing: .1em; text-transform: uppercase;
          color: var(--ink2,#3a3530); transition: border-color .2s, background .2s; width: fit-content;
        }
        .nc-upload-btn:hover:not(:disabled) { border-color: var(--rg,#b8687a); background: #fdf0f2; color: var(--rg,#b8687a); }
        .nc-upload-btn:disabled { opacity: .6; cursor: not-allowed; }
        .nc-url-row { display: flex; gap: .625rem; }
        .nc-add-url { padding: 0 1.25rem; background: var(--ink,#0c0b0a); color: #fff; border: none; cursor: pointer; font-size: .625rem; font-weight: 500; letter-spacing: .12em; text-transform: uppercase; white-space: nowrap; transition: background .2s; }
        .nc-add-url:hover { background: #2a2420; }
        .nc-spinner { width: 14px; height: 14px; border: 1.5px solid rgba(0,0,0,.15); border-top-color: var(--ink,#0c0b0a); border-radius: 50%; animation: spin .6s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Image grid */
        .nc-img-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: .75rem; }
        .nc-img-item { position: relative; aspect-ratio: 4/3; border: 1px solid var(--border,#e8e2da); overflow: hidden; }
        .nc-img-preview { width: 100%; height: 100%; object-fit: cover; display: block; }
        .nc-img-badge { position: absolute; top: .375rem; left: .375rem; background: var(--rg,#b8687a); color: #fff; font-size: .5rem; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; padding: .2rem .5rem; }
        .nc-img-actions { position: absolute; bottom: 0; left: 0; right: 0; background: rgba(12,11,10,.7); display: flex; justify-content: center; gap: .25rem; padding: .375rem; opacity: 0; transition: opacity .2s; }
        .nc-img-item:hover .nc-img-actions { opacity: 1; }
        .nc-img-actions button { background: rgba(255,255,255,.15); border: none; color: #fff; width: 26px; height: 26px; cursor: pointer; font-size: .875rem; border-radius: 2px; transition: background .15s; display: flex; align-items: center; justify-content: center; }
        .nc-img-actions button:hover:not(:disabled) { background: rgba(255,255,255,.3); }
        .nc-img-actions button:disabled { opacity: .3; cursor: not-allowed; }
        .nc-img-remove:hover:not(:disabled) { background: rgba(184,104,122,.6) !important; }

        /* Checkbox */
        .nc-check { display: flex; align-items: center; gap: .625rem; cursor: pointer; font-size: .875rem; color: var(--ink2,#3a3530); }
        .nc-check input { width: 15px; height: 15px; accent-color: var(--rg,#b8687a); cursor: pointer; }

        /* Error / actions */
        .nc-error { padding: .875rem 1rem; background: #fdf0f2; border: 1px solid rgba(184,104,122,.25); color: var(--rg-dark,#8a4a56); font-size: .875rem; }
        .nc-actions { display: flex; gap: 1rem; padding-top: .5rem; }
      `}</style>
    </div>
  )
}
