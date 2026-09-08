import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import InstantWinsPanel from '@/app/admin/instant/InstantWinsPanel'

export const dynamic = 'force-dynamic'

export default async function CompetitionPrizesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const comp = await prisma.competition.findUnique({ where: { id }, select: { id: true, title: true, type: true } })

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link href="/admin/instant" style={{ color: 'var(--ink3)', fontSize: '.8rem', textDecoration: 'none' }}>← Instant Wins</Link>
        <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2rem', fontWeight: 600, color: 'var(--ink)', marginTop: '.5rem' }}>
          Prizes won{comp ? ` — ${comp.title}` : ''}
        </h1>
        <p style={{ color: 'var(--ink3)', fontSize: '0.875rem', marginTop: '0.25rem', maxWidth: '640px' }}>
          Every prize won on this instant-win game, the prize pool, and the option to manually award any remaining prizes.
        </p>
      </div>
      {!comp || comp.type !== 'instant'
        ? <p style={{ color: 'var(--ink3)' }}>This isn&rsquo;t an instant-win competition. <Link href="/admin/instant" style={{ color: 'var(--gold,#2563eb)' }}>Back to Instant Wins</Link></p>
        : <InstantWinsPanel competitions={[{ id: comp.id, title: comp.title }]} initialCompId={comp.id} />}
    </div>
  )
}
