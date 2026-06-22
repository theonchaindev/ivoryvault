import { prisma } from '@/lib/prisma'
import { getTierIndex, TIERS } from '@/lib/tiers'

/**
 * Recalculate earned free spins for a user and top up their balance.
 * Idempotent — awards 1 spin per tier climbed and 1 per 50 tickets,
 * tracking how many have already been granted so it never double-credits.
 */
export async function syncEarnedSpins(userId: string) {
  const agg = await prisma.ticket.aggregate({ where: { userId }, _sum: { quantity: true } })
  const totalTickets = agg._sum.quantity ?? 0

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return

  const tierIndex = getTierIndex(totalTickets)        // Bronze 0 → Platinum 3
  const ticketMilestones = Math.floor(totalTickets / 50)

  let add = 0
  const notifs: { title: string; body: string; icon: string }[] = []

  if (tierIndex > user.spinsFromTier) {
    const gained = tierIndex - user.spinsFromTier
    add += gained
    notifs.push({
      title: `You reached ${TIERS[tierIndex].name}!`,
      body: `Congratulations — you've climbed to ${TIERS[tierIndex].name}. ${gained} free spin${gained > 1 ? 's' : ''} added to your account.`,
      icon: 'tier',
    })
  }

  if (ticketMilestones > user.spinsFromTickets) {
    const gained = ticketMilestones - user.spinsFromTickets
    add += gained
    notifs.push({
      title: `${gained} free spin${gained > 1 ? 's' : ''} earned`,
      body: `You've now entered with ${totalTickets} tickets — that's a free spin for every 50. Head to the wheel!`,
      icon: 'spin',
    })
  }

  if (add > 0) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        freeSpins: { increment: add },
        spinsFromTier: tierIndex,
        spinsFromTickets: ticketMilestones,
      },
    })
    if (notifs.length) {
      await prisma.notification.createMany({
        data: notifs.map(n => ({ userId, ...n })),
      })
    }
  }
}
