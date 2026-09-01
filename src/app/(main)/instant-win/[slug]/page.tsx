import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getGameBySlug, countUnrevealed, aggregatePrizes } from '@/lib/instantGames'
import { finalizeByOrderNumber } from '@/lib/fulfillOrder'
import InstantGameClient from './InstantGameClient'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const game = await getGameBySlug(slug)
  return { title: game ? `${game.name} — Ivory Vault` : 'Instant Win — Ivory Vault', description: 'Reveal instant-win tickets — every ticket could be a prize or site credit.' }
}

export default async function InstantWinPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ order?: string }> }) {
  const { slug } = await params
  const [game, session, sp] = await Promise.all([getGameBySlug(slug), getSession(), searchParams])
  if (!game) notFound()
  const isAdmin = session?.role === 'admin'
  if (!game.published && !isAdmin) notFound()

  if (sp?.order && session) {
    try { await finalizeByOrderNumber(sp.order) } catch { /* webhook is the backstop */ }
  }

  let pending = 0
  let creditAvailable = 0
  if (session) {
    pending = await countUnrevealed(game.id, session.userId)
    const u = await prisma.user.findUnique({ where: { id: session.userId }, select: { siteCredit: true } })
    creditAvailable = u?.siteCredit ?? 0
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '3rem 1.25rem 5rem' }}>
      {!game.published && (
        <div style={{ maxWidth: '900px', margin: '0 auto 1.5rem', background: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d', borderRadius: '10px', padding: '.7rem 1rem', fontSize: '.8rem', fontWeight: 600, textAlign: 'center' }}>
          Admin preview — this game is hidden from members until you switch it on in the admin portal.
        </div>
      )}
      <InstantGameClient
        gameId={game.id}
        title={game.name}
        price={game.priceP / 100}
        image={game.image}
        endsAt={game.endsAt}
        prizes={aggregatePrizes(game.winners)}
        poolSize={game.poolSize}
        pending={pending}
        signedIn={!!session}
        creditAvailable={creditAvailable}
        loginFrom={`/instant-win/${game.slug}`}
      />
    </div>
  )
}
