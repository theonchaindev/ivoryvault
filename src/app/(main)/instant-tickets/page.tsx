import { notFound } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getConfig, countUnrevealed, aggregatePrizes } from '@/lib/ticketGame'
import InstantTicketsClient from './InstantTicketsClient'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Instant Win Tickets — Ivory Vault',
  description: 'Reveal instant-win tickets — every ticket could be a prize or site credit.',
}

export default async function InstantTicketsPage() {
  const [cfg, session] = await Promise.all([getConfig(), getSession()])
  const isAdmin = session?.role === 'admin'

  // Hidden from the site until published — admins can still preview it.
  if (!cfg.published && !isAdmin) notFound()

  let pending = 0
  let creditAvailable = 0
  if (session) {
    pending = await countUnrevealed(session.userId)
    const u = await prisma.user.findUnique({ where: { id: session.userId }, select: { siteCredit: true } })
    creditAvailable = u?.siteCredit ?? 0
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '3rem 1.25rem 5rem' }}>
      {!cfg.published && (
        <div style={{ maxWidth: '900px', margin: '0 auto 1.5rem', background: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d', borderRadius: '10px', padding: '.7rem 1rem', fontSize: '.8rem', fontWeight: 600, textAlign: 'center' }}>
          Admin preview — this game is hidden from members until you switch it on in the admin portal.
        </div>
      )}
      <InstantTicketsClient
        price={cfg.priceP / 100}
        image={cfg.image}
        prizes={aggregatePrizes(cfg.winners)}
        poolSize={cfg.poolSize}
        pending={pending}
        signedIn={!!session}
        creditAvailable={creditAvailable}
      />
    </div>
  )
}
