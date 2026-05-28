'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { uploadImage } from '@/lib/uploadImage'

interface MediaImage { url: string; publicId: string; size: number; createdAt: string }

export default function NewCompetitionPage() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [description, setDescription] = useState('')
  const [prizeValue, setPrizeValue] = useState('')
  const [ticketPrice, setTicketPrice] = useState('')
  const [maxTickets, setMaxTickets] = useState('')
  const [drawDate, setDrawDate] = useState('')
  const [status, setStatus] = useState('active')
  const [featured, setFeatured] = useState(false)
  const [sortOrder, setSortOrder] = useState('0')

  const [images, setImages] = useState<string[]>([])
  const [urlInput, setUrlInput] = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [showLibrary, setShowLibrary] = useState(false)
  const [library, setLibrary] = useState<MediaImage[]>([])
  const [libraryLoading, setLibraryLoading] = useState(false)

  const loadLibrary = useCallback(async () => {
    setLibraryLoading(true)
    try {
      const res = await fetch('/api/admin/media')
      if (res.ok) setLibrary((await res.json()).images ?? [])
    } finally { setLibraryLoading(false) }
  }, [])

  useEffect(() => { if (showLibrary) loadLibrary() }, [showLibrary, loadLibrary])

  const addUrl = () => {
    const u = urlInput.trim()
    if (u && !images.includes(u)) setImages(p => [...p, u])
    setUrlInput('')
  }

  const uploadFile = async (file: File) => {
    setUploading(true); setError('')
    try {
      const url = await uploadImage(file)
      setImages(p => [...p, url])
      if (showLibrary) loadLibrary()
    } catch (err) {
      setError((err as Error).message || 'Upload failed')
    } finally { setUploading(false) }
  }

  const removeImage = (url: string) => setImages(p => p.filter(u => u !== url))
  const moveImage = (i: number, dir: -1 | 1) => {
    const next = [...images];
    [next[i], next[i + dir]] = [next[i + dir], next[i]]
    setImages(next)
  }
  const selectFromLibrary = (url: string) => {
    if (!images.includes(url)) setImages(p => [...p, url])
    setShowLibrary(false)
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      const res = await fetch('/api/admin/competitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, subtitle, description, prizeValue, ticketPrice, maxTickets, drawDate, status, featured, sortOrder, images: JSON.stringify(images) }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to create'); return }
      router.push('/admin/competitions'); router.refresh()
    } catch { setError('Something went wrong') } finally { setSaving(false) }
  }

  return (
    <div className="nc-page">
      <div className="nc-header">
        <Link href="/admin/competitions" className="nc-back">← Back</Link>
        <h1 className="nc-title">New Competition</h1>
      </div>

      <form onSubmit={submit} className="nc-form">

        <section className="nc-card">
          <h2 className="nc-section-title">Details</h2>
          <div>
            <label className="field-label">Title *</label>
            <input className="iv-input" required placeholder="e.g. Rolex Submariner Date" value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="field-label">Subtitle</label>
            <input className="iv-input" placeholder="Short tagline shown on cards" value={subtitle} onChange={e => setSubtitle(e.target.value)} />
          </div>
          <div>
            <label className="field-label">Description *</label>
            <textarea className="iv-input" rows={5} required placeholder="Full competition description..." value={description} onChange={e => setDescription(e.target.value)} style={{ resize: 'vertical' }} />
          </div>
        </section>

        <section className="nc-card">
          <h2 className="nc-section-title">Pricing & Tickets</h2>
          <div className="nc-3col">
            <div>
              <label className="field-label">Prize Value (£) *</label>
              <input type="number" className="iv-input" required min="0" step="0.01" placeholder="9850" value={prizeValue} onChange={e => setPrizeValue(e.target.value)} />
            </div>
            <div>
              <label className="field-label">Ticket Price (£) *</label>
              <input type="number" className="iv-input" required min="0.01" step="0.01" placeholder="4.99" value={ticketPrice} onChange={e => setTicketPrice(e.target.value)} />
            </div>
            <div>
              <label className="field-label">Max Tickets *</label>
              <input type="number" className="iv-input" required min="1" placeholder="5000" value={maxTickets} onChange={e => setMaxTickets(e.target.value)} />
            </div>
          </div>
        </section>

        <section className="nc-card">
          <h2 className="nc-section-title">Images</h2>
          <p className="nc-hint">First image is the hero. Use arrows to reorder.</p>

          <div className="nc-upload-row">
            <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
              <button type="button" className="nc-upload-btn" onClick={() => fileRef.current?.click()} disabled={uploading}>
                {uploading ? <span className="nc-spinner" /> : <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M8 2v9M4 5l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>}
                {uploading ? 'Uploading...' : 'Upload from device'}
              </button>
              <button type="button" className="nc-upload-btn nc-library-btn" onClick={() => setShowLibrary(s => !s)}>
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4"/><rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4"/><rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4"/><rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4"/></svg>
                {showLibrary ? 'Hide library' : 'Media library'}
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.625rem' }}>
              <span className="nc-hint">or paste URL:</span>
              <div className="nc-url-row" style={{ flex: 1 }}>
                <input type="url" className="iv-input" placeholder="https://example.com/image.jpg" value={urlInput} onChange={e => setUrlInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addUrl())} style={{ flex: 1 }} />
                <button type="button" className="nc-add-url" onClick={addUrl}>Add</button>
              </div>
            </div>
          </div>

          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(f); e.target.value = '' }} />

          {showLibrary && (
            <div className="nc-library">
              <div className="nc-library__head">
                <p className="nc-library__title">Media Library</p>
                <button type="button" className="nc-library__refresh" onClick={loadLibrary}>↻ Refresh</button>
              </div>
              {libraryLoading ? (
                <div style={{ padding: '2rem', textAlign: 'center' }}><span className="nc-spinner" style={{ margin: '0 auto', display: 'block', width: 20, height: 20 }} /></div>
              ) : library.length === 0 ? (
                <p className="nc-library__empty">No images uploaded yet.</p>
              ) : (
                <div className="nc-library__grid">
                  {library.map(img => (
                    <button key={img.publicId} type="button" className={`nc-library__item${images.includes(img.url) ? ' selected' : ''}`} onClick={() => selectFromLibrary(img.url)}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.url} alt="" className="nc-library__img" />
                      {images.includes(img.url) && <span className="nc-library__check">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {images.length > 0 && (
            <div className="nc-img-grid">
              {images.map((url, i) => (
                <div key={url} className="nc-img-item">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="nc-img-preview" />
                  {i === 0 && <span className="nc-img-badge">Hero</span>}
                  <div className="nc-img-actions">
                    <button type="button" onClick={() => moveImage(i, -1)} disabled={i === 0}>‹</button>
                    <button type="button" onClick={() => moveImage(i, 1)} disabled={i === images.length - 1}>›</button>
                    <button type="button" onClick={() => removeImage(url)} className="nc-img-remove">✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="nc-card">
          <h2 className="nc-section-title">Settings</h2>
          <div className="nc-2col">
            <div>
              <label className="field-label">Draw Date</label>
              <input type="datetime-local" className="iv-input" value={drawDate} onChange={e => setDrawDate(e.target.value)} />
            </div>
            <div>
              <label className="field-label">Sort Order</label>
              <input type="number" className="iv-input" min="0" value={sortOrder} onChange={e => setSortOrder(e.target.value)} />
            </div>
          </div>
          <div className="nc-2col">
            <div>
              <label className="field-label">Status</label>
              <select className="iv-input" value={status} onChange={e => setStatus(e.target.value)}>
                <option value="active">Active — live on site</option>
                <option value="draft">Draft — hidden from site</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
              <label className="field-label">Options</label>
              <label className="nc-check">
                <input type="checkbox" checked={featured} onChange={e => setFeatured(e.target.checked)} />
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
        .nc-page { max-width: 820px; }
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
        .nc-upload-row { display: flex; flex-direction: column; gap: .875rem; }
        .nc-upload-btn { display: inline-flex; align-items: center; gap: .5rem; padding: .75rem 1.25rem; background: var(--off,#f7f4f0); border: 1px dashed var(--border,#e8e2da); cursor: pointer; font-size: .6875rem; font-weight: 500; letter-spacing: .1em; text-transform: uppercase; color: var(--ink2,#3a3530); transition: border-color .2s, background .2s, color .2s; }
        .nc-upload-btn:hover:not(:disabled) { border-color: var(--rg,#b8687a); background: #fdf0f2; color: var(--rg,#b8687a); }
        .nc-upload-btn:disabled { opacity: .6; cursor: not-allowed; }
        .nc-library-btn { border-style: solid; }
        .nc-url-row { display: flex; gap: .625rem; }
        .nc-add-url { padding: 0 1.25rem; background: var(--ink,#0c0b0a); color: #fff; border: none; cursor: pointer; font-size: .625rem; font-weight: 500; letter-spacing: .12em; text-transform: uppercase; white-space: nowrap; transition: background .2s; }
        .nc-add-url:hover { background: #2a2420; }
        .nc-spinner { width: 14px; height: 14px; border: 1.5px solid rgba(0,0,0,.15); border-top-color: var(--ink,#0c0b0a); border-radius: 50%; animation: spin .6s linear infinite; display: inline-block; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .nc-library { border: 1px solid var(--border,#e8e2da); background: var(--off,#f7f4f0); padding: 1.25rem; }
        .nc-library__head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
        .nc-library__title { font-size: .75rem; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; color: var(--ink2,#3a3530); }
        .nc-library__refresh { font-size: .6875rem; color: var(--rg,#b8687a); background: none; border: none; cursor: pointer; text-decoration: underline; }
        .nc-library__empty { font-size: .875rem; color: var(--ink3,#7a726a); text-align: center; padding: 2rem 0; }
        .nc-library__grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(100px,1fr)); gap: .5rem; max-height: 320px; overflow-y: auto; }
        .nc-library__item { position: relative; aspect-ratio: 1; overflow: hidden; border: 2px solid transparent; cursor: pointer; padding: 0; background: none; transition: border-color .15s; }
        .nc-library__item:hover, .nc-library__item.selected { border-color: var(--rg,#b8687a); }
        .nc-library__img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .nc-library__check { position: absolute; top: .25rem; right: .25rem; width: 18px; height: 18px; background: var(--rg,#b8687a); color: #fff; border-radius: 50%; font-size: .6rem; display: flex; align-items: center; justify-content: center; }
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
        .nc-check { display: flex; align-items: center; gap: .625rem; cursor: pointer; font-size: .875rem; color: var(--ink2,#3a3530); }
        .nc-check input { width: 15px; height: 15px; accent-color: var(--rg,#b8687a); cursor: pointer; }
        .nc-error { padding: .875rem 1rem; background: #fdf0f2; border: 1px solid rgba(184,104,122,.25); color: #8a4a56; font-size: .875rem; }
        .nc-actions { display: flex; gap: 1rem; padding-top: .5rem; }
      `}</style>
    </div>
  )
}
