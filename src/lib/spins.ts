import { prisma } from '@/lib/prisma'
import { getTierIndex, TIERS } from '@/lib/tiers'

// Reward for climbing INTO a tier (by index): free instant spins + guaranteed
// site credit. The higher the rank, the bigger the reward.
const TIER_UP_REWARD: Record<number, { spins: number; credit: number }> = {
  1: { spins: 1, credit: 1 },    // Silver
  2: { spins: 2, credit: 5 },    // Gold
  3: { spins: 3, credit: 20 },   // Platinum
}

const fmt = (v: number) => (v >= 1 ? `£${v % 1 === 0 ? v : v.toFixed(2)}` : `${Math.round(v * 100)}p`)

/**
 * Recalculate earned free spins for a user and top up their balance.
 * Idempotent — awards a scaling reward per tier climbed and 1 spin per 50 tickets,
 * tracking how many have already been granted so it never double-credits.
 * Free spins are delivered as unrevealed spins on the active instant competition.
 */
export async function syncEarnedSpins(userId: string) {
  const agg = await prisma.ticket.aggregate({ where: { userId }, _sum: { quantity: true } })
  const totalTickets = agg._sum.quantity ?? 0

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return

  const tierIndex = getTierIndex(totalTickets)        // Bronze 0 → Platinum 3
  const ticketMilestones = Math.floor(totalTickets / 50)

  let spinsToGrant = 0
  let creditToGrant = 0
  const notifs: { title: string; body: string; icon: string }[] = []

  // Rank-up rewards — one payout per tier climbed, scaling with the tier reached.
  if (tierIndex > user.spinsFromTier) {
    for (let t = user.spinsFromTier + 1; t <= tierIndex; t++) {
      const reward = TIER_UP_REWARD[t]
      if (!reward) continue
      spinsToGrant += reward.spins
      creditToGrant += reward.credit
      notifs.push({
        title: `You reached ${TIERS[t].name}!`,
        body: `Congratulations — you've climbed to ${TIERS[t].name}. You've earned ${reward.spins} free spin${reward.spins > 1 ? 's' : ''} plus ${fmt(reward.credit)} site credit. The higher your rank, the bigger the rewards!`,
        icon: 'tier',
      })
    }
  }

  // Every 50 tickets = 1 free spin.
  if (ticketMilestones > user.spinsFromTickets) {
    const gained = ticketMilestones - user.spinsFromTickets
    spinsToGrant += gained
    notifs.push({
      title: `${gained} free spin${gained > 1 ? 's' : ''} earned`,
      body: `You've now entered with ${totalTickets} tickets — that's a free spin for every 50. Head to the wheel!`,
      icon: 'spin',
    })
  }

  if (spinsToGrant <= 0 && creditToGrant <= 0) return

  // Deliver free spins as unrevealed spins on the active instant competition.
  let deliveredAsInstant = false
  if (spinsToGrant > 0) {
    const instantComp = await prisma.competition.findFirst({
      where: { type: 'instant', status: 'active' },
      orderBy: { createdAt: 'asc' },
      select: { id: true },
    })
    if (instantComp) {
      await prisma.instantSpin.createMany({
        data: Array.from({ length: spinsToGrant }, () => ({ userId, competitionId: instantComp.id })),
      })
      deliveredAsInstant = true
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      // If there's no instant comp to host the spins, fall back to the legacy counter so none are lost.
      freeSpins: { increment: deliveredAsInstant ? 0 : spinsToGrant },
      spinsFromTier: tierIndex,
      spinsFromTickets: ticketMilestones,
      ...(creditToGrant > 0 ? { siteCredit: { increment: creditToGrant } } : {}),
    },
  })

  if (notifs.length) {
    await prisma.notification.createMany({ data: notifs.map(n => ({ userId, ...n })) })
  }
}
