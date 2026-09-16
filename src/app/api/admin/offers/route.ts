import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { listOffers, createOffer, type OfferKind, type OfferScope, type TargetType } from '@/lib/offers'
import { listGames } from '@/lib/instantGames'

export const dynamic = 'force-dynamic'

function fail(e: unknown) {
  const msg = e instanceof Error ? e.message : 'Error'
  if (msg === 'Unauthorized') return NextResponse.json({ error: msg }, { status: 401 })
  if (msg === 'Forbidden') return NextResponse.json({ error: msg }, { status: 403 })
  console.error('[admin/offers]', e)
  return NextResponse.json({ error: 'Server error' }, { status: 500 })
}

export async function GET() {
  try {
    await requireAdmin()
    const [offers, comps, games] = await Promise.all([
      listOffers(),
      prisma.competition.findMany({ where: { status: 'active' }, select: { id: true, title: true }, orderBy: { title: 'asc' } }),
      listGames(),
    ])
    return NextResponse.json({
      offers,
      comps: {
        raffle: comps.map(c => ({ id: c.id, title: c.title })),
        game: games.map(g => ({ id: g.id, title: g.name, kind: g.kind })),
      },
    })
  } catch (e) { return fail(e) }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
    const b = await request.json() as {
      kind?: OfferKind; scope?: OfferScope; targetType?: TargetType; targetId?: string; targetTitle?: string
      buyQty?: number; freeQty?: number; percentOff?: number; active?: boolean
    }
    const kind: OfferKind = b.kind === 'percent' ? 'percent' : 'bundle'
    const scope: OfferScope = b.scope === 'site' ? 'site' : 'comp'
    if (scope === 'comp' && !b.targetId) return NextResponse.json({ error: 'Pick a competition or choose site-wide.' }, { status: 400 })
    if (kind === 'bundle' && (!b.buyQty || !b.freeQty)) return NextResponse.json({ error: 'Enter how many to buy and how many are free.' }, { status: 400 })
    if (kind === 'percent' && !b.percentOff) return NextResponse.json({ error: 'Enter a discount percentage.' }, { status: 400 })
    const offer = await createOffer({
      kind, scope,
      targetType: b.targetType, targetId: b.targetId, targetTitle: b.targetTitle,
      buyQty: b.buyQty, freeQty: b.freeQty, percentOff: b.percentOff,
      active: b.active !== false,
    })
    return NextResponse.json({ ok: true, offer })
  } catch (e) { return fail(e) }
}
