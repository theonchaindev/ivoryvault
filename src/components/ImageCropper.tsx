'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

/**
 * Square image crop modal. Shows the picked file in a 1:1 frame (how the site
 * displays competition images), lets the admin pan + zoom, then returns a
 * cropped square File. "Use original" skips cropping.
 */
export default function ImageCropper({ file, onCancel, onDone }: {
  file: File
  onCancel: () => void
  onDone: (cropped: File) => void
}) {
  const BOX = 340          // on-screen crop frame size (px)
  const OUT = 1000         // exported image resolution (px)
  const wrapRef = useRef<HTMLDivElement>(null)
  const imgElRef = useRef<HTMLImageElement | null>(null)
  const [url, setUrl] = useState('')
  const [nat, setNat] = useState<{ w: number; h: number } | null>(null)
  const [zoom, setZoom] = useState(1)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const drag = useRef<{ sx: number; sy: number; px: number; py: number } | null>(null)

  // Load the file into an <img> to read natural dimensions.
  useEffect(() => {
    const u = URL.createObjectURL(file)
    setUrl(u)
    const img = new Image()
    img.onload = () => { imgElRef.current = img; setNat({ w: img.naturalWidth, h: img.naturalHeight }) }
    img.src = u
    return () => URL.revokeObjectURL(u)
  }, [file])

  const baseScale = nat ? Math.max(BOX / nat.w, BOX / nat.h) : 1
  const dw = nat ? nat.w * baseScale * zoom : BOX
  const dh = nat ? nat.h * baseScale * zoom : BOX

  const clamp = useCallback((x: number, y: number) => ({
    x: Math.min(0, Math.max(BOX - dw, x)),
    y: Math.min(0, Math.max(BOX - dh, y)),
  }), [dw, dh])

  // Center the image whenever it loads or zoom changes (zoom about the centre).
  useEffect(() => {
    if (!nat) return
    setPos(prev => {
      // keep the container centre pinned to the same image point across zoom
      const c = clamp((BOX - dw) / 2, (BOX - dh) / 2)
      return prev.x === 0 && prev.y === 0 ? c : clamp(prev.x, prev.y)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nat, dw, dh])

  const onZoom = (z: number) => {
    if (!nat) { setZoom(z); return }
    const scaleOld = baseScale * zoom
    const scaleNew = baseScale * z
    // image point currently under the container centre
    const cImgX = (BOX / 2 - pos.x) / scaleOld
    const cImgY = (BOX / 2 - pos.y) / scaleOld
    const nx = BOX / 2 - cImgX * scaleNew
    const ny = BOX / 2 - cImgY * scaleNew
    setZoom(z)
    setPos(clamp(nx, ny))
  }

  const onPointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { sx: e.clientX, sy: e.clientY, px: pos.x, py: pos.y }
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return
    const nx = drag.current.px + (e.clientX - drag.current.sx)
    const ny = drag.current.py + (e.clientY - drag.current.sy)
    setPos(clamp(nx, ny))
  }
  const onPointerUp = () => { drag.current = null }

  const exportCrop = () => {
    const img = imgElRef.current
    if (!img || !nat) { onDone(file); return }
    const scale = baseScale * zoom
    const srcSize = BOX / scale
    const srcX = -pos.x / scale
    const srcY = -pos.y / scale
    const canvas = document.createElement('canvas')
    canvas.width = OUT; canvas.height = OUT
    const ctx = canvas.getContext('2d')
    if (!ctx) { onDone(file); return }
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, OUT, OUT)
    ctx.drawImage(img, srcX, srcY, srcSize, srcSize, 0, 0, OUT, OUT)
    canvas.toBlob(blob => {
      if (!blob) { onDone(file); return }
      const name = file.name.replace(/\.[^.]+$/, '') + '-cropped.jpg'
      onDone(new File([blob], name, { type: 'image/jpeg' }))
    }, 'image/jpeg', 0.92)
  }

  return (
    <div className="ic" role="dialog" aria-modal="true" onClick={onCancel}>
      <div className="ic__card" onClick={e => e.stopPropagation()}>
        <h3 className="ic__title">Crop image</h3>
        <p className="ic__sub">Drag to reposition, slide to zoom. This square is exactly how it appears on cards and the competition page.</p>

        <div
          ref={wrapRef}
          className="ic__frame"
          style={{ width: BOX, height: BOX }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="" draggable={false} style={{ position: 'absolute', left: pos.x, top: pos.y, width: dw, height: dh, maxWidth: 'none', userSelect: 'none', pointerEvents: 'none' }} />
          )}
          <div className="ic__grid" />
        </div>

        <div className="ic__zoom">
          <span>−</span>
          <input type="range" min={1} max={3} step={0.01} value={zoom} onChange={e => onZoom(parseFloat(e.target.value))} />
          <span>+</span>
        </div>

        <div className="ic__actions">
          <button type="button" className="ic__btn ic__btn--ghost" onClick={onCancel}>Cancel</button>
          <button type="button" className="ic__btn ic__btn--ghost" onClick={() => onDone(file)}>Use original</button>
          <button type="button" className="ic__btn ic__btn--primary" onClick={exportCrop}>Crop &amp; use</button>
        </div>
      </div>

      <style>{`
        .ic{ position:fixed; inset:0; z-index:2000; display:flex; align-items:center; justify-content:center; padding:1.25rem; background:rgba(15,20,30,.62); backdrop-filter:blur(3px); }
        .ic__card{ background:var(--card,#fff); border-radius:16px; padding:1.5rem; width:100%; max-width:420px; box-shadow:0 30px 70px rgba(0,0,0,.35); }
        .ic__title{ font-family:var(--font-cormorant,serif); font-size:1.4rem; font-weight:700; margin:0 0 .25rem; color:var(--ink,#1b2432); }
        .ic__sub{ font-size:.8rem; color:var(--ink3,#7c8698); margin:0 0 1rem; line-height:1.45; }
        .ic__frame{ position:relative; margin:0 auto; overflow:hidden; border-radius:12px; background:#0f1726; cursor:grab; touch-action:none; border:1px solid var(--border,#e2e7ee); }
        .ic__frame:active{ cursor:grabbing; }
        .ic__grid{ position:absolute; inset:0; pointer-events:none; background-image:linear-gradient(rgba(255,255,255,.25) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.25) 1px,transparent 1px); background-size:33.33% 33.33%; }
        .ic__zoom{ display:flex; align-items:center; gap:.75rem; margin:1rem 0 1.25rem; color:var(--ink3,#7c8698); }
        .ic__zoom input{ flex:1; accent-color:var(--gold,#2563eb); }
        .ic__actions{ display:flex; gap:.6rem; justify-content:flex-end; flex-wrap:wrap; }
        .ic__btn{ border:none; border-radius:9px; padding:.7rem 1.1rem; font-size:.8rem; font-weight:700; cursor:pointer; font-family:inherit; }
        .ic__btn--ghost{ background:transparent; color:var(--ink2,#3a4557); border:1px solid var(--border,#e2e7ee); }
        .ic__btn--primary{ background:var(--gold,#2563eb); color:#fff; }
      `}</style>
    </div>
  )
}
