import { listWinners } from '@/lib/winners'
import WinnersGrid from './WinnersGrid'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Winners',
  description: 'Meet the real Ivory Vault winners. Every draw is recorded and independently verifiable.',
}

export default async function WinnersPage() {
  const winners = await listWinners()
  const serialised = winners.map(w => ({
    id: w.id,
    name: w.name,
    competitionTitle: w.competitionTitle,
    drawDate: w.drawDate ? w.drawDate.toISOString() : null,
    image: w.image,
  }))

  return (
    <>
      {/* Hero */}
      <section className="hero-banner" style={{ paddingBottom: '2.5rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2.5rem 1.5rem 0', textAlign: 'center' }}>
          <span className="hero-banner__badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem' }}>
            <span className="hero-banner__badge-dot" />
            Real people · Real prizes
          </span>
          <h1
            style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: 'clamp(2.4rem, 6vw, 3.6rem)',
              fontWeight: 600,
              color: 'var(--ink)',
              lineHeight: 1.05,
              margin: '1.1rem 0 .75rem',
            }}
          >
            Our Winners
          </h1>
          <p style={{ color: 'var(--ink3)', fontSize: '1.02rem', lineHeight: 1.7, maxWidth: '560px', margin: '0 auto' }}>
            Behind every draw is a real winner. Each result is recorded and independently verifiable —
            here are the people taking home the prizes.
          </p>
        </div>
      </section>

      {/* Grid */}
      <section className="page-section page-section--cream" style={{ padding: '3.5rem 1.5rem 5rem' }}>
        <WinnersGrid winners={serialised} />
      </section>
    </>
  )
}
