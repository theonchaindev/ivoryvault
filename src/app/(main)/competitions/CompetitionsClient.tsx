'use client'

import { useState } from 'react'
import CompetitionCard from '@/components/CompetitionCard'

interface Competition {
  id: string
  slug: string
  title: string
  subtitle?: string | null
  prizeValue: number
  ticketPrice: number
  maxTickets: number
  ticketsSold: number
  images: string
  drawDate?: string | null
  status: string
  featured: boolean
}

const categories = [
  { id: 'all', label: 'All' },
  { id: 'watches', label: 'Watches & Jewellery' },
  { id: 'cash', label: 'Cash' },
  { id: 'electronics', label: 'Electronics' },
  { id: 'experience', label: 'Experiences' },
]

interface Props {
  competitions: Competition[]
}

export default function CompetitionsClient({ competitions }: Props) {
  const [activeCategory, setActiveCategory] = useState('all')

  // Simple category matching by title keyword (could be improved with a category field)
  const filtered = competitions.filter(c => {
    if (activeCategory === 'all') return true
    const lower = (c.title + ' ' + (c.subtitle || '')).toLowerCase()
    if (activeCategory === 'watches') return lower.includes('watch') || lower.includes('jewel') || lower.includes('ring') || lower.includes('gold')
    if (activeCategory === 'cash') return lower.includes('cash') || lower.includes('£') || lower.includes('money')
    if (activeCategory === 'electronics') return lower.includes('macbook') || lower.includes('iphone') || lower.includes('tech') || lower.includes('electronic')
    if (activeCategory === 'experience') return lower.includes('travel') || lower.includes('holiday') || lower.includes('trip') || lower.includes('experience')
    return true
  })

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 2rem 6rem' }}>
      {/* Filter tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0',
          marginBottom: '2.5rem',
          borderBottom: '1px solid #e8d8cc',
          overflowX: 'auto',
        }}
      >
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            style={{
              padding: '0.875rem 1.5rem',
              fontSize: '0.75rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              fontWeight: 500,
              background: 'none',
              border: 'none',
              borderBottom: activeCategory === cat.id ? '2px solid #b76e79' : '2px solid transparent',
              color: activeCategory === cat.id ? '#b76e79' : '#9a8878',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {filtered.map((comp, i) => (
            <CompetitionCard key={comp.id} competition={comp} index={i} />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <p style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.5rem', color: '#9a8878' }}>
            No competitions in this category yet
          </p>
          <button
            onClick={() => setActiveCategory('all')}
            className="btn-outline"
            style={{ marginTop: '1.5rem' }}
          >
            View All Competitions
          </button>
        </div>
      )}
    </div>
  )
}
