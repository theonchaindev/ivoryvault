import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { listGames, createGame, countSold, countWon, type GameKind } from '@/lib/instantGames'

export const dynamic = 'force-dynamic'

function fail(e: unknown) {
  const msg = e instanceof Error ? e.message : 'Error'
  if (msg === 'Unauthorized') return NextResponse.json({ error: msg }, { status: 401 })
  if (msg === 'Forbidden') return NextResponse.json({ error: msg }, { status: 403 })
  console.error('[admin/instant-win]', e)
  return NextResponse.json({ error: 'Server error' }, { status: 500 })
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()
    const kindParam = new URL(request.url).searchParams.get('kind')
    const kind: GameKind | undefined = kindParam === 'instant' ? 'instant' : kindParam === 'ticket' ? 'ticket' : undefined
    const games = await listGames(kind)
    const withStats = await Promise.all(games.map(async g => ({
      id: g.id, slug: g.slug, name: g.name, kind: g.kind, published: g.published, priceP: g.priceP, poolSize: g.poolSize,
      image: g.image, endsAt: g.endsAt, winners: Object.keys(g.winners).length,
      sold: await countSold(g.id), won: await countWon(g.id),
    })))
    return NextResponse.json({ games: withStats })
  } catch (e) { return fail(e) }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
    const b = await request.json() as { name?: string; kind?: GameKind }
    const kind: GameKind = b.kind === 'instant' ? 'instant' : 'ticket'
    const game = await createGame(b.name || 'New Instant Win', kind)
    return NextResponse.json({ ok: true, id: game.id, slug: game.slug })
  } catch (e) { return fail(e) }
}
