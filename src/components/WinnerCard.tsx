import { formatCurrency, formatDate } from '@/lib/utils'

interface WinnerData {
  id: string
  drawnAt: string | Date
  prizeTitle?: string | null
  prizeValue?: number | null
  user: {
    name: string
  }
  competition: {
    title: string
    prizeValue: number
  }
}

interface WinnerCardProps {
  winner: WinnerData
}

export default function WinnerCard({ winner }: WinnerCardProps) {
  const nameParts = winner.user.name.trim().split(' ')
  const displayName =
    nameParts.length > 1
      ? `${nameParts[0]} ${nameParts[nameParts.length - 1].charAt(0)}.`
      : nameParts[0]

  const prizeTitle = winner.prizeTitle || winner.competition.title
  const prizeValue = winner.prizeValue ?? winner.competition.prizeValue

  return (
    <div
      style={{
        backgroundColor: 'var(--card, #fffcf9)',
        border: '1px solid #e8d8cc',
        padding: '2rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative corner */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '60px',
          height: '60px',
          background: 'linear-gradient(225deg, rgba(183,110,121,0.08) 0%, transparent 70%)',
        }}
      />

      {/* Trophy icon */}
      <div style={{ marginBottom: '1.25rem' }}>
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <path d="M16 2 L20 10 L29 11 L22 18 L24 27 L16 22 L8 27 L10 18 L3 11 L12 10 Z" stroke="#b76e79" strokeWidth="1" fill="none" />
        </svg>
      </div>

      <h3
        style={{
          fontFamily: 'var(--font-cormorant)',
          fontSize: '1.5rem',
          fontWeight: 600,
          color: '#1c1a18',
          marginBottom: '0.25rem',
        }}
      >
        {displayName}
      </h3>

      <p
        style={{
          fontSize: '0.85rem',
          color: '#9a8878',
          marginBottom: '1rem',
        }}
      >
        {prizeTitle}
      </p>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          borderTop: '1px solid #e8d8cc',
          paddingTop: '1rem',
        }}
      >
        <div>
          <p style={{ fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9a8878' }}>
            Prize Value
          </p>
          <p style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.5rem', fontWeight: 600, color: '#b76e79' }}>
            {formatCurrency(prizeValue)}
          </p>
        </div>
        <p style={{ fontSize: '0.75rem', color: '#9a8878' }}>
          {formatDate(winner.drawnAt)}
        </p>
      </div>
    </div>
  )
}
