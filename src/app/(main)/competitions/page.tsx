import { prisma } from '@/lib/prisma'
import CompetitionsClient from './CompetitionsClient'

async function getCompetitions() {
  try {
    return await prisma.competition.findMany({
      where: { status: 'active' },
      orderBy: [{ featured: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
    })
  } catch {
    return []
  }
}

export const metadata = {
  title: 'Competitions — Ivory Vault',
  description: 'Browse all live luxury prize competitions. Enter for your chance to win watches, cash, and extraordinary prizes.',
}

export default async function CompetitionsPage() {
  const competitions = await getCompetitions()

  const serialized = competitions.map(c => ({
    ...c,
    subtitle: c.subtitle ?? null,
    drawDate: c.drawDate ? c.drawDate.toISOString() : null,
  }))

  return (
    <div style={{ minHeight: 'calc(100vh - 72px)', backgroundColor: '#fdf6ef' }}>
      {/* Header */}
      <div
        style={{
          padding: '4rem 2rem 3rem',
          borderBottom: '1px solid #e8d8cc',
          backgroundColor: '#fffcf9',
        }}
      >
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
            Enter to Win
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
            All Competitions
          </h1>
          <p style={{ fontSize: '1rem', color: '#5c524a', marginTop: '0.75rem', fontFamily: 'var(--font-cormorant)', fontStyle: 'italic' }}>
            {competitions.length} live competition{competitions.length !== 1 ? 's' : ''} available
          </p>
        </div>
      </div>

      <CompetitionsClient competitions={serialized} />
    </div>
  )
}
