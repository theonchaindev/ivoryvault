import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { isCompClosed, isCompUpcoming } from '@/lib/compState'
import { effectiveNow, isCompHidden } from '@/lib/outage'
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
  if (!competition) return { title: 'Not Found' }
  const imgs = (() => { try { return JSON.parse(competition.images) as string[] } catch { return [] } })()
  const desc = (competition.description || '').replace(/\s+/g, ' ').trim().slice(0, 200)
  return {
    title: competition.title,
    description: desc,
    alternates: { canonical: `/competitions/${slug}` },
    openGraph: {
      type: 'website',
      title: competition.title,
      description: desc,
      url: `/competitions/${slug}`,
      ...(imgs[0] ? { images: [{ url: imgs[0], alt: competition.title }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: competition.title,
      description: desc,
      ...(imgs[0] ? { images: [imgs[0]] } : {}),
    },
  }
}

export default async function CompetitionPage({ params }: PageProps) {
  const { slug } = await params
  if (isCompHidden(slug)) notFound()
  const competition = await getCompetition(slug)
  if (!competition) notFound()

  // Once the draw date passes, the detail page is no longer accessible.
  if (isCompClosed(competition, effectiveNow())) redirect('/competitions')

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

  const upcoming = isCompUpcoming(competition, effectiveNow())
  const soldOut = competition.ticketsSold >= competition.maxTickets
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: competition.title,
    description: (competition.description || '').replace(/\s+/g, ' ').trim().slice(0, 300),
    ...(images.length ? { image: images } : {}),
    brand: { '@type': 'Brand', name: 'Ivory Vault' },
    offers: {
      '@type': 'Offer',
      price: competition.ticketPrice.toFixed(2),
      priceCurrency: 'GBP',
      availability: (upcoming || soldOut) ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
      url: `https://www.ivoryvaultcompetitions.co.uk/competitions/${competition.slug}`,
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
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
          upcoming,
          images,
        }}
      />
    </>
  )
}
