import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import CompetitionDetail from './CompetitionDetail'

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

  const images = (() => { try { return JSON.parse(competition.images) as string[] } catch { return [] } })()

  return (
    <CompetitionDetail competition={{
      id: competition.id,
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
    }} />
  )
}
