'use client'

import { useState } from 'react'
import CompetitionCard from '@/components/CompetitionCard'
import CountdownTimer from '@/components/CountdownTimer'
import { formatCurrency } from '@/lib/utils'

interface Props {
  title: string
  subtitle: string
  description: string
  prizeValue: string
  ticketPrice: string
  maxTickets: string
  drawDate: string
  images: string[]
  type: string
  featured: boolean
}

export default function CompetitionPreview(p: Props) {
  const [tab, setTab] = useState<'listing' | 'detail'>('listing')

  const price = parseFloat(p.ticketPrice) || 0
  const max = parseInt(p.maxTickets) || 100
  const img = p.images[0] || null
  const isoDraw = p.drawDate ? new Date(p.drawDate).toISOString() : null
  const displayTitle = p.title || 'Your competition title'

  const cardComp = {
    id: 'preview', slug: 'preview', title: displayTitle, subtitle: p.subtitle || null,
    prizeValue: parseFloat(p.prizeValue) || 0, ticketPrice: price, maxTickets: max,
    ticketsSold: 0, images: JSON.stringify(p.images),
    drawDate: isoDraw, status: 'active', featured: p.featured,
  }

  return (
    <div className="cprev">
      <div className="cprev-tabs">
        <button type="button" className={`cprev-tab${tab === 'listing' ? ' active' : ''}`} onClick={() => setTab('listing')}>Listing page</button>
        <button type="button" className={`cprev-tab${tab === 'detail' ? ' active' : ''}`} onClick={() => setTab('detail')}>Detail page</button>
      </div>

      <div className="cprev-stage">
        {tab === 'listing' ? (
          <div className="cprev-listing">
            <CompetitionCard competition={cardComp} />
          </div>
        ) : (
          <div className="cprev-detail">
            <div className="cprev-img">
              {img ? <img src={img} alt="" /> : <div className="cprev-img-ph">Hero image</div>}
              {p.type === 'instant' && <span className="cprev-badge">⚡ Spin &amp; Win Instantly</span>}
            </div>

            <h3 className="cprev-title">{displayTitle}</h3>
            {p.subtitle && <p className="cprev-sub">{p.subtitle}</p>}

            <div className="cprev-card">
              <div className="cprev-prog-stats">
                <div><p className="cprev-stat-l">Tickets Sold</p><p className="cprev-stat-v">0</p></div>
                <div style={{ textAlign: 'right' }}><p className="cprev-stat-l">Remaining</p><p className="cprev-stat-v cprev-gold">{max.toLocaleString()}</p></div>
              </div>
              <div className="cprev-track"><div className="cprev-fill" style={{ width: '0%' }} /></div>
              <p className="cprev-pct">0% sold of {max.toLocaleString()} tickets</p>
            </div>

            <div className="cprev-card cprev-price-card">
              <span className="cprev-price">{formatCurrency(price)}</span>
              <span className="cprev-per"> per ticket</span>
            </div>

            {isoDraw && (
              <div className="cprev-card">
                <p className="cprev-stat-l" style={{ marginBottom: '.6rem' }}>Draw closes in</p>
                <CountdownTimer drawDate={isoDraw} />
              </div>
            )}

            {p.description && (
              <div className="cprev-card">
                <p className="cprev-desc-title">About This Prize</p>
                <p className="cprev-desc">{p.description}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        .cprev { position: sticky; top: 1rem; }
        .cprev-tabs { display: flex; gap: .25rem; margin-bottom: .75rem; }
        .cprev-tab { flex: 1; padding: .6rem; border: 1px solid var(--border); background: #fff; border-radius: 8px; cursor: pointer; font-family: inherit; font-size: .72rem; font-weight: 700; letter-spacing: .04em; color: var(--ink3); transition: all .15s; }
        .cprev-tab.active { background: var(--ink); color: #fff; border-color: var(--ink); }
        .cprev-stage { background: var(--bg); border: 1px solid var(--border); border-radius: 12px; padding: 1.25rem; max-height: calc(100vh - 8rem); overflow-y: auto; }

        .cprev-listing { max-width: 300px; margin: 0 auto; pointer-events: none; }

        .cprev-detail { pointer-events: none; }
        .cprev-img { position: relative; aspect-ratio: 1/1; border-radius: var(--r-card); overflow: hidden; background: var(--bg2); margin-bottom: 1rem; }
        .cprev-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .cprev-img-ph { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: var(--ink3); font-size: .8rem; background: linear-gradient(145deg,var(--bg2),var(--border)); }
        .cprev-badge { position: absolute; top: .75rem; left: .75rem; background: var(--gold-pale); border: 1px solid var(--gold); color: var(--gold); font-size: .5rem; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; padding: .3rem .7rem; border-radius: 999px; }
        .cprev-title { font-family: var(--font-cormorant,serif); font-size: 1.5rem; font-weight: 700; color: var(--ink); line-height: 1.05; }
        .cprev-sub { font-family: var(--font-cormorant,serif); font-style: italic; font-size: .95rem; color: var(--ink3); margin-top: .25rem; }
        .cprev-card { background: #fff; border: 1px solid var(--border); border-radius: var(--r-card); padding: 1rem 1.1rem; margin-top: 1rem; }
        .cprev-prog-stats { display: flex; justify-content: space-between; margin-bottom: .75rem; }
        .cprev-stat-l { font-size: .5rem; letter-spacing: .14em; text-transform: uppercase; color: var(--ink3); margin-bottom: .2rem; font-weight: 600; }
        .cprev-stat-v { font-family: var(--font-cormorant,serif); font-size: 1.5rem; font-weight: 600; color: var(--ink); line-height: 1; }
        .cprev-gold { color: var(--gold); }
        .cprev-track { height: 6px; background: var(--track); border-radius: 999px; overflow: hidden; margin-bottom: .4rem; }
        .cprev-fill { height: 100%; background: var(--gold); border-radius: 999px; }
        .cprev-pct { font-size: .7rem; color: var(--ink3); text-align: right; }
        .cprev-price-card { display: flex; align-items: baseline; }
        .cprev-price { font-family: var(--font-cormorant,serif); font-size: 1.75rem; font-weight: 700; color: var(--gold); }
        .cprev-per { font-size: .8rem; color: var(--ink3); }
        .cprev-desc-title { font-size: .6rem; letter-spacing: .12em; text-transform: uppercase; color: var(--ink2); font-weight: 700; margin-bottom: .6rem; }
        .cprev-desc { font-size: .82rem; line-height: 1.7; color: var(--ink2); white-space: pre-wrap; }
      `}</style>
    </div>
  )
}
