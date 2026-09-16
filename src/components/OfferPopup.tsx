'use client'

import { useEffect, useState } from 'react'

export interface OfferPopupData {
  id: string
  percentOff: number
  scope: 'site' | 'comp'
  targetTitle: string
}

/**
 * Homepage promo popup for an active "% off" offer. Shows once per browser
 * session (dismissed state keyed by offer id, so a new offer shows again).
 */
export default function OfferPopup({ offer }: { offer: OfferPopupData | null }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!offer) return
    let dismissed = false
    try { dismissed = sessionStorage.getItem(`ivv-offer-${offer.id}`) === '1' } catch { /* ignore */ }
    if (!dismissed) {
      const t = setTimeout(() => setOpen(true), 700)
      return () => clearTimeout(t)
    }
  }, [offer])

  const close = () => {
    setOpen(false)
    try { if (offer) sessionStorage.setItem(`ivv-offer-${offer.id}`, '1') } catch { /* ignore */ }
  }

  if (!offer || !open) return null
  const where = offer.scope === 'site' ? 'everything' : offer.targetTitle || 'selected competitions'

  return (
    <div role="dialog" aria-modal="true" onClick={close}
      style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.25rem', background: 'rgba(15,20,30,.55)', backdropFilter: 'blur(3px)', animation: 'ivvOfferFade .25s ease' }}>
      <div onClick={e => e.stopPropagation()}
        style={{ position: 'relative', width: '100%', maxWidth: '420px', background: 'var(--card,#fff)', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,.35)', animation: 'ivvOfferPop .32s cubic-bezier(.2,.9,.3,1.2)' }}>
        <button onClick={close} aria-label="Close" style={{ position: 'absolute', top: '.75rem', right: '.85rem', border: 'none', background: 'rgba(255,255,255,.85)', color: '#1b2432', width: '30px', height: '30px', borderRadius: '999px', cursor: 'pointer', fontSize: '1rem', lineHeight: 1, zIndex: 2 }}>✕</button>

        <div style={{ background: 'linear-gradient(150deg,#2563eb,#1d4ed8)', color: '#fff', padding: '2.4rem 1.75rem 2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '.66rem', fontWeight: 800, letterSpacing: '.22em', textTransform: 'uppercase', opacity: .85 }}>Limited time</div>
          <div style={{ fontFamily: 'var(--font-cormorant,serif)', fontWeight: 700, fontSize: '4rem', lineHeight: 1, margin: '.4rem 0 .1rem' }}>{offer.percentOff}%</div>
          <div style={{ fontSize: '1.35rem', fontFamily: 'var(--font-cormorant,serif)', fontWeight: 600, letterSpacing: '.02em' }}>OFF</div>
        </div>

        <div style={{ padding: '1.5rem 1.75rem 1.9rem', textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: '1rem', color: 'var(--ink,#1b2432)', fontWeight: 600 }}>Save {offer.percentOff}% on {where}</p>
          <p style={{ margin: '.5rem 0 1.3rem', fontSize: '.85rem', color: 'var(--ink3,#7c8698)' }}>Don’t miss out — grab your entries while the offer’s live.</p>
          <a href="/competitions" onClick={close}
            style={{ display: 'inline-block', background: 'var(--gold,#2563eb)', color: '#fff', textDecoration: 'none', fontWeight: 800, fontSize: '.85rem', letterSpacing: '.04em', textTransform: 'uppercase', padding: '.9rem 2rem', borderRadius: '11px' }}>
            Shop competitions
          </a>
        </div>
      </div>

      <style>{`
        @keyframes ivvOfferFade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes ivvOfferPop { from { opacity: 0; transform: translateY(14px) scale(.96) } to { opacity: 1; transform: none } }
      `}</style>
    </div>
  )
}
