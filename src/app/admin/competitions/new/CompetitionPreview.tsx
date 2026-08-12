'use client'

import CompetitionCard from '@/components/CompetitionCard'

interface Props {
  title: string
  subtitle: string
  prizeValue: string
  ticketPrice: string
  maxTickets: string
  drawDate: string
  images: string[]
  featured: boolean
}

export default function CompetitionPreview(p: Props) {
  const cardComp = {
    id: 'preview', slug: 'preview', title: p.title || 'Your competition title', subtitle: p.subtitle || null,
    prizeValue: parseFloat(p.prizeValue) || 0, ticketPrice: parseFloat(p.ticketPrice) || 0,
    maxTickets: parseInt(p.maxTickets) || 100, ticketsSold: 0, images: JSON.stringify(p.images),
    drawDate: p.drawDate ? new Date(p.drawDate).toISOString() : null, status: 'active', featured: p.featured,
  }

  return (
    <div className="cprev">
      <p className="cprev-label">Listing preview</p>
      <div className="cprev-stage">
        <div className="cprev-listing">
          <CompetitionCard competition={cardComp} />
        </div>
      </div>

      <style>{`
        .cprev { position: sticky; top: 1rem; }
        .cprev-label { font-size: .68rem; letter-spacing: .1em; text-transform: uppercase; color: var(--ink3); font-weight: 700; margin-bottom: .75rem; }
        .cprev-stage { background: var(--bg); border: 1px solid var(--border); border-radius: 12px; padding: 1.25rem; max-height: calc(100vh - 8rem); overflow-y: auto; }
        .cprev-listing { max-width: 300px; margin: 0 auto; pointer-events: none; }
      `}</style>
    </div>
  )
}
