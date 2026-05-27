import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'
import AccountClient from './AccountClient'

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
  title: 'My Account — Ivory Vault',
}

const TIERS = [
  { name: 'Bronze', min: 0, max: 49, color: '#cd7f32', perks: ['Early access to new competitions', 'Member newsletter'] },
  { name: 'Silver', min: 50, max: 199, color: '#a8a9ad', perks: ['All Bronze perks', '5% bonus entries on purchases', 'Priority customer support'] },
  { name: 'Gold', min: 200, max: 499, color: '#c9a84c', perks: ['All Silver perks', '10% bonus entries', 'Exclusive Gold-only competitions', 'Free postal entries'] },
  { name: 'Platinum', min: 500, max: Infinity, color: '#b8687a', perks: ['All Gold perks', '15% bonus entries', 'Dedicated account manager', 'VIP draw events', 'First refusal on limited prizes'] },
]

function getTier(totalTickets: number) {
  return TIERS.find(t => totalTickets >= t.min && totalTickets <= t.max) ?? TIERS[0]
}

function getNextTier(totalTickets: number) {
  const idx = TIERS.findIndex(t => totalTickets >= t.min && totalTickets <= t.max)
  return idx < TIERS.length - 1 ? TIERS[idx + 1] : null
}

export default async function AccountPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const tickets = await getUserTickets(session.userId)

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
    <AccountClient
      name={session.name}
      email={session.email}
      totalTickets={totalTickets}
      totalEntries={tickets.length}
      activeEntries={activeEntries}
      tier={tier}
      nextTier={nextTier}
      progressPct={progressPct}
      tickets={ticketData}
    />
  )
}
