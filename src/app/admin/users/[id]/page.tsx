import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { getTier } from '@/lib/tiers'
import UserDetail from './UserDetail'

export const dynamic = 'force-dynamic'

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true, name: true, email: true, role: true, siteCredit: true,
      freeSpins: true, createdAt: true,
      tickets: {
        orderBy: { purchasedAt: 'desc' },
        select: { id: true, quantity: true, stripePaymentId: true, purchasedAt: true,
          competition: { select: { id: true, title: true, ticketPrice: true } } },
      },
      instantSpins: {
        orderBy: { createdAt: 'desc' },
        select: { id: true, revealed: true, prizeAmount: true, prizeType: true, createdAt: true,
          competition: { select: { title: true } } },
      },
      winners: {
        orderBy: { drawnAt: 'desc' },
        select: { id: true, prizeTitle: true, prizeValue: true, drawnAt: true, announced: true,
          competition: { select: { title: true } } },
      },
      notifications: {
        orderBy: { createdAt: 'desc' }, take: 20,
        select: { id: true, title: true, body: true, createdAt: true, read: true },
      },
    },
  })
  if (!user) notFound()

  const comps = await prisma.competition.findMany({
    where: { status: { in: ['active', 'draft', 'coming_soon'] } },
    orderBy: { title: 'asc' },
    select: { id: true, title: true, type: true },
  })

  const totalEntries = user.tickets.reduce((s, t) => s + t.quantity, 0)
  const totalSpent = user.tickets.reduce((s, t) => s + t.competition.ticketPrice * t.quantity, 0)
  const spinsUnrevealed = user.instantSpins.filter(s => !s.revealed).length
  const spinsWon = user.instantSpins.filter(s => s.revealed && s.prizeAmount > 0)
  const wonTotal = spinsWon.reduce((s, x) => s + x.prizeAmount, 0)

  const data = {
    id: user.id, name: user.name, email: user.email, role: user.role,
    siteCredit: user.siteCredit, freeSpins: user.freeSpins, createdAt: user.createdAt.toISOString(),
    tier: getTier(totalEntries).name,
    tickets: user.tickets.map(t => ({
      id: t.id, quantity: t.quantity, stripePaymentId: t.stripePaymentId,
      purchasedAt: t.purchasedAt.toISOString(), title: t.competition.title,
      value: t.competition.ticketPrice * t.quantity,
    })),
    spins: user.instantSpins.slice(0, 30).map(s => ({
      id: s.id, revealed: s.revealed, prizeAmount: s.prizeAmount, prizeType: s.prizeType,
      createdAt: s.createdAt.toISOString(), title: s.competition.title,
    })),
    winners: user.winners.map(w => ({
      id: w.id, prizeTitle: w.prizeTitle, prizeValue: w.prizeValue,
      drawnAt: w.drawnAt.toISOString(), announced: w.announced, title: w.competition.title,
    })),
    notifications: user.notifications.map(n => ({
      id: n.id, title: n.title, body: n.body, read: n.read, createdAt: n.createdAt.toISOString(),
    })),
    stats: { totalEntries, totalSpent, spinsUnrevealed, wonCount: spinsWon.length, wonTotal },
  }

  return <UserDetail user={data} comps={comps} />
}
