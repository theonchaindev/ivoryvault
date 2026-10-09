import { prisma } from '@/lib/prisma'
import { listRecentGameWins } from '@/lib/instantGames'

export interface WinNotification {
  id: string
  type: 'draw' | 'instant' | 'spin'
  when: string            // ISO
  name: string
  email: string
  prize: string
  source: string          // competition / game name
}

const money = (v: number) => (v >= 1 ? `£${v % 1 === 0 ? v : v.toFixed(2)}` : `${Math.round(v * 100)}p`)

/** Unified feed of everyone who's won something, newest first. */
export async function getWinNotifications(limit = 150): Promise<WinNotification[]> {
  const [winners, spins, gameWins] = await Promise.all([
    prisma.winner.findMany({
      orderBy: { drawnAt: 'desc' },
      take: limit,
      select: { competitionId: true, drawnAt: true, prizeTitle: true, prizeValue: true, user: { select: { name: true, email: true } }, competition: { select: { title: true } } },
    }).catch(() => []),
    prisma.instantSpin.findMany({
      where: { revealed: true, prizeAmount: { gt: 0 } },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: { id: true, createdAt: true, prizeAmount: true, prizeType: true, user: { select: { name: true, email: true } }, competition: { select: { title: true } } },
    }).catch(() => []),
    listRecentGameWins(limit).catch(() => []),
  ])

  const items: WinNotification[] = []

  for (const w of winners) {
    items.push({
      id: `draw:${w.competitionId}`,
      type: 'draw',
      when: new Date(w.drawnAt).toISOString(),
      name: w.user?.name || '(no name)',
      email: w.user?.email || '',
      prize: w.prizeTitle || w.competition?.title || 'Prize',
      source: w.competition?.title || 'Competition draw',
    })
  }

  for (const s of spins) {
    items.push({
      id: `spin:${s.id}`,
      type: 'spin',
      when: new Date(s.createdAt).toISOString(),
      name: s.user?.name || '(no name)',
      email: s.user?.email || '',
      prize: `${money(s.prizeAmount)} ${s.prizeType === 'cash' ? 'cash' : 'site credit'}`,
      source: s.competition?.title || 'Instant Spin',
    })
  }

  for (const g of gameWins) {
    items.push({
      id: `game:${g.gameId}:${g.userId}:${g.ticketNo}`,
      type: 'instant',
      when: g.createdAt,
      name: g.name,
      email: g.email,
      prize: g.prize,
      source: g.gameName,
    })
  }

  items.sort((a, b) => (a.when < b.when ? 1 : a.when > b.when ? -1 : 0))
  return items.slice(0, limit)
}
