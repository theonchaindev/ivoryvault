import InstantWinIndex from '../instant-win/InstantWinIndex'

export const dynamic = 'force-dynamic'

export default function AdminInstantPage() {
  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2rem', fontWeight: 600, color: 'var(--ink)' }}>Instant Wins</h1>
        <p style={{ color: 'var(--ink3)', fontSize: '0.875rem', marginTop: '0.25rem', maxWidth: '640px' }}>
          Create and manage instant-win games. Each game has its own prizes (pick the winning ticket numbers),
          ticket price, pool, image and countdown, and stays hidden until you switch it on. Click a game to manage it.
        </p>
      </div>
      <InstantWinIndex kind="instant" label="instant win" />
    </div>
  )
}
