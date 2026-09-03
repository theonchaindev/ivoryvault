import { prisma } from '@/lib/prisma'
import WinnerEmailForm from './WinnerEmailForm'
import { listGames, countWon } from '@/lib/instantGames'

export const dynamic = 'force-dynamic'

export default async function WinnerEmailPage() {
  const competitions = await prisma.competition.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, title: true, ticketsSold: true },
  })
  const gameRows = await listGames()
  const games = await Promise.all(gameRows.map(async g => ({ id: g.id, title: g.name, kind: g.kind, won: await countWon(g.id) })))

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2rem', fontWeight: 600, color: 'var(--ink)' }}>
          Send Winner Email
        </h1>
        <p style={{ color: 'var(--ink3)', fontSize: '0.875rem', marginTop: '0.25rem', maxWidth: '620px' }}>
          Pick the competition <b>or instant/ticket-win game</b>, choose the winner (name &amp; ticket number),
          confirm the recipient email, then send. This sends a one-off congratulations email manually — nothing is automated.
        </p>
      </div>
      <WinnerEmailForm competitions={competitions} games={games} />
    </div>
  )
}
