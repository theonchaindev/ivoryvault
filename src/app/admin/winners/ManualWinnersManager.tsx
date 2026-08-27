'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { uploadImage } from '@/lib/uploadImage'

interface Comp { id: string; title: string; drawDate: string | null }
interface Winner { id: string; name: string; competitionTitle: string; drawDate: string | null; image: string }

const card: React.CSSProperties = { background: '#fff', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem' }
const input: React.CSSProperties = { width: '100%', padding: '.65rem .8rem', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '.875rem', fontFamily: 'inherit', color: 'var(--ink)' }
const label: React.CSSProperties = { display: 'block', fontSize: '.62rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink2)', marginBottom: '.4rem' }
const btn: React.CSSProperties = { padding: '.7rem 1.4rem', borderRadius: '8px', border: 'none', cursor: 'pointer', background: 'var(--gold)', color: '#fff', fontSize: '.72rem', fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', fontFamily: 'inherit' }

export default function ManualWinnersManager({ winners, competitions }: { winners: Winner[]; competitions: Comp[] }) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState('')
  const [title, setTitle] = useState('')
  const [drawDate, setDrawDate] = useState('') // yyyy-mm-dd
  const [image, setImage] = useState('')
  const [uploading, setUploading] = useState(false)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)

  // Optional helper: picking a competition autofills the title + draw date,
  // which stay fully editable afterwards.
  const autofill = (id: string) => {
    const c = competitions.find(x => x.id === id)
    if (!c) return
    setTitle(c.title)
    setDrawDate(c.drawDate ? c.drawDate.slice(0, 10) : '')
  }

  const upload = async (file: File) => {
    setUploading(true); setErr('')
    try { setImage(await uploadImage(file)) }
    catch (e) { setErr((e as Error).message || 'Upload failed') }
    finally { setUploading(false) }
  }

  const resetForm = () => { setEditingId(null); setName(''); setTitle(''); setDrawDate(''); setImage('') }

  const startEdit = (w: Winner) => {
    setEditingId(w.id); setName(w.name); setTitle(w.competitionTitle)
    setDrawDate(w.drawDate ? w.drawDate.slice(0, 10) : ''); setImage(w.image)
    setMsg(''); setErr('')
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const save = async () => {
    setErr(''); setMsg('')
    if (!name.trim()) { setErr('Enter the winner’s name'); return }
    if (!title.trim()) { setErr('Enter the competition name'); return }
    if (!image) { setErr('Add a winner photo'); return }
    setBusy(true)
    try {
      const res = await fetch('/api/admin/manual-winners', {
        method: editingId ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...(editingId ? { id: editingId } : {}), name, competitionTitle: title, drawDate: drawDate || null, image }),
      })
      const data = await res.json()
      if (!res.ok) { setErr(data.error || 'Failed to save'); return }
      setMsg(editingId ? 'Winner updated.' : 'Winner added — now live on the Winners page.')
      resetForm()
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
              <span style={label}>Competition name</span>
              <input style={input} placeholder="e.g. Win a Coach Handbag!" value={title} onChange={e => setTitle(e.target.value)} />
              {competitions.length > 0 && (
                <select style={{ ...input, marginTop: '.5rem', color: 'var(--ink3)', fontSize: '.78rem' }} value="" onChange={e => { if (e.target.value) autofill(e.target.value) }}>
                  <option value="">Or pick a competition to autofill…</option>
                  {competitions.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <span style={label}>Winner&rsquo;s name</span>
                <input style={input} placeholder="e.g. Jessica" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div>
                <span style={label}>Draw date</span>
                <input type="date" style={input} value={drawDate} onChange={e => setDrawDate(e.target.value)} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <button style={{ ...btn, opacity: busy ? .7 : 1 }} onClick={save} disabled={busy}>{busy ? 'Saving…' : editingId ? 'Update Winner' : 'Add Winner'}</button>
              {editingId && <button onClick={resetForm} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '8px', padding: '.6rem 1rem', fontSize: '.72rem', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', cursor: 'pointer', color: 'var(--ink2)', fontFamily: 'inherit' }}>Cancel</button>}
              {editingId && <span style={{ color: 'var(--gold)', fontSize: '.75rem', fontWeight: 700 }}>Editing existing winner</span>}
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
                <div style={{ marginTop: '.5rem', display: 'flex', gap: '.85rem' }}>
                  <button onClick={() => startEdit(w)} style={{ background: 'none', border: 'none', color: 'var(--gold)', fontSize: '.7rem', fontWeight: 700, cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>Edit</button>
                  <button onClick={() => remove(w.id)} style={{ background: 'none', border: 'none', color: '#c0392b', fontSize: '.7rem', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>Remove</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
