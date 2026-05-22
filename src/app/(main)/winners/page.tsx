import { prisma } from '@/lib/prisma'
import WinnerCard from '@/components/WinnerCard'
import AnimatedSection from '@/components/AnimatedSection'

export const metadata = {
  title: 'Winners — Ivory Vault',
  description: 'Meet the lucky winners of Ivory Vault luxury prize competitions.',
}

async function getWinners() {
  try {
    return await prisma.winner.findMany({
      where: { announced: true },
      orderBy: { drawnAt: 'desc' },
      include: {
        user: { select: { name: true } },
        competition: { select: { title: true, prizeValue: true } },
      },
    })
  } catch {
    return []
  }
}

export default async function WinnersPage() {
  const winners = await getWinners()

  return (
    <div style={{ backgroundColor: '#fdf6ef', minHeight: 'calc(100vh - 72px)' }}>
      {/* Header */}
      <div style={{ padding: '4rem 2rem 3rem', borderBottom: '1px solid #e8d8cc', backgroundColor: '#fffcf9' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <p
            style={{
              fontSize: '0.75rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#b76e79',
              marginBottom: '0.75rem',
            }}
          >
            Success Stories
          </p>
          <h1
            style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: 600,
              color: '#1c1a18',
              lineHeight: 1.1,
            }}
          >
            Our Winners
          </h1>
          <p
            style={{
              fontSize: '1.1rem',
              color: '#5c524a',
              marginTop: '0.75rem',
              fontFamily: 'var(--font-cormorant)',
              fontStyle: 'italic',
            }}
          >
            Real people. Real prizes. Every draw is transparent and verified.
          </p>
        </div>
      </div>

      {/* Winners grid */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '4rem 2rem 6rem' }}>
        {winners.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {winners.map((winner, i) => (
              <AnimatedSection key={winner.id} delay={i * 0.05}>
                <WinnerCard
                  winner={{
                    ...winner,
                    drawnAt: winner.drawnAt.toISOString(),
                    prizeTitle: winner.prizeTitle ?? null,
                    prizeValue: winner.prizeValue ?? null,
                  }}
                />
              </AnimatedSection>
            ))}
          </div>
        ) : (
          <AnimatedSection>
            <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
              <svg width="60" height="60" viewBox="0 0 60 60" fill="none" style={{ margin: '0 auto 1.5rem', display: 'block', opacity: 0.3 }}>
                <path d="M30 5 L37 20 L54 22 L42 34 L45 51 L30 43 L15 51 L18 34 L6 22 L23 20 Z" stroke="#b76e79" strokeWidth="1.5" fill="none" />
              </svg>
              <p style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.5rem', color: '#9a8878' }}>
                Winners will be announced here
              </p>
              <p style={{ fontSize: '0.85rem', color: '#9a8878', marginTop: '0.5rem' }}>
                Be the first — enter a live competition today.
              </p>
            </div>
          </AnimatedSection>
        )}
      </div>
    </div>
  )
}
