import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getGameById, updateGame, setGamePublished, deleteGame, countSold, countWon, listCustomWinsForAdmin, type WinnerDef } from '@/lib/instantGames'
import { listRecentOrders } from '@/lib/cashflowsOrders'
import { igItem } from '@/lib/instantGames'

export const dynamic = 'force-dynamic'

function fail(e: unknown) {
  const msg = e instanceof Error ? e.message : 'Error'
  if (msg === 'Unauthorized') return NextResponse.json({ error: msg }, { status: 401 })
  if (msg === 'Forbidden') return NextResponse.json({ error: msg }, { status: 403 })
  console.error('[admin/instant-win/id]', e)
  return NextResponse.json({ error: 'Server error' }, { status: 500 })
}

async function gameOrders(gameId: string) {
  try {
    const item = igItem(gameId)
    const all = await listRecentOrders(80)
    const mine = all.filter(o => o.items.some(i => i.id === item))
    if (!mine.length) return []
    const userIds = [...new Set(mine.map(o => o.userId))]
    const users = await prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, email: true, name: true } })
    const byUser = new Map(users.map(u => [u.id, u]))
    return mine.map(o => ({ orderNumber: o.orderNumber, status: o.status, amount: o.amount, createdAt: o.createdAt, paidAt: o.paidAt, qty: o.items.filter(i => i.id === item).reduce((s, i) => s + i.qty, 0), email: byUser.get(o.userId)?.email || '', name: byUser.get(o.userId)?.name || '' }))
  } catch (e) { console.error('[admin/instant-win] orders lookup failed:', e); return [] }
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params
    const game = await getGameById(id)
    if (!game) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const [sold, won, customWins, orders] = await Promise.all([countSold(id), countWon(id), listCustomWinsForAdmin(id), gameOrders(id)])
    return NextResponse.json({ game, sold, won, customWins, orders })
  } catch (e) { return fail(e) }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params
    const b = await request.json() as { name?: string; priceP?: number; poolSize?: number; image?: string; endsAt?: string | null; winners?: Record<number, WinnerDef> }
    await updateGame(id, {
      name: b.name, priceP: Number(b.priceP) || 50, poolSize: Number(b.poolSize) || 500,
      image: typeof b.image === 'string' ? b.image : '', endsAt: b.endsAt ?? null,
      winners: (b.winners && typeof b.winners === 'object') ? b.winners : {},
    })
    const game = await getGameById(id)
    return NextResponse.json({ ok: true, game })
  } catch (e) { return fail(e) }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params
    const b = await request.json() as { published?: boolean }
    await setGamePublished(id, !!b.published)
    const game = await getGameById(id)
    return NextResponse.json({ ok: true, game })
  } catch (e) { return fail(e) }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params
    await deleteGame(id)
    return NextResponse.json({ ok: true })
  } catch (e) { return fail(e) }
}
