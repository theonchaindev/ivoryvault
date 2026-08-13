import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { isCompClosed } from '@/lib/compState'
import CompetitionDetail from './CompetitionDetail'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ slug: string }>
}

async function getCompetition(slug: string) {
  try {
    return await prisma.competition.findUnique({ where: { slug } })
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const competition = await getCompetition(slug)
  if (!competition) return { title: 'Not Found — Ivory Vault' }
  return {
    title: `${competition.title} — Ivory Vault`,
    description: competition.description,
  }
}

export default async function CompetitionPage({ params }: PageProps) {
  const { slug } = await params
  const competition = await getCompetition(slug)
  if (!competition) notFound()

  // Once the draw date passes, the detail page is no longer accessible.
  if (isCompClosed(competition)) redirect('/competitions')

  const images = (() => { try { return JSON.parse(competition.images) as string[] } catch { return [] } })()

  const isInstant = competition.type === 'instant'
  let instantSpins = 0
  if (isInstant) {
    const session = await getSession()
    if (session) {
      instantSpins = await prisma.instantSpin.count({
        where: { userId: session.userId, competitionId: competition.id, revealed: false },
      })
    }
  }

  return (
    <CompetitionDetail
      isInstant={isInstant}
      instantSpins={instantSpins}
      competition={{
        id: competition.id,
        slug: competition.slug,
        title: competition.title,
        subtitle: competition.subtitle ?? null,
        description: competition.description,
        prizeValue: competition.prizeValue,
        ticketPrice: competition.ticketPrice,
        maxTickets: competition.maxTickets,
        ticketsSold: competition.ticketsSold,
        status: competition.status,
        drawDate: competition.drawDate ?? null,
        images,
      }}
    />
  )
}
