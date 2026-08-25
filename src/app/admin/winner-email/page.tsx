import { prisma } from '@/lib/prisma'
import WinnerEmailForm from './WinnerEmailForm'

export const dynamic = 'force-dynamic'

export default async function WinnerEmailPage() {
  const competitions = await prisma.competition.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, title: true, ticketsSold: true },
  })

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2rem', fontWeight: 600, color: 'var(--ink)' }}>
          Send Winner Email
        </h1>
        <p style={{ color: 'var(--ink3)', fontSize: '0.875rem', marginTop: '0.25rem', maxWidth: '620px' }}>
          Pick the competition, choose the winning entry (name &amp; ticket number), confirm the recipient
          email, then send. This sends a one-off congratulations email manually — nothing is automated.
        </p>
      </div>
      <WinnerEmailForm competitions={competitions} />
    </div>
  )
}
