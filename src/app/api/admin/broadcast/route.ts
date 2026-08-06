import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendNewCompetitionEmail, broadcastNewCompetition, type FeaturedComp } from '@/lib/email'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

async function featuredComp(slug?: string): Promise<FeaturedComp | null> {
  const c = await prisma.competition.findFirst({
    where: slug ? { slug } : { status: 'active', type: 'standard' },
    orderBy: { createdAt: 'desc' },
    select: { title: true, images: true, ticketPrice: true, slug: true, prizeValue: true },
  })
  if (!c) return null
  let image: string | null = null
  try { image = JSON.parse(c.images)[0] || null } catch { /* ignore */ }
  return { title: c.title, image, price: c.ticketPrice, slug: c.slug, prizeValue: c.prizeValue }
}

async function recipients(): Promise<string[]> {
  const users = await prisma.user.findMany({ select: { email: true } })
  const set = new Set<string>()
  for (const u of users) {
    const e = (u.email || '').toLowerCase().trim()
    if (!e || e.endsWith('@example.com') || e === 'admin@ivoryvault.com') continue
    set.add(e)
  }
  return [...set]
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin()
    const { mode, email, slug } = await req.json()

    if (mode === 'count') {
      return NextResponse.json({ count: (await recipients()).length })
    }
    if (mode === 'test') {
      if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })
      const comp = await featuredComp(slug)
      await sendNewCompetitionEmail(String(email).trim(), comp)
      return NextResponse.json({ ok: true, sentTo: email, featured: comp?.title || null })
    }
    if (mode === 'send') {
      const comp = await featuredComp(slug)
      const list = await recipients()
      const result = await broadcastNewCompetition(list, comp)
      return NextResponse.json({ ok: true, recipients: list.length, featured: comp?.title || null, ...result })
    }
    return NextResponse.json({ error: 'Unknown mode' }, { status: 400 })
  } catch (err) {
    const e = err as Error
    if (e.message === 'Unauthorized' || e.message === 'Forbidden') {
      return NextResponse.json({ error: e.message }, { status: e.message === 'Unauthorized' ? 401 : 403 })
    }
    console.error('broadcast error:', e)
    return NextResponse.json({ error: e.message || 'Failed' }, { status: 500 })
  }
}
