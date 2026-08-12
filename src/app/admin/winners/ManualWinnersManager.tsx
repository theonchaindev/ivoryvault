'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { uploadImage } from '@/lib/uploadImage'

interface Comp { id: string; title: string; drawDate: string | null }
interface Winner { id: string; name: string; competitionTitle: string; drawDate: string | null; image: string }

const fmtDate = (s: string | null) => s ? new Date(s).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const card: React.CSSProperties = { background: '#fff', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem' }
const input: React.CSSProperties = { width: '100%', padding: '.65rem .8rem', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '.875rem', fontFamily: 'inherit', color: 'var(--ink)' }
const label: React.CSSProperties = { display: 'block', fontSize: '.62rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink2)', marginBottom: '.4rem' }
const btn: React.CSSProperties = { padding: '.7rem 1.4rem', borderRadius: '8px', border: 'none', cursor: 'pointer', background: 'var(--gold)', color: '#fff', fontSize: '.72rem', fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', fontFamily: 'inherit' }

export default function ManualWinnersManager({ winners, competitions }: { winners: Winner[]; competitions: Comp[] }) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState('')
  const [compId, setCompId] = useState('')
  const [image, setImage] = useState('')
  const [uploading, setUploading] = useState(false)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  const selectedComp = competitions.find(c => c.id === compId)

  const upload = async (file: File) => {
    setUploading(true); setErr('')
    try { setImage(await uploadImage(file)) }
    catch (e) { setErr((e as Error).message || 'Upload failed') }
    finally { setUploading(false) }
  }

  const save = async () => {
    setErr(''); setMsg('')
    if (!name.trim()) { setErr('Enter the winner’s name'); return }
    if (!selectedComp) { setErr('Select the competition'); return }
    if (!image) { setErr('Add a winner photo'); return }
    setBusy(true)
    try {
      const res = await fetch('/api/admin/manual-winners', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, competitionTitle: selectedComp.title, drawDate: selectedComp.drawDate, image }),
      })
      const data = await res.json()
      if (!res.ok) { setErr(data.error || 'Failed to save'); return }
      setMsg('Winner added — now live on the Winners page.')
      setName(''); setCompId(''); setImage('')
      router.refresh()
    } catch { setErr('Something went wrong') }
    finally { setBusy(false) }
  }

  const remove = async (id: string) => {
    if (!confirm('Remove this winner from the site?')) return
    await fetch('/api/admin/manual-winners', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    router.refresh()
  }

  return (
    <div style={{ marginTop: '2.5rem' }}>
      <h2 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.5rem', fontWeight: 600, color: 'var(--ink)', marginBottom: '.25rem' }}>Featured Winners</h2>
      <p style={{ color: 'var(--ink3)', fontSize: '.85rem', marginBottom: '1.25rem' }}>Manually add winners that appear on the public Winners page.</p>

      <div style={card}>
        <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: '1.25rem', alignItems: 'start' }}>
          {/* Image */}
          <div>
            <span style={label}>Winner photo</span>
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
              style={{ width: '160px', height: '190px', border: '1.5px dashed var(--border)', borderRadius: '10px', background: image ? 'none' : 'var(--bg2)', cursor: 'pointer', overflow: 'hidden', padding: 0, position: 'relative' }}>
              {image ? <img src={image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ color: 'var(--ink3)', fontSize: '.75rem' }}>{uploading ? 'Uploading…' : '+ Upload photo'}</span>}
            </button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
              onChange={e => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = '' }} />
          </div>

          {/* Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <span style={label}>Competition</span>
              <select style={input} value={compId} onChange={e => setCompId(e.target.value)}>
                <option value="">Select a competition…</option>
                {competitions.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
              {selectedComp && (
                <p style={{ fontSize: '.75rem', color: 'var(--ink3)', marginTop: '.4rem' }}>
                  Pulls through — <b style={{ color: 'var(--ink2)' }}>{selectedComp.title}</b> · Draw date <b style={{ color: 'var(--ink2)' }}>{fmtDate(selectedComp.drawDate)}</b>
                </p>
              )}
            </div>
            <div>
              <span style={label}>Winner&rsquo;s name</span>
              <input style={input} placeholder="e.g. Jessica" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <button style={{ ...btn, opacity: busy ? .7 : 1 }} onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Add Winner'}</button>
              {msg && <span style={{ color: '#15803d', fontSize: '.82rem' }}>{msg}</span>}
              {err && <span style={{ color: '#c0392b', fontSize: '.82rem' }}>{err}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Existing manual winners */}
      {winners.length > 0 && (
        <div style={{ marginTop: '1.25rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '1rem' }}>
          {winners.map(w => (
            <div key={w.id} style={{ ...card, padding: 0, overflow: 'hidden' }}>
              <img src={w.image} alt="" style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', display: 'block' }} />
              <div style={{ padding: '.75rem .875rem' }}>
                <p style={{ fontWeight: 700, color: 'var(--ink)', fontSize: '.85rem' }}>{w.name}</p>
                <p style={{ color: 'var(--ink3)', fontSize: '.72rem', marginTop: '.15rem' }}>{w.competitionTitle}</p>
                <button onClick={() => remove(w.id)} style={{ marginTop: '.5rem', background: 'none', border: 'none', color: '#c0392b', fontSize: '.7rem', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
