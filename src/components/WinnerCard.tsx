import { formatCurrency, formatDate } from '@/lib/utils'

interface WinnerData {
  id: string
  drawnAt: string | Date
  prizeTitle?: string | null
  prizeValue?: number | null
  user: { name: string }
  competition: { title: string; prizeValue: number }
}

export default function WinnerCard({ winner }: { winner: WinnerData }) {
  const parts = winner.user.name.trim().split(' ')
  const name = parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1].charAt(0)}.` : parts[0]
  const prize = winner.prizeTitle || winner.competition.title
  const value = winner.prizeValue ?? winner.competition.prizeValue

  return (
    <div style={{ background: 'white', padding: '2.5rem', position: 'relative', overflow: 'hidden' }}>
      {/* Rose gold top border */}
      <div style={{ position: 'absolute', top: 0, left: '2.5rem', right: '2.5rem', height: '1px', background: 'linear-gradient(90deg, transparent, #b76e79, transparent)' }} />

      {/* Star */}
      <div style={{ marginBottom: '1.5rem' }}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 1.5 L12.2 7.3 L18.4 7.6 L13.8 11.5 L15.4 17.5 L10 14 L4.6 17.5 L6.2 11.5 L1.6 7.6 L7.8 7.3 Z" fill="#b76e79" opacity="0.8" />
        </svg>
      </div>

      <p style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.75rem', fontWeight: 500, color: '#141210', lineHeight: 1.1, marginBottom: '0.375rem' }}>
        {name}
      </p>
      <p style={{ fontSize: '0.8125rem', color: '#4a423c', marginBottom: '2rem', lineHeight: 1.5 }}>{prize}</p>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '1.5rem', borderTop: '1px solid #e2d0c0' }}>
        <div>
          <p style={{ fontSize: '0.5rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#8a7f76', marginBottom: '0.25rem' }}>Prize Value</p>
          <p style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.5rem', fontWeight: 500, lineHeight: 1, background: 'linear-gradient(120deg, #c9848e 0%, #b76e79 50%, #8a4f58 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            {formatCurrency(value)}
          </p>
        </div>
        <p style={{ fontSize: '0.6875rem', color: '#8a7f76' }}>{formatDate(winner.drawnAt)}</p>
      </div>
    </div>
  )
}
