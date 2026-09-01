import { prisma } from '@/lib/prisma'
import InstantWinsPanel from './InstantWinsPanel'
import CreateInstantButton from './CreateInstantButton'

export const dynamic = 'force-dynamic'

export default async function AdminInstantPage() {
  const competitions = await prisma.competition.findMany({
    where: { type: 'instant' },
    orderBy: { createdAt: 'desc' },
    select: { id: true, title: true },
  })

  return (
    <div>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2rem', fontWeight: 600, color: 'var(--ink)' }}>
            Instant Wins
          </h1>
          <p style={{ color: 'var(--ink3)', fontSize: '0.875rem', marginTop: '0.25rem', maxWidth: '640px' }}>
            Create a new instant-win spin game, view the prize pool, see who&rsquo;s won what, and
            manually dish out any remaining prizes to entrants before the game ends.
          </p>
        </div>
        <CreateInstantButton />
      </div>
      {competitions.length === 0
        ? <p style={{ color: 'var(--ink3)' }}>No instant-win competitions found.</p>
        : <InstantWinsPanel competitions={competitions} />}
    </div>
  )
}
