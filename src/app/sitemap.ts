import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const SITE_URL = 'https://www.ivoryvaultcompetitions.co.uk'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/competitions`, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${SITE_URL}/winners`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${SITE_URL}/how-it-works`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/free-entry`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/contact`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/terms`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/privacy`, changeFrequency: 'yearly', priority: 0.3 },
  ]

  let comps: { slug: string; updatedAt: Date }[] = []
  try {
    comps = await prisma.competition.findMany({
      where: { status: { in: ['active', 'coming_soon'] } },
      select: { slug: true, updatedAt: true },
    })
  } catch { /* ignore */ }

  const compRoutes: MetadataRoute.Sitemap = comps.map(c => ({
    url: `${SITE_URL}/competitions/${c.slug}`,
    lastModified: c.updatedAt,
    changeFrequency: 'daily',
    priority: 0.8,
  }))

  return [...staticRoutes, ...compRoutes]
}
