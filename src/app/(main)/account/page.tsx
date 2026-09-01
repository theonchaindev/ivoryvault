import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getTier, getNextTier } from '@/lib/tiers'
import AccountClient from './AccountClient'
import ClearBasketOnSuccess from './ClearBasketOnSuccess'
import { getClaimsForUser } from '@/lib/prizeClaims'
import { getOrCreateReferral, getReferredCount } from '@/lib/referrals'
import { getWinsForUser } from '@/lib/instantGames'

async function getUserTickets(userId: string) {
  try {
    return await prisma.ticket.findMany({
      where: { userId },
      orderBy: { purchasedAt: 'desc' },
      include: {
        competition: {
          select: {
            id: true,
            title: true,
            slug: true,
            status: true,
            prizeValue: true,
            drawDate: true,
          },
        },
      },
    })
  } catch {
    return []
  }
}

export const metadata = {
  title: 'My Account',
}

export default async function AccountPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const tickets = await getUserTickets(session.userId)
  const dbUser = await prisma.user.findUnique({ where: { id: session.userId }, select: { siteCredit: true, freeSpins: true } })

  // Instant-win spins (grouped by competition) — these are entries too
  const spins = await prisma.instantSpin.findMany({
    where: { userId: session.userId },
    include: { competition: { select: { title: true, slug: true } } },
  })
  const spinMap = new Map<string, { slug: string; title: string; total: number; unrevealed: number }>()
  spins.forEach(s => {
    const cur = spinMap.get(s.competition.slug)
    if (cur) { cur.total++; if (!s.revealed) cur.unrevealed++ }
    else spinMap.set(s.competition.slug, { slug: s.competition.slug, title: s.competition.title, total: 1, unrevealed: s.revealed ? 0 : 1 })
  })
  const instantSpins = Array.from(spinMap.values())
  const notifications = await prisma.notification.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: 'desc' },
    take: 30,
  })

  // Competitions this user has won (+ whether they've submitted a claim address)
  const winsRaw = await prisma.winner.findMany({
    where: { userId: session.userId },
    orderBy: { drawnAt: 'desc' },
    include: { competition: { select: { title: true, slug: true } } },
  })
  const claims = await getClaimsForUser(session.userId)
  const referral = await getOrCreateReferral(session.userId, session.name)
  const referredCount = await getReferredCount(session.userId)
  const wins = winsRaw.map(w => ({
    id: w.id,
    competitionTitle: w.competition.title,
    competitionSlug: w.competition.slug,
    prizeTitle: w.prizeTitle ?? null,
    prizeValue: w.prizeValue ?? null,
    drawnAt: w.drawnAt.toISOString(),
    claimed: Boolean(claims[w.id]),
  }))

  // Instant Win ticket-game custom prizes (need a delivery address to claim)
  const ticketWins = (await getWinsForUser(session.userId))
    .filter(w => w.type === 'custom')
    .map(w => ({ playId: w.playId, name: w.name, amount: w.amount, image: w.image, ticketNo: w.ticketNo, claimed: !!w.claim }))

  const totalTickets = tickets.reduce((sum, t) => sum + t.quantity, 0)
  const activeEntries = tickets.filter(t => t.competition.status === 'active').length
  const tier = getTier(totalTickets)
  const nextTier = getNextTier(totalTickets)
  const progressPct = nextTier
    ? Math.min(100, Math.round(((totalTickets - tier.min) / (nextTier.min - tier.min)) * 100))
    : 100

  const ticketData = tickets.map(t => ({
    id: t.id,
    quantity: t.quantity,
    purchasedAt: t.purchasedAt.toISOString(),
    competition: {
      ...t.competition,
      drawDate: t.competition.drawDate?.toISOString() ?? null,
    },
  }))

  return (
    <>
      <ClearBasketOnSuccess />
      <AccountClient
        name={session.name}
        email={session.email}
        siteCredit={dbUser?.siteCredit ?? 0}
        freeSpins={dbUser?.freeSpins ?? 0}
        totalTickets={totalTickets}
        totalEntries={tickets.length}
        activeEntries={activeEntries}
        tier={tier}
        nextTier={nextTier}
        progressPct={progressPct}
        tickets={ticketData}
        instantSpins={instantSpins}
        wins={wins}
        ticketWins={ticketWins}
        referralCode={referral.code}
        referredCount={referredCount}
        notifications={notifications.map(n => ({ id: n.id, title: n.title, body: n.body, icon: n.icon, read: n.read, createdAt: n.createdAt.toISOString() }))}
      />
    </>
  )
}
