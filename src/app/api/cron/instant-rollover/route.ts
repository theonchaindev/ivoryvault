import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { effectiveNow } from '@/lib/outage'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

// Swap the Instant Cash Spin competition's image to the September artwork at the
// turn of the month. The name is intentionally left unchanged. Runs nightly and
// only acts once we've crossed into September (idempotent thereafter), so exact
// cron timing / a late deploy can't cause it to be missed or fire early.
const SLUG = 'instant-cash-spin'
const NEW_IMAGE = '/instant-win-september.png'
// UK midnight, 1 September 2026. The UK is on BST (UTC+1) in September, so
// 00:00 BST on 1 Sep === 23:00 UTC on 31 Aug.
const SWITCH_AT = Date.UTC(2026, 7, 31, 23, 0, 0)

export async function GET(req: NextRequest) {
  // Auth: Vercel cron (bearer secret) or a logged-in admin (for manual runs)
  const auth = req.headers.get('authorization')
  const isCron = !!process.env.CRON_SECRET && auth === `Bearer ${process.env.CRON_SECRET}`
  let isAdmin = false
  try { const s = await getSession(); isAdmin = s?.role === 'admin' } catch { /* ignore */ }
  if (!isCron && !isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const force = req.nextUrl.searchParams.get('force') === '1' && isAdmin
  const now = effectiveNow()
  if (now < SWITCH_AT && !force) {
    return NextResponse.json({ ok: true, applied: false, reason: 'not-yet', now: new Date(now).toISOString(), switchAt: new Date(SWITCH_AT).toISOString() })
  }

  const comp = await prisma.competition.findUnique({ where: { slug: SLUG }, select: { id: true, images: true } })
  if (!comp) return NextResponse.json({ ok: false, applied: false, reason: 'comp-not-found', slug: SLUG }, { status: 404 })

  let current: string[] = []
  try { current = JSON.parse(comp.images) } catch { /* ignore */ }
  if (current[0] === NEW_IMAGE) {
    return NextResponse.json({ ok: true, applied: false, reason: 'already-set' })
  }

  await prisma.competition.update({ where: { id: comp.id }, data: { images: JSON.stringify([NEW_IMAGE]) } })
  return NextResponse.json({ ok: true, applied: true, slug: SLUG, image: NEW_IMAGE, previous: current })
}
