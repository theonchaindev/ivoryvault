import { prisma } from '@/lib/prisma'
import { syncEarnedSpins } from '@/lib/spins'
import { sendPurchaseConfirmation } from '@/lib/email'
import { createPlays as createGamePlays, gameIdFromItem, getGameBySlug, IG_ITEM_PREFIX } from '@/lib/instantGames'

/** Legacy sentinel — pre-multi-game ticket-game orders. Maps to the migrated game. */
export const TICKET_GAME_ITEM = '__ticketgame__'

/** Record a single competition purchase: create ticket/spins, bump count, auto-draw if sold out. */
export async function recordPurchase(userId: string, competitionId: string, qty: number, paymentRef: string) {
  if (!userId || !competitionId || !qty) return

  // Instant Win game: mint N unrevealed plays for that game (isolated from competitions)
  if (competitionId.startsWith(IG_ITEM_PREFIX)) {
    const gid = gameIdFromItem(competitionId)
    if (gid) await createGamePlays(gid, userId, qty)
    return
  }
  // Legacy ticket-game order → the migrated game.
  if (competitionId === TICKET_GAME_ITEM) {
    const g = await getGameBySlug('instant-tickets')
    if (g) await createGamePlays(g.id, userId, qty)
    return
  }

  // Instant-win competition: create N unrevealed spins instead of a raffle ticket
  const comp = await prisma.competition.findUnique({ where: { id: competitionId }, select: { type: true } })
  if (comp?.type === 'instant') {
    await prisma.instantSpin.createMany({
      data: Array.from({ length: qty }, () => ({ userId, competitionId })),
    })
    await prisma.competition.update({ where: { id: competitionId }, data: { ticketsSold: { increment: qty } } })
    return
  }

  await prisma.ticket.create({
    data: { userId, competitionId, quantity: qty, stripePaymentId: paymentRef },
  })

  // Award any free spins earned from new ticket total (tier-up / every 50 tickets)
  await syncEarnedSpins(userId)

  const competition = await prisma.competition.update({
    where: { id: competitionId },
    data: { ticketsSold: { increment: qty } },
  })

  // Auto-draw if sold out
  if (competition.ticketsSold >= competition.maxTickets && competition.status === 'active') {
    const tickets = await prisma.ticket.findMany({ where: { competitionId } })
    const pool: Array<{ userId: string; ticketIndex: number }> = []
    tickets.forEach(t => {
      for (let i = 0; i < t.quantity; i++) pool.push({ userId: t.userId, ticketIndex: pool.length + 1 })
    })
    if (pool.length > 0) {
      const winnerEntry = pool[Math.floor(Math.random() * pool.length)]
      await prisma.competition.update({ where: { id: competitionId }, data: { status: 'completed' } })
      const existingWinner = await prisma.winner.findUnique({ where: { competitionId } })
      if (!existingWinner) {
        await prisma.winner.create({
          data: {
            competitionId,
            userId: winnerEntry.userId,
            ticketNumber: winnerEntry.ticketIndex,
            announced: false,
            prizeTitle: competition.title,
            prizeValue: competition.prizeValue,
          },
        })
      }
    }
  }
}

/** Send one order-confirmation email for a set of purchased items. Best-effort. */
export async function sendOrderConfirmation(userId: string, items: { id: string; qty: number }[], totalPence: number | null | undefined) {
  if (!userId || items.length === 0) return
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, name: true } })
  if (!user?.email) return
  const comps = await prisma.competition.findMany({
    where: { id: { in: items.map(i => i.id) } },
    select: { id: true, title: true, ticketPrice: true },
  })
  const byId = new Map(comps.map(c => [c.id, c]))
  const lines = items.map(i => ({ title: (i.id.startsWith(IG_ITEM_PREFIX) || i.id === TICKET_GAME_ITEM) ? 'Instant Win Tickets' : (byId.get(i.id)?.title || 'Competition entry'), qty: i.qty }))
  const total = totalPence != null
    ? totalPence / 100
    : items.reduce((s, i) => s + (byId.get(i.id)?.ticketPrice || 0) * i.qty, 0)
  await sendPurchaseConfirmation(user.email, user.name, lines, total)
}
