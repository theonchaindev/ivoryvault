'use client'

import { useState } from 'react'

export default function ReferAFriend({ code, referredCount }: { code: string; referredCount: number }) {
  const [copied, setCopied] = useState('')
  const link = typeof window !== 'undefined' ? `${window.location.origin}/signup?ref=${code}` : `/signup?ref=${code}`

  const copy = async (text: string, what: string) => {
    try { await navigator.clipboard.writeText(text); setCopied(what); setTimeout(() => setCopied(''), 1800) } catch { /* ignore */ }
  }

  return (
    <div style={{ background: 'linear-gradient(135deg,#1b2432,#0f1622)', border: '1px solid rgba(217,182,74,.4)', borderRadius: '16px', padding: '1.5rem 1.6rem', marginBottom: '1rem', color: '#fff' }}>
      <p style={{ fontSize: '.62rem', fontWeight: 800, letterSpacing: '.16em', textTransform: 'uppercase', color: '#d9b64a', marginBottom: '.4rem' }}>Refer a friend</p>
      <p style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.4rem', fontWeight: 600, lineHeight: 1.25, marginBottom: '.5rem' }}>Give 10% off, get 10% credit</p>
      <p style={{ fontSize: '.85rem', color: 'rgba(255,255,255,.7)', lineHeight: 1.6, marginBottom: '1.1rem' }}>
        Share your code. When a friend uses it, they get <strong style={{ color: '#fff' }}>10% off their first order</strong> and you earn <strong style={{ color: '#fff' }}>10% of it back in site credit</strong>.
      </p>

      <div style={{ display: 'flex', gap: '.6rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '.75rem' }}>
        <span style={{ fontFamily: 'monospace', fontSize: '1.15rem', fontWeight: 800, letterSpacing: '.08em', background: 'rgba(217,182,74,.14)', border: '1px solid rgba(217,182,74,.5)', color: '#f0dfa6', padding: '.55rem 1rem', borderRadius: '10px' }}>{code}</span>
        <button onClick={() => copy(code, 'code')} style={btn}>{copied === 'code' ? 'Copied ✓' : 'Copy code'}</button>
        <button onClick={() => copy(link, 'link')} style={{ ...btn, background: '#d9b64a', color: '#1b2432', border: 'none' }}>{copied === 'link' ? 'Copied ✓' : 'Copy share link'}</button>
      </div>

      <p style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.5)' }}>
        {referredCount > 0 ? `You've referred ${referredCount} friend${referredCount === 1 ? '' : 's'} so far. ` : 'No referrals yet. '}
        Friends enter your code in the basket at checkout.
      </p>
    </div>
  )
}

const btn: React.CSSProperties = { background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,.3)', borderRadius: '10px', padding: '.55rem 1rem', fontSize: '.75rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }
